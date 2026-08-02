"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../src/lib/supabase';
import { ProfileSettings } from '../../../../src/types';
import { Upload, X } from 'lucide-react';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ProfileSettings>>({
    name: '',
    tagline: '',
    bio: '',
    avatar_url: '',
    contact_email: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (data) {
      setProfileId(data.id);
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { id, ...payload } = formData as any;

    let error;
    if (profileId) {
      const { error: updateError } = await supabase
        .from('profile_settings')
        .update(payload)
        .eq('id', profileId);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('profile_settings')
        .insert([payload])
        .select()
        .single();
      error = insertError;
      if (data) setProfileId(data.id);
    }

    setSaving(false);
    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      alert('Profile saved successfully!');
    }
  };

  if (loading) {
    return <div className="text-zinc-500 py-8">Loading profile settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your public information and social links</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold border-b border-zinc-800 pb-4">General Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Email</label>
              <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tagline</label>
            <input type="text" name="tagline" value={formData.tagline || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="e.g. Connecting creativity with what the world needs" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Profile Picture</label>
            <div className="flex items-center gap-6">
              {formData.avatar_url ? (
                <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 relative group">
                  <img src={formData.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-950 border border-zinc-800 border-dashed shrink-0 flex items-center justify-center text-zinc-600 text-xs font-semibold">
                  No Photo
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center max-w-[160px] h-12 px-4 transition bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 focus:outline-none">
                  <span className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-400">
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </span>
                  </span>
                  <input type="file" name="avatar_upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all resize-none"></textarea>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold border-b border-zinc-800 pb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram URL</label>
              <input type="url" name="instagram_url" value={formData.instagram_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">YouTube URL</label>
              <input type="url" name="youtube_url" value={formData.youtube_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="https://youtube.com/@channel" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
