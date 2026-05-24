import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: t("about.yearsExperience"), label: t("about.yearsLabel") },
    { value: t("about.globalClients"), label: t("about.clientsLabel") },
    { value: t("about.countriesServed"), label: t("about.countriesLabel") },
    { value: t("about.isoCertified"), label: t("about.certified") },
  ];

  const values = [
    { title: t("about.qualityFirst"), desc: t("about.qualityDesc") },
    { title: t("about.innovation"), desc: t("about.innovationDesc") },
    { title: t("about.customerFocus"), desc: t("about.customerFocusDesc") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-charcoal-dark py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            {t("about.about")} <span className="text-gold">{t("about.dyPacks")}</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("about.dyPacks")} {t("about.professionalDescription")}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {t("about.ourStory")}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t("about.foundedPassion")}</p>
                <p>{t("about.specializeIn")}</p>
                <p>{t("about.everyProject")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">{t("about.ourFacility")}</span>
              </div>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mt-8">
                <span className="text-muted-foreground text-sm">{t("about.ourProducts")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/30">
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

      {/* Core Values */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("about.coreValues")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div key={i} className="text-center p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal-dark py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("about.letsCreate")} <span className="text-gold">{t("about.amazing")}</span> {t("about.together")}
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8">
            {t("about.smallBatchOrLarge")}
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold px-8">
              {t("about.getInTouch")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
