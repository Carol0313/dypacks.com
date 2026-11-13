import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ALIPAY_ACCOUNT, PAYPAL_ACCOUNT } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import {
  BAG_GSMS,
  BAG_HANDLES,
  BAG_PAPERS,
  FINISHES,
  PRINTS,
  QuoteError,
  REGIONS,
  SHIPPING_METHODS,
  THICKNESSES,
  calculateBagQuote,
  calculateQuote,
  calculateShipping,
  type BagGsmId,
  type BagHandleId,
  type BagPaperId,
  type FinishId,
  type MaterialId,
  type PrintId,
  type Quote,
  type RegionId,
  type ShippingMethod,
  type ShippingQuote,
  type ThicknessId,
} from "@shared/quote";
import { CheckCircle, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";

type ProductQuoteSource = {
  id: number;
  name: string;
  price: string | number;
  minOrderQty: number;
};

const PLATFORM_MATERIALS = [
  "greyboard",
  "art",
  "gold",
  "silver",
  "kraft",
  "food",
] as const satisfies readonly MaterialId[];

const MATERIAL_KEY: Record<(typeof PLATFORM_MATERIALS)[number], string> = {
  greyboard: "quote.materialGreyboard",
  art: "quote.materialArt",
  gold: "quote.materialGold",
  silver: "quote.materialSilver",
  kraft: "quote.materialKraft",
  food: "quote.materialFood",
};

const THICKNESS_KEY: Record<ThicknessId, string> = {
  g1200: "quote.thickness1200",
  g1500: "quote.thickness1500",
  g2000: "quote.thickness2000",
};

const REGION_KEY: Record<RegionId, string> = {
  china: "quote.regionChina",
  eastAsia: "quote.regionEastAsia",
  southeastAsia: "quote.regionSoutheastAsia",
  europe: "quote.regionEurope",
  northAmerica: "quote.regionNorthAmerica",
  other: "quote.regionOther",
};

const PRINT_KEY: Record<PrintId, string> = {
  none: "quote.printNone",
  oneColor: "quote.printOneColor",
  cmyk: "quote.printCmyk",
  cmykPms: "quote.printCmykPms",
};

const FINISH_KEY: Record<FinishId, string> = {
  foil: "quote.finishFoil",
  emboss: "quote.finishEmboss",
  spotUv: "quote.finishSpotUv",
  magnet: "quote.finishMagnet",
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

const BAG_PAPER_KEY: Record<BagPaperId, string> = {
  kraft: "quote.bagPaperKraft",
  whiteKraft: "quote.bagPaperWhite",
  art: "quote.bagPaperArt",
};

const BAG_GSM_KEY: Record<BagGsmId, string> = {
  g120: "quote.bagGsm120",
  g157: "quote.bagGsm157",
  g200: "quote.bagGsm200",
};

const BAG_HANDLE_KEY: Record<BagHandleId, string> = {
  none: "quote.handleNone",
  twisted: "quote.handleTwisted",
  ribbon: "quote.handleRibbon",
  cotton: "quote.handleCotton",
  dieCut: "quote.handleDieCut",
};

export default function CustomOrder({
  product,
  mode = "box",
  initialSize,
}: {
  product: ProductQuoteSource;
  mode?: "box" | "bag";
  initialSize?: { length: number; width: number; height: number };
}) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [lengthMm, setLengthMm] = useState(initialSize?.length ?? 200);
  const [widthMm, setWidthMm] = useState(initialSize?.width ?? 150);
  const [heightMm, setHeightMm] = useState(initialSize?.height ?? 60);
  const [quantity, setQuantity] = useState(Math.max(1, product.minOrderQty || 1));
  const [material, setMaterial] = useState<MaterialId>("greyboard");
  const [thickness, setThickness] = useState<ThicknessId>("g1200");
  const [bagPaper, setBagPaper] = useState<BagPaperId>("kraft");
  const [bagGsm, setBagGsm] = useState<BagGsmId>("g157");
  const [handle, setHandle] = useState<BagHandleId>("twisted");
  const [print, setPrint] = useState<PrintId>("cmyk");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("express");
  const [region, setRegion] = useState<RegionId>("northAmerica");
  const [finishes, setFinishes] = useState<FinishId[]>([]);
  const [requirements, setRequirements] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "alipay">("paypal");
  const [contact, setContact] = useState({
    contactName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    zipCode: "",
  });
  const [placed, setPlaced] = useState<{
    orderId: number;
    orderNumber: string;
    quote: Quote;
    shipping: ShippingQuote;
  } | null>(null);

  const quoteResult = useMemo(() => {
    try {
      return {
        quote:
          mode === "bag"
            ? calculateBagQuote({
                widthMm: lengthMm,
                heightMm: widthMm,
                gussetMm: heightMm,
                quantity,
                paper: bagPaper,
                gsm: bagGsm,
                handle,
                finishes,
                print,
              })
            : calculateQuote({
                referenceUnitPrice: Number(product.price),
                minOrderQty: product.minOrderQty || 1,
                lengthMm,
                widthMm,
                heightMm,
                quantity,
                material,
                thickness,
                finishes,
                print,
              }),
      };
    } catch (error) {
      return {
        error: error instanceof QuoteError ? error.message : t("quote.failed"),
      };
    }
  }, [
    mode,
    product.price,
    product.minOrderQty,
    bagPaper,
    bagGsm,
    handle,
    lengthMm,
    widthMm,
    heightMm,
    quantity,
    material,
    thickness,
    finishes,
    print,
    t,
  ]);

  const placeOrder = trpc.order.placeCustom.useMutation({
    onSuccess: data => {
      setPlaced(data);
      setCheckingOut(false);
    },
    onError: err => {
      toast.error(err.message || t("quote.failed"));
    },
  });

  const toggleFinish = (finish: FinishId) => {
    setFinishes(current =>
      current.includes(finish)
        ? current.filter(item => item !== finish)
        : [...current, finish]
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!("quote" in quoteResult)) {
      toast.error(quoteResult.error);
      return;
    }
    const name = contact.contactName || user?.name || "";
    const email = contact.email || user?.email || "";
    if (
      !name ||
      !email ||
      !contact.phone ||
      !contact.country ||
      !contact.state ||
      !contact.city ||
      !contact.address ||
      !contact.zipCode
    ) {
      toast.error(t("quote.failed"));
      return;
    }
    placeOrder.mutate({
      structure: mode,
      productId: product.id > 0 ? product.id : undefined,
      lengthMm,
      widthMm,
      heightMm,
      quantity,
      material,
      thickness,
      bagPaper: mode === "bag" ? bagPaper : undefined,
      bagGsm: mode === "bag" ? bagGsm : undefined,
      handle: mode === "bag" ? handle : undefined,
      finishes: mode === "bag" ? finishes.filter(item => item === "foil" || item === "spotUv") : finishes,
      print,
      shippingMethod,
      region,
      requirements: requirements.trim() || undefined,
      contactName: name,
      email,
      phone: contact.phone,
      country: contact.country,
      state: contact.state,
      city: contact.city,
      address: contact.address,
      zipCode: contact.zipCode,
      paymentMethod,
    });
  };

  if (placed) {
    const account =
      paymentMethod === "paypal" ? PAYPAL_ACCOUNT : ALIPAY_ACCOUNT;
    return (
      <Card className="mb-6 border-gold/30 bg-gold/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-gold-dark shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold">{t("quote.orderPlaced")}</h2>
              <p className="text-sm text-muted-foreground">
                {product.name} · {placed.orderNumber}
              </p>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>{t("quote.unitPrice")}</span>
              <span>{money(placed.quote.unitPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("quote.setupFee")}</span>
              <span>{money(placed.quote.setupFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("quote.shipping")}</span>
              <span>{money(placed.shipping.fee)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t("quote.orderTotal")}</span>
              <span>{money(placed.quote.total + placed.shipping.fee)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm mb-2">
              {t("quote.payAmount", {
                amount: (placed.quote.total + placed.shipping.fee).toFixed(2),
                method: paymentMethod === "paypal" ? "PayPal" : "Alipay",
              })}
            </p>
            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
              <span className="font-mono text-sm flex-1">{account}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(account);
                  toast.success(placed.orderNumber);
                }}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("quote.includeRef")}
            </p>
          </div>
          {isAuthenticated && (
            <Link href={`/order-confirmation/${placed.orderId}`}>
              <Button variant="outline" className="border-gold text-gold-dark">
                {placed.orderNumber}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  const quote = "quote" in quoteResult ? quoteResult.quote : null;
  const shipping = quote
    ? calculateShipping({
        lengthMm,
        widthMm: mode === "bag" ? heightMm : widthMm,
        heightMm: mode === "bag" ? widthMm : heightMm,
        quantity: quote.quantity,
        method: shippingMethod,
        region,
      })
    : null;

  return (
    <Card className="mb-6 border-gold/30">
      <CardContent className="p-5">
        <h2
          className="text-lg font-semibold mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("quote.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{t("quote.subtitle")}</p>
        <p className="text-xs text-muted-foreground mb-4">
          {t(mode === "bag" ? "quote.bagSizeHint" : "quote.sizeHint")}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <SizeField
            label={t(mode === "bag" ? "quote.bagWidth" : "quote.length")}
            value={lengthMm}
            onChange={setLengthMm}
          />
          <SizeField
            label={t(mode === "bag" ? "quote.bagHeight" : "quote.width")}
            value={widthMm}
            onChange={setWidthMm}
          />
          <SizeField
            label={t(mode === "bag" ? "quote.bagGusset" : "quote.height")}
            value={heightMm}
            onChange={setHeightMm}
          />
        </div>

        <label className="block text-sm mb-3">
          <span className="text-muted-foreground">{t("quote.quantity")}</span>
          <Input
            className="mt-1"
            type="number"
            min={1}
            value={quantity}
            onChange={event => setQuantity(Number(event.target.value))}
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <label className="block text-sm">
            <span className="text-muted-foreground">{t("quote.material")}</span>
            {mode === "bag" ? (
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={bagPaper}
                onChange={event => setBagPaper(event.target.value as BagPaperId)}
              >
                {BAG_PAPERS.map(item => (
                  <option key={item} value={item}>
                    {t(BAG_PAPER_KEY[item])}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={material}
                onChange={event => setMaterial(event.target.value as MaterialId)}
              >
                {PLATFORM_MATERIALS.map(item => (
                  <option key={item} value={item}>
                    {t(MATERIAL_KEY[item])}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">{t("quote.print")}</span>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={print}
              onChange={event => setPrint(event.target.value as PrintId)}
            >
              {PRINTS.map(item => (
                <option key={item} value={item}>
                  {t(PRINT_KEY[item])}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm mb-3">
          <span className="text-muted-foreground">
            {t(mode === "bag" ? "quote.bagGsm" : "quote.thickness")}
          </span>
          {mode === "bag" ? (
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={bagGsm}
              onChange={event => setBagGsm(event.target.value as BagGsmId)}
            >
              {BAG_GSMS.map(item => (
                <option key={item} value={item}>
                  {t(BAG_GSM_KEY[item])}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={thickness}
              onChange={event => setThickness(event.target.value as ThicknessId)}
            >
              {THICKNESSES.map(item => (
                <option key={item} value={item}>
                  {t(THICKNESS_KEY[item])}
                </option>
              ))}
            </select>
          )}
        </label>

        {mode === "bag" && (
          <label className="block text-sm mb-3">
            <span className="text-muted-foreground">{t("quote.handle")}</span>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={handle}
              onChange={event => setHandle(event.target.value as BagHandleId)}
            >
              {BAG_HANDLES.map(item => (
                <option key={item} value={item}>
                  {t(BAG_HANDLE_KEY[item])}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className="mb-3">
          <legend className="text-sm text-muted-foreground mb-2">
            {t("quote.finishes")}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(mode === "bag" ? (["foil", "spotUv"] as const) : FINISHES).map(finish => (
              <label key={finish} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={finishes.includes(finish)}
                  onChange={() => toggleFinish(finish)}
                />
                {t(FINISH_KEY[finish])}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm mb-4">
          <span className="text-muted-foreground">{t("quote.requirements")}</span>
          <Textarea
            className="mt-1"
            rows={3}
            value={requirements}
            placeholder={t("quote.requirementsPlaceholder")}
            onChange={event => setRequirements(event.target.value)}
          />
        </label>

        {quote ? (
          <div className="rounded-md bg-muted/40 p-3 mb-4 text-sm space-y-1">
            <p className="text-xs text-muted-foreground mb-2">
              {quote.sample
                ? t("quote.sample", { moq: product.minOrderQty || 1 })
                : t("quote.production", { moq: product.minOrderQty || 1 })}
            </p>
            <Row label={t("quote.unitPrice")} value={money(quote.unitPrice)} />
            <Row
              label={`${t("quote.goods")} × ${quote.quantity}`}
              value={money(quote.goodsTotal)}
            />
            <Row label={t("quote.setupFee")} value={money(quote.setupFee)} />
            <Row
              label={t("quote.leadTime")}
              value={t("quote.days", { range: quote.leadTimeDays })}
            />
            <p className="text-xs text-muted-foreground pt-1">
              {t("quote.excludesShipping")}
            </p>
            {shipping && (
              <>
                <Row
                  label={`${t("quote.shipping")} · ${shipping.chargeableKg} kg`}
                  value={money(shipping.fee)}
                />
                <Row
                  label={t("quote.shippingTime")}
                  value={t("quote.days", { range: shipping.days })}
                />
              </>
            )}
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>{t("quote.orderTotal")}</span>
              <span>{money(quote.total + (shipping?.fee ?? 0))}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-destructive mb-4">
            {"error" in quoteResult ? quoteResult.error : t("quote.failed")}
          </p>
        )}

        {!checkingOut ? (
          <Button
            type="button"
            className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
            disabled={!quote}
            onClick={() => {
              setContact(current => ({
                ...current,
                contactName: current.contactName || user?.name || "",
                email: current.email || user?.email || "",
              }));
              setCheckingOut(true);
            }}
          >
            {t("quote.placeOrder")}
          </Button>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h3 className="text-sm font-semibold">{t("quote.contact")}</h3>
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("quote.region")}</span>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={region}
                onChange={event => setRegion(event.target.value as RegionId)}
              >
                {REGIONS.map(item => (
                  <option key={item} value={item}>
                    {t(REGION_KEY[item])}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="text-sm text-muted-foreground mb-2">
                {t("quote.shipping")}
              </legend>
              <div className="space-y-2 text-sm">
                {SHIPPING_METHODS.map(method => (
                  <label key={method} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      className="mt-1"
                      checked={shippingMethod === method}
                      onChange={() => setShippingMethod(method)}
                    />
                    <span>
                      {t(
                        method === "freight"
                          ? "quote.shippingFreight"
                          : "quote.shippingExpress"
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {t(
                          method === "freight"
                            ? "quote.shippingFreightHint"
                            : "quote.shippingExpressHint"
                        )}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label={t("quote.name")}
                value={contact.contactName}
                onChange={value =>
                  setContact(current => ({ ...current, contactName: value }))
                }
              />
              <Field
                label={t("quote.email")}
                type="email"
                value={contact.email}
                onChange={value =>
                  setContact(current => ({ ...current, email: value }))
                }
              />
              <Field
                label={t("quote.phone")}
                value={contact.phone}
                onChange={value =>
                  setContact(current => ({ ...current, phone: value }))
                }
              />
              <Field
                label={t("quote.country")}
                value={contact.country}
                onChange={value =>
                  setContact(current => ({ ...current, country: value }))
                }
              />
              <Field
                label={t("quote.state")}
                value={contact.state}
                onChange={value =>
                  setContact(current => ({ ...current, state: value }))
                }
              />
              <Field
                label={t("quote.city")}
                value={contact.city}
                onChange={value =>
                  setContact(current => ({ ...current, city: value }))
                }
              />
            </div>
            <Field
              label={t("quote.address")}
              value={contact.address}
              onChange={value =>
                setContact(current => ({ ...current, address: value }))
              }
            />
            <Field
              label={t("quote.zip")}
              value={contact.zipCode}
              onChange={value =>
                setContact(current => ({ ...current, zipCode: value }))
              }
            />
            <fieldset>
              <legend className="text-sm text-muted-foreground mb-2">
                {t("quote.payment")}
              </legend>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  PayPal
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "alipay"}
                    onChange={() => setPaymentMethod("alipay")}
                  />
                  Alipay
                </label>
              </div>
            </fieldset>
            <Button
              type="submit"
              className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
              disabled={placeOrder.isPending || !quote}
            >
              {placeOrder.isPending ? t("quote.placing") : t("quote.placeOrder")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function SizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input
        className="mt-1"
        type="number"
        min={1}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input
        className="mt-1"
        type={type}
        value={value}
        required
        onChange={event => onChange(event.target.value)}
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
