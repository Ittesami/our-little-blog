import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💌</span>
          <span className="font-heading text-3xl leading-none text-pink-dark">
            Our Little Blog
          </span>
        </Link>
        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-pink-dark">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
