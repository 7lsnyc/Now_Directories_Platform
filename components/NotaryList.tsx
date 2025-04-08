'use client';

import { useEffect, useState } from 'react';
import type { Database } from '../lib/supabase';
import { useSupabase } from '@/lib/hooks/useSupabase';

type Notary = Database['public']['Tables']['notaries']['Row'];

export default function NotaryList() {
  const [notaries, setNotaries] = useState<Notary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the safe Supabase hook instead of direct initialization
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();

  useEffect(() => {
    // Only proceed when Supabase client is available
    if (!supabase || supabaseLoading) return;
    
    async function fetchNotaries() {
      try {
        setLoading(true);
        
        // TypeScript safety - recheck supabase is not null
        if (!supabase) {
          throw new Error('Supabase client not available');
        }
        
        const { data, error } = await supabase
          .from('notaries')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        setNotaries(data || []);
      } catch (err) {
        console.error('Error fetching notaries:', err);
        setError('Failed to fetch notaries. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchNotaries();
  }, [supabase, supabaseLoading]); // Add dependencies for the Supabase client

  // Handle Supabase initialization errors
  if (supabaseError) {
    return (
      <div className="p-4 text-red-500">
        Error connecting to database: {supabaseError.message}
      </div>
    );
  }

  // Show loading while Supabase initializes or while fetching data
  if (supabaseLoading || loading) {
    return <div className="p-4">Loading notaries...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (notaries.length === 0) {
    return <div className="p-4">No notaries found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {notaries.map((notary) => (
        <div 
          key={notary.id} 
          className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          data-testid="notary-card"
        >
          <h3 className="font-bold text-lg">{notary.name}</h3>
          <div className="text-sm text-gray-600 mb-2">
            {notary.city}, {notary.state} {notary.zip}
          </div>
          <p className="mt-2">{notary.address}</p>
          <p className="mt-2">{notary.phone}</p>
          <p className="mt-2">{notary.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {notary.services?.map((service, index) => (
              <span 
                key={index} 
                className="bg-theme-primary text-white text-xs px-2 py-1 rounded"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
