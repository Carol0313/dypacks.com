import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY_NAME, CONTACT_EMAIL } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";
import { useTranslation } from "react-i18next";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  const { t } = useTranslation();

  const faqItems = [
    { question: t("contact.faq1Question"), answer: t("contact.faq1Answer") },
    { question: t("contact.faq2Question"), answer: t("contact.faq2Answer") },
    { question: t("contact.faq3Question"), answer: t("contact.faq3Answer") },
    { question: t("contact.faq4Question"), answer: t("contact.faq4Answer") },
    { question: t("contact.faq5Question"), answer: t("contact.faq5Answer") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema items={[{ name: t("contact.home"), url: "/" }, { name: t("contact.contact"), url: "/contact" }]} />
      <Navbar />

      {/* Hero */}
      <section className="bg-charcoal-dark py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("contact.contactUs")}
          </h1>
          <p className="text-white/60">
            {t("contact.getInTouchTeam")}
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              {t("contact.getInTouch")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t("contact.loveToHear")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("contact.address")}</h3>
                  <p className="text-sm text-muted-foreground">{COMPANY_NAME}<br />{t("footer.shanghaiChina")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("contact.email")}</h3>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-gold-dark hover:underline">{CONTACT_EMAIL}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("contact.businessHours")}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{t("contact.businessHoursValue")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("contact.quickResponse")}</h3>
                  <p className="text-sm text-muted-foreground">{t("contact.respond24Hours")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              {t("contact.sendMessage")}
            </h2>
            <ContactForm source="contact_page" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
