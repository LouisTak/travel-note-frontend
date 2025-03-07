'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAuthenticated, generateTravelPlan } from '@/utils/api';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';

type PlanFormData = {
  destination: string;
  duration: number;
  interests: string;
  start_date: string;
};

interface TravelActivity {
  time: string;
  location: string;
  activity: string;
  tips?: string;
}

interface TravelDay {
  day: number;
  date?: string;
  activities: TravelActivity[];
}

interface TravelPlan {
  destination: string;
  duration: number;
  plan: {
    days: TravelDay[];
    summary: string;
    tips: string[];
  };
}

export default function Planner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mounted, setMounted] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PlanFormData>({
    defaultValues: {
      duration: 3
    }
  });

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get destination from URL param if available
  useEffect(() => {
    const destinationParam = searchParams?.get('destination');
    if (destinationParam) {
      setValue('destination', destinationParam);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // If not mounted yet, return null or loading state
  if (!mounted) {
    return null;
  }

  const onSubmit = async (data: PlanFormData) => {
    setLoading(true);
    setPlan(null);
    
    try {
      const response = await generateTravelPlan(data);
      setPlan(response);
      setCurrentStep(2);
      toast.success('Trip plan generated successfully!');
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createNewPlan = () => {
    setPlan(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold gradient-text text-center mb-6">Plan Your Trip</h1>
          
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto">
              <div className="modern-card p-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="destination">
                        Where do you want to go?
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
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
                        How many days will you stay?
                      </label>
                      <input
                        className="modern-input"
                        id="duration"
                        type="number"
                        min="1"
                        max="30"
                        {...register('duration', { 
                          required: 'Duration is required',
                          min: { value: 1, message: 'Minimum duration is 1 day' },
                          max: { value: 30, message: 'Maximum duration is 30 days' }
                        })}
                      />
                      {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="interests">
                        What are your interests?
                      </label>
                      <input
                        className="modern-input"
                        id="interests"
                        type="text"
                        placeholder="e.g., food, museums, hiking, local culture"
                        {...register('interests')}
                      />
                      <p className="text-gray-500 text-xs mt-1">Optional: Helps us tailor recommendations for you</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="start_date">
                        When will your trip start?
                      </label>
                      <input
                        className="modern-input"
                        id="start_date"
                        type="date"
                        {...register('start_date')}
                      />
                      <p className="text-gray-500 text-xs mt-1">Optional: We'll include actual dates in your itinerary</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
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
                          Creating Your Travel Plan...
                        </>
                      ) : (
                        <>
                          <span>Generate Travel Plan</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {currentStep === 2 && plan && (
            <div className="max-w-5xl mx-auto">
              <div className="modern-card p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
                  <div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">
                      {plan.duration}-Day Trip to {plan.destination}
                    </h2>
                    <p className="text-gray-600">Your personalized travel itinerary</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <button 
                      onClick={() => window.print()} 
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                    <button 
                      onClick={createNewPlan} 
                      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Plan
                    </button>
                  </div>
                </div>
                
                {plan.plan.summary && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Trip Overview</h3>
                    <p className="text-gray-700 bg-blue-50 p-5 rounded-lg border border-blue-100">
                      {plan.plan.summary}
                    </p>
                  </div>
                )}
                
                {plan.plan.tips && plan.plan.tips.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">Travel Tips</h3>
                    <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                      <ul className="space-y-2 text-gray-700">
                        {plan.plan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-6">Daily Itinerary</h3>
                
                <div className="space-y-8">
                  {plan.plan.days && plan.plan.days.map((day) => (
                    <div key={day.day} className="border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 text-white">
                        <h4 className="text-lg font-bold">
                          Day {day.day} {day.date ? `(${day.date})` : ''}
                        </h4>
                      </div>
                      
                      <div className="divide-y">
                        {day.activities && day.activities.map((activity, index) => (
                          <div key={index} className="p-5 hover:bg-gray-50">
                            <div className="flex flex-col md:flex-row">
                              <div className="font-semibold text-blue-600 md:w-1/5 mb-2 md:mb-0">
                                {activity.time}
                              </div>
                              <div className="md:w-4/5">
                                <h5 className="font-bold text-gray-900 text-lg">{activity.location}</h5>
                                <p className="text-gray-700 my-2">{activity.activity}</p>
                                {activity.tips && (
                                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-600 mt-2 inline-block">
                                    <span className="font-medium text-blue-700">Tip:</span> {activity.tips}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 