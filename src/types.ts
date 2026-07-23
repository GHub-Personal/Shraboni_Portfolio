export type DesignCategory = 'Posters' | 'Carousels' | 'Thumbnails' | 'Banners';

export interface Design {
  id: string;
  title: string;
  description: string;
  category: DesignCategory;
  image_url: string;
  live_link?: string;
  is_featured: boolean;
  created_at: string;
}

export interface ProfileSettings {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string;
  contact_email: string;
  linkedin_url: string;
  instagram_url: string;
  dribbble_url: string;
  behance_url: string;
}
