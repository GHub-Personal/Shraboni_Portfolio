'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Feedback } from '../../src/types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Eye, ArrowLeft, MessageSquareQuote, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TestimonialsPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setFeedbacks(data);
    } catch (err) {
      console.error('Error loading testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-accent selection:text-zinc-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-zinc-300 hover:text-white transition-all hover:border-accent/40 group cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-accent" />
            Back to Portfolio
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{feedbacks.length} Verified Reviews</span>
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(196,251,109,0.15)]">
            // Client Testimonials & Social Proof
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight uppercase leading-none">
            What <span className="text-transparent stroke-text" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)' }}>Creators & Brands</span> Say.
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-light max-w-xl mx-auto">
            Explore authentic feedback and screenshot reviews from clients around the world. Click any card to view the original screenshot in full resolution.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-accent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && feedbacks.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 max-w-md mx-auto">
            <MessageSquareQuote className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No testimonials available yet.</p>
          </div>
        )}

        {/* Testimonials Responsive Grid */}
        {!loading && feedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {feedbacks.map((feedback, idx) => {
              const colors = [
                { border: 'hover:border-cyan-400/60', glow: 'rgba(34,211,238,0.2)', badge: 'text-cyan-400' },
                { border: 'hover:border-purple-400/60', glow: 'rgba(192,132,252,0.2)', badge: 'text-purple-400' },
                { border: 'hover:border-amber-400/60', glow: 'rgba(245,158,11,0.2)', badge: 'text-amber-400' },
                { border: 'hover:border-pink-400/60', glow: 'rgba(236,72,153,0.2)', badge: 'text-pink-400' },
                { border: 'hover:border-accent/60', glow: 'rgba(196,251,109,0.2)', badge: 'text-accent' },
              ];
              const theme = colors[idx % colors.length];

              return (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedFeedback(feedback)}
                  className={`group bg-zinc-900/70 backdrop-blur-xl border border-white/10 ${theme.border} rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-2xl relative overflow-hidden`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-sm">
                          {feedback.provider_name ? feedback.provider_name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-snug group-hover:text-accent transition-colors truncate max-w-[160px]">
                            {feedback.provider_name}
                          </h3>
                          <span className="text-[11px] text-zinc-500 font-medium">Verified Client</span>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        <span className="text-xs font-bold text-zinc-200">{feedback.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Screenshot Container */}
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl bg-zinc-950/80 border border-white/5 overflow-hidden flex items-center justify-center mb-4">
                      <img
                        src={feedback.screenshot_url}
                        alt={`Testimonial by ${feedback.provider_name}`}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2 text-xs font-bold text-white backdrop-blur-[2px]">
                        <Eye className="w-4 h-4 text-accent" />
                        Inspect Full Screenshot
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-accent" /> Authentic Review
                    </span>
                    <span className="font-semibold text-accent group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Screenshot &rarr;
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeedback(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
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
              className="relative w-full max-w-4xl max-h-[88vh] bg-zinc-950 border border-white/15 rounded-[2rem] overflow-hidden flex flex-col p-4 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    Feedback from {selectedFeedback.provider_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span>Rating:</span>
                    <div className="flex items-center gap-1 font-bold text-accent">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      {selectedFeedback.rating} / 5.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Image Container */}
              <div className="flex-1 overflow-auto bg-black/60 rounded-2xl p-2 flex items-center justify-center min-h-[40vh]">
                <img
                  src={selectedFeedback.screenshot_url}
                  alt={`Feedback screenshot from ${selectedFeedback.provider_name}`}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
