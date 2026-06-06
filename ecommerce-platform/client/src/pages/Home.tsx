import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  PLACEHOLDER_IMAGE,
  SHOWCASE_IMAGE_1,
  SHOWCASE_IMAGE_2,
  SHOWCASE_IMAGE_3,
  SHOWCASE_IMAGE_4,
} from "@/lib/constants";
import { Link } from "wouter";
import { Package, Shield, Truck, Star, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { OrganizationSchema, WebSiteSchema } from "@/components/SchemaMarkup";
import HeroCarousel from "@/components/HeroCarousel";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const categoriesQuery = trpc.category.list.useQuery();
  const featuredQuery = trpc.product.list.useQuery({ featured: true, status: "active", limit: 8 });

  const categories = categoriesQuery.data ?? [];
  const featuredProducts = featuredQuery.data?.items ?? [];

  const features = [
    { icon: Package, title: t("home.customDesign"), desc: t("home.tailoredToYourBrand") },
    { icon: Shield, title: t("home.qualityAssured"), desc: t("home.premiumMaterials") },
    { icon: Truck, title: t("home.globalShipping"), desc: t("home.worldwideDelivery") },
    { icon: Star, title: t("home.expertService"), desc: t("home.yearsExperience") },
  ];

  const defaultCategories = [
    t("home.giftBoxes"),
    t("home.cosmeticPackaging"),
    t("home.foodPackaging"),
    t("home.jewelryBoxes"),
    t("home.luxuryPackaging"),
  ];

  const whyChooseItems = [
    t("home.isoCertified"),
    t("home.customDesigns"),
    t("home.ecoFriendly"),
    t("home.competitivePricing"),
    t("home.fastTurnaround"),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <WebSiteSchema />
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features Bar */}
      <section className="border-b bg-background">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("home.ourCategories")}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("home.exploreRange")}
            </p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50">
                    <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-charcoal/5">
                          <Package className="h-12 w-12 text-gold/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
                        {cat.description && (
                          <p className="text-sm text-white/70 line-clamp-2">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultCategories.map((name) => (
                <Card key={name} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <Package className="h-8 w-8 text-gold-dark" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  {t("home.featuredProducts")}
                </h2>
                <p className="text-muted-foreground">
                  {t("home.handpickedSelections")}
                </p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="hidden md:flex text-muted-foreground hover:text-foreground">
                  {t("home.viewAll")}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => {
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
                        <p className="text-sm text-muted-foreground">
                          {t("home.from")} <span className="text-base font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
                        </p>
                        {product.minOrderQty > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("home.moq")} {product.minOrderQty} {t("home.pcs")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link href="/products">
                <Button variant="outline">
                  {t("home.viewAllProducts")}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About / CTA Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={SHOWCASE_IMAGE_1}
                alt={t("home.customPackaging")}
                loading="lazy"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <img
                src={SHOWCASE_IMAGE_2}
                alt={t("home.customPackaging")}
                loading="lazy"
                className="rounded-lg shadow-md w-full h-48 object-cover mt-8"
              />
              <img
                src={SHOWCASE_IMAGE_3}
                alt={t("home.customPackaging")}
                loading="lazy"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <img
                src={SHOWCASE_IMAGE_4}
                alt={t("home.customPackaging")}
                loading="lazy"
                className="rounded-lg shadow-md w-full h-48 object-cover mt-8"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {t("home.whyChoose")} <span className="text-gold-dark">{t("home.dyPacks")}</span>?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("home.experienceDescription")}
              </p>
              <ul className="space-y-3 mb-8">
                {whyChooseItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Link href="/about">
                  <Button className="bg-charcoal text-white hover:bg-charcoal-dark">
                    {t("home.learnMore")}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">
                    {t("home.getInTouch")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-charcoal-dark py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("home.readyToCreate")} <span className="text-gold">{t("home.customPackaging")}</span>?
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8">
            {t("home.freeQuoteDescription")}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/contact">
              <Button size="lg" className="bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold px-8">
                {t("home.requestQuote")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
