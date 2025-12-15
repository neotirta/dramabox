import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Dramahub - Nonton Drama Gratis Subtitle Indonesia Terlengkap",
  description: "Nonton drama Korea, China, Thailand subtitle Indonesia gratis. Streaming drama terbaru dan terpopuler dengan kualitas HD. Dramahub Indonesia - platform nonton drama online terlengkap.",
  keywords: "dramahub, nonton drama, drama korea, drama china, drama subtitle indonesia, streaming drama gratis, dramahub indonesia, nonton drama online, drama terbaru, drama populer",
  authors: [{ name: "Dramahub Indonesia" }],
  creator: "Dramahub Indonesia",
  publisher: "Dramahub Indonesia",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Dramahub Indonesia",
    title: "Dramahub - Nonton Drama Gratis Subtitle Indonesia Terlengkap",
    description: "Nonton drama Korea, China, Thailand subtitle Indonesia gratis. Streaming drama terbaru dan terpopuler dengan kualitas HD.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dramahub Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dramahub - Nonton Drama Gratis Subtitle Indonesia",
    description: "Nonton drama Korea, China, Thailand subtitle Indonesia gratis. Streaming drama terbaru dan terpopuler.",
    images: ["/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dramahub Indonesia",
    "url": siteUrl,
    "description": "Platform streaming drama Korea, China, Thailand subtitle Indonesia gratis",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "id-ID"
  }

  return (
    <html lang="id" suppressHydrationWarning> 
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3GY571MS9Z"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3GY571MS9Z');
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N5PSZY79JC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', 'G-N5PSZY79JC');
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YHST7DQFC1"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', 'G-YHST7DQFC1');
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y7DGPVGD8L"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', 'G-Y7DGPVGD8L');
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QEQK5YMNCS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', 'G-QEQK5YMNCS');
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-S5RXR78039"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', 'G-S5RXR78039');
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105648611', 'ym');
              ym(105648611, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/105648611" style={{position:'absolute', left:'-9999px'}} alt="" /></div>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
