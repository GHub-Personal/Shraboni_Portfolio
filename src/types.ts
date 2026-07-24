export type DesignCategory = 'Posters' | 'Carousels' | 'Thumbnails' | 'Banners' | 'Brand Collaborations' | 'Social Media Management' | 'Content Writing';

export interface Design {
  id: string;
  title: string;
  description: string;
  category: DesignCategory;
  image_url: string;
  live_link?: string;
  is_featured: boolean;
  aspect_ratio?: string;
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

export interface Feedback {
  id: string;
  screenshot_url: string;
  provider_name: string;
  rating: number;
  created_at: string;
}
