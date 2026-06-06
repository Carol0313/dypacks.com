import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Link, useSearch } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Products() {
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(useSearch());
  const categorySlug = searchParams.get("category") || "";
  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug);
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory]);

  const categoriesQuery = trpc.category.list.useQuery();
  const categories = categoriesQuery.data ?? [];

  const selectedCat = useMemo(
    () => categories.find((c) => c.slug === selectedCategory),
    [categories, selectedCategory]
  );

  const productsQuery = trpc.product.list.useQuery({
    categoryId: selectedCat?.id,
    search: debouncedSearch || undefined,
    status: "active",
    page,
    limit,
  });

  const products = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const ratingsQuery = trpc.review.batchRatingStats.useQuery(
    { productIds },
    { enabled: productIds.length > 0 }
  );
  const ratingsMap = ratingsQuery.data ?? {};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-charcoal-dark py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {selectedCat ? selectedCat.name : t("products.allProducts")}
          </h1>
          <p className="text-white/60">
            {selectedCat?.description || t("products.browseRange")}
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("products.searchProducts")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t("products.categories")}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    !selectedCategory ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {t("products.allProducts")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedCategory === cat.slug ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {total} {total !== 1 ? t("products.productsFound") : t("products.productFound")} {t("products.found")}
              </p>
            </div>

            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">{t("products.noProductsFound")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("products.tryAdjusting")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => {
                    const images = product.images ? JSON.parse(product.images) : [];
                    const mainImage = images[0] || PLACEHOLDER_IMAGE;
                    return (
                      <Link key={product.id} href={`/product/${product.slug}`}>
                        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50">
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img
                              src={mainImage}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                              {product.name}
                            </h3>
                            {product.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                {product.shortDescription}
                              </p>
                            )}
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm text-muted-foreground">
                                {t("products.from")} <span className="text-base font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
                              </span>
                            </div>
                            {product.minOrderQty > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">{t("products.moq")} {product.minOrderQty} {t("products.pcs")}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      {t("products.page")} {page} {t("products.of")} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
