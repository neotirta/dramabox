import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword") || ""
  const lang = searchParams.get("lang") || "in"
  
  try {
    const res = await fetch(`${API_BASE}/api/suggest/${encodeURIComponent(keyword)}?lang=${lang}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ success: false, error: "Fetch failed" }, { status: 500 })
  }
}
