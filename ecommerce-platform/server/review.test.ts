import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(opts: { role?: "user" | "admin"; userId?: number } = {}) {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: opts.userId ?? 1,
    openId: `test-user-${opts.userId ?? 1}`,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: opts.role ?? "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext() {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("review router", () => {
  describe("review.listByProduct", () => {
    it("returns reviews list with total count for a product (public)", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.listByProduct({ productId: 1 });

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("accepts optional page and limit parameters", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.listByProduct({ productId: 1, page: 1, limit: 5 });

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
    });
  });

  describe("review.ratingStats", () => {
    it("returns rating statistics for a product (public)", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.ratingStats({ productId: 1 });

      expect(result).toHaveProperty("averageRating");
      expect(result).toHaveProperty("totalReviews");
      expect(result).toHaveProperty("distribution");
      expect(typeof result.averageRating).toBe("number");
      expect(typeof result.totalReviews).toBe("number");
      expect(result.distribution).toHaveProperty("1");
      expect(result.distribution).toHaveProperty("2");
      expect(result.distribution).toHaveProperty("3");
      expect(result.distribution).toHaveProperty("4");
      expect(result.distribution).toHaveProperty("5");
    });

    it("returns zero values for product with no reviews", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.ratingStats({ productId: 99999 });

      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });
  });

  describe("review.create", () => {
    it("requires authentication to create a review", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.review.create({ productId: 1, rating: 5 })
      ).rejects.toThrow();
    });

    it("validates rating must be between 1 and 5", async () => {
      const { ctx } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.review.create({ productId: 1, rating: 0 })
      ).rejects.toThrow();

      await expect(
        caller.review.create({ productId: 1, rating: 6 })
      ).rejects.toThrow();
    });

    it("accepts valid review data with all fields", async () => {
      const { ctx } = createMockContext({ userId: 999 });
      const caller = appRouter.createCaller(ctx);

      // This should either succeed or fail with a DB-specific error (not validation)
      try {
        const result = await caller.review.create({
          productId: 1,
          rating: 5,
          title: "Excellent packaging quality",
          content: "The perfume box exceeded our expectations. Great craftsmanship!",
        });
        expect(typeof result).toBe("number");
      } catch (err: any) {
        // If it fails, it should be a DB error (duplicate review), not a validation error
        expect(err.message).toContain("already reviewed");
      }
    });

    it("accepts review with only required fields (rating)", async () => {
      const { ctx } = createMockContext({ userId: 998 });
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.review.create({
          productId: 1,
          rating: 4,
        });
        expect(typeof result).toBe("number");
      } catch (err: any) {
        expect(err.message).toContain("already reviewed");
      }
    });
  });

  describe("review.listAll (admin)", () => {
    it("requires admin role to list all reviews", async () => {
      const { ctx } = createMockContext({ role: "user" });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.review.listAll()).rejects.toThrow();
    });

    it("returns all reviews for admin", async () => {
      const { ctx } = createMockContext({ role: "admin" });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.listAll();

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe("review.updateStatus (admin)", () => {
    it("requires admin role to update review status", async () => {
      const { ctx } = createMockContext({ role: "user" });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.review.updateStatus({ id: 1, status: "rejected" })
      ).rejects.toThrow();
    });

    it("accepts valid status values", async () => {
      const { ctx } = createMockContext({ role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Should not throw validation errors for valid statuses
      const result = await caller.review.updateStatus({ id: 1, status: "approved" });
      expect(result).toEqual({ success: true });
    });
  });

  describe("review.delete (admin)", () => {
    it("requires admin role to delete reviews", async () => {
      const { ctx } = createMockContext({ role: "user" });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.review.delete({ id: 1 })).rejects.toThrow();
    });

    it("returns success for admin delete", async () => {
      const { ctx } = createMockContext({ role: "admin" });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.review.delete({ id: 99999 });
      expect(result).toEqual({ success: true });
    });
  });
});
