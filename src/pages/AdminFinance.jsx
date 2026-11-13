import { useState } from "react";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Empty, Badge, Field, Modal } from "../components/UI";
import {
  ApiForm,
  ResourceTable,
  ServerAction,
  currency,
  statusColumn,
} from "../components/BackendUI";
import {
  financialAccess,
  selectedStudentFinance,
  searchFinanceStudents,
  registrationOverridePayload,
  studentSemesterFinance,
  validateOfficePayment,
  aidDecisionPayload,
} from "../data/finance";

function RegistrationOverride({ student, finance, onClose }) {
  const { api, reload, role } = usePortal();
  const [decision, setDecision] = useState(
    String(finance?.registrationOverride ?? false),
  );
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function review() {
    try {
      setError("");
      setPending(
        registrationOverridePayload(student, {
          registrationOverride: decision,
          reason,
        }),
      );
    } catch (err) {
      setError(err.message);
    }
  }
  async function confirm() {
    if (role !== "admin" || !pending || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.request("/finance/student-controls", {
        method: "PATCH",
        body: pending,
      });
      await reload();
      onClose();
    } catch (err) {
      setError(err.message);
      setPending(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Registration hold override"
      onClose={() => !busy && onClose()}
    >
      <div className="padded">
        <p>
          {student.name} · {student.id}
        </p>
        <p>
          This action affects only this student's registration. Academic-record
          holds and charges remain unchanged.
        </p>
        {!pending ? (
          <>
            <Field label="Registration decision">
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              >
                <option value="false">
                  Apply standard registration restriction
                </option>
                <option value="true">Allow registration despite hold</option>
              </select>
            </Field>
            <Field label="Reason">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minLength={10}
              />
            </Field>
            <button className="button primary" onClick={review}>
              Review override
            </button>
          </>
        ) : (
          <>
            <p>
              Confirm{" "}
              {pending.registrationOverride
                ? "allowing registration despite the hold"
                : "applying the standard restriction"}{" "}
              for {student.name} ({student.id})?
            </p>
            <p>{pending.reason}</p>
            <div className="button-row">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setPending(null)}
              >
                Back
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={confirm}
              >
                {busy ? "Sending…" : "Confirm registration override"}
              </button>
            </div>
          </>
        )}
        {error && (
          <div className="alert warning" role="alert">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AdminFinance() {
  const { db, role } = usePortal();
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [semesterId, setSemester] = useState("");
  const [majorId, setMajor] = useState("");
  const [requestId, setRequest] = useState("");
  const [override, setOverride] = useState(false);
  const account = selectedStudentFinance(db, selected);
  const { student, finance, overdueBalance, restrictionsKnown } = account;
  const scope = studentSemesterFinance(db, selected, semesterId);
  const access = financialAccess(finance, account.installments);
  const matches = searchFinanceStudents(db.students, query);
  const request =
    scope.requests.find((r) => r.id === requestId) ||
    (scope.requests.length === 1 ? scope.requests[0] : null);
  const rates = db.pricing.filter((p) => p.majorId === majorId && !p.courseId);
  const rate = rates.length === 1 ? rates[0] : null;
  function changeStudent(id) {
    setSelected(id);
    setRequest("");
    setOverride(false);
  }
  if (role !== "admin")
    return (
      <PageHeader
        title="Admin access required"
        description="Only Admin can manage finance."
      />
    );
  return (
    <>
      <PageHeader
        eyebrow="FINANCE OFFICE"
        title="Finance management"
        description="Configure major credit prices, record office cash payments and review semester financial aid."
      />
      <Card
        title="Course Credit Pricing"
        subtitle="Courses belonging to a major use that major's USD price per credit."
      >
        <div className="padded">
          <Field label="Major">
            <select
              value={majorId}
              disabled={!db.majors.length}
              onChange={(e) => setMajor(e.target.value)}
            >
              <option value="">
                {db.majors.length ? "Select major" : "No majors available"}
              </option>
              {db.majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <p className="form-description">
            Tuition = registered credits × the major's price per credit, less
            applicable approved discounts. Net tuition is divided into four
            equal installments.
          </p>
          {rates.length > 1 && (
            <p className="alert info">
              Multiple configured rates exist. Review their effective semesters
              below before updating pricing.
            </p>
          )}
        </div>
        <ApiForm
          key={`pricing-${majorId}-${rate?.rate}`}
          endpoint="/pricing/majors"
          method="PUT"
          submitLabel="Save credit price"
          disabled={!majorId}
          initial={{ rate: rate?.rate ?? "" }}
          fields={[
            {
              name: "rate",
              label: "Price per credit (USD)",
              type: "number",
              min: 0,
              step: ".01",
            },
          ]}
          validate={(v) =>
            !db.majors.some((m) => m.id === majorId)
              ? "Select a major."
              : v.rate == null || !Number.isFinite(v.rate) || v.rate < 0
                ? "Enter a valid nonnegative credit price."
                : null
          }
          transform={(v) => ({ majorId, rate: v.rate })}
        />
        <ResourceTable
          title="Configured major prices"
          rows={db.pricing.filter(
            (p) =>
              !p.courseId &&
              (p.majorId || String(p.type).toLowerCase() === "major"),
          )}
          columns={[
            {
              key: "name",
              label: "Major",
              render: (p) =>
                db.majors.find((m) => m.id === p.majorId)?.name ||
                p.name ||
                "Information unavailable",
            },
            {
              key: "rate",
              label: "USD per credit",
              render: (p) => currency(p.rate),
            },
            "effectiveSemester",
          ]}
          empty="No major credit prices have been configured."
        />
      </Card>
      <Card
        title="Student account"
        subtitle="One student and semester selection applies to both payment recording and financial aid."
      >
        <div className="padded">
          <div className="form-grid">
            <Field label="Search by name or Student ID">
              <input
                type="search"
                placeholder="Enter a name or Student ID"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  changeStudent("");
                }}
              />
            </Field>
            <Field label="Select student">
              <select
                aria-label="Finance student"
                value={selected}
                disabled={!db.students.length}
                onChange={(e) => changeStudent(e.target.value)}
              >
                <option value="">
                  {db.students.length
                    ? "Select a student"
                    : "No students available"}
                </option>
                {matches.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Semester">
              <select
                aria-label="Finance semester"
                value={semesterId}
                disabled={!student || !db.semesters.length}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setRequest("");
                }}
              >
                <option value="">
                  {db.semesters.length
                    ? "Select semester"
                    : "No semesters available"}
                </option>
                {db.semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {query && !matches.length && (
            <p role="status">No students match your search.</p>
          )}
          {!student ? (
            <Empty text="Select a student to view balances, requests and financial restrictions." />
          ) : (
            <>
              <dl className="profile-details">
                <div>
                  <dt>Student</dt>
                  <dd>
                    {student.name} · {student.id}
                  </dd>
                </div>
                <div>
                  <dt>Major</dt>
                  <dd>
                    {student.majorName ||
                      db.majors.find((m) => m.id === student.majorId)?.name ||
                      "Information unavailable"}
                  </dd>
                </div>
                <div>
                  <dt>Selected semester outstanding balance</dt>
                  <dd>
                    {scope.finance?.balance == null
                      ? "Information unavailable"
                      : currency(scope.finance.balance)}
                  </dd>
                </div>
                <div>
                  <dt>Account overdue balance including penalties</dt>
                  <dd>
                    {overdueBalance == null
                      ? "Information unavailable"
                      : currency(overdueBalance)}
                  </dd>
                </div>
                <div>
                  <dt>Grades, GPA & transcripts</dt>
                  <dd>
                    <Badge>
                      {!restrictionsKnown
                        ? "Information unavailable"
                        : access.restricted
                          ? "Hold"
                          : "No overdue restriction"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt>Next-semester registration</dt>
                  <dd>
                    <Badge>
                      {!restrictionsKnown
                        ? "Information unavailable"
                        : access.registrationRestricted
                          ? "Hold"
                          : access.restricted
                            ? "Override active"
                            : "No overdue restriction"}
                    </Badge>
                  </dd>
                </div>
              </dl>
              <button
                className="button secondary small"
                disabled={!restrictionsKnown}
                onClick={() => setOverride(true)}
              >
                Manage registration override
              </button>
            </>
          )}
          <p className="form-description">
            A $20 penalty applies once per late installment. Overdue amounts and
            unpaid penalties block academic records and next-semester
            registration until settlement is confirmed. Registration overrides
            do not release academic records or waive charges.
          </p>
        </div>
      </Card>
      <Card title="Record Cash Payment">
        <ApiForm
          key={`cash-${selected}-${semesterId}`}
          endpoint="/payments/cash"
          submitLabel="Record payment"
          disabled={!student || !semesterId || !scope.installments.length}
          description="Record cash received at the university office for the student and semester selected above."
          confirmation={`Confirm this cash payment for ${student?.name || "the selected student"} (${selected}) in ${db.semesters.find((s) => s.id === semesterId)?.name || "the selected semester"}.`}
          validate={(v) =>
            validateOfficePayment(v, selected, semesterId, scope.installments)
          }
          transform={(v) => ({
            ...v,
            reference: v.reference.trim(),
            studentId: selected,
            semesterId,
            method: "Cash",
          })}
          fields={[
            {
              name: "installmentId",
              label: "Installment",
              type: "select",
              options: scope.installments.map((i) => ({
                value: i.id,
                label: `Installment ${i.number} · ${i.dueDate || "Date unavailable"} · Outstanding ${currency(i.balance == null || i.penaltyBalance == null ? null : Number(i.balance) + Number(i.penaltyBalance))}`,
              })),
            },
            {
              name: "amount",
              label: "Amount (USD)",
              type: "number",
              min: ".01",
              step: ".01",
            },
            { name: "date", label: "Payment date", type: "date" },
            { name: "reference", label: "Receipt number" },
          ]}
        />
        <details className="management-disclosure">
          <summary>Installments & payment history</summary>
          <ResourceTable
            title="Four tuition installments"
            rows={scope.installments}
            columns={[
              "number",
              "dueDate",
              {
                key: "amount",
                label: "Tuition",
                render: (r) => currency(r.amount),
              },
              {
                key: "balance",
                label: "Unpaid tuition",
                render: (r) => currency(r.balance),
              },
              {
                key: "penaltyBalance",
                label: "Unpaid penalty",
                render: (r) => currency(r.penaltyBalance),
              },
              statusColumn,
            ]}
            empty="No installment plan is available for the selected student and semester."
          />
          <ResourceTable
            title="Payment history"
            rows={scope.payments}
            columns={[
              "receiptNumber",
              "date",
              "installmentNumber",
              {
                key: "amount",
                label: "Amount",
                render: (r) => currency(r.amount),
              },
              "method",
              statusColumn,
            ]}
            empty="No payments or receipts are available for the selected student and semester."
            actions={(row) => (
              <ServerAction
                label="Download receipt"
                endpoint={`/payments/${encodeURIComponent(row.id)}/receipt`}
                method="GET"
                filename="tuition-receipt.pdf"
              />
            )}
          />
        </details>
      </Card>
      <Card
        title="Financial Aid"
        subtitle="Review submitted assistance requests for the selected student and semester only."
      >
        <div className="padded">
          {scope.requests.length > 1 && (
            <Field label="Submitted aid request">
              <select
                value={requestId}
                onChange={(e) => setRequest(e.target.value)}
              >
                <option value="">Select request</option>
                {scope.requests.map((r) => (
                  <option value={r.id} key={r.id}>
                    {r.submittedAt || r.id} · {r.status}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {request ? (
            <>
              <Badge>{request.status || "Status unavailable"}</Badge>
              <p>
                Requested assistance:{" "}
                {request.requestedPercent == null
                  ? "Information unavailable"
                  : `${request.requestedPercent}%`}
              </p>
              <p>{request.reason || "No request details available."}</p>
              {request.documents?.map((d) => (
                <p key={d.id}>{d.name}</p>
              ))}
            </>
          ) : (
            <Empty text="No submitted aid request is selected for this student and semester." />
          )}
        </div>
        <ApiForm
          key={`aid-${selected}-${semesterId}-${request?.id}`}
          endpoint={`/requests/${encodeURIComponent(request?.id || "")}/decision`}
          method="PATCH"
          submitLabel="Record aid decision"
          disabled={!request}
          initial={{
            status: request?.status,
            aidPercent: request?.aidPercent ?? "",
            decisionNote: request?.decisionNote || "",
          }}
          confirmation={`Confirm this aid decision for ${student?.name || "the selected student"} (${selected}) in ${db.semesters.find((s) => s.id === semesterId)?.name || "the selected semester"}. Other students and semesters remain unchanged.`}
          validate={(v) => {
            try {
              aidDecisionPayload(request, selected, semesterId, v);
              return null;
            } catch (err) {
              return err.message;
            }
          }}
          transform={(v) =>
            aidDecisionPayload(request, selected, semesterId, v)
          }
          fields={[
            {
              name: "status",
              label: "Aid decision",
              type: "select",
              options: ["Approved", "Rejected"],
            },
            {
              name: "aidPercent",
              label: "Approved discount (%)",
              type: "number",
              min: 0,
              max: 100,
              step: ".01",
              required: false,
              hint: "Required for approval, including 0%. Rejection grants no discount.",
            },
            { name: "decisionNote", label: "Decision note", type: "textarea" },
          ]}
        />
      </Card>
      {override && student && (
        <RegistrationOverride
          key={selected}
          student={student}
          finance={finance}
          onClose={() => setOverride(false)}
        />
      )}
    </>
  );
}
