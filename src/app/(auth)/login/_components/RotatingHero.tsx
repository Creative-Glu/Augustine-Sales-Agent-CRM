'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_SLIDES, SLIDE_INTERVAL_MS } from '@/constants/login';

export function RotatingHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
      style={{ minHeight: '11rem' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-3"
        >
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            {slide.headline}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #93c5fd 0%, #67e8f9 100%)',
              }}
            >
              {slide.accent}
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            {slide.subline}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute -bottom-6 left-0 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? '1.25rem' : '0.375rem',
              height: '0.375rem',
              background: i === index ? 'rgba(147,197,253,0.9)' : 'rgba(148,163,184,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
