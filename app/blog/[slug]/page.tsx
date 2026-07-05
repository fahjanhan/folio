export const dynamic = "force-dynamic";
// or: export const revalidate = 60; // refetch at most once/minute
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import Header from "../../components/Header";
import { NotionRenderer } from "../../components/NotionRenderer";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import Footer from "@/app/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors bg-gray-500/10 p-1 rounded-sm"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          <span>Feeds</span>
        </Link>

        <article>
          <header className="mt-8 pb-8 border-b">
            <h1 className="text-xl font-medium tracking-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} strokeWidth={1.5} />
                <span className="text-xs">{post.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} strokeWidth={1.5} />
                <span className="text-xs">{post.readingTime} min read</span>
              </div>
              {post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={12} strokeWidth={1.5} className="text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1 py-0.5 rounded-sm border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>
          <div className="mt-8 text-[15px] leading-relaxed">
            <NotionRenderer blocks={post.blocks} />
          </div>
        </article>
      </main>
     <Footer />
    </div>
  );
}
