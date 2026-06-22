import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Package, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderHistory() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const ordersQuery = trpc.order.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const orders = ordersQuery.data ?? [];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <Link
          href="/account"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("orderHistory.backToAccount")}
        </Link>

        <h1
          className="text-2xl md:text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("orderHistory.myOrders")}
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {t("orderHistory.noOrdersYet")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("orderHistory.startShopping")}
            </p>
            <Link href="/products">
              <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
                {t("orderHistory.browseProducts")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="border-border/50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {order.orderNumber}
                        </span>
                        <Badge className={statusColors[order.status] || ""}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                        {" · "}
                        {order.paymentMethod === "paypal" ? "PayPal" : "Alipay"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      <Link href={`/order-confirmation/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          {t("orderHistory.view")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
