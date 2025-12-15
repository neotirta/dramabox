import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string; index: string }> }
) {
  const { bookId, index } = await params
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get("lang") || "in"
  const source = searchParams.get("source") || "search_result"

  try {
    const res = await fetch(`${API_BASE}/api/watch/${bookId}/${index}?lang=${lang}&source=${source}`)
    const json = await res.json()
    
    if (!res.ok || !json.success) {
      return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(json)
  } catch (e) {
    console.error("[Watch] Error:", e)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
