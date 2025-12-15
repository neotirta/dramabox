import React, { Suspense } from "react"
import { Metadata } from "next"
import WatchPlayer from "@/app/watch/player"
import StructuredData from "@/app/watch/structured-data"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE!

const SUFFIXES: Record<string, string[]> = {
  in: ["Premium Unlocked", "Full Episode", "Full Bahasa Indonesia", "Episode Lengkap", "Tanpa Iklan"],
  en: ["Premium Unlocked", "Full Episode", "Ad-Free", "Complete Series", "Complete Episodes"],
  ja: ["プレミアム解除", "全エピソード", "広告なし", "完全版"],
  zhHans: ["高级解锁", "全集", "无广告", "完整版"],
  zh: ["高級解鎖", "全集", "無廣告", "完整版"],
  es: ["Premium Desbloqueado", "Episodio Completo", "Sin Anuncios"],
  de: ["Premium Freigeschaltet", "Vollständige Folge", "Werbefrei"],
  fr: ["Premium Débloqué", "Épisode Complet", "Sans Publicité"],
  pt: ["Premium Desbloqueado", "Episódio Completo", "Sem Anúncios"],
  ar: ["بريميوم مفتوح", "حلقة كاملة", "بدون إعلانات"],
  th: ["ปลดล็อคพรีเมียม", "ตอนเต็ม", "ไม่มีโฆษณา"],
  tl: ["Premium Unlocked", "Buong Episode", "Walang Ads"]
}

const PREFIXES: Record<string, string> = {
  in: "Nonton", en: "Watch", ja: "見る", zhHans: "观看", zh: "觀看",
  es: "Ver", de: "Ansehen", fr: "Regarder", pt: "Assistir",
  ar: "شاهد", th: "ดู", tl: "Panoorin"
}

function getSuffix(lang: string): string {
  const suffixes = SUFFIXES[lang] || SUFFIXES.en
  return suffixes[Math.floor(Math.random() * suffixes.length)]
}

export async function generateMetadata({ params }: { 
  params: Promise<{ lang: string; bookId: string; index: string }> 
}): Promise<Metadata> {
  const { lang, bookId, index } = await params
  const prefix = PREFIXES[lang] || PREFIXES.en
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const episodeNum = parseInt(index) + 1
  const canonicalUrl = `${baseUrl}/${lang}/drama/${bookId}/${index}`

  try {
    const res = await fetch(`${API_BASE_URL}/api/chapters/detail/${bookId}?lang=${lang}`, { cache: "no-store" })
    const json = await res.json()

    if (json.success && json.data) {
      const { bookName, introduction, tags, cover } = json.data
      const title = `${prefix} ${bookName} ${getSuffix(lang)} - Episode ${episodeNum}`
      const desc = introduction?.length > 155 ? introduction.substring(0, 152) + "..." : introduction || ""
      const keywords = tags?.map((t: any) => t.tagName).join(", ") || ""

      return {
        title,
        description: desc,
        keywords: `${keywords}, ${prefix.toLowerCase()} ${bookName}, drama, streaming`,
        alternates: { canonical: canonicalUrl },
        robots: { index: true, follow: true },
        openGraph: {
          title, description: desc, type: "video.other", url: canonicalUrl,
          images: cover ? [{ url: cover }] : []
        },
        twitter: {
          card: "summary_large_image", title, description: desc,
          images: cover ? [cover] : []
        }
      }
    }
  } catch (e) {}

  return {
    title: `${prefix} Drama ${getSuffix(lang)} - Episode ${episodeNum}`,
    description: "Watch your favorite drama for free",
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true }
  }
}

export default async function DramaPage({
  params
}: {
  params: Promise<{ lang: string; bookId: string; index: string }>
}) {
  const { lang, bookId } = await params

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
          description={schemaData.introduction || ""}
          cover={schemaData.cover}
          bookId={bookId}
          tags={schemaData.tags}
          episodeCount={schemaData.episodeCount}
        />
      )}
      <Suspense fallback={
        <div className="bg-black h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin"/>
        </div>
      }>
        <WatchPlayer />
      </Suspense>
    </>
  )
}
