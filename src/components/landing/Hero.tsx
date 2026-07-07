'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowRight, Sparkle } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

interface HeroProps {
  onOpenAuth: () => void
}

export default function Hero({ onOpenAuth }: HeroProps) {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)

  // Splitting title logic safely
  const titleWords = t.landing.heroTitle.split(' ')
  const halfIdx = Math.ceil(titleWords.length / 2)
  const firstHalf = titleWords.slice(0, halfIdx).join(' ')
  const secondHalf = titleWords.slice(halfIdx).join(' ')

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2 }
      )
        .fromTo(
          '.hero-line-inner',
          { yPercent: 120, opacity: 0, rotateX: 12 },
          { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.1 },
          '-=0.9'
        )
        .fromTo(
          '.hero-inline-pill',
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.7)' },
          '-=1.1'
        )
        .fromTo(
          '.hero-sub',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.2 },
          '-=1'
        )
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          '-=1'
        )
        .fromTo(
          '.hero-visualizer',
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.8 },
          '-=1.4'
        )
    },
    { scope: root }
  )

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={root}
      className="relative min-h-[100dvh] w-full bg-background flex items-center overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32 px-4 sm:px-8 selection:bg-foreground/20 selection:text-foreground"
    >
      {/* Ethereal Glass Background Mesh (Fixed/GPU Safe) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[160px] mix-blend-screen will-change-transform" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/5 blur-[160px] mix-blend-screen will-change-transform" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      {/* Editorial Split Layout */}
      <div className="max-w-[1440px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

        {/* Left Typography Block (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-start w-full">

          {/* Haptic Eyebrow */}
          <div className="hero-eyebrow flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-surface border border-border backdrop-blur-md">
            <Sparkle size={12} weight="fill" className="text-accent" />
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium mt-[1px]">
              Autonomous Submissions
            </span>
          </div>

          <h1 className="font-serif text-foreground leading-[0.88] tracking-tight text-[clamp(3.5rem,6.5vw,7.5rem)]">
            <span className="block overflow-hidden pb-2">
              <span className="hero-line-inner block origin-bottom">
                {firstHalf}
              </span>
            </span>
            <span className="block pb-4">
              <span className="hero-line-inner flex flex-wrap items-center gap-x-4 gap-y-2 origin-bottom">
                {/* Embedded Inline Pill - sekarang tidak terpotong */}
                <span className="hero-inline-pill inline-flex items-center justify-center flex-shrink-0">
                  <img
                    src="/icons.png"
                    alt="CV AutoSend"
                    className="w-14 h-14 sm:w-24 sm:h-24 object-contain transition-transform duration-700 hover:scale-110"
                  />
                </span>
                <span className="inline-block leading-[1.1]">{secondHalf}</span>
              </span>
            </span>
          </h1>

          <p className="hero-sub mt-8 text-base sm:text-xl text-muted max-w-xl leading-relaxed font-light">
            {t.landing.heroSub}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            {/* Primary Action: Double-Bezel CTA with Inner Island Button */}
            <button
              onClick={scrollToDemo}
              className="hero-cta group relative flex items-center gap-6 pl-7 pr-2 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-95 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <span className="text-sm tracking-wide">{t.landing.cta}</span>
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight size={16} weight="regular" className="text-background" />
              </div>
            </button>

            {/* Secondary Action: Ghost Glass Pill - Login Button with Google SVG */}
            <button
              onClick={onOpenAuth}
              className="hero-cta group relative flex items-center gap-3 px-7 py-4 rounded-full bg-surface border border-border text-muted hover:bg-card-hover hover:text-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm tracking-wide">{t.landing.login}</span>
            </button>
          </div>
        </div>

        {/* Right Abstract Visualizer (col-span-5) */}
        <div className="lg:col-span-5 w-full hidden md:flex items-center justify-center perspective-[2000px]">
          <div className="relative group w-full max-w-lg rotate-y-[-12deg] rotate-x-[4deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">

            {/* Subtle Outer Glow / Halo Effect on Hover */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-accent/0 via-accent/20 to-accent/0 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Outer Shell (Double-Bezel Architecture) */}
            <div className="relative p-2 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 ring-1 ring-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-3xl">

              {/* Inner Core */}
              <div className="relative w-full h-[500px] rounded-[calc(2.5rem-0.5rem)] bg-[#0A0A0B] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col p-6">

                {/* Futuristic Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Mock UI Header (Traffic Lights) */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
                  </div>
                  <div className="flex gap-1.5 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Structured CV Skeleton Content */}
                <div className="space-y-6 w-full flex-1 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700">

                  {/* Header Profile Section */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border border-white/20 bg-gradient-to-tr from-white/5 to-white/10 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center">
                        <div className="w-1/2 h-3 rounded-full bg-white/20" />
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                          98% MATCH
                        </span>
                      </div>
                      <div className="w-1/3 h-2 rounded-full bg-white/10" />
                    </div>
                  </div>

                  {/* Work Experience Blocks */}
                  <div className="space-y-3">
                    <div className="w-32 h-3 rounded-full bg-white/10 mb-4" />
                    <div className="w-full h-2 rounded-full bg-white/5" />
                    <div className="w-[85%] h-2 rounded-full bg-white/5" />
                    <div className="w-[90%] h-2 rounded-full bg-white/5" />
                  </div>

                  {/* Skill Tags */}
                  <div className="flex gap-2 pt-2">
                    <div className="w-16 h-5 rounded-md bg-white/5 border border-white/10" />
                    <div className="w-20 h-5 rounded-md bg-white/5 border border-white/10" />
                    <div className="w-14 h-5 rounded-md bg-white/5 border border-white/10" />
                  </div>

                  {/* Education Block */}
                  <div className="space-y-3 pt-2">
                    <div className="w-24 h-3 rounded-full bg-white/10 mb-4" />
                    <div className="w-[95%] h-2 rounded-full bg-white/5" />
                    <div className="w-2/3 h-2 rounded-full bg-white/5" />
                  </div>
                </div>

                {/* AI Scanning Beam Effect */}
                <div className="absolute inset-x-0 h-64 top-0 bg-gradient-to-b from-transparent via-accent/10 to-accent/30 blur-md animate-scanner-beam pointer-events-none" />

                {/* Sharp Laser Line */}
                <div className="absolute inset-x-0 h-[2px] top-0 bg-accent shadow-[0_0_20px_var(--tw-shadow-color)] shadow-accent animate-scanner-line pointer-events-none" />

                {/* Floating Status Badge (Glassmorphism) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-2xl transform transition-transform duration-700 group-hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-[0_0_10px_currentColor]"></span>
                      </div>
                      <div>
                        <div className="text-white text-xs font-bold tracking-widest uppercase mb-1">
                          AI Engine Active
                        </div>
                        <div className="text-accent text-[10px] font-mono tracking-wider opacity-80">
                          ⚡ Extracting skills...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}