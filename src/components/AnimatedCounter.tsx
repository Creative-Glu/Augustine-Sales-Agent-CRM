'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** The final numeric value to count up (or down) to. */
  value: number;
  /** Duration of the animation in ms. */
  duration?: number;
  /** Decimal places to preserve. Defaults to 0 for integers. */
  decimals?: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "%", "K"). */
  suffix?: string;
  /** className for the wrapping span. */
  className?: string;
  /** Locale used for thousand-separator formatting. */
  locale?: string;
}

/**
 * Counts smoothly from the previous value to the new value using
 * easeOutCubic on every change. First mount counts from 0.
 *
 * Respects `prefers-reduced-motion` — if the user has reduced motion
 * enabled, the final value is shown immediately.
 */
export function AnimatedCounter({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  locale,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const previousRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion — jump straight to the value.
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) {
      previousRef.current = value;
      setDisplay(value);
      return;
    }

    const start = previousRef.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }

    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        previousRef.current = end;
        setDisplay(end);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
