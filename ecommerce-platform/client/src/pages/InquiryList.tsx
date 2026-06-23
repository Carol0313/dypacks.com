import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  FileText,
  Trash2,
  Minus,
  Plus,
  Send,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";

export default function InquiryList() {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState<{ inquiryNumber: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  const inquiryQuery = trpc.inquiry.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const items = inquiryQuery.data ?? [];

  const utils = trpc.useUtils();

  const updateMutation = trpc.inquiry.update.useMutation({
    onSuccess: () => {
      utils.inquiry.list.invalidate();
      utils.inquiry.count.invalidate();
    },
  });

  const removeMutation = trpc.inquiry.remove.useMutation({
    onSuccess: () => {
      utils.inquiry.list.invalidate();
      utils.inquiry.count.invalidate();
      toast.success(t("inquiry.itemRemoved"));
    },
  });

  const clearMutation = trpc.inquiry.clear.useMutation({
    onSuccess: () => {
      utils.inquiry.list.invalidate();
      utils.inquiry.count.invalidate();
      toast.success(t("inquiry.inquiryCleared"));
    },
  });

  const submitMutation = trpc.inquiry.submit.useMutation({
    onSuccess: data => {
      setSubmitted(data);
      utils.inquiry.list.invalidate();
      utils.inquiry.count.invalidate();
    },
    onError: err => {
      toast.error(err.message || t("inquiry.failedSubmit"));
    },
  });

  usePageSEO({
    title: t("inquiry.inquiryList") + " | DY Packs",
    canonicalPath: "/inquiry",
    noIndex: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("inquiry.signInRequired")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("inquiry.signInToView")}
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
              {t("inquiry.signIn")}
            </Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center max-w-lg mx-auto">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-6" />
          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("inquiry.submittedSuccess")}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t("inquiry.inquiryNumber")}
          </p>
          <p className="text-xl font-semibold text-gold-dark mb-6">
            {submitted.inquiryNumber}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t("inquiry.teamWillReview")}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/products">
              <Button variant="outline">{t("inquiry.continueBrowsing")}</Button>
            </Link>
            <Link href="/account">
              <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
                {t("inquiry.myAccount")}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName || !formData.email) {
      toast.error(t("inquiry.fillRequired"));
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/products"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("inquiry.products")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{t("inquiry.inquiryList")}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <FileText className="inline-block h-7 w-7 mr-2 text-gold-dark" />
              {t("inquiry.inquiryList")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("inquiry.addProductsInterested")}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
            >
              {t("inquiry.clearAll")}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/30">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("inquiry.listEmpty")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("inquiry.browseAddItems")}
            </p>
            <Link href="/products">
              <Button className="bg-gold text-charcoal-dark hover:bg-gold-dark">
                {t("inquiry.browseProducts")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => {
                const product = item.product;
                if (!product) return null;
                const image = product.images
                  ? JSON.parse(product.images)[0]
                  : PLACEHOLDER_IMAGE;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                  >
                    <Link href={`/product/${product.slug}`}>
                      <img
                        src={image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-medium text-foreground hover:text-gold-dark transition-colors truncate">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t("inquiry.unitPrice")} $
                        {Number(product.price).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {t("inquiry.qty")}
                        </span>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {item.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {t("inquiry.note")} {item.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeMutation.mutate({ id: item.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quote Request Form */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 bg-card sticky top-24">
                <h2
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {t("inquiry.requestQuote")}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("inquiry.fillDetails")}
                </p>

                <Separator className="mb-4" />

                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">
                    {items.length}
                  </span>{" "}
                  {t("inquiry.productsInInquiry")}
                </div>

                {!showForm ? (
                  <Button
                    className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
                    onClick={() => setShowForm(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t("inquiry.submitInquiry")}
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.companyName")}
                      </label>
                      <Input
                        placeholder={t("inquiry.companyPlaceholder")}
                        value={formData.companyName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.contactName")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder={t("inquiry.contactPlaceholder")}
                        value={formData.contactName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.email")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder={t("inquiry.emailPlaceholder")}
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.phone")}
                      </label>
                      <Input
                        placeholder={t("inquiry.phonePlaceholder")}
                        value={formData.phone}
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.countryRegion")}
                      </label>
                      <Input
                        placeholder={t("inquiry.countryPlaceholder")}
                        value={formData.country}
                        onChange={e =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        {t("inquiry.additionalMessage")}
                      </label>
                      <Textarea
                        placeholder={t("inquiry.messagePlaceholder")}
                        rows={3}
                        value={formData.message}
                        onChange={e =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowForm(false)}
                      >
                        {t("inquiry.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending
                          ? t("inquiry.submitting")
                          : t("inquiry.sendInquiry")}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
