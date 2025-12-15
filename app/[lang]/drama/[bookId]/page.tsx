import { redirect } from "next/navigation"

export default async function DramaBasePage({
  params
}: {
  params: Promise<{ lang: string; bookId: string }>
}) {
  const { lang, bookId } = await params
  redirect(`/${lang}/drama/${bookId}/0`)
}
