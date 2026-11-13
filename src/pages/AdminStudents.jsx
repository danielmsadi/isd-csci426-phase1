import { useState } from "react";
import { studentFields, validateStudent } from "../data/studentFields";
import { Plus } from "lucide-react";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Modal } from "../components/UI";
import {
  ApiForm,
  ResourceTable,
  ServerAction,
  optionsFrom,
  statusColumn,
} from "../components/BackendUI";
export default function AdminStudents() {
  const { db } = usePortal();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHeader
        eyebrow="STUDENT ADMINISTRATION"
        title="Student accounts"
        description="Manage university accounts and student enrollment status."
      >
        <button className="button primary" onClick={() => setEditing({})}>
          <Plus size={16} /> Create student account
        </button>
      </PageHeader>
      <ResourceTable
        title="Student directory"
        rows={db.students}
        filterKey="status"
        columns={["id", "name", "email", "majorName", statusColumn]}
        empty="No student accounts are available. Accounts will appear when connected to the university system."
        actions={(row) => (
          <div className="button-row">
            <button
              className="button secondary small"
              onClick={() => setEditing(row)}
            >
              Edit
            </button>
            <ServerAction
              label="Send welcome link"
              endpoint={`/students/${encodeURIComponent(row.id)}/welcome`}
            />
          </div>
        )}
      />
      {editing && (
        <Modal
          title={editing.id ? "Edit student account" : "Create student account"}
          onClose={() => setEditing(null)}
        >
          <ApiForm
            initial={editing}
            endpoint={
              editing.id
                ? `/students/${encodeURIComponent(editing.id)}`
                : "/students"
            }
            method={editing.id ? "PATCH" : "POST"}
            onSuccess={() => setEditing(null)}
            submitLabel={editing.id ? "Save account" : "Create account"}
            description="The university service will create the account and send a password setup link. Changes to an existing student's major take effect next semester."
            fields={studentFields(db)}
            validate={(values) => validateStudent(values, db)}
            transform={({ id, ...values }) => values}
          />
        </Modal>
      )}
    </>
  );
}
