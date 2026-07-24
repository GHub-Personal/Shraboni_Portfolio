'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Eye } from 'lucide-react';
import { Feedback } from '../../types';

interface CloudOfTrustProps {
  feedbacks: Feedback[];
}

interface BubbleLayout {
  left: number; // percentage
  top: number;  // percentage
  depth: number; // 0, 1, 2 (back, mid, front)
  color: string; // neon glow class
  glowColor: string; // tailwind glow color
}

// Staggered layout coordinates positioned around a centered heading (approx. 40% - 60% top/left)
const DESKTOP_COORDINATES = [
  { left: 10, top: 15, depth: 2, color: 'border-cyan-400 text-cyan-400', glowColor: 'rgba(34,211,238,0.2)' },
  { left: 22, top: 40, depth: 0, color: 'border-purple-400 text-purple-400', glowColor: 'rgba(192,132,252,0.1)' },
  { left: 12, top: 68, depth: 1, color: 'border-amber-500 text-amber-500', glowColor: 'rgba(245,158,11,0.15)' },
  { left: 32, top: 12, depth: 1, color: 'border-pink-500 text-pink-500', glowColor: 'rgba(236,72,153,0.15)' },
  { left: 30, top: 76, depth: 2, color: 'border-emerald-400 text-emerald-400', glowColor: 'rgba(52,211,153,0.2)' },
  { left: 74, top: 10, depth: 2, color: 'border-accent text-accent', glowColor: 'rgba(196,251,109,0.2)' },
  { left: 82, top: 38, depth: 0, color: 'border-blue-400 text-blue-400', glowColor: 'rgba(96,165,250,0.1)' },
  { left: 78, top: 66, depth: 1, color: 'border-purple-400 text-purple-400', glowColor: 'rgba(192,132,252,0.15)' },
  { left: 52, top: 10, depth: 0, color: 'border-amber-500 text-amber-500', glowColor: 'rgba(245,158,11,0.1)' },
  { left: 55, top: 78, depth: 1, color: 'border-cyan-400 text-cyan-400', glowColor: 'rgba(34,211,238,0.15)' },
];

