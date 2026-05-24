import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${sizeClass} ${star <= rating ? "fill-gold text-gold" : star - 0.5 <= rating ? "fill-gold/50 text-gold" : "fill-muted text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);
  const labels = [t("reviews.poor"), t("reviews.fair"), t("reviews.good"), t("reviews.veryGood"), t("reviews.excellent")];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => onChange(star)} className="transition-transform hover:scale-110">
          <Star className={`h-7 w-7 cursor-pointer transition-colors ${star <= (hover || value) ? "fill-gold text-gold" : "fill-muted text-muted-foreground/30"}`} />
        </button>
      ))}
      {value > 0 && <span className="ml-2 text-sm text-muted-foreground">{labels[value - 1]}</span>}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-muted-foreground">{stars}</span>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-8 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [page] = useState(1);

  const utils = trpc.useUtils();

  const reviewsQuery = trpc.review.listByProduct.useQuery({ productId, page, limit: 10 }, { enabled: !!productId });
  const statsQuery = trpc.review.ratingStats.useQuery({ productId }, { enabled: !!productId });

  const reviews = reviewsQuery.data?.reviews ?? [];
  const stats = statsQuery.data;

  const hasReviewed = useMemo(() => {
    if (!isAuthenticated || !user || !reviews.length) return false;
    return reviews.some((r: any) => r.userId === user.id);
  }, [reviews, user, isAuthenticated]);

  const createMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success(t("reviews.thankYouReview"));
      setShowForm(false);
      setRating(0);
      setTitle("");
      setContent("");
      utils.review.listByProduct.invalidate({ productId });
      utils.review.ratingStats.invalidate({ productId });
    },
    onError: (err) => {
      toast.error(err.message || t("reviews.failedSubmitReview"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error(t("reviews.pleaseSelectRating")); return; }
    createMutation.mutate({ productId, rating, title, content });
  };

  const avgRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const distribution = stats?.distribution ?? {};

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        {t("reviews.customerReviews")}
      </h2>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="md" />
            <p className="text-sm text-muted-foreground mt-1">
              {t("reviews.basedOn")} {totalReviews} {totalReviews === 1 ? t("reviews.review") : t("reviews.reviews")}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar key={stars} stars={stars} count={distribution[stars] ?? 0} total={totalReviews} />
          ))}
        </div>
      </div>

      {/* Write Review */}
      {!showForm && (
        <div className="mb-8">
          {hasReviewed ? (
            <p className="text-sm text-muted-foreground">{t("reviews.alreadyReviewed")}</p>
          ) : isAuthenticated ? (
            <Button onClick={() => setShowForm(true)} variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("reviews.writeReview")}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{t("reviews.signInToReview")}</p>
              <a href={getLoginUrl()}>
                <Button size="sm">{t("reviews.signIn")}</Button>
              </a>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg bg-card space-y-4">
          <h3 className="text-lg font-semibold">{t("reviews.writeYourReview")}</h3>
          <div>
            <label className="text-sm font-medium mb-2 block">{t("reviews.yourRating")}</label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("reviews.reviewTitle")}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("reviews.titlePlaceholder")} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("reviews.yourReview")}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("reviews.reviewPlaceholder")} rows={4} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none" />
            <p className="text-xs text-muted-foreground mt-1 text-right">{content.length}{t("reviews.characters")}</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t("reviews.submitting") : t("reviews.submitReview")}
            </Button>
          </div>
        </form>
      )}

      <Separator className="mb-6" />

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("reviews.noReviewsYet")}</p>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{review.user?.name || t("reviews.anonymous")}</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {review.title && <p className="text-sm font-semibold text-foreground">{review.title}</p>}
              <p className="text-sm text-muted-foreground">{review.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
