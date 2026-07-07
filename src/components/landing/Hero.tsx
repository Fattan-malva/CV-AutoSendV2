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
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } }) // Upgraded to expo for cinematic mass
      
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
            <span className="block overflow-hidden pb-4">
              <span className="hero-line-inner flex flex-wrap items-center gap-x-4 gap-y-2 origin-bottom">
                {/* Embedded Inline Pill */}
                <div className="hero-inline-pill relative w-[120px] sm:w-[160px] h-[60px] sm:h-[80px] rounded-full p-1 bg-surface border border-border backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] -mt-2">
                  <div 
                    className="w-full h-full rounded-[calc(999px-4px)] bg-cover bg-center opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{ backgroundImage: 'url(https://picsum.photos/seed/resume/400/200)' }}
                  />
                </div>
                {secondHalf}
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

            {/* Secondary Action: Ghost Glass Pill */}
            <button
              onClick={onOpenAuth}
              className="hero-cta group relative flex items-center gap-3 px-7 py-4 rounded-full bg-surface border border-border text-muted hover:bg-card-hover hover:text-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <span className="text-sm tracking-wide">{t.landing.login}</span>
            </button>
          </div>
        </div>

        {/* Right Abstract Visualizer (col-span-5) */}
        <div className="lg:col-span-5 w-full hidden md:block perspective-[2000px]">
          <div className="hero-visualizer rotate-y-[-12deg] rotate-x-[4deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]">
            
            {/* Outer Shell (Double-Bezel Architecture) */}
            <div className="p-2 rounded-[2.5rem] bg-surface ring-1 ring-border shadow-2xl backdrop-blur-3xl">
              
              {/* Inner Core */}
              <div className="relative w-full h-[480px] rounded-[calc(2.5rem-0.5rem)] bg-gradient-to-b from-[#111] to-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col p-6">
                
                {/* Mock UI Header */}
                <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>

                {/* Brand Content */}
                <div className="space-y-3 w-full flex-1 relative z-10 flex flex-col justify-center">
                  <div className="text-xl font-serif text-white/95 font-semibold tracking-tight">CV-Auto Send</div>
                  <div className="text-xs text-white/40 font-light tracking-wide">AI-Powered Application Engine</div>
                  <div className="mt-4 space-y-2.5">
                    <div className="w-full h-2 rounded-full bg-white/6" />
                    <div className="w-[85%] h-2 rounded-full bg-white/6" />
                    <div className="w-[60%] h-2 rounded-full bg-white/6" />
                  </div>
                </div>

                {/* AI Scanning Beam (CSS Animated) */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-accent/10 to-accent/30 blur-xl animate-[scan_3s_ease-in-out_infinite_alternate]" />
                <div className="absolute inset-x-0 top-32 h-[1px] bg-accent/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_3s_ease-in-out_infinite_alternate]" />

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}