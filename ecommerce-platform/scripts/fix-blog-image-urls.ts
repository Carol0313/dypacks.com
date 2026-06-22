/**
 * 修复博客图片 URL（第二版）
 *
 * 问题：数据库中的图片 URL 文件名和 OSS 实际文件名不一致（如下划线缺失）
 * 解决：精确对比文件名，不一致就更新为本地实际文件名
 *
 * 使用方法：
 *   npx tsx scripts/fix-blog-image-urls.ts
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "../server/db";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOGS_DIR = path.resolve(__dirname, "../Blogs");
const OSS_PUBLIC_URL = process.env.OSS_PUBLIC_URL ||
  "https://dypacks-images.oss-cn-shanghai.aliyuncs.com";

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
]);

interface BlogImage {
  fileName: string;
  fullPath: string;
}

function isImage(fileName: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function getBaseName(fileName: string): string {
  return path.basename(fileName).replace(/\.[^.]+$/, "").toLowerCase();
}

/**
 * 从 URL 中提取文件名（不含扩展名）
 */
function extractUrlFileName(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const base = path.basename(urlObj.pathname);
    return base.replace(/\.[^.]+$/, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * 根据 URL 文件名查找对应的本地实际文件
 *
 * 匹配策略：
 * 1. 精确匹配（保留下划线）
 * 2. 忽略下划线/空格/连字符的模糊匹配
 * 3. 部分包含匹配
 */
function findActualFile(
  urlFileName: string,
  localImages: BlogImage[]
): { file: BlogImage; exact: boolean } | null {
  const urlBase = urlFileName.toLowerCase();

  // 1. 精确匹配
  const exactMatch = localImages.find(
    img => getBaseName(img.fileName) === urlBase
  );
  if (exactMatch) return { file: exactMatch, exact: true };

  // 2. 忽略下划线/空格/连字符的模糊匹配
  const normalizedUrl = urlBase.replace(/[_\-\s]/g, "");
  const fuzzyMatch = localImages.find(img => {
    const normalizedLocal = getBaseName(img.fileName).replace(/[_\-\s]/g, "");
    return normalizedLocal === normalizedUrl;
  });
  if (fuzzyMatch) return { file: fuzzyMatch, exact: false };

  // 3. 部分包含匹配
  const partialMatch = localImages.find(img => {
    const localBase = getBaseName(img.fileName);
    const normalizedLocal = localBase.replace(/[_\-\s]/g, "");
    return (
      normalizedLocal.includes(normalizedUrl) ||
      normalizedUrl.includes(normalizedLocal)
    );
  });
  if (partialMatch) return { file: partialMatch, exact: false };

  return null;
}

/**
 * 递归读取文件夹内所有图片
 */
async function collectImages(dir: string): Promise<BlogImage[]> {
  const images: BlogImage[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subImages = await collectImages(fullPath);
        images.push(...subImages);
      } else if (isImage(entry.name)) {
        images.push({ fileName: entry.name, fullPath });
      }
    }
  } catch {
    // 文件夹不存在或无法读取
  }
  return images;
}

/**
 * 根据博客标题/slug 找到对应的本地文件夹
 */
async function findBlogFolder(title: string, slug: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });
    const folders = entries
      .filter(e => e.isDirectory())
      .map(e => path.join(BLOGS_DIR, e.name));

    // 优先用 slug 匹配
    const slugMatch = folders.find(f =>
      path.basename(f).toLowerCase().includes(slug.toLowerCase())
    );
    if (slugMatch) return slugMatch;

    // 再用 title 匹配
    const titleMatch = folders.find(f =>
      path.basename(f).toLowerCase().includes(title.toLowerCase().slice(0, 30))
    );
    if (titleMatch) return titleMatch;

    return folders[0] || null;
  } catch {
    return null;
  }
}

/**
 * 修正单个 URL 的文件名
 */
