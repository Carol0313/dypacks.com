import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ContactFormProps {
  product?: string;
  source?: string;
}

export default function ContactForm({ product, source = "contact_page" }: ContactFormProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  const submitMutation = trpc.inquiry.submitAnonymous.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ contactName: "", email: "", phone: "", country: "", message: "" });
    },
    onError: (err) => {
      toast.error(err.message || t("contactForm.failedSubmit"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName.trim() || !form.email.trim()) {
      toast.error(t("contactForm.fillRequired"));
      return;
    }
    submitMutation.mutate({
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      country: form.country || undefined,
      product: product || undefined,
      details: form.message || undefined,
      source,
    });
  };

  if (submitted) {
    return (
      <Card className="border-gold/20 bg-gold/5">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-gold-dark mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("contactForm.thankYou")}
          </h3>
          <p className="text-muted-foreground mb-4">{t("contactForm.teamWillContact")}</p>
          <Button
            variant="outline"
            className="border-gold text-gold-dark hover:bg-gold/10"
            onClick={() => setSubmitted(false)}
          >
            {t("contactForm.sendAnother")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {product && (
        <div className="p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t("contactForm.inquiringAbout")}</span>{" "}
          {product}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">
            {t("contactForm.name")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactName"
            value={form.contactName}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            placeholder={t("contactForm.namePlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            {t("contactForm.email")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t("contactForm.emailPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{t("contactForm.phone")}</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={t("contactForm.phonePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">{t("contactForm.country")}</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            placeholder={t("contactForm.countryPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t("contactForm.message")}</Label>
        <Textarea
          id="message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder={t("contactForm.messagePlaceholder")}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin" />
            {t("contactForm.sending")}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t("contactForm.sendMessage")}
          </span>
        )}
      </Button>
    </form>
  );
}
