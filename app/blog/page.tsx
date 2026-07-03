export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import Header from "../components/Header";
import { getPosts } from "@/lib/posts";
import Footer from "../components/Footer";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <section>
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight">Feeds</h1>
            <p className="text-muted text-sm mt-1">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group border border-border hover:border-fg/20  transition-all duration-200"
              >
                <Link href={`/blog/${post.slug}`} className="block p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h2 className="text-lg font-medium group-hover:opacity-70 transition-opacity">
                        {post.title}
                      </h2>
                      <p className="text-muted text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-muted pt-1">
                        <div className="flex items-center gap-1">
                          <Clock size={10} strokeWidth={1.5} />
                          <span className="text-xs">{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} strokeWidth={1.5} />
                          <span className="text-xs">{post.readingTime} min read</span>
                        </div>
                        {post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag size={12} strokeWidth={1.5} className="text-muted-foreground" />
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-sm border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                      </div>
                    </div>
                    <span className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5">
                      →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}