function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3">
      <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="h-8 w-20 animate-pulse rounded bg-gray-800" />
        <div className="h-4 w-28 animate-pulse rounded bg-gray-800" />
      </div>
    </div>
  );
}

function SkeletonRow({ index }) {
  return (
    <tr
      key={index}
      className="bg-gray-950/30"
    >
      <td className="px-5 py-4">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-900" />
      </td>
      <td className="px-5 py-4">
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-800" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-10 animate-pulse rounded bg-gray-800" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-3 w-36 animate-pulse rounded bg-gray-900" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
      </td>
    </tr>
  );
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-transparent pb-8">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-gray-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-violet-300">
              LogicEye Dashboard
            </p>
            <h1 className="mt-1.5 text-xl font-semibold text-white md:text-[1.7rem]">
              VMS Installation Tracker
            </h1>
          </div>

          <div className="h-11 w-full max-w-md animate-pulse rounded-xl border border-gray-800 bg-gray-900/80" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300">
                Installations
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Loading dashboard data
              </h2>
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-left">
              <thead className="bg-gray-950/80">
                <tr className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                  <th className="px-5 py-3 font-medium">Installation</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Cameras</th>
                  <th className="px-5 py-3 font-medium">Last Ping</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkeletonRow key={index} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
