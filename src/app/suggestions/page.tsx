'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAuthenticated, getTravelSuggestions } from '@/utils/api';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';

type SuggestionFormData = {
  destination: string;
  query: string;
};

interface SuggestionResponse {
  destination: string;
  query: string;
  suggestion: string;
}

export default function Suggestions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<SuggestionFormData>();
  const [recentQueries, setRecentQueries] = useState<{destination: string, query: string}[]>([
    { destination: "Paris, France", query: "What are the best times to visit the Louvre?" },
    { destination: "Tokyo, Japan", query: "What local dishes should I try in Tokyo?" },
    { destination: "New York City, USA", query: "How to get around in New York City?" }
  ]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const onSubmit = async (data: SuggestionFormData) => {
    setLoading(true);
    setSuggestion(null);
    
    try {
      const response = await getTravelSuggestions(data);
      setSuggestion(response);
      
      // Add to recent queries
      setRecentQueries(prev => {
        const newQueries = [data, ...prev.filter(q => 
          !(q.destination === data.destination && q.query === data.query)
        )].slice(0, 5);
        return newQueries;
      });
      
    } catch (error: unknown) {
      toast.error('Failed to get suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyRecentQuery = (destination: string, query: string) => {
    handleSubmit(onSubmit)({ destination, query });
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold gradient-text text-center mb-8">Travel Advice</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-1">
              <div className="modern-card p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Ask a Question</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="destination">
                      Destination
                    </label>
                    <input
                      className="modern-input"
                      id="destination"
                      type="text"
                      placeholder="e.g., Tokyo, Japan"
                      {...register('destination', { required: 'Destination is required' })}
                    />
                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="query">
                      Your Question
                    </label>
                    <textarea
                      className="modern-input"
                      id="query"
                      rows={4}
                      placeholder="e.g., What's the best time to visit? What local dishes should I try?"
                      {...register('query', { required: 'Question is required' })}
                    ></textarea>
                    {errors.query && <p className="text-red-500 text-xs mt-1">{errors.query.message}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex justify-center items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting Answer...
                      </>
                    ) : 'Get Answer'}
                  </button>
                </form>
                
                {recentQueries.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular Questions</h3>
                    <div className="space-y-3">
                      {recentQueries.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => applyRecentQuery(q.destination, q.query)}
                          className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm border border-gray-200 transition"
                        >
                          <p className="font-medium text-gray-900">{q.query}</p>
                          <p className="text-gray-500 text-xs mt-1">{q.destination}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {suggestion ? (
                <div className="modern-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      About {suggestion.destination}
                    </h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Travel Advice
                    </span>
                  </div>
                  
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-1">Your Question:</h3>
                    <p className="text-gray-900">{suggestion.query}</p>
                  </div>
                  
                  <div className="prose max-w-none">
                    {suggestion.suggestion.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setSuggestion(null)} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Ask another question
                      </button>
                      
                      <button 
                        onClick={() => window.print()} 
                        className="text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                        </svg>
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Ask the Travel Assistant</h2>
                  <p className="text-gray-600 max-w-md mb-6">
                    Get personalized answers about destinations, local customs, transportation options, must-visit attractions, and more.
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-6 text-left max-w-md mx-auto">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>"What's the best time to visit Kyoto, Japan?"</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>"What local dishes should I try in Barcelona?"</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>"How do I get from the airport to downtown in Amsterdam?"</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 