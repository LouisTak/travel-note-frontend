'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMe, isAuthenticated } from '@/utils/api';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';

interface UserProfile {
  email: string;
  username: string;
  nickname?: string;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setProfile(data);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold gradient-text text-center mb-6">Your Profile</h1>

          <div className="max-w-3xl mx-auto">
            <div className="modern-card p-8">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : profile ? (
                <>
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
                      <div className="flex space-x-4">
                        <Link
                          href="/profile/edit"
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Profile
                        </Link>
                        <Link
                          href="/profile/change-password"
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Change Password
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex border-b border-gray-200 pb-4">
                        <span className="font-medium text-gray-600 w-1/3">Email</span>
                        <span className="text-gray-800">{profile.email}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-4">
                        <span className="font-medium text-gray-600 w-1/3">Username</span>
                        <span className="text-gray-800">{profile.username}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-4">
                        <span className="font-medium text-gray-600 w-1/3">Nickname</span>
                        <span className="text-gray-800">{profile.nickname || 'Not set'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-1/3">Member Since</span>
                        <span className="text-gray-800">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
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