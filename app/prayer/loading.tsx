import Header from "../components/Header";
import Footer from "../components/Footer";
import { Skeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            {/* Day + Time */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-20" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            {/* Next Prayer Card */}
            <div className="border border-border p-6 mb-8">
              <Skeleton className="h-3 w-24" />
              <div className="flex items-baseline justify-between mt-1">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-5 w-36 mt-3" />
            </div>

            {/* Prayer List */}
            <div className="border border-border divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 border border-border py-2">
            <div className="flex">
              <div className="flex-1 flex flex-col items-center gap-1 px-4 py-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-5 py-4 border-x border-border">
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 px-4 py-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
