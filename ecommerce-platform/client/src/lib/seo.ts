import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BRAND_NAME } from "./constants";

export const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL ?? "https://www.dypacks.com");

export const DEFAULT_LOCALE = "en";

// Supported locales matching i18n config
export const LOCALES = [
  { code: "en", label: "English", hreflang: "en" },
  { code: "tr", label: "Türkçe", hreflang: "tr" },
  { code: "ru", label: "Русский", hreflang: "ru" },
  { code: "es", label: "Español", hreflang: "es" },
];

export interface PageSEOOptions {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string | null;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  ogType?: "website" | "product" | "article";
  canonicalPath?: string;
  noIndex?: boolean;
  hreflangPath?: string;
}

function setOrCreateMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(name: string, attribute: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  const el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (el) el.remove();
}

function setOrCreateLink(rel: string, href: string, hreflang?: string) {
  if (typeof document === "undefined") return;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeLinks(rel: string) {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`link[rel="${rel}"]`).forEach(el => el.remove());
}

export function usePageSEO(options: PageSEOOptions) {
  const {
    title,
    description,
    keywords,
    ogImage,
    ogImageWidth,
    ogImageHeight,
    ogImageAlt,
    ogType = "website",
    canonicalPath,
    noIndex = false,
    hreflangPath,
  } = options;
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Update html lang attribute to current locale
    document.documentElement.lang = locale;

    const previousTitle = document.title;
    document.title = title;

    if (description) {
      setOrCreateMeta("description", description);
      setOrCreateMeta("og:description", description, "property");
    }

    if (keywords) {
      setOrCreateMeta("keywords", keywords);
    }

    setOrCreateMeta("og:title", title, "property");
    setOrCreateMeta("og:type", ogType, "property");
    setOrCreateMeta("og:site_name", BRAND_NAME, "property");
    setOrCreateMeta("og:locale", locale.replace("-", "_"), "property");
    setOrCreateMeta("twitter:card", "summary_large_image");
    setOrCreateMeta("twitter:title", title);
    if (description) setOrCreateMeta("twitter:description", description);

    const origin = SITE_URL;
    const canonical = canonicalPath ? `${origin}${canonicalPath}` : origin;
    setOrCreateLink("canonical", canonical);
    setOrCreateMeta("og:url", canonical, "property");

    if (ogImage) {
      setOrCreateMeta("og:image", ogImage, "property");
      setOrCreateMeta("twitter:image", ogImage);
      if (ogImageAlt) {
        setOrCreateMeta("og:image:alt", ogImageAlt, "property");
      }
      if (ogImageWidth) {
        setOrCreateMeta("og:image:width", String(ogImageWidth), "property");
      }
      if (ogImageHeight) {
        setOrCreateMeta("og:image:height", String(ogImageHeight), "property");
      }
    }

    if (noIndex) {
      setOrCreateMeta("robots", "noindex, nofollow");
    } else {
      removeMeta("robots");
    }

    // Hreflang tags — site currently serves all languages from the same URL,
    // so we only set x-default. Add per-locale alternates once language-specific
    // URLs (e.g. /en/products) are implemented.
    removeLinks("alternate");
    const path = hreflangPath || canonicalPath || "/";
    setOrCreateLink("alternate", `${origin}${path}`, "x-default");

    return () => {
      document.title = previousTitle;
      removeLinks("alternate");
      removeMeta("robots");
      removeMeta("og:locale");
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogImageWidth,
    ogImageHeight,
    ogImageAlt,
    ogType,
    canonicalPath,
    noIndex,
    hreflangPath,
    locale,
  ]);
}

// Helpers to build keyword-rich strings using the current i18n language.
// Pass the t function from react-i18next so titles/descriptions are localized.
export function buildProductTitle(
  productName: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  return t("seo.product.title", {
    productName,
    defaultValue: `${productName} | Custom Packaging | ${BRAND_NAME}`,
  });
}

export function buildProductDescription(
  productName: string,
  shortDesc: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const base =
    shortDesc && shortDesc.length > 20
      ? shortDesc
      : t("seo.product.descriptionBase", {
          productName,
          defaultValue: `Custom ${productName} manufactured by ${BRAND_NAME}.`,
        });
  return t("seo.product.description", {
    productName,
    base,
    defaultValue: `${base} Premium materials, custom sizes & printing. Low MOQ, factory-direct pricing, global shipping. Request a quote today!`,
  }).slice(0, 160);
}

