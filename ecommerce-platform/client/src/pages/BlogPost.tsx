import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BlogPost() {
  const { t } = useTranslation();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const postQuery = trpc.blog.getBySlug.useQuery({ slug }, { enabled: !!slug });
  const post = postQuery.data;

  if (postQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12 flex-1">
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center flex-1">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("blogPost.postNotFound")}</h2>
          <Link href="/blog"><Button variant="outline">{t("blogPost.backToBlog")}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <Link href="/blog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("blogPost.backToBlog")}
        </Link>

        <article className="max-w-3xl mx-auto">
          {post.coverImage && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-2">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            {post.title}
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
