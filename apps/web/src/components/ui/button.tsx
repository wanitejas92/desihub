import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Two button styles, and only two: `primary` (solid accent) and `secondary`
 * (outline on surface). Plus `text`, which is an inline text link wearing a
 * button's tap target rather than a third style.
 *
 * There used to be five variants across three tones, which is eleven
 * combinations for a decision that only ever has one answer per context —
 * so the same action appeared as a gradient in one place and a tinted pill
 * in another, and nothing read as canonically "the button".
 *
 * The bigger fix is the primary itself. It was the orange→pink→purple brand
 * gradient with white text, and the middle of that gradient is light enough
 * that white on it measured around 2:1 — the "Select tickets" button on the
 * event page read as *disabled*, which is close to the worst thing a
 * checkout CTA can do. Solid saffron carries white text at 5.3:1.
 *
 * `outline` and `soft` are kept as aliases of `secondary` so existing call
 * sites keep compiling and, more usefully, all render the same thing.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'soft' | 'text';
export type ButtonSize = 'md' | 'sm';

const SIZE = {
  // 48/40px: both clear the 44px target once the tap area is counted, and a
  // taller default is most of what separates a premium form from a dense one.
  md: 'h-12 px-5 text-sm gap-2',
  sm: 'h-10 px-4 text-sm gap-1.5',
} satisfies Record<ButtonSize, string>;

/**
 * Disabled is a *neutral* state, not a faded accent.
 *
 * `opacity-50` on a solid saffron fill lands on a pale salmon, and on the
 * event page — where "Select tickets" is disabled until a quantity is
 * picked — that made the single largest control on the screen look like a
 * broken primary button rather than one politely waiting for input. A muted
 * surface reads as "not yet", which is what it means.
 */
const DISABLED =
  'disabled:cursor-not-allowed disabled:bg-bg-sunken disabled:text-fg-subtle ' +
  'disabled:border-border disabled:shadow-none disabled:active:scale-100';

function variantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-accent text-accent-fg hover:bg-accent-hover';
    case 'secondary':
    case 'outline':
    case 'soft':
      return 'bg-surface border border-border text-fg hover:bg-surface-hover hover:border-border-strong';
    case 'text':
      return 'bg-transparent text-fg hover:text-accent px-2';
  }
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pill instead of the standard radius — for filter chips and tags only. */
  pill?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = ButtonOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string;
    external?: boolean;
  };

type ButtonAsButton = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', pill, className, children } = props;
  const base = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold',
    'transition-[background-color,border-color,color,transform] duration-150 ease-out',
    pill ? 'rounded-pill' : 'rounded-md',
    'active:scale-[0.98]',
    DISABLED,
    SIZE[size],
    variantClasses(variant),
    className,
  );

  if ('href' in props && props.href) {
    const {
      href,
      external,
      variant: _v,
      size: _s,
      pill: _p,
      className: _c,
      children: _ch,
      ...rest
    } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        className={base}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    pill: _p,
    className: _c,
    children: _ch,
    ...rest
  } = props as ButtonAsButton;
  return (
    <button className={base} {...rest}>
      {children}
    </button>
  );
}
