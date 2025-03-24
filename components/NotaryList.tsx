'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

// Create supabase client directly in the component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build-process';
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

type Notary = Database['public']['Tables']['notaries']['Row'];

export default function NotaryList() {
  const [notaries, setNotaries] = useState<Notary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotaries() {
      try {
        setLoading(true);
        
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
  }, []);

  if (loading) {
    return <div className="p-4">Loading notaries...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Notaries</h2>
      
      {notaries.length === 0 ? (
        <p>No notaries found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notaries.map((notary) => (
            <div key={notary.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{notary.name}</h3>
              <p className="text-gray-600">
                {notary.city}, {notary.state}
              </p>
              <div className="mt-2">
                <span className="text-yellow-500">★</span> {notary.rating} ({notary.review_count} reviews)
              </div>
              <div className="mt-2">
                <strong>Services:</strong>{' '}
                {notary.services.join(', ')}
              </div>
              {notary.about && (
                <p className="mt-2 text-sm text-gray-700">{notary.about}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
