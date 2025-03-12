"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import api, { isAuthenticated } from "@/utils/api";
import Navbar from "@/components/Navbar";

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
  date: string;
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

export default function TravelDetail() {
  const router = useRouter();
  const params = useParams();
  const travelId = params?.id as string;

  const [travel, setTravel] = useState<Travel | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchTravel();
  }, [travelId, router]);

  const fetchTravel = async () => {
    try {
      const response = await api.get(`/travel-plans/${travelId}`);

      if (response.status !== 200) {
        throw new Error('Failed to fetch travel plan');
      }

      const data = await response.data;
      data.duration = calculateDuration(data.start_at, data.end_at);
      setTravel(data);
      if (data.itineraries && data.itineraries.length > 0) {
        setActiveDay(data.itineraries[0].day_number);
      }
    } catch (error) {
      toast.error('Failed to load travel plan');
      console.error('Error loading travel plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActiveItinerary = () => {
    if (!travel || !travel.itineraries) return null;
    return travel.itineraries.find(
      (itinerary) => itinerary.day_number === activeDay
    );
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
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

  if (!travel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="modern-card p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Travel Plan Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The travel plan you&apos;re looking for doesn&apos;t exist or
                you don&apos;t have permission to view it.
              </p>
              <Link href="/travel" className="btn-primary inline-block">
                Back to Travel Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeItinerary = getActiveItinerary();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Link
                  href="/travel"
                  className="hover:text-blue-600 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Travel Plans
                </Link>
              </div>
              <h1 className="text-3xl font-bold gradient-text">
                {travel.title}
              </h1>
              <div className="text-gray-600 mt-1">{travel.destination}</div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/travel/${travel.id}/itineraries`}
                className="btn-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Manage Itineraries
              </Link>
              <Link
                href={`/travel/${travel.id}/edit`}
                className="btn-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
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
                Edit Plan
              </Link>
              <button onClick={() => window.print()} className="btn-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar with trip info */}
            <div className="lg:col-span-1">
              <div className="modern-card p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Trip Information</h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Dates</div>
                    <div className="font-medium">
                      {formatDate(travel.start_at)} -{" "}
                      {formatDate(travel.end_at)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Duration</div>
                    <div className="font-medium">{travel.duration} days</div>
                  </div>

                  {travel.remarks && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Remarks</div>
                      <div className="text-gray-800">{travel.remarks}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modern-card p-5">
                <h2 className="text-lg font-semibold mb-4">
                  Daily Itineraries
                </h2>

                <div className="space-y-2">
                  {travel.itineraries?.map((itinerary) => (
                    <button
                      key={itinerary.day_number}
                      onClick={() => setActiveDay(itinerary.day_number)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition ${
                        activeDay === itinerary.day_number
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">
                        Day {itinerary.day_number}
                      </div>
                      <div className="text-sm truncate">
                        {itinerary.description ||
                          `Day ${itinerary.day_number} of your trip`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              {activeItinerary ? (
                <div className="modern-card p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Day {activeItinerary.day_number}
                    </h2>
                    <p className="text-gray-600">
                      {activeItinerary.description ||
                        `Day ${activeItinerary.day_number} of your trip to ${travel.destination}`}
                    </p>

                    {activeItinerary.reminder && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-gray-700">
                            {activeItinerary.reminder}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Checkpoints</h3>

                    {activeItinerary.checkpoints &&
                    activeItinerary.checkpoints.length > 0 ? (
                      <div className="space-y-6">
                        {activeItinerary.checkpoints.map(
                          (checkpoint, index) => (
                            <div
                              key={checkpoint.id || index}
                              className="border-b pb-6 last:border-b-0 last:pb-0"
                            >
                              <div className="flex flex-col md:flex-row md:items-start">
                                {checkpoint.time && (
                                  <div className="font-semibold text-blue-600 md:w-1/5 mb-2 md:mb-0">
                                    {checkpoint.time}
                                  </div>
                                )}

                                <div className="md:w-4/5">
                                  <h4 className="font-semibold text-gray-800 mb-1">
                                    {checkpoint.location}
                                  </h4>
                                  <p className="text-gray-700 mb-2">
                                    {checkpoint.activity}
                                  </p>

                                  {checkpoint.tips && (
                                    <div className="bg-gray-50 rounded p-3 mt-2 text-sm text-gray-700">
                                      <span className="font-medium">Tip:</span>{" "}
                                      {checkpoint.tips}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No checkpoints added for this day.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="modern-card p-8 text-center">
                  <div className="text-gray-500">
                    Select a day from the sidebar to view its itinerary.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
