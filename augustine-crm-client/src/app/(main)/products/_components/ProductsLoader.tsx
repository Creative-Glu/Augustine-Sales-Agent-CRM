export default function ProductsLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
          <div className="space-y-3">
            {/* Table header skeleton */}
            <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-2">
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
    </div>
  );
}

