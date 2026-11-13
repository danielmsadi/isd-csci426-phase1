import { useState } from "react";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Modal } from "../components/UI";
import {
  ApiForm,
  ResourceTable,
  optionsFrom,
  statusColumn,
} from "../components/BackendUI";
export default function Applications({
  type = "Aid",
  admin = false,
  embedded = false,
  studentId = "",
}) {
  const { db } = usePortal();
  const [reviewing, setReviewing] = useState(null);
  const name =
    type === "Aid"
      ? "Financial aid"
      : type === "Major"
        ? "Major change"
        : "Registration override";
  const rows = db.requests
    .filter((r) => !studentId || r.studentId === studentId)
    .filter((r) =>
      embedded
        ? r.type === type
        : admin
          ? type === "Override"
            ? r.type === "Override"
            : r.type !== "Override"
          : r.type === type,
    );
  const fields =
    type === "Aid"
      ? [
          {
            name: "requestedPercent",
            label: "Requested tuition assistance (%)",
            type: "number",
            min: 1,
            max: 100,
          },
          {
            name: "documents",
            label: "Supporting documents",
            type: "file",
            hint: "PDF, JPG or PNG · up to 5 MB per document. Files are not uploaded until the service is connected and submission succeeds.",
          },
        ]
      : type === "Major"
        ? [
            {
              name: "majorId",
              label: "Requested major",
              type: "select",
              options: optionsFrom(
                db.majors.filter((m) => m.id !== db.currentStudent?.majorId),
              ),
            },
          ]
        : [
            {
              name: "courseId",
              label: "Course",
              type: "select",
              options: optionsFrom(db.courses),
            },
            {
              name: "exception",
              label: "Exception requested",
              type: "select",
              options: [
                "Prerequisite",
                "Credit limit",
                "Deadline",
                "Financial hold",
              ],
            },
          ];
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow={admin ? "REGISTRAR WORKSPACE" : "STUDENT SERVICES"}
          title={
            admin
              ? type === "Override"
                ? "Overrides & exceptions"
                : "Applications & approvals"
              : `${name} application`
          }
          description={
            admin
              ? "Review applications and record decisions with supporting notes."
              : type === "Major"
                ? "Approved changes take effect next semester."
                : type === "Aid"
                  ? "Apply for support with your university tuition."
                  : "Request a review of a registration restriction."
          }
        />
      )}
      {!admin && (
        <div className="application-layout">
          <ApiForm
            title={`New ${name.toLowerCase()} request`}
            endpoint={`/requests/${type.toLowerCase()}`}
            submitLabel="Submit application"
            fields={[
              ...fields,
              {
                name: "reason",
                label: "Reason for request",
                type: "textarea",
                minLength: 20,
                hint: "Provide at least 20 characters explaining your circumstances.",
              },
            ]}
          />
          <aside className="guidance-card">
            <h2>Prepare your request.</h2>
            <p>
              Complete the required fields and review your information before
              submitting.
            </p>
            <ol>
              <li>Provide supporting details.</li>
              <li>The university reviews your application.</li>
              <li>Track the decision in the table below.</li>
            </ol>
            <p>
              {type === "Major"
                ? "Your current major remains active until the next semester."
                : type === "Override"
                  ? "Previously taken courses and full sections cannot be overridden. A registration override does not release academic records."
                  : "Your award and payment schedule will be confirmed by the university."}
            </p>
          </aside>
        </div>
      )}
      <ResourceTable
        title={admin ? "Review queue" : "Application history"}
        rows={rows}
        filterKey="status"
        columns={[
          ...(admin ? ["studentName"] : []),
          "type",
          "submittedAt",
          "reason",
          "decisionNote",
          statusColumn,
        ]}
        empty="No applications are available."
        actions={
          admin
            ? (row) => (
                <button
                  className="button secondary small"
                  onClick={() => setReviewing(row)}
                >
                  Review
                </button>
              )
            : undefined
        }
      />
      {reviewing && (
        <Modal title="Review application" onClose={() => setReviewing(null)}>
          <p>{reviewing.reason}</p>
          {reviewing.documents?.map((document) => (
            <p key={document.id}>{document.name}</p>
          ))}
          <ApiForm
            initial={reviewing}
            endpoint={`/requests/${encodeURIComponent(reviewing.id)}/decision`}
            method="PATCH"
            submitLabel="Record decision"
            confirmation="Confirm this application decision and any approved financial aid percentage."
            validate={(values) =>
              reviewing.type === "Aid" &&
              values.status === "Approved" &&
              !(values.aidPercent > 0 && values.aidPercent <= 100)
                ? "An approved award requires a percentage greater than 0 and at most 100."
                : null
            }
            transform={(values) =>
              reviewing.type === "Aid"
                ? {
                    ...values,
                    aidPercent:
                      values.status === "Approved" ? values.aidPercent : 0,
                  }
                : values
            }
            onSuccess={() => setReviewing(null)}
            fields={[
              {
                name: "status",
                label: "Decision",
                type: "select",
                options: ["Approved", "Rejected"],
              },
              ...(reviewing.type === "Aid"
                ? [
                    {
                      name: "aidPercent",
                      label: "Approved discount (%)",
                      type: "number",
                      min: 0,
                      max: 100,
                      step: ".01",
                      required: false,
                      hint: "Required for approval. Rejection grants no discount.",
                    },
                  ]
                : []),
              {
                name: "decisionNote",
                label: "Decision note",
                type: "textarea",
              },
            ]}
          />
        </Modal>
      )}
    </>
  );
}
