"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <span className="text-4xl">💔</span>
      <h1 className="mt-3 font-heading text-3xl text-pink-dark">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted">
        We couldn&apos;t reach the database. If this just happened, it may be a
        connection hiccup — try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
