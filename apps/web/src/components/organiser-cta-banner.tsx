import { Button } from './ui/button';
import { IconMegaphone, IconCheckCircle } from './ui/icons';

const BULLETS = ['Free to list', 'Reach the whole community', 'Verified organiser badge'];

/** Mid-page CTA — the brand gradient at full strength, but as one deliberate banner, not a page-wide habit. */
export function OrganiserCtaBanner() {
  return (
    <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <div
        className="shadow-elevation-lg flex flex-col items-start gap-5 rounded-lg p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{ backgroundImage: 'linear-gradient(120deg, #FF8A00, #F0446F, #7B35D6)' }}
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <IconMegaphone width={24} height={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Organising an event in the Netherlands?
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/85">
              Reach the whole Desi community and grow your audience with DesiHub.
            </p>
            <ul role="list" className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <IconCheckCircle width={15} height={15} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button
          href="/submit"
          variant="secondary"
          className="w-full shrink-0 justify-center sm:w-auto"
        >
          List your event
        </Button>
      </div>
    </section>
  );
}
