import { getOptimizedImageUrl } from "./image-utils";

// Brand
export const BRAND_NAME = "DY Packs";
export const COMPANY_NAME = "Shanghai Douyue Industrial Co., Ltd";
export const LOGO_URL = "/logo.png";

// Banner Images (hosted on Alibaba Cloud OSS)
export const OSS_PUBLIC_URL =
  "https://dypacks-images.oss-cn-shanghai.aliyuncs.com";
export const HERO_IMAGE = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/images/banner/banner-1.jpg`,
  1920
);
export const SHOWCASE_IMAGE_1 = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/images/banner/banner-2.jpg`,
  1200
);
export const SHOWCASE_IMAGE_2 = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/products/product-luxury-perfume-gift-box.jpg`,
  800
);
export const SHOWCASE_IMAGE_3 = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/products/product-burgundy-royal-magnetic-gift-box.jpg`,
  800
);
export const SHOWCASE_IMAGE_4 = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/products/product-eco-friendly-botanical-cosmetic.jpg`,
  800
);
export const SHOWCASE_IMAGE_5 = getOptimizedImageUrl(
  `${OSS_PUBLIC_URL}/static/products/product-rose-gold-necklace-box.jpg`,
  800
);

// Contact
export const CONTACT_EMAIL = "carolni@dypacks.com";

// Payment
export const ALIPAY_ACCOUNT = "saleszhanjibz@163.com";
export const PAYPAL_ACCOUNT = "58282055@qq.com";

// Default product categories
export const DEFAULT_CATEGORIES = [
  {
    name: "Gift Boxes",
    slug: "gift-boxes",
    description: "Premium custom gift boxes for every occasion",
  },
  {
    name: "Cosmetic Packaging",
    slug: "cosmetic-packaging",
    description: "Elegant packaging solutions for beauty products",
  },
  {
    name: "Food Packaging",
    slug: "food-packaging",
    description: "Safe and attractive food-grade packaging",
  },
  {
    name: "Jewelry Boxes",
    slug: "jewelry-boxes",
    description: "Luxurious boxes for precious jewelry",
  },
  {
    name: "Electronics Packaging",
    slug: "electronics-packaging",
    description: "Protective and stylish tech packaging",
  },
  {
    name: "Luxury Packaging",
    slug: "luxury-packaging",
    description: "High-end packaging for premium brands",
  },
];

// Placeholder product image
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f0'/%3E%3Ctext x='200' y='200' text-anchor='middle' dominant-baseline='middle' font-family='Inter' font-size='16' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
