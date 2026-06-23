import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Link, useLocation } from "wouter";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";

export default function Cart() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const cartItems = cartQuery.data ?? [];

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
  });
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      toast.success(t("cart.itemRemoved"));
    },
  });
  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      toast.success(t("cart.cartCleared"));
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  usePageSEO({
    title: t("cart.shoppingCart") + " | DY Packs",
    canonicalPath: "/cart",
    noIndex: true,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        <h1
          className="text-2xl md:text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("cart.shoppingCart")}
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t("cart.cartEmpty")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("cart.browseProductsAdd")}
            </p>
            <Link href="/products">
              <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
                {t("cart.continueShopping")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                if (!item.product) return null;
                const images = item.product.images
                  ? JSON.parse(item.product.images)
                  : [];
                const mainImage = images[0] || PLACEHOLDER_IMAGE;
                return (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/product/${item.product.slug}`}>
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-muted shrink-0">
                            <img
                              src={mainImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product.slug}`}>
                            <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-gold-dark transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm font-bold text-foreground mt-1">
                            ${Number(item.product.price).toFixed(2)}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => {
                                  if (item.quantity <= 1) return;
                                  updateMutation.mutate({
                                    id: item.id,
                                    quantity: item.quantity - 1,
                                  });
                                }}
                                className="px-2 py-1 hover:bg-muted transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: item.id,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                className="px-2 py-1 hover:bg-muted transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-foreground">
                                $
                                {(
                                  Number(item.product.price) * item.quantity
                                ).toFixed(2)}
                              </span>
                              <button
                                onClick={() =>
                                  removeMutation.mutate({ id: item.id })
                                }
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => clearMutation.mutate()}
                >
                  {t("common.delete")} {t("cart.shoppingCart")}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {t("cart.orderSummary")}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("cart.subtotal")}
                        {cartItems.length} {t("cart.items")}
                      </span>
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("cart.shipping")}
                      </span>
                      <span className="text-muted-foreground">
                        {t("cart.calculatedAtCheckout")}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-base font-bold mb-6">
                    <span>{t("cart.total")}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
                    onClick={() => setLocation("/checkout")}
                  >
                    {t("cart.proceedToCheckout")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/products">
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-muted-foreground"
                    >
                      {t("cart.continueShopping")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
