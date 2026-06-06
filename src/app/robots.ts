import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/dashboard/' },
      { userAgent: '*', disallow: '/api/' },
    ],
    sitemap: 'https://cv-auto-send.vercel.app/sitemap.xml',
  }
}
