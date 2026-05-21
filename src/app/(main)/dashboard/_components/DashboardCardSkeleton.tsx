export default function DashboardCardSkeleton() {
  return (
    <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-30 animate-pulse">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
      <div className="pl-4 pr-5 py-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200" />
        </div>
        <div className="h-7 w-1/3 rounded-md bg-slate-200" />
        <div className="mt-3 space-y-1.5">
          <div className="h-3.5 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
