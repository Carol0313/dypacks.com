import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { COMPANY_NAME, CONTACT_EMAIL } from "@/lib/constants";

export default function Privacy() {
  const { t } = useTranslation();

  usePageSEO({
    title: t("footer.privacyPolicy") + " | " + t("seo.siteName"),
    description:
      "Privacy policy for " +
      COMPANY_NAME +
      ". Learn how we collect, use, and protect your personal information.",
    canonicalPath: "/privacy",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbSchema
        items={[
          { name: t("navbar.home"), url: "/" },
          { name: t("footer.privacyPolicy"), url: "/privacy" },
        ]}
      />
      <Navbar />

      <div className="container py-8 flex-1 max-w-4xl">
        <PageBreadcrumb items={[{ label: t("footer.privacyPolicy") }]} />

        <h1
          className="text-3xl md:text-4xl font-bold text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("footer.privacyPolicy")}
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="mb-4">
            At {COMPANY_NAME} ("DY Packs", "we", "us", or "our"), we respect
            your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or use our
            services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We may collect personal information that you voluntarily provide to
            us, including but not limited to your name, email address, phone
            number, company name, shipping address, and inquiry details when you
            contact us, request a quote, or place an order.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect to respond to your inquiries,
            provide quotes, process orders, communicate with you about your
            account or transactions, improve our website and services, and
            comply with legal obligations.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            3. Information Sharing
          </h2>
          <p className="mb-4">
            We do not sell or rent your personal information. We may share your
            information with trusted service providers who assist us in
            operating our website, conducting business, or servicing you, so
            long as those parties agree to keep this information confidential.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            4. Data Security
          </h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            5. Your Rights
          </h2>
          <p className="mb-4">
            Depending on your jurisdiction, you may have the right to access,
            correct, delete, or restrict the processing of your personal data.
            To exercise these rights, please contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gold-dark hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            6. Changes to This Policy
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated effective date.
          </p>

          <p className="mt-8 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
