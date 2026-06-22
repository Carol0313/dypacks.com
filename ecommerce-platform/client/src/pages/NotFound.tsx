import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1
        className="text-6xl font-bold text-foreground mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {t("notFound.404")}
      </h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        {t("notFound.pageNotFound")}
      </h2>
      <p className="text-muted-foreground mb-2">{t("notFound.sorryPage")}</p>
      <p className="text-muted-foreground mb-8">
        {t("notFound.movedOrDeleted")}
      </p>
      <Link href="/">
        <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
          {t("notFound.goHome")}
        </Button>
      </Link>
    </div>
  );
}
