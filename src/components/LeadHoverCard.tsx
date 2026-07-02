'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, MapPin, Building2, Sparkles } from 'lucide-react';
import type { JourneyLead } from '@/types/Journey';

interface LeadHoverCardProps {
  lead: JourneyLead | null | undefined;
  children: React.ReactNode;
  /** Hover-open delay in ms. Defaults to 250. */
  openDelay?: number;
  /** Hover-close delay in ms. Defaults to 120. */
  closeDelay?: number;
}

const CARD_WIDTH = 320;
const CARD_GAP = 8;
const CARD_MARGIN = 12;

/** SSR-safe useLayoutEffect — falls back to useEffect on the server. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface Position {
  top: number;
  left: number;
}

/**
 * Hover-triggered preview card. Renders via React portal to document.body so
 * it escapes parent overflow-hidden and stacking contexts (a problem we hit
 * when the card was being clipped by motion.li in the journey table).
 *
 * Positioning: anchored just below the trigger by default; flips above if
 * there isn't enough room below.
 */
export function LeadHoverCard({
  lead,
  children,
  openDelay = 250,
  closeDelay = 120,
}: LeadHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (openTimer.current != null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const computePosition = (): Position | null => {
    const el = triggerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Default: anchor below trigger, aligned to its left.
    let left = rect.left;
    let top = rect.bottom + CARD_GAP;

    // Clamp horizontally so the card stays inside the viewport.
    if (left + CARD_WIDTH + CARD_MARGIN > vw) {
      left = vw - CARD_WIDTH - CARD_MARGIN;
    }
    if (left < CARD_MARGIN) left = CARD_MARGIN;

    // If there isn't room below (e.g. trigger near bottom of viewport),
    // we can't measure card height yet, so use a safe ~280 estimate.
    const estimatedHeight = 280;
    if (top + estimatedHeight + CARD_MARGIN > vh && rect.top > estimatedHeight + CARD_MARGIN) {
      top = rect.top - estimatedHeight - CARD_GAP;
    }

    return { top, left };
  };

  const handleEnter = () => {
    clearTimers();
    openTimer.current = window.setTimeout(() => {
      setPos(computePosition());
      setOpen(true);
    }, openDelay);
  };

  const handleLeave = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDelay);
  };

  // Re-compute position on scroll / resize while open so the card tracks
  // the trigger if the user moves the page underneath it.
  useIsoLayoutEffect(() => {
    if (!open) return;
    const update = () => setPos(computePosition());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Cancel timers on unmount
  useEffect(() => clearTimers, []);

  if (!lead) return <>{children}</>;

  const name = lead['Parish Name'] || `Lead #${lead.id}`;
  const email = lead['Parish Contact Email'];
  const phone = lead['Parish Phone'];
  const diocese = lead['Diocese/Archdiocese Name'];
  const institutionType = lead['Institution Type'];
  const classification = lead.Classification;
  const techReadiness = lead['Technology Readiness'];

  const portalTarget = typeof window !== 'undefined' ? document.body : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex cursor-default"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {children}
      </span>

      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: pos.top,
                  left: pos.left,
                  width: CARD_WIDTH,
                  zIndex: 9999,
                }}
                className="rounded-lg border border-border bg-card shadow-xl overflow-hidden pointer-events-auto"
                role="tooltip"
                onMouseEnter={() => {
                  // Stay open while hovering the card itself
                  clearTimers();
                }}
                onMouseLeave={handleLeave}
              >
                {/* Header */}
                <div className="bg-linear-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/40 dark:to-blue-950/30 px-4 py-3 border-b border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lead Preview
                  </p>
                  <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {name}
                  </h4>
                  {diocese && (
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {diocese}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div className="px-4 py-3 space-y-2 text-[12px]">
                  {email && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {!email && !phone && (
                    <p className="text-[11px] italic text-slate-400 dark:text-slate-500">No contact info</p>
                  )}
                </div>

                {/* Attributes */}
                {(institutionType || classification || techReadiness) && (
                  <div className="border-t border-border px-4 py-2.5 space-y-1.5 bg-muted/40">
                    {institutionType && (
                      <AttrRow
                        icon={<Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
                        label="Institution"
                        value={institutionType}
                      />
                    )}
                    {classification && (
                      <AttrRow
                        icon={<Sparkles className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
                        label="Classification"
                        value={classification}
                      />
                    )}
                    {techReadiness && (
                      <AttrRow
                        icon={<Sparkles className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
                        label="Tech Readiness"
                        value={techReadiness}
                      />
                    )}
                  </div>
                )}

                <div className="px-4 py-2 bg-card border-t border-border text-[10px] text-slate-400 dark:text-slate-500">
                  Hover over the eye icon for full details
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </>
  );
}

function AttrRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <span className="text-slate-500 dark:text-slate-400">{label}: </span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{value}</span>
      </div>
    </div>
  );
}
