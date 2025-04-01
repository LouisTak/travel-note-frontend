"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { isAuthenticated } from "@/utils/api";
import Navbar from "@/components/Navbar";
import api from "@/utils/api";
interface Checkpoint {
  id: number;
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
  remarks?: string;
  start_at: string;
  end_at: string;
  duration: number;
  itineraries: TravelItinerary[];
}

export default function TravelList() {
  const router = useRouter();
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // if (!isAuthenticated()) {
    //   router.push("/login");
    //   return;
    // }

    fetchTravels();
  }, [router]);

  const fetchTravels = async () => {
    try {
      const response = await api.get('/travel-plans');

      const travels = await response.data.data;
      setTravels(travels);
    } catch (error) {
      toast.error('Failed to load travel plans');
      console.error('Error loading travel plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this travel plan?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await api.delete(`/travel-plans/${id}`);

      if (response.status !== 204) {
        throw new Error('Failed to delete travel plan');
      }

      toast.success('Travel plan deleted successfully');
      setTravels(travels.filter(travel => travel.id !== id));
    } catch (error) {
      toast.error('Failed to delete travel plan');
      console.error('Error deleting travel plan:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold gradient-text">
              Your Travel Plans
            </h1>
            <Link href="/travel/create" className="btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create New Plan
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : travels.length === 0 ? (
            <div className="modern-card p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Travel Plans Yet
              </h2>
              <p className="text-gray-600 mb-6">
                You haven&apos;t created any travel plans yet. Start planning your
                next adventure!
              </p>
              <Link href="/travel/create" className="btn-primary inline-block">
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travels.map((travel) => (
                <div key={travel.id} className="modern-card overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 text-white">
                    <h2 className="text-xl font-bold truncate">
                      {travel.title}
                    </h2>
                    <p className="text-blue-100">{travel.destination}</p>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(travel.start_at)} -{" "}
                        {formatDate(travel.end_at)}
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {travel.duration} days
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Itineraries
                      </h3>
                      <div className="text-gray-600 text-sm">
                        {travel.itineraries?.length || 0} days planned
                      </div>
                    </div>

                    {travel.remarks && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {travel.remarks}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                      <Link
                        href={`/travel/${travel.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>

                      <div className="flex space-x-2">
                        <Link
                          href={`/travel/${travel.id}/edit`}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>

                        <button
                          onClick={() => handleDelete(travel.id)}
                          disabled={deleteLoading === travel.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          {deleteLoading === travel.id ? (
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
