import React, { ReactNode } from 'react';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">AI Travel Planner</h2>
              <p className="text-gray-400">Plan smarter, travel better</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="/planner" className="text-gray-400 hover:text-white transition">Plan Trip</Link>
              <Link href="/suggestions" className="text-gray-400 hover:text-white transition">Get Advice</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} AI Travel Planner. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white mx-2 transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white mx-2 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 