import {
  BRAND_NAME,
  COMPANY_NAME,
  LOGO_URL,
  CONTACT_EMAIL,
} from "@/lib/constants";
import { Link } from "wouter";
import { Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { href: "/products", label: t("navbar.products") },
    { href: "/blog", label: t("navbar.blog") },
    { href: "/about", label: t("navbar.about") },
    { href: "/contact", label: t("navbar.contact") },
  ];

  const categories = [
    { href: "/products?category=gift-boxes", label: t("home.giftBoxes") },
    {
      href: "/products?category=cosmetic-packaging",
      label: t("home.cosmeticPackaging"),
    },
    {
      href: "/products?category=food-packaging",
      label: t("home.foodPackaging"),
    },
    { href: "/products?category=jewelry-boxes", label: t("home.jewelryBoxes") },
    {
      href: "/products?category=luxury-packaging",
      label: t("home.luxuryPackaging"),
    },
  ];

  return (
    <footer className="bg-charcoal-dark text-white/80">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={LOGO_URL}
                alt={BRAND_NAME}
                className="h-10 w-10 object-contain bg-white rounded p-0.5"
              />
              <span
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {BRAND_NAME}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {COMPANY_NAME} — {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.categories")}
            </h4>
            <ul className="space-y-2.5">
              {categories.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span className="text-sm text-white/60">
                  {t("footer.shanghaiChina")}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-white/60 hover:text-gold transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 mb-2">
                {t("footer.acceptedPayments")}
              </p>
              <div className="flex gap-3">
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded">
                  {t("footer.alipay")}
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded">
                  {t("footer.paypal")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
