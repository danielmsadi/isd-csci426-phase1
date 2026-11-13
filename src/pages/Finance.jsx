import AdminFinance from "./AdminFinance";
import { financialAccess } from "../data/finance";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Stat, Empty, Badge } from "../components/UI";
import {
  ResourceTable,
  ServerAction,
  currency,
  statusColumn,
} from "../components/BackendUI";
export default function Finance({ admin = false }) {
  return admin ? <AdminFinance /> : <StudentFinance />;
}
function StudentFinance() {
  const { db } = usePortal();
  const installments = db.installments;
  const payments = db.payments;
  const finance = db.finance;
  return (
    <>
      <PageHeader
        eyebrow="STUDENT FINANCE"
        title="Your education. Your investment."
        description="Review tuition, installment schedules and payment records."
      />
      <div className="stats-grid">
        <Stat
          label="Semester tuition"
          value={currency(finance?.tuition)}
          detail="Not available until billed"
        />
        <Stat
          label="Financial aid"
          value={currency(finance?.aidAmount)}
          detail="Approved university assistance"
        />
        <Stat
          label="Payments received"
          value={currency(finance?.paid)}
          detail="Confirmed payment records"
        />
        <Stat
          label="Balance remaining"
          value={currency(finance?.balance)}
          detail={
            financialAccess(finance, installments).restricted
              ? "Financial hold active"
              : "Account status not available"
          }
        />
      </div>
      {financialAccess(finance, installments).restricted && (
        <div className="alert warning">
          Overdue installments restrict grades, GPA, transcripts and
          next-semester registration.
        </div>
      )}
      <Card
        title="Installment plan"
        subtitle="Four equal tuition installments. Each late installment incurs a $20 penalty once."
      >
        {installments.length ? (
          <div className="installment-grid">
            {installments.map((i) => (
              <div className="installment" key={i.id}>
                <div>
                  <span className="installment-number">{i.number}</span>
                  <Badge>{i.status}</Badge>
                </div>
                <p>Due {i.dueDate}</p>
                <h2>{currency(i.amount)}</h2>
                <dl>
                  <div>
                    <dt>Late penalty</dt>
                    <dd>{currency(i.penalty)}</dd>
                  </div>
                  <div>
                    <dt>Balance</dt>
                    <dd>{currency(i.balance)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No installment plan is available. Amounts and due dates will appear after university billing is connected." />
        )}
      </Card>
      <ResourceTable
        title="Payment history"
        rows={payments}
        columns={[
          "receiptNumber",
          "studentName",
          "date",
          "installmentNumber",
          {
            key: "amount",
            label: "Amount",
            render: (row) => currency(row.amount),
          },
          "method",
          statusColumn,
        ]}
        empty="No payments or receipts are available."
        actions={(row) => (
          <ServerAction
            label="Download receipt"
            endpoint={`/payments/${encodeURIComponent(row.id)}/receipt`}
            method="GET"
            filename="tuition-receipt.pdf"
          />
        )}
      />
      <Card title="Payment services">
        <div className="padded">
          <p>
            Payment options will be available after the university payment
            service is connected. No payment details are collected here.
          </p>
          <button className="button secondary" disabled>
            Payment service unavailable
          </button>
        </div>
      </Card>
    </>
  );
}
