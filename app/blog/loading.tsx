import Header from "../components/Header";
import Footer from "../components/Footer";
import { Skeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <section>
          {/* Title */}
          <div className="mb-8">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2 mb-5">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24 shrink-0" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Article cards */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-border p-5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-18" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
