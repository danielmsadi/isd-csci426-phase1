import { useState } from "react";
import { Card, Empty, Field, Modal } from "./UI";
import { validateAssessments, validateRules } from "../data/grading";
export function AssessmentEditor({ items, onChange }) {
  const [removing, setRemoving] = useState(null);
  const update = (id, key, value) =>
    onChange(items.map((a) => (a.id === id ? { ...a, [key]: value } : a)));
  const total = items.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
  return (
    <>
      <div className="grade-toolbar">
        <span
          className={
            validateAssessments(items) ? "weight-warning" : "weight-valid"
          }
          role="status"
        >
          Total weight: {Number(total.toFixed(4))}% / 100%
        </span>
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            onChange([
              ...items,
              { id: crypto.randomUUID(), name: "", weight: "", maximum: 100 },
            ])
          }
        >
          Add assessment
        </button>
      </div>
      {items.length ? (
        <div className="assessment-editor">
          {items.map((a, i) => (
            <div className="assessment-row" key={a.id}>
              <Field label={`Assessment ${i + 1} name`}>
                <input
                  aria-label={`Assessment ${i + 1} name`}
                  value={a.name}
                  placeholder="Assessment name"
                  onChange={(e) => update(a.id, "name", e.target.value)}
                />
              </Field>
              <Field label="Weight (%)">
                <input
                  aria-label={`Assessment ${i + 1} weight`}
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={a.weight}
                  onChange={(e) => update(a.id, "weight", e.target.value)}
                />
              </Field>
              <Field label="Maximum score">
                <input
                  aria-label={`Assessment ${i + 1} maximum`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={a.maximum}
                  onChange={(e) => update(a.id, "maximum", e.target.value)}
                />
              </Field>
              <button
                className="button secondary"
                aria-label={`Remove assessment ${i + 1}`}
                onClick={() => setRemoving(a)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="No assessments defined. Add assessments and assign weights totaling 100%." />
      )}
      {items.length > 0 && validateAssessments(items) && (
        <p className="alert warning" role="status">
          {validateAssessments(items)}
        </p>
      )}
      {removing && (
        <Modal title="Remove assessment" onClose={() => setRemoving(null)}>
          <div className="padded">
            <p>
              Remove {removing.name || "this assessment"} from the unsaved
              structure? Existing recorded scores require service validation
              before a saved structure can change.
            </p>
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => setRemoving(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => {
                  onChange(items.filter((a) => a.id !== removing.id));
                  setRemoving(null);
                }}
              >
                Remove assessment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export function RulesEditor({ rules, onChange }) {
  const update = (index, key, value) =>
    onChange({
      ...rules,
      bands: rules.bands.map((b, i) =>
        i === index ? { ...b, [key]: value } : b,
      ),
    });
  return (
    <>
      <p className="form-description">
        Each threshold includes that percentage up to the next threshold.
        Include a zero threshold. GPA uses a 0–4 scale.
      </p>
      <div className="form-grid">
        <Field label="Percentage decimal places">
          <select
            value={rules.decimals}
            onChange={(e) =>
              onChange({ ...rules, decimals: Number(e.target.value) })
            }
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Threshold comparison">
          <select
            value={rules.roundBeforeGrading ? "rounded" : "exact"}
            onChange={(e) =>
              onChange({
                ...rules,
                roundBeforeGrading: e.target.value === "rounded",
              })
            }
          >
            <option value="exact">Use unrounded percentage</option>
            <option value="rounded">Round before assigning grade</option>
          </select>
        </Field>
      </div>
      {rules.bands.map((b, i) => (
        <div className="assessment-row" key={i}>
          <Field label="Minimum (%)">
            <input
              aria-label={`Grade band ${i + 1} minimum`}
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={b.minimum}
              onChange={(e) => update(i, "minimum", e.target.value)}
            />
          </Field>
          <Field label="Letter grade">
            <input
              aria-label={`Grade band ${i + 1} letter`}
              value={b.letter}
              onChange={(e) => update(i, "letter", e.target.value)}
            />
          </Field>
          <Field label="Grade points">
            <input
              aria-label={`Grade band ${i + 1} points`}
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={b.points}
              onChange={(e) => update(i, "points", e.target.value)}
            />
          </Field>
          <button
            className="button secondary"
            aria-label={`Remove grade band ${i + 1}`}
            onClick={() =>
              onChange({
                ...rules,
                bands: rules.bands.filter((_, j) => i !== j),
              })
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="button secondary"
        onClick={() =>
          onChange({
            ...rules,
            bands: [...rules.bands, { minimum: "", letter: "", points: "" }],
          })
        }
      >
        Add grade band
      </button>
      <p className="form-description" role="status">
        {validateRules(rules) || "Grading scale is valid."}
      </p>
    </>
  );
}
