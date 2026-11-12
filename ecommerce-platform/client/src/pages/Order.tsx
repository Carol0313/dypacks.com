import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomOrder from "@/components/CustomOrder";
import { trpc } from "@/lib/trpc";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/lib/seo";

export default function Order() {
  const { t } = useTranslation();
  const productsQuery = trpc.product.list.useQuery({
    status: "active",
    limit: 24,
  });
  const products = productsQuery.data?.items ?? [];
  const [productId, setProductId] = useState<number | null>(null);
  const selected = products.find(product => product.id === productId) ?? null;

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
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-8 items-start">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("quote.chooseBox")}</h2>
                {selected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProductId(null)}
                  >
                    {t("quote.changeBox")}
                  </Button>
                )}
              </div>
              {productsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">...</p>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {products.map(product => {
                  const image = product.images
                    ? (JSON.parse(product.images)[0] as string)
                    : PLACEHOLDER_IMAGE;
                  const active = product.id === productId;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setProductId(product.id)}
                      className={`text-left rounded-lg border p-3 flex gap-3 transition-colors ${
                        active
                          ? "border-gold bg-gold/5"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <img
                        src={image || PLACEHOLDER_IMAGE}
                        alt=""
                        className="w-16 h-16 rounded object-cover bg-muted shrink-0"
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {product.name}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          ${Number(product.price).toFixed(2)} · MOQ{" "}
                          {product.minOrderQty}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              {selected ? (
                <CustomOrder
                  key={selected.id}
                  product={{
                    id: selected.id,
                    name: selected.name,
                    price: selected.price,
                    minOrderQty: selected.minOrderQty,
                  }}
                />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {t("quote.chooseBox")}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
