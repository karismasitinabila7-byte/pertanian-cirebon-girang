export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-emerald-100 rounded-full" />
          <div className="h-8 w-72 sm:w-96 bg-gray-200 rounded-xl" />
          <div className="h-4 w-60 sm:w-80 bg-gray-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-emerald-100/60 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
            </div>
            <div className="h-7 w-28 bg-gray-200 rounded-lg" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area / Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-8 w-36 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-28 bg-gray-100 rounded hidden sm:block" />
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
              <div className="h-4 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
