/**
 * 批量导入 Blogs/ 目录下的 Markdown 文章到数据库
 *
 * 使用方法：
 *   npx tsx scripts/import-blogs.ts
 *
 * 说明：
 *   - 读取 Blogs/ 下每个子文件夹中的 .md 文件
 *   - 上传文件夹中的图片到 OSS，路径为 blog/{slug}/{filename}
 *   - 将 Markdown 图片语法转换为项目自定义的 [IMAGE: url] 格式
 *   - 将 Markdown 转换为适合项目渲染器的纯文本格式
 *   - 生成 slug、excerpt、metaTitle、metaDescription、metaKeywords
 *   - 插入 blog_posts 表
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "../server/db";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ossPut, ossEnabled } from "../server/_core/oss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOGS_DIR = path.resolve(__dirname, "../Blogs");
const AUTHOR_ID = Number(process.env.BLOG_AUTHOR_ID) || 1;

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

interface ParsedImage {
  alt: string;
  url: string;
  fullMatch: string;
}

function isImage(fileName: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function guessContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "image/jpeg";
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从 Markdown 图片 URL 中提取原始文件名
 * 支持：
 *   - 本地路径：/home/ubuntu/filename.png
 *   - Manus URL：.../images_xxx_{base64(/home/ubuntu/filename)}.png
 */
function extractSourceFileName(imageUrl: string): string | null {
  try {
    // 1. 直接本地路径
    if (imageUrl.startsWith("/")) {
      const base = path.basename(imageUrl);
      return base.replace(/\.[^.]+$/, "");
    }

    // 2. 尝试从 URL pathname 解析
    const url = new URL(imageUrl);
    const pathname = url.pathname;

    // Manus URL 格式：.../images_xxx_{base64}.png
    // 找最后一个下划线后的 base64 部分
    const match = pathname.match(/_([A-Za-z0-9_-]+)\.[a-zA-Z]+$/);
    if (match) {
      const base64Part = match[1];
      // 补齐 base64 padding
      const padded = base64Part.replace(/-/g, "+").replace(/_/g, "/");
      const padding = (4 - (padded.length % 4)) % 4;
      const base64 = padded + "=".repeat(padding);
      try {
        const decoded = Buffer.from(base64, "base64").toString("utf-8");
        // decoded 可能是 /home/ubuntu/filename 或 filename
        const base = path.basename(decoded);
        return base.replace(/\.[^.]+$/, "");
      } catch {
        // base64 解码失败，回退到 basename
      }
    }

    // 3. 回退：直接用 URL pathname 的 basename
    const base = path.basename(pathname);
    return base.replace(/\.[^.]+$/, "");
  } catch {
    // URL 解析失败，尝试直接取最后一段
    const parts = imageUrl.split("/");
    const last = parts[parts.length - 1];
    return last ? last.replace(/\.[^.]+$/, "") : null;
  }
}

function findLocalImage(
  sourceName: string,
  localImages: BlogImage[]
): BlogImage | null {
  const normalizedSource = sourceName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 优先完全匹配（不含扩展名）
  const exactMatch = localImages.find(img => {
    const base = path.basename(img.fileName).replace(/\.[^.]+$/, "").toLowerCase();
    return base === normalizedSource;
  });
  if (exactMatch) return exactMatch;

  // 部分匹配
  const partialMatch = localImages.find(img => {
    const base = path.basename(img.fileName).replace(/\.[^.]+$/, "").toLowerCase();
    return base.includes(normalizedSource) || normalizedSource.includes(base);
  });
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * 生成 SEO slug
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * 生成 excerpt：取第一个非空、非图片、非标题段落
 */
function generateExcerpt(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("http") &&
      trimmed.length > 40
    ) {
      return trimmed.slice(0, 200);
    }
  }
  return "";
}

/**
 * 生成 meta keywords
 */
function generateKeywords(title: string): string {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "your",
    "you",
    "how",
    "what",
    "why",
    "when",
    "where",
    "who",
    "which",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 8)
    .join(", ");
}

/**
 * Markdown 转项目纯文本格式
 */
