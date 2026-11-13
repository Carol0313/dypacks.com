/**
 * Instant packaging quote.
 *
 * The catalog price is the unit price of a 200×150×60 mm box in standard
 * 1200gsm greyboard with CMYK print and no extra finish, at the product MOQ.
 * Other sizes scale by the wrap area of a lid-and-base rigid box. Finishes
 * add a per-piece amount that also scales with area. Larger runs get a
 * volume factor. Orders below the MOQ are samples: a higher unit price and
 * a smaller setup fee.
 */

export const REFERENCE_SIZE_MM = { length: 200, width: 150, height: 60 } as const;

export const MATERIALS = [
  "greyboard",
  "art",
  "gold",
  "silver",
  "kraft",
  "food",
  "standard",
  "thick",
  "specialty",
] as const;
export const THICKNESSES = ["g1200", "g1500", "g2000"] as const;
export const FINISHES = ["foil", "emboss", "spotUv", "magnet"] as const;
export const PRINTS = ["none", "oneColor", "cmyk", "cmykPms"] as const;
export const SHIPPING_METHODS = ["freight", "express"] as const;
export const REGIONS = [
  "china",
  "eastAsia",
  "southeastAsia",
  "europe",
  "northAmerica",
  "other",
] as const;

export type MaterialId = (typeof MATERIALS)[number];
export type ThicknessId = (typeof THICKNESSES)[number];
export type FinishId = (typeof FINISHES)[number];
export type PrintId = (typeof PRINTS)[number];
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];
export type RegionId = (typeof REGIONS)[number];

const MATERIAL_FACTOR: Record<MaterialId, number> = {
  greyboard: 1,
  art: 1.08,
  gold: 1.35,
  silver: 1.32,
  kraft: 0.86,
  food: 1.22,
  standard: 1,
  thick: 1.18,
  specialty: 1.28,
};

const THICKNESS_FACTOR: Record<ThicknessId, number> = {
  g1200: 1,
  g1500: 1.15,
  g2000: 1.32,
};

const PRINT_FACTOR: Record<PrintId, number> = {
  none: 0.82,
  oneColor: 0.9,
  cmyk: 1,
  cmykPms: 1.1,
};

/** Extra USD per piece at the reference size. */
const FINISH_USD: Record<FinishId, number> = {
  foil: 0.42,
  emboss: 0.36,
  spotUv: 0.28,
  magnet: 0.55,
};

const PRODUCTION_SETUP_USD = 180;
const SAMPLE_SETUP_USD = 60;
const SAMPLE_UNIT_FACTOR = 1.85;
const MIN_AREA_RATIO = 0.35;

export type QuoteInput = {
  referenceUnitPrice: number;
  minOrderQty: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  material: MaterialId;
  thickness?: ThicknessId;
  finishes: FinishId[];
  print: PrintId;
};

export type ShippingQuote = {
  method: ShippingMethod;
  region: RegionId;
  chargeableKg: number;
  fee: number;
  days: string;
};

export type Quote = {
  unitPrice: number;
  quantity: number;
  setupFee: number;
  goodsTotal: number;
  total: number;
  areaRatio: number;
  sample: boolean;
  leadTimeDays: string;
  currency: "USD";
};

export class QuoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteError";
  }
}

export function wrapAreaMm2(length: number, width: number, height: number) {
  return 2 * (length + 2 * height) * (width + 2 * height);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function volumeFactor(quantity: number) {
  if (quantity >= 5000) return 0.72;
  if (quantity >= 3000) return 0.78;
  if (quantity >= 1000) return 0.84;
  if (quantity >= 500) return 0.92;
  return 1;
}

function assertSize(label: string, value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new QuoteError(`${label} must be between ${min} and ${max} mm`);
  }
}

