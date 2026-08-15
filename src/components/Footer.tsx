import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted">
      <p>
        made with <span className="text-pink-dark">♥</span> for us
      </p>
      <Link href="/admin" className="opacity-40 hover:opacity-100">
        ·
      </Link>
    </footer>
  );
}
