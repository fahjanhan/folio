import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link
          href="/"
          className="inline-block rounded border px-4 py-2 hover:bg-muted"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}