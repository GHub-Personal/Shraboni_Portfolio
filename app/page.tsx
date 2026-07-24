"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Design, ProfileSettings } from '../src/types';
import { ExternalLink, Instagram, Linkedin, X, Mail, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfCarousel } from '../src/components/ui/PdfCarousel';

const CATEGORIES = ['All', 'Posters', 'Carousels', 'Thumbnails', 'Banners'];

export default function Portfolio() {
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, designsRes] = await Promise.all([
        supabase.from('profile_settings').select('*').limit(1).single(),
        supabase.from('designs').select('*').order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (designsRes.data) setDesigns(designsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = activeCategory === 'All' 
    ? designs 
    : designs.filter(d => d.category === activeCategory);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! (In a real app, this would send an email or save to DB)');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
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
      <section className="relative px-6 pt-40 pb-24 md:pt-48 md:pb-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
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
            className="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            {profile?.avatar_url && (
              <motion.div 
                whileHover={{ scale: 1.1, rotateZ: 5 }}
                className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-accent relative shadow-[0_0_30px_rgba(196,251,109,0.4)]"
              >
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              </motion.div>
            )}
            <div>
              <p className="text-xl md:text-2xl text-zinc-300 font-light max-w-lg leading-relaxed">
                {profile?.tagline || 'Designing high-converting thumbnails, banners, and digital assets.'}
              </p>
              <p className="text-zinc-500 mt-2">
                {profile?.bio || 'Elevating brands through striking visual identity.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-6 pt-8"
          >
            <button 
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-8 py-4 bg-accent text-zinc-950 font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors flex items-center gap-2"
            >
              Explore Work
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent transition-colors p-3 border border-white/10 hover:border-accent/50 rounded-full">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile?.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent transition-colors p-3 border border-white/10 hover:border-accent/50 rounded-full">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
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

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" style={{ perspective: 1200 }}>
            <AnimatePresence>
              {filteredDesigns.map((design, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  whileHover={{ 
                    scale: 1.03, 
                    rotateX: 2, 
                    rotateY: -2,
                    z: 30,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(196,251,109,0.15)"
                  }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
                  key={design.id} 
                  className="group relative bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-accent/40 transition-colors cursor-pointer block-aspect shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform-gpu"
                  onClick={() => setSelectedDesign(design)}
                >
                  <div className="aspect-[4/5] md:aspect-square overflow-hidden bg-transparent relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-[2px]"></div>
                    <img 
                      src={design.image_url.split(',')[0]} 
                      alt={design.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Hover Info */}
                    <div className="absolute bottom-0 left-0 w-full p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 flex flex-col justify-end h-full">
                      <span className="text-accent text-xs font-bold uppercase tracking-widest mb-2">{design.category}</span>
                      <h3 className="text-3xl font-display font-bold text-white leading-tight mb-2">{design.title}</h3>
                      <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-md text-zinc-950 flex items-center justify-center self-end mt-4 shadow-lg shadow-accent/20">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredDesigns.length === 0 && (
            <div className="py-32 text-center text-zinc-500 font-display text-2xl uppercase">
              No designs found in this category.
            </div>
          )}
        </div>
      </section>

      {/* Featured Carousel Section */}
      <section className="py-24 px-6 relative bg-zinc-950/50 border-y border-white/5">
        <PdfCarousel 
          title="Featured Carousel Design"
          images={[
            '/carousel/slide1.png',
            '/carousel/slide2.png',
            '/carousel/slide3.png'
          ]}
        />
      </section>

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
                <input type="text" placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 uppercase text-sm tracking-wider font-semibold" />
              </div>
              <div>
                <input type="email" placeholder="Your Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 uppercase text-sm tracking-wider font-semibold" />
              </div>
              <div>
                <textarea placeholder="Tell me about your project" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={3} className="w-full bg-transparent border-b border-white/20 px-0 py-4 focus:border-accent outline-none transition-colors text-white placeholder:text-zinc-600 resize-none uppercase text-sm tracking-wider font-semibold"></textarea>
              </div>
              <button type="submit" className="w-full bg-accent text-zinc-950 font-bold uppercase tracking-widest rounded-xl px-5 py-5 hover:bg-white transition-colors mt-8">
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-600 font-semibold uppercase tracking-wider text-xs border-t border-white/5 mt-24">
        &copy; {new Date().getFullYear()} {profile?.name || 'DESIGNER'}. All rights reserved.
      </footer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl" 
            onClick={() => setSelectedDesign(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-zinc-900/80 hover:bg-accent hover:text-zinc-950 text-white rounded-full transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedDesign(null); }}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40, rotateX: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transformPerspective: 1200 }}
              className="relative w-full max-w-7xl max-h-full flex flex-col lg:flex-row bg-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-1 bg-transparent flex items-center justify-center p-4 lg:p-12 min-h-[40vh] max-h-[60vh] lg:max-h-[85vh]">
                {selectedDesign.category === 'Carousels' ? (
                  <PdfCarousel images={selectedDesign.image_url.split(',')} />
                ) : (
                  <img src={selectedDesign.image_url.split(',')[0]} alt={selectedDesign.title} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                )}
              </div>
              
              <div className="w-full lg:w-[450px] bg-black/40 backdrop-blur-3xl p-8 lg:p-12 flex flex-col justify-center overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 max-h-[40vh] lg:max-h-[85vh]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">
                    {selectedDesign.category}
                  </span>
                  <h3 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6 uppercase tracking-tighter">
                    {selectedDesign.title}
                  </h3>
                  <div className="w-12 h-1 bg-white/10 mb-8"></div>
                  <p className="text-zinc-400 leading-relaxed text-base lg:text-lg mb-8 font-light">
                    {selectedDesign.description || 'No description provided.'}
                  </p>
                </div>
                
                {selectedDesign.live_link && (
                  <a 
                    href={selectedDesign.live_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-white text-zinc-950 font-bold uppercase tracking-widest py-5 rounded-full hover:bg-accent transition-colors mt-auto"
                  >
                    View Live Preview
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
