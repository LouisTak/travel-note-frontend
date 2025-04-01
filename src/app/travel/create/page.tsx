'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api, { isAuthenticated } from '@/utils/api';
import Navbar from '@/components/Navbar';

interface TravelFormData {
  title: string;
  destination: string;
  remarks?: string;
  start_at: Date;
  end_at: Date;
}

export default function CreateTravel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [duration, setDuration] = useState(1);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<TravelFormData>({
    defaultValues: {
      title: '',
      destination: '',
      remarks: '',
      start_at: new Date(),
      end_at: new Date(new Date().setDate(new Date().getDate() + 1)),
    }
  });

  // Watch for date changes to calculate duration
  const startDate = watch('start_at');
  const endDate = watch('end_at');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays);
    }
  }, [startDate, endDate]);

  const onSubmit = async (data: TravelFormData) => {
    setLoading(true);
    try {
      const response = await api.post('/travel-plans', {
        ...data,
        start_at: new Date(Date.UTC(data.start_at.getFullYear(), data.start_at.getMonth(), data.start_at.getDate())),
        end_at: new Date(Date.UTC(data.end_at.getFullYear(), data.end_at.getMonth(), data.end_at.getDate()))
      });

      if (response.status !== 201 && response.status !== 200) {
        const errorData = await response.data;
        throw new Error(errorData.error || 'Failed to create travel plan');
      }

      const result = await response.data.data;
      toast.success('Travel plan created successfully!');
      router.push(`/travel/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create travel plan');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold gradient-text text-center mb-6">Create New Travel Plan</h1>

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
                        minDate={new Date()}
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
                    className="modern-input h-24"
                    placeholder="Any additional notes or remarks about your trip"
                    {...register('remarks')}
                  />
                </div>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Trip Duration:</span> {duration} day{duration !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="btn-primary px-8 py-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Travel Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 