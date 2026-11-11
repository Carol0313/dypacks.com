import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { orderItems, orders, users } from "../drizzle/schema";
import { calculateQuote } from "../shared/quote";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

const email = "quote-buyer@example.com";
let orderId = 0;

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

afterAll(async () => {
  const database = await db.getDb();
  if (!database) return;
  if (orderId) {
    await database.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await database.delete(orders).where(eq(orders.id, orderId));
  }
  const openId = createHash("sha256")
    .update(`guest:${email}`)
    .digest("hex");
  await database.delete(users).where(eq(users.openId, openId));
});

describe("order.placeCustom", () => {
  it("stores a guest order at the recalculated quote", async () => {
    const catalog = await db.getProducts({ status: "active", limit: 1 });
    if (catalog.items.length === 0) return;

    const product = catalog.items[0];
    const expected = calculateQuote({
      referenceUnitPrice: Number(product.price),
      minOrderQty: product.minOrderQty,
      lengthMm: 260,
      widthMm: 180,
      heightMm: 70,
      quantity: Math.max(product.minOrderQty, 500),
      material: "thick",
      finishes: ["foil"],
      print: "cmyk",
    });

    const caller = appRouter.createCaller(publicContext());
    const result = await caller.order.placeCustom({
      productId: product.id,
      lengthMm: 260,
      widthMm: 180,
      heightMm: 70,
      quantity: expected.quantity,
      material: "thick",
      finishes: ["foil"],
      print: "cmyk",
      requirements: "Navy ribbon and a velvet insert",
      contactName: "Quote Buyer",
      email,
      phone: "13800000000",
      country: "United States",
      state: "California",
      city: "Los Angeles",
      address: "1 Market Street",
      zipCode: "90001",
      paymentMethod: "paypal",
    });

    orderId = Number(result.orderId);
    expect(result.orderNumber.startsWith("DY")).toBe(true);
    expect(result.quote.total).toBe(expected.total);
    expect(result.quote.unitPrice).toBe(expected.unitPrice);

    const saved = await db.getOrderById(orderId);
    const items = await db.getOrderItems(orderId);
    expect(saved?.total).toBe(expected.total.toFixed(2));
    expect(saved?.note).toContain("260×180×70 mm");
    expect(items[0]?.price).toBe(expected.unitPrice.toFixed(2));
    const spec = JSON.parse(items[0].specification || "{}");
    expect(spec.requirements).toBe("Navy ribbon and a velvet insert");
    expect(spec.finishes).toEqual(["foil"]);
  });
});
