import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/']
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'Applebot-Extended', 'Bytespider', 'Diffbot', 'SemrushBot'],
        allow: '/',
        disallow: []
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
