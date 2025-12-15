import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const LANGUAGES = ['in', 'en', 'ja', 'zhHans', 'zh', 'es', 'de', 'fr', 'pt', 'ar', 'th', 'tl', 'ko']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host')
  const SITE_URL = host ? `https://${host}` : (process.env.NEXT_PUBLIC_SITE_URL)

  return LANGUAGES.map(lang => ({
    url: `${SITE_URL}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }))
}
