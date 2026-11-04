export default function Loading() {
  return (
    <main
      className="loading-shell"
      aria-busy="true"
      aria-label="Loading your workspace"
    >
      <h1>Opening your workspace…</h1>
      <div className="stats-grid" aria-hidden="true">
        {[1, 2, 3, 4].map((value) => (
          <div key={value} className="skeleton" />
        ))}
      </div>
      <div className="analytics-grid loading-analytics" aria-hidden="true">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <div className="skeleton loading-table" aria-hidden="true" />
    </main>
  );
}
