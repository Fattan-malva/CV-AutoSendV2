'use client'

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import DesireSection from '@/components/landing/DesireSection'
import Marquee from '@/components/landing/Marquee'
import Pricing from '@/components/landing/Pricing'
import FreeDemo from '@/components/landing/FreeDemo'
import Footer from '@/components/landing/Footer'
import AuthModal from '@/components/landing/AuthModal'
import ConfirmLogoutModal from '@/components/dashboard/ConfirmLogoutModal'

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <>
      <Navbar onOpenAuth={() => setAuthOpen(true)} onOpenLogout={() => setLogoutOpen(true)} />
      <main className="overflow-x-hidden w-full max-w-full">
        <Hero onOpenAuth={() => setAuthOpen(true)} />
        <Features />
        <DesireSection />
        <Marquee />
        <Pricing onOpenAuth={() => setAuthOpen(true)} />
        <FreeDemo onOpenAuth={() => setAuthOpen(true)} />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  )
}
