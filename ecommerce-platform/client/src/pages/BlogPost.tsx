import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageSEO, buildBlogPostTitle, buildBlogPostDescription } from "@/lib/seo";
import { BlogPostSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";
import PageBreadcrumb from "@/components/PageBreadcrumb";

type ContentBlock =
  | { type: "text"; content: string }
  | { type: "image"; url: string; caption: string };

function parseBlogContent(content: string): ContentBlock[] {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];
  let currentText: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\[IMAGE:\s*(.+?)\s*\]$/);
    if (match) {
      if (currentText.length > 0) {
        blocks.push({ type: "text", content: currentText.join("\n") });
        currentText = [];
      }
      const url = match[1];
      let caption = "";
      if (
        i + 1 < lines.length &&
        !lines[i + 1].trim().startsWith("[IMAGE:") &&
        lines[i + 1].trim() !== ""
      ) {
        caption = lines[i + 1].trim();
        i++;
      }
      blocks.push({ type: "image", url, caption });
    } else {
      currentText.push(line);
    }
  }

  if (currentText.length > 0) {
    blocks.push({ type: "text", content: currentText.join("\n") });
  }

  return blocks;
}

export default function BlogPost() {
  const { t } = useTranslation();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const postQuery = trpc.blog.getBySlug.useQuery({ slug }, { enabled: !!slug });
  const post = postQuery.data;

  usePageSEO({
    title: post ? buildBlogPostTitle(post.title, t) : t("blogPost.metaBlog"),
    description: post
      ? buildBlogPostDescription(post.excerpt || post.metaDescription, t)
      : t("seo.blog.description"),
    keywords: post?.metaKeywords || t("seo.blog.keywords"),
    ogImage: post?.coverImage,
    ogImageAlt: post?.title,
    ogType: "article",
    canonicalPath: post ? `/blog/${post.slug}` : "/blog",
  });

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
          <h2 className="text-xl font-semibold mb-2">
            {t("blogPost.postNotFound")}
          </h2>
          <Link href="/blog">
            <Button variant="outline">{t("blogPost.backToBlog")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const blocks = parseBlogContent(post.content);

  return (
    <div className="min-h-screen flex flex-col">
      {post && (
        <BlogPostSchema
          title={post.title}
          description={post.excerpt || post.metaDescription || post.title}
          coverImage={post.coverImage}
          publishedAt={post.publishedAt || post.createdAt}
          updatedAt={post.updatedAt}
          slug={post.slug}
        />
      )}
      <BreadcrumbSchema
        items={[
          { name: t("blogPost.home"), url: "/" },
          { name: t("blogPost.blog"), url: "/blog" },
          { name: post?.title || t("blogPost.postNotFound"), url: `/blog/${slug}` },
        ]}
      />
      <Navbar />
      <div className="container py-8 flex-1">
        <PageBreadcrumb
          items={[
            { label: t("blogPost.blog"), href: "/blog" },
            { label: post?.title || t("blogPost.postNotFound") },
          ]}
        />
        <Link
          href="/blog"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("blogPost.backToBlog")}
        </Link>

        <article className="max-w-3xl mx-auto">
          {post.coverImage && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img
                src={getOptimizedImageUrl(post.coverImage, 1200)}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            {blocks.map((block, idx) =>
              block.type === "text" ? (
                <div
                  key={idx}
                  className="whitespace-pre-wrap mb-4 last:mb-0 empty:hidden"
                >
                  {block.content}
                </div>
              ) : (
                <figure key={idx} className="my-6">
                  <div className="overflow-hidden rounded-lg border bg-muted/30">
                    <img
                      src={getOptimizedImageUrl(block.url, 1200)}
                      alt={block.caption || post.title}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )
            )}
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
