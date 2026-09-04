import Header from "../../components/Header";
import Footer from "@/app/components/Footer";
import { Skeleton } from "../../components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 border-x border-border">
        {/* Back + Share */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-14" />
        </div>

        {/* Title area */}
        <div className="mt-8 pb-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full mt-3" />
          <Skeleton className="h-5 w-2/3 mt-1" />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-3.5 w-18" />
          </div>

          <div className="mt-8 -mx-4 sm:-mx-6 border-b border-border" />
        </div>

        {/* Content blocks */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="py-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="py-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Prev / Next */}
        <div className="mt-16 -mx-4 sm:-mx-6 border-t border-border pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-border space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="p-4 border border-border space-y-2 sm:text-right">
            <Skeleton className="h-3 w-12 ml-auto" />
            <Skeleton className="h-4 w-2/3 ml-auto" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
