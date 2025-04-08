import { createClient } from '@supabase/supabase-js';
import env from './env';

// Define the Database type to match the project's structure
export type Database = {
  public: {
    Tables: {
      directories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          title: string;
          description: string;
          created_at: string;
          updated_at: string;
          theme: {
            colors: {
              primary: string;
              secondary: string;
              accent: string;
            }
          };
          logo?: {
            path: string;
            alt: string;
          };
          navigation?: {
            header?: {
              ctaButton?: {
                text: string;
                url: string;
              }
            };
            footer?: {
              quickLinks?: Array<{ text: string; url: string }>;
              services?: Array<{ text: string; url: string }>;
              support?: Array<{ text: string; url: string }>;
            }
          };
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          title: string;
          description: string;
          created_at?: string;
          updated_at?: string;
          theme: {
            colors: {
              primary: string;
              secondary: string;
              accent: string;
            }
          };
          logo?: {
            path: string;
            alt: string;
          };
          navigation?: {
            header?: {
              ctaButton?: {
                text: string;
                url: string;
              }
            };
            footer?: {
              quickLinks?: Array<{ text: string; url: string }>;
              services?: Array<{ text: string; url: string }>;
              support?: Array<{ text: string; url: string }>;
            }
          };
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          title?: string;
          description?: string;
          updated_at?: string;
          theme?: {
            colors: {
              primary?: string;
              secondary?: string;
              accent?: string;
            }
          };
          logo?: {
            path?: string;
            alt?: string;
          };
          navigation?: {
            header?: {
              ctaButton?: {
                text?: string;
                url?: string;
              }
            };
            footer?: {
              quickLinks?: Array<{ text: string; url: string }>;
              services?: Array<{ text: string; url: string }>;
              support?: Array<{ text: string; url: string }>;
            }
          };
        };
      },
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

/**
 * IMPORTANT: Supabase client initialization has been moved to a React hook
 * 
 * To use Supabase in components, import the useSupabase hook:
 * ```
 * import { useSupabase } from '@/lib/hooks/useSupabase';
 * 
 * function MyComponent() {
 *   const { supabase, loading, error } = useSupabase();
 *   
 *   if (loading) return <div>Loading Supabase client...</div>;
 *   if (error) return <div>Error initializing Supabase: {error.message}</div>;
 *   if (!supabase) return null;
 *   
 *   // Use supabase here...
 * }
 * ```
 * 
 * This approach guarantees that Supabase is only initialized after
 * environment variables are properly loaded from the server.
 */

// For backward compatibility with existing imports
// This will log a warning and redirect to the hook approach
let supabaseProxy: any = new Proxy({}, {
  get(target, prop) {
    console.warn(
      '⚠️ Direct import of supabase client is deprecated and may cause environment variable errors. ' +
      'Please use the useSupabase() hook instead. ' +
      'See lib/hooks/useSupabase.tsx for details.'
    );
    return undefined;
  }
});

// Export the supabase proxy for backward compatibility
export default supabaseProxy;
