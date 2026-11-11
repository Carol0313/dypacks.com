import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ALIPAY_ACCOUNT, PAYPAL_ACCOUNT } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import {
  FINISHES,
  MATERIALS,
  PRINTS,
  QuoteError,
  calculateQuote,
  type FinishId,
  type MaterialId,
  type PrintId,
  type Quote,
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

const MATERIAL_KEY: Record<MaterialId, string> = {
  standard: "quote.materialStandard",
  thick: "quote.materialThick",
  kraft: "quote.materialKraft",
  specialty: "quote.materialSpecialty",
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

export default function CustomOrder({ product }: { product: ProductQuoteSource }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [lengthMm, setLengthMm] = useState(200);
  const [widthMm, setWidthMm] = useState(150);
  const [heightMm, setHeightMm] = useState(60);
  const [quantity, setQuantity] = useState(Math.max(1, product.minOrderQty || 1));
  const [material, setMaterial] = useState<MaterialId>("standard");
  const [print, setPrint] = useState<PrintId>("cmyk");
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
  } | null>(null);

  const quoteResult = useMemo(() => {
    try {
      return {
        quote: calculateQuote({
          referenceUnitPrice: Number(product.price),
          minOrderQty: product.minOrderQty || 1,
          lengthMm,
          widthMm,
          heightMm,
          quantity,
          material,
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
    product.price,
    product.minOrderQty,
    lengthMm,
    widthMm,
    heightMm,
    quantity,
    material,
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
      productId: product.id,
      lengthMm,
      widthMm,
      heightMm,
      quantity,
      material,
      finishes,
      print,
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
            <div className="flex justify-between font-semibold">
              <span>{t("quote.orderTotal")}</span>
              <span>{money(placed.quote.total)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm mb-2">
              {t("quote.payAmount", {
                amount: placed.quote.total.toFixed(2),
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
        <p className="text-xs text-muted-foreground mb-4">{t("quote.sizeHint")}</p>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <SizeField
            label={t("quote.length")}
            value={lengthMm}
            onChange={setLengthMm}
          />
          <SizeField
            label={t("quote.width")}
            value={widthMm}
            onChange={setWidthMm}
          />
          <SizeField
            label={t("quote.height")}
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
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={material}
              onChange={event => setMaterial(event.target.value as MaterialId)}
            >
              {MATERIALS.map(item => (
                <option key={item} value={item}>
                  {t(MATERIAL_KEY[item])}
                </option>
              ))}
            </select>
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

        <fieldset className="mb-3">
          <legend className="text-sm text-muted-foreground mb-2">
            {t("quote.finishes")}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {FINISHES.map(finish => (
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
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>{t("quote.orderTotal")}</span>
              <span>{money(quote.total)}</span>
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
