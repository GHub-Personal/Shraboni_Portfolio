"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { Design, DesignCategory } from '../../../src/types';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

const CATEGORIES: DesignCategory[] = ['Posters', 'Carousels', 'Thumbnails', 'Banners', 'Brand Collaborations', 'Social Media Management', 'Content Writing'];

export default function AdminDashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DesignCategory>('Posters');
  const [imageUrl, setImageUrl] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchDesigns = async () => {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching designs:', error);
    else setDesigns(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const newUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(filePath);

        newUrls.push(data.publicUrl);
      }

      setImageUrl(prev => prev ? `${prev},${newUrls.join(',')}` : newUrls.join(','));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Make sure the portfolio-assets bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const designData = {
      title,
      description,
      category,
      image_url: imageUrl,
      live_link: liveLink || null,
      is_featured: isFeatured,
      aspect_ratio: aspectRatio || '1:1',
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('designs')
        .update(designData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('designs')
        .insert([designData]);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      console.error('Error saving design:', error);
      alert('Error saving design: ' + error.message);
    } else {
      setIsModalOpen(false);
      resetForm();
      fetchDesigns();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    
    // Attempt to delete image from storage if it exists in our bucket
    const design = designs.find(d => d.id === id);
    if (design?.image_url.includes('portfolio-assets')) {
      const fileName = design.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('portfolio-assets').remove([fileName]);
      }
    }

    const { error } = await supabase.from('designs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting design:', error);
      alert('Error deleting design: ' + error.message);
    } else {
      fetchDesigns();
    }
  };

  const openEditModal = (design: Design) => {
    setEditingId(design.id);
    setTitle(design.title);
    setDescription(design.description || '');
    setCategory(design.category);
    setImageUrl(design.image_url);
    setLiveLink(design.live_link || '');
    setIsFeatured(design.is_featured);
    setAspectRatio(design.aspect_ratio || '1:1');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Posters');
    setImageUrl('');
    setLiveLink('');
    setIsFeatured(false);
    setAspectRatio('1:1');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designs</h1>
          <p className="text-zinc-400 mt-1">Manage your portfolio gallery</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-white text-zinc-950 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Design
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-sm font-medium text-zinc-400">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading && designs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading designs...</td>
                </tr>
              ) : designs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No designs found. Add your first one!</td>
                </tr>
              ) : (
                designs.map((design) => (
                  <tr key={design.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden">
                        {design.image_url && (
                          <img src={design.image_url.split(',')[0]} alt={design.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{design.title}</div>
                      {design.is_featured && <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded mt-1 inline-block">Featured</span>}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{design.category}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(design)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(design.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Design' : 'Add New Design'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Image(s)</label>
                  <div className="flex flex-col gap-4">
                    {imageUrl && (
                      <div className="flex gap-2 flex-wrap">
                        {imageUrl.split(',').filter(Boolean).map((url, i) => (
                          <div key={i} className="w-24 h-24 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 relative group">
                            <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setImageUrl(prev => prev.split(',').filter((_, index) => index !== i).join(','))}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <label className="flex items-center justify-center w-full h-24 px-4 transition bg-zinc-950 border-2 border-zinc-800 border-dashed rounded-lg appearance-none cursor-pointer hover:border-zinc-700 focus:outline-none">
                        <span className="flex items-center space-x-2">
                          <Upload className="w-5 h-5 text-zinc-400" />
                          <span className="font-medium text-zinc-400">
                            {uploading ? 'Uploading...' : 'Drop files to Attach, or browse'}
                          </span>
                        </span>
                        <input type="file" name="file_upload" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Or Image URL</label>
                    <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="https://..." required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as DesignCategory)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all appearance-none" required>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Aspect Ratio (Dimensions)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 16:9, 4:5, 1:1"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {['1:1', '16:9', '9:16', '4:5'].map(ratio => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            aspectRatio === ratio
                              ? 'bg-white text-zinc-950 border-white shadow-sm'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Live Preview Link (Optional)</label>
                    <input type="url" value={liveLink} onChange={(e) => setLiveLink(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="https://..." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all resize-none"></textarea>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-white focus:ring-white/20" />
                  <label htmlFor="featured" className="text-sm font-medium text-zinc-300">Feature this design on the home page</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
