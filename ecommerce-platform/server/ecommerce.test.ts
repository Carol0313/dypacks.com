import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helper: create mock contexts ───────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(
  overrides?: Partial<AuthenticatedUser>
): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "buyer@example.com",
    name: "Test Buyer",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext({
    id: 99,
    openId: "admin-001",
    name: "Admin",
    role: "admin",
  });
}

// ─── Tests ──────────────────────────────────────────────

describe("Auth", () => {
  it("auth.me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Buyer");
    expect(result?.role).toBe("user");
  });
});

describe("Category Router", () => {
  it("category.list is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.category.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("category.create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.category.create({ name: "Test", slug: "test" })
    ).rejects.toThrow();
  });

  it("category.create succeeds for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.category.create({
      name: "Gift Boxes",
      slug: "gift-boxes-test-" + Date.now(),
      description: "Premium gift boxes",
      sortOrder: 1,
    });
    expect(result).toBeDefined();
  });

  it("category.delete requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.category.delete({ id: 9999 })).rejects.toThrow();
  });
});

describe("Product Router", () => {
  it("product.list is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("product.list supports pagination", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.list({ page: 1, limit: 5 });
    expect(result.items.length).toBeLessThanOrEqual(5);
  });

  it("product.create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.product.create({
        name: "Test Product",
        slug: "test-product",
        price: "10.00",
        categoryId: 1,
      })
    ).rejects.toThrow();
  });

  it("product.getBySlug returns null for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.getBySlug({
      slug: "non-existent-product-xyz",
    });
    expect(result).toBeUndefined();
  });
});

describe("Cart Router", () => {
  it("cart.list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.list()).rejects.toThrow();
  });

  it("cart.list returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.cart.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("cart.count requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.count()).rejects.toThrow();
  });

  it("cart.count returns number for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.cart.count();
    expect(typeof result).toBe("number");
  });

  it("cart.clear requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.clear()).rejects.toThrow();
  });
});

describe("Address Router", () => {
  it("address.list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.address.list()).rejects.toThrow();
  });

  it("address.list returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.address.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("address.create requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.address.create({
        fullName: "John",
        phone: "123",
        country: "US",
        state: "CA",
        city: "LA",
        address: "123 St",
        zipCode: "90001",
      })
    ).rejects.toThrow();
  });
});

describe("Order Router", () => {
  it("order.create requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.order.create({
        paymentMethod: "paypal",
        shippingName: "John",
        shippingPhone: "123",
        shippingCountry: "US",
        shippingState: "CA",
        shippingCity: "LA",
        shippingAddress: "123 St",
        shippingZipCode: "90001",
      })
    ).rejects.toThrow();
  });

  it("order.create fails with empty cart", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.order.create({
        paymentMethod: "paypal",
        shippingName: "John",
        shippingPhone: "123",
        shippingCountry: "US",
        shippingState: "CA",
        shippingCity: "LA",
        shippingAddress: "123 St",
        shippingZipCode: "90001",
      })
    ).rejects.toThrow("Cart is empty");
  });

  it("order.myOrders requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.order.myOrders()).rejects.toThrow();
  });

  it("order.listAll requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.order.listAll({})).rejects.toThrow();
  });

  it("order.listAll succeeds for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.order.listAll({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });
});

describe("Blog Router", () => {
  it("blog.list is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blog.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("blog.create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.blog.create({ title: "Test", slug: "test", content: "Content" })
    ).rejects.toThrow();
  });

  it("blog.getBySlug returns undefined for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blog.getBySlug({
      slug: "non-existent-post-xyz",
    });
    expect(result).toBeUndefined();
  });
});

describe("Admin User Router", () => {
  it("adminUser.list requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.adminUser.list()).rejects.toThrow();
  });

  it("adminUser.list succeeds for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.adminUser.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("adminUser.updateRole requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.adminUser.updateRole({ userId: 1, role: "admin" })
    ).rejects.toThrow();
  });
});
