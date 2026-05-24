import { eq, and, like, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  categories, InsertCategory,
  products, InsertProduct,
  cartItems, InsertCartItem,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  addresses, InsertAddress,
  blogPosts, InsertBlogPost,
  productReviews, InsertProductReview,
  inquiryItems, InsertInquiryItem,
  inquirySubmissions, InsertInquirySubmission,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Categories ──────────────────────────────────────────

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Products ────────────────────────────────────────────

export async function getProducts(opts: {
  categoryId?: number;
  search?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { categoryId, search, status, featured, page = 1, limit = 12 } = opts;
  const conditions = [];
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (status) conditions.push(eq(products.status, status as any));
  if (featured !== undefined) conditions.push(eq(products.featured, featured));
  if (search) conditions.push(like(products.name, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values(data);
  return result[0].insertId;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function searchSuggestions(query: string, limit: number = 8) {
  const db = await getDb();
  if (!db || !query.trim()) return [];
  const results = await db.select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    price: products.price,
    images: products.images,
    categoryId: products.categoryId,
  }).from(products)
    .where(and(
      eq(products.status, "active" as any),
      like(products.name, `%${query}%`)
    ))
    .limit(limit);
  return results;
}

export async function getProductsByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

// ─── Cart ────────────────────────────────────────────────

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(cartItems).values({ userId, productId, quantity });
  return result[0].insertId;
}

export async function updateCartItem(id: number, userId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}

export async function removeCartItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Addresses ───────────────────────────────────────────

export async function getUserAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
}

export async function createAddress(data: InsertAddress) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, data.userId));
  }
  const result = await db.insert(addresses).values(data);
  return result[0].insertId;
}

export async function updateAddress(id: number, userId: number, data: Partial<InsertAddress>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }
  await db.update(addresses).set(data).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
}

export async function deleteAddress(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
}

// ─── Orders ──────────────────────────────────────────────

export async function createOrder(data: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  const orderId = result[0].insertId;
  if (items.length > 0) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId })));
  }
  return orderId;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders(opts: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { status, page = 1, limit = 20 } = opts;
  const conditions = [];
  if (status) conditions.push(eq(orders.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;
  const [items, countResult] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateOrderStatus(id: number, status: string, paymentStatus?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const data: Record<string, unknown> = { status };
  if (paymentStatus) data.paymentStatus = paymentStatus;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── Blog Posts ──────────────────────────────────────────

export async function getBlogPosts(opts: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { status, page = 1, limit = 10 } = opts;
  const conditions = [];
  if (status) conditions.push(eq(blogPosts.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;
  const [items, countResult] = await Promise.all([
    db.select().from(blogPosts).where(where).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(where),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(blogPosts).values(data);
  return result[0].insertId;
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ─── Product Reviews ────────────────────────────────────

export async function getProductReviews(productId: number, opts: { page?: number; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { page = 1, limit = 10 } = opts;
  const offset = (page - 1) * limit;
  const where = and(eq(productReviews.productId, productId), eq(productReviews.status, "approved"));
  const [items, countResult] = await Promise.all([
    db.select().from(productReviews).where(where).orderBy(desc(productReviews.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productReviews).where(where),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductRatingStats(productId: number) {
  const db = await getDb();
  if (!db) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const where = and(eq(productReviews.productId, productId), eq(productReviews.status, "approved"));
  const [avgResult, distResult] = await Promise.all([
    db.select({
      avg: sql<number>`COALESCE(AVG(rating), 0)`,
      count: sql<number>`count(*)`,
    }).from(productReviews).where(where),
    db.select({
      rating: productReviews.rating,
      count: sql<number>`count(*)`,
    }).from(productReviews).where(where).groupBy(productReviews.rating),
  ]);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of distResult) {
    distribution[row.rating] = Number(row.count);
  }
  return {
    averageRating: Number(Number(avgResult[0]?.avg ?? 0).toFixed(1)),
    totalReviews: Number(avgResult[0]?.count ?? 0),
    distribution,
  };
}

export async function createReview(data: InsertProductReview) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Check if user already reviewed this product
  const existing = await db.select().from(productReviews)
    .where(and(eq(productReviews.productId, data.productId), eq(productReviews.userId, data.userId))).limit(1);
  if (existing.length > 0) throw new Error("You have already reviewed this product");
  const result = await db.insert(productReviews).values(data);
  return result[0].insertId;
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(productReviews).where(eq(productReviews.id, id));
}

export async function updateReviewStatus(id: number, status: "approved" | "pending" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(productReviews).set({ status }).where(eq(productReviews.id, id));
}

export async function getAllReviews(opts: { status?: string; page?: number; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { status, page = 1, limit = 20 } = opts;
  const conditions = [];
  if (status) conditions.push(eq(productReviews.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;
  const [items, countResult] = await Promise.all([
    db.select().from(productReviews).where(where).orderBy(desc(productReviews.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productReviews).where(where),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Product Rating Stats (Batch) ──────────────────────

export async function getBatchProductRatingStats(productIds: number[]) {
  const db = await getDb();
  if (!db || productIds.length === 0) return {};
  const where = and(
    inArray(productReviews.productId, productIds),
    eq(productReviews.status, "approved")
  );
  const results = await db.select({
    productId: productReviews.productId,
    avg: sql<number>`COALESCE(AVG(rating), 0)`,
    count: sql<number>`count(*)`,
  }).from(productReviews).where(where).groupBy(productReviews.productId);
  const map: Record<number, { averageRating: number; totalReviews: number }> = {};
  for (const row of results) {
    map[row.productId] = {
      averageRating: Number(Number(row.avg).toFixed(1)),
      totalReviews: Number(row.count),
    };
  }
  return map;
}

// ─── Inquiry Items ──────────────────────────────────────

export async function getInquiryItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiryItems).where(eq(inquiryItems.userId, userId)).orderBy(desc(inquiryItems.createdAt));
}

export async function addToInquiry(userId: number, productId: number, quantity: number, note?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(inquiryItems)
    .where(and(eq(inquiryItems.userId, userId), eq(inquiryItems.productId, productId))).limit(1);
  if (existing.length > 0) {
    await db.update(inquiryItems).set({ quantity, note: note ?? existing[0].note })
      .where(eq(inquiryItems.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(inquiryItems).values({ userId, productId, quantity, note });
  return result[0].insertId;
}

export async function updateInquiryItem(id: number, userId: number, data: { quantity?: number; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(inquiryItems).set(data).where(and(eq(inquiryItems.id, id), eq(inquiryItems.userId, userId)));
}

export async function removeInquiryItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(inquiryItems).where(and(eq(inquiryItems.id, id), eq(inquiryItems.userId, userId)));
}

export async function clearInquiryItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(inquiryItems).where(eq(inquiryItems.userId, userId));
}

export async function submitInquiry(data: InsertInquirySubmission) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(inquirySubmissions).values(data);
  return result[0].insertId;
}

export async function getUserInquiries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquirySubmissions).where(eq(inquirySubmissions.userId, userId)).orderBy(desc(inquirySubmissions.createdAt));
}

export async function getAllInquiries(opts: { status?: string; page?: number; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { status, page = 1, limit = 20 } = opts;
  const conditions = [];
  if (status) conditions.push(eq(inquirySubmissions.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;
  const [items, countResult] = await Promise.all([
    db.select().from(inquirySubmissions).where(where).orderBy(desc(inquirySubmissions.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(inquirySubmissions).where(where),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateInquiryStatus(id: number, status: "pending" | "replied" | "closed") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(inquirySubmissions).set({ status }).where(eq(inquirySubmissions.id, id));
}
