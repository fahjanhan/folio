// export const dynamic = "force-dynamic";
// // or: export const revalidate = 60; // refetch at most once/minute
// import Link from "next/link";
// import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
// import Header from "../../components/Header";
// import { NotionRenderer } from "../../components/NotionRenderer";
// import { getPostBySlug } from "@/lib/posts";
// import { notFound } from "next/navigation";
// import Footer from "@/app/components/Footer";

// interface Props {
//   params: Promise<{ slug: string }>;
// }

// export default async function BlogPostPage({ params }: Props) {
//   const { slug } = await params;
//   const post = await getPostBySlug(slug);

//   if (!post) {
//     notFound();
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
//         <Link
//           href="/blog"
//           className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors bg-gray-500/10 p-1 rounded-sm"
//         >
//           <ArrowLeft size={12} strokeWidth={1.5} />
//           <span>Feeds</span>
//         </Link>

//         <article>
//           <header className="mt-8 pb-8 border-b">
//             <h1 className="text-xl font-medium tracking-tight">{post.title}</h1>
//             <div className="flex flex-wrap items-center gap-4 mt-3 text-muted">
//               <div className="flex items-center gap-1.5">
//                 <Calendar size={12} strokeWidth={1.5} />
//                 <span className="text-xs">{post.date}</span>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <Clock size={12} strokeWidth={1.5} />
//                 <span className="text-xs">{post.readingTime} min read</span>
//               </div>
//               {post.tags.length > 0 && (
//                 <div className="flex items-center gap-1.5 flex-wrap">
//                   <Tag size={12} strokeWidth={1.5} className="text-muted-foreground" />
//                   {post.tags.map((tag) => (
//                     <span
//                       key={tag}
//                       className="text-xs px-1 py-0.5 rounded-sm border border-border"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </header>
//           <div className="mt-8 text-[15px] leading-relaxed">
//             <NotionRenderer blocks={post.blocks} />
//           </div>
//         </article>
//       </main>
//      <Footer />
//     </div>
//   );
// }


export const dynamic = "force-dynamic";
// or: export const revalidate = 60; // refetch at most once/minute

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import Header from "../../components/Header";
import Footer from "@/app/components/Footer";
import { NotionRenderer } from "../../components/NotionRenderer";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { ReadingProgress, ShareButton, BackToTop } from "../[slug]/PostInteractive";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);

  if (!post) {
    notFound();
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ReadingProgress />
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 border border-border text-xs text-muted hover:text-fg transition-colors p-1 rounded-xs"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            <span>Back</span>
          </Link>
          <ShareButton title={post.title} />
        </div>

        <article>
          <header className="mt-8 pb-8 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-muted text-base mt-2 sm:mt-3">{post.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-muted">
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
                   <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-1.5 py-0.5 rounded-xs border border-border hover:border-fg/40 hover:text-fg transition-colors flex items-center justify-center gap-1"
                  >
                    {tag}
                  </Link>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="mt-8 text-[15px] leading-relaxed prose-content">
            <NotionRenderer blocks={post.blocks} />
          </div>
        </article>

        {(prevPost || nextPost) && (
          <nav className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group flex flex-col gap-1 p-4 rounded-sm border border-border hover:border-fg/30 transition-colors"
              >
                <span className="text-xs text-muted flex items-center gap-1">
                  <ArrowLeft size={11} strokeWidth={1.5} /> Previous
                </span>
                <span className="text-sm font-medium group-hover:underline underline-offset-4 line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group flex flex-col gap-1 p-4 rounded-sm border border-border hover:border-fg/30 transition-colors sm:text-right sm:items-end"
              >
                <span className="text-xs text-muted flex items-center gap-1 sm:flex-row-reverse">
                  Next <ArrowLeft size={11} strokeWidth={1.5} className="rotate-180" />
                </span>
                <span className="text-sm font-medium group-hover:underline underline-offset-4 line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}