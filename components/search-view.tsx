'use client'

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2, Film, ArrowLeft, Flame, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatNumber, cn } from "@/lib/utils"

const API_BASE = "";

interface BookItem {
  bookId: string
  bookName: string
  cover?: string
  coverWap?: string
  introduction?: string
  tags?: string[]
  tagNames?: string[]
  playCount?: string | number
}

const extractList = (data: any): BookItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.suggestList)) return data.suggestList;
  if (Array.isArray(data.searchList)) return data.searchList;
  if (Array.isArray(data.rankList)) return data.rankList;
  if (Array.isArray(data.list)) return data.list;
  return [];
}

interface SearchViewProps {
  initialQuery?: string
  autoFocus?: boolean
  onClose?: () => void
  isDialog?: boolean
  lang?: string
}

export function SearchView({ initialQuery = "", autoFocus = false, onClose, isDialog = false, lang = "in" }: SearchViewProps) {
  const router = useRouter()
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<BookItem[]>([])
  const [popularList, setPopularList] = useState<BookItem[]>([])
  
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dramahub_lang", lang)
    }
  }, [lang])

  const fetchWithRetry = async (url: string, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
      } catch (e) {
        if (i === retries) throw e
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }

  useEffect(() => {
    if (autoFocus && inputRef.current) setTimeout(() => inputRef.current?.focus(), 150) 
    
    const fetchPopular = async () => {
      const cacheKey = `rank_${lang}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const { data, time } = JSON.parse(cached)
        if (Date.now() - time < 300000) {
          setPopularList(data)
          return
        }
      }

      try {
        const json = await fetchWithRetry(`/api/proxy/rank?lang=${lang}`)
        if (json.success && json.data?.list) {
          const list = extractList(json.data)
          setPopularList(list)
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: list, time: Date.now() }))
        }
      } catch (e) {
        console.error("[ERROR] Popular fetch failed", e)
      }
    }
    fetchPopular()

    const handleLangChange = () => {
      fetchPopular()
      if (query.length >= 2) performSuggest(query)
    }
    window.addEventListener("languageChange", handleLangChange)

    if (initialQuery) performSearch(initialQuery)
    
    return () => window.removeEventListener("languageChange", handleLangChange)
  }, [lang])

  const performSuggest = async (keyword: string) => {
    if (keyword.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const json = await fetchWithRetry(`/api/proxy/suggest?keyword=${encodeURIComponent(keyword)}&lang=${lang}`)
      if (json.success) {
        const list = extractList(json.data)
        setResults(list)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (keyword: string) => {
    if (keyword.length < 2) return
    setLoading(true)
    try {
      const json = await fetchWithRetry(`/api/proxy/search?keyword=${encodeURIComponent(keyword)}&lang=${lang}`)
      if (json.success) {
        const list = extractList(json.data)
        setResults(list)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query === initialQuery) return 
    if (query.length < 2) { setResults([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { performSuggest(query) }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const goToWatch = (bookId: string) => {
    if (onClose) onClose()
    router.push(`/${lang}/drama/${bookId}/0`)
  }

  const handleSearchSubmit = () => {
    if (query.length >= 2) {
      performSearch(query)
    }
  }

  const getTag = (item: BookItem) => {
    // Normalisasi Tag yang berantakan (tags vs tagNames)
    const t = item.tagNames || item.tags || [];
    return t.length > 0 ? t[0] : "Drama";
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            placeholder="Search drama..."
            className="pl-10 pr-10 h-12 text-base bg-card border-border"
            autoComplete="off"
          />
          {query && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" 
              onClick={() => { setQuery(""); setResults([]); router.push(`/${lang}`); inputRef.current?.focus() }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        )}

        {!loading && query.length < 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Trending</h3>
            </div>
            {popularList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading drama...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {popularList.map((book, index) => (
                <button 
                  key={book.bookId} 
                  onClick={() => goToWatch(book.bookId)} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className={cn("w-8 text-center font-bold text-lg", index < 3 ? "text-primary" : "text-muted-foreground")}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0">
                    <img src={book.coverWap || book.cover} className="w-full h-full object-cover" loading="lazy" alt={`${book.bookName} drama cover`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">{book.bookName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-secondary border">{getTag(book)}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3 text-primary" />{formatNumber(book.playCount)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Search Results</h3>
            <div className="grid gap-3">
              {results.map((item) => (
                <button 
                  key={item.bookId} 
                  onClick={() => goToWatch(item.bookId)} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0">
                    <img src={item.cover} alt={`${item.bookName} drama cover`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base line-clamp-1">{item.bookName}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.playCount && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-primary" /> {formatNumber(item.playCount)}
                        </span>
                      )}
                      <span>•</span>
                      <span className="truncate">{getTag(item)}</span>
                    </div>
                    {item.introduction && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.introduction}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
