import { Button } from './ui/button';
import { IconCheckCircle } from './ui/icons';

const BULLETS = ['Free to list', 'Reviewed within a day', 'Reach every Desi city in NL'];

/**
 * The mid-page organiser CTA.
 *
 * It used to be the brand gradient at full strength across a rounded card,
 * with a spiked bunting illustration along the bottom edge — and once the
 * rest of the page was calmed down, it became by a wide margin the loudest
 * object on the homepage: a secondary conversion prompt outranking the
 * events the page exists to show, in three hues the design system no longer
 * uses anywhere else.
 *
 * Now it is an ink-dark band. It still stops the scroll — it is the only
 * dark surface in the light theme, which is a stronger and cheaper signal
 * than colour — but it does it with value contrast rather than saturation,
 * and the one saffron object inside it is the button.
 */
export function OrganiserCtaBanner() {
  return (
    <section className="max-w-content mx-auto px-4 py-12 sm:px-6 lg:py-16">
      <div className="bg-fg relative overflow-hidden rounded-md px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        {/* The same faint grain as the rest of the paper, inverted — texture
            rather than a picture, so nothing has to be art-directed. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-bg/60">For organisers</p>
            <h2 className="font-display text-bg mt-3 text-2xl font-bold text-balance sm:text-3xl">
              Put your event in front of the whole Desi Netherlands.
            </h2>
            <ul role="list" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {BULLETS.map((b) => (
                <li key={b} className="text-bg/70 flex items-center gap-2 text-sm">
                  <IconCheckCircle width={15} height={15} className="shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <Button href="/submit" className="w-full justify-center lg:w-auto">
            List your event
          </Button>
        </div>
      </div>
    </section>
  );
}
