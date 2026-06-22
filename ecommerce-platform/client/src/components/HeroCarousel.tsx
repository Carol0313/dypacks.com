import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  HERO_IMAGE,
  SHOWCASE_IMAGE_1,
  SHOWCASE_IMAGE_2,
  SHOWCASE_IMAGE_3,
  SHOWCASE_IMAGE_4,
  SHOWCASE_IMAGE_5,
} from "@/lib/constants";

interface Slide {
  image: string;
  badge: string;
  title: string;
  highlight: string;
  titleSuffix?: string;
  description: string;
  primaryLink: string;
  primaryText: string;
  secondaryLink: string;
  secondaryText: string;
}

export default function HeroCarousel() {
  const { t } = useTranslation();

  const slides: Slide[] = [
    {
      image: HERO_IMAGE,
      badge: t("hero.premiumManufacturer"),
      title: t("hero.elevateBrand"),
      highlight: t("hero.premiumPackaging"),
      description: t("hero.customSolutions"),
      primaryLink: "/products",
      primaryText: t("hero.exploreProducts"),
      secondaryLink: "/contact",
      secondaryText: t("hero.requestQuote"),
    },
    {
      image: SHOWCASE_IMAGE_1,
      badge: t("hero.cosmeticPackaging"),
      title: t("hero.stunningCosmetic"),
      highlight: t("hero.cosmeticBoxes"),
      titleSuffix: t("hero.forBeautyBrands"),
      description: t("hero.elevateBeauty"),
      primaryLink: "/products?category=cosmetic-packaging",
      primaryText: t("hero.viewCollection"),
      secondaryLink: "/contact",
      secondaryText: t("hero.getQuote"),
    },
    {
      image: SHOWCASE_IMAGE_2,
      badge: t("hero.luxuryGiftBoxes"),
      title: t("hero.exquisite"),
      highlight: t("hero.giftPackaging"),
      titleSuffix: t("hero.solutions"),
      description: t("hero.makeEveryGift"),
      primaryLink: "/products?category=gift-boxes",
      primaryText: t("hero.discoverMore"),
      secondaryLink: "/contact",
      secondaryText: t("hero.customOrder"),
    },
    {
      image: SHOWCASE_IMAGE_3,
      badge: t("hero.ecoFriendly"),
      title: t("hero.sustainable"),
      highlight: t("hero.greenPackaging"),
      titleSuffix: t("hero.forModernBrands"),
      description: t("hero.ecoConscious"),
      primaryLink: "/blog",
      primaryText: t("hero.learnMore"),
      secondaryLink: "/products",
      secondaryText: t("hero.browseProducts"),
    },
    {
      image: SHOWCASE_IMAGE_5,
      badge: t("hero.globalShipping"),
      title: t("hero.trustedBy"),
      highlight: t("hero.worldwide"),
      description: t("hero.experience50Countries"),
      primaryLink: "/about",
      primaryText: t("hero.aboutUs"),
      secondaryLink: "/contact",
      secondaryText: t("hero.contactSales"),
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-charcoal-dark">
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/95 via-charcoal-dark/75 to-charcoal-dark/30" />

              {/* Content */}
              <div className="container relative z-10 py-24 md:py-32 lg:py-40">
                <div className="max-w-2xl">
                  <AnimatePresence mode="wait">
                    {selectedIndex === index && (
                      <motion.div
                        key={`slide-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/30">
                            {slide.badge}
                          </Badge>
                        </motion.div>

                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {slide.title}
                          <span className="text-gold">{slide.highlight}</span>
                          {slide.titleSuffix || ""}
                        </motion.h1>

                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg"
                        >
                          {slide.description}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="flex flex-wrap gap-3"
                        >
                          <Link href={slide.primaryLink}>
                            <Button
                              size="lg"
                              className="bg-gold text-charcoal-dark hover:bg-gold-dark font-semibold px-8"
                            >
                              {slide.primaryText}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={slide.secondaryLink}>
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              {slide.secondaryText}
                            </Button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        aria-label={t("hero.previousSlide")}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        aria-label={t("hero.nextSlide")}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === index
                ? "w-8 h-2.5 bg-gold"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`${t("hero.goToSlide")}${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={selectedIndex}
        />
      </div>
    </section>
  );
}
