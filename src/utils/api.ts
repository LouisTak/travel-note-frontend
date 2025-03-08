import axios from 'axios';
import Cookies from 'js-cookie';

// Base API URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add token to requests
api.interceptors.request.use((config) => {
  // Don't add token for login and register endpoints
  if (config.url && ['/users/login', '/users/register'].includes(config.url)) {
    return config;
  }

  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Redirect to login if token is missing (except for public routes)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

interface PlanData {
  destination: string;
  duration: number;  // explicitly typing as number
  interests?: string;
  start_date?: string;
  preferences?: string[];
  budget?: number;
}

interface TravelPlan {
  destination: string;
  duration: number;
  plan: {
    days: Array<{
      day: number;
      date?: string;
      activities: Array<{
        time: string;
        location: string;
        activity: string;
        tips?: string;
      }>;
    }>;
    summary: string;
    tips: string[];
  };
}

interface UpdateProfileData {
  nickname?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Authentication APIs
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/users/login', { email, password });
    if (response.data.access_token) {
      Cookies.set('token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: {
  email: string;
  username: string;
  nickname?: string;
  password: string;
}) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileData) => {
  try {
    const response = await api.put('/users/profile', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Travel planner APIs
export const generateTravelPlan = async (planData: PlanData): Promise<TravelPlan> => {
  try {
    // Ensure duration is a number before sending
    const data = {
      ...planData,
      duration: Number(planData.duration)
    };
    
    const response = await api.post('/ai/plan', data);
    
    // Validate response structure
    if (!response.data || !response.data.destination || !response.data.plan) {
      throw new Error('Invalid response structure from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error generating travel plan:', error);
    throw error;
  }
};

export const getTravelSuggestions = async (data: {
  destination: string;
  query: string;
}) => {
  try {
    const response = await api.post('/ai/suggestions', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!Cookies.get('token');
};

export const logout = () => {
  Cookies.remove('token');
};

export default api; 