/**
 * Seed Categories & Products Script for DY Packs
 *
 * Usage:
 *   npx tsx scripts/seed-categories-and-products.ts
 *
 * Environment:
 *   DATABASE_URL must be set in your .env file or environment variables.
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Categories ──────────────────────────────────────────

const categoryData = [
  {
    name: "Gift Boxes",
    slug: "gift-boxes",
    description:
      "Elegant gift boxes for every occasion, from magnetic closures to drawer styles.",
    image: "/products/product-burgundy-royal-magnetic-gift-box.jpg",
    sortOrder: 1,
  },
  {
    name: "Cosmetic Packaging",
    slug: "cosmetic-packaging",
    description:
      "Premium cosmetic boxes, perfume packaging, and makeup palette cases.",
    image: "/products/product-luxury-perfume-gift-box.jpg",
    sortOrder: 2,
  },
  {
    name: "Jewelry & Watch Boxes",
    slug: "jewelry-watch-boxes",
    description:
      "Luxury jewelry boxes, ring cases, necklace displays, and watch organizers.",
    image: "/products/product-rose-gold-necklace-box.jpg",
    sortOrder: 3,
  },
  {
    name: "Food & Beverage Packaging",
    slug: "food-beverage-packaging",
    description:
      "Specialized food-safe packaging for chocolates, bakery, tea, and honey.",
    image: "/products/product-chocolate-truffle-box.jpg",
    sortOrder: 4,
  },
  {
    name: "Luxury & Corporate Packaging",
    slug: "luxury-corporate-packaging",
    description:
      "High-end corporate gift boxes, wine cases, and luxury specialty packaging.",
    image: "/products/product-leather-corporate-box.jpg",
    sortOrder: 5,
  },
];

// ─── Products ────────────────────────────────────────────

interface ProductSeed {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  categorySlug: string;
  imageFile: string;
  featured: boolean;
  stock: number;
  minOrderQty: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

const productData: ProductSeed[] = [
  // ── Gift Boxes ──
  {
    name: "Burgundy Royal Magnetic Gift Box",
    slug: "burgundy-royal-magnetic-gift-box",
    shortDescription:
      "Luxurious burgundy rigid box with gold foil accents and magnetic closure.",
    description: `Our Burgundy Royal Magnetic Gift Box exudes sophistication and elegance. Crafted with premium 1500gsm rigid paperboard and wrapped in rich burgundy specialty paper, this box features a seamless magnetic closure and gold foil stamping accents.

Features:
- 1500gsm rigid paperboard construction
- Rich burgundy specialty paper wrap
- Hidden magnetic closure mechanism
- Gold foil stamping on lid
- Customizable interior lining (velvet, satin, or EVA foam)
- Perfect for wine gifts, corporate presents, and luxury retail

Customization Options:
- Size: Fully customizable dimensions
- Color: Any Pantone color available
- Logo: Hot stamping, embossing, debossing, or UV printing
- Interior: Velvet, satin, foam insert, or custom molded tray
- Accessories: Ribbon pulls, magnetic seals, window patches`,
    price: "8.75",
    categorySlug: "gift-boxes",
    imageFile: "product-burgundy-royal-magnetic-gift-box.jpg",
    featured: true,
    stock: 1000,
    minOrderQty: 200,
    metaTitle:
      "Burgundy Royal Magnetic Gift Box | Luxury Custom Packaging Wholesale",
    metaDescription:
      "Premium burgundy magnetic gift boxes with gold foil accents. Custom luxury packaging for wine, corporate gifts, and retail. MOQ 200pcs. Factory direct from Shanghai.",
    metaKeywords:
      "burgundy gift box, magnetic closure box, luxury gift packaging, wine gift box, corporate gift box wholesale, custom rigid box",
  },
  {
    name: "Celestial Navy Nested Gift Box Set",
    slug: "celestial-navy-nested-gift-box-set",
    shortDescription:
      "Set of three navy nested boxes with celestial gold pattern and satin ribbon.",
    description: `The Celestial Navy Nested Gift Box Set offers a stunning presentation with three progressively sized boxes that nest inside one another. Each box is wrapped in deep navy paper adorned with an elegant celestial gold foil pattern.

Features:
- Set of 3 nested boxes (S/M/L)
- Deep navy specialty paper with celestial gold pattern
- Satin ribbon tie closure
- 1200gsm rigid construction
- Nested design for compact storage and shipping

Ideal For:
- Jewelry and accessory gift sets
- Corporate welcome kits
- Wedding favor boxes
- Holiday gift packaging

Customization:
- Pattern: Custom foil designs, logos, or full-color printing
- Colors: Any Pantone matching available
- Ribbon: Satin, grosgrain, or custom printed ribbon`,
    price: "12.60",
    categorySlug: "gift-boxes",
    imageFile: "product-celestial-navy-nested-box.jpg",
    featured: true,
    stock: 800,
    minOrderQty: 300,
    metaTitle:
      "Celestial Navy Nested Gift Box Set | Custom Nested Boxes Wholesale",
    metaDescription:
      "Elegant navy nested gift box set with celestial gold pattern. Perfect for jewelry sets, corporate kits, and wedding favors. Custom designs available. MOQ 300pcs.",
    metaKeywords:
      "nested gift boxes, navy gift box set, celestial pattern box, wedding favor boxes, jewelry gift box set, custom nested boxes",
  },
  {
    name: "Black & Gold Magnetic Closure Box",
    slug: "black-gold-magnetic-closure-box",
    shortDescription:
      "Sleek black rigid box with premium gold magnetic closure and soft-touch finish.",
    description: `A modern classic, our Black & Gold Magnetic Closure Box combines minimalist design with premium materials. The soft-touch matte black exterior pairs beautifully with the precision-engineered gold magnetic closure.

Features:
- Soft-touch matte black lamination
- Gold-finished magnetic closure
- 1200gsm grey board rigid construction
- Reinforced corners for durability
- Premium unboxing experience

Applications:
- High-end electronics packaging
- Luxury cosmetics and skincare
- Premium chocolate and confectionery
- Corporate anniversary gifts

Finishing Options:
- Spot UV gloss accents
- Embossed/debossed logos
- Custom gold or silver foil stamping
- Interior foam or velvet inserts`,
    price: "6.86",
    categorySlug: "gift-boxes",
    imageFile: "product-black-gold-magnetic-box.jpg",
    featured: true,
    stock: 1200,
    minOrderQty: 200,
    metaTitle: "Black & Gold Magnetic Closure Box | Premium Custom Packaging",
    metaDescription:
      "Sleek black magnetic gift boxes with gold closure and soft-touch finish. Ideal for electronics, cosmetics, and corporate gifts. Custom sizes and branding. MOQ 200pcs.",
    metaKeywords:
      "black gift box, magnetic closure box, gold magnetic box, soft touch packaging, luxury electronics box, custom magnetic box",
  },
  {
    name: "Minimalist White & Gold Rigid Box",
    slug: "minimalist-white-gold-rigid-box",
    shortDescription:
      "Clean white rigid box with subtle gold edge detailing and minimalist design.",
    description: `The Minimalist White & Gold Rigid Box embodies Scandinavian-inspired simplicity. The crisp white exterior is accented with delicate gold edge detailing, creating a timeless aesthetic that lets your product shine.

Features:
- Crisp white coated paper wrap
- Gold edge band detailing
- 1000gsm rigid board construction
- Clean, seam-free corners
- Optional ribbon or magnetic closure

Perfect For:
- Bridal and wedding gifts
- Premium skincare and beauty
- Artisanal food products
- Minimalist brand packaging

Customization:
- Edge color: Gold, silver, rose gold, or custom Pantone
- Logo: Blind embossing, foil stamping, or silk-screen
- Interior: Custom molded pulp, foam, or fabric lining`,
    price: "5.74",
    categorySlug: "gift-boxes",
    imageFile: "product-minimalist-white-gold-rigid-box.jpg",
    featured: false,
    stock: 1500,
    minOrderQty: 300,
    metaTitle: "Minimalist White & Gold Rigid Box | Clean Custom Packaging",
    metaDescription:
      "Minimalist white rigid gift boxes with gold edge detailing. Perfect for bridal, skincare, and artisanal products. Custom branding available. MOQ 300pcs from Shanghai.",
    metaKeywords:
      "white gift box, minimalist packaging, gold edge box, bridal gift box, skincare packaging, clean rigid box",
  },
  {
    name: "Kraft Window Gift Box",
    slug: "kraft-window-gift-box",
    shortDescription:
      "Eco-friendly kraft box with clear PVC window and natural twine closure.",
    description: `Our Kraft Window Gift Box offers a charming, natural aesthetic perfect for artisanal and eco-conscious brands. The clear PVC window provides a tempting preview of the contents while the kraft paper construction conveys sustainability.

Features:
- 350gsm brown kraft paper
- Clear PVC viewing window
- Natural twine tie closure
- Recyclable and biodegradable materials
- Flat-packed for efficient shipping

Ideal Applications:
- Handmade soaps and candles
- Artisanal food products
- Organic cosmetics
- Craft and hobby supplies
- Farmers market packaging

Eco Options:
- Soy-based inks for printing
- Compostable window film (PLA)
- FSC-certified paper sources
- Seed paper tags and labels`,
    price: "2.45",
    categorySlug: "gift-boxes",
    imageFile: "product-kraft-window-gift-box.jpg",
    featured: false,
    stock: 3000,
    minOrderQty: 500,
    metaTitle:
      "Kraft Window Gift Box | Eco-Friendly Custom Packaging Wholesale",
    metaDescription:
      "Eco-friendly kraft gift boxes with clear window. Perfect for artisanal foods, soaps, and organic products. Sustainable packaging with custom branding. MOQ 500pcs.",
    metaKeywords:
      "kraft gift box, window gift box, eco friendly packaging, artisanal packaging, sustainable gift box, kraft paper box wholesale",
  },
  {
    name: "Blush Pink Hexagonal Gift Box",
    slug: "blush-pink-hexagonal-gift-box",
    shortDescription:
      "Unique hexagonal rigid box in blush pink with gold foil geometric pattern.",
    description: `Stand out from ordinary square boxes with our Blush Pink Hexagonal Gift Box. The unique six-sided shape creates visual interest, while the soft blush pink color and gold geometric pattern exude feminine elegance.

Features:
- Unique hexagonal shape
- Blush pink specialty paper wrap
- Gold foil geometric pattern
- 1200gsm rigid board
- Magnetic or ribbon closure options

Perfect Occasions:
- Wedding and bridal party gifts
- Baby shower favors
- Beauty and cosmetics
- Valentine's Day packaging
- Boutique retail

Customization:
- Shape modifications: Octagonal, oval, or custom die-cut
- Pattern: Full-color printing, foil, or embossing
- Closure: Magnetic, ribbon, or snap button
- Interior: Custom inserts for specific products`,
    price: "7.70",
    categorySlug: "gift-boxes",
    imageFile: "product-blush-pink-hexagonal-box.jpg",
    featured: true,
    stock: 900,
    minOrderQty: 300,
    metaTitle: "Blush Pink Hexagonal Gift Box | Unique Custom Shape Packaging",
    metaDescription:
      "Unique hexagonal gift boxes in blush pink with gold pattern. Perfect for weddings, bridal gifts, and cosmetics. Custom shapes and branding available. MOQ 300pcs.",
    metaKeywords:
      "hexagonal gift box, blush pink box, geometric pattern box, wedding favor box, bridal gift box, unique shape packaging",
  },
  {
    name: "Marble Texture Premium Gift Box",
    slug: "marble-texture-premium-gift-box",
    shortDescription:
      "High-end rigid box with realistic marble texture print and silver foil logo area.",
    description: `The Marble Texture Premium Gift Box brings the timeless elegance of natural stone to your packaging. The high-resolution marble texture print creates a luxurious look, complemented by a designated silver foil logo area.

Features:
- High-resolution marble texture lamination
- Designated silver foil logo area
- 1500gsm ultra-rigid construction
- Velvet-lined interior standard
- Magnetic closure with hidden magnets

Target Markets:
- Luxury skincare and cosmetics
- High-end candle brands
- Premium chocolate makers
- Architectural and design firms
- Luxury real estate closing gifts

Finishing:
- Texture: Marble, granite, wood grain, or custom patterns
- Logo area: Foil, embossing, or metal plate options
- Interior: Velvet, suede, or leatherette lining`,
    price: "10.15",
    categorySlug: "gift-boxes",
    imageFile: "product-marble-texture-box.jpg",
    featured: false,
    stock: 600,
    minOrderQty: 200,
    metaTitle: "Marble Texture Premium Gift Box | Luxury Custom Packaging",
    metaDescription:
      "Premium marble texture gift boxes with silver foil branding. Ultra-luxury packaging for cosmetics, candles, and corporate gifts. Custom patterns available. MOQ 200pcs.",
    metaKeywords:
      "marble gift box, marble texture packaging, luxury candle box, premium cosmetic packaging, marble pattern box wholesale",
  },

  // ── Cosmetic Packaging ──
  {
    name: "Luxury Perfume Presentation Box",
    slug: "luxury-perfume-presentation-box",
    shortDescription:
      "Elegant perfume box with satin interior, magnetic closure, and gold foil branding.",
    description: `Designed specifically for fragrance brands, our Luxury Perfume Presentation Box creates an unforgettable unboxing experience. The custom-molded interior cradles your bottle securely while the exterior conveys premium quality.

Features:
- Custom molded EVA foam insert for bottle protection
- Satin or velvet interior lining
- Magnetic closure with ribbon pull
- 1200gsm rigid construction
- Gold or silver foil branding

Specifications:
- Fits standard 30ml, 50ml, and 100ml bottles
- Custom cavity molding for unique bottle shapes
- Optional tester strip compartment
- Available with sleeve or hinged lid

Branding Options:
- Foil stamping: Gold, silver, rose gold, holographic
- UV spot gloss on logo or pattern areas
- Embossed or debossed brand name
- Custom printed interior lid`,
    price: "4.55",
    categorySlug: "cosmetic-packaging",
    imageFile: "product-luxury-perfume-gift-box.jpg",
    featured: true,
    stock: 2000,
    minOrderQty: 500,
    metaTitle: "Luxury Perfume Presentation Box | Custom Fragrance Packaging",
    metaDescription:
      "Premium perfume boxes with custom molded inserts and satin lining. Designed for 30ml-100ml fragrance bottles. Custom branding and sizes. MOQ 500pcs from Shanghai.",
    metaKeywords:
      "perfume box, fragrance packaging, perfume presentation box, cosmetic box wholesale, custom perfume packaging, luxury fragrance box",
  },
  {
    name: "Rose Gold Skincare Packaging Box",
    slug: "rose-gold-skincare-packaging-box",
    shortDescription:
      "Trendy rose gold skincare box with soft-touch lamination and custom insert tray.",
    description: `Capitalize on the rose gold trend with our stunning Skincare Packaging Box. The soft-touch lamination provides a tactile luxury feel, while the custom insert tray keeps serums, creams, and toners perfectly organized.

Features:
- Rose gold metallic paper or foil options
- Soft-touch matte lamination
- Custom insert tray for multiple products
- 1000gsm rigid construction
- Sleeve or magnetic closure options

Product Configurations:
- Single product box
- Duo set (2 products)
- Trio set (3 products)
- Full regimen set (4-6 products)

Insert Materials:
- EVA foam with velvet flocking
- Molded pulp (eco-friendly)
- Cardboard with satin lining
- Custom thermoformed plastic`,
    price: "4.06",
    categorySlug: "cosmetic-packaging",
    imageFile: "product-rose-gold-skincare-box.jpg",
    featured: true,
    stock: 1500,
    minOrderQty: 500,
    metaTitle: "Rose Gold Skincare Packaging Box | Custom Beauty Box Wholesale",
    metaDescription:
      "Trendy rose gold skincare boxes with soft-touch finish and custom inserts. Perfect for serum sets, cream collections, and beauty regimens. MOQ 500pcs. Factory direct.",
    metaKeywords:
      "rose gold skincare box, cosmetic packaging box, beauty box wholesale, skincare set packaging, custom beauty packaging, rose gold cosmetic box",
  },
  {
    name: "Art Deco Makeup Palette Box",
    slug: "art-deco-makeup-palette-box",
    shortDescription:
      "Vintage-inspired makeup palette case with art deco pattern and metallic accents.",
    description: `Inspired by the glamour of the 1920s, our Art Deco Makeup Palette Box features striking geometric patterns and metallic accents that make your product impossible to ignore on retail shelves.

Features:
- Art deco geometric pattern printing
- Metallic gold or copper accents
- Hinged lid with mirror option
- 800gsm folding carton or 1000gsm rigid options
- Custom-shaped window cutouts

Palette Sizes:
- Eyeshadow palettes: 4-pan to 24-pan
- Face palettes: blush, bronzer, highlighter
- Lip palettes: 6 to 12 shades
- Custom shaped palettes

Special Features:
- Mirror integration in lid
- Magnetic pan holders
- Brush compartment
- Protective sleeve or overwrap`,
    price: "2.94",
    categorySlug: "cosmetic-packaging",
    imageFile: "product-art-deco-makeup-palette-box.jpg",
    featured: false,
    stock: 2500,
    minOrderQty: 1000,
    metaTitle:
      "Art Deco Makeup Palette Box | Custom Cosmetic Packaging Wholesale",
    metaDescription:
      "Vintage art deco makeup palette boxes with metallic accents. Custom shapes and sizes for eyeshadow, face, and lip palettes. MOQ 1000pcs from Shanghai manufacturer.",
    metaKeywords:
      "makeup palette box, art deco cosmetic packaging, eyeshadow palette case, custom makeup packaging, cosmetic palette box wholesale",
  },
  {
    name: "Blush Pink Lipstick Drawer Box",
    slug: "blush-pink-lipstick-drawer-box",
    shortDescription:
      "Slide-out drawer box for lipstick with blush pink wrap and gold foil logo.",
    description: `Our Blush Pink Lipstick Drawer Box offers a delightful slide-out mechanism that reveals your lipstick in style. The compact, elegant design is perfect for single lipsticks or small lip collections.

Features:
- Smooth slide-out drawer mechanism
- Blush pink specialty paper wrap
- Gold foil logo on drawer front
- 1000gsm rigid construction
- Ribbon pull tab

Configurations:
- Single lipstick box
- Duo lipstick set
- Lip gloss and liner combo
- Mini lip collection (3-4 pieces)

Interior Options:
- EVA foam with lipstick cavity
- Satin lining with elastic holder
- Cardboard insert with die-cut window
- Magnetic holder for metal tubes`,
    price: "1.96",
    categorySlug: "cosmetic-packaging",
    imageFile: "product-blush-pink-lipstick-drawer-box.jpg",
    featured: false,
    stock: 3000,
    minOrderQty: 1000,
    metaTitle: "Blush Pink Lipstick Drawer Box | Custom Lipstick Packaging",
    metaDescription:
      "Elegant slide-out drawer boxes for lipstick in blush pink. Single or multi-piece configurations with custom branding. MOQ 1000pcs. Factory direct pricing.",
    metaKeywords:
      "lipstick drawer box, blush pink cosmetic box, lipstick packaging wholesale, custom lipstick box, slide out drawer box, makeup packaging",
  },
  {
    name: "Eco-Friendly Botanical Cosmetic Box",
    slug: "eco-friendly-botanical-cosmetic-box",
    shortDescription:
      "Sustainable cosmetic packaging with botanical print and compostable window film.",
    description: `Showcase your commitment to sustainability with our Eco-Friendly Botanical Cosmetic Box. Made from recycled and biodegradable materials, this packaging proves that eco-conscious design can be beautiful.

Features:
- 100% recycled cardboard construction
- Soy-based vegetable inks
- Compostable PLA window film
- Botanical illustration printing
- Plastic-free packaging

Certifications Available:
- FSC-certified paper
- Compostable film certification
- Carbon neutral production option
- Zero-waste manufacturing

Product Applications:
- Organic skincare
- Natural cosmetics
- Vegan beauty products
- Essential oil sets
- Herbal remedies

Customization:
- Seed paper tags that grow into plants
- Water-based coatings instead of lamination
- Soy ink color matching
- Embossed botanical patterns`,
    price: "2.73",
    categorySlug: "cosmetic-packaging",
    imageFile: "product-eco-friendly-botanical-cosmetic.jpg",
    featured: true,
    stock: 2000,
    minOrderQty: 500,
    metaTitle:
      "Eco-Friendly Botanical Cosmetic Box | Sustainable Beauty Packaging",
    metaDescription:
      "Sustainable botanical cosmetic boxes with compostable window film and soy inks. FSC-certified recycled materials. Perfect for organic and vegan beauty brands. MOQ 500pcs.",
    metaKeywords:
      "eco friendly cosmetic box, sustainable beauty packaging, botanical packaging, compostable cosmetic box, organic skincare packaging, green beauty box",
  },

  // ── Jewelry & Watch Boxes ──
  {
    name: "Rose Gold Necklace Jewelry Box",
    slug: "rose-gold-necklace-jewelry-box",
    shortDescription:
      "Elegant necklace box in rose gold with velvet interior and magnetic closure.",
    description: `Present necklaces and pendants in stunning style with our Rose Gold Necklace Jewelry Box. The exterior rose gold finish catches the light beautifully, while the plush velvet interior protects precious pieces.

Features:
- Rose gold metallic paper or foil exterior
- Premium velvet interior (black, white, or custom color)
- Necklace hook and cushion insert
- Magnetic closure
- 800gsm rigid construction

Size Options:
- Small: 8x8x3.5cm (pendants and small necklaces)
- Medium: 10x10x4cm (standard necklaces)
- Large: 12x12x4.5cm (statement pieces)

Interior Configurations:
- Necklace hook with velvet cushion
- Chain slot with elastic holder
- Dual compartment for necklace and earrings
- Custom molded insert for unique pieces

Branding:
- Foil stamped logo on lid
- Embossed pattern on exterior
- Custom printed interior lid
- Ribbon accent in brand colors`,
    price: "3.15",
    categorySlug: "jewelry-watch-boxes",
    imageFile: "product-rose-gold-necklace-box.jpg",
    featured: true,
    stock: 2000,
    minOrderQty: 500,
    metaTitle:
      "Rose Gold Necklace Jewelry Box | Custom Jewelry Packaging Wholesale",
    metaDescription:
      "Elegant rose gold necklace boxes with velvet interior and magnetic closure. Custom sizes and branding for jewelry brands. MOQ 500pcs from Shanghai.",
    metaKeywords:
      "rose gold jewelry box, necklace box wholesale, custom jewelry packaging, velvet jewelry box, pendant box, jewelry gift box",
  },
  {
    name: "Velvet Ring Box",
    slug: "velvet-ring-box",
    shortDescription:
      "Classic velvet ring box with hinged lid and soft cushion insert.",
    description: `The timeless Velvet Ring Box is the perfect presentation for engagement rings, wedding bands, and fine jewelry. The luxurious velvet exterior and soft cushion insert create an emotional unboxing moment.

Features:
- Plush velvet exterior (multiple colors)
- Soft velvet or satin cushion insert
- Hinged lid with stay-open feature
- Compact, elegant proportions
- 600gsm rigid construction with velvet wrap

Color Options:
- Classic: Black, navy, burgundy, emerald
- Romantic: Blush pink, ivory, lavender
- Bold: Red, royal blue, teal
- Custom dyed to match brand colors

Occasions:
- Engagement and wedding rings
- Anniversary gifts
- Promise rings
- Fashion and costume jewelry
- Birthstone presents

Special Features:
- LED light option for illuminated presentation
- Dual ring slot for wedding sets
- Secret compartment under cushion
- Custom engraved metal plate on lid`,
    price: "2.24",
    categorySlug: "jewelry-watch-boxes",
    imageFile: "product-velvet-ring-box.jpg",
    featured: true,
    stock: 3000,
    minOrderQty: 500,
    metaTitle: "Velvet Ring Box | Custom Engagement Ring Packaging Wholesale",
    metaDescription:
      "Classic velvet ring boxes with hinged lid and cushion insert. Perfect for engagement rings, wedding bands, and fine jewelry. Custom colors and branding. MOQ 500pcs.",
    metaKeywords:
      "velvet ring box, engagement ring box, wedding ring box, custom ring packaging, jewelry ring box wholesale, ring gift box",
  },
  {
    name: "Earring Display Card Box",
    slug: "earring-display-card-box",
    shortDescription:
      "Compact box with display card insert for stud and drop earrings.",
    description: `Our Earring Display Card Box combines practical storage with beautiful presentation. The custom display card insert keeps pairs organized and visible, while the compact box protects them during shipping and display.

Features:
- Compact rectangular design
- Custom printed display card insert
- Clear lid or solid lid options
- 350gsm folding carton or 800gsm rigid options
- Hanging tab for retail display

Display Card Options:
- Printed with brand logo and product info
- Velvet or foam backing for stud earrings
- Hook slots for drop and dangle earrings
- Multi-pair cards (2, 3, or 4 pairs)

Box Styles:
- Matchbox style (sliding drawer)
- Hinged lid with magnetic closure
- Clear window top
- Pillow box style

Customization:
- Full-color printing on box and card
- Foil accents on logo or borders
- Embossed patterns
- Custom die-cut shapes`,
    price: "1.26",
    categorySlug: "jewelry-watch-boxes",
    imageFile: "product-earring-card-box.jpg",
    featured: false,
    stock: 5000,
    minOrderQty: 1000,
    metaTitle: "Earring Display Card Box | Custom Earring Packaging Wholesale",
    metaDescription:
      "Compact earring boxes with custom display card inserts. Perfect for stud and drop earrings. Matchbox, hinged, and window styles available. MOQ 1000pcs.",
    metaKeywords:
      "earring box, earring display card, stud earring packaging, custom earring box, jewelry display box, earring gift box wholesale",
  },
  {
    name: "Wooden Watch Display Box",
    slug: "wooden-watch-display-box",
    shortDescription:
      "Premium wood-grain finish box with watch pillow and glass viewing window.",
    description: `The Wooden Watch Display Box elevates timepiece presentation with its sophisticated wood-grain finish and thoughtful interior design. The plush watch pillow cradles automatic and quartz watches perfectly.

Features:
- Real wood veneer or high-quality wood-grain paper
- Plush velvet or leatherette watch pillow
- Glass viewing window in lid
- Hinged lid with brass hinge
- 1200gsm rigid construction with wood exterior

Capacity Options:
- Single watch
- Double watch (2 pillows)
- Triple watch
- Five-watch collector box
- Ten-watch display case

Interior Features:
- Removable watch pillows
- Cushioned watch slots
- Secret drawer for tools and extra links
- Watch strap storage compartment

Branding:
- Laser-engraved logo on wood
- Metal plate with engraved brand
- Foil stamping on interior lid
- Custom printed watch pillow tags`,
    price: "10.50",
    categorySlug: "jewelry-watch-boxes",
    imageFile: "product-wooden-watch-box.jpg",
    featured: true,
    stock: 800,
    minOrderQty: 200,
    metaTitle: "Wooden Watch Display Box | Custom Watch Packaging Wholesale",
    metaDescription:
      "Premium wood-grain watch boxes with velvet pillows and glass window. Single to ten-watch capacities available. Laser engraving and custom branding. MOQ 200pcs.",
    metaKeywords:
      "wooden watch box, watch display box, watch gift box, custom watch packaging, wood watch case, luxury watch box wholesale",
  },
  {
    name: "Multi-Tier Jewelry Organizer",
    slug: "multi-tier-jewelry-organizer",
    shortDescription:
      "Three-tier jewelry box with drawers for rings, necklaces, and earrings.",
    description: `Keep jewelry collections organized and beautifully displayed with our Multi-Tier Jewelry Organizer. Three pull-out drawers provide dedicated space for different jewelry types, while the compact footprint saves vanity space.

Features:
- Three-tier pull-out drawer design
- Ring roll in top drawer
- Necklace hooks in middle drawer
- Earring slots in bottom drawer
- Mirror in lid interior
- 1000gsm rigid construction

Dimensions:
- Overall: 15x12x10cm
- Drawer depth: 3cm each
- Weight: 450g

Interior Materials:
- Velvet lining (multiple color options)
- Satin lining
- Leatherette
- Anti-tarnish fabric for silver jewelry

Exterior Options:
- Quilted pattern
- Smooth finish
- Embossed logo
- Decorative clasp or ribbon

Perfect For:
- Jewelry brand packaging
- Retail display
- Personal travel organizer
- Gift box for jewelry sets`,
    price: "9.45",
    categorySlug: "jewelry-watch-boxes",
    imageFile: "product-multi-tier-organizer.jpg",
    featured: false,
    stock: 1000,
    minOrderQty: 300,
    metaTitle: "Multi-Tier Jewelry Organizer | Custom Jewelry Box Wholesale",
    metaDescription:
      "Three-tier jewelry organizers with dedicated drawers for rings, necklaces, and earrings. Mirror lid and velvet lining. Custom branding available. MOQ 300pcs from Shanghai.",
    metaKeywords:
      "jewelry organizer box, multi tier jewelry box, ring drawer box, necklace organizer, custom jewelry packaging, travel jewelry case",
  },

  // ── Food & Beverage Packaging ──
  {
    name: "Chocolate Truffle Gift Box",
    slug: "chocolate-truffle-gift-box",
    shortDescription:
      "Food-safe truffle box with insert tray and gold foil accent lid.",
    description: `Present artisanal chocolates in packaging as exquisite as the confections inside. Our Chocolate Truffle Gift Box features food-safe materials and a custom insert tray that keeps each piece perfectly positioned.

Features:
- Food-grade 350gsm white card with grease-resistant coating
- Custom molded insert tray (6, 9, 12, 16, or 24 pieces)
- Gold foil accent on lid
- Ribbon tie or magnetic closure
- Optional clear window

Food Safety:
- FDA-compliant food-grade materials
- Grease-resistant barrier coating
- Odor-free construction
- Moisture-resistant options

Tray Options:
- Paper pulp trays (eco-friendly)
- Plastic blister trays (PET or rPET)
- Foil-backed paper trays
- Custom molded options

Customization:
- Full-color printing of flavor guide
- Foil stamping for brand and accents
- Embossed patterns
- Seasonal and holiday designs
- Custom window shapes`,
    price: "2.80",
    categorySlug: "food-beverage-packaging",
    imageFile: "product-chocolate-truffle-box.jpg",
    featured: true,
    stock: 2500,
    minOrderQty: 500,
    metaTitle:
      "Chocolate Truffle Gift Box | Custom Food-Safe Packaging Wholesale",
    metaDescription:
      "Food-safe chocolate truffle boxes with custom insert trays. FDA-compliant materials for 6-24 pieces. Gold foil and custom printing. MOQ 500pcs from Shanghai.",
    metaKeywords:
      "chocolate truffle box, chocolate gift box, food safe packaging, custom chocolate box, confectionery packaging, truffle box wholesale",
  },
  {
    name: "Honey Gift Set Packaging",
    slug: "honey-gift-set-packaging",
    shortDescription:
      "Rustic honey gift box with kraft finish and custom jar holder insert.",
    description: `Our Honey Gift Set Packaging captures the natural, artisanal appeal of premium honey products. The rustic kraft finish and custom jar holder create a farmhouse-chic presentation that appeals to gourmet food lovers.

Features:
- 350gsm kraft paper construction
- Custom die-cut jar holder insert
- Rope or twine tie closure
- Window option to show honey color
- Optional honey dipper compartment

Jar Sizes Supported:
- Mini: 50ml hex jars
- Standard: 250ml round jars
- Large: 500ml round jars
- Multi-jar configurations (2-4 jars)

Special Features:
- Bee-themed printing options
- Honeycomb pattern embossing
- Wax seal style stickers
- Recipe card slot
- Gift tag with honey origin story

Sustainability:
- Recyclable kraft paper
- Soy-based inks
- Compostable window film option
- Plastic-free construction available`,
    price: "3.85",
    categorySlug: "food-beverage-packaging",
    imageFile: "product-honey-gift-set.jpg",
    featured: false,
    stock: 2000,
    minOrderQty: 500,
    metaTitle: "Honey Gift Set Packaging | Custom Food Packaging Wholesale",
    metaDescription:
      "Rustic kraft honey gift boxes with custom jar holders. Supports 50ml-500ml jars, single or multi-jar sets. Eco-friendly options available. MOQ 500pcs.",
    metaKeywords:
      "honey gift box, honey jar packaging, artisan food box, kraft honey box, custom food packaging, gourmet gift box",
  },
  {
    name: "Kraft Bakery Box",
    slug: "kraft-bakery-box",
    shortDescription:
      "Grease-resistant kraft box for pastries, cupcakes, and baked goods.",
    description: `Designed for bakeries and pastry shops, our Kraft Bakery Box keeps baked goods fresh and presentable. The grease-resistant coating prevents oil stains while the sturdy construction protects delicate items during transport.

Features:
- 300-400gsm kraft paperboard
- Grease-resistant interior coating
- Window option for product visibility
- Handle or gable top options
- Stackable design for delivery

Sizes Available:
- Mini: 10x10x8cm (macarons, cookies)
- Small: 15x10x10cm (cupcakes, muffins)
- Medium: 20x15x10cm (cakes, tarts)
- Large: 25x20x12cm (whole cakes, pie)

Specialty Options:
- Cupcake insert (holds 1, 2, 4, 6, or 12)
- Macaron tray insert
- Cookie divider
- Cake board integration
- Window patch for product display

Customization:
- Full-color brand printing
- Sticker and label compatible
- Custom die-cut handles
- Seasonal design templates
- QR code printing for online ordering`,
    price: "1.54",
    categorySlug: "food-beverage-packaging",
    imageFile: "product-kraft-bakery-box.jpg",
    featured: false,
    stock: 5000,
    minOrderQty: 1000,
    metaTitle: "Kraft Bakery Box | Custom Food Packaging Wholesale",
    metaDescription:
      "Grease-resistant kraft bakery boxes for pastries, cupcakes, and cakes. Window and insert options available. Custom branding for bakeries. MOQ 1000pcs.",
    metaKeywords:
      "kraft bakery box, pastry box, cupcake box, grease resistant box, custom bakery packaging, food safe kraft box",
  },
  {
    name: "Premium Tea Tube Packaging",
    slug: "premium-tea-tube-packaging",
    shortDescription:
      "Cylinder tube for loose-leaf tea with airtight inner seal and gold rim.",
    description: `Our Premium Tea Tube Packaging offers a distinctive cylindrical presentation for loose-leaf teas, tea bags, and herbal blends. The airtight inner seal preserves freshness while the elegant exterior tells your brand story.

Features:
- Sturdy cardboard tube construction
- Airtight aluminum foil inner seal
- Metal or plastic end caps with gold rim
- 250ml to 500ml capacities
- Custom diameter and height

Tea Types:
- Loose-leaf tea (50g-200g)
- Pyramid tea bags (10-30 count)
- Herbal blend pouches
- Gift sampler collections

Design Elements:
- Full-color wrap printing
- Foil stamping on lid
- Embossed texture patterns
- Window cutout for tea visibility
- Tea origin story printing

Eco Options:
- Recycled cardboard tube
- Biodegradable end caps
- Compostable inner seal
- Plant-based inks
- Plastic-free construction`,
    price: "2.66",
    categorySlug: "food-beverage-packaging",
    imageFile: "product-tea-tube.jpg",
    featured: false,
    stock: 3000,
    minOrderQty: 1000,
    metaTitle: "Premium Tea Tube Packaging | Custom Tea Packaging Wholesale",
    metaDescription:
      "Cylinder tea tubes with airtight foil seal and gold rim. For loose-leaf tea, tea bags, and samplers. Custom sizes and eco-friendly options. MOQ 1000pcs.",
    metaKeywords:
      "tea tube packaging, tea cylinder box, loose leaf tea packaging, custom tea box, tea gift tube, herbal tea packaging",
  },
  {
    name: "Macaron Drawer Gift Box",
    slug: "macaron-drawer-gift-box",
    shortDescription:
      "Pastel drawer box with individual macaron slots and clear window.",
    description: `The Macaron Drawer Gift Box is specifically designed to showcase and protect delicate French macarons. The individual slots prevent shifting and crushing, while the clear window tempts customers with a colorful preview.

Features:
- Smooth slide-out drawer mechanism
- Individual die-cut slots for each macaron
- Clear PVC or PET window in lid
- Pastel color options
- 800gsm rigid construction

Capacity Options:
- Petite: 6 macarons
- Standard: 12 macarons
- Deluxe: 24 macarons
- Grand: 36 macarons

Slot Sizes:
- Standard: 5cm diameter (standard macarons)
- Mini: 3.5cm diameter (mini macarons)
- Jumbo: 6cm diameter (oversized macarons)

Customization:
- Full-color printing with flavor guide
- Foil stamping for brand and accents
- Ribbon pull in brand colors
- Custom window shapes (heart, star, etc.)
- Seasonal design variations
- Personalized message printing`,
    price: "3.36",
    categorySlug: "food-beverage-packaging",
    imageFile: "product-macaron-drawer-box.jpg",
    featured: true,
    stock: 2000,
    minOrderQty: 500,
    metaTitle: "Macaron Drawer Gift Box | Custom Macaron Packaging Wholesale",
    metaDescription:
      "Pastel drawer boxes with individual macaron slots and clear window. Holds 6-36 macarons in standard, mini, or jumbo sizes. Custom branding. MOQ 500pcs.",
    metaKeywords:
      "macaron box, macaron drawer box, macaron gift box, custom macaron packaging, pastel dessert box, french macaron box",
  },

  // ── Luxury & Corporate Packaging ──
  {
    name: "Leather Corporate Gift Box",
    slug: "leather-corporate-gift-box",
    shortDescription:
      "Executive gift box with leather-textured wrap and brass clasp closure.",
    description: `Make a lasting impression with our Leather Corporate Gift Box. The premium leather-textured wrap and brass clasp closure convey professionalism and quality, perfect for executive gifts and corporate recognition programs.

Features:
- High-quality leather-textured paper wrap
- Brass or antique gold clasp closure
- 1500gsm ultra-rigid construction
- Velvet or suede interior lining
- Embossed logo area on lid

Corporate Applications:
- Executive welcome kits
- Employee recognition gifts
- Client appreciation boxes
- Conference and event swag
- Holiday corporate gifting

Size Options:
- Small: 20x15x8cm (stationery, tech accessories)
- Medium: 25x20x10cm (wine, books, combo gifts)
- Large: 30x25x12cm (premium gift sets)
- Custom dimensions available

Interior Configurations:
- Custom molded EVA foam
- Satin-lined compartments
- Document sleeve
- Pen and accessory holders
- Certificate or plaque display

Branding:
- Debossed leather logo
- Metal plate engraving
- Foil stamping
- Custom printed interior
- Branded ribbon or seal`,
    price: "11.20",
    categorySlug: "luxury-corporate-packaging",
    imageFile: "product-leather-corporate-box.jpg",
    featured: true,
    stock: 600,
    minOrderQty: 200,
    metaTitle:
      "Leather Corporate Gift Box | Executive Custom Packaging Wholesale",
    metaDescription:
      "Premium leather-textured corporate gift boxes with brass clasp. Executive welcome kits, client appreciation, and recognition gifts. Custom branding. MOQ 200pcs.",
    metaKeywords:
      "leather gift box, corporate gift box, executive packaging, luxury corporate box, custom business gift box, leather textured box",
  },
  {
    name: "Premium Wine Case",
    slug: "premium-wine-case",
    shortDescription:
      "Single or dual bottle wine case with satin lining and rope handle.",
    description: `Our Premium Wine Case elevates wine gifting with sophisticated design and protective construction. The satin-lined interior cradles bottles securely while the rope handle adds a touch of rustic elegance.

Features:
- 1500gsm rigid construction
- Satin or velvet interior lining
- Rope or leather handle
- Magnetic or ribbon closure
- Custom bottle cavity molding

Configurations:
- Single bottle (standard 750ml)
- Single bottle (magnum 1.5L)
- Dual bottle (two 750ml)
- Three-bottle carrier
- Six-bottle gift set

Interior Options:
- EVA foam bottle cradle
- Satin-lined bottle sleeve
- Accessory compartment (corkscrew, stopper)
- Gift card slot
- Tissue paper and shreds

Exterior Design:
- Full-color wrap printing
- Foil stamping for vineyard logo
- Embossed grapevine patterns
- Leather-textured options
- Wood-grain finish options

Special Features:
- Reinforced corners for shipping protection
- Water-resistant coating
- Temperature insulation option
- Custom shape (book style, chest style)`,
    price: "7.35",
    categorySlug: "luxury-corporate-packaging",
    imageFile: "product-wine-case.jpg",
    featured: true,
    stock: 1000,
    minOrderQty: 300,
    metaTitle: "Premium Wine Case | Custom Wine Packaging Wholesale",
    metaDescription:
      "Premium single and dual bottle wine cases with satin lining and rope handle. Custom cavity molding for 750ml and magnum bottles. MOQ 300pcs from Shanghai.",
    metaKeywords:
      "wine gift box, wine case wholesale, custom wine packaging, bottle gift box, wine carrier box, vineyard packaging",
  },
  {
    name: "Blush Pink Ribbon Luxury Gift Bag",
    slug: "blush-pink-ribbon-luxury-gift-bag",
    shortDescription:
      "Heavy-duty luxury gift bag with satin ribbon handles and reinforced base.",
    description: `When a box isn't the right choice, our Blush Pink Ribbon Luxury Gift Bag offers an elegant alternative. The heavy-duty construction and satin ribbon handles create a premium shopping and gifting experience.

Features:
- 250-350gsm coated art paper
- Satin ribbon handles (knotted or riveted)
- Reinforced cardboard base
- Magnetic snap closure option
- UV or foil accent options

Size Options:
- Small: 15x8x20cm (jewelry, accessories)
- Medium: 20x10x25cm (cosmetics, small gifts)
- Large: 25x12x30cm (clothing, shoes)
- Extra Large: 30x15x35cm (blankets, large items)

Handle Options:
- Satin ribbon (multiple colors)
- Grosgrain ribbon
- Rope handles
- Die-cut handles
- Leather-look handles

Finishing:
- Matte or glossy lamination
- Spot UV accents
- Foil stamping
- Embossed patterns
- Full-color printing
- Rope or tassel accents

Customization:
- Custom size and proportions
- Brand color matching
- Seasonal and holiday designs
- QR code printing
- Interior printing
- Tissue paper and sticker sets`,
    price: "1.75",
    categorySlug: "luxury-corporate-packaging",
    imageFile: "product-blush-ribbon-bag.jpg",
    featured: false,
    stock: 5000,
    minOrderQty: 1000,
    metaTitle: "Blush Pink Ribbon Luxury Gift Bag | Custom Gift Bag Wholesale",
    metaDescription:
      "Heavy-duty luxury gift bags with satin ribbon handles and reinforced base. Multiple sizes for jewelry to clothing. Custom branding and colors. MOQ 1000pcs.",
    metaKeywords:
      "luxury gift bag, ribbon gift bag, custom gift bag wholesale, blush pink gift bag, satin handle bag, premium shopping bag",
  },
];

// ─── Seed Function ───────────────────────────────────────

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log("🌱 Starting seed...\n");

  // ── Seed Categories ──
  console.log("📂 Seeding categories...");
  const categoryIdMap = new Map<string, number>();

  for (const cat of categoryData) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      const id = existing[0].id;
      // Backfill category image if the existing record is missing one
      if (cat.image) {
        const [record] = await db
          .select({ image: categories.image })
          .from(categories)
          .where(eq(categories.id, id))
          .limit(1);
        if (!record?.image) {
          await db
            .update(categories)
            .set({ image: cat.image })
            .where(eq(categories.id, id));
          console.log(`  🖼️  Backfilled image for category: ${cat.name}`);
        }
      }
      console.log(`  ⏭️  Category exists: ${cat.name} (ID: ${id})`);
      categoryIdMap.set(cat.slug, id);
    } else {
      const result = await db.insert(categories).values(cat);
      const id = Number(result[0].insertId);
      console.log(`  ✅ Created category: ${cat.name} (ID: ${id})`);
      categoryIdMap.set(cat.slug, id);
    }
  }

  // ── Seed Products ──
  console.log("\n📦 Seeding products...");
  let created = 0;
  let skipped = 0;

  for (const item of productData) {
    const categoryId = categoryIdMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ⏭️  Skipped (category not found): ${item.name}`);
      skipped++;
      continue;
    }

    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, item.slug))
      .limit(1);

    if (existing.length > 0) {
      console.warn(`  ⏭️  Skipped (exists): ${item.name}`);
      skipped++;
      continue;
    }

    const data = {
      name: item.name,
      slug: item.slug,
      description: item.description,
      shortDescription: item.shortDescription,
      price: item.price,
      categoryId,
      images: JSON.stringify([`/products/${item.imageFile}`]),
      featured: item.featured,
      status: "active" as const,
      stock: item.stock,
      minOrderQty: item.minOrderQty,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      metaKeywords: item.metaKeywords,
    };

    try {
      const result = await db.insert(products).values(data);
      console.log(`  ✅ Created: ${item.name} (ID: ${result[0].insertId})`);
      created++;
    } catch (err) {
      console.error(`  ❌ Failed: ${item.name}:`, err);
      skipped++;
    }
  }

  console.log(
    `\n🎉 Done! Categories: ${categoryIdMap.size}, Products created: ${created}, Skipped: ${skipped}`
  );
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
