import { describe, expect, it } from "vitest";
import {
  BAG_MOQ,
  REFERENCE_SIZE_MM,
  QuoteError,
  calculateBagQuote,
  calculateQuote,
  calculateShipping,
  type QuoteInput,
} from "../shared/quote";

function base(overrides: Partial<QuoteInput> = {}): QuoteInput {
  return {
    referenceUnitPrice: 8.75,
    minOrderQty: 200,
    lengthMm: REFERENCE_SIZE_MM.length,
    widthMm: REFERENCE_SIZE_MM.width,
    heightMm: REFERENCE_SIZE_MM.height,
    quantity: 200,
    material: "standard",
    finishes: [],
    print: "cmyk",
    ...overrides,
  };
}

describe("calculateQuote", () => {
  it("prices the reference box at the catalog unit price plus setup", () => {
    const quote = calculateQuote(base());
    expect(quote.unitPrice).toBe(8.75);
    expect(quote.setupFee).toBe(180);
    expect(quote.goodsTotal).toBe(1750);
    expect(quote.total).toBe(1930);
    expect(quote.sample).toBe(false);
  });

  it("charges more for a larger box and less for a smaller one", () => {
    const larger = calculateQuote(
      base({ lengthMm: 300, widthMm: 220, heightMm: 80 })
    );
    const smaller = calculateQuote(
      base({ lengthMm: 80, widthMm: 60, heightMm: 30 })
    );
    expect(larger.unitPrice).toBeGreaterThan(8.75);
    expect(smaller.unitPrice).toBeLessThan(8.75);
  });

  it("adds finish cost and applies a volume discount on larger runs", () => {
    const plain = calculateQuote(base({ quantity: 1000 }));
    const foiled = calculateQuote(base({ quantity: 1000, finishes: ["foil"] }));
    const shortRun = calculateQuote(base({ quantity: 200 }));
    expect(foiled.unitPrice).toBeGreaterThan(plain.unitPrice);
    expect(plain.unitPrice).toBeLessThan(shortRun.unitPrice);
  });

  it("uses sample pricing below the minimum order quantity", () => {
    const sample = calculateQuote(base({ quantity: 20 }));
    expect(sample.sample).toBe(true);
    expect(sample.setupFee).toBe(60);
    expect(sample.unitPrice).toBeGreaterThan(8.75);
    expect(sample.leadTimeDays).toBe("5–7");
  });

  it("prices thicker board above the 1200gsm reference", () => {
    const thicker = calculateQuote(base({ material: "greyboard", thickness: "g1500" }));
    expect(thicker.unitPrice).toBeGreaterThan(8.75);
  });

  it("charges express door delivery above freight to a logistics point", () => {
    const shared = {
      lengthMm: 200,
      widthMm: 150,
      heightMm: 60,
      quantity: 200,
      region: "europe" as const,
    };
    const freight = calculateShipping({ ...shared, method: "freight" });
    const express = calculateShipping({ ...shared, method: "express" });
    expect(express.fee).toBeGreaterThan(freight.fee);
    expect(express.days).toBe("3–7");
    expect(freight.days).toBe("18–35");
  });

  it("prices the reference paper bag at the starting unit rate", () => {
    const quote = calculateBagQuote({
      widthMm: 320,
      heightMm: 400,
      gussetMm: 120,
      quantity: BAG_MOQ,
      paper: "kraft",
      gsm: "g157",
      handle: "twisted",
      finishes: [],
      print: "cmyk",
    });
    expect(quote.unitPrice).toBe(0.72);
    expect(quote.setupFee).toBe(80);
    expect(quote.sample).toBe(false);
  });

  it("charges cotton handles more than no handle on the same bag", () => {
    const plain = calculateBagQuote({
      widthMm: 320,
      heightMm: 400,
      gussetMm: 120,
      quantity: BAG_MOQ,
      paper: "kraft",
      gsm: "g157",
      handle: "none",
      finishes: [],
      print: "cmyk",
    });
    const cotton = calculateBagQuote({
      widthMm: 320,
      heightMm: 400,
      gussetMm: 120,
      quantity: BAG_MOQ,
      paper: "kraft",
      gsm: "g157",
      handle: "cotton",
      finishes: [],
      print: "cmyk",
    });
    expect(cotton.unitPrice).toBeGreaterThan(plain.unitPrice);
  });

  it("rejects a size outside the manufacturable range", () => {
    expect(() => calculateQuote(base({ lengthMm: 5 }))).toThrow(QuoteError);
  });
});
