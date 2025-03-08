'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getUserProfile, updateProfile, isAuthenticated } from '@/utils/api';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface UserProfile {
  email: string;
  username: string;
  nickname?: string;
}

type EditProfileFormData = {
  nickname: string;
};

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProfileFormData>();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        reset({ nickname: data.nickname || '' });
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, reset]);

  if (!mounted) {
    return null;
  }

  const onSubmit = async (data: EditProfileFormData) => {
    setUpdateLoading(true);
    try {
      await updateProfile({ nickname: data.nickname });
      toast.success('Profile updated successfully');
      router.push('/profile');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold gradient-text">Edit Profile</h1>
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Profile
              </Link>
            </div>

            <div className="modern-card p-8">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : profile ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      className="modern-input bg-gray-50"
                      value={profile.email}
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      className="modern-input bg-gray-50"
                      value={profile.username}
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nickname
                    </label>
                    <input
                      type="text"
                      className="modern-input"
                      placeholder="Enter your nickname"
                      {...register('nickname')}
                    />
                    {errors.nickname && (
                      <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">This is how you'll appear to other users</p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Link
                      href="/profile"
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="btn-primary"
                    >
                      {updateLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center text-gray-600">
                  Failed to load profile. Please try again later.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 