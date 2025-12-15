"use client"

import React from "react"
import { usePathname } from "next/navigation"
// [HAPUS] Import SiteHeader tidak lagi dibutuhkan
// import { SiteHeader } from "@/components/site-header"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Cek apakah sedang di halaman Watch (Full Screen Experience)
  const isWatchPage = pathname?.startsWith("/watch")

  if (isWatchPage) {
    return (
      <main className="relative w-full h-full min-h-screen bg-black">
        {children}
      </main>
    )
  }

  // Mode Normal: Hapus Navbar, sisakan Container konten saja
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* [HAPUS] Header Sticky dihapus */}
      {/* <SiteHeader /> */}
      
      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <div className="container mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
