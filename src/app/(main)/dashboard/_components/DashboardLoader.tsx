export default function DashboardLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gray-100 rounded-2xl shadow-sm border border-gray-200"
        ></div>
      ))}
    </div>
  );
}
