import { useEffect } from "react";
import { BRAND_NAME, COMPANY_NAME, LOGO_URL, CONTACT_EMAIL } from "@/lib/constants";

// Helper to inject JSON-LD script tags into the document head
function useJsonLd(id: string, data: Record<string, unknown> | null) {
  useEffect(() => {
    if (!data) return;

    // Remove existing script with same id
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [id, JSON.stringify(data)]);
}

// Organization Schema — used on homepage
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_NAME,
    alternateName: BRAND_NAME,
    url: typeof window !== "undefined" ? window.location.origin : "",
    logo: LOGO_URL,
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "sales",
      availableLanguage: ["English", "Chinese"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shanghai",
      addressLocality: "Shanghai",
      addressCountry: "CN",
    },
    sameAs: [],
  };

  useJsonLd("schema-organization", data);
  return null;
}

// WebSite Schema — used on homepage for sitelinks search box
export function WebSiteSchema() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: COMPANY_NAME,
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  useJsonLd("schema-website", data);
  return null;
}

// BreadcrumbList Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${origin}${item.url}`,
    })),
  };

  useJsonLd("schema-breadcrumb", data);
  return null;
}

// Article / BlogPosting Schema — used on blog post detail pages
interface BlogPostSchemaProps {
  title: string;
  description: string;
  coverImage?: string | null;
  publishedAt: string | Date;
  updatedAt?: string | Date;
  slug: string;
  authorName?: string;
}

export function BlogPostSchema({
  title,
  description,
  coverImage,
  publishedAt,
  updatedAt,
  slug,
  authorName = BRAND_NAME,
}: BlogPostSchemaProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: coverImage || LOGO_URL,
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: updatedAt ? new Date(updatedAt).toISOString() : new Date(publishedAt).toISOString(),
    url: `${origin}/blog/${slug}`,
    author: {
      "@type": "Organization",
      name: authorName,
      url: origin,
      logo: LOGO_URL,
    },
    publisher: {
      "@type": "Organization",
      name: COMPANY_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${origin}/blog/${slug}`,
    },
    inLanguage: "en-US",
  };

  useJsonLd("schema-blogpost", data);
  return null;
}

// Blog listing page Schema — CollectionPage with ItemList
interface BlogListItem {
  title: string;
  slug: string;
  coverImage?: string | null;
  publishedAt?: string | Date | null;
}

export function BlogListSchema({ posts }: { posts: BlogListItem[] }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog & Insights - DY Packs",
    description: "Industry news, packaging tips, and company updates from DY Packs.",
    url: `${origin}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${origin}/blog/${post.slug}`,
        name: post.title,
        image: post.coverImage || LOGO_URL,
      })),
    },
  };

  useJsonLd("schema-bloglist", data);
  return null;
}

// Product Schema — used on product detail pages
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  slug: string;
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = "USD",
  slug,
  inStock,
  ratingValue,
  reviewCount,
}: ProductSchemaProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: image,
    url: `${origin}/product/${slug}`,
    brand: {
      "@type": "Organization",
      name: BRAND_NAME,
    },
    manufacturer: {
      "@type": "Organization",
      name: COMPANY_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: COMPANY_NAME,
      },
    },
  };

  if (ratingValue && reviewCount && reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount: reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  useJsonLd("schema-product", data);
  return null;
}

// FAQ Schema — used on contact/about pages
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  useJsonLd("schema-faq", data);
  return null;
}
