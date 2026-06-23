import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { getThumbnailUrl } from "@/lib/image-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";
import { BreadcrumbSchema, BlogListSchema } from "@/components/SchemaMarkup";
import PageBreadcrumb from "@/components/PageBreadcrumb";

export default function Blog() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 9;

  const postsQuery = trpc.blog.list.useQuery({
    page,
    limit,
    status: "published",
  });
  const posts = postsQuery.data?.items ?? [];
  const totalPages = Math.ceil((postsQuery.data?.total ?? 0) / limit);

  usePageSEO({
    title: t("seo.blog.title"),
    description: t("seo.blog.description"),
    keywords: t("seo.blog.keywords"),
    ogImageAlt: t("seo.blog.title"),
    canonicalPath: "/blog",
  });

  // Pagination rel next/prev
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = `${window.location.origin}/blog`;
    const removeRel = (rel: string) => {
      document.querySelectorAll(`link[rel="${rel}"]`).forEach(el => el.remove());
    };
    const setRel = (rel: string, href: string) => {
      removeRel(rel);
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    };

    if (totalPages > 1) {
      if (page > 1) {
        setRel(
          "prev",
          page === 2 ? base : `${base}?page=${page - 1}`
        );
      } else {
        removeRel("prev");
      }
      if (page < totalPages) {
        setRel("next", `${base}?page=${page + 1}`);
      } else {
        removeRel("next");
      }
    } else {
      removeRel("prev");
      removeRel("next");
    }

    return () => {
      removeRel("prev");
      removeRel("next");
    };
  }, [page, totalPages]);

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbSchema
        items={[
          { name: t("blog.home"), url: "/" },
          { name: t("blog.blog"), url: "/blog" },
        ]}
      />
      <BlogListSchema
        posts={posts.map(p => ({
          title: p.title,
          slug: p.slug,
          coverImage: p.coverImage,
          publishedAt: p.publishedAt,
        }))}
      />
      <Navbar />

      <div className="container pt-8">
        <PageBreadcrumb
          items={[{ label: t("blog.blog") }]}
        />
      </div>

      <section className="bg-charcoal-dark py-12">
        <div className="container">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("blog.blogInsights")}
          </h1>
          <p className="text-white/60">{t("blog.industryNews")}</p>
        </div>
      </section>

      <div className="container py-12 flex-1">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {t("blog.noPostsYet")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("blog.checkBackSoon")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 h-full">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {post.coverImage ? (
                        <img
                          src={getThumbnailUrl(post.coverImage, 600)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-charcoal/5">
                          <BookOpen className="h-12 w-12 text-gold/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(
                          post.publishedAt || post.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-gold-dark transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  {t("blog.page")} {page} {t("blog.of")} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
