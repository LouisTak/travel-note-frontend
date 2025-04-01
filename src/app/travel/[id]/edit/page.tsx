'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { isAuthenticated } from '@/utils/api';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';

interface CheckpointInput {
  id?: number;
  time: string;
  location: string;
  activity: string;
  tips?: string;
}

interface ItineraryInput {
  id?: number;
  day_number: number;
  description: string;
  reminder?: string;
  checkpoints: CheckpointInput[];
}

interface TravelFormData {
  title: string;
  destination: string;
  remarks?: string;
  start_at: Date;
  end_at: Date;
  itineraries: ItineraryInput[];
}

export default function EditTravel() {
  const router = useRouter();
  const params = useParams();
  const travelId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [duration, setDuration] = useState(1);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TravelFormData>({
    defaultValues: {
      title: '',
      destination: '',
      remarks: '',
      start_at: new Date(),
      end_at: new Date(new Date().setDate(new Date().getDate() + 1)),
      itineraries: []
    }
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control,
    name: 'itineraries'
  });

  // Watch for date changes to calculate duration
  const startDate = watch('start_at');
  const endDate = watch('end_at');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Fetch travel data
    const fetchTravel = async () => {
      try {
        const response = await api.get(`/travel-plans/${travelId}`);

        if (response.status !== 200) {
          throw new Error('Failed to fetch travel plan');
        }

        const data = await response.data.data;
        
        // Format dates
        const formattedData = {
          ...data,
          start_at: new Date(data.start_at),
          end_at: new Date(data.end_at),
          itineraries: data.itineraries?.map((itinerary: any) => ({
            ...itinerary,
            checkpoints: itinerary.checkpoints || []
          })) || []
        };

        reset(formattedData);
        setDuration(formattedData.itineraries.length);
      } catch (error) {
        toast.error('Failed to load travel plan');
        console.error('Error loading travel plan:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTravel();
  }, [travelId, router, reset]);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays);

      // Update itineraries based on duration
      const currentItineraries = watch('itineraries');
      if (diffDays > currentItineraries.length) {
        // Add new itineraries
        for (let i = currentItineraries.length + 1; i <= diffDays; i++) {
          appendItinerary({
            day_number: i,
            description: `Day ${i} of your trip`,
            checkpoints: [
              {
                time: '09:00-12:00',
                location: '',
                activity: '',
                tips: ''
              }
            ]
          });
        }
      } else if (diffDays < currentItineraries.length) {
        // Remove excess itineraries
        for (let i = currentItineraries.length; i > diffDays; i--) {
          removeItinerary(i - 1);
        }
      }
    }
  }, [startDate, endDate, appendItinerary, removeItinerary, watch]);

  const onSubmit = async (data: TravelFormData) => {
    setLoading(true);
    try {
      const response = await api.put(`/travel-plans/${travelId}`, {
        ...data,
        start_at: data.start_at.toISOString(),
        end_at: data.end_at.toISOString()
      });

      if (response.status !== 200) {
        const errorData = await response.data;
        throw new Error(errorData.error || 'Failed to update travel plan');
      }

      toast.success('Travel plan updated successfully!');
      router.push('/travel');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update travel plan');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a checkpoint to a specific itinerary
  const addCheckpoint = (itineraryIndex: number) => {
    const itineraries = watch('itineraries');
    const updatedItineraries = [...itineraries];
    updatedItineraries[itineraryIndex].checkpoints.push({
      time: '',
      location: '',
      activity: '',
      tips: ''
    });
    setValue('itineraries', updatedItineraries);
  };

  // Function to remove a checkpoint from a specific itinerary
  const removeCheckpoint = (itineraryIndex: number, checkpointIndex: number) => {
    const itineraries = watch('itineraries');
    const updatedItineraries = [...itineraries];
    updatedItineraries[itineraryIndex].checkpoints.splice(checkpointIndex, 1);
    setValue('itineraries', updatedItineraries);
  };

  if (!mounted) {
    return null;
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
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
          <h1 className="text-3xl font-bold gradient-text text-center mb-6">Edit Travel Plan</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="modern-card p-6">
              <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Title*
                  </label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder={`Summer Vacation ${new Date().getFullYear()}`}
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination*
                  </label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="Paris, France"
                    {...register('destination', { required: 'Destination is required' })}
                  />
                  {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <Controller
                    control={control}
                    name="start_at"
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        className="modern-input w-full"
                        dateFormat="yyyy-MM-dd"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date*
                  </label>
                  <Controller
                    control={control}
                    name="end_at"
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        className="modern-input w-full"
                        dateFormat="yyyy-MM-dd"
                        minDate={startDate}
                      />
                    )}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    className="modern-input"
                    rows={3}
                    placeholder="Any additional notes about this trip..."
                    {...register('remarks')}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Daily Itineraries ({duration} days)</h2>
              </div>

              <div className="space-y-8">
                {itineraryFields.map((field, itineraryIndex) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <h3 className="text-lg font-medium mb-3">Day {itineraryIndex + 1}</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day Description
                        </label>
                        <input
                          type="text"
                          className="modern-input"
                          placeholder="Exploring the city center..."
                          {...register(`itineraries.${itineraryIndex}.description`)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reminder
                        </label>
                        <input
                          type="text"
                          className="modern-input"
                          placeholder="Don't forget to bring sunscreen!"
                          {...register(`itineraries.${itineraryIndex}.reminder`)}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium">Checkpoints</h4>
                        <button
                          type="button"
                          onClick={() => addCheckpoint(itineraryIndex)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Checkpoint
                        </button>
                      </div>
                      
                      {watch(`itineraries.${itineraryIndex}.checkpoints`)?.map((checkpoint, checkpointIndex) => (
                        <div key={checkpointIndex} className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium">Checkpoint {checkpointIndex + 1}</h5>
                            {watch(`itineraries.${itineraryIndex}.checkpoints`)?.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCheckpoint(itineraryIndex, checkpointIndex)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
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
                                {...register(`itineraries.${itineraryIndex}.checkpoints.${checkpointIndex}.time`)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location*
                              </label>
                              <input
                                type="text"
                                className="modern-input"
                                placeholder="Eiffel Tower"
                                {...register(`itineraries.${itineraryIndex}.checkpoints.${checkpointIndex}.location`, { 
                                  required: 'Location is required' 
                                })}
                              />
                              {errors.itineraries?.[itineraryIndex]?.checkpoints?.[checkpointIndex]?.location && (
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
                                {...register(`itineraries.${itineraryIndex}.checkpoints.${checkpointIndex}.activity`, { 
                                  required: 'Activity is required' 
                                })}
                              />
                              {errors.itineraries?.[itineraryIndex]?.checkpoints?.[checkpointIndex]?.activity && (
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
                                {...register(`itineraries.${itineraryIndex}.checkpoints.${checkpointIndex}.tips`)}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/travel')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Travel Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 