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
      ];

      let urls = staticPages.map(
        (p) =>
          `  <url>\n    <loc>${origin}${p.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );

      // Dynamic product pages
      if (db) {
        const { products } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const allProducts = await db
          .select({ slug: products.slug, updatedAt: products.updatedAt })
          .from(products)
          .where(eq(products.status, "active"));
        for (const p of allProducts) {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : now;
          urls.push(
            `  <url>\n    <loc>${origin}/product/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
          );
        }

        // Dynamic blog pages
        const { blogPosts } = await import("../../drizzle/schema");
        const allPosts = await db
          .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
          .from(blogPosts)
          .where(eq(blogPosts.status, "published"));
        for (const p of allPosts) {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : now;
          urls.push(
            `  <url>\n    <loc>${origin}/blog/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
          );
        }

        // Category pages
        const { categories } = await import("../../drizzle/schema");
        const allCats = await db.select({ slug: categories.slug }).from(categories);
        for (const c of allCats) {
          urls.push(
            `  <url>\n    <loc>${origin}/products?category=${c.slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
          );
        }
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
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
