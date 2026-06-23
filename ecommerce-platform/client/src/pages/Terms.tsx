import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { COMPANY_NAME, CONTACT_EMAIL } from "@/lib/constants";

export default function Terms() {
  const { t } = useTranslation();

  usePageSEO({
    title: t("footer.termsOfService") + " | " + t("seo.siteName"),
    description:
      "Terms of service for " +
      COMPANY_NAME +
      ". Please read these terms carefully before using our website or services.",
    canonicalPath: "/terms",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbSchema
        items={[
          { name: t("navbar.home"), url: "/" },
          { name: t("footer.termsOfService"), url: "/terms" },
        ]}
      />
      <Navbar />

      <div className="container py-8 flex-1 max-w-4xl">
        <PageBreadcrumb items={[{ label: t("footer.termsOfService") }]} />

        <h1
          className="text-3xl md:text-4xl font-bold text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("footer.termsOfService")}
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="mb-4">
            Welcome to the website of {COMPANY_NAME} ("DY Packs", "we", "us",
            or "our"). By accessing or using our website and services, you
            agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            1. Use of Website
          </h2>
          <p className="mb-4">
            You may use our website for lawful purposes only. You agree not to
            use the website in any way that could damage, disable, overburden,
            or impair our servers or networks, or interfere with any other
            party's use of the website.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            2. Quotes and Orders
          </h2>
          <p className="mb-4">
            All prices displayed on our website are for reference only. Final
            pricing depends on product specifications, materials, printing
            requirements, quantities, and shipping terms. A formal quote will be
            provided upon request. Orders are subject to acceptance and
            confirmation by us.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            3. Intellectual Property
          </h2>
          <p className="mb-4">
            All content on this website, including text, images, logos, and
            designs, is the property of {COMPANY_NAME} or its licensors and is
            protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            4. Limitation of Liability
          </h2>
          <p className="mb-4">
            To the fullest extent permitted by law, {COMPANY_NAME} shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or relating to your use of the
            website or services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            5. Governing Law
          </h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of the People's Republic of China, without regard to its
            conflict of law provisions.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            6. Contact Us
          </h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gold-dark hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
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
