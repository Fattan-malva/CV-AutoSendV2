import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/dashboard/' },
      { userAgent: '*', disallow: '/api/' },
    ],
    sitemap: 'https://ceefy.mallvaa.xyz/sitemap.xml',
  }
}
