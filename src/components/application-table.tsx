import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Pencil,
  SearchX,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { sortLabels, type SortOrder } from "@/lib/analytics";
import { type Application, type Status, formatDate } from "@/lib/applications";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replace(" ", "-")}`}
    >
      <span />
      {status}
    </span>
  );
}
export function CompanyMark({ name }: { name: string }) {
  const displayName = name.replace(/^\[Demo\]\s*/, "") || name;
  return (
    <span
      aria-hidden="true"
      className={`company-mark mark-${displayName.charCodeAt(0) % 6}`}
    >
      {displayName.slice(0, 1).toUpperCase()}
    </span>
  );
}
type Props = {
  applications: Application[];
  onEdit: (application: Application) => void;
  onNotes: (application: Application) => void;
  sort: SortOrder;
  onDelete: (application: Application) => void;
  onClear: () => void;
  filtered: boolean;
  onAdd: () => void;
  readOnly?: boolean;
};
export function ApplicationTable({
  applications,
  onEdit,
  onNotes,
  sort,
  onDelete,
  onClear,
  filtered,
  onAdd,
  readOnly = false,
}: Props) {
  if (!applications.length)
    return (
      <div className="empty-state">
        <span className="empty-icon">
          {filtered ? <SearchX /> : <BriefcaseBusiness />}
        </span>
        <h3>
          {filtered ? "No matches just yet" : "Your next chapter starts here"}
        </h3>
        <p>
          {filtered
            ? "Try a different company, role, or status."
            : readOnly ? "There are no examples to show." : "Add your first application and keep your search moving."}
        </p>
        {(filtered || !readOnly) && <button
          className="button secondary"
          onClick={filtered ? onClear : onAdd}
        >
          {filtered ? "Clear filters" : "Add an application"}
        </button>}
      </div>
    );
  return (
    <div className="table-scroll">
      <table role="table">
        <caption className="sr-only">
          Job applications, {sortLabels[sort].toLowerCase()}
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              aria-sort={sort === "company" ? "ascending" : undefined}
            >
              Company & role
            </th>
            <th
              scope="col"
              aria-sort={sort === "status" ? "ascending" : undefined}
            >
              Status
            </th>
            <th scope="col">Location</th>
            <th
              scope="col"
              aria-sort={
                sort === "newest"
                  ? "descending"
                  : sort === "oldest"
                    ? "ascending"
                    : undefined
              }
            >
              Date applied {sort === "newest" && <ArrowDown size={12} />}
            </th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                <div className="company-cell">
                  <CompanyMark name={application.company} />
                  <div>
                    <button
                      className="company-name"
                      onClick={() => onEdit(application)}
                    >
                      {application.company}
                      <ArrowUpRight size={13} />
                    </button>
                    <span className="role-name">{application.role}</span>
                    {application.notes && (
                      <span className="note-preview">{application.notes}</span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <StatusBadge status={application.status} />
              </td>
              <td className="location-cell">{application.location || "—"}</td>
              <td className="date-cell" data-label="Applied">
                {formatDate(application.date)}
              </td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    aria-label={`View notes for ${application.company}`}
                    onClick={() => onNotes(application)}
                    title={readOnly ? "View notes" : "View and edit notes"}
                  >
                    <MessageSquare size={15} />
                  </button>
                  {!readOnly && <button
                    className="icon-button"
                    aria-label={`Edit ${application.company} application`}
                    onClick={() => onEdit(application)}
                  >
                    <Pencil size={15} />
                  </button>}
                  {!readOnly && <button
                    className="icon-button delete-button"
                    aria-label={`Delete ${application.company} application`}
                    onClick={() => onDelete(application)}
                  >
                    <Trash2 size={15} />
                  </button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
