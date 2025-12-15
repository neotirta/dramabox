import Script from "next/script"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

interface StructuredDataProps {
  bookName: string
  description: string
  cover: string
  bookId: string
  tags?: string[]
  episodeCount?: number
}

export default function StructuredData({ bookName, description, cover, bookId, tags, episodeCount }: StructuredDataProps) {
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": bookName,
    "description": description,
    "thumbnailUrl": cover,
    "contentUrl": `${SITE_URL}/watch?bookId=${bookId}`,
    "embedUrl": `${SITE_URL}/watch?bookId=${bookId}`,
    ...(tags && tags.length > 0 && { "genre": tags }),
    ...(episodeCount && { "numberOfEpisodes": episodeCount })
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Watch",
        "item": `${SITE_URL}/watch`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": bookName
      }
    ]
  }

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": bookName,
    "description": description,
    "url": `${SITE_URL}/watch?bookId=${bookId}`
  }

  return (
    <>
      <Script
        id="video-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoData) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }}
      />
    </>
  )
}
