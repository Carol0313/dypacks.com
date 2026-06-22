/**
 * One-time script to backfill category images.
 *
 * If your homepage category cards show the default cube placeholder, it means
 * the categories in your database have no `image` value. This script assigns
 * a representative product photo to each default category.
 *
 * Usage:
 *   npx tsx scripts/fix-category-images.ts
 *
 * Environment:
 *   DATABASE_URL must be set in your .env file or environment variables.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { categories } from "../drizzle/schema";

const categoryImageMap: Record<string, string> = {
  "gift-boxes": "/products/product-burgundy-royal-magnetic-gift-box.jpg",
  "cosmetic-packaging": "/products/product-luxury-perfume-gift-box.jpg",
  "jewelry-watch-boxes": "/products/product-rose-gold-necklace-box.jpg",
  "food-beverage-packaging": "/products/product-chocolate-truffle-box.jpg",
  "luxury-corporate-packaging": "/products/product-leather-corporate-box.jpg",
};

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log("🖼️  Backfilling category images...\n");

  for (const [slug, image] of Object.entries(categoryImageMap)) {
    const [existing] = await db
      .select({
        id: categories.id,
        image: categories.image,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!existing) {
      console.log(`  ⏭️  Category not found: ${slug}`);
      continue;
    }

    if (existing.image) {
      console.log(
        `  ⏭️  Already has image: ${existing.name} (${existing.image})`
      );
      continue;
    }

    await db
      .update(categories)
      .set({ image })
      .where(eq(categories.id, existing.id));

    console.log(`  ✅ Updated: ${existing.name} → ${image}`);
  }

  console.log("\n🎉 Done!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
