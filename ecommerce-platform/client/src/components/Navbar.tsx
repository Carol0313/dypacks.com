import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { BRAND_NAME, LOGO_URL } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  LogOut,
  Settings,
  ClipboardList,
  MapPin,
  X,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchAutocomplete from "./SearchAutocomplete";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("navbar.home") },
    { href: "/products", label: t("navbar.products") },
    { href: "/blog", label: t("navbar.blog") },
    { href: "/about", label: t("navbar.about") },
    { href: "/contact", label: t("navbar.contact") },
  ];

  const cartCountQuery = trpc.cart.count.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const cartCount = cartCountQuery.data ?? 0;

  const inquiryCountQuery = trpc.inquiry.count.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const inquiryCount = inquiryCountQuery.data ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src={LOGO_URL} alt={BRAND_NAME} className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {BRAND_NAME}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location === link.href
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Desktop Search - Expandable */}
          <div className="hidden sm:block relative">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <SearchAutocomplete
                  autoFocus
                  onClose={() => setSearchOpen(false)}
                  className="w-64 lg:w-80"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4.5 w-4.5" />
              </Button>
            )}
          </div>

          {/* Inquiry List */}
          {isAuthenticated && (
            <Link href="/inquiry">
              <Button variant="ghost" size="icon" className="relative">
                <FileText className="h-4.5 w-4.5" />
                {inquiryCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] bg-gold text-charcoal-dark font-bold">
                    {inquiryCount > 99 ? "99+" : inquiryCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Cart */}
          {isAuthenticated && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] bg-gold text-charcoal-dark font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name || t("navbar.user")}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/account">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {t("navbar.myAccount")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/account/orders">
                  <DropdownMenuItem>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {t("navbar.myOrders")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/account/addresses">
                  <DropdownMenuItem>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t("navbar.addresses")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/inquiry">
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("navbar.inquiryList")}
                  </DropdownMenuItem>
                </Link>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/admin">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        {t("navbar.adminPanel")}
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("navbar.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="bg-charcoal text-white hover:bg-charcoal-dark">
                {t("navbar.signIn")}
              </Button>
            </a>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              {/* Mobile Search */}
              <div className="mt-6 mb-4 px-1">
                <SearchAutocomplete onClose={() => setMobileOpen(false)} />
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <span
                      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        location === link.href
                          ? "text-foreground bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
