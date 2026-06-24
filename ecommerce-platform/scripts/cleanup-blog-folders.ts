/**
 * Clean up the Blogs/ folder structure:
 *   - Delete empty folders
 *   - Remove duplicate articles (keep the one with more/larger images)
 *   - Rename article folders to URL-friendly slugs based on the markdown title
 *   - Normalize the first markdown heading to H1
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOGS_DIR = path.resolve(__dirname, "../Blogs");

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");
}

async function getFolderSize(dir: string): Promise<number> {
  let total = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await getFolderSize(fullPath);
    } else if (entry.isFile()) {
      const stat = await fs.stat(fullPath);
      total += stat.size;
    }
  }
  return total;
}

async function getMarkdownFile(dir: string): Promise<string | null> {
  const entries = await fs.readdir(dir);
  const md = entries.find(f => f.endsWith(".md"));
  return md ? path.join(dir, md) : null;
}

async function countImages(dir: string): Promise<number> {
  let count = 0;
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
    recursive: true,
  });
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) {
        count++;
      }
    }
  }
  return count;
}

async function removeDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function main() {
  const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });
  const folders = entries
    .filter(e => e.isDirectory() && !e.name.startsWith("."))
    .map(e => path.join(BLOGS_DIR, e.name));

  const slugMap = new Map<string, string>(); // slug -> current folder path
  const toDelete: string[] = [];

  for (const folder of folders) {
    const folderName = path.basename(folder);
    const size = await getFolderSize(folder);
    const imageCount = await countImages(folder);
    const mdFile = await getMarkdownFile(folder);

    // Delete empty folders
    if (size === 0 || !mdFile) {
      if (size === 0) {
        console.log(`🗑️  Empty folder removed: ${folderName}`);
      } else {
        console.log(`🗑️  No markdown found, removed: ${folderName}`);
      }
      await removeDir(folder);
      continue;
    }

    let markdown = await fs.readFile(mdFile, "utf-8");

    // Normalize first heading to H1
    const lines = markdown.split("\n");
    let title = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^#{1,6}\s+(.+)$/);
      if (match) {
        title = match[1].trim();
        if (!line.startsWith("# ")) {
          lines[i] = `# ${title}`;
        }
        break;
      }
    }

    if (!title) {
      title = folderName.replace(/\.md$/, "");
    }

    const newMarkdown = lines.join("\n");
    if (newMarkdown !== markdown) {
      await fs.writeFile(mdFile, newMarkdown, "utf-8");
      console.log(`📝 Normalized heading in: ${folderName}`);
    }

    const slug = slugify(title);
    if (!slug) {
      console.log(`⚠️  Could not generate slug for: ${folderName}`);
      continue;
    }

    const targetFolder = path.join(BLOGS_DIR, slug);

    if (targetFolder === folder) {
      console.log(`✅ Already clean: ${folderName}`);
      slugMap.set(slug, folder);
      continue;
    }

    if (slugMap.has(slug)) {
      // Duplicate title - keep the folder with more images, or larger size
      const existing = slugMap.get(slug)!;
      const existingImages = await countImages(existing);
      const existingSize = await getFolderSize(existing);

      if (
        imageCount > existingImages ||
        (imageCount === existingImages && size > existingSize)
      ) {
        console.log(
          `🔁 Replacing duplicate: ${path.basename(existing)} → ${slug}`
        );
        await removeDir(existing);
        await fs.rename(folder, targetFolder);
        slugMap.set(slug, targetFolder);
      } else {
        console.log(`🗑️  Removing duplicate: ${folderName}`);
        await removeDir(folder);
      }
    } else {
      console.log(`📁 Renamed: ${folderName} → ${slug}`);
      await fs.rename(folder, targetFolder);
      slugMap.set(slug, targetFolder);
    }
  }

  console.log("\n🎉 Blog folder cleanup complete");
}

main().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
