import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapUrl(
  loc: string,
  priority: string,
  changefreq: string,
  lastmod: string,
  images: { loc: string; caption?: string }[] = []
) {
  const imageTags = images
    .map(
      img =>
        `    <image:image>\n      <image:loc>${img.loc}</image:loc>${
          img.caption
            ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>`
            : ""
        }\n    </image:image>`
    )
    .join("\n");
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${
      imageTags ? "\n" + imageTags : ""
    }\n  </url>`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Dynamic sitemap.xml
  app.get("/api/sitemap.xml", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      const origin = process.env.VITE_APP_URL || `https://${_req.get("host")}`;
      const now = new Date().toISOString().split("T")[0];

      // Static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/products", priority: "0.9", changefreq: "daily" },
        { url: "/blog", priority: "0.8", changefreq: "weekly" },
        { url: "/about", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.7", changefreq: "monthly" },
        { url: "/privacy", priority: "0.3", changefreq: "yearly" },
        { url: "/terms", priority: "0.3", changefreq: "yearly" },
      ];

      let urls = staticPages.map(p =>
        buildSitemapUrl(`${origin}${p.url}`, p.priority, p.changefreq, now)
      );

      // Dynamic product pages
      if (db) {
        const { products } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const allProducts = await db
          .select({
            slug: products.slug,
            updatedAt: products.updatedAt,
            name: products.name,
            images: products.images,
          })
          .from(products)
          .where(eq(products.status, "active"));
        for (const p of allProducts) {
          const lastmod = p.updatedAt
            ? new Date(p.updatedAt).toISOString().split("T")[0]
            : now;
          const productImages: { loc: string; caption?: string }[] = [];
          try {
            const parsed = JSON.parse(p.images || "[]") as string[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              productImages.push({
                loc: parsed[0],
                caption: `${p.name} - Custom Packaging`,
              });
            }
          } catch {
            // ignore invalid JSON
          }
          urls.push(
            buildSitemapUrl(
              `${origin}/product/${p.slug}`,
              "0.8",
              "weekly",
              lastmod,
              productImages
            )
          );
        }

        // Dynamic blog pages
        const { blogPosts } = await import("../../drizzle/schema");
        const allPosts = await db
          .select({
            slug: blogPosts.slug,
            updatedAt: blogPosts.updatedAt,
            title: blogPosts.title,
            coverImage: blogPosts.coverImage,
          })
          .from(blogPosts)
          .where(eq(blogPosts.status, "published"));
        for (const p of allPosts) {
          const lastmod = p.updatedAt
            ? new Date(p.updatedAt).toISOString().split("T")[0]
            : now;
          const postImages: { loc: string; caption?: string }[] = [];
          if (p.coverImage) {
            postImages.push({ loc: p.coverImage, caption: p.title });
          }
          urls.push(
            buildSitemapUrl(
              `${origin}/blog/${p.slug}`,
              "0.7",
              "weekly",
              lastmod,
              postImages
            )
          );
        }

        // Category pages
        const { categories } = await import("../../drizzle/schema");
        const allCats = await db
          .select({ slug: categories.slug })
          .from(categories);
        for (const c of allCats) {
          urls.push(
            buildSitemapUrl(
              `${origin}/products?category=${c.slug}`,
              "0.6",
              "weekly",
              now
            )
          );
        }
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>`;
      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
