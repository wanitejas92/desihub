export default function Loading() {
  return (
    <div className="max-w-content mx-auto px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="bg-bg-sunken h-40 animate-pulse rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-bg-sunken aspect-[4/3] rounded-lg" />
            <div className="bg-bg-sunken mt-3 h-4 w-3/4 rounded" />
            <div className="bg-bg-sunken mt-2 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
