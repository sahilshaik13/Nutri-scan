import { Skeleton } from '@/components/ui/skeleton'

const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>

      {/* ── Header skeleton ──────────────────────────── */}
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div
          className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-2xl px-4"
          style={{ background: '#eaf0eb', boxShadow: neu.sm }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl bg-[#d5dfd6]" />
            <Skeleton className="h-4 w-24 rounded-md bg-[#d5dfd6]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-xl bg-[#d5dfd6]" />
            <Skeleton className="h-9 w-9 rounded-xl bg-[#d5dfd6]" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5">

        {/* ── Welcome row skeleton ───────────────────── */}
        <div className="mb-6">
          <Skeleton className="h-8 w-52 rounded-lg bg-[#d5dfd6]" />
          <Skeleton className="mt-2 h-4 w-64 rounded-md bg-[#d5dfd6]" />
        </div>

        {/* ── Stat Cards skeleton ────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Calories card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <Skeleton className="mb-2 h-3 w-24 rounded bg-[#d5dfd6]" />
            <Skeleton className="h-9 w-28 rounded-lg bg-[#d5dfd6]" />
            <Skeleton className="mt-3 h-1.5 w-full rounded-full bg-[#d5dfd6]" />
            <Skeleton className="mt-1.5 h-2.5 w-28 rounded bg-[#d5dfd6]" />
          </div>

          {/* Health Score card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <Skeleton className="mb-2 h-3 w-28 rounded bg-[#d5dfd6]" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-full bg-[#d5dfd6]" />
              <div>
                <Skeleton className="h-8 w-20 rounded-lg bg-[#d5dfd6]" />
                <Skeleton className="mt-1.5 h-3 w-16 rounded bg-[#d5dfd6]" />
              </div>
            </div>
          </div>

          {/* Total Scans card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <Skeleton className="mb-2 h-3 w-20 rounded bg-[#d5dfd6]" />
            <Skeleton className="h-9 w-14 rounded-lg bg-[#d5dfd6]" />
            <div className="mt-3 flex items-center gap-1.5">
              <Skeleton className="h-7 w-7 rounded-lg bg-[#d5dfd6]" />
              <Skeleton className="h-3 w-14 rounded bg-[#d5dfd6]" />
            </div>
          </div>
        </div>

        {/* ── Scan Grid skeleton ─────────────────────── */}
        <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-lg bg-[#d5dfd6]" />
            <Skeleton className="h-4 w-16 rounded bg-[#d5dfd6]" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-3"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              >
                <Skeleton
                  className="mb-3 aspect-[4/3] w-full rounded-xl bg-[#d5dfd6]"
                />
                <div className="px-1 pb-1">
                  <Skeleton className="h-4 w-3/4 rounded bg-[#d5dfd6]" />
                  <Skeleton className="mt-1.5 h-3 w-1/2 rounded bg-[#d5dfd6]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
