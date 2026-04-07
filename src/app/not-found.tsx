'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const APP_NAME = 'Ausgutin Sales CRM';
const REDIRECT_PATH = '/login';
const REDIRECT_DELAY_SECONDS = 3;

const Custom404 = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    // Set up the countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Set up the redirect timer
    const redirectTimeout = setTimeout(() => {
      router.push(REDIRECT_PATH);
    }, REDIRECT_DELAY_SECONDS * 1000);

    // Cleanup function
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full text-center bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-12 border border-slate-200/50 transform transition-all duration-500 hover:scale-[1.01]">
        {/* Error Code */}
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 mb-4 animate-pulse">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Page Not Found</h2>

        {/* Message */}
        <p className="text-lg text-slate-600 mb-8">
          Oops! The page you are looking for does not exist or has been moved. It seems you've hit a
          dead end in the {APP_NAME}.
        </p>

        {/* Redirect Message */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl shadow-md mb-8">
          <p className="font-semibold">
            Redirecting to the <span className="font-bold text-blue-900">{REDIRECT_PATH}</span> page
            in <span className="text-xl font-extrabold">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push(REDIRECT_PATH)}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Go to Login Now
        </button>

        {/* Footer/Branding */}
        <p className="mt-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Custom404;