export function calculateQuote(input: QuoteInput): Quote {
  assertSize("Length", input.lengthMm, 20, 600);
  assertSize("Width", input.widthMm, 20, 600);
  assertSize("Height", input.heightMm, 10, 400);
  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 100000
  ) {
    throw new QuoteError("Quantity must be between 1 and 100000");
  }
  if (!(input.referenceUnitPrice > 0)) {
    throw new QuoteError("This product has no reference price");
  }

  const referenceArea = wrapAreaMm2(
    REFERENCE_SIZE_MM.length,
    REFERENCE_SIZE_MM.width,
    REFERENCE_SIZE_MM.height
  );
  const areaRatio = Math.max(
    MIN_AREA_RATIO,
    wrapAreaMm2(input.lengthMm, input.widthMm, input.heightMm) / referenceArea
  );
  const sample = input.quantity < Math.max(1, input.minOrderQty);
  const finishAdd =
    input.finishes.reduce((sum, finish) => sum + FINISH_USD[finish], 0) *
    areaRatio;
  const scaled =
    input.referenceUnitPrice *
    areaRatio *
    MATERIAL_FACTOR[input.material] *
    THICKNESS_FACTOR[input.thickness ?? "g1200"] *
    PRINT_FACTOR[input.print] *
    (sample ? 1 : volumeFactor(input.quantity));
  const unitPrice = roundMoney(
    (scaled + finishAdd) * (sample ? SAMPLE_UNIT_FACTOR : 1)
  );
  const setupFee = sample ? SAMPLE_SETUP_USD : PRODUCTION_SETUP_USD;
  const goodsTotal = roundMoney(unitPrice * input.quantity);
  const total = roundMoney(goodsTotal + setupFee);

  let leadTimeDays = "18–25";
  if (sample) leadTimeDays = "5–7";
  else if (input.quantity < 1000) leadTimeDays = "12–18";

  return {
    unitPrice,
    quantity: input.quantity,
    setupFee,
    goodsTotal,
    total,
    areaRatio: Math.round(areaRatio * 100) / 100,
    sample,
    leadTimeDays,
    currency: "USD",
  };
}

const SHIPPING_RATE: Record<ShippingMethod, Record<RegionId, number>> = {
  freight: {
    china: 1.8,
    eastAsia: 3.2,
    southeastAsia: 3.6,
    europe: 4.8,
    northAmerica: 5.2,
    other: 6,
  },
  express: {
    china: 6.5,
    eastAsia: 9,
    southeastAsia: 10,
    europe: 13,
    northAmerica: 14,
    other: 16,
  },
};

const SHIPPING_MINIMUM: Record<ShippingMethod, number> = {
  freight: 45,
  express: 32,
};

const SHIPPING_DAYS: Record<ShippingMethod, string> = {
  freight: "18–35",
  express: "3–7",
};

export function calculateShipping(input: {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  method: ShippingMethod;
  region: RegionId;
}): ShippingQuote {
  assertSize("Length", input.lengthMm, 20, 600);
  assertSize("Width", input.widthMm, 20, 600);
  assertSize("Height", input.heightMm, 10, 700);
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new QuoteError("Quantity must be between 1 and 100000");
  }
  const volumeCm3 =
    (input.lengthMm / 10) *
    (input.widthMm / 10) *
    (input.heightMm / 10) *
    input.quantity *
    1.15;
  const divisor = input.method === "express" ? 5000 : 6000;
  const volumetricKg = volumeCm3 / divisor;
  const actualKg =
    (wrapAreaMm2(input.lengthMm, input.widthMm, input.heightMm) *
      0.0011 *
      input.quantity) /
    1000;
  const chargeableKg =
    Math.round(Math.max(0.5, volumetricKg, actualKg) * 100) / 100;
  const fee = roundMoney(
    Math.max(
      SHIPPING_MINIMUM[input.method],
      chargeableKg * SHIPPING_RATE[input.method][input.region]
    )
  );
  return {
    method: input.method,
    region: input.region,
    chargeableKg,
    fee,
    days: SHIPPING_DAYS[input.method],
  };
}

export const BAG_PAPERS = ["kraft", "whiteKraft", "art"] as const;
export const BAG_GSMS = ["g120", "g157", "g200"] as const;
export const BAG_HANDLES = ["none", "twisted", "ribbon", "cotton", "dieCut"] as const;
export const BAG_STYLES = ["shopping", "boutique", "grocery"] as const;

export type BagPaperId = (typeof BAG_PAPERS)[number];
export type BagGsmId = (typeof BAG_GSMS)[number];
export type BagHandleId = (typeof BAG_HANDLES)[number];
export type BagStyleId = (typeof BAG_STYLES)[number];

