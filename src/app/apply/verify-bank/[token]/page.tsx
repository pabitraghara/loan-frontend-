import type { Metadata } from 'next';
import { BankVerification } from '@/components/BankVerification';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Verify your bank account',
  robots: { index: false, follow: false },
};

/** Target of the day-0 email and each of the three drip reminders. */
export default function VerifyBankPage({ params }: { params: { token: string } }) {
  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <BankVerification token={params.token} />
    </Container>
  );
}
