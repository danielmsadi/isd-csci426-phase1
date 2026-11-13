import { useState } from "react";
import { Link } from "react-router-dom";
import { usePortal } from "../data/PortalContext";
import { PageHeader } from "../components/UI";
import Gradebook from "./Gradebook";
export default function AdminGrades() {
  const { role } = usePortal();
  const [courseId, setCourse] = useState("");
  if (role !== "admin")
    return (
      <PageHeader
        title="Admin access required"
        description="Only Admin can manage grades."
      />
    );
  return (
    <>
      <PageHeader
        eyebrow="ACADEMIC RECORDS"
        title="Grade Management"
        description="Enter assessment scores, save drafts and publish results for your selected section."
      >
        <Link className="button secondary" to="/admin/courses?view=assessments">
          Configure course assessments
        </Link>
      </PageHeader>
      <Gradebook courseId={courseId} setCourse={setCourse} />
    </>
  );
}
