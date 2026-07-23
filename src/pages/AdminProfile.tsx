import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileSettings } from '../types';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ProfileSettings>>({
    name: '',
    tagline: '',
    bio: '',
    avatar_url: '',
    contact_email: '',
    linkedin_url: '',
    instagram_url: '',
    dribbble_url: '',
    behance_url: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let error;
    if (profileId) {
      const { error: updateError } = await supabase
        .from('profile_settings')
        .update(formData)
        .eq('id', profileId);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('profile_settings')
        .insert([formData])
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Avatar URL</label>
            <input type="url" name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all resize-none"></textarea>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold border-b border-zinc-800 pb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Behance URL</label>
              <input type="url" name="behance_url" value={formData.behance_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Dribbble URL</label>
              <input type="url" name="dribbble_url" value={formData.dribbble_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram URL</label>
              <input type="url" name="instagram_url" value={formData.instagram_url || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none transition-all" />
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
