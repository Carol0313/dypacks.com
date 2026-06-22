import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useRoute } from "wouter";
import { useState } from "react";
import {
  Minus,
  Plus,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  FileText,
  Mail,
  Ruler,
  Palette,
} from "lucide-react";
import ProductReviews from "@/components/ProductReviews";
import ImageLightbox from "@/components/ImageLightbox";
import ContactForm from "@/components/ContactForm";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ProductSchema,
  BreadcrumbSchema,
  FAQSchema,
} from "@/components/SchemaMarkup";
import { useTranslation } from "react-i18next";
import {
  usePageSEO,
  buildProductTitle,
  buildProductDescription,
} from "@/lib/seo";

function useProductSEO(product: any) {
  const title = product
    ? product.metaTitle || buildProductTitle(product.name)
    : "Product | DY Packs";
  const description = product
    ? product.metaDescription ||
      buildProductDescription(product.name, product.shortDescription)
    : "Premium custom packaging solutions from DY Packs.";
  const keywords = product
    ? product.metaKeywords ||
      `custom packaging, ${product.name}, packaging manufacturer, ${product.categoryName || ""}, DY Packs`
    : "custom packaging, packaging manufacturer, DY Packs";
  const images = product?.images ? JSON.parse(product.images) : [];

  usePageSEO({
    title,
    description,
    keywords,
    ogImage: images[0],
    ogType: "product",
    canonicalPath: product ? `/product/${product.slug}` : undefined,
  });
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const productQuery = trpc.product.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );
  const product = productQuery.data;

  useProductSEO(product);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(t("productDetail.addedToCart"));
    },
    onError: () => {
      toast.error(t("productDetail.failedAddToCart"));
    },
  });

  const addToInquiryMutation = trpc.inquiry.add.useMutation({
    onSuccess: () => {
      toast.success(t("productDetail.addedToInquiry"));
    },
    onError: () => {
      toast.error(t("productDetail.failedAddInquiry"));
    },
  });

  const utils = trpc.useUtils();

  // Fetch review stats for schema
  const ratingQuery = trpc.review.ratingStats.useQuery(
    { productId: product?.id ?? 0 },
    { enabled: !!product }
  );
  const ratingStats = ratingQuery.data;

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("productDetail.productNotFound")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("productDetail.productNotExist")}
          </p>
          <Link href="/products">
            <Button>{t("productDetail.backToProducts")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  if (images.length === 0) images.push(PLACEHOLDER_IMAGE);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCartMutation.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          utils.cart.count.invalidate();
          utils.cart.list.invalidate();
        },
      }
    );
  };

  const handleAddToInquiry = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToInquiryMutation.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          utils.inquiry.count.invalidate();
          utils.inquiry.list.invalidate();
        },
      }
    );
  };

  const trustBadges = [
    { icon: Package, label: t("productDetail.customDesign") },
    { icon: Truck, label: t("productDetail.globalShipping") },
    { icon: Shield, label: t("productDetail.qualityAssured") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Schema Structured Data */}
      <ProductSchema
        name={product.name}
        description={product.shortDescription || product.description || ""}
        image={images[0]}
        price={Number(product.price)}
        slug={product.slug}
        inStock={product.stock > 0}
        ratingValue={ratingStats?.averageRating}
        reviewCount={ratingStats?.totalReviews}
      />
      <FAQSchema
        items={[
          {
            question: `What is the MOQ for ${product.name}?`,
            answer: `Our standard MOQ starts from ${product.minOrderQty || 100} pieces. We also support lower quantities for sample orders. Contact us for details.`,
          },
          {
            question: `Can I customize the ${product.name}?`,
            answer:
              "Yes. We support custom sizes, colors, materials, printing, foil stamping, embossing, spot UV, and inserts. Send us your requirements for a tailored quote.",
          },
          {
            question: "How long is production and shipping?",
            answer:
              "Sample production takes 3-7 days. Bulk production typically takes 10-25 days depending on quantity and customization. We ship worldwide by sea, air or express.",
          },
          {
            question: "Do you provide samples before bulk order?",
            answer:
              "Absolutely. We recommend samples to confirm material, color, structure and print quality before mass production.",
          },
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: t("productDetail.home"), url: "/" },
          { name: t("productDetail.products"), url: "/products" },
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />

      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/products"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("productDetail.products")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div
              className="aspect-square overflow-hidden rounded-lg bg-muted mb-3 cursor-zoom-in group relative"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={images[selectedImage]}
                alt={`${product.name} - Custom Packaging | DY Packs`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                <div className="p-3 rounded-full bg-white/80 text-charcoal-dark">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-muted-foreground mb-4">
                {product.shortDescription}
              </p>
            )}

            {/* Reference Price */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                {t("productDetail.referencePrice")}
              </p>
              <span className="text-3xl font-bold text-foreground">
                ${Number(product.price).toFixed(2)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {t("productDetail.finalQuoteDepends")}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Customization Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-gold/10 text-gold-dark border-gold/20 hover:bg-gold/20">
                  {t("productDetail.customizable")}
                </Badge>
                {product.minOrderQty > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {t("home.moq")} {product.minOrderQty} {t("home.pcs")}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-gold-dark" />
                  <span>{t("productDetail.customSizes")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-gold-dark" />
                  <span>{t("productDetail.customPrinting")}</span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">
                {t("productDetail.quantity")}
              </span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() =>
                    setQuantity(q => Math.max(product.minOrderQty || 1, q - 1))
                  }
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold"
                onClick={handleAddToInquiry}
                disabled={addToInquiryMutation.isPending}
              >
                <FileText className="mr-2 h-5 w-5" />
                {addToInquiryMutation.isPending
                  ? t("productDetail.adding")
                  : t("productDetail.addToInquiryList")}
              </Button>
              <Link href={`/contact?product=${product.slug}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-gold text-gold-dark hover:bg-gold/10 font-semibold"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {t("productDetail.requestQuote")}
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
              {trustBadges.map((item, i) => (
                <div key={i} className="text-center">
                  <item.icon className="h-5 w-5 mx-auto text-gold-dark mb-1" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12 pt-8 border-t">
            <h2
              className="text-xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("productDetail.productDescription")}
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          images={images}
          initialIndex={selectedImage}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          alt={product.name}
        />

        {/* Customer Reviews */}
        <ProductReviews productId={product.id} />

        {/* Contact Form Section */}
        <div className="mt-12 pt-8 border-t">
          <h2
            className="text-xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("productDetail.requestQuote")}
          </h2>
          <div className="max-w-2xl">
            <ContactForm product={product.name} source="product_page" />
          </div>
        </div>

        {/* Pricing Note */}
        <div className="mt-8 p-4 bg-gold/5 border border-gold/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              {t("productDetail.note")}
            </strong>{" "}
            {t("productDetail.pricesReference")}{" "}
            <Link href="/contact" className="text-gold-dark underline">
              {t("productDetail.contactUs")}
            </Link>{" "}
            {t("productDetail.detailedQuote")}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
