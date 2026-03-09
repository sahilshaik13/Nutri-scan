const neu = {
  raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff',
}

function Shimmer({ delay = '0s' }: { delay?: string }) {
  return <div className="shimmer-effect" style={{ animationDelay: delay }} />
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: '#eaf0eb' }}>
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .shimmer-effect {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* ── Header skeleton ──────────────────────────── */}
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div
          className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-2xl px-4"
          style={{ background: '#eaf0eb', boxShadow: neu.sm }}
        >
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-[#dde6de]"><Shimmer /></div>
            <div className="relative h-4 w-24 overflow-hidden rounded-md bg-[#dde6de]"><Shimmer delay="0.1s" /></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-20 overflow-hidden rounded-xl bg-[#dde6de]"><Shimmer delay="0.2s" /></div>
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-[#dde6de]"><Shimmer delay="0.3s" /></div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5">

        {/* ── Welcome row skeleton ───────────────────── */}
        <div className="mb-6">
          <div className="relative h-8 w-52 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer /></div>
          <div className="relative mt-2 h-4 w-64 overflow-hidden rounded-md bg-[#dde6de]"><Shimmer delay="0.1s" /></div>
        </div>

        {/* ── Stat Cards skeleton ────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Calories card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <div className="relative mb-2 h-3 w-24 overflow-hidden rounded bg-[#dde6de]"><Shimmer /></div>
            <div className="relative h-9 w-28 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer delay="0.1s" /></div>
            <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#dde6de]"><Shimmer delay="0.2s" /></div>
            <div className="relative mt-1.5 h-2.5 w-28 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.3s" /></div>
          </div>

          {/* Health Score card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <div className="relative mb-2 h-3 w-28 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.2s" /></div>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#dde6de]"><Shimmer delay="0.3s" /></div>
              <div>
                <div className="relative h-8 w-20 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer delay="0.4s" /></div>
                <div className="relative mt-1.5 h-3 w-16 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.5s" /></div>
              </div>
            </div>
          </div>

          {/* Total Scans card */}
          <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <div className="relative mb-2 h-3 w-20 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.4s" /></div>
            <div className="relative h-9 w-14 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer delay="0.5s" /></div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer delay="0.6s" /></div>
              <div className="relative h-3 w-14 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.7s" /></div>
            </div>
          </div>
        </div>

        {/* ── Scan Grid skeleton ─────────────────────── */}
        <div className="rounded-3xl p-5" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="relative h-6 w-32 overflow-hidden rounded-lg bg-[#dde6de]"><Shimmer /></div>
            <div className="relative h-4 w-16 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay="0.1s" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-3"
                style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              >
                <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#dde6de]">
                  <Shimmer delay={`${i * 0.15}s`} />
                </div>
                <div className="px-1 pb-1">
                  <div className="relative h-4 w-3/4 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay={`${i * 0.15 + 0.1}s`} /></div>
                  <div className="relative mt-1.5 h-3 w-1/2 overflow-hidden rounded bg-[#dde6de]"><Shimmer delay={`${i * 0.15 + 0.2}s`} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
