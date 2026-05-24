import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { User, ClipboardList, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Account() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  if (!isAuthenticated) return null;

  const menuItems = [
    { href: "/account/orders", icon: ClipboardList, title: t("account.myOrders"), desc: t("account.viewOrderHistory") },
    { href: "/account/addresses", icon: MapPin, title: t("account.addresses"), desc: t("account.manageShipping") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8" style={{ fontFamily: "var(--font-heading)" }}>
          {t("account.myAccount")}
        </h1>

        <Card className="border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <User className="h-7 w-7 text-gold-dark" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{user?.name || t("account.user")}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || t("account.noEmail")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="border-border/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-gold-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
