/**
 * 上传 client/public/ 下的静态图片到阿里云 OSS
 *
 * 使用方法：
 *   npx tsx scripts/upload-local-images-to-oss.ts
 *
 * 前置条件：
 *   .env 中必须配置好 OSS_* 环境变量
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ossPut, ossEnabled } from "../server/_core/oss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../client/public");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
]);

function isImage(fileName: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function guessContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "image/jpeg";
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (isImage(entry.name)) {
      yield fullPath;
    }
  }
}

async function main() {
  if (!ossEnabled) {
    console.error(
      "❌ OSS 未配置。请确保 .env 中设置了 OSS_BUCKET, OSS_ENDPOINT, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_PUBLIC_URL"
    );
    process.exit(1);
  }

  const mappings: { local: string; ossUrl: string }[] = [];

  console.log(`🔍 扫描 ${PUBLIC_DIR} 中的图片...\n`);

  for await (const filePath of walk(PUBLIC_DIR)) {
    const relativePath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
    const key = `static/${relativePath}`;
    const buffer = await fs.readFile(filePath);
    const contentType = guessContentType(filePath);

    try {
      const ossUrl = await ossPut(key, buffer, contentType);
      mappings.push({ local: `/${relativePath}`, ossUrl });
      console.log(`✅ 已上传: ${relativePath}`);
      console.log(`   → ${ossUrl}`);
    } catch (err) {
      console.error(`❌ 上传失败: ${relativePath}`, (err as Error).message);
    }
  }

  console.log("\n📋 图片 URL 映射表：");
  console.log("-".repeat(80));
  for (const { local, ossUrl } of mappings) {
    console.log(`${local} -> ${ossUrl}`);
  }
  console.log("-".repeat(80));
  console.log(`\n🎉 上传完成！共 ${mappings.length} 张图片。`);
  console.log("\n💡 提示：把上面的映射复制到 constants.ts 和 About.tsx 中替换本地路径。");
}

main().catch(err => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
