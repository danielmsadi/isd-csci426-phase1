import { ArrowUpRight, Search, Inbox } from "lucide-react";
import { useEffect, useRef } from "react";
export function PageHeader({
  eyebrow = "STUDENT PORTAL",
  title,
  description,
  children,
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Badge({ children, tone }) {
  const good = ["Active", "Paid", "Approved", "Published", "Completed", "Open"];
  const bad = ["Overdue", "Rejected", "Closed", "Hold"];
  return (
    <span
      className={`badge ${tone || (good.includes(children) ? "green" : bad.includes(children) ? "red" : "blue")}`}
    >
      {children}
    </span>
  );
}
export function Stat({ label, value, detail, icon: Icon, color = "blue" }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        {Icon && (
          <span className={`icon-box ${color}`}>
            <Icon size={19} />
          </span>
        )}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function Table({ columns, rows, empty = "No records to display." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty text={empty} />}
    </div>
  );
}
export function Empty({ text }) {
  return (
    <div className="empty">
      <Inbox size={28} />
      <p>{text}</p>
    </div>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function SearchBox({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    return () => previous?.focus();
  }, []);
  function keyboard(e) {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab") {
      const elements = Array.from(
        ref.current.querySelectorAll(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, a[href]",
        ),
      );
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        ref={ref}
        tabIndex={-1}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={keyboard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function ArrowLink({ children }) {
  return (
    <>
      {children}
      <ArrowUpRight size={15} />
    </>
  );
}
export function download(name, content, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
