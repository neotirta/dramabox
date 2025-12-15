"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, List, ChevronLeft, Loader2, Maximize, Minimize, Scan, MonitorPlay, X, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = ""; 

interface VideoQuality {
  quality: number
  videoPath: string
  isDefault: number
  isEntry: number
}

interface WatchData {
  bookId: string
  chapterIndex: number
  videoUrl: string
  qualities: VideoQuality[]
  cover: string
  unlockedNow: boolean
}

export default function WatchPlayer() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  // Support multiple URL formats: /watch?bookId=X, /watch/X/Y, /{lang}/drama/{bookId}/{index}
  let bookId = searchParams?.get("bookId")
  let urlIndex = parseInt(searchParams?.get("index") || "0")
  let lang = "in"
  
  if (!bookId && pathname) {
    // Try /{lang}/drama/{bookId}/{index} or /{lang}/drama/{bookId}
    const langMatch = pathname.match(/\/([a-zA-Z]{2,7})\/drama\/(\d+)(?:\/(\d+))?/)
    if (langMatch) {
      lang = langMatch[1]
      bookId = langMatch[2]
      urlIndex = langMatch[3] ? parseInt(langMatch[3]) : 0
    } else {
      // Fallback to /watch/X/Y
      const pathMatch = pathname.match(/\/watch\/(\d+)\/(\d+)/)
      if (pathMatch) {
        bookId = pathMatch[1]
        urlIndex = parseInt(pathMatch[2])
      }
    }
  }
  
  const sourceParam = searchParams?.get("source") || "search_result"
  const keywordParam = searchParams?.get("keyword") || ""

  const [currentIndex, setCurrentIndex] = useState(isNaN(urlIndex) ? 0 : urlIndex)
  const [videoData, setVideoData] = useState<WatchData | null>(null)
  const [bookDetails, setBookDetails] = useState<any>(null) 
  
  const [loading, setLoading] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<number | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover")

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevIndexRef = useRef<number | null>(null)

  useEffect(() => {
    if (!bookId) return

    const fetchVideo = async (retryCount = 0) => {
      const MAX_RETRIES = 3
      const RETRY_DELAY = 1000
      
      setLoading(true)
      setIsPlaying(false)
      setBuffering(true)
      
      try {
        let direction = 0
        if (prevIndexRef.current !== null) {
          direction = currentIndex > prevIndexRef.current ? 2 : (currentIndex < prevIndexRef.current ? 1 : 0)
        }
        prevIndexRef.current = currentIndex

        const url = `${API_BASE_URL}/api/watch/${bookId}/${currentIndex}?lang=${lang}&source=${sourceParam}&keyword=${encodeURIComponent(keywordParam)}&direction=${direction}`

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const json = await res.json()
        
        if (json.success && json.data) {
          setVideoData(json.data)
          
          const qualities = json.data.qualities || []
          const savedQuality = localStorage.getItem('preferredQuality')
          const preferredQ = savedQuality ? qualities.find((q: any) => q.quality === parseInt(savedQuality)) : null
          const defaultQ = qualities.find((q: any) => q.isDefault === 1)
          const initialQ = preferredQ?.quality || defaultQ?.quality || qualities[0]?.quality || null
          setCurrentQuality(initialQ)

          if (json.data.unlockedNow) toast.success("Episode terbuka!")
          
          setLoading(false)
          setBuffering(false)
        } else {
          throw new Error(json.error || "Invalid response")
        }
      } catch (e) {
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
          return fetchVideo(retryCount + 1)
        } else {
          toast.error("Tidak dapat memuat video")
          setLoading(false)
          setBuffering(false)
        }
      }
    }

    fetchVideo()
  }, [bookId, currentIndex, sourceParam])

  useEffect(() => {
    if (!bookId) return
    
    const cacheKey = `chapters_${bookId}_${lang}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { data, time } = JSON.parse(cached)
      if (Date.now() - time < 300000) {
        setBookDetails(data)
        return
      }
    }

    const fetchWithTimeout = (url: string) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout))
    }

    Promise.all([
      fetchWithTimeout(`/api/proxy/chapters?bookId=${bookId}&lang=${lang}`).then(r => r.json()),
      fetchWithTimeout(`/api/proxy/chapters-detail?bookId=${bookId}&lang=${lang}`).then(r => r.json())
    ])
      .then(([chaptersRes, detailRes]) => {
        const list = chaptersRes?.data?.chapterList || []
        const detail = detailRes?.data || {}
        const bookData = { list, ...detail }
        setBookDetails(bookData)
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: bookData, time: Date.now() }))
      })
      .catch(() => {})
  }, [bookId, lang])

  useEffect(() => {
    if (bookDetails?.bookName) {
      const newTitle = `Nonton ${bookDetails.bookName} Premium Unlocked - Episode ${currentIndex + 1}`
      console.log('Updating title:', newTitle)
      document.title = newTitle
      
      // Update aria-label langsung di sini
      if (videoRef.current) {
        const newAriaLabel = `${bookDetails.bookName} - Episode ${currentIndex + 1}`
        videoRef.current.setAttribute('aria-label', newAriaLabel)
        console.log('Updated video aria-label:', newAriaLabel)
      }
    }
  }, [bookDetails, currentIndex])

  const handleQualityChange = (newQuality: number) => {
    if (!videoData || !videoRef.current) return;
    const selectedQ = videoData.qualities.find(q => q.quality === newQuality);
    if (selectedQ) {
      const ct = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      videoRef.current.src = selectedQ.videoPath;
      videoRef.current.currentTime = ct;
      setCurrentQuality(newQuality);
      localStorage.setItem('preferredQuality', newQuality.toString());
      if (wasPlaying) videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime
      const dur = videoRef.current.duration
      if (isFinite(curr)) setCurrentTime(curr)
      if (isFinite(dur) && dur > 0) {
        setDuration(dur)
        setProgress((curr / dur) * 100)
      }
    }
  }

  const handleSeek = (val: number[]) => {
    if (videoRef.current && duration > 0) {
      const newTime = (val[0] / 100) * duration
      if (isFinite(newTime)) {
        videoRef.current.currentTime = newTime
        setProgress(val[0])
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const resetControlsTimeout = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "f": toggleFullscreen(); break;
        case "ArrowRight": if(videoRef.current) videoRef.current.currentTime += 5; break;
        case "ArrowLeft": if(videoRef.current) videoRef.current.currentTime -= 5; break;
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay])

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00"
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const videoAriaLabel = useMemo(() => {
    return bookDetails?.bookName 
      ? `${bookDetails.bookName} - Episode ${currentIndex + 1}` 
      : `Drama Episode ${currentIndex + 1}`
  }, [bookDetails?.bookName, currentIndex])

  if (!bookId) return <div className="bg-black h-screen flex items-center justify-center text-white">Invalid Book ID</div>

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-black overflow-hidden group font-sans select-none"
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      <video
        key={`video-${bookId}-${currentIndex}-${bookDetails?.bookName || 'loading'}`}
        ref={videoRef}
        src={videoData?.videoUrl} 
        poster={videoData?.cover}
        className={cn("w-full h-full transition-all duration-500 ease-in-out", fitMode === "cover" ? "object-cover" : "object-contain")}
        autoPlay playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (bookDetails?.list && currentIndex < bookDetails.list.length - 1) {
            setCurrentIndex(prev => prev + 1)
          }
        }} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        aria-label={videoAriaLabel}
      />

      {(loading || buffering) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm pointer-events-none gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-white/80" />
          <div className="px-3 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">Ep {currentIndex + 1}</div>
        </div>
      )}

      <div className={cn("absolute inset-0 flex flex-col justify-between z-20 transition-opacity duration-500", showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 pt-6 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-white hover:bg-white/10 rounded-full w-10 h-10 backdrop-blur-md bg-black/20 border border-white/5"><ChevronLeft /></Button>
              <Badge variant="secondary" className="text-white hover:bg-white/10 backdrop-blur-md bg-black/20 border border-white/5 h-10 px-3 rounded-full text-xs font-medium">Ep {currentIndex + 1}</Badge>
          </div>
          <div className="flex items-center gap-2">
             {videoData?.qualities && videoData.qualities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="text-white hover:bg-white/10 backdrop-blur-md bg-black/20 border border-white/5 h-10 px-3 rounded-full gap-2">
                      <Settings size={16} /><span className="text-xs font-medium">{currentQuality ? `${currentQuality}p` : 'Auto'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white backdrop-blur-xl w-32">
                    {videoData.qualities.sort((a, b) => b.quality - a.quality).map((q) => (
                      <DropdownMenuItem key={q.quality} onClick={(e) => { e.stopPropagation(); handleQualityChange(q.quality); }} className={cn("cursor-pointer text-xs py-2.5 focus:bg-white/20 focus:text-white flex justify-between", currentQuality === q.quality && "bg-white/10 font-bold text-red-500")}>
                        <span>{q.quality}p</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
             )}
             <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFitMode(m => m === "cover" ? "contain" : "cover"); }} className="text-white hover:bg-white/10 rounded-full w-10 h-10 backdrop-blur-md bg-black/20 border border-white/5">{fitMode === "cover" ? <Scan size={18} /> : <MonitorPlay size={18} />}</Button>
             <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowSidebar(true); }} className="text-white hover:bg-white/10 rounded-full w-10 h-10 backdrop-blur-md bg-black/20 border border-white/5"><List size={18} /></Button>
          </div>
        </div>

        {!isPlaying && !loading && !buffering && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
               <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 group shadow-2xl">
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white translate-x-1" />
               </button>
            </div>
        )}

        <div className="bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-8 pt-20 pointer-events-auto">
          <div className="group/slider relative flex items-center cursor-pointer py-2" onClick={(e) => e.stopPropagation()}>
             <Slider value={[progress]} max={100} step={0.1} onValueChange={handleSeek} className="cursor-pointer relative z-10" />
          </div>
          <div className="flex justify-between items-center mt-2">
             <div className="flex gap-4 items-center">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-white hover:bg-white/10 rounded-full w-10 h-10">{isPlaying ? <Pause className="fill-white" /> : <Play className="fill-white" />}</Button>
                <span className="text-xs text-white/70 font-mono tracking-wider">{formatTime(currentTime)} / {formatTime(duration)}</span>
             </div>
             <div className="flex gap-3 items-center">
                <Button variant="outline" disabled={bookDetails?.list && currentIndex >= bookDetails.list.length - 1} className="text-white text-xs h-8 px-4 rounded-full border-white/10 bg-white/5 hover:bg-white/15 backdrop-blur-md hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed" onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev + 1); }}>Next <SkipForward className="w-3 h-3 ml-2 opacity-70" /></Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:bg-white/10 rounded-full w-10 h-10">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</Button>
             </div>
          </div>
        </div>
      </div>

      <div className={cn("absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 transition-opacity duration-500", showSidebar ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setShowSidebar(false)} />
      <div className={cn("absolute top-0 right-0 h-full w-full sm:w-[400px] bg-zinc-950/80 backdrop-blur-2xl border-l border-white/5 z-40 transition-transform duration-500 shadow-2xl flex flex-col", showSidebar ? "translate-x-0" : "translate-x-full")}>
         <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <div><h2 className="text-white font-semibold text-lg">Episodes</h2><p className="text-xs text-white/40 font-medium mt-0.5">{bookDetails?.list?.length || 0} Available</p></div>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"><X size={20} /></Button>
         </div>
         <ScrollArea className="flex-1 min-h-0 overflow-hidden h-full w-full">
            <div className="p-6 grid grid-cols-4 gap-3 content-start pb-20">
                {bookDetails?.list?.map((ep: any) => {
                    const isActive = ep.chapterIndex === currentIndex
                    const episodeTitle = `${bookDetails?.bookName || 'Drama'} - Episode ${ep.chapterIndex + 1}`
                    return (
                        <button key={ep.chapterId || ep.chapterIndex} onClick={() => { setCurrentIndex(ep.chapterIndex); if (window.innerWidth < 768) setShowSidebar(false) }} className={cn("relative aspect-[4/3] rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-300 group border", isActive ? "bg-white text-black border-white scale-105 z-10 font-bold" : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105")} title={episodeTitle} aria-label={episodeTitle}>
                            <span className={cn("text-lg", isActive ? "tracking-tight" : "font-mono")}>{ep.chapterIndex + 1}</span>
                        </button>
                    )
                })}
            </div>
         </ScrollArea>
      </div>
    </div>
  )
}
