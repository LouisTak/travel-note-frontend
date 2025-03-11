'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/api';
import Navbar from '@/components/Navbar';

interface Checkpoint {
  id?: number;
  time: string;
  location: string;
  activity: string;
  tips?: string;
}

interface TravelItinerary {
  id: number;
  day_number: number;
  description: string;
  reminder?: string;
  checkpoints: Checkpoint[];
}

interface Travel {
  id: number;
  title: string;
  destination: string;
  start_at: string;
  end_at: string;
  duration: number;
  itineraries: TravelItinerary[];
}

interface FormData {
  description: string;
  reminder?: string;
  checkpoints: Checkpoint[];
}

export default function ManageItineraries() {
  const router = useRouter();
  const params = useParams();
  const travelId = params.id as string;
  
  const [travel, setTravel] = useState<Travel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeItinerary, setActiveItinerary] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  
  const { fields: checkpointFields, append: appendCheckpoint, remove: removeCheckpoint } = useFieldArray({
    control,
    name: 'checkpoints'
  });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchTravel();
  }, [router, travelId]);

  const fetchTravel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/travel-plans/${travelId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch travel plan');
      }
      
      const data = await response.json();
      setTravel(data);
      
      // Set the first itinerary as active by default
      if (data.itineraries && data.itineraries.length > 0) {
        setActiveItinerary(data.itineraries[0].id);
        
        // Initialize form with checkpoints from the first itinerary
        reset({ 
          description: data.itineraries[0].description,
          reminder: data.itineraries[0].reminder || '',
          checkpoints: data.itineraries[0].checkpoints || []
        });
      }
    } catch (error) {
      toast.error('Error fetching travel plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleItinerarySelect = (itineraryId: number) => {
    if (!travel) return;
    
    const itinerary = travel.itineraries.find(i => i.id === itineraryId);
    if (itinerary) {
      setActiveItinerary(itineraryId);
      
      // Reset form with selected itinerary data
      reset({ 
        description: itinerary.description,
        reminder: itinerary.reminder || '',
        checkpoints: itinerary.checkpoints || []
      });
    }
  };

  const addNewCheckpoint = () => {
    appendCheckpoint({
      time: '',
      location: '',
      activity: '',
      tips: ''
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!activeItinerary) return;
    
    setSaving(true);
    try {
      // Update itinerary details
      const itineraryResponse = await fetch(`http://localhost:5000/api/travel-plans/itineraries/${travelId}/${activeItinerary}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description: data.description,
          reminder: data.reminder
        })
      });
      
      if (!itineraryResponse.ok) {
        throw new Error('Failed to update itinerary');
      }
      
      // Handle checkpoints
      for (const checkpoint of data.checkpoints) {
        if (checkpoint.id) {
          // Update existing checkpoint
          await fetch(`http://localhost:5000/api/travel-plans/itineraries/checkpoints/${travelId}/${activeItinerary}/${checkpoint.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(checkpoint)
          });
        } else {
          // Create new checkpoint
          await fetch(`http://localhost:5000/api/travel-plans/itineraries/checkpoints/${travelId}/${activeItinerary}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(checkpoint)
          });
        }
      }
      
      toast.success('Itinerary updated successfully');
      fetchTravel(); // Refresh data
    } catch (error) {
      toast.error('Error updating itinerary');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!travel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Travel plan not found</h1>
            <Link href="/travel" className="mt-4 inline-block text-blue-500 hover:underline">
              Back to Travel Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">{travel.title}</h1>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Destination:</span> {travel.destination}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Dates:</span> {formatDate(travel.start_at)} - {formatDate(travel.end_at)} ({travel.duration} days)
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href={`/travel/${travelId}`} className="btn-secondary">
                Back to Travel Details
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Itinerary List */}
            <div className="md:col-span-1">
              <div className="modern-card p-4">
                <h2 className="text-xl font-semibold mb-4">Itineraries</h2>
                <div className="space-y-2">
                  {travel.itineraries.map((itinerary) => (
                    <button
                      key={itinerary.id}
                      onClick={() => handleItinerarySelect(itinerary.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        activeItinerary === itinerary.id
                          ? 'bg-blue-100 border-l-4 border-blue-500'
                          : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <p className="font-medium">Day {itinerary.day_number}</p>
                      <p className="text-sm text-gray-600 truncate">{itinerary.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {itinerary.checkpoints.length} checkpoint{itinerary.checkpoints.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Itinerary Details & Checkpoints */}
            <div className="md:col-span-3">
              {activeItinerary ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="modern-card p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Day {travel.itineraries.find(i => i.id === activeItinerary)?.day_number} Details
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          className="modern-input"
                          placeholder="Exploring the city center..."
                          {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reminder
                        </label>
                        <input
                          type="text"
                          className="modern-input"
                          placeholder="Don't forget to bring sunscreen!"
                          {...register('reminder')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modern-card p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Checkpoints</h2>
                      <button
                        type="button"
                        onClick={addNewCheckpoint}
                        className="btn-secondary-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Checkpoint
                      </button>
                    </div>

                    <div className="space-y-6">
                      {checkpointFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Checkpoint {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeCheckpoint(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time
                              </label>
                              <input
                                type="text"
                                className="modern-input"
                                placeholder="09:00-12:00"
                                {...register(`checkpoints.${index}.time` as const, { required: 'Time is required' })}
                              />
                              {errors.checkpoints?.[index]?.time && (
                                <p className="text-red-500 text-xs mt-1">Time is required</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location*
                              </label>
                              <input
                                type="text"
                                className="modern-input"
                                placeholder="Eiffel Tower"
                                {...register(`checkpoints.${index}.location` as const, { required: 'Location is required' })}
                              />
                              {errors.checkpoints?.[index]?.location && (
                                <p className="text-red-500 text-xs mt-1">Location is required</p>
                              )}
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Activity*
                              </label>
                              <input
                                type="text"
                                className="modern-input"
                                placeholder="Visit the Eiffel Tower and enjoy the view from the top"
                                {...register(`checkpoints.${index}.activity` as const, { required: 'Activity is required' })}
                              />
                              {errors.checkpoints?.[index]?.activity && (
                                <p className="text-red-500 text-xs mt-1">Activity is required</p>
                              )}
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tips
                              </label>
                              <textarea
                                className="modern-input"
                                rows={2}
                                placeholder="Buy tickets online to avoid long queues"
                                {...register(`checkpoints.${index}.tips` as const)}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ))}

                      {checkpointFields.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500 mb-4">No checkpoints added yet</p>
                          <button
                            type="button"
                            onClick={addNewCheckpoint}
                            className="btn-primary-sm"
                          >
                            Add Your First Checkpoint
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="modern-card p-6 flex items-center justify-center h-64">
                  <p className="text-gray-500">Select an itinerary to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 