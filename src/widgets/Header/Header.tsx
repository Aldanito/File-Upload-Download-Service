"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-secondary/30 bg-primary">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="text-xl font-semibold text-light transition hover:opacity-90"
        >
          File Service
        </Link>
        <nav className="flex gap-4">
          <Link
            href="/"
            className="text-light/80 transition hover:text-light"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
