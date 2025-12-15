import React, { Suspense } from "react"
import { Metadata } from "next"
import WatchPlayer from "../../player"
import StructuredData from "../../structured-data"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE!

const ID_SUFFIXES = ["Premium Unlocked", "Full Episode", "Full Bahasa Indonesia", "Episode Lengkap", "Tanpa Iklan"]
const EN_SUFFIXES = ["Premium Unlocked", "Full Episode", "Ad-Free", "Complete Series", "Complete Episodes"]
const LANG_CONFIG: Record<string, { prefix: string; suffix: string | string[]; keyword: string }> = {
  in: { prefix: "Nonton", suffix: ID_SUFFIXES, keyword: "nonton" },
  en: { prefix: "Watch", suffix: EN_SUFFIXES, keyword: "watch" }
}

function getSuffix(suffix: string | string[]): string {
  return Array.isArray(suffix) ? suffix[Math.floor(Math.random() * suffix.length)] : suffix
}

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ bookId: string; index: string }>,
  searchParams: Promise<{ lang?: string }> 
}): Promise<Metadata> {
  const { bookId, index } = await params
  const { lang = "in" } = await searchParams
  const langConfig = LANG_CONFIG[lang] || LANG_CONFIG.in
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonicalUrl = `${baseUrl}/watch/${bookId}/0`
  const episodeNumber = parseInt(index) + 1

  try {
    const res = await fetch(`${API_BASE_URL}/api/chapters/detail/${bookId}?lang=${lang}`, { cache: "no-store" })
    const json = await res.json()

    if (json.success && json.data) {
      const { bookName, introduction, tags, cover } = json.data
      const title = `${langConfig.prefix} ${bookName} ${getSuffix(langConfig.suffix)} - Episode ${episodeNumber}`
      const description = introduction || ""
      const desc = description.length > 155 ? description.substring(0, 152) + "..." : description

      return {
        title,
        description: desc,
        keywords: `${tags?.join(", ") || ""}, ${langConfig.keyword} ${bookName}, drama, streaming`,
        alternates: { canonical: canonicalUrl },
        robots: { index: true, follow: true },
        openGraph: { title, description: desc, type: "video.other", url: canonicalUrl, images: cover ? [{ url: cover }] : [] },
        twitter: { card: "summary_large_image", title, description: desc, images: cover ? [cover] : [] }
      }
    }
  } catch (e) {}

  return {
    title: `${langConfig.prefix} Drama ${getSuffix(langConfig.suffix)}`,
    description: "Watch your favorite drama for free",
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true }
  }
}

export default async function WatchDynamicPage({
  params,
  searchParams
}: {
  params: Promise<{ bookId: string; index: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { bookId } = await params
  const { lang = "in" } = await searchParams

  let schemaData = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/chapters/detail/${bookId}?lang=${lang}`, { cache: "no-store" })
    const json = await res.json()
    if (json.success && json.data) schemaData = json.data
  } catch (e) {}

  return (
    <>
      {schemaData && (
        <StructuredData
          bookName={schemaData.bookName}
          description={schemaData.description}
          cover={schemaData.cover}
          bookId={bookId}
          tags={schemaData.tags}
          episodeCount={schemaData.episodeCount}
        />
      )}
      <Suspense fallback={<div className="bg-black h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin"/></div>}>
        <WatchPlayer />
      </Suspense>
    </>
  )
}
