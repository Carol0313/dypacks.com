import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  User,
  Sparkles,
  ShoppingBag,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

type MessageRole = "user" | "carol";

interface ChatMessage {
  role: MessageRole;
  content: string;
  options?: ChatOption[];
  isForm?: boolean;
  formType?: "product" | "quantity" | "contact" | "details";
}

interface ChatOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export default function CarolChatbot() {
  const { t } = useTranslation();
  const CAROL_EMAIL = t("carol.email");
  const submitInquiry = trpc.inquiry.submitAnonymous.useMutation({
    onSuccess: () => {
      console.log("[Carol] Inquiry submitted successfully");
    },
    onError: (err) => {
      console.error("[Carol] Failed to submit inquiry:", err);
    },
  });

  const WELCOME_MESSAGE: ChatMessage = {
    role: "carol",
    content: t("carol.welcome"),
    options: [
      { label: t("carol.requestQuote"), value: "quote", icon: <ShoppingBag className="h-4 w-4" /> },
      { label: t("carol.sendInquiry"), value: "inquiry", icon: <Mail className="h-4 w-4" /> },
      { label: t("carol.browseProducts"), value: "products", icon: <ArrowRight className="h-4 w-4" /> },
    ],
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState({ product: "", quantity: "", contact: "", details: "" });
  const [currentFormType, setCurrentFormType] = useState<"product" | "quantity" | "contact" | "details" | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement;
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (currentFormType && isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentFormType, isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) setHasUnread(true);
  }, [messages.length, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setHasUnread(false);
  };

