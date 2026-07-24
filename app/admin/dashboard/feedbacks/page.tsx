'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../src/lib/supabase';
import { Feedback } from '../../../../src/types';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [providerName, setProviderName] = useState('');
  const [rating, setRating] = useState('5.0');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching feedbacks:', error);
    else setFeedbacks(data || []);
    setLoading(false);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `feedback-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setScreenshotUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Error uploading screenshot. Make sure the portfolio-assets bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      alert('Rating must be a number between 0 and 5.');
      setSaving(false);
      return;
    }

    const feedbackData = {
      screenshot_url: screenshotUrl,
      provider_name: providerName,
      rating: parsedRating,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('feedbacks')
        .update(feedbackData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('feedbacks')
        .insert([feedbackData]);
      error = insertError;
    }

    setSaving(false);
    if (error) {
      console.error('Error saving feedback:', error);
      alert('Error saving feedback: ' + error.message);
    } else {
      setIsModalOpen(false);
      resetForm();
      fetchFeedbacks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    // Attempt to delete screenshot from storage if it exists in our bucket
    const feedback = feedbacks.find(f => f.id === id);
    if (feedback?.screenshot_url.includes('portfolio-assets')) {
      const fileName = feedback.screenshot_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('portfolio-assets').remove([fileName]);
      }
    }

    const { error } = await supabase.from('feedbacks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback: ' + error.message);
    } else {
      fetchFeedbacks();
    }
  };

  const openEditModal = (feedback: Feedback) => {
    setEditingId(feedback.id);
    setScreenshotUrl(feedback.screenshot_url);
    setProviderName(feedback.provider_name);
    setRating(feedback.rating.toString());
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setScreenshotUrl('');
    setProviderName('');
    setRating('5.0');
  };

  // Lock background scroll when modal is open
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Feedbacks</h1>
          <p className="text-zinc-400 mt-1">Manage testimonials and screenshots</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-white text-zinc-950 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Feedback
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-sm font-medium text-zinc-400">
              <tr>
                <th className="px-6 py-4">Screenshot</th>
                <th className="px-6 py-4">Provider Name</th>
                <th className="px-6 py-4">Rating (Stars)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading && feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading feedbacks...</td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No feedbacks found. Add your first one!</td>
                </tr>
              ) : (
                feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-20 h-16 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700">
                        {feedback.screenshot_url && (
                          <img src={feedback.screenshot_url} alt="Screenshot" className="w-full h-full object-contain" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{feedback.provider_name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">{feedback.rating} / 5.0</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(feedback)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(feedback.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
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
              <h2 className="text-xl font-bold">{editingId ? 'Edit Feedback' : 'Add New Feedback'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Screenshot Screenshot Upload</label>
                  <div className="flex flex-col gap-4">
                    {screenshotUrl && (
                      <div className="w-40 h-28 rounded-lg bg-zinc-850 overflow-hidden border border-zinc-700 relative group">
                        <img src={screenshotUrl} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          type="button"
                          onClick={() => setScreenshotUrl('')}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <label className="flex items-center justify-center w-full h-24 px-4 transition bg-zinc-950 border-2 border-zinc-800 border-dashed rounded-lg appearance-none cursor-pointer hover:border-zinc-700 focus:outline-none">
                        <span className="flex items-center space-x-2">
                          <Upload className="w-5 h-5 text-zinc-400" />
                          <span className="font-medium text-zinc-400">
                            {uploading ? 'Uploading...' : 'Drop screenshot to Attach, or browse'}
                          </span>
                        </span>
                        <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleScreenshotUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Provider Name</label>
                    <input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="e.g. John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Rating (0.0 to 5.0 Stars)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="5" 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" 
                      placeholder="e.g. 4.8" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
