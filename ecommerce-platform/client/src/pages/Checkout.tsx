import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLACEHOLDER_IMAGE, ALIPAY_ACCOUNT, PAYPAL_ACCOUNT } from "@/lib/constants";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Checkout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const addressQuery = trpc.address.list.useQuery(undefined, { enabled: isAuthenticated });
  const cartItems = cartQuery.data ?? [];
  const addresses = addressQuery.data ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const [paymentMethod, setPaymentMethod] = useState<"alipay" | "paypal">("paypal");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    note: "",
  });

  useEffect(() => {
    if (defaultAddress) {
      setForm({
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        country: defaultAddress.country,
        state: defaultAddress.state,
        city: defaultAddress.city,
        address: defaultAddress.address,
        zipCode: defaultAddress.zipCode,
        note: "",
      });
    }
  }, [defaultAddress]);

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data) => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      toast.success(t("checkout.orderPlacedSuccess"));
      setLocation(`/order-confirmation/${data.orderId}`);
    },
    onError: (err) => {
      toast.error(err.message || t("checkout.failedPlaceOrder"));
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.country || !form.address || !form.zipCode) {
      toast.error(t("checkout.fillRequiredFields"));
      return;
    }
    createOrderMutation.mutate({
      paymentMethod,
      shippingName: form.fullName,
      shippingPhone: form.phone,
      shippingCountry: form.country,
      shippingState: form.state,
      shippingCity: form.city,
      shippingAddress: form.address,
      shippingZipCode: form.zipCode,
      note: form.note || undefined,
    });
  };

  if (!isAuthenticated) return null;

  if (cartItems.length === 0 && !cartQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center flex-1">
          <h2 className="text-xl font-semibold mb-2">{t("checkout.cartEmpty")}</h2>
          <Link href="/products"><Button>{t("checkout.browseProducts")}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        <Link href="/cart" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("checkout.backToCart")}
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8" style={{ fontFamily: "var(--font-heading)" }}>
          {t("checkout.checkout")}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t("checkout.shippingAddress")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">{t("checkout.fullName")} *</Label>
                      <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("checkout.phone")} *</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="country">{t("checkout.country")} *</Label>
                      <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="state">{t("checkout.stateProvince")}</Label>
                      <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="city">{t("checkout.city")}</Label>
                      <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{t("checkout.zipPostal")} *</Label>
                      <Input id="zipCode" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">{t("checkout.streetAddress")} *</Label>
                      <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="note">{t("checkout.orderNotes")}</Label>
                      <Textarea id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("checkout.specialInstructions")} rows={3} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t("checkout.paymentMethod")}</h3>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "alipay" | "paypal")}>
                    <div className="space-y-3">
                      <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "paypal" ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                        <RadioGroupItem value="paypal" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{t("checkout.paypal")}</p>
                          <p className="text-xs text-muted-foreground">{t("checkout.paySecurelyPaypal")} ({PAYPAL_ACCOUNT})</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "alipay" ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                        <RadioGroupItem value="alipay" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{t("checkout.alipay")}</p>
                          <p className="text-xs text-muted-foreground">{t("checkout.payWithAlipay")} ({ALIPAY_ACCOUNT})</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t("checkout.orderSummary")}</h3>
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => {
                      if (!item.product) return null;
                      const images = item.product.images ? JSON.parse(item.product.images) : [];
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                            <img src={images[0] || PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{t("checkout.qty")} {item.quantity}</p>
                          </div>
                          <span className="text-xs font-medium shrink-0">
                            ${(Number(item.product.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                      <span className="text-muted-foreground">{t("checkout.toBeConfirmed")}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-base font-bold mb-6">
                    <span>{t("checkout.total")}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("checkout.processing")}</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" />{t("checkout.placeOrder")}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
