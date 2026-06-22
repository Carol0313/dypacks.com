/**
 * 图片迁移脚本：将现有图片从旧 CDN 迁移到阿里云 OSS
 *
 * 迁移范围：
 *   1. 数据库中 products 表的 images 字段
 *   2. 数据库中 blog_posts 表的 coverImage 字段
 *   3. 手动替换 client/src/lib/constants.ts 中的 Banner 图片（脚本输出映射表）
 *
 * 使用方法：
 *   npx tsx scripts/migrate-images-to-oss.ts
 *
 * 前置条件：
 *   .env 中必须配置好 OSS_* 环境变量
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { ossPut, ossEnabled } from "../server/_core/oss";
import { products, blogPosts } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const OLD_CDN_DOMAINS = ["files.manuscdn.com"];

interface ImageRecord {
  type: "product" | "blog";
  id: number;
  field: string;
  urls: string[];
}

function isOldCdnUrl(url: string): boolean {
  try {
    const domain = new URL(url).hostname;
    return OLD_CDN_DOMAINS.some(d => domain.includes(d));
  } catch {
    return false;
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0",
      },
    });
    if (!response.ok) {
      console.warn(`  ⚠️ 下载失败 (${response.status}): ${url}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn(`  ⚠️ 下载异常: ${url}`, (err as Error).message);
    return null;
  }
}

function extractFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() || "image";
    // 去掉 query string
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
  } catch {
    return `image-${Date.now()}`;
  }
}

function guessContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return map[ext || ""] || "image/jpeg";
}

async function main() {
  if (!ossEnabled) {
    console.error(
      "❌ OSS 未配置。请确保 .env 中设置了 OSS_BUCKET, OSS_ENDPOINT, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_PUBLIC_URL"
    );
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("❌ 数据库连接失败");
    process.exit(1);
  }

  console.log("🔍 扫描数据库中的旧 CDN 图片...\n");

  const records: ImageRecord[] = [];

  // 扫描产品图片
  const allProducts = await db
    .select({ id: products.id, name: products.name, images: products.images })
    .from(products);
  for (const p of allProducts) {
    if (!p.images) continue;
    try {
      const urls: string[] = JSON.parse(p.images);
      const oldUrls = urls.filter(isOldCdnUrl);
      if (oldUrls.length > 0) {
        records.push({
          type: "product",
          id: p.id,
          field: "images",
          urls: oldUrls,
        });
      }
    } catch {
      // ignore invalid JSON
    }
  }

  // 扫描博客封面图
  const allBlogs = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      coverImage: blogPosts.coverImage,
    })
    .from(blogPosts);
  for (const b of allBlogs) {
    if (b.coverImage && isOldCdnUrl(b.coverImage)) {
      records.push({
        type: "blog",
        id: b.id,
        field: "coverImage",
        urls: [b.coverImage],
      });
    }
  }

  if (records.length === 0) {
    console.log("✅ 数据库中没有发现旧 CDN 图片，无需迁移。");
  } else {
    console.log(`📦 发现 ${records.length} 条记录需要迁移\n`);
  }

  // 迁移统计
  let migratedCount = 0;
  let failedCount = 0;
  const urlMapping = new Map<string, string>(); // oldUrl -> newUrl

  for (const record of records) {
    console.log(
      `🔄 ${record.type === "product" ? "Product" : "Blog"} #${record.id}: ${record.urls.length} image(s)`
    );

    const newUrls: string[] = [];
    for (const oldUrl of record.urls) {
      // 如果已经迁移过，直接复用
      if (urlMapping.has(oldUrl)) {
        newUrls.push(urlMapping.get(oldUrl)!);
        continue;
      }

      const buffer = await downloadImage(oldUrl);
      if (!buffer) {
        failedCount++;
        newUrls.push(oldUrl); // 保持原样
        continue;
      }

      const fileName = extractFileName(oldUrl);
      const contentType = guessContentType(fileName);
      const folder = record.type === "product" ? "products" : "blog";
      const key = `${folder}/migrated-${Date.now()}-${fileName}`;

      try {
        const newUrl = await ossPut(key, buffer, contentType);
        urlMapping.set(oldUrl, newUrl);
        newUrls.push(newUrl);
        migratedCount++;
        console.log(`  ✅ ${oldUrl.substring(0, 60)}...`);
        console.log(`     → ${newUrl}`);
      } catch (err) {
        console.error(`  ❌ 上传失败: ${oldUrl}`, (err as Error).message);
        failedCount++;
        newUrls.push(oldUrl);
      }
    }

    // 更新数据库
    try {
      if (record.type === "product" && record.field === "images") {
        const allOldUrls = record.urls;
        // 需要重新组装完整的 images 数组（包含未变化的 URL）
        const originalUrls: string[] = JSON.parse(
          allProducts.find(p => p.id === record.id)!.images!
        );
        const finalUrls = originalUrls.map(url => urlMapping.get(url) || url);
        await db
          .update(products)
          .set({ images: JSON.stringify(finalUrls) })
          .where(sql`${products.id} = ${record.id}`);
      } else if (record.type === "blog" && record.field === "coverImage") {
        await db
          .update(blogPosts)
          .set({ coverImage: newUrls[0] })
          .where(sql`${blogPosts.id} = ${record.id}`);
      }
    } catch (err) {
      console.error(
        `  ❌ 数据库更新失败 #${record.id}:`,
        (err as Error).message
      );
    }
  }

  // 输出 URL 映射表（供手动替换 constants.ts 使用）
  console.log(`\n📋 图片 URL 映射表（请复制到 client/src/lib/constants.ts）:`);
  console.log(`--------------------------------------------------------`);
  for (const [oldUrl, newUrl] of urlMapping.entries()) {
    console.log(`// OLD: ${oldUrl}`);
    console.log(`// NEW: ${newUrl}`);
    console.log();
  }
  console.log(`--------------------------------------------------------`);

  console.log(`\n🎉 迁移完成！成功: ${migratedCount}, 失败: ${failedCount}`);
  console.log(
    `\n⚠️ 提醒：请手动修改 client/src/lib/constants.ts 中的 Banner 图片 URL！`
  );
  process.exit(0);
}

main();