function fixImageUrl(
  url: string,
  localImages: BlogImage[],
  slug: string
): { fixedUrl: string; wasFixed: boolean; note: string } {
  // 只对 OSS URL 处理
  if (!url.includes("aliyuncs.com")) {
    return { fixedUrl: url, wasFixed: false, note: "非 OSS URL" };
  }

  const urlFileName = extractUrlFileName(url);
  if (!urlFileName) {
    return { fixedUrl: url, wasFixed: false, note: "无法解析文件名" };
  }

  const result = findActualFile(urlFileName, localImages);
  if (!result) {
    return { fixedUrl: url, wasFixed: false, note: "未找到匹配图片" };
  }

  const actualFile = result.file;
  const actualBase = getBaseName(actualFile.fileName);

  // 如果精确匹配，无需修改
  if (result.exact && actualBase === urlFileName) {
    return { fixedUrl: url, wasFixed: false, note: "已匹配" };
  }

  // 构造正确的 OSS URL（保留原来的查询参数）
  const urlObj = new URL(url);
  const safeName = actualFile.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  urlObj.pathname = `/blog/${slug}/${safeName}`;

  return {
    fixedUrl: urlObj.toString(),
    wasFixed: true,
    note: `${path.basename(url)} → ${actualFile.fileName}`,
  };
}

/**
 * 修复 content 中的所有图片 URL
 */
function fixContentImages(
  content: string,
  localImages: BlogImage[],
  slug: string
): { newContent: string; fixedCount: number } {
  const lines = content.split("\n");
  let fixedCount = 0;

  const newLines = lines.map(line => {
    const match = line.match(/^\[IMAGE:\s*(.+?)\s*\]$/);
    if (!match) return line;

    const imageUrl = match[1];
    const { fixedUrl, wasFixed, note } = fixImageUrl(imageUrl, localImages, slug);
    if (wasFixed) {
      fixedCount++;
      console.log(`    ✏️  ${note}`);
    }
    return `[IMAGE: ${fixedUrl}]`;
  });

  return { newContent: newLines.join("\n"), fixedCount };
}

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("❌ 数据库连接失败");
    process.exit(1);
  }

  const posts = await db.select().from(blogPosts);
  console.log(`🔍 数据库中共有 ${posts.length} 篇博客\n`);

  let totalFixed = 0;
  let postsWithFixes = 0;

  for (const post of posts) {
    console.log(`📄 处理: ${post.title}`);

    const folder = await findBlogFolder(post.title, post.slug);
    if (!folder) {
      console.log(`  ⚠️  未找到本地文件夹，跳过\n`);
      continue;
    }

    const localImages = await collectImages(folder);
    console.log(`  📁 找到 ${localImages.length} 张本地图片`);

    let postFixedCount = 0;

    // 修复正文图片
    const { newContent, fixedCount } = fixContentImages(
      post.content || "",
      localImages,
      post.slug
    );
    postFixedCount += fixedCount;

    // 修复封面图
    let newCoverImage = post.coverImage;
    if (post.coverImage) {
      const { fixedUrl, wasFixed, note } = fixImageUrl(
        post.coverImage,
        localImages,
        post.slug
      );
      if (wasFixed) {
        newCoverImage = fixedUrl;
        postFixedCount++;
        console.log(`    ✏️  封面图: ${note}`);
      }
    }

    // 如果有修改，更新数据库
    if (postFixedCount > 0) {
      await db
        .update(blogPosts)
        .set({
          content: newContent,
          coverImage: newCoverImage,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, post.id));

      totalFixed += postFixedCount;
      postsWithFixes++;
      console.log(`  ✅ 已修正 ${postFixedCount} 个 URL\n`);
    } else {
      console.log(`  ✓ 无需修正\n`);
    }
  }

  console.log("\n📊 修复结果:");
  console.log(`   涉及博客: ${postsWithFixes} 篇`);
  console.log(`   修正 URL: ${totalFixed} 个`);

  if (totalFixed > 0) {
    console.log("\n💡 请运行 pnpm build && pm2 restart dypacks 使修改生效");
  }
}

main().catch(err => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
