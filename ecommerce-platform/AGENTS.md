# DY Packs E-Commerce Platform — Agent Guide

> **Purpose:** This document helps AI coding agents understand the project structure, conventions, and development workflow. It is written in English because all source code comments and documentation in the project use English.

---

## Project Overview

This is a **full-stack B2B e-commerce platform** for DY Packs (Shanghai Douyue Industrial Co., Ltd), a custom packaging manufacturer. The platform targets international buyers and supports inquiry/quote-based wholesale transactions rather than pure online checkout.

**Key characteristics:**

- Monolithic architecture with clear client/server/shared separation
- tRPC for end-to-end type-safe APIs (no REST except OAuth callback and sitemap)
- B2B-focused: "Add to Inquiry List" + quote request system
- Multi-language: English (fallback), Turkish, Russian, Spanish
- Comprehensive SEO: JSON-LD schemas, dynamic sitemap, meta tags, blog system, centralized `client/src/lib/seo.ts` hook/config, plus strategy docs `SEO-KEYWORD-MAPPING.md`, `BACKLINK-BUILDING-GUIDE.md`, and sample content in `content-samples/`
- Dual image storage: Alibaba Cloud OSS (primary) → Manus Forge Storage (fallback)

---

## Technology Stack

| Layer              | Technology                             | Version         |
| ------------------ | -------------------------------------- | --------------- |
| Runtime            | Node.js                                | 20+             |
| Language           | TypeScript                             | 5.9.3 (ESM)     |
| Package Manager    | pnpm                                   | 10.4.1          |
| Frontend Framework | React                                  | 19.2.1          |
| Build Tool         | Vite                                   | 7.1.7           |
| CSS Framework      | Tailwind CSS                           | 4.1.14          |
| UI Components      | shadcn/ui + Radix UI                   | ~50 components  |
| Router             | Wouter                                 | 3.3.5 (patched) |
| State Management   | TanStack Query (React Query)           | 5.90.2          |
| Forms              | React Hook Form + Zod                  | 7.64.0 / 4.1.12 |
| Animation          | Framer Motion                          | 12.23.22        |
| i18n               | i18next + react-i18next                | 24.2.3          |
| Backend Framework  | Express                                | 4.21.2          |
| API                | tRPC                                   | 11.6.0          |
| Database ORM       | Drizzle ORM                            | 0.44.5          |
| Database           | MySQL                                  | (via mysql2)    |
| Auth               | OAuth 2.0 + JWT (jose)                 | 6.1.0           |
| Storage            | Alibaba Cloud OSS (@aws-sdk/client-s3) | 3.693.0         |
| Email              | Nodemailer                             | 6.9.16          |
| Test Runner        | Vitest                                 | 2.1.4           |

---

## Project Structure

