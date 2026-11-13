import { Fragment, useState } from "react";
import { usePortal } from "../data/PortalContext";
import { Card, Field, Table, SearchBox, Badge, Modal } from "./UI";
export const optionsFrom = (rows, label = "name") =>
  rows.map((row) => ({ value: row.id, label: row[label] || row.id }));
export const currency = (value) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
export function ConnectionStatus() {
  const { status, error, reload } = usePortal();
  if (status === "loading")
    return (
      <div className="alert info" role="status">
        Loading portal information…
      </div>
    );
  if (status === "error")
    return (
      <div className="alert warning" role="alert">
        {error}{" "}
        <button className="button secondary small" onClick={() => reload()}>
          Try again
        </button>
      </div>
    );
  if (status === "disconnected")
    return (
      <div className="connection-note">
        Services are not connected yet. Records will appear here when available;
        form entries are not saved.
      </div>
    );
  return null;
}
export function ApiForm({
  title,
  description,
  fields,
  endpoint,
  method = "POST",
  submitLabel = "Save changes",
  initial = {},
  validate,
  onSuccess,
  transform,
  disabled = false,
  confirmation,
}) {
  const { api, notify, reload } = usePortal();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [files, setFiles] = useState([]),
    [pending, setPending] = useState(null);
  async function send(body) {
    setPending(null);
    setBusy(true);
    setError("");
    try {
      const result = await api.request(endpoint, { method, body });
      notify("Request completed by the server.");
      onSuccess?.(result);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || disabled || pending) return;
    const data = new FormData(event.currentTarget),
      values = {};
    fields.forEach((field) => {
      if (field.type === "file") return;
      const value = data.get(field.name);
      values[field.name] =
        field.type === "number"
          ? value === ""
            ? null
            : Number(value)
          : (value ?? "");
    });
    try {
      setError("");
      const blank = fields.find(
        (f) =>
          f.required !== false &&
          f.type !== "file" &&
          !f.disabled &&
          (values[f.name] == null || String(values[f.name]).trim() === ""),
      );
      if (blank) throw new Error(`${blank.label} is required.`);
      const validation = validate?.(values);
      if (validation) throw new Error(validation);
      if (
        fields.some((f) => f.type === "file") &&
        files.some(
          (file) =>
            file.size > 5 * 1024 * 1024 ||
            !/\.(pdf|jpe?g|png)$/i.test(file.name),
        )
      )
        throw new Error("Choose PDF, JPG or PNG documents up to 5 MB each.");
      const body = fields.some((f) => f.type === "file")
        ? data
        : transform
          ? transform(values)
          : values;
      if (confirmation) setPending(body);
      else await send(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const form = (
    <form className="padded" onSubmit={submit}>
      <fieldset className="editor-fieldset" disabled={busy || Boolean(pending)}>
        {description && <p className="form-description">{description}</p>}
        <div className="form-required">
          All fields are required unless marked optional. Changes require a
          connected service.
        </div>
        <div className="form-grid">
          {fields.map((field, index) => (
            <Fragment key={field.name}>
              {field.group && field.group !== fields[index - 1]?.group && (
                <h3 className="form-section-heading">{field.group}</h3>
              )}
              <Field
                label={`${field.label}${field.readOnly ? " (assigned)" : field.required === false ? " (optional)" : ""}`}
                hint={field.hint}
              >
                {field.type === "select" ? (
                  <select
                    aria-label={field.label}
                    name={field.name}
                    required={field.required !== false}
                    defaultValue={initial[field.name] ?? ""}
                    disabled={field.disabled || !field.options?.length}
                  >
                    <option value="">
                      {field.options?.length
                        ? "Select an option"
                        : field.empty || "No options available yet"}
                    </option>
                    {field.options?.map((option) => (
                      <option
                        key={option.value ?? option}
                        value={option.value ?? option}
                      >
                        {option.label ?? option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    aria-label={field.label}
                    name={field.name}
                    rows={4}
                    required={field.required !== false}
                    minLength={field.minLength}
                    defaultValue={initial[field.name] ?? ""}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "file" ? (
                  <>
                    <input
                      aria-label={field.label}
                      name={field.name}
                      type="file"
                      required={field.required !== false}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                    />
                    {files.map((file, index) => (
                      <small key={index}>
                        {file.name} · {Math.ceil(file.size / 1024)} KB
                      </small>
                    ))}
                  </>
                ) : (
                  <input
                    aria-label={field.label}
                    name={field.name}
                    type={field.type || "text"}
                    required={field.required !== false}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    minLength={field.minLength}
                    pattern={field.pattern}
                    readOnly={field.readOnly}
                    defaultValue={initial[field.name] ?? ""}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete || "off"}
                  />
                )}
              </Field>
            </Fragment>
          ))}
        </div>
        {error && (
          <div className="alert warning" role="alert">
            {error}
          </div>
        )}
        <button
          className="button primary"
          disabled={
            busy ||
            disabled ||
            fields.some(
              (f) =>
                f.required !== false &&
                f.type === "select" &&
                !f.options?.length,
            )
          }
        >
          {busy ? "Sending…" : submitLabel}
        </button>
      </fieldset>
    </form>
  );
  return (
    <>
      {title ? <Card title={title}>{form}</Card> : form}
      {pending && (
        <Modal title={submitLabel} onClose={() => setPending(null)}>
          <div className="padded">
            <p>{confirmation}</p>
            <dl className="profile-details">
              {fields
                .filter((f) => !f.readOnly && f.type !== "file")
                .map((f) => (
                  <div key={f.name}>
                    <dt>{f.label}</dt>
                    <dd>{String(pending[f.name] ?? "—")}</dd>
                  </div>
                ))}
            </dl>
            <div className="button-row">
              <button
                type="button"
                className="button secondary"
                onClick={() => setPending(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => send(pending)}
              >
                Confirm {submitLabel.toLowerCase()}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export function ResourceTable({
  title,
  description,
  rows,
  columns,
  empty,
  filterKey,
  filterLabel = "Status",
  actions,
}) {
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  const [page, setPage] = useState(1),
    [sort, setSort] = useState("");
  const filters = [
    ...new Set(rows.map((row) => row[filterKey]).filter(Boolean)),
  ];
  const visible = rows.filter(
    (row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ) &&
      (!filter || row[filterKey] === filter),
  );
  if (sort)
    visible.sort((a, b) =>
      String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""), undefined, {
        numeric: true,
      }),
    );
  const pages = Math.max(1, Math.ceil(visible.length / 10)),
    currentPage = Math.min(page, pages);
  const formatted = columns.map((column) =>
    typeof column === "string"
      ? {
          key: column,
          label: column
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (c) => c.toUpperCase()),
          render: (row) =>
            row[column] == null || row[column] === ""
              ? "—"
              : Array.isArray(row[column])
                ? row[column].join(", ")
                : String(row[column]),
        }
      : column,
  );
  if (actions)
    formatted.push({ key: "actions", label: "Actions", render: actions });
  return (
    <Card title={title} subtitle={description}>
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={`Search ${title.toLowerCase()}`}
        />
        {filterKey && (
          <select
            aria-label={`Filter ${filterLabel.toLowerCase()}`}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All {filterLabel.toLowerCase()}</option>
            {filters.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        )}
        <select
          aria-label={`Sort ${title.toLowerCase()}`}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Default order</option>
          {formatted
            .filter((c) => c.key !== "actions")
            .map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
        </select>
        {(search || filter) && (
          <button
            className="button secondary small"
            onClick={() => {
              setSearch("");
              setFilter("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <Table
        columns={formatted}
        rows={visible.slice((currentPage - 1) * 10, currentPage * 10)}
        empty={
          search || filter
            ? "No records match your filters."
            : empty || "No records available yet."
        }
      />
      <div className="table-pagination">
        <span>
          {visible.length} {visible.length === 1 ? "record" : "records"}
          {search || filter ? " matching filters" : ""}
        </span>
        <button
          className="button secondary small"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {pages}
        </span>
        <button
          className="button secondary small"
          disabled={currentPage === pages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </Card>
  );
}
export function ServerAction({
  label,
  endpoint,
  method = "POST",
  body,
  disabled,
  filename,
  confirmation,
}) {
  const { api, notify, reload } = usePortal();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  async function run() {
    setConfirming(false);
    setBusy(true);
    try {
      const result = await api.request(endpoint, {
        method,
        body,
        binary: Boolean(filename),
      });
      if (filename) {
        const url = URL.createObjectURL(result);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        notify("Request completed by the server.");
        await reload();
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="button secondary small"
        onClick={() => (confirmation ? setConfirming(true) : run())}
        disabled={disabled || busy}
      >
        {busy ? "Please wait…" : label}
      </button>
      {confirming && (
        <Modal title={label} onClose={() => setConfirming(false)}>
          <div className="padded">
            <p>{confirmation}</p>
            <p className="form-description">
              This action requires confirmation from the connected service.
            </p>
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button className="button primary" onClick={run}>
                Confirm {label.toLowerCase()}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export const statusColumn = {
  key: "status",
  label: "Status",
  render: (row) => (row.status ? <Badge>{row.status}</Badge> : "—"),
};
