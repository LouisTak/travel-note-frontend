import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAuthenticated, logout } from '@/utils/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const auth = isAuthenticated();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {auth && (
        <header className="bg-blue-600 text-white shadow">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">
                Travel Planner
              </Link>
              <nav className="flex space-x-4">
                <Link 
                  href="/" 
                  className={`px-3 py-1 rounded ${router.pathname === '/' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  Home
                </Link>
                <Link 
                  href="/planner" 
                  className={`px-3 py-1 rounded ${router.pathname === '/planner' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  Plan Trip
                </Link>
                <Link 
                  href="/suggestions" 
                  className={`px-3 py-1 rounded ${router.pathname === '/suggestions' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  Get Suggestions
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-3 text-center text-gray-600">
          <p>© {new Date().getFullYear()} AI Travel Planner</p>
        </div>
      </footer>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default Layout; 