```
ecommerce-platform/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── _core/hooks/             # Core auth hook (useAuth)
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # 50+ shadcn/ui components
│   │   │   ├── CarolChatbot.tsx     # AI chatbot for inquiry collection
│   │   │   ├── Navbar.tsx, Footer.tsx
│   │   │   ├── HeroCarousel.tsx     # Homepage product carousel
│   │   │   ├── ProductReviews.tsx   # Review system
│   │   │   ├── SchemaMarkup.tsx     # JSON-LD SEO schemas
│   │   │   └── ...                  # Various page components
│   │   ├── contexts/                # React contexts (ThemeContext)
│   │   ├── hooks/                   # Custom hooks (useMobile, useComposition)
│   │   ├── i18n/                    # i18n config + 4 locale JSON files
│   │   ├── lib/                     # Utilities (trpc client, constants, utils, seo)
│   │   ├── pages/                   # 17 page components (route-level)
│   │   ├── App.tsx                  # Router definition (wouter)
│   │   ├── main.tsx                 # Entry point (trpc provider, query client)
│   │   ├── index.css                # Tailwind v4 theme + custom palette
│   │   └── const.ts                 # Frontend constants
│   └── index.html
├── server/                          # Backend Express + tRPC application
│   ├── _core/                       # Core server infrastructure
│   │   ├── index.ts                 # Express server setup, sitemap, tRPC middleware
│   │   ├── trpc.ts                  # tRPC router/procedure setup
│   │   ├── context.ts               # tRPC context creation (auth from cookies)
│   │   ├── oauth.ts                 # OAuth callback + local admin login routes
│   │   ├── sdk.ts                   # OAuth SDK (token exchange, JWT sessions)
│   │   ├── cookies.ts               # Cookie options (secure, httpOnly, sameSite)
│   │   ├── env.ts                   # Environment variable consolidation
│   │   ├── vite.ts                  # Vite dev server integration / static serving
│   │   ├── oss.ts                   # Alibaba Cloud OSS upload module
│   │   ├── storage.ts               # Manus Forge storage fallback
│   │   ├── systemRouter.ts          # Health check + owner notification
│   │   └── types/                   # Type definitions
│   ├── db.ts                        # ALL database operations (Drizzle ORM, ~614 lines)
│   ├── routers.ts                   # ALL tRPC routers (~615 lines, 8 domain routers)
│   ├── storage.ts                   # Storage helpers (re-export)
│   └── *.test.ts                    # Vitest test files
├── shared/                          # Shared code between client and server
│   ├── _core/errors.ts              # Shared error classes (HttpError, etc.)
│   ├── const.ts                     # Shared constants (cookie name, error messages)
│   └── types.ts                     # Re-exports from drizzle/schema
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                    # Drizzle table definitions (11 tables)
│   ├── relations.ts                 # Drizzle relations
│   ├── 0000_*.sql → 0003_*.sql      # Migration SQL files
│   └── meta/                        # Migration metadata
├── scripts/                         # Utility scripts
│   ├── bulk-import-products.ts      # Bulk product import from JSON
│   ├── migrate-images-to-oss.ts     # Image migration to Alibaba OSS
│   ├── seed-categories-and-products.ts
│   ├── compress-images.py           # Image compression
│   ├── gen_i18n.py                  # i18n generation helper
│   └── publish-blog-article-*.ts/sql # Blog publishing scripts
├── deploy.sh                        # Production deployment script (Baota + PM2)
├── update.sh                        # Update/rebuild script
├── vite.config.ts                   # Vite config with custom debug plugin
├── vitest.config.ts                 # Vitest configuration
├── drizzle.config.ts                # Drizzle Kit configuration
├── tsconfig.json                    # TypeScript configuration (ESM, bundler)
└── package.json                     # Dependencies and scripts
```

---

## Build and Development Commands

All commands use `pnpm`:

```bash
# Development — runs Express server with tsx watch mode, Vite HMR
pnpm dev

# Production build — Vite builds frontend to dist/public/, esbuild bundles server to dist/index.js
pnpm build

# Production start — runs bundled server
pnpm start

# Type check — tsc --noEmit
pnpm check

# Format code — Prettier
pnpm format

# Run tests — Vitest
pnpm test

# Database migrations — generate + migrate
pnpm db:push
```

**Build details:**

- Frontend: Vite builds to `dist/public/` with `emptyOutDir: true`
- Backend: esbuild bundles `server/_core/index.ts` to `dist/index.js` as ESM with external packages
- In development, Vite middleware handles HMR and SPA routing
- In production, Express serves static files from `dist/public/` with fallback to `index.html`

---

## Code Style Guidelines

### TypeScript

- **ESM modules** (`"type": "module"` in package.json)
- **Strict mode** enabled
- **Path aliases:**
  - `@/` → `client/src/`
  - `@shared/` → `shared/`
  - `@assets/` → `attached_assets/`

### Component Patterns

- **shadcn/ui architecture:** Radix UI primitives + Tailwind CSS + `class-variance-authority` for variants
- Use `cn()` utility (from `clsx` + `tailwind-merge`) for conditional class merging
- Custom color palette using OKLCH color space:
  - Primary: charcoal `oklch(0.42 0.02 75)`
  - Accent: gold `oklch(0.82 0.15 85)`
  - Font: Inter (sans), Playfair Display (heading)

### Naming Conventions

