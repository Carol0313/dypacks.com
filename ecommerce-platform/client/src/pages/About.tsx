import { Button } from "'components/ui/button"' (see below for file content);
import { Card, CardContent } from "'components/ui/card"' (see below for file content);
import { Link } from "wouter";
import { Shield, Award, Users, Globe, ChevronRight } from "lucide-react";
import Navbar from "'components/Navbar"' (see below for file content);
import Footer from "'components/Footer"' (see below for file content);
import ContactForm from "'components/ContactForm"' (see below for file content);
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: "15+", label: t("about.yearsExperience") },
    { value: "500+", label: t("about.clientsServed") },
    { value: "2000+", label: t("about.productsDelivered") },
    { value: "50+", label: t("about.countriesReached") },
  ];

  const values = [
    { icon: Shield, title: t("about.qualityFirst"), desc: t("about.qualityFirstDesc") },
    { icon: Award, title: t("about.innovation"), desc: t("about.innovationDesc") },
    { icon: Users, title: t("about.customerCentric"), desc: t("about.customerCentricDesc") },
    { icon: Globe, title: t("about.sustainability"), desc: t("about.sustainabilityDesc") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-dark py-20 md:py-28">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            {t("about.ourStory")}
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("about.heroDescription")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gold/5 border-y border-gold/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gold-dark mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {t("about.whoWeAre")}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t("about.whoWeAreP1")}</p>
                <p>{t("about.whoWeAreP2")}</p>
                <p>{t("about.whoWeAreP3")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-lg bg-muted overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"
                    alt="Factory"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&q=80"
                    alt="Quality Control"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("about.ourValues")}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("about.valuesDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Card key={i} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <v.icon className="h-7 w-7 text-gold-dark" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Inquiry Form */}
      <section className="py-16 md:py-20 bg-charcoal-dark">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {t("about.readyToPartner")}
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                {t("about.partnerDescription")}
              </p>
              <div className="flex gap-3">
                <Link href="/contact">
                  <Button size="lg" className="bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold px-8">
                    {t("about.contactUs")}
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    {t("about.browseProducts")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 text-center" style={{ fontFamily: "var(--font-heading)" }}>
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