export function CloudOfTrust({ feedbacks }: CloudOfTrustProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Track mouse coordinates for desktop parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / (width / 2); // normalize between -1 and 1
      const y = (e.clientY - top - height / 2) / (height / 2); // normalize between -1 and 1
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Track scroll position for mobile parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!feedbacks || feedbacks.length === 0) return null;

  // Generate dynamic parameters for each feedback bubble
  const desktopBubbles = feedbacks.map((feedback, index) => {
    const layout = DESKTOP_COORDINATES[index % DESKTOP_COORDINATES.length];
    return {
      feedback,
      ...layout,
    };
  });

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950/20 py-20 border-y border-white/5">
      {/* 1. DESKTOP EXPERIENCE */}
      <div 
        ref={containerRef}
        className="hidden lg:block relative w-full h-[95vh] min-h-[750px] max-w-7xl mx-auto"
      >
        {/* Central typography heading */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
          <h2 className="text-5xl xl:text-6xl font-display font-extrabold text-center uppercase tracking-tighter leading-none max-w-2xl text-white">
            Trusted by <span className="block text-transparent stroke-text" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>Creator Brands</span> & Visionaries Worldwide.
          </h2>
        </div>

        {/* Ambient floating design bubbles */}
        {desktopBubbles.map((bubble, i) => {
          const { feedback, left, top, depth, color, glowColor } = bubble;
          
          // Speed scale based on depth (Foreground moves faster)
          const parallaxSpeed = depth === 2 ? 35 : depth === 1 ? 20 : 8;
          const offsetX = mousePosition.x * parallaxSpeed;
          const offsetY = mousePosition.y * parallaxSpeed;

          // CSS attributes matching depth level
          const scale = depth === 2 ? 1.05 : depth === 1 ? 0.9 : 0.7;
          const opacity = depth === 2 ? 0.95 : depth === 1 ? 0.75 : 0.45;
          const blurValue = depth === 0 ? 'blur(1.5px)' : 'blur(0px)';
          const zIndex = depth === 2 ? 30 : depth === 1 ? 20 : 10;

          return (
            <motion.div
              key={feedback.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                zIndex,
              }}
              animate={{
                x: offsetX,
                y: offsetY,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            >
              {/* Infinite gentle float animation */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 6 + (i % 3) * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Speech Bubble Container */}
                <motion.div
                  style={{
                    scale,
                    opacity,
                    filter: blurValue,
                    boxShadow: `0 0 25px ${glowColor}`,
                  }}
                  whileHover={{
                    scale: 1.15,
                    opacity: 1.0,
                    filter: 'blur(0px)',
                    zIndex: 50,
                    boxShadow: `0 0 45px ${glowColor.replace('0.15', '0.4').replace('0.2', '0.5').replace('0.1', '0.3')}`,
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedFeedback(feedback)}
                  className={`group w-64 p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/10 ${color.split(' ')[0]} transition-colors hover:border-white/30 cursor-pointer relative flex flex-col gap-3 select-none`}
                >
                  {/* Bubble Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-wide truncate max-w-[130px]">
                      {feedback.provider_name}
                    </span>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-[10px] font-bold text-zinc-300">{feedback.rating}</span>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail Frame */}
                  <div className="relative w-full h-32 rounded-lg bg-zinc-950/40 border border-white/5 overflow-hidden flex items-center justify-center">
                    <img 
                      src={feedback.screenshot_url} 
                      alt="Feedback Screenshot" 
                      className="w-full h-full object-contain pointer-events-none filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                    />
                    {/* Expand indicator overlay */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5 text-xs text-white font-semibold">
                      <Eye className="w-4 h-4 text-accent" />
                      View Screen
                    </div>
                  </div>

                  {/* Speech Bubble Arrow Tail */}
                  <div className="absolute -bottom-2.5 left-8 w-5 h-5 bg-zinc-900/60 border-r border-b border-white/10 group-hover:border-white/30 rotate-45 z-[-1]" />
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. MOBILE EXPERIENCE (Immersive Vertical Stream) */}
      <div className="block lg:hidden px-4 max-w-xl mx-auto space-y-10">
        <div>
          <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest rounded-full mb-3">
            // Client Testimonials
          </span>
          <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight text-white leading-tight">
            Trusted by Creator Brands & Visionaries Worldwide.
          </h2>
          <p className="text-zinc-400 text-sm font-light mt-2">
            Tap on any feedback screenshot below to inspect the authentic review.
          </p>
        </div>

        {/* High-density staggered vertical list */}
        <div className="relative space-y-6 pt-4">
          {feedbacks.map((feedback, idx) => {
            const isLeft = idx % 2 === 0;
            const colors = [
              { border: 'border-cyan-400/50', glow: 'rgba(34,211,238,0.1)' },
              { border: 'border-purple-400/50', glow: 'rgba(192,132,252,0.1)' },
              { border: 'border-amber-500/50', glow: 'rgba(245,158,11,0.1)' },
              { border: 'border-pink-500/50', glow: 'rgba(236,72,153,0.1)' },
            ];
            const activeColor = colors[idx % colors.length];

            // Simple parallax offset on scroll. Background/even items move slightly slower
            const slowOffset = (scrollY * 0.05) % 25;
            const translateOffset = idx % 3 === 0 ? slowOffset : 0;

            return (
              <motion.div
                key={feedback.id}
                style={{ y: translateOffset }}
                onClick={() => setSelectedFeedback(feedback)}
                className={`w-[90%] ${isLeft ? 'mr-auto' : 'ml-auto'} p-3.5 rounded-2xl bg-zinc-900/60 backdrop-blur-md border ${activeColor.border} shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide truncate max-w-[150px]">
                    {feedback.provider_name}
                  </span>
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span className="text-[10px] font-bold text-zinc-300">{feedback.rating}</span>
                  </div>
                </div>

                {/* Screenshot view */}
                <div className="relative w-full h-44 rounded-lg bg-zinc-950/40 border border-white/5 overflow-hidden flex items-center justify-center">
                  <img 
                    src={feedback.screenshot_url} 
                    alt="Feedback Screenshot" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                    <Eye className="w-3.5 h-3.5 text-accent" />
                  </div>
                </div>

                {/* Tail pointer */}
                <div className={`absolute -bottom-2 ${isLeft ? 'left-6' : 'right-6'} w-4 h-4 bg-zinc-900/60 border-r border-b ${activeColor.border.split('/')[0]} border-white/10 rotate-45 z-[-1]`} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. LIGHTBOX PREVIEW MODAL */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeedback(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-2xl"
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-zinc-900/90 hover:bg-accent hover:text-zinc-950 text-white rounded-full transition-colors z-50 shadow-lg cursor-pointer"
              onClick={() => setSelectedFeedback(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[85vh] bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col p-4 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Feedback from {selectedFeedback.provider_name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                    Rating: 
                    <div className="flex items-center gap-1 font-semibold text-white ml-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      {selectedFeedback.rating} / 5.0
                    </div>
                  </div>
                </div>
              </div>

              {/* High-res screenshot container */}
              <div className="flex-1 overflow-auto bg-zinc-950/50 rounded-xl p-2 flex items-center justify-center min-h-[30vh]">
                <img 
                  src={selectedFeedback.screenshot_url} 
                  alt={`Screenshot by ${selectedFeedback.provider_name}`} 
                  className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
