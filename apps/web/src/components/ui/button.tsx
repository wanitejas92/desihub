import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The button system, per brief: primary (brand gradient), secondary (white
 * + border), outline (transparent + orange), soft (tinted bg + matching
 * text, orange/pink/purple), text (no background). Renders a <Link> when
 * `href` is given, a native <button> otherwise — one component either way,
 * so every call site gets the same variant/size rules.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'soft' | 'text';
export type ButtonTone = 'orange' | 'pink' | 'purple';
export type ButtonSize = 'md' | 'sm';

const SIZE = {
  md: 'h-12 text-sm gap-2',
  sm: 'h-10 text-sm gap-1.5',
} satisfies Record<ButtonSize, string>;

const PADDING_X = {
  md: 'px-5',
  sm: 'px-4',
} satisfies Record<ButtonSize, string>;

const SOFT_TONE = {
  orange: 'bg-accent-subtle text-accent-hover',
  pink: 'bg-accent-pink-subtle text-accent-pink-hover',
  purple: 'bg-accent-purple-subtle text-accent-purple-hover',
} satisfies Record<ButtonTone, string>;

function variantClasses(variant: ButtonVariant, tone: ButtonTone, size: ButtonSize): string {
  switch (variant) {
    case 'primary':
      return cn(PADDING_X[size], 'text-white shadow-elevation hover:shadow-elevation-lg');
    case 'secondary':
      return cn(PADDING_X[size], 'bg-surface border border-border text-fg hover:bg-bg-subtle');
    case 'outline':
      return cn(
        PADDING_X[size],
        'bg-transparent border border-accent text-accent hover:bg-accent-subtle',
      );
    case 'soft':
      return cn(PADDING_X[size], SOFT_TONE[tone]);
    case 'text':
      return 'bg-transparent text-fg hover:text-accent px-2';
  }
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Pill (999px) instead of the default 12px radius — per brief, reserved for tags/filters/compact actions. */
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

const PRIMARY_GRADIENT = {
  backgroundImage: 'linear-gradient(90deg, #FF8A00, #F0446F, #7B35D6)',
};

export function Button(props: ButtonProps) {
  const { variant = 'primary', tone = 'orange', size = 'md', pill, className, children } = props;
  const base = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-150 ease-out',
    pill ? 'rounded-pill' : 'rounded-md',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
    SIZE[size],
    variantClasses(variant, tone, size),
    className,
  );
  const style = variant === 'primary' ? PRIMARY_GRADIENT : undefined;

  if ('href' in props && props.href) {
    const {
      href,
      external,
      variant: _v,
      tone: _t,
      size: _s,
      pill: _p,
      className: _c,
      children: _ch,
      ...rest
    } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        style={style}
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
    tone: _t,
    size: _s,
    pill: _p,
    className: _c,
    children: _ch,
    ...rest
  } = props as ButtonAsButton;
  return (
    <button style={style} className={base} {...rest}>
      {children}
    </button>
  );
}
