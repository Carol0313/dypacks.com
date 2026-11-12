import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileText, Package, Mail, ArrowRight } from "lucide-react";
import { usePageSEO } from "@/lib/seo";
import { getOAuthLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND_NAME } from "@/lib/constants";

export default function SignInPage() {
  const { t } = useTranslation();
  const oauthUrl = getOAuthLoginUrl();

  usePageSEO({
    title: t("signIn.pageTitle") + ` | ${BRAND_NAME}`,
    canonicalPath: "/sign-in",
    noIndex: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.92 0.04 85 / 0.55), transparent), linear-gradient(160deg, oklch(0.97 0.01 75), oklch(0.94 0.02 85))",
            }}
          />
          <div className="container py-14 md:py-20 max-w-2xl">
            <p
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {BRAND_NAME}
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
              {t("signIn.headline")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              {t("signIn.subtitle")}
            </p>

            <div className="mt-10 space-y-4">
              <Link href="/order">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-charcoal text-white hover:bg-charcoal-dark"
                >
                  <Package className="mr-2 h-5 w-5" />
                  {t("signIn.getInstantQuote")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Mail className="mr-2 h-5 w-5" />
                    {t("signIn.contactSales")}
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <FileText className="mr-2 h-5 w-5" />
                    {t("signIn.browseProducts")}
                  </Button>
                </Link>
              </div>
            </div>

            {oauthUrl && (
              <div className="mt-12 pt-8 border-t border-border/60">
                <p className="text-sm text-muted-foreground mb-3">
                  {t("signIn.returningCustomer")}
                </p>
                <a href={oauthUrl}>
                  <Button variant="secondary" size="sm">
                    {t("signIn.continueWithAccount")}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
