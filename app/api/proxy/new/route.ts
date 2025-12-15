import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const pageNo = searchParams.get("pageNo") || "1"
  const pageSize = searchParams.get("pageSize") || "10"
  const lang = searchParams.get("lang") || "in"
  
  try {
    const res = await fetch(`${API_BASE}/api/new/${pageNo}?lang=${lang}&pageSize=${pageSize}`, {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ success: false, error: "Fetch failed" }, { status: 500 })
  }
}
