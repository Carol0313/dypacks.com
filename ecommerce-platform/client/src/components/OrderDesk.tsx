import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomOrder from "@/components/CustomOrder";
import { trpc } from "@/lib/trpc";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

function productImage(images: string | null) {
  if (!images) return PLACEHOLDER_IMAGE;
  try {
    const parsed = JSON.parse(images) as unknown;
    if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]) {
      return parsed[0];
    }
  } catch {
    return PLACEHOLDER_IMAGE;
  }
  return PLACEHOLDER_IMAGE;
}

export default function OrderDesk() {
  const { t } = useTranslation();
  const productsQuery = trpc.product.list.useQuery({
    status: "active",
    limit: 12,
  });
  const products = productsQuery.data?.items ?? [];
  const [productId, setProductId] = useState<number | null>(null);
  const selected = products.find(product => product.id === productId) ?? null;
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current && products[0]) {
      opened.current = true;
      setProductId(products[0].id);
    }
  }, [products]);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-8 items-start">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("quote.chooseBox")}</h2>
          {selected && (
            <Button variant="ghost" size="sm" onClick={() => setProductId(null)}>
              {t("quote.changeBox")}
            </Button>
          )}
        </div>
        {productsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">...</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {products.map(product => {
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
                  src={productImage(product.images)}
                  alt=""
                  className="w-16 h-16 rounded object-cover bg-muted shrink-0"
                />
                <span>
                  <span className="block text-sm font-medium">{product.name}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    ${Number(product.price).toFixed(2)} · MOQ {product.minOrderQty}
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
  );
}
