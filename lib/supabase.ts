import { createClient } from '@supabase/supabase-js';

// Define the Database type to match the project's structure
export type Database = {
  public: {
    Tables: {
      notaries: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          services: string[];
          rating: number;
          review_count: number;
          review_summary: string | null;
          latitude: number;
          longitude: number;
          last_updated: string;
          about: string;
          business_hours: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          };
          certifications: string[];
          languages: string[];
          pricing: {
            price_info: string;
          };
          place_id: string;
          specialized_services: string[];
          remote_notary_states: string[] | null;
          is_available_now: boolean;
          accepts_online_booking: boolean;
          starting_price: number | null;
          price_info: string | null;
          business_type: string | null;
          service_radius_miles: number | null;
          service_areas: string[] | null;
          profile_image_url: string | null;
          license_number: string | null;
          license_expiry: string | null;
          insurance_verified: boolean;
          background_check_verified: boolean;
          featured: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          services: string[];
          rating?: number;
          review_count?: number;
          review_summary?: string | null;
          latitude?: number;
          longitude?: number;
          last_updated?: string;
          about?: string;
          business_hours?: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          };
          certifications?: string[];
          languages?: string[];
          pricing?: {
            price_info: string;
          };
          place_id?: string;
          specialized_services?: string[];
          remote_notary_states?: string[] | null;
          is_available_now?: boolean;
          accepts_online_booking?: boolean;
          starting_price?: number | null;
          price_info?: string | null;
          business_type?: string | null;
          service_radius_miles?: number | null;
          service_areas?: string[] | null;
          profile_image_url?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          insurance_verified?: boolean;
          background_check_verified?: boolean;
          featured?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          services?: string[];
          rating?: number;
          review_count?: number;
          review_summary?: string | null;
          latitude?: number;
          longitude?: number;
          last_updated?: string;
          about?: string;
          business_hours?: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          };
          certifications?: string[];
          languages?: string[];
          pricing?: {
            price_info: string;
          };
          place_id?: string;
          specialized_services?: string[];
          remote_notary_states?: string[] | null;
          is_available_now?: boolean;
          accepts_online_booking?: boolean;
          starting_price?: number | null;
          price_info?: string | null;
          business_type?: string | null;
          service_radius_miles?: number | null;
          service_areas?: string[] | null;
          profile_image_url?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          insurance_verified?: boolean;
          background_check_verified?: boolean;
          featured?: boolean;
        };
      };
    };
  };
};

// Use default values for CI/CD environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build-process';

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;
