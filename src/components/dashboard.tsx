"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Command,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { ApplicationForm } from "./application-form";
import { ApplicationTable } from "./application-table";
import { Analytics } from "./analytics";
import {
  filterApplications,
  sortLabels,
  type SortOrder,
} from "@/lib/analytics";
import {
  type Application,
  type ApplicationInput,
  type Status,
  statuses,
} from "@/lib/applications";

type Section = "Overview" | "Applications" | "Interviews" | "Guide";
const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Applications", icon: BriefcaseBusiness },
  { name: "Interviews", icon: CalendarDays },
] as const;

export function Dashboard({
  initialApplications,
  reportDate,
  readOnly = false,
}: {
  initialApplications: Application[];
  reportDate: string;
  readOnly?: boolean;
}) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [section, setSection] = useState<Section>("Overview");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [form, setForm] = useState<{
    application: Application | null;
    focusNotes?: boolean;
  } | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    sidebar.current?.querySelector<HTMLButtonElement>(".nav-item")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!deleting) return;
    const opener = document.activeElement as HTMLElement | null;
    const element = deleteDialog.current;
    const fallback = heading.current;
    element?.showModal();
    return () => {
      element?.close();
      if (opener?.isConnected) opener.focus();
      else fallback?.focus();
    };
  }, [deleting]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timeout);
  }, [notice]);
  function navigate(next: Section) {
    setSection(next);
    setSearch("");
    setFilter("All");
    setMobileOpen(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  const mutationLock = useRef(false);
  const [pending, setPending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  async function save(value: ApplicationInput) {
    if (readOnly) throw new Error("This portfolio demo is read-only.");
    if (mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    try {
      const response = await fetch(
        form?.application
          ? `/api/applications/${form.application.id}`
          : "/api/applications",
        {
          method: form?.application ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        },
      );
      const result = await response.json().catch(() => {
        throw new Error(
          "The server returned an unexpected response. Your changes haven’t been confirmed. Please try again.",
        );
      });
      if (!response.ok)
        throw new Error(
          result.error ||
            "We couldn’t save this application. Please try again.",
        );
      const saved = result as Application;
      setApplications((current) =>
        form?.application
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setNotice(
        form?.application
          ? "Application updated."
          : "Application saved. One step closer!",
      );
      setForm(null);
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Can’t reach the server. Your form is still here; please try again.",
      );
    } finally {
      mutationLock.current = false;
      setPending(false);
    }
  }
  async function remove() {
    if (readOnly) return;
    if (!deleting || mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/applications/${deleting.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => {
          throw new Error(
            "The server returned an unexpected response. Please try again before leaving this dialog.",
          );
        });
        throw new Error(
          result.error ||
            "We couldn’t delete this application. Please try again.",
        );
      }
      setApplications((current) =>
        current.filter((item) => item.id !== deleting.id),
      );
      setDeleting(null);
      setNotice("Application deleted.");
    } catch (error) {
      setDeleteError(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Can’t reach the server. Please try again.",
      );
    } finally {
      mutationLock.current = false;
      setPending(false);
    }
  }
  const query = search.trim();
  const visible = filterApplications(
    applications,
    query,
    filter,
    section === "Interviews",
    sort,
  );
  const count = (status: Status) =>
    applications.filter((application) => application.status === status).length;
  const active = applications.filter(
    (application) =>
      application.status !== "Rejected" && application.status !== "Offer",
  ).length;
  const stats = [
    {
      label: "Total applications",
      value: applications.length,
      icon: BriefcaseBusiness,
      className: "indigo",
      description: "Every opportunity, in one place",
      filter: "All",
    },
    {
      label: "Interviews",
      value: count("Interview"),
      icon: CalendarDays,
      className: "amber",
      description: "Conversations worth preparing for",
      filter: "Interview",
    },
    {
      label: "Offers received",
      value: count("Offer"),
      icon: Trophy,
      className: "green",
      description: "Your hard work, paying off",
      filter: "Offer",
    },
    {
      label: "Rejected",
      value: count("Rejected"),
      icon: XCircle,
      className: "rose",
      description: "A redirection, not a destination",
      filter: "Rejected",
    },
  ] as const;
  return (
    <div className="app-shell min-h-dvh">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate("Overview");
          }}
        >
          <span className="brand-icon">
            <Command size={23} />
          </span>
          applyflow<span className="brand-dot">.</span>
        </a>
        <div className="workspace-switch">
          <div className="workspace-avatar">
            Y<span />
          </div>
          <div>
            <strong>My workspace</strong>
            <span>Personal workspace</span>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              aria-current={section === name ? "page" : undefined}
              className={`nav-item ${section === name ? "active" : ""}`}
              onClick={() => navigate(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Applications" && (
                <span className="nav-count">{applications.length}</span>
              )}
              {name === "Interviews" && count("Interview") > 0 && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <Sparkles size={19} />
            </span>
            <h3>Your next chapter awaits.</h3>
            <p>A little progress every day goes a long way.</p>
            <button onClick={() => readOnly ? navigate("Applications") : setForm({ application: null })}>
              {readOnly ? "Explore applications" : "Track an opportunity"} <ArrowRight size={14} />
            </button>
          </div>
          <button
            className={`nav-item help-item ${section === "Guide" ? "active" : ""}`}
            onClick={() => navigate("Guide")}
          >
            <CircleHelp size={19} />
            Quick guide
            <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <span className="profile-avatar">YO</span>
            <div>
              <strong>Your workspace</strong>
              <span>Let’s find your next role</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              ref={menuButton}
              aria-controls="workspace-navigation"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{section}</strong>
          </div>
          <div className="header-right">
            <span className="demo-pill">
              <span />
              {readOnly ? "Read-only demo" : "Local workspace"}
            </span>
            <span
              className="header-avatar"
              aria-label="Your personal workspace"
            >
              YO
            </span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {readOnly && <aside className="demo-banner" aria-label="Portfolio demo information"><div><strong>Read-only portfolio demo</strong><p>Fictional applications and relative example dates. Search, filter and explore analytics; adding, editing and deleting are available in the local project.</p></div><a href="https://github.com/Sameer37609/Applyflow-job-tracker" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></aside>}
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR CAREER, IN MOTION</div>
              <h1 ref={heading} tabIndex={-1}>
                {section === "Overview"
                  ? "A little progress. A big future."
                  : section === "Applications"
                    ? "Every opportunity, organized."
                    : section === "Interviews"
                      ? "Make your next impression."
                      : "A calmer way to job search."}
              </h1>
              <p>
                {section === "Overview"
                  ? "Welcome back. Here’s where your next chapter stands."
                  : section === "Applications"
                    ? "Keep your applications and their next steps in one place."
                    : section === "Interviews"
                      ? "Your applications currently at the interview stage."
                      : "Get comfortable with your ApplyFlow workspace."}
              </p>
            </div>
            {section !== "Guide" && !readOnly && (
              <button
                className="button primary add-button"
                onClick={() => setForm({ application: null })}
              >
                <Plus size={18} />
                Add application
              </button>
            )}
          </div>
          {section === "Guide" ? (
            <div className="guide-grid">
              <section className="panel guide-card">
                <span className="empty-icon">
                  <Target />
                </span>
                <h2>A simple workflow</h2>
                <ol>
                  <li>Add a company, role, and application date.</li>
                  <li>Update its status as your search progresses.</li>
                  <li>Search your list or filter by status.</li>
                  <li>Use Interviews to focus your preparation.</li>
                </ol>
              </section>
              <section className="panel guide-card">
                <span className="empty-icon">
                  <Sparkles />
                </span>
                <h2>About this workspace</h2>
                <p>
                  {readOnly ? "You’re viewing fictional examples in a read-only portfolio demo. This deployment does not connect to a database or accept writes. Clone the source to use the full SQLite CRUD workspace locally." : <>ApplyFlow Phase 3 saves applications in a local SQLite
                  database. Your records survive refreshes and server restarts.
                  This is a personal local workspace with no authentication.
                  Optional seed records are fictional and marked [Demo].</>}
                </p>
                <button
                  className="button secondary"
                  onClick={() => navigate("Overview")}
                >
                  Back to overview <ArrowRight size={15} />
                </button>
              </section>
            </div>
          ) : (
            <>
              {section === "Overview" && (
                <>
                  <section
                    className="stats-grid"
                    aria-label="Application summary"
                  >
                    {stats.map(
                      ({
                        label,
                        value,
                        icon: Icon,
                        className,
                        description,
                        filter: statFilter,
                      }) => (
                        <button
                          className="stat-card"
                          key={label}
                          onClick={() => {
                            setSection("Applications");
                            setFilter(statFilter);
                            setSearch("");
                          }}
                          aria-label={`View ${label.toLowerCase()}: ${value}`}
                        >
                          <div className="stat-top">
                            <span>{label}</span>
                            <span className={`stat-icon ${className}`}>
                              <Icon size={18} />
                            </span>
                          </div>
                          <div className="stat-value">
                            {String(value).padStart(2, "0")}
                            <ArrowUpRight size={18} />
                          </div>
                          <p>{description}</p>
                        </button>
                      ),
                    )}
                  </section>
                  <Analytics applications={applications} today={reportDate} demo={readOnly} />
                  <section className="momentum-banner">
                    <div className="momentum-symbol">
                      <Sparkles size={23} />
                    </div>
                    <div>
                      <h2>You’re building momentum.</h2>
                      <p>
                        {active ? (
                          <>
                            You have{" "}
                            <strong>
                              {active} active{" "}
                              {active === 1 ? "application" : "applications"}
                            </strong>
                            . Every application is a step forward.
                          </>
                        ) : applications.length ? (
                          "No applications are currently in progress. Your saved outcomes are reflected above."
                        ) : (
                          "Your next opportunity starts with one application."
                        )}
                      </p>
                    </div>
                    <button onClick={() => navigate("Interviews")}>
                      View interviews <ArrowRight size={16} />
                    </button>
                    <span className="banner-decoration" aria-hidden="true">
                      ↗
                    </span>
                  </section>
                </>
              )}
              <section
                className="panel applications-panel"
                aria-labelledby="applications-title"
              >
                <div className="panel-heading">
                  <div>
                    <h2 id="applications-title">
                      {section === "Interviews"
                        ? "Interview pipeline"
                        : "Your applications"}
                      <span className="count-pill">
                        {section === "Interviews"
                          ? count("Interview")
                          : applications.length}
                      </span>
                    </h2>
                    <p>
                      {section === "Interviews"
                        ? "Make room to prepare for what comes next."
                        : "The next opportunity could be right here."}
                    </p>
                  </div>
                  <span className="live-state">
                    <span />
                    {readOnly ? "Fictional examples" : "Saved locally"}
                  </span>
                </div>
                <div className="table-toolbar">
                  <div className="table-tabs" aria-label="Application view">
                    <button
                      className={filter === "All" ? "selected" : ""}
                      aria-pressed={filter === "All"}
                      onClick={() => setFilter("All")}
                    >
                      {section === "Interviews"
                        ? "All interviews"
                        : "All applications"}
                      <span>
                        {section === "Interviews"
                          ? count("Interview")
                          : applications.length}
                      </span>
                    </button>
                    {section !== "Interviews" && (
                      <button
                        className={filter === "Applied" ? "selected" : ""}
                        aria-pressed={filter === "Applied"}
                        onClick={() => setFilter("Applied")}
                      >
                        Applied
                      </button>
                    )}
                  </div>
                  <div className="table-controls">
                    <label className="filter-field sort-field">
                      <span className="sr-only">Sort applications</span>
                      <select
                        aria-label="Sort applications"
                        value={sort}
                        onChange={(event) =>
                          setSort(event.target.value as SortOrder)
                        }
                      >
                        {Object.entries(sortLabels).map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        aria-label="Search applications"
                        placeholder="Search company, role, notes…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      {search && (
                        <button
                          aria-label="Clear search"
                          onClick={() => setSearch("")}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </label>
                    {section !== "Interviews" && (
                      <label className="filter-field">
                        <SlidersHorizontal size={15} />
                        <select
                          aria-label="Filter applications by status"
                          value={filter}
                          onChange={(event) =>
                            setFilter(event.target.value as Status | "All")
                          }
                        >
                          <option value="All">All statuses</option>
                          {statuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
                <ApplicationTable
                  readOnly={readOnly}
                  applications={visible}
                  onEdit={(application) => setForm({ application })}
                  onNotes={(application) =>
                    setForm({ application, focusNotes: true })
                  }
                  sort={sort}
                  onDelete={(application) => {
                    setDeleteError("");
                    setDeleting(application);
                  }}
                  onClear={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  filtered={!!query || filter !== "All"}
                  onAdd={() => { if (!readOnly) setForm({ application: null }); }}
                />
                <div
                  className="table-footer"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span>
                    Showing <strong>{visible.length}</strong> of{" "}
                    {section === "Interviews"
                      ? count("Interview")
                      : applications.length}{" "}
                    applications
                  </span>
                  <span>{sortLabels[sort]}</span>
                </div>
              </section>
              <div className="demo-note">
                <span>
                  <CircleHelp size={14} /> {readOnly ? "Fictional demo data. Your interactions do not modify shared records." : "Your applications are saved to this device."}
                </span>
                <span>{readOnly ? "No database connected." : "Saved in your local database."}</span>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>Made for your next chapter.</span>
            <span>
              ApplyFlow <span className="footer-dot">·</span> Phase 3
            </span>
          </footer>
        </main>
      </div>
      <div className="toast-region" role="status" aria-live="polite">
        {notice && (
          <div className="toast">
            <Check size={17} />
            {notice}
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
      {form && (
        <ApplicationForm
          application={form.application}
          readOnly={readOnly}
          focusNotes={form.focusNotes}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <dialog
          ref={deleteDialog}
          className="form-dialog delete-dialog"
          onCancel={(event) => {
            if (pending) event.preventDefault();
            else setDeleting(null);
          }}
          aria-labelledby="delete-title"
        >
          <span className="empty-icon danger">
            <XCircle />
          </span>
          <h2 id="delete-title">Delete this application?</h2>
          <p>
            Remove your {deleting.role} application at {deleting.company}? This
            cannot be undone.
          </p>
          {deleteError && (
            <p className="form-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="dialog-actions">
            <button
              autoFocus
              className="button secondary"
              disabled={pending}
              onClick={() => setDeleting(null)}
            >
              Keep application
            </button>
            <button
              className="button danger-button"
              disabled={pending}
              onClick={remove}
            >
              {pending ? "Deleting…" : "Delete application"}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