  const addMessage = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);

  const handleOptionClick = (value: string) => {
    const selectedOption = messages[messages.length - 1]?.options?.find((o) => o.value === value);
    if (selectedOption) addMessage({ role: "user", content: selectedOption.label });

    switch (value) {
      case "quote":
        setTimeout(() => {
          addMessage({ role: "carol", content: t("carol.quoteIntro"), isForm: true, formType: "product" });
          setCurrentFormType("product");
        }, 400);
        break;
      case "inquiry":
        setTimeout(() => {
          addMessage({ role: "carol", content: t("carol.inquiryIntro"), isForm: true, formType: "details" });
          setCurrentFormType("details");
        }, 400);
        break;
      case "products":
        setTimeout(() => {
          addMessage({
            role: "carol",
            content: t("carol.browseIntro"),
            options: [
              { label: t("carol.goToProducts"), value: "go_products", icon: <ArrowRight className="h-4 w-4" /> },
              { label: t("carol.requestQuoteInstead"), value: "quote", icon: <ShoppingBag className="h-4 w-4" /> },
            ],
          });
        }, 400);
        break;
      case "go_products":
        window.location.href = "/products";
        break;
      case "restart":
        setFormData({ product: "", quantity: "", contact: "", details: "" });
        setCurrentFormType(null);
        setTimeout(() => addMessage(WELCOME_MESSAGE), 300);
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && currentFormType !== "details") return;
    const value = inputValue.trim();
    setInputValue("");

    if (currentFormType === "product") {
      setFormData((prev) => ({ ...prev, product: value }));
      addMessage({ role: "user", content: value });
      setCurrentFormType(null);
      setTimeout(() => { addMessage({ role: "carol", content: t("carol.askQuantity"), isForm: true, formType: "quantity" }); setCurrentFormType("quantity"); }, 400);
    } else if (currentFormType === "quantity") {
      setFormData((prev) => ({ ...prev, quantity: value }));
      addMessage({ role: "user", content: value });
      setCurrentFormType(null);
      setTimeout(() => { addMessage({ role: "carol", content: t("carol.askEmail"), isForm: true, formType: "contact" }); setCurrentFormType("contact"); }, 400);
    } else if (currentFormType === "contact") {
      setFormData((prev) => ({ ...prev, contact: value }));
      addMessage({ role: "user", content: value });
      setCurrentFormType(null);
      setTimeout(() => { addMessage({ role: "carol", content: t("carol.askDetails"), isForm: true, formType: "details" }); setCurrentFormType("details"); }, 400);
    } else if (currentFormType === "details") {
      setFormData((prev) => {
        const updated = { ...prev, details: value };
        setTimeout(() => {
          const subject = encodeURIComponent(`${t("carol.emailSubject")}${updated.product || t("carol.general")}`);
          const body = encodeURIComponent(
            `${t("carol.emailBodyStart")}` +
            `${t("carol.productLabel")}${updated.product || t("carol.notSpecified")}\n` +
            `${t("carol.quantityLabel")}${updated.quantity || t("carol.notSpecified")}\n` +
            `${t("carol.emailLabel")}${updated.contact || t("carol.notProvided")}\n` +
            `${t("carol.detailsLabel")}${updated.details || value || t("carol.none")}\n\n` +
            `${t("carol.emailBodyEnd")}`
          );
          const mailtoLink = `mailto:${CAROL_EMAIL}?subject=${subject}&body=${body}`;
          addMessage({
            role: "carol",
            content: t("carol.thanksDetails"),
            options: [
              { label: t("carol.sendEmailToCarol"), value: "send_email", icon: <Mail className="h-4 w-4" /> },
              { label: t("carol.startOver"), value: "restart", icon: <ArrowRight className="h-4 w-4" /> },
            ],
          });
          (window as any).__carolMailto = mailtoLink;
          // Save inquiry to database
          submitInquiry.mutate({
            contactName: updated.product ? `${updated.product} inquiry` : "Website Visitor",
            email: updated.contact || "",
            product: updated.product,
            quantity: updated.quantity,
            details: updated.details || value,
            source: "carol_chatbot",
          });
        }, 400);
        return updated;
      });
      if (value) addMessage({ role: "user", content: value });
      else addMessage({ role: "user", content: t("carol.noAdditionalDetails") });
      setCurrentFormType(null);
    }
  };

  const handleCustomOption = (value: string) => {
    if (value === "send_email") {
      const mailto = (window as any).__carolMailto;
      if (mailto) window.open(mailto, "_blank");
      addMessage({ role: "user", content: t("carol.sendEmailToCarol") });
      setTimeout(() => {
        addMessage({
          role: "carol",
          content: t("carol.emailClientOpened"),
          options: [{ label: t("carol.startNewConversation"), value: "restart", icon: <MessageCircle className="h-4 w-4" /> }],
        });
      }, 300);
    } else {
      handleOptionClick(value);
    }
  };

  const getPlaceholder = () => {
    switch (currentFormType) {
      case "product": return t("carol.productPlaceholder");
      case "quantity": return t("carol.quantityPlaceholder");
      case "contact": return t("carol.emailPlaceholder");
      case "details": return t("carol.detailsPlaceholder");
      default: return "Type your message...";
    }
  };

  const getFormLabel = () => {
    switch (currentFormType) {
      case "product": return t("carol.productType");
      case "quantity": return t("carol.quantityNeeded");
      case "contact": return t("carol.yourEmail");
      case "details": return t("carol.additionalDetails");
      default: return "";
    }
  };

  const skipDetails = () => {
    if (currentFormType === "details") {
      setInputValue("");
      handleFormSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105",
          "w-14 h-14 bg-gold text-charcoal-dark hover:bg-gold-dark",
          isOpen && "bg-charcoal-dark text-white hover:bg-charcoal"
        )}
        aria-label={isOpen ? t("carol.closeChat") : t("carol.openChat")}
      >
        {isOpen ? <X className="h-6 w-6" /> : <><MessageCircle className="h-6 w-6" />{hasUnread && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-background" />}</>}
      </button>

      {isOpen && (
        <div className={cn("fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl border shadow-2xl bg-card overflow-hidden", "w-[calc(100vw-3rem)] max-w-[380px] h-[520px] max-h-[calc(100vh-8rem)]")}>
          <div className="flex items-center gap-3 px-4 py-3 bg-charcoal-dark text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{t("carol.carolName")}</h3>
              <p className="text-xs text-white/60 truncate">{t("carol.dyPacksCustomerService")}</p>
            </div>
            <button onClick={handleToggle} className="text-white/60 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </div>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="flex flex-col space-y-4 p-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div className={cn("flex gap-2.5", message.role === "user" ? "justify-end items-start" : "justify-start items-start")}>
                    {message.role === "carol" && <div className="size-7 shrink-0 mt-0.5 rounded-full bg-gold/10 flex items-center justify-center"><Sparkles className="size-3.5 text-gold-dark" /></div>}
                    <div className={cn("max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed", message.role === "user" ? "bg-gold text-charcoal-dark font-medium" : "bg-muted text-foreground")}>
                      {message.role === "carol" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.content.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part.split("\n").map((line, j) => <span key={j}>{line}{j < part.split("\n").length - 1 && <br />}</span>)}</span>)}
                          <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground">
                            {t("carol.emailLabel")} <a href={`mailto:${CAROL_EMAIL}`} className="text-gold-dark hover:underline">{CAROL_EMAIL}</a>
                          </div>
                        </div>
                      ) : <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                    {message.role === "user" && <div className="size-7 shrink-0 mt-0.5 rounded-full bg-secondary flex items-center justify-center"><User className="size-3.5 text-secondary-foreground" /></div>}
                  </div>
                  {message.options && message.options.length > 0 && (
                    <div className={cn("flex flex-wrap gap-2 mt-2", message.role === "user" ? "justify-end" : "justify-start pl-9")}>
                      {message.options.map((option, optIndex) => (
                        <button key={optIndex} onClick={() => handleCustomOption(option.value)} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors bg-card hover:bg-gold/10 hover:border-gold-dark/30 text-foreground")}>
                          {option.icon}{option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {currentFormType && (
                <div className="flex gap-2.5 justify-start items-start pl-9">
                  <div className="bg-muted rounded-xl px-3.5 py-2.5 text-sm w-full">
                    <p className="text-xs text-muted-foreground mb-2">{getFormLabel()}</p>
                    <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
                      {currentFormType === "details" ? (
                        <>
                          <Textarea ref={inputRef as any} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={getPlaceholder()} rows={3} className="resize-none text-sm min-h-[80px]" />
                          <div className="flex gap-2">
                            <Button type="button" variant="ghost" size="sm" className="text-xs h-8" onClick={skipDetails}>{t("carol.skip")}</Button>
                            <Button type="submit" size="sm" className="bg-gold text-charcoal-dark hover:bg-gold-dark text-xs h-8 ml-auto"><Send className="h-3 w-3 mr-1" />{t("carol.continue")}</Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-2">
                          <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={getPlaceholder()} className="flex-1 h-9 text-sm" type={currentFormType === "contact" ? "email" : "text"} />
                          <Button type="submit" size="icon" className="bg-gold text-charcoal-dark hover:bg-gold-dark h-9 w-9 shrink-0" disabled={!inputValue.trim()}><Send className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-4 py-2 border-t bg-muted/30 shrink-0">
            <p className="text-[10px] text-center text-muted-foreground">
              {t("carol.footerHint")}<a href={`mailto:${CAROL_EMAIL}`} className="hover:text-gold-dark hover:underline">{CAROL_EMAIL}</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
