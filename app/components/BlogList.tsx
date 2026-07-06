"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, Search, X, ArrowUpDown } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
  tags: string[];
};

const POSTS_PER_PAGE = 5;
type SortOrder = "newest" | "oldest";

export default function BlogList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL so filters are shareable / survive back-forward nav
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag"));
  const [sort, setSort] = useState<SortOrder>(
    searchParams.get("sort") === "oldest" ? "oldest" : "newest"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Debounce the raw input before it actually filters the list
  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(inputValue);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [inputValue]);

  // Keep the URL in sync with current filter state
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeTag) params.set("tag", activeTag);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTag, sort, page]);

  // "/" focuses search, unless already typing somewhere
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return counts;
  }, [posts]);

  const allTags = useMemo(
    () => Array.from(tagCounts.keys()).sort((a, b) => tagCounts.get(b)! - tagCounts.get(a)!),
    [tagCounts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = posts.filter((post) => {
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });

    return result.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === "newest" ? -diff : diff;
    });
  }, [posts, query, activeTag, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * POSTS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageStart + POSTS_PER_PAGE);

  const hasActiveFilters = Boolean(query || activeTag || sort !== "newest");

  const clearFilters = useCallback(() => {
    setInputValue("");
    setQuery("");
    setActiveTag(null);
    setSort("newest");
    setPage(1);
  }, []);

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setPage(1);
  }

  function goToPage(n: number) {
    setPage(n);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Blogs</h1>
        <p className="text-muted text-sm mt-1" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "Article" : "Articles"}
          {activeTag ? (
            <>
              {" "}
              tagged <span className="font-medium">{activeTag}</span>
            </>
          ) : null}
        </p>
      </div>

      {/* Search + sort row */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search posts... (press / to focus)"
            className="w-full bg-transparent border border-border rounded-sm pl-9 pr-9 py-2 text-sm outline-none focus:border-fg/30 transition-colors"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-sm border border-border hover:border-fg/40 transition-colors shrink-0"
          title="Toggle sort order"
        >
          <ArrowUpDown size={13} strokeWidth={1.5} />
          {sort === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {allTags.map((tag) => {
            const isActive = tag === activeTag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  isActive
                    ? "border-fg bg-fg text-background"
                    : "border-border text-muted hover:border-fg/40 hover:text-fg"
                }`}
              >
                {tag}
                <span className={isActive ? "opacity-70" : "opacity-50"}> {tagCounts.get(tag)}</span>
              </button>
            );
          })}
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-muted hover:text-fg underline underline-offset-4 mb-6"
        >
          Clear all filters
        </button>
      )}

      {/* List */}
      <div ref={listTopRef} className="space-y-3 scroll-mt-6">
        {paginated.length === 0 && (
          <div className="py-10 text-center space-y-3 border border-border p-5">
            <p className="text-muted text-sm">No posts match your search.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs underline underline-offset-4 hover:text-fg text-muted"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {paginated.map((post) => (
          <article key={post.id} className="group border border-border p-5 hover:border-fg/20 transition-colors">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{post.date}</span>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} strokeWidth={1.5} />
                      {post.readingTime} min read
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold leading-snug group-hover:underline underline-offset-4 decoration-1">
                    {post.title}
                  </h2>

                  <p className="text-muted text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={(e) => {
                            e.preventDefault();
                            handleTagClick(tag);
                          }}
                          className="text-xs px-2 py-0.5 border border-border text-muted hover:border-fg/40 hover:text-fg transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                  →
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-sm px-3 py-1.5 rounded-sm border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg/40 transition-colors"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goToPage(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={`text-sm w-6 h-6 rounded-sm border transition-colors ${
                n === currentPage
                  ? "!border bg-fg text-background"
                  : "border-border hover:border-fg/40"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-sm px-3 py-1.5 rounded-sm border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg/40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}