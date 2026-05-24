import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "EN", name: "English" },
  { code: "tr", label: "TR", name: "Türkçe" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "es", label: "ES", name: "Español" },
];

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className={cn("relative group", className)}>
      <button
        className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase text-xs">{current.slice(0, 2)}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border bg-popover shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent",
                current.startsWith(lang.code)
                  ? "text-gold-dark font-semibold bg-gold/5"
                  : "text-foreground"
              )}
            >
              <span className="inline-block w-8 font-medium">{lang.label}</span>
              <span className="text-muted-foreground">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