function markdownToPlainText(markdown: string): string {
  return (
    markdown
      // 删除 HTML 注释
      .replace(/<!--[\s\S]*?-->/g, "")
      // 转换标题 H1/H2 为大写加换行
      .replace(/^#\s+(.+)$/gm, (_, text) => `\n${text.toUpperCase()}\n`)
      .replace(/^#{2,6}\s+(.+)$/gm, (_, text) => `\n${text}\n`)
      // 删除水平线
      .replace(/^(---|___|\*\*\*)\s*$/gm, "")
      // 加粗/斜体
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // 行内代码
      .replace(/`([^`]+)`/g, "$1")
      // 链接 [text](url) -> text (url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
      // 引用块
      .replace(/^>\s+(.+)$/gm, "$1")
      // 无序列表
      .replace(/^[\*\-]\s+(.+)$/gm, "• $1")
      // 有序列表
      .replace(/^\d+\.\s+(.+)$/gm, "$1.")
      // 删除多余空行（保留段落间距）
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * 解析 Markdown 中的所有图片引用
 */
function extractImages(markdown: string): ParsedImage[] {
  const images: ParsedImage[] = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    images.push({
      alt: match[1].trim(),
      url: match[2].trim(),
      fullMatch: match[0],
    });
  }
  return images;
}

async function getBlogFolders(): Promise<string[]> {
  const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .map(e => path.join(BLOGS_DIR, e.name));
}

async function processBlogFolder(folderPath: string): Promise<{
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}> {
  const folderName = path.basename(folderPath);

  // 读取 .md 文件
  const entries = await fs.readdir(folderPath);
  const mdFile = entries.find(f => f.endsWith(".md"));
  if (!mdFile) {
    throw new Error(`未找到 Markdown 文件: ${folderPath}`);
  }

  const mdPath = path.join(folderPath, mdFile);
  const markdown = await fs.readFile(mdPath, "utf-8");

  // 读取本地图片
  const localImages: BlogImage[] = [];
  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry);
    const stat = await fs.stat(entryPath);
    if (stat.isFile() && isImage(entry)) {
      localImages.push({ fileName: entry, fullPath: entryPath });
    } else if (stat.isDirectory()) {
      // 递归读取子文件夹中的图片
      const subEntries = await fs.readdir(entryPath);
      for (const subEntry of subEntries) {
        const subEntryPath = path.join(entryPath, subEntry);
        const subStat = await fs.stat(subEntryPath);
        if (subStat.isFile() && isImage(subEntry)) {
          localImages.push({ fileName: subEntry, fullPath: subEntryPath });
        }
      }
    }
  }

  // 提取标题
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].trim()
    : folderName.replace(/\.md$/, "");

  const slug = slugify(title);

  // 处理图片
  const images = extractImages(markdown);
  let processedMarkdown = markdown;
  const uploadedUrls: string[] = [];

  for (const img of images) {
    const sourceName = extractSourceFileName(img.url);
    let localImg: BlogImage | null = null;

    if (sourceName) {
      localImg = findLocalImage(sourceName, localImages);
    }

    // 如果找不到匹配，且还有未使用的本地图片，按顺序使用
    if (!localImg && localImages.length > 0) {
      localImg = localImages.find(
        img => !uploadedUrls.includes(img.fullPath)
      ) || localImages[0];
    }

    if (!localImg) {
      console.warn(`  ⚠️ 未找到图片: ${sourceName}，跳过`);
      continue;
    }

    // 上传 OSS
    const ext = path.extname(localImg.fileName);
    const safeName = localImg.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `blog/${slug}/${safeName}`;
    const buffer = await fs.readFile(localImg.fullPath);
    const contentType = guessContentType(localImg.fileName);

    let ossUrl: string;
    try {
      ossUrl = await ossPut(key, buffer, contentType);
      uploadedUrls.push(localImg.fullPath);
      console.log(`  ✅ 上传: ${localImg.fileName} -> ${ossUrl}`);
    } catch (err) {
      console.error(`  ❌ 上传失败: ${localImg.fileName}`, (err as Error).message);
      continue;
    }

    // 替换 Markdown 图片为项目格式
    const replacement = `[IMAGE: ${ossUrl}]\n${img.alt || title}`;
    processedMarkdown = processedMarkdown.replace(img.fullMatch, replacement);

    // 稍微延迟，避免请求过快
    await sleep(100);
  }

  // 转换 Markdown 为纯文本
  let content = markdownToPlainText(processedMarkdown);

  // 替换占位符
  content = content.replace(/\[Your Company Name\/Our Expertise\]/g, "DY Packs");

  // 生成 excerpt
  const excerpt = generateExcerpt(content);

  // 生成 meta
  const metaTitle = `${title} | DY Packs`;
  const metaDescription = excerpt.slice(0, 160);
  const metaKeywords = generateKeywords(title);

  // 封面图用第一张上传的图片
  const coverImage =
    uploadedUrls.length > 0
      ? (() => {
          const firstImg = localImages.find(img =>
            uploadedUrls.includes(img.fullPath)
          );
          if (!firstImg) return "";
          const safeName = firstImg.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
          return `https://dypacks-images.oss-cn-shanghai.aliyuncs.com/blog/${slug}/${safeName}`;
        })()
      : "";

  return {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    metaTitle,
    metaDescription,
    metaKeywords,
  };
}

async function main() {
  if (!ossEnabled) {
    console.error("❌ OSS 未配置，无法上传图片");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("❌ 数据库连接失败");
    process.exit(1);
  }

  const folders = await getBlogFolders();
  console.log(`🔍 发现 ${folders.length} 个博客文件夹\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const folder of folders) {
    const folderName = path.basename(folder);
    console.log(`📄 处理: ${folderName}`);

    try {
      const article = await processBlogFolder(folder);

      // 检查 slug 是否已存在
      const existing = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, article.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️  已存在，跳过: ${article.slug}\n`);
        skipCount++;
        continue;
      }

      const now = new Date();
      await db.insert(blogPosts).values({
        ...article,
        authorId: AUTHOR_ID,
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`  ✅ 发布成功: /blog/${article.slug}\n`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ 失败: ${folderName}`, (err as Error).message, "\n");
      failCount++;
    }
  }

  console.log("\n📊 导入结果:");
  console.log(`   成功: ${successCount}`);
  console.log(`   跳过: ${skipCount}`);
  console.log(`   失败: ${failCount}`);

  if (successCount > 0) {
    console.log("\n💡 提示：导入后需要 pnpm build && pm2 restart dypacks 才能在网站看到");
  }
}

main().catch(err => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