export function buildBlogPostTitle(
  postTitle: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  return t("seo.blogPost.title", {
    postTitle,
    defaultValue: `${postTitle} | ${BRAND_NAME} Packaging Blog`,
  });
}

export function buildBlogPostDescription(
  excerpt: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const base =
    excerpt?.trim() ||
    t("seo.blogPost.descriptionBase", {
      defaultValue: "Expert packaging insights and tips from DY Packs.",
    });
  return t("seo.blogPost.description", {
    excerpt: base,
    defaultValue: `${base} Learn how premium custom packaging can elevate your brand.`,
  }).slice(0, 160);
}

// Category SEO presets
export const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; keywords: string; h1: string }
> = {
  "gift-boxes": {
    title: "Custom Gift Boxes & Luxury Rigid Boxes Wholesale | DY Packs",
    description:
      "Design custom gift boxes and luxury rigid boxes with DY Packs. Magnetic closure, foil stamping, custom sizes. Low MOQ, factory-direct from China.",
    keywords:
      "custom gift boxes, luxury gift boxes, rigid gift boxes, magnetic closure gift box, gift box manufacturer, wholesale gift boxes, custom packaging China",
    h1: "Custom Gift Boxes",
  },
  "cosmetic-packaging": {
    title: "Cosmetic Packaging Boxes Wholesale | Custom Beauty Packaging",
    description:
      "Custom cosmetic packaging boxes for beauty brands. Rigid boxes, folding cartons, eco-friendly options. Low MOQ with global shipping from DY Packs.",
    keywords:
      "cosmetic packaging boxes, cosmetic packaging boxes wholesale, beauty packaging boxes, custom cosmetic packaging, makeup packaging manufacturer",
    h1: "Cosmetic Packaging Boxes",
  },
  "food-packaging": {
    title: "Custom Food Packaging Boxes | Food-Safe Wholesale Boxes",
    description:
      "Food-safe custom packaging boxes for bakeries, chocolate, tea and more. FDA-compliant materials, custom printing, low MOQ from DY Packs China.",
    keywords:
      "food packaging boxes, custom food packaging, food grade packaging boxes, wholesale food packaging, bakery packaging manufacturer",
    h1: "Food Packaging Boxes",
  },
  "jewelry-boxes": {
    title: "Custom Jewelry Packaging Boxes Wholesale | Ring & Necklace Boxes",
    description:
      "Luxury custom jewelry packaging boxes wholesale. Velvet-lined ring boxes, necklace boxes, watch boxes. Low MOQ, premium finishing from DY Packs.",
    keywords:
      "jewelry packaging boxes, jewelry boxes wholesale, custom jewelry boxes, ring box manufacturer, necklace packaging boxes",
    h1: "Jewelry Packaging Boxes",
  },
  "electronics-packaging": {
    title: "Custom Electronics Packaging Boxes | Protective Tech Packaging",
    description:
      "Protective custom electronics packaging boxes for tech products. Rigid boxes, inserts, and premium finishing. Low MOQ from DY Packs China.",
    keywords:
      "electronics packaging boxes, custom tech packaging, phone box packaging, gadget packaging manufacturer, wholesale electronics boxes",
    h1: "Electronics Packaging Boxes",
  },
  "luxury-packaging": {
    title: "Luxury Packaging Boxes | Bespoke Rigid Boxes Wholesale",
    description:
      "Bespoke luxury packaging boxes for premium brands. Rigid boxes, magnetic closures, foil stamping, embossing. Factory-direct from DY Packs China.",
    keywords:
      "luxury packaging boxes, bespoke rigid boxes, premium packaging boxes, high end packaging manufacturer, custom luxury boxes wholesale",
    h1: "Luxury Packaging Boxes",
  },
};

// Build localized fallback SEO for a category not present in CATEGORY_SEO.
export function buildCategorySEO(
  categoryName: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  return {
    title: t("seo.categoryFallback.title", {
      categoryName,
      defaultValue: `${categoryName} | Custom Packaging | ${BRAND_NAME}`,
    }),
    description: t("seo.categoryFallback.description", {
      categoryName,
      defaultValue: `Browse ${categoryName} custom packaging solutions. Low MOQ, factory-direct pricing, global shipping.`,
    }),
    keywords: t("seo.categoryFallback.keywords", {
      categoryName,
      defaultValue: `${categoryName}, custom packaging, wholesale packaging, packaging manufacturer, ${BRAND_NAME}`,
    }),
    h1: t("seo.categoryFallback.h1", {
      categoryName,
      defaultValue: categoryName,
    }),
  };
}