- React components: PascalCase (e.g., `ProductDetail.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Database tables: snake_case in schema, camelCase in TypeScript
- tRPC routers: camelCase (e.g., `productRouter`, `categoryRouter`)

### File Organization

- **Database operations are centralized** in `server/db.ts` — not split into repositories
- **All tRPC routers are in one file** `server/routers.ts` — 8 domain routers
- **Shared types** exported from `shared/types.ts` which re-exports from `drizzle/schema.ts`

---

## Database Schema

**11 tables** defined in `drizzle/schema.ts`:

| Table                 | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `users`               | User accounts (openId unique, role: user/admin)                     |
| `categories`          | Product categories (slug unique, sortOrder)                         |
| `products`            | Product catalog (slug unique, images JSON, SEO fields, status enum) |
| `cart_items`          | Shopping cart                                                       |
| `addresses`           | Shipping addresses                                                  |
| `orders`              | Orders (orderNumber unique, status/payment enums)                   |
| `order_items`         | Order line items                                                    |
| `blog_posts`          | Blog articles (slug unique, status: published/draft)                |
| `product_reviews`     | Product reviews (rating 1-5, status: approved/pending/rejected)     |
| `inquiry_items`       | B2B inquiry list                                                    |
| `inquiry_submissions` | B2B quote requests (inquiryNumber unique, items JSON)               |

**Migration approach:** Drizzle Kit generates SQL migrations from schema changes. Run `pnpm db:push` to generate and apply.

---

## Authentication & Authorization

### Three Procedure Types

1. **`publicProcedure`** — no authentication required
2. **`protectedProcedure`** — requires valid login (any role)
3. **`adminProcedure`** — requires `role === 'admin'`

### Auth Flow

- **Regular users:** OAuth 2.0 via Manus/WebDev auth server → JWT session cookie
- **Admin users:** Local password login at `/api/auth/local-login` → JWT session cookie
- **Auto-promotion:** User with `OWNER_OPEN_ID` automatically gets admin role
- Session cookies: `httpOnly`, `secure` (when HTTPS), `sameSite: "none"`, maxAge 1 year
- Cookie name: `app_session_id`

### Context

- tRPC context (`server/_core/context.ts`) extracts user from session cookie via `sdk.authenticateRequest()`
- Unauthenticated requests get `user: null` in context (allowed for public procedures)

---

## Testing Instructions

- **Test runner:** Vitest 2.1.4
- **Environment:** Node.js
- **Test files:** `server/**/*.test.ts`, `server/**/*.spec.ts`
- **Current test files:**
  - `server/ecommerce.test.ts` — tests Auth, Category, Product, Cart, Address, Order, Blog, Admin User routers
  - `server/review.test.ts` — tests Review router (public listing, rating stats, create, admin CRUD)
  - `server/auth.logout.test.ts` — tests logout cookie clearing

### Test Pattern

Tests use `appRouter.createCaller()` with mock contexts:

```typescript
// Public context — no user
const publicCtx = { user: null, req: {...}, res: {...} };

// User context — authenticated regular user
const userCtx = { user: { id: 1, openId: "...", role: "user", ... }, req: {...}, res: {...} };

// Admin context — authenticated admin user
const adminCtx = { user: { id: 99, openId: "...", role: "admin", ... }, req: {...}, res: {...} };
```

**No frontend tests** are currently configured.

---

## API Architecture (tRPC)

All API endpoints are tRPC procedures under `/api/trpc`. Domain routers:

| Router      | Public                                              | Protected                                          | Admin                               |
| ----------- | --------------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| `auth`      | `me`                                                | —                                                  | —                                   |
| `category`  | `list`, `getBySlug`                                 | —                                                  | `create`, `update`, `delete`        |
| `product`   | `list`, `getById`, `getBySlug`, `searchSuggestions` | —                                                  | `create`, `update`, `delete`        |
| `cart`      | —                                                   | `list`, `add`, `update`, `remove`, `clear`         | —                                   |
| `address`   | —                                                   | `list`, `create`, `update`, `delete`, `setDefault` | —                                   |
| `order`     | —                                                   | `list`, `create`, `getById`                        | `listAll`, `updateStatus`           |
| `blog`      | `list`, `getBySlug`                                 | —                                                  | `create`, `update`, `delete`        |
| `review`    | `list`, `stats`                                     | `create`                                           | `listAll`, `updateStatus`, `delete` |
| `inquiry`   | —                                                   | `list`, `add`, `update`, `remove`, `submit`        | `listAll`, `updateStatus`           |
| `adminUser` | —                                                   | —                                                  | `list`, `updateRole`                |
| `system`    | `health`                                            | —                                                  | `notifyOwner`                       |

**Input validation:** All mutations use Zod schemas.
**Serialization:** SuperJSON handles Date, Map, Set, BigInt, etc.

---

## Image Storage

Dual storage strategy:

1. **Alibaba Cloud OSS** (primary) — configured via `OSS_*` env variables
   - Uses `@aws-sdk/client-s3` with `forcePathStyle: true`
   - Upload via `ossPut(key, buffer, contentType)` → returns public URL

2. **Manus Forge Storage** (fallback) — built-in storage proxy
   - Used when OSS is not configured

Product images are stored as **JSON arrays** in `products.images` field.
Image upload flows through tRPC mutations as base64 strings.

---

## Environment Variables

Required for development/production:

```bash
# Database
DATABASE_URL=mysql://user:pass@host:3306/dbname

# Auth
JWT_SECRET=your-random-secret
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=admin-open-id
ADMIN_PASSWORD=admin-login-password

# App URL
VITE_APP_URL=https://www.dypacks.com

# OAuth (optional for local dev)
OAUTH_SERVER_URL=https://...
VITE_OAUTH_PORTAL_URL=https://...

# Alibaba OSS (optional)
OSS_BUCKET=your-bucket
OSS_REGION=oss-cn-shanghai
OSS_ENDPOINT=https://...
OSS_ACCESS_KEY_ID=...
OSS_ACCESS_KEY_SECRET=...
OSS_PUBLIC_URL=https://...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
NOTIFY_EMAIL=carolni@dypacks.com

# Manus Forge (fallback storage)
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
```

---

## Deployment

**Target environment:** Alibaba Cloud ECS + Baota Panel (宝塔面板) + Ubuntu/CentOS

**Deployment process (`deploy.sh`):**

1. Install Node.js 20, pnpm, PM2 if missing
2. Generate `.env` file
3. `pnpm install`
4. `pnpm build`
5. `pnpm db:push` for migrations
6. Start/restart PM2 process (`dypacks`)
7. Generate Nginx reverse proxy config reference
8. Health check via curl

**Update process (`update.sh`):**

1. `git pull` (if git repo)
2. `pnpm install`
3. `pnpm build`
4. `pnpm db:push`
5. `pm2 restart dypacks`
6. Health check

**Nginx config:** Static assets served directly, all other routes proxied to Node.js on port 3000.

---

## Security Considerations

- `httpOnly` session cookies prevent XSS token theft
- `sameSite: "none"` + `secure` for cross-origin cookie support
- All API inputs validated with Zod schemas
- Role-based access control on tRPC procedures
- Admin password stored only in environment variable
- Database connection string in environment variable only
- Image uploads go through tRPC with size limits (50mb body parser)

---

## SEO Implementation

- **Dynamic sitemap.xml** at `/api/sitemap.xml` — includes products, blog posts, categories
- **robots.txt** — allows all crawlers
- **JSON-LD schemas:**
  - `Organization` — site-wide
  - `WebSite` — site-wide
  - `Article` / `BlogPosting` — blog detail pages
  - `BreadcrumbList` — blog pages
- **Meta tags:** Dynamic per-page via React Helmet pattern
- **Multi-language:** i18next with `hreflang` support
- **Blog system:** Content marketing with SEO-optimized articles

---

## Special Notes for Agents

1. **Database is centralized** — all queries are in `server/db.ts`. Do not create separate repository files.
2. **Routers are centralized** — all tRPC routers are in `server/routers.ts`. Add new procedures to existing routers.
3. **Shared code** — use `shared/` for types/constants used by both client and server. Never import server-only code into client.
4. **Image handling** — always handle both OSS and fallback storage paths. Check `ossEnabled` before calling `ossPut`.
5. **i18n** — all user-facing strings should use `useTranslation()` hook. Add new keys to all 4 locale files.
6. **Tailwind v4** — uses `@import "tailwindcss"` and `@theme inline` syntax, not the v3 `tailwind.config.js` approach.
7. **Wouter** — lightweight router. Route params accessed via `useRoute()` or component props. Patched via pnpm.
8. **Testing** — tests use mock contexts with `appRouter.createCaller()`. No real database is hit.
9. **Development logs** — a custom Vite plugin writes browser console logs to `.manus-logs/` files (dev only).
