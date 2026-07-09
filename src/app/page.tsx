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

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the AI CV Builder work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ceefy\'s AI CV Builder helps you create ATS-friendly professional resumes. Just input your experience, and AI polishes bullet points, suggests improvements, and formats your CV for maximum ATS compatibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I auto-send job applications with Ceefy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload a job brochure or vacancy PDF, Ceefy\'s AI extracts company details and position info, writes a tailored application email, and sends your CV with one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Ceefy free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ceefy offers a free plan with 3 analyzes and 3 sends. Paid plans start at $5/month for more usage. No credit card required to start.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes a CV ATS-friendly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An ATS-friendly CV uses clean formatting, standard section headings, keyword-optimized content, and machine-readable layouts. Ceefy\'s CV Builder provides pre-built templates designed specifically for ATS parsing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I build a CV and apply to jobs in different languages?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Ceefy supports both English and Indonesian. You can build your CV and write application emails in either language, making it ideal for local and international job searches.',
        },
      },
    ],
  }

  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to build a CV and auto-send job applications with Ceefy',
    description: 'Step-by-step guide to creating an ATS-friendly CV and sending automated job applications.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Build your CV',
        text: 'Use Ceefy\'s AI CV Builder to create a professional ATS-friendly resume. Fill in your personal info, experience, education, and skills with AI assistance.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload a job brochure',
        text: 'Upload a photo or PDF of a job vacancy brochure. Ceefy supports multiple file formats up to 10MB each.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'AI analyzes the brochure',
        text: 'Gemini AI extracts the company name, position, and key requirements from the brochure, then writes a tailored application email.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review and send',
        text: 'Review the AI-generated email, make any edits, and click send. Your CV and application email are sent to the target email address instantly.',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
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
