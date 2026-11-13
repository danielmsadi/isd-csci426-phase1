export default function ManagementTabs({
  label,
  tabs,
  active,
  onChange,
  panelIds = {},
}) {
  return (
    <div className="management-tabs" role="tablist" aria-label={label}>
      {tabs.map(([id, title]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          aria-controls={panelIds[id] || `${label}-${id}`}
          id={`${label}-tab-${id}`}
          tabIndex={active === id ? 0 : -1}
          onClick={() => onChange(id)}
          onKeyDown={(event) => {
            const index = tabs.findIndex(([value]) => value === id);
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            if (event.key === "ArrowLeft")
              next = (index + tabs.length - 1) % tabs.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = tabs.length - 1;
            if (next !== undefined) {
              event.preventDefault();
              onChange(tabs[next][0]);
              event.currentTarget.parentElement.children[next].focus();
            }
          }}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
