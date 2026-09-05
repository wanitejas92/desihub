import { Button } from './ui/button';
import { CtaBannerIllustration } from './cta-banner-illustration';
import { IconCalendar, IconCheckCircle } from './ui/icons';

const BULLETS = ['Easy Listing', 'Great Reach', 'Secure Payouts', 'Dedicated Support'];

/** Mid-page CTA — the brand gradient at full strength, but as one deliberate banner, not a page-wide habit. */
export function OrganiserCtaBanner() {
  return (
    <section className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <div className="shadow-elevation-lg relative overflow-hidden rounded-2xl">
        <CtaBannerIllustration className="absolute inset-0" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white"
            >
              <IconCalendar width={26} height={26} />
            </span>
            <div>
              <h2 className="font-display max-w-md text-xl leading-snug font-bold text-white sm:text-[1.6rem]">
                Are you organizing an event in the Netherlands?
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/85">
                Reach thousands of Desi audience and grow your event with DesiHub.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Button
              href="/submit"
              variant="secondary"
              className="w-full justify-center rounded-xl lg:w-auto"
            >
              List Your Event
            </Button>
            <ul role="list" className="grid grid-cols-2 gap-x-6 gap-y-2">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <IconCheckCircle width={15} height={15} className="shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
