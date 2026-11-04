import { BarChart3, TrendingUp, Target } from "lucide-react";
import { statuses, type Application } from "@/lib/applications";
import { getAnalytics } from "@/lib/analytics";

export function Analytics({
  applications,
  today,
  demo = false,
}: {
  applications: Application[];
  today: string;
  demo?: boolean;
}) {
  const { total, counts, months, conversion, progressed, periodTotal } =
    getAnalytics(applications, today);
  const max = Math.max(1, ...months.map((month) => month.count));
  const points = months
    .map(
      (month, index) => `${45 + index * 89},${155 - (month.count / max) * 115}`,
    )
    .join(" ");
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  return (
    <section className="analytics-section" aria-label="Application analytics">
      <div className="analytics-heading">
        <div>
          <span className="eyebrow">THE BIGGER PICTURE</span>
          <h2>Your search, in perspective.</h2>
        </div>
        <span>{demo ? "All fictional demo applications" : "All saved applications"} · independent of list filters</span>
      </div>
      <div className="analytics-grid">
        <section
          className="panel chart-panel"
          aria-labelledby="status-chart-title"
        >
          <div className="chart-heading">
            <div>
              <h3 id="status-chart-title">Applications by status</h3>
              <p>A snapshot of where things stand</p>
            </div>
            <BarChart3 size={18} />
          </div>
          {total ? (
            <div className="status-chart">
              {statuses.map((status) => (
                <div className="status-chart-row" key={status}>
                  <span>{status}</span>
                  <div className="status-track">
                    <span
                      className={`chart-fill chart-${status.toLowerCase().replace(" ", "-")}`}
                      style={{ width: `${(counts[status] / total) * 100}%` }}
                    />
                  </div>
                  <strong>{counts[status]}</strong>
                  <small>{Math.round((counts[status] / total) * 100)}%</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty">
              <BarChart3 size={27} />
              <strong>See your search take shape</strong>
              <p>Add an application to see your status breakdown.</p>
            </div>
          )}
          <p className="chart-footnote">
            {total
              ? `${total} ${total === 1 ? "application" : "applications"} · current statuses · percentages rounded`
              : "Your saved records will appear here."}
          </p>
        </section>
        <section
          className="panel chart-panel"
          aria-labelledby="trend-chart-title"
        >
          <div className="chart-heading">
            <div>
              <h3 id="trend-chart-title">Application activity</h3>
              <p>Last 6 months · by date applied</p>
            </div>
            <TrendingUp size={18} />
          </div>
          {periodTotal ? (
            <>
              <svg
                className="trend-chart"
                viewBox="0 0 535 200"
                role="img"
                aria-labelledby="trend-description"
              >
                <title id="trend-description">
                  {months
                    .map((month) => `${month.fullLabel}: ${month.count}`)
                    .join("; ")}
                </title>
                {ticks.map((tick) => (
                  <g key={tick}>
                    <line
                      x1="30"
                      x2="510"
                      y1={155 - (tick / max) * 115}
                      y2={155 - (tick / max) * 115}
                      stroke="#e8ecf3"
                      strokeDasharray="3 5"
                    />
                    <text x="8" y={159 - (tick / max) * 115}>
                      {tick}
                    </text>
                  </g>
                ))}
                <polyline
                  points={points}
                  fill="none"
                  stroke="#6258ce"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {months.map((month, index) => (
                  <g key={month.key}>
                    <circle
                      cx={45 + index * 89}
                      cy={155 - (month.count / max) * 115}
                      r="4"
                      fill="white"
                      stroke="#6258ce"
                      strokeWidth="2"
                    />
                    <text x={45 + index * 89} y="186" textAnchor="middle">
                      {month.label}
                    </text>
                  </g>
                ))}
              </svg>
              <details className="chart-data">
                <summary>View monthly counts</summary>
                <ul>
                  {months.map((month) => (
                    <li key={month.key}>
                      <span>{month.fullLabel}</span>
                      <strong>{month.count}</strong>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : (
            <div className="chart-empty">
              <TrendingUp size={27} />
              <strong>
                {total
                  ? "No applications in this period"
                  : "Your progress starts with one step"}
              </strong>
              <p>
                {total
                  ? "Older applications still count in your all-time metrics."
                  : "Add an application to start your activity chart."}
              </p>
            </div>
          )}
          <p className="chart-footnote">
            {months[0].fullLabel} – {months[5].fullLabel} · {periodTotal}{" "}
            applied
          </p>
        </section>
      </div>
      <section className="conversion-panel" aria-labelledby="conversion-title">
        <span className="conversion-icon">
          <Target size={20} />
        </span>
        <div>
          <h3 id="conversion-title">Interview conversion rate</h3>
          <p>
            Current Interview + Offer applications ÷ all applications.
            Historical interviews aren’t tracked.
          </p>
        </div>
        <div className="conversion-number">
          <strong>{conversion === null ? "—" : `${conversion}%`}</strong>
          <span>
            {total
              ? `${progressed} of ${total} applications`
              : "Awaiting your first application"}
          </span>
        </div>
      </section>
    </section>
  );
}
