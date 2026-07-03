export default function Footer() {
  return (
    <footer className="flex-shrink-0 py-6 border-t">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] text-muted">
          © {new Date().getFullYear()} — Yes, its a footer
        </p>
      </div>
    </footer>
  );
}