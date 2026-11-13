import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Empty } from "../components/UI";
import {
  studentFields,
  studentGroups,
  studentFieldValue,
} from "../data/studentFields";
export default function Profile() {
  const { student, db } = usePortal();
  const fields = studentFields(db);
  return (
    <>
      <PageHeader
        title="Your student profile"
        description="Your official information is maintained by the registrar. Contact the university to request a correction."
      />
      {!student ? (
        <Card>
          <Empty text="No student profile is connected. Your details will appear when your account is available." />
        </Card>
      ) : (
        <>
          {student.pendingMajorName && (
            <div className="alert info">
              Approved major: {student.pendingMajorName} · Effective{" "}
              {student.majorEffective || "next semester"}
            </div>
          )}
          {studentGroups.map((group) => (
            <Card key={group} title={group}>
              <dl className="profile-details padded">
                {fields
                  .filter((f) => f.group === group)
                  .map((field) => (
                    <div key={field.name}>
                      <dt>{field.label}</dt>
                      <dd>
                        {studentFieldValue(field, student, db) ||
                          "Information unavailable"}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Card>
          ))}
        </>
      )}
    </>
  );
}
