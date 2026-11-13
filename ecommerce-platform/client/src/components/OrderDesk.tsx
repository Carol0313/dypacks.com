import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomOrder from "@/components/CustomOrder";
import { trpc } from "@/lib/trpc";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { BAG_MOQ, BAG_REFERENCE_UNIT_USD, BAG_STYLE_MM, type BagStyleId } from "@shared/quote";

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
  const [structure, setStructure] = useState<"box" | "bag">("box");
  const [bagStyle, setBagStyle] = useState<BagStyleId>("shopping");
  const [productId, setProductId] = useState<number | null>(null);
  const selected = products.find(product => product.id === productId) ?? null;
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current && products[0]) {
      opened.current = true;
      setProductId(products[0].id);
    }
  }, [products]);

  const bagSize = BAG_STYLE_MM[bagStyle];

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-8 items-start">
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("quote.stepStructure")}</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {(["box", "bag"] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setStructure(item)}
              className={`text-left rounded-lg border p-4 ${
                structure === item
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-gold/50"
              }`}
            >
              <span className="block text-sm font-medium">
                {t(item === "box" ? "quote.structureBox" : "quote.structureBag")}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                {t(item === "box" ? "quote.structureBoxHint" : "quote.structureBagHint")}
              </span>
            </button>
          ))}
        </div>

        {structure === "bag" ? (
          <div className="grid sm:grid-cols-3 gap-3">
            {(["shopping", "boutique", "grocery"] as const).map(style => (
              <button
                key={style}
                type="button"
                onClick={() => setBagStyle(style)}
                className={`text-left rounded-lg border p-3 text-sm ${
                  bagStyle === style
                    ? "border-gold bg-gold/5"
                    : "border-border hover:border-gold/50"
                }`}
              >
                {t(`quote.bagStyle${style[0].toUpperCase()}${style.slice(1)}`)}
                <span className="block text-xs text-muted-foreground mt-1">
                  {BAG_STYLE_MM[style].width}×{BAG_STYLE_MM[style].height}×
                  {BAG_STYLE_MM[style].gusset} mm
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>

      <aside className="lg:sticky lg:top-24">
        {structure === "bag" ? (
          <CustomOrder
            key={bagStyle}
            mode="bag"
            initialSize={{
              length: bagSize.width,
              width: bagSize.height,
              height: bagSize.gusset,
            }}
            product={{
              id: 0,
              name: t("quote.structureBag"),
              price: BAG_REFERENCE_UNIT_USD,
              minOrderQty: BAG_MOQ,
            }}
          />
        ) : selected ? (
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
