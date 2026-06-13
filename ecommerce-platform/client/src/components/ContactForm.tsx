import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ContactFormProps {
  product?: string;
  source?: string;
}

export default function ContactForm({ product, source = "contact_page" }: ContactFormProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const formSchema = z.object({
    contactName: z.string().min(1, t("contactForm.fillRequired")),
    email: z.string().email(t("contactForm.fillRequired")),
    phone: z.string().optional(),
    country: z.string().optional(),
    message: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: "",
      country: "",
      message: "",
    },
  });

  const submitMutation = trpc.inquiry.submitAnonymous.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.message || t("contactForm.failedSubmit"));
    },
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate({
      contactName: values.contactName,
      email: values.email,
      phone: values.phone || undefined,
      country: values.country || undefined,
      product: product || undefined,
      details: values.message || undefined,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {product && (
          <div className="p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("contactForm.inquiringAbout")}</span>{" "}
            {product}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contactForm.name")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder={t("contactForm.namePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contactForm.email")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("contactForm.emailPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contactForm.phone")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("contactForm.phonePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contactForm.country")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("contactForm.countryPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactForm.message")}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={t("contactForm.messagePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              {t("contactForm.sendMessageBtn")}
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}
