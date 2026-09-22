import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/Container';
import { LoanStatusLookup } from '@/components/LoanStatusLookup';

export const metadata: Metadata = {
  title: 'Loan Status',
  description: 'Check the status of an application you have already submitted.',
  robots: { index: false, follow: true },
};

export default function LoanStatusPage() {
  return (
    <>
      <PageHeader
        title="Check your loan status"
        lead="See where your application stands and what, if anything, we need from you next."
      />
      <Container className="py-16 sm:py-20">
        <LoanStatusLookup />
      </Container>
    </>
  );
}
