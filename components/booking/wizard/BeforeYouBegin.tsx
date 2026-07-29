import { Lock } from "lucide-react";

const steps = [
  "Choose an Experience",
  "Tell Us Your Details",
  "Select Your Date",
  "Review Packages",
  "Pay Deposit or in Full"
];

export function BeforeYouBegin() {
  return (
    <aside className="bw-before" aria-label="Before you begin">
      <h2>Before You Begin</h2>
      <ol>
        {steps.map((step, index) => (
          <li key={step}>
            <span aria-hidden="true">{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <p className="bw-secure-note">
        <Lock size={15} aria-hidden="true" /> Your booking is secure and encrypted.
      </p>
    </aside>
  );
}
