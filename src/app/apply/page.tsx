import type { Metadata } from "next";
import { ApplyWizard } from "@/components/ApplyWizard";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Three short steps. Checking your eligibility will not affect your credit score.",
  // An application page should never be indexed or archived.
  robots: { index: false, follow: false },
};

export default function ApplyPage() {
  return (
    <Container className="py-10 sm:py-14">
      <ApplyWizard />
    </Container>
  );
}
