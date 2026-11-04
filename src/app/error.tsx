"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="empty-state" role="alert">
      <h1>Something interrupted your workspace.</h1>
      <p>
        Your saved data has not been cleared. Check that the local database is
        configured and migrations have been applied, then try again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
