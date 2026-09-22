import type { Metadata } from 'next';
import { ResumeLoader } from '@/components/ResumeLoader';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Continue your application',
  robots: { index: false, follow: false },
};

/**
 * Resume link target. The token carries no applicant data - the saved state
 * is fetched from the API, and Steps 2 and 3 come back masked only.
 */
export default function ResumePage({ params }: { params: { token: string } }) {
  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <ResumeLoader token={params.token} />
    </Container>
  );
}
