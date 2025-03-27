import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LegalSection } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LegalSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    if (!user) {
      setError('Please sign in to search');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Searching for:', searchQuery);
      
      const { data, error } = await supabase
        .rpc('search_legal_sections', {
          search_query: searchQuery
        });

      console.log('Search results:', data);
      console.log('Search error:', error);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Legal Information Search
            </h1>
            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => supabase.auth.signInWithPassword({
                  email: 'user@example.com',
                  password: 'password123'
                })}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for legal sections (e.g., murder, theft)"
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !user}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Section {section.section_number}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    IPC
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  {section.title}
                </h3>
                <p className="mt-2 text-gray-600">{section.description}</p>
                <div className="mt-4 bg-red-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-red-800">Punishment:</h4>
                  <p className="mt-1 text-sm text-red-700">{section.punishment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}