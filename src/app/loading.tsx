'use client';

const APP_NAME = 'Ausgutin Sales CRM';

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="text-center">
        {/* Application Name */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse">
          {APP_NAME}
        </h1>

        {/* Custom Loading Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer Ring - Pulsating Effect */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-blue-500 animate-spin-slow" />

          {/* Inner Circle - Static Background */}
          <div className="absolute inset-2 rounded-full bg-white shadow-xl flex items-center justify-center">
            {/* Small Dot - Secondary Spinner */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-ping-slow" />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-xl font-semibold text-slate-700 mb-2">Loading Data...</p>
        <p className="text-sm text-slate-500">Please wait while we prepare your dashboard.</p>
      </div>
    </div>
  );
};

export default LoadingPage;
