import { usePageMeta } from '../lib/meta.js';
import { Button, Section, Statement } from '../ui/index.js';

export default function NotFound() {
  usePageMeta({
    title: 'Page not found',
    description: 'That page does not exist.',
  });

  return (
    <Section className="pt-40">
      <Statement
        eyebrow="404"
        title="Off target."
        actions={
          <>
            <Button to="/" arrow>
              Back to home
            </Button>
            <Button to="/contact" variant="secondary">
              Contact us
            </Button>
          </>
        }
      >
        <p>
          That page doesn't exist — the link may be out of date. The main sections are in the
          navigation above.
        </p>
      </Statement>
    </Section>
  );
}
