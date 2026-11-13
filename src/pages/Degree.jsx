import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Empty } from "../components/UI";
import { ResourceTable, ApiForm, statusColumn } from "../components/BackendUI";
export default function Degree() {
  const { db, student } = usePortal();
  return (
    <>
      <PageHeader
        title="See the bigger picture."
        description="Your degree requirements and academic planning workspace."
      />
      <div className="degree-summary">
        <div>
          <div className="eyebrow">YOUR DEGREE JOURNEY</div>
          <h2>{student?.majorName || "Your program will appear here."}</h2>
          <p>
            {db.summary?.degreeProgress == null
              ? "Degree progress is not available yet."
              : `${db.summary.degreeProgress}% complete`}
          </p>
        </div>
      </div>
      <div className="dashboard-grid">
        <ResourceTable
          title="Degree requirements"
          rows={db.degreeRequirements}
          columns={[
            "courseCode",
            "courseName",
            "credits",
            "prerequisites",
            statusColumn,
          ]}
          empty="No degree plan is available. Requirements will appear when your program is assigned."
        />
        <Card
          title="AI academic advisor"
          subtitle="Plan your next steps with academic guidance."
        >
          <Empty text="The advisor service is not connected. No recommendations have been generated." />
          <ApiForm
            endpoint="/advisor"
            disabled
            submitLabel="Ask advisor"
            fields={[
              {
                name: "question",
                label: "Your question",
                type: "textarea",
                placeholder: "What would you like help planning?",
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
