import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderDesk from "@/components/OrderDesk";
import { usePageSEO } from "@/lib/seo";

export default function Order() {
  const { t } = useTranslation();

  usePageSEO({
    title: t("quote.platformTitle"),
    description: t("quote.platformSubtitle"),
    canonicalPath: "/order",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-secondary/40 border-b border-border">
          <div className="container py-10 md:py-14 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
              DY Packs
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("quote.platformTitle")}
            </h1>
            <p className="text-muted-foreground">{t("quote.platformSubtitle")}</p>
          </div>
        </section>
        <div className="container py-8 md:py-12">
          <OrderDesk />
        </div>
      </main>
      <Footer />
    </div>
  );
}
