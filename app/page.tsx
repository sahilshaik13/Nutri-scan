'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { AppLoading } from '@/components/app-loading'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('nutriscan-loaded')
    if (hasLoaded) setIsLoading(false)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('nutriscan-loaded', 'true')
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && <AppLoading onLoadingComplete={handleLoadingComplete} />}

      <div className="min-h-svh overflow-x-hidden" style={{ background: '#eaf0eb' }}>

        {/* ─── Header ──────────────────────────────────────── */}
        <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4">
          <nav
            className="flex w-full max-w-5xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300"
            style={{
              background: '#eaf0eb',
              boxShadow: scrolled
                ? '6px 6px 16px #c4ccc5, -6px -6px 16px #ffffff'
                : '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105"
                style={{ boxShadow: '3px 3px 8px #c4ccc5, -3px -3px 8px #ffffff', background: '#eaf0eb' }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight text-[#1a231b]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                NutriScan
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden items-center gap-8 text-sm font-semibold text-[#6b7e6d] md:flex">
              <a href="#how-it-works" className="transition-colors hover:text-[#3ecf66]">How it Works</a>
              <a href="#features" className="transition-colors hover:text-[#3ecf66]">Features</a>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-bold text-[#6b7e6d] transition-colors hover:text-[#3ecf66]"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)',
                  boxShadow: '3px 3px 8px #c4ccc5, -2px -2px 6px #ffffff',
                }}
              >
                Sign Up Free
              </Link>
            </div>
          </nav>
        </header>

        {/* ─── Hero Section ────────────────────────────────── */}
        <Suspense fallback={<div className="min-h-[100vh]" />}>
        <section className="relative flex min-h-[100vh] items-center pt-28 pb-20 px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

              {/* Left: Text content */}
              <div className="animate-fade-up">
                {/* Badge */}
                <div
                  className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2"
                  style={{ boxShadow: 'inset 3px 3px 7px #c0c8c1, inset -3px -3px 7px #f4faf5', background: '#eaf0eb' }}
                >
                  <span className="h-2 w-2 rounded-full bg-[#3ecf66] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#3ecf66]">AI-Powered Nutrition</span>
                </div>

                {/* Headline */}
                <h1
                  className="mb-6 text-5xl font-black leading-[1.05] tracking-tight text-[#1a231b] md:text-[4.5rem]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Eat Smart,<br />
                  <span style={{ color: '#3ecf66' }}>Live Better.</span>
                </h1>

                <p className="mb-10 max-w-md text-lg leading-relaxed text-[#6b7e6d]">
                  Point your camera at any meal and get instant AI-powered nutritional insights. Calories, macros, vitamins — in seconds.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/guest-scan"
                    className="group flex h-14 items-center justify-center gap-3 rounded-2xl px-8 text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)',
                      boxShadow: '5px 5px 12px #becea5, -3px -3px 8px #ffffff',
                    }}
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    Try a Free Scan
                  </Link>

                  <Link
                    href="/auth/login"
                    className="flex h-14 items-center justify-center gap-3 rounded-2xl px-8 text-base font-bold text-[#1a231b] transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{ boxShadow: '5px 5px 12px #c4ccc5, -5px -5px 12px #ffffff', background: '#eaf0eb' }}
                  >
                    Sign In
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-10 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['#a8d5b5', '#7cc99a', '#5bbf82'].map((c, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-[#eaf0eb]" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-[#6b7e6d]">
                    Join <span className="font-bold text-[#1a231b]">50,000+</span> users tracking daily
                  </p>
                </div>
              </div>

              {/* Right: Neumorphic feature card preview */}
              <div className="animate-fade-up delay-300 relative flex justify-center lg:justify-end">
                <div className="animate-float relative w-full max-w-sm">
                  {/* Main card */}
                  <div
                    className="rounded-3xl p-6"
                    style={{ background: '#eaf0eb', boxShadow: '12px 12px 28px #c4ccc5, -12px -12px 28px #ffffff' }}
                  >
                    {/* Food image placeholder */}
                    <div
                      className="relative mb-5 h-48 w-full overflow-hidden rounded-2xl"
                      style={{ boxShadow: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff' }}
                    >
                      <div
                        className="h-full w-full bg-cover bg-center opacity-80 rounded-2xl"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80')" }}
                      />
                      {/* AI badge */}
                      <div
                        className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
                        style={{ background: 'rgba(234,240,235,0.92)', backdropFilter: 'blur(8px)', boxShadow: '2px 2px 6px #c4ccc5' }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3ecf66] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf66]">AI Analyzing…</span>
                      </div>
                    </div>

                    {/* Food name */}
                    <p className="mb-4 text-base font-bold text-[#1a231b]">Mediterranean Bowl</p>

                    {/* Health score ring */}
                    <div className="mb-5 flex items-center gap-4">
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="27" fill="none" stroke="#d5dfd6" strokeWidth="5" />
                          <circle cx="32" cy="32" r="27" fill="none" stroke="#3ecf66" strokeWidth="5"
                            strokeDasharray={`${(87 / 100) * 169.6} 169.6`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-sm font-black text-[#1a231b]">87</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7e6d]">Health Score</p>
                        <p className="text-sm font-bold text-[#3ecf66]">Excellent ✓</p>
                      </div>
                    </div>

                    {/* Macro bars */}
                    {[
                      { label: 'Protein', val: 28, max: 50, pct: 56, color: '#3ecf66' },
                      { label: 'Carbs',   val: 42, max: 80, pct: 52, color: '#f59e0b' },
                      { label: 'Fat',     val: 14, max: 40, pct: 35, color: '#3b82f6' },
                    ].map(m => (
                      <div key={m.label} className="mb-3">
                        <div className="mb-1 flex justify-between text-xs font-semibold">
                          <span className="text-[#6b7e6d]">{m.label}</span>
                          <span className="text-[#1a231b]">{m.val}g</span>
                        </div>
                        <div
                          className="h-2.5 w-full overflow-hidden rounded-full"
                          style={{ boxShadow: 'inset 2px 2px 5px #c4ccc5, inset -2px -2px 5px #ffffff', background: '#eaf0eb' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${m.pct}%`, background: m.color, opacity: 0.85 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Floating badges */}
                  <div
                    className="absolute -right-4 -top-4 rounded-2xl px-3 py-2 text-center"
                    style={{ background: '#eaf0eb', boxShadow: '5px 5px 12px #c4ccc5, -5px -5px 12px #ffffff' }}
                  >
                    <p className="text-lg font-black text-[#1a231b]">480</p>
                    <p className="text-[10px] font-semibold text-[#6b7e6d]">kcal</p>
                  </div>
                  <div
                    className="absolute -bottom-3 -left-4 rounded-2xl px-3 py-2 text-center"
                    style={{ background: '#eaf0eb', boxShadow: '5px 5px 12px #c4ccc5, -5px -5px 12px #ffffff' }}
                  >
                    <p className="text-lg font-black text-[#3ecf66]">28g</p>
                    <p className="text-[10px] font-semibold text-[#6b7e6d]">Protein</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
        </Suspense>

        {/* ─── Stats Banner ─────────────────────────────────── */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div
              className="grid grid-cols-2 gap-4 rounded-3xl p-6 md:grid-cols-4"
              style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}
            >
              {[
                { num: '50K+', label: 'Active Users' },
                { num: '2M+', label: 'Meals Scanned' },
                { num: '98%', label: 'Accuracy Rate' },
                { num: '<2s', label: 'Analysis Time' },
              ].map((s, i) => (
                <div key={i} className="text-center py-2">
                  <p className="text-3xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>{s.num}</p>
                  <p className="mt-1 text-sm font-medium text-[#6b7e6d]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────────── */}
        <Suspense fallback={<div className="min-h-96" />}>
        <section id="how-it-works" className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <span className="mb-3 block text-sm font-extrabold uppercase tracking-[0.3em] text-[#3ecf66]">
                Simple Process
              </span>
              <h2 className="text-4xl font-black tracking-tight text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
                How NutriScan Works
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  num: '01',
                  title: 'Snap or Upload',
                  desc: 'Take a photo of your plate or upload from your gallery. Works with any food and any lighting.',
                  icon: (
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'AI Processing',
                  desc: 'Our neural network identifies ingredients, estimates portions, and calculates macros with 98% accuracy.',
                  icon: (
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'Deep Insights',
                  desc: 'Get an instant breakdown of calories, vitamins, allergens, and personalised health recommendations.',
                  icon: (
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />
                    </svg>
                  ),
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="group rounded-3xl p-7 transition-all duration-300"
                  style={{ background: '#eaf0eb', boxShadow: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '12px 12px 28px #bec7bf, -12px -12px 28px #ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff')}
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                    style={{ boxShadow: 'inset 3px 3px 8px #c4ccc5, inset -3px -3px 8px #ffffff', background: '#eaf0eb' }}
                  >
                    {step.icon}
                  </div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-4xl font-black text-[#3ecf66] opacity-20" style={{ fontFamily: 'Playfair Display, serif' }}>{step.num}</span>
                    <h3 className="text-lg font-bold text-[#1a231b]">{step.title}</h3>
                  </div>
                  <p className="leading-relaxed text-[#6b7e6d]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </Suspense>

        {/* ─── Features Section ─────────────────────────────── */}
        <Suspense fallback={<div className="min-h-80" />}>
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <span className="mb-3 block text-sm font-extrabold uppercase tracking-[0.3em] text-[#3ecf66]">Features</span>
              <h2 className="text-4xl font-black tracking-tight text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Everything You Need
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
                  title: 'Calorie Tracking',
                  desc: 'Accurate counts for any meal',
                },
                {
                  icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
                  title: 'Macro Analysis',
                  desc: 'Protein, carbs & fat breakdown',
                },
                {
                  icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
                  title: 'Health Score',
                  desc: 'Instant 0–100 health rating',
                },
                {
                  icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                  title: 'Scan History',
                  desc: 'Track your meals over time',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group rounded-2xl p-6 transition-all duration-300 cursor-default"
                  style={{ background: '#eaf0eb', boxShadow: '6px 6px 16px #c4ccc5, -6px -6px 16px #ffffff' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '10px 10px 22px #bec7bf, -10px -10px 22px #ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '6px 6px 16px #c4ccc5, -6px -6px 16px #ffffff')}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: '#eaf0eb', boxShadow: 'inset 3px 3px 7px #c4ccc5, inset -3px -3px 7px #ffffff' }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="mb-1.5 font-bold text-[#1a231b]">{f.title}</h3>
                  <p className="text-sm text-[#6b7e6d]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </Suspense>

        {/* ─── CTA Section ──────────────────────────────────── */}
        <Suspense fallback={<div className="min-h-80" />}>
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div
              className="relative overflow-hidden rounded-3xl p-10 text-center md:p-16"
              style={{ background: '#eaf0eb', boxShadow: '12px 12px 30px #c4ccc5, -12px -12px 30px #ffffff' }}
            >
              {/* Decorative rings */}
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 animate-pulse-ring"
                style={{ background: 'radial-gradient(circle, #3ecf66 0%, transparent 70%)' }} />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-20 animate-pulse-ring delay-500"
                style={{ background: 'radial-gradient(circle, #3ecf66 0%, transparent 70%)' }} />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: '#eaf0eb', boxShadow: '6px 6px 14px #c4ccc5, -6px -6px 14px #ffffff' }}
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-[#1a231b] md:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Ready to eat smarter?
                </h2>
                <p className="max-w-md text-base text-[#6b7e6d] md:text-lg">
                  Join over 50,000 health-conscious users tracking their nutrition effortlessly with AI.
                </p>

                <Link
                  href="/auth/sign-up"
                  className="rounded-2xl px-10 py-4 text-lg font-extrabold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)',
                    boxShadow: '5px 5px 14px #becea5, -3px -3px 8px #ffffff',
                  }}
                >
                  Get Started Free
                </Link>
                <p className="text-xs text-[#6b7e6d]">No credit card required · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>
        </Suspense>

        {/* ─── Footer ───────────────────────────────────────── */}
        <footer className="border-t border-[#d5dfd6] px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: '#eaf0eb', boxShadow: '3px 3px 7px #c4ccc5, -3px -3px 7px #ffffff' }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#3ecf66" strokeWidth="2.2">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <span className="text-base font-black text-[#1a231b]">NutriScan</span>
              </div>
              <div className="flex gap-8 text-sm font-semibold text-[#6b7e6d]">
                {['Privacy', 'Terms', 'Support'].map(l => (
                  <a key={l} href="#" className="transition-colors hover:text-[#3ecf66]">{l}</a>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-[#6b7e6d]">
              © 2024 NutriScan AI. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
