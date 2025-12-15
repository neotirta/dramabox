import React, { Suspense } from "react"
import { SearchView } from "@/components/search-view"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import type { Metadata } from "next"

const LANG_CONFIG: Record<string, { title: string; searchPlaceholder: string }> = {
  in: { title: "Dramahub Indonesia", searchPlaceholder: "Cari drama..." },
  en: { title: "Dramahub", searchPlaceholder: "Search drama..." },
  ja: { title: "Dramahub 日本", searchPlaceholder: "ドラマを検索..." },
  zhHans: { title: "Dramahub 中国", searchPlaceholder: "搜索剧集..." },
  zh: { title: "Dramahub 台灣", searchPlaceholder: "搜尋劇集..." },
  es: { title: "Dramahub España", searchPlaceholder: "Buscar drama..." },
  de: { title: "Dramahub Deutschland", searchPlaceholder: "Drama suchen..." },
  fr: { title: "Dramahub France", searchPlaceholder: "Rechercher un drame..." },
  pt: { title: "Dramahub Brasil", searchPlaceholder: "Pesquisar drama..." },
  ar: { title: "Dramahub العربية", searchPlaceholder: "ابحث عن دراما..." },
  th: { title: "Dramahub ไทย", searchPlaceholder: "ค้นหาละคร..." },
  tl: { title: "Dramahub Pilipinas", searchPlaceholder: "Maghanap ng drama..." }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { lang } = await params
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  const config = LANG_CONFIG[lang] || LANG_CONFIG.en
  
  if (q) {
    return {
      title: `${q} - ${config.title}`,
      description: `Search results for "${q}" on ${config.title}`,
      openGraph: {
        title: `${q} - ${config.title}`,
        description: `Search results for "${q}"`,
      },
    }
  }
  
  return {
    title: config.title,
    description: `Watch free drama on ${config.title}`,
  }
}

export default async function LangHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await params
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  const config = LANG_CONFIG[lang] || LANG_CONFIG.en

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight">
            {config.title.split(' ')[0]} <span className="text-primary">{config.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://t.me/amarahpendosa" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Telegram</span>
              </a>
            </Button>
            <LanguageSelector currentLang={lang} />
          </div>
        </div>
      </nav>

      <main className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={null}>
          <SearchView autoFocus={!q} initialQuery={q} lang={lang} />
        </Suspense>
      </main>
    </div>
  )
}
