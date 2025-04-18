import { createClient } from '@supabase/supabase-js';

// Define the Database type to match the project's structure
export type Database = {
  public: {
    Tables: {
      directories: {
        Row: {
          id: string;
          directory_slug: string;
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
          directory_slug: string;
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
          directory_slug?: string;
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
          directory_slug: string;
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
          services?: string[];
          rating: number;
          review_count: number;
          review_summary?: string | null;
          latitude: number;
          longitude: number;
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
          directory_slug: string;
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
          directory_slug?: string;
        };
      },
      notaries_new: {
        Row: {
          id: string; // UUID type in PostgreSQL
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
          updated_at: string; // timestamptz in PostgreSQL
          about: string | null;
          business_hours: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          } | null;
          certifications: string[] | null;
          languages: string[] | null;
          pricing: {
            price_info: string;
          } | null;
          place_id: string | null;
          specialized_services: string[] | null;
          remote_notary_states: string[] | null;
          is_available_now: boolean | null;
          accepts_online_booking: boolean | null;
          starting_price: number | null;
          price_info: string | null;
          business_type: string | null;
          service_radius_miles: number | null;
          service_areas: string[] | null;
          profile_image_url: string | null;
          license_number: string | null;
          license_expiry: string | null;
          insurance_verified: boolean | null;
          background_check_verified: boolean | null;
          featured: boolean | null;
          directory_slug: string;
          // location field is omitted as it's a PostGIS geography type
          // not easily representable in TypeScript
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
          services?: string[];
          rating: number;
          review_count: number;
          review_summary?: string | null;
          latitude: number;
          longitude: number;
          updated_at?: string;
          about?: string | null;
          business_hours?: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          } | null;
          certifications?: string[] | null;
          languages?: string[] | null;
          pricing?: {
            price_info: string;
          } | null;
          place_id?: string | null;
          specialized_services?: string[] | null;
          remote_notary_states?: string[] | null;
          is_available_now?: boolean | null;
          accepts_online_booking?: boolean | null;
          starting_price?: number | null;
          price_info?: string | null;
          business_type?: string | null;
          service_radius_miles?: number | null;
          service_areas?: string[] | null;
          profile_image_url?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          insurance_verified?: boolean | null;
          background_check_verified?: boolean | null;
          featured?: boolean | null;
          directory_slug: string;
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
          updated_at?: string;
          about?: string | null;
          business_hours?: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          } | null;
          certifications?: string[] | null;
          languages?: string[] | null;
          pricing?: {
            price_info: string;
          } | null;
          place_id?: string | null;
          specialized_services?: string[] | null;
          remote_notary_states?: string[] | null;
          is_available_now?: boolean | null;
          accepts_online_booking?: boolean | null;
          starting_price?: number | null;
          price_info?: string | null;
          business_type?: string | null;
          service_radius_miles?: number | null;
          service_areas?: string[] | null;
          profile_image_url?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          insurance_verified?: boolean | null;
          background_check_verified?: boolean | null;
          featured?: boolean | null;
          directory_slug?: string;
        };
      };
    };
  };
};

/**
 * IMPORTANT: Supabase client initialization has been moved to React providers
 * 
 * To use Supabase in client components, import the useSupabase hook:
 * ```
 * import { useSupabase } from '@/lib/supabase/clientProvider';
 * 
 * function MyComponent() {
 *   const { supabase, isLoading } = useSupabase();
 *   
 *   if (isLoading) return <div>Loading Supabase client...</div>;
 *   if (!supabase) return <div>Error initializing Supabase client</div>;
 *   
 *   // Use supabase here...
 * }
 * ```
 * 
 * For server components, use createServerClient:
 * ```
 * import { createServerClient } from '@/lib/supabase/server';
 * 
 * const supabase = createServerClient();
 * // Use supabase here...
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
      'Please use the useSupabase() hook from @/lib/supabase/clientProvider for client components, ' +
      'or createServerClient() from @/lib/supabase/server for server components.'
    );
    return undefined;
  }
});

// Export the supabase proxy for backward compatibility
export default supabaseProxy;
