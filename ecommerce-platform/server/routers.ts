import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { storagePut } from "./storage";
import { ossEnabled, ossPut } from "./_core/oss";

// ─── Category Router ─────────────────────────────────────

const categoryRouter = router({
  list: publicProcedure.query(async () => {
    return db.getAllCategories();
  }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return db.getCategoryBySlug(input.slug);
  }),
  create: adminProcedure.input(z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    return db.createCategory(input);
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await db.updateCategory(id, data);
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteCategory(input.id);
    return { success: true };
  }),
});

// ─── Product Router ──────────────────────────────────────

const productRouter = router({
  list: publicProcedure.input(z.object({
    categoryId: z.number().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    featured: z.boolean().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getProducts(input ?? {});
  }),
  searchSuggestions: publicProcedure.input(z.object({
    query: z.string().min(1),
    limit: z.number().optional(),
  })).query(async ({ input }) => {
    return db.searchSuggestions(input.query, input.limit);
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getProductById(input.id);
  }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return db.getProductBySlug(input.slug);
  }),
  create: adminProcedure.input(z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    price: z.string(),
    compareAtPrice: z.string().optional(),
    categoryId: z.number(),
    images: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    stock: z.number().optional(),
    minOrderQty: z.number().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
  })).mutation(async ({ input }) => {
    return db.createProduct(input);
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    price: z.string().optional(),
    compareAtPrice: z.string().optional(),
    categoryId: z.number().optional(),
    images: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    stock: z.number().optional(),
    minOrderQty: z.number().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await db.updateProduct(id, data);
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteProduct(input.id);
    return { success: true };
  }),
  uploadImage: adminProcedure.input(z.object({
    fileName: z.string(),
    fileBase64: z.string(),
    contentType: z.string(),
  })).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileBase64, "base64");
    const key = `products/${nanoid()}-${input.fileName}`;
    if (ossEnabled) {
      const url = await ossPut(key, buffer, input.contentType);
      return { url };
    }
    const { url } = await storagePut(key, buffer, input.contentType);
    return { url };
  }),
});

// ─── Cart Router ─────────────────────────────────────────

const cartRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await db.getCartItems(ctx.user.id);
    if (items.length === 0) return [];
    const productIds = items.map(i => i.productId);
    const prods = await db.getProductsByIds(productIds);
    const prodMap = new Map(prods.map(p => [p.id, p]));
    return items.map(item => ({
      ...item,
      product: prodMap.get(item.productId) ?? null,
    }));
  }),
  add: protectedProcedure.input(z.object({
    productId: z.number(),
    quantity: z.number().min(1).default(1),
  })).mutation(async ({ ctx, input }) => {
    return db.addToCart(ctx.user.id, input.productId, input.quantity);
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    quantity: z.number().min(1),
  })).mutation(async ({ ctx, input }) => {
    await db.updateCartItem(input.id, ctx.user.id, input.quantity);
    return { success: true };
  }),
  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.removeCartItem(input.id, ctx.user.id);
    return { success: true };
  }),
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearCart(ctx.user.id);
    return { success: true };
  }),
  count: protectedProcedure.query(async ({ ctx }) => {
    const items = await db.getCartItems(ctx.user.id);
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }),
});

// ─── Address Router ──────────────────────────────────────

const addressRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserAddresses(ctx.user.id);
  }),
  create: protectedProcedure.input(z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    country: z.string().min(1),
    state: z.string().min(1),
    city: z.string().min(1),
    address: z.string().min(1),
    zipCode: z.string().min(1),
    isDefault: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    return db.createAddress({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    fullName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    zipCode: z.string().min(1).optional(),
    isDefault: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await db.updateAddress(id, ctx.user.id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.deleteAddress(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ─── Order Router ────────────────────────────────────────

const orderRouter = router({
  create: protectedProcedure.input(z.object({
    paymentMethod: z.enum(["alipay", "paypal"]),
    shippingName: z.string().min(1),
    shippingPhone: z.string().min(1),
    shippingCountry: z.string().min(1),
    shippingState: z.string().min(1),
    shippingCity: z.string().min(1),
    shippingAddress: z.string().min(1),
    shippingZipCode: z.string().min(1),
    note: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    // Get cart items
    const cartItemsList = await db.getCartItems(ctx.user.id);
    if (cartItemsList.length === 0) throw new Error("Cart is empty");
    const productIds = cartItemsList.map(i => i.productId);
    const prods = await db.getProductsByIds(productIds);
    const prodMap = new Map(prods.map(p => [p.id, p]));

    let subtotal = 0;
    const items = cartItemsList.map(ci => {
      const prod = prodMap.get(ci.productId);
      if (!prod) throw new Error(`Product ${ci.productId} not found`);
      const lineTotal = Number(prod.price) * ci.quantity;
      subtotal += lineTotal;
      return {
        orderId: 0, // will be set after order creation
        productId: ci.productId,
        productName: prod.name,
        productImage: prod.images ? JSON.parse(prod.images)[0] : null,
        price: prod.price,
        quantity: ci.quantity,
        subtotal: lineTotal.toFixed(2),
      };
    });

    const orderNumber = `DY${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;
    const total = subtotal; // shipping calculated separately if needed

    const orderId = await db.createOrder({
      orderNumber,
      userId: ctx.user.id,
      paymentMethod: input.paymentMethod,
      subtotal: subtotal.toFixed(2),
      shippingFee: "0.00",
      total: total.toFixed(2),
      shippingName: input.shippingName,
      shippingPhone: input.shippingPhone,
      shippingCountry: input.shippingCountry,
      shippingState: input.shippingState,
      shippingCity: input.shippingCity,
      shippingAddress: input.shippingAddress,
      shippingZipCode: input.shippingZipCode,
      note: input.note,
    }, items);

    // Clear cart after order
    await db.clearCart(ctx.user.id);

    return { orderId, orderNumber };
  }),
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserOrders(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const order = await db.getOrderById(input.id);
    if (!order || order.userId !== ctx.user.id) throw new Error("Order not found");
    const items = await db.getOrderItems(order.id);
    return { ...order, items };
  }),
  // Admin
  listAll: adminProcedure.input(z.object({
    status: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getAllOrders(input ?? {});
  }),
  updateStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
  })).mutation(async ({ input }) => {
    await db.updateOrderStatus(input.id, input.status, input.paymentStatus);
    return { success: true };
  }),
});

// ─── Blog Router ─────────────────────────────────────────

const blogRouter = router({
  list: publicProcedure.input(z.object({
    status: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getBlogPosts({ status: "published", ...(input ?? {}) });
  }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return db.getBlogPostBySlug(input.slug);
  }),
  // Admin
  listAll: adminProcedure.input(z.object({
    status: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getBlogPosts(input ?? {});
  }),
  create: adminProcedure.input(z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    excerpt: z.string().optional(),
    content: z.string().min(1),
    coverImage: z.string().optional(),
    status: z.enum(["published", "draft"]).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    publishedAt: z.date().optional(),
  })).mutation(async ({ ctx, input }) => {
    return db.createBlogPost({ ...input, authorId: ctx.user.id });
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    coverImage: z.string().optional(),
    status: z.enum(["published", "draft"]).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    publishedAt: z.date().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await db.updateBlogPost(id, data);
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteBlogPost(input.id);
    return { success: true };
  }),
  uploadImage: adminProcedure.input(z.object({
    fileName: z.string(),
    fileBase64: z.string(),
    contentType: z.string(),
  })).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileBase64, "base64");
    const key = `blog/${nanoid()}-${input.fileName}`;
    if (ossEnabled) {
      const url = await ossPut(key, buffer, input.contentType);
      return { url };
    }
    const { url } = await storagePut(key, buffer, input.contentType);
    return { url };
  }),
});

// ─── Review Router ──────────────────────────────────────

const reviewRouter = router({
  // Public: get reviews for a product
  listByProduct: publicProcedure.input(z.object({
    productId: z.number(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })).query(async ({ input }) => {
    return db.getProductReviews(input.productId, { page: input.page, limit: input.limit });
  }),
  // Public: get rating stats for a product
  ratingStats: publicProcedure.input(z.object({
    productId: z.number(),
  })).query(async ({ input }) => {
    return db.getProductRatingStats(input.productId);
  }),
  // Public: batch rating stats for product list cards
  batchRatingStats: publicProcedure.input(z.object({
    productIds: z.array(z.number()),
  })).query(async ({ input }) => {
    return db.getBatchProductRatingStats(input.productIds);
  }),
  // Protected: create a review (logged-in users only)
  create: protectedProcedure.input(z.object({
    productId: z.number(),
    rating: z.number().min(1).max(5),
    title: z.string().max(256).optional(),
    content: z.string().max(2000).optional(),
  })).mutation(async ({ ctx, input }) => {
    return db.createReview({
      productId: input.productId,
      userId: ctx.user.id,
      userName: ctx.user.name ?? "Anonymous",
      rating: input.rating,
      title: input.title,
      content: input.content,
    });
  }),
  // Admin: list all reviews
  listAll: adminProcedure.input(z.object({
    status: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getAllReviews(input ?? {});
  }),
  // Admin: update review status
  updateStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["approved", "pending", "rejected"]),
  })).mutation(async ({ input }) => {
    await db.updateReviewStatus(input.id, input.status);
    return { success: true };
  }),
  // Admin: delete review
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteReview(input.id);
    return { success: true };
  }),
});

// ─── Inquiry Router ─────────────────────────────────────

const inquiryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await db.getInquiryItems(ctx.user.id);
    if (items.length === 0) return [];
    const productIds = items.map(i => i.productId);
    const prods = await db.getProductsByIds(productIds);
    const prodMap = new Map(prods.map(p => [p.id, p]));
    return items.map(item => ({
      ...item,
      product: prodMap.get(item.productId) ?? null,
    }));
  }),
  add: protectedProcedure.input(z.object({
    productId: z.number(),
    quantity: z.number().min(1).default(1),
    note: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    return db.addToInquiry(ctx.user.id, input.productId, input.quantity, input.note);
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    quantity: z.number().min(1).optional(),
    note: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await db.updateInquiryItem(id, ctx.user.id, data);
    return { success: true };
  }),
  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.removeInquiryItem(input.id, ctx.user.id);
    return { success: true };
  }),
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearInquiryItems(ctx.user.id);
    return { success: true };
  }),
  count: protectedProcedure.query(async ({ ctx }) => {
    const items = await db.getInquiryItems(ctx.user.id);
    return items.length;
  }),
  submit: protectedProcedure.input(z.object({
    companyName: z.string().optional(),
    contactName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
    message: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const items = await db.getInquiryItems(ctx.user.id);
    if (items.length === 0) throw new Error("Inquiry list is empty");
    const productIds = items.map(i => i.productId);
    const prods = await db.getProductsByIds(productIds);
    const prodMap = new Map(prods.map(p => [p.id, p]));
    const snapshot = items.map(item => ({
      productId: item.productId,
      productName: prodMap.get(item.productId)?.name ?? "Unknown",
      quantity: item.quantity,
      note: item.note,
      price: prodMap.get(item.productId)?.price ?? "0",
    }));
    const inquiryNumber = `INQ${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;
    const id = await db.submitInquiry({
      inquiryNumber,
      userId: ctx.user.id,
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      message: input.message,
      items: JSON.stringify(snapshot),
    });
    await db.clearInquiryItems(ctx.user.id);
    return { id, inquiryNumber };
  }),
  mySubmissions: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserInquiries(ctx.user.id);
  }),
  // Admin
  listAll: adminProcedure.input(z.object({
    status: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getAllInquiries(input ?? {});
  }),
  updateInquiryStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "replied", "closed"]),
  })).mutation(async ({ input }) => {
    await db.updateInquiryStatus(input.id, input.status);
    return { success: true };
  }),
});

// ─── Admin User Router ───────────────────────────────────

const adminUserRouter = router({
  list: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),
  updateRole: adminProcedure.input(z.object({
    userId: z.number(),
    role: z.enum(["user", "admin"]),
  })).mutation(async ({ input }) => {
    await db.updateUserRole(input.userId, input.role);
    return { success: true };
  }),
});

// ─── Main Router ─────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  category: categoryRouter,
  product: productRouter,
  cart: cartRouter,
  address: addressRouter,
  order: orderRouter,
  blog: blogRouter,
  adminUser: adminUserRouter,
  review: reviewRouter,
  inquiry: inquiryRouter,
});

export type AppRouter = typeof appRouter;
