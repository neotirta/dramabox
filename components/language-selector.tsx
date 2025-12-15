"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

const languages = [
  { code: "in", name: "Indonesia", flag: "🇮🇩" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zhHans", name: "简体中文", flag: "🇨🇳" },
  { code: "zh", name: "繁體中文", flag: "🇹🇼" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "tl", name: "Tagalog", flag: "🇵🇭" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
]

export function LanguageSelector({ currentLang }: { currentLang?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [selected, setSelected] = useState(languages[0])

  useEffect(() => {
    const lang = languages.find(l => l.code === currentLang) || languages[0]
    setSelected(lang)
  }, [currentLang])

  const handleSelect = (lang: typeof languages[0]) => {
    setSelected(lang)
    localStorage.setItem("dramahub_lang", lang.code)
    window.dispatchEvent(new Event("languageChange"))
    
    // Navigate to new lang route
    if (pathname === "/" || pathname === `/${currentLang}`) {
      router.push(`/${lang.code}`)
    } else {
      // Replace current lang in path
      const newPath = pathname.replace(`/${currentLang}`, `/${lang.code}`)
      router.push(newPath)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{selected.flag} {selected.name}</span>
          <span className="sm:hidden">{selected.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 !bg-[hsl(240,10%,3.9%)] border">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getLanguage() {
  if (typeof window === "undefined") return "in"
  return localStorage.getItem("dramahub_lang") || "in"
}
