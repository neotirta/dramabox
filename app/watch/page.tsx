import React, { Suspense } from "react"
import { Metadata } from "next"
import WatchPlayer from "./player"
import StructuredData from "./structured-data"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE!

const ID_SUFFIXES = ["Premium Unlocked", "Full Episode", "Full Bahasa Indonesia", "Episode Lengkap", "Tanpa Iklan"]
const EN_SUFFIXES = ["Premium Unlocked", "Full Episode", "Ad-Free", "Complete Series", "Complete Episodes"]
const JA_SUFFIXES = ["プレミアム解除", "全エピソード", "広告なし", "完全版", "完全なエピソード"]
const ZH_HANS_SUFFIXES = ["高级解锁", "全集", "无广告", "完整版", "完整剧集"]
const ZH_SUFFIXES = ["高級解鎖", "全集", "無廣告", "完整版", "完整劇集"]
const ES_SUFFIXES = ["Premium Desbloqueado", "Episodio Completo", "Sin Anuncios", "Serie Completa", "Episodios Completos"]
const DE_SUFFIXES = ["Premium Freigeschaltet", "Vollständige Folge", "Werbefrei", "Komplette Serie", "Vollständige Episoden"]
const FR_SUFFIXES = ["Premium Débloqué", "Épisode Complet", "Sans Publicité", "Série Complète", "Épisodes Complets"]
const PT_SUFFIXES = ["Premium Desbloqueado", "Episódio Completo", "Sem Anúncios", "Série Completa", "Episódios Completos"]
const AR_SUFFIXES = ["بريميوم مفتوح", "حلقة كاملة", "بدون إعلانات", "سلسلة كاملة", "حلقات كاملة"]
const TH_SUFFIXES = ["ปลดล็อคพรีเมียม", "ตอนเต็ม", "ไม่มีโฆษณา", "ซีรีส์เต็ม", "ตอนที่สมบูรณ์"]
const TL_SUFFIXES = ["Premium Unlocked", "Buong Episode", "Walang Ads", "Kumpletong Series", "Kumpletong Episodes"]

const LANG_CONFIG: Record<string, { prefix: string; suffix: string | string[]; keyword: string }> = {
  in: { prefix: "Nonton", suffix: ID_SUFFIXES, keyword: "nonton" },
  en: { prefix: "Watch", suffix: EN_SUFFIXES, keyword: "watch" },
  ja: { prefix: "見る", suffix: JA_SUFFIXES, keyword: "見る" },
  zhHans: { prefix: "观看", suffix: ZH_HANS_SUFFIXES, keyword: "观看" },
  zh: { prefix: "觀看", suffix: ZH_SUFFIXES, keyword: "觀看" },
  es: { prefix: "Ver", suffix: ES_SUFFIXES, keyword: "ver" },
  de: { prefix: "Ansehen", suffix: DE_SUFFIXES, keyword: "ansehen" },
  fr: { prefix: "Regarder", suffix: FR_SUFFIXES, keyword: "regarder" },
  pt: { prefix: "Assistir", suffix: PT_SUFFIXES, keyword: "assistir" },
  ar: { prefix: "شاهد", suffix: AR_SUFFIXES, keyword: "شاهد" },
  th: { prefix: "ดู", suffix: TH_SUFFIXES, keyword: "ดู" },
  tl: { prefix: "Panoorin", suffix: TL_SUFFIXES, keyword: "panoorin" }
}

function getSuffix(suffix: string | string[]): string {
  return Array.isArray(suffix) ? suffix[Math.floor(Math.random() * suffix.length)] : suffix
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ bookId?: string; lang?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const bookId = params?.bookId
  const lang = params?.lang || "in"
  const langConfig = LANG_CONFIG[lang] || LANG_CONFIG.in
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!bookId) {
    return {
      title: `${langConfig.prefix} Drama ${getSuffix(langConfig.suffix)}`,
      description: "Watch your favorite drama for free",
      robots: { index: false, follow: true }
    }
  }

  const canonicalUrl = `${baseUrl}/watch?bookId=${bookId}`

  try {
    const res = await fetch(`${API_BASE_URL}/api/drama/detail/${bookId}?lang=${lang}`, { cache: "no-store" })
    const json = await res.json()

    if (json.success && json.data) {
      const { bookName, introduction, tags, cover } = json.data
      const description = introduction || ""
      const title = `${langConfig.prefix} ${bookName} ${getSuffix(langConfig.suffix)}`
      const desc = description.length > 155 ? description.substring(0, 152) + "..." : description
      const keywords = tags?.map((t: any) => t.tagName).join(", ") || ""

      return {
        title,
        description: desc,
        keywords: `${keywords}, ${langConfig.keyword} ${bookName}, drama, streaming`,
        alternates: { canonical: canonicalUrl },
        robots: { index: true, follow: true },
        openGraph: {
          title,
          description: desc,
          type: "video.other",
          url: canonicalUrl,
          images: cover ? [{ url: cover }] : []
        },
        twitter: {
          card: "summary_large_image",
          title,
          description: desc,
          images: cover ? [cover] : []
        }
      }
    }
  } catch (e) {
    console.error("SEO fetch error:", e)
  }

  return {
    title: `${langConfig.prefix} Drama ${getSuffix(langConfig.suffix)}`,
    description: "Watch your favorite drama for free",
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true }
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ bookId?: string; lang?: string }> }) {
  const params = await searchParams
  const bookId = params?.bookId
  const lang = params?.lang || "in"

  let schemaData = null
  if (bookId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/drama/detail/${bookId}?lang=${lang}`, { cache: "no-store" })
      const json = await res.json()
      if (json.success && json.data) {
        schemaData = json.data
      }
    } catch (e) {}
  }

  return (
    <>
      {schemaData && (
        <StructuredData
          bookName={schemaData.bookName}
          description={schemaData.introduction || ""}
          cover={schemaData.cover}
          bookId={bookId!}
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
