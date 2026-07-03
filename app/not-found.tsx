import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404 | Errrgh</h1>
        <p className="text-muted-foreground text-md">
          Where is the page? <br/> No Idea. Maybe it was deleted or never existed
        </p>

     <Link
  href="/"
  className="inline-block border px-4 py-2 !transition duration-400 !hover:text-fg/50"
>
  Go Home
</Link>
      </div>
    </main>
  );
}