import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Search, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface SearchAutocompleteProps {
  onClose?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchAutocomplete({ onClose, className = "", autoFocus = false }: SearchAutocompleteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedQuery(query.trim()); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestionsQuery = trpc.product.searchSuggestions.useQuery(
    { query: debouncedQuery, limit: 6 },
    { enabled: debouncedQuery.length >= 1 }
  );

  const suggestions = suggestionsQuery.data ?? [];
  const isLoading = suggestionsQuery.isLoading && debouncedQuery.length >= 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleSelect = useCallback((slug: string) => {
    setIsOpen(false); setQuery(""); onClose?.(); navigate(`/product/${slug}`);
  }, [navigate, onClose]);

  const handleSearch = useCallback(() => {
    if (query.trim()) { setIsOpen(false); onClose?.(); navigate(`/products?search=${encodeURIComponent(query.trim())}`); }
  }, [query, navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    else if (e.key === "Escape") { setIsOpen(false); onClose?.(); }
  }, [handleSearch, onClose]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("search.searchProducts")}
          className="w-full h-10 pl-9 pr-9 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }} className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && debouncedQuery.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">{t("search.searching")}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("search.productSuggestions")}</span>
              </div>
              <ul>
                {suggestions.map((item) => {
                  const images = item.images ? JSON.parse(item.images) : [];
                  const mainImage = images[0] || PLACEHOLDER_IMAGE;
                  return (
                    <li key={item.id}>
                      <button onClick={() => handleSelect(item.slug)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/60 transition-colors text-left">
                        <img src={mainImage} alt={item.name} className="w-10 h-10 rounded-md object-cover bg-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-gold-dark font-semibold">${Number(item.price).toFixed(2)}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button onClick={handleSearch} className="w-full px-3 py-2.5 text-sm text-center text-gold-dark hover:bg-accent/40 transition-colors border-t border-border font-medium">
                {t("search.viewAllResults")} "{query}"
              </button>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">{t("search.noProductsFound")} "{debouncedQuery}"</p>
              <button onClick={handleSearch} className="mt-2 text-sm text-gold-dark hover:underline">{t("search.searchAllProducts")}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
