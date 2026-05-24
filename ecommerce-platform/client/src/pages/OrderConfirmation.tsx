import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDER_IMAGE, ALIPAY_ACCOUNT, PAYPAL_ACCOUNT } from "@/lib/constants";
import { useRoute, Link } from "wouter";
import { CheckCircle, Package, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function OrderConfirmation() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, params] = useRoute("/order-confirmation/:id");
  const orderId = Number(params?.id);

  const orderQuery = trpc.order.getById.useQuery({ id: orderId }, { enabled: isAuthenticated && !!orderId });
  const order = orderQuery.data;

  if (!isAuthenticated) return null;

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 bg-muted rounded-full mx-auto" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center flex-1">
          <h2 className="text-xl font-semibold mb-2">{t("orderConfirmation.orderNotFound")}</h2>
          <Link href="/account/orders"><Button>{t("orderConfirmation.viewMyOrders")}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const paymentAccount = order.paymentMethod === "paypal" ? PAYPAL_ACCOUNT : ALIPAY_ACCOUNT;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("orderConfirmation.orderPlacedSuccess")}
          </h1>
          <p className="text-muted-foreground">
            {t("orderConfirmation.thankYouOrder")}{" "}
            <span className="font-semibold text-foreground">{order.orderNumber}</span>
          </p>
        </div>

        <Card className="border-gold/30 bg-gold/5 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("orderConfirmation.paymentInstructions")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("orderConfirmation.pleaseCompletePayment")} {order.paymentMethod === "paypal" ? "PayPal" : "Alipay"} {t("orderConfirmation.toFollowingAccount")}
            </p>
            <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
              <span className="text-sm font-mono font-medium flex-1">{paymentAccount}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(paymentAccount); toast.success(t("orderConfirmation.copied")); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t("orderConfirmation.includeOrderNumber")} <span className="font-semibold text-foreground">{order.orderNumber}</span> {t("orderConfirmation.paymentReference")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("orderConfirmation.orderDetails")}</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => {
                const product = item.product;
                if (!product) return null;
                const images = product.images ? JSON.parse(product.images) : [];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0">
                      <img src={images[0] || PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{t("orderConfirmation.qty")} {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">${(Number(product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("orderConfirmation.subtotal")}</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("orderConfirmation.shipping")}</span><span className="text-muted-foreground">{order.shippingFee ? `$${Number(order.shippingFee).toFixed(2)}` : "—"}</span></div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-base font-bold"><span>{t("orderConfirmation.total")}</span><span>${Number(order.total).toFixed(2)}</span></div>
          </CardContent>
        </Card>

        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold mb-2">{t("orderConfirmation.shippingAddress")}</h4>
          <p className="text-sm text-muted-foreground">{order.shippingName}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          <p className="text-sm text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</p>
          <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("orderConfirmation.phone")} {order.shippingPhone}</p>
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/account/orders"><Button variant="outline">{t("orderConfirmation.viewMyOrders")}</Button></Link>
          <Link href="/products"><Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">{t("orderConfirmation.continueShopping")}</Button></Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