/** Starting rate for a 320×400×120 mm kraft 157gsm bag, twisted handle, CMYK, at 500 pcs. */
export const BAG_REFERENCE_UNIT_USD = 0.72;
export const BAG_MOQ = 500;
export const BAG_REFERENCE_MM = { width: 320, height: 400, gusset: 120 } as const;

export const BAG_STYLE_MM: Record<
  BagStyleId,
  { width: number; height: number; gusset: number }
> = {
  shopping: BAG_REFERENCE_MM,
  boutique: { width: 180, height: 240, gusset: 80 },
  grocery: { width: 260, height: 360, gusset: 160 },
};

const BAG_PAPER_FACTOR: Record<BagPaperId, number> = {
  kraft: 1,
  whiteKraft: 1.08,
  art: 1.22,
};

const BAG_GSM_FACTOR: Record<BagGsmId, number> = {
  g120: 0.86,
  g157: 1,
  g200: 1.18,
};

const BAG_HANDLE_USD: Record<BagHandleId, number> = {
  none: -0.05,
  twisted: 0,
  ribbon: 0.1,
  cotton: 0.16,
  dieCut: -0.03,
};

const BAG_FINISH_USD: Partial<Record<FinishId, number>> = {
  foil: 0.08,
  spotUv: 0.05,
};

export function bagVolumeFactor(quantity: number) {
  if (quantity >= 5000) return 0.72;
  if (quantity >= 3000) return 0.78;
  if (quantity >= 2000) return 0.84;
  if (quantity >= 1000) return 0.92;
  return 1;
}

function bagPaperAreaMm2(width: number, height: number, gusset: number) {
  return 2 * width * height + 2 * gusset * height + width * gusset;
}

export function calculateBagQuote(input: {
  widthMm: number;
  heightMm: number;
  gussetMm: number;
  quantity: number;
  paper: BagPaperId;
  gsm: BagGsmId;
  handle: BagHandleId;
  finishes: FinishId[];
  print: PrintId;
}): Quote {
  assertSize("Width", input.widthMm, 80, 600);
  assertSize("Height", input.heightMm, 100, 700);
  assertSize("Gusset", input.gussetMm, 20, 250);
  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 100000
  ) {
    throw new QuoteError("Quantity must be between 1 and 100000");
  }

  const referenceArea = bagPaperAreaMm2(
    BAG_REFERENCE_MM.width,
    BAG_REFERENCE_MM.height,
    BAG_REFERENCE_MM.gusset
  );
  const areaRatio = Math.max(
    MIN_AREA_RATIO,
    bagPaperAreaMm2(input.widthMm, input.heightMm, input.gussetMm) / referenceArea
  );
  const sample = input.quantity < BAG_MOQ;
  const finishAdd =
    input.finishes.reduce((sum, finish) => sum + (BAG_FINISH_USD[finish] ?? 0), 0) *
    areaRatio;
  const handleAdd = BAG_HANDLE_USD[input.handle] * areaRatio;
  const scaled =
    BAG_REFERENCE_UNIT_USD *
    areaRatio *
    BAG_PAPER_FACTOR[input.paper] *
    BAG_GSM_FACTOR[input.gsm] *
    PRINT_FACTOR[input.print] *
    (sample ? 1 : bagVolumeFactor(input.quantity));
  const unitPrice = roundMoney(
    Math.max(0.05, (scaled + finishAdd + handleAdd) * (sample ? 1.55 : 1))
  );
  const setupFee = sample ? 25 : 80;
  const goodsTotal = roundMoney(unitPrice * input.quantity);
  const total = roundMoney(goodsTotal + setupFee);
  let leadTimeDays = "12–18";
  if (sample) leadTimeDays = "5–7";
  else if (input.quantity >= 2000) leadTimeDays = "18–25";

  return {
    unitPrice,
    quantity: input.quantity,
    setupFee,
    goodsTotal,
    total,
    areaRatio: Math.round(areaRatio * 100) / 100,
    sample,
    leadTimeDays,
    currency: "USD",
  };
}
