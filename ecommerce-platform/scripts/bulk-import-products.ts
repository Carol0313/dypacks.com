/**
 * Bulk Product Import Script for DY Packs
 *
 * Usage:
 *   1. Prepare a JSON file with your products (see products-example.json)
 *   2. Run: npx tsx scripts/bulk-import-products.ts ./my-products.json
 *
 * Environment:
 *   DATABASE_URL must be set in your .env file or environment variables.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { getDb } from "../server/db";
import { products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: string; // e.g. "12.99"
  compareAtPrice?: string;
  categoryId: number;
  images?: string[]; // Array of image URLs
  featured?: boolean;
  status?: "active" | "draft" | "archived";
  stock?: number;
  minOrderQty?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

async function importProducts(filePath: string) {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absolutePath, "utf-8");
  let items: ProductInput[];
  try {
    items = JSON.parse(raw);
  } catch {
    console.error("❌ Invalid JSON file.");
    process.exit(1);
  }

  if (!Array.isArray(items)) {
    console.error("❌ JSON must be an array of products.");
    process.exit(1);
  }

  console.log(`📦 Importing ${items.length} products...\n`);

  // Pre-fetch categories to validate categoryId
  const allCats = await db.select({ id: categories.id, name: categories.name }).from(categories);
  const catMap = new Map(allCats.map((c) => [c.id, c.name]));

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    // Validation
    if (!item.name || !item.slug || !item.price || !item.categoryId) {
      console.warn(`⏭️  Skipped (missing required fields): ${item.name || "[unnamed]"}`);
      skipped++;
      continue;
    }

    if (!catMap.has(item.categoryId)) {
      console.warn(`⏭️  Skipped (invalid categoryId ${item.categoryId}): ${item.name}`);
      skipped++;
      continue;
    }

    // Check duplicate slug
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, item.slug))
      .limit(1);

    if (existing.length > 0) {
      console.warn(`⏭️  Skipped (slug exists): ${item.slug}`);
      skipped++;
      continue;
    }

    const data = {
      name: item.name,
      slug: item.slug,
      description: item.description ?? null,
      shortDescription: item.shortDescription ?? null,
      price: item.price,
      compareAtPrice: item.compareAtPrice ?? null,
      categoryId: item.categoryId,
      images: item.images && item.images.length > 0 ? JSON.stringify(item.images) : null,
      featured: item.featured ?? false,
      status: item.status ?? "draft",
      stock: item.stock ?? 0,
      minOrderQty: item.minOrderQty ?? 1,
      metaTitle: item.metaTitle ?? null,
      metaDescription: item.metaDescription ?? null,
      metaKeywords: item.metaKeywords ?? null,
    };

    try {
      const result = await db.insert(products).values(data);
      console.log(`✅ Created: ${item.name} (ID: ${result[0].insertId})`);
      created++;
    } catch (err) {
      console.error(`❌ Failed to create ${item.name}:`, err);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  process.exit(0);
}

const fileArg = process.argv[2];
if (!fileArg) {
  console.log("Usage: npx tsx scripts/bulk-import-products.ts <path-to-products.json>");
  process.exit(1);
}

importProducts(fileArg);
