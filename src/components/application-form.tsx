"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import {
  type Application,
  type ApplicationInput,
  statuses,
  localToday,
} from "@/lib/applications";
import { validateApplication } from "@/lib/validation";

type Props = {
  application: Application | null;
  onClose: () => void;
  onSave: (value: ApplicationInput) => Promise<void>;
  focusNotes?: boolean;
};
export function ApplicationForm({
  application,
  onClose,
  onSave,
  focusNotes = false,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    if (error)
      dialog.current?.querySelector<HTMLElement>("#application-error")?.focus();
  }, [error]);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    element?.showModal();
    const field = element?.querySelector<HTMLElement>(
      focusNotes ? 'textarea[name="notes"]' : 'input[name="company"]',
    );
    field?.focus();
    if (focusNotes) field?.scrollIntoView({ block: "center" });
    return () => {
      element?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, [focusNotes]);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    const company = String(data.get("company") ?? "").trim();
    const role = String(data.get("role") ?? "").trim();
    const date = String(data.get("date") ?? "");
    const status = String(data.get("status"));
    const result = validateApplication({
      company,
      role,
      date,
      status,
      location: String(data.get("location") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
      applicationUrl: String(data.get("applicationUrl") ?? "").trim(),
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onSave(result.data!);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="form-dialog"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
      onClick={(event) => {
        if (pending) return;
        if (event.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="form-title"
      aria-describedby="form-description"
    >
      <div className="dialog-top">
        <span className="dialog-symbol">
          {application ? <Pencil size={22} /> : <Plus size={24} />}
        </span>
        <button
          className="icon-button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>
      <h2 id="form-title">
        {application ? "Edit application" : "A new opportunity"}
      </h2>
      <p id="form-description">
        {application
          ? "Keep the details of your next chapter up to date."
          : "Small steps lead to big things. Let’s track this one."}
      </p>
      <form
        onSubmit={submit}
        className="application-form"
        aria-describedby={error ? "application-error" : undefined}
      >
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="form-fields"
        >
          <label>
            Company <span>*</span>
            <input
              name="company"
              placeholder="e.g. Linear"
              required
              maxLength={80}
              defaultValue={application?.company}
              autoFocus
            />
          </label>
          <label>
            Job title <span>*</span>
            <input
              name="role"
              placeholder="e.g. Frontend Engineer"
              required
              maxLength={100}
              defaultValue={application?.role}
            />
          </label>
          <div className="form-grid">
            <label>
              Status <span>*</span>
              <select
                name="status"
                defaultValue={application?.status ?? "Applied"}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label>
              Application date <span>*</span>
              <input
                type="date"
                name="date"
                required
                max={localToday()}
                min="1900-01-01"
                defaultValue={application?.date ?? localToday()}
              />
            </label>
          </div>
          <label>
            Location <small>Optional</small>
            <input
              name="location"
              maxLength={100}
              placeholder="e.g. Remote"
              defaultValue={application?.location}
            />
          </label>
          <label>
            Application URL <small>Optional</small>
            <input
              name="applicationUrl"
              type="url"
              maxLength={2048}
              placeholder="https://company.com/careers/role"
              defaultValue={application?.applicationUrl}
            />
          </label>
          <label>
            Notes <small>Optional</small>
            <textarea
              aria-label="Notes"
              name="notes"
              rows={5}
              maxLength={1000}
              placeholder="Anything you’d like to remember…"
              aria-describedby="notes-help"
              defaultValue={application?.notes}
            />
            <span className="notes-help" id="notes-help">
              Add next steps, interview prep, or follow-up details. Notes are
              included in search.
            </span>
          </label>
          {error && (
            <p
              className="form-error"
              role="alert"
              id="application-error"
              tabIndex={-1}
            >
              {error}
            </p>
          )}
          <p className="form-footnote">
            Saved to your local database when you submit.
          </p>
          <div className="dialog-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button primary" type="submit">
              {pending
                ? "Saving…"
                : application
                  ? "Save changes"
                  : "Add application"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
