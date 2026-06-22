import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Shield,
  Award,
  Users,
  Leaf,
  Package,
  Truck,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { useTranslation } from "react-i18next";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import { usePageSEO } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";

export default function About() {
  const { t } = useTranslation();

  usePageSEO({
    title: "About DY Packs | Custom Packaging Manufacturer in China",
    description:
      "Learn about DY Packs (Shanghai Douyue Industrial Co., Ltd). 15+ years of custom packaging manufacturing for global brands. Low MOQ, ISO certified.",
    keywords:
      "custom packaging manufacturer China, packaging company Shanghai, DY Packs about, luxury packaging manufacturer, rigid box factory",
    canonicalPath: "/about",
  });

  const stats = [
    { value: "15+", label: t("about.yearsExperience") },
    { value: "500+", label: t("about.clientsServed") },
    { value: "2000+", label: t("about.productsDelivered") },
    { value: "50+", label: t("about.countriesReached") },
  ];

  const solutions = [
    {
      icon: Package,
      title: t("about.solutionLowMoqTitle"),
      desc: t("about.solutionLowMoqDesc"),
    },
    {
      icon: Shield,
      title: t("about.solutionReliableTitle"),
      desc: t("about.solutionReliableDesc"),
    },
    {
      icon: Award,
      title: t("about.solutionBrandingTitle"),
      desc: t("about.solutionBrandingDesc"),
    },
    {
      icon: Leaf,
      title: t("about.solutionEcoTitle"),
      desc: t("about.solutionEcoDesc"),
    },
    {
      icon: Truck,
      title: t("about.solutionShippingTitle"),
      desc: t("about.solutionShippingDesc"),
    },
    {
      icon: Users,
      title: t("about.solutionServiceTitle"),
      desc: t("about.solutionServiceDesc"),
    },
  ];

  const capabilities = [
    t("about.capabilityGift"),
    t("about.capabilityCosmetic"),
    t("about.capabilityJewelry"),
    t("about.capabilityFood"),
    t("about.capabilityEco"),
    t("about.capabilityInserts"),
  ];

  const values = [
    {
      icon: Shield,
      title: t("about.qualityFirst"),
      desc: t("about.qualityFirstDesc"),
    },
    {
      icon: Award,
      title: t("about.innovation"),
      desc: t("about.innovationDesc"),
    },
    {
      icon: Users,
      title: t("about.customerCentric"),
      desc: t("about.customerCentricDesc"),
    },
    {
      icon: Leaf,
      title: t("about.sustainability"),
      desc: t("about.sustainabilityDesc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbSchema
        items={[
          { name: t("navbar.home"), url: "/" },
          { name: t("navbar.about"), url: "/about" },
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-dark py-24 md:py-32">
        <div className="container text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("about.title")}
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gold/5 border-y border-gold/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gold-dark mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="text-gold-dark font-semibold tracking-wide uppercase text-sm">
                {t("about.since")}
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("about.whoWeAre")}
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>{t("about.whoWeAreP1")}</p>
                <p>{t("about.whoWeAreP2")}</p>
                <p>{t("about.whoWeAreP3")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted shadow-lg">
                <img
                  src={getOptimizedImageUrl("https://dypacks-images.oss-cn-shanghai.aliyuncs.com/static/images/about/facility.jpg", 800)}
                  alt={t("about.facilityAlt")}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted shadow-lg mt-10">
                <img
                  src={getOptimizedImageUrl("https://dypacks-images.oss-cn-shanghai.aliyuncs.com/static/images/about/production.jpg", 800)}
                  alt={t("about.productionAlt")}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-gold-dark font-semibold tracking-wide uppercase text-sm">
              {t("about.solutionsLabel")}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("about.solutionsTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.solutionsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((item, i) => (
              <Card
                key={i}
                className="border-border/50 hover:shadow-lg transition-shadow h-full"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
                    <item.icon className="h-7 w-7 text-gold-dark" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-5">
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
                  <img
                    src={getOptimizedImageUrl("https://dypacks-images.oss-cn-shanghai.aliyuncs.com/static/images/about/materials.jpg", 800)}
                    alt={t("about.materialsAlt")}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg mt-10">
                  <img
                    src={getOptimizedImageUrl("https://dypacks-images.oss-cn-shanghai.aliyuncs.com/static/images/about/products.jpg", 800)}
                    alt={t("about.productsAlt")}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-gold-dark font-semibold tracking-wide uppercase text-sm">
                {t("about.capabilitiesLabel")}
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("about.capabilitiesTitle")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t("about.capabilitiesDesc")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("about.ourValues")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.valuesDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <Card
                key={i}
                className="border-border/50 hover:shadow-lg transition-shadow h-full"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center">
                    <v.icon className="h-8 w-8 text-gold-dark" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Inquiry Form */}
      <section className="py-20 md:py-28 bg-charcoal-dark">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("about.readyToPartner")}
              </h2>
              <p className="text-white/70 leading-relaxed mb-8">
                {t("about.partnerDescription")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold px-8"
                  >
                    {t("about.contactUs")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {t("about.browseProducts")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3
                className="text-xl font-bold text-white mb-5 text-center"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("about.sendInquiry")}
              </h3>
              <ContactForm source="about_page" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
