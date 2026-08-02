"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Design, ProfileSettings, Feedback } from '../src/types';
import { ExternalLink, Instagram, Linkedin, Youtube, X, Mail, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfCarousel } from '../src/components/ui/PdfCarousel';
import { parseAspectRatio } from '../src/lib/utils';
import { CloudOfTrust } from '../src/components/ui/CloudOfTrust';

const CATEGORIES = ['All', 'Posters', 'Carousels', 'Thumbnails', 'Banners', 'Brand Collaborations', 'Content Writing'];

export default function Portfolio() {
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const featuredRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(4);
  }, [activeCategory]);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDesign) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedDesign]);

  const fetchData = async () => {
    try {
      const [profileRes, designsRes, feedbacksRes] = await Promise.all([
        supabase.from('profile_settings').select('*').limit(1).single(),
        supabase.from('designs').select('*').order('created_at', { ascending: false }),
        supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (designsRes.data) setDesigns(designsRes.data);
      if (feedbacksRes.data) setFeedbacks(feedbacksRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = activeCategory === 'All' 
    ? designs 
    : designs.filter(d => d.category === activeCategory);

  const featuredDesigns = designs.filter(d => d.is_featured);

  const getAspectStyle = (ratio: string | undefined) => {
    if (!ratio) return undefined;
    return parseAspectRatio(ratio);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({
          success: true,
          message: 'Thank you! Your message has been sent successfully.',
        });
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || 'Something went wrong. Please try again.',
        });
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        success: false,
        message: 'Failed to send request. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-zinc-100 selection:bg-accent selection:text-zinc-950 overflow-x-hidden relative">
      
      {/* Background Ambient Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none"
      ></motion.div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-black/20 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-display font-bold text-xl tracking-tighter">
            {profile?.name?.toUpperCase() || 'DESIGNER'}
          </div>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-semibold uppercase tracking-wider hover:text-accent transition-colors"
          >
            Let's Talk
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-36 pb-24 md:pt-48 md:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        <div className="flex-1 space-y-8 z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-extrabold tracking-tighter leading-[0.85] uppercase">
              <span className="block text-transparent stroke-text" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>Visual</span>
              <span className="block text-white">Impact.</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-3xl text-zinc-200 font-light max-w-xl leading-relaxed">
              {profile?.tagline || 'Designing high-converting thumbnails, banners, and digital assets.'}
            </p>
            <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
              {profile?.bio || 'Elevating brands through striking visual identity.'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <button 
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-8 py-4 bg-accent text-zinc-950 font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 flex items-center gap-2 shadow-[0_0_30px_rgba(196,251,109,0.3)] cursor-pointer"
            >
              Explore Work
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent transition-colors p-3.5 border border-white/10 hover:border-accent/50 rounded-full bg-white/5 backdrop-blur-md">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile?.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent transition-colors p-3.5 border border-white/10 hover:border-accent/50 rounded-full bg-white/5 backdrop-blur-md" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile?.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent transition-colors p-3.5 border border-white/10 hover:border-accent/50 rounded-full bg-white/5 backdrop-blur-md" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {profile?.avatar_url && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center shrink-0 mt-8 lg:mt-0"
          >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-accent via-purple-500 to-accent rounded-full opacity-30 blur-xl -z-10"></div>

            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white/20 p-2 bg-white/5 backdrop-blur-2xl shadow-[0_0_60px_rgba(196,251,109,0.25)] relative"
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Scrolling Text Divider */}
      <div className="w-full overflow-hidden py-10 bg-zinc-900 border-y border-white/5 flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1035] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="flex items-center space-x-12 font-display font-bold text-3xl md:text-5xl uppercase tracking-wider text-white/20"
        >
          <span>Thumbnails</span> <span className="text-accent">•</span>
          <span>Carousels</span> <span className="text-accent">•</span>
          <span>Banners</span> <span className="text-accent">•</span>
          <span>Posters</span> <span className="text-accent">•</span>
          <span>Thumbnails</span> <span className="text-accent">•</span>
          <span>Carousels</span> <span className="text-accent">•</span>
          <span>Banners</span> <span className="text-accent">•</span>
          <span>Posters</span> <span className="text-accent">•</span>
        </motion.div>
      </div>

      {/* Dynamic Featured Section */}
      {featuredDesigns.length > 0 && (
        <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest rounded-full mb-3 shadow-[0_0_15px_rgba(196,251,109,0.2)]">
                  // Curated Highlights
                </span>
                <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter">
                  Featured <span className="text-zinc-500">Designs</span>
                </h2>
              </div>
              <p className="text-zinc-400 max-w-sm text-sm font-light">
                Handpicked showcase of our most compelling visual assets, displayed in their natural dimensions.
              </p>
            </div>
            
            <div className="relative group">
              {/* Glassmorphic Navigation Buttons for Laptop & Tablet */}
              <button
                onClick={() => {
                  if (featuredRef.current) {
                    featuredRef.current.scrollBy({ left: -450, behavior: 'smooth' });
                  }
                }}
                className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-accent text-white hover:text-zinc-950 border border-white/20 hover:border-accent backdrop-blur-2xl items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-30 transition-all cursor-pointer opacity-90 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  if (featuredRef.current) {
                    featuredRef.current.scrollBy({ left: 450, behavior: 'smooth' });
                  }
                }}
                className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-accent text-white hover:text-zinc-950 border border-white/20 hover:border-accent backdrop-blur-2xl items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-30 transition-all cursor-pointer opacity-90 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div ref={featuredRef} className="flex gap-6 overflow-x-auto pb-8 pt-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
                {featuredDesigns.map((design) => {
                  const aspect = getAspectStyle(design.aspect_ratio);
                  return (
                    <motion.div
                      key={design.id}
                      whileHover={{ y: -10, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="shrink-0 snap-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-accent/60 transition-all duration-300 cursor-pointer group/card h-[320px] md:h-[480px] shadow-2xl hover:shadow-[0_20px_50px_rgba(196,251,109,0.15)]"
                      style={{ aspectRatio: aspect }}
                      onClick={() => setSelectedDesign(design)}
                    >
                      <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-8 z-10 backdrop-blur-[2px]">
                          <span className="text-accent text-xs font-bold uppercase tracking-widest mb-1">{design.category}</span>
                          <h4 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">{design.title}</h4>
                        </div>
                        <img
                          src={design.image_url.split(',')[0]}
                          alt={design.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase">Selected<br/><span className="text-zinc-500">Works</span></h2>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                    activeCategory === cat 
                      ? 'bg-accent text-zinc-950 shadow-[0_0_20px_rgba(196,251,109,0.3)]' 
                      : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pinterest-style Masonry Columns */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 lg:gap-8 space-y-6 lg:space-y-8">
            <AnimatePresence>
              {filteredDesigns.slice(0, visibleCount).map((design) => {
                const aspect = getAspectStyle(design.aspect_ratio);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(196,251,109,0.1)"
                    }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 22 }}
                    key={design.id} 
                    className="break-inside-avoid group relative bg-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10 hover:border-accent/40 transition-colors cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform-gpu w-full inline-block"
                    style={{ aspectRatio: aspect }}
                    onClick={() => setSelectedDesign(design)}
                  >
                    <div className="w-full h-full overflow-hidden bg-transparent relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-[2px]"></div>
                      <img 
                        src={design.image_url.split(',')[0]} 
                        alt={design.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Hover Info */}
                      <div className="absolute bottom-0 left-0 w-full p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 flex flex-col justify-end h-full">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest mb-2">{design.category}</span>
                        <h3 className="text-2xl font-display font-bold text-white leading-tight mb-2">{design.title}</h3>
                        <div className="w-10 h-10 rounded-full bg-accent/90 backdrop-blur-md text-zinc-950 flex items-center justify-center self-end mt-4 shadow-lg shadow-accent/20">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Glassmorphic View More Button */}
          {filteredDesigns.length > visibleCount && (
            <div className="mt-14 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 4)}
                className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-white/5 hover:bg-accent text-white hover:text-zinc-950 border border-white/15 hover:border-accent/60 backdrop-blur-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(196,251,109,0.35)] cursor-pointer transform hover:scale-105"
              >
                View More ({filteredDesigns.length - visibleCount} remaining)
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  +
                </span>
              </button>
            </div>
          )}
          {filteredDesigns.length === 0 && (
            <div className="py-32 text-center text-zinc-500 font-display text-2xl uppercase">
              No work found in this category.
            </div>
          )}
        </div>
      </section>

      {/* Cloud of Trust Testimonial Section */}
      <CloudOfTrust feedbacks={feedbacks} />

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 max-w-7xl mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="absolute inset-0 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] -z-10 shadow-2xl"
        ></motion.div>
        <div className="flex flex-col lg:flex-row gap-16 p-8 md:p-16 lg:p-24 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase leading-[0.9]">
              Let's create<br/>something<br/><span className="text-accent">bold.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-md">
              Ready to elevate your digital presence? Send a message and let's discuss your next project.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-md bg-zinc-950 p-8 rounded-3xl border border-white/5">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <input type="text" placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required disabled={submitting} className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 uppercase text-sm tracking-wider font-semibold disabled:opacity-50" />
              </div>
              <div>
                <input type="email" placeholder="Your Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required disabled={submitting} className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 uppercase text-sm tracking-wider font-semibold disabled:opacity-50" />
              </div>
              <div>
                <textarea placeholder="Tell me about your project" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={3} disabled={submitting} className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 resize-none uppercase text-sm tracking-wider font-semibold disabled:opacity-50"></textarea>
              </div>
              
              {submitStatus && (
                <div className={`p-4 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
                  submitStatus.success 
                    ? 'bg-accent/10 border border-accent/30 text-accent' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full bg-accent text-zinc-950 font-bold uppercase tracking-widest rounded-xl px-5 py-5 hover:bg-white transition-colors mt-8 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-600 font-semibold uppercase tracking-wider text-xs border-t border-white/5 mt-24">
        &copy; {new Date().getFullYear()} {profile?.name || 'DESIGNER'}. All rights reserved.
      </footer>

      {/* Lightbox Modal matching exact user reference diagram layout */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/95 backdrop-blur-2xl" 
            onClick={() => setSelectedDesign(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-6xl h-[88vh] max-h-[820px] flex flex-col md:flex-row bg-zinc-950/95 backdrop-blur-3xl rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.9)]" 
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button cleanly placed top-right */}
              <button 
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 sm:p-3 bg-zinc-900/90 hover:bg-accent hover:text-zinc-950 text-white rounded-full transition-colors z-50 shadow-xl cursor-pointer border border-white/10"
                onClick={(e) => { e.stopPropagation(); setSelectedDesign(null); }}
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* 1. TOP FIXED IMAGE / CAROUSEL CONTAINER (on Mobile/Tablet) & LEFT CONTAINER (on Desktop) */}
              <div className="w-full md:flex-1 h-[42vh] sm:h-[48vh] md:h-full bg-transparent flex items-center justify-center pt-14 pb-4 px-4 sm:p-8 lg:p-12 shrink-0 overflow-hidden relative">
                {selectedDesign.category === 'Carousels' ? (
                  <PdfCarousel images={selectedDesign.image_url.split(',')} aspectRatio={selectedDesign.aspect_ratio} />
                ) : (
                  <img 
                    src={selectedDesign.image_url.split(',')[0]} 
                    alt={selectedDesign.title} 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                  />
                )}
              </div>
              
              {/* 2. RIGHT CONTAINER (Mobile: Middle Scrollable Text + Pinned Bottom Live Button | Desktop: Side Panel) */}
              <div className="w-full md:w-[360px] lg:w-[440px] bg-black/60 backdrop-blur-3xl flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 flex-1 md:flex-none min-h-0">
                {/* Scrollable Text Area (tag, title, description) */}
                <div className="overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-4 flex-1 no-scrollbar">
                  <div>
                    <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest rounded-full mb-2.5 shadow-[0_0_15px_rgba(196,251,109,0.15)]">
                      {selectedDesign.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white uppercase tracking-tight leading-tight">
                      {selectedDesign.title}
                    </h3>
                  </div>

                  <div className="w-10 h-1 bg-accent/40 rounded-full shrink-0"></div>

                  <p className="text-zinc-300 font-light text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-line">
                    {selectedDesign.description || 'No detailed description provided.'}
                  </p>
                </div>
                
                {/* Fixed Bottom Live Preview Button */}
                {selectedDesign.live_link && (
                  <div className="p-4 sm:p-6 shrink-0 border-t border-white/10 bg-zinc-950/80">
                    <a 
                      href={selectedDesign.live_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-white text-zinc-950 font-bold uppercase tracking-widest py-3.5 rounded-full hover:bg-accent transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(196,251,109,0.3)] text-xs md:text-sm cursor-pointer"
                    >
                      View Live Preview
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
