const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

async function fetchExternal(endpoint: string, cacheTime = 0) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: cacheTime },
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
      console.error(`[Fetch] Failed: ${endpoint} Status: ${res.status}`);
      return { success: false, list: [] };
    }

    const json = await res.json();
    return json.success ? json.data : { success: false, list: [] };
  } catch (e) {
    console.error(`[Fetch] Error: ${endpoint}`, e);
    return { success: false, list: [] };
  }
}

export async function apiGetTheaterList(channelId: number, pageNo = 1, index = 1, lang = "in") {
  return await fetchExternal(`/api/foryou/${pageNo}?channelId=${channelId}&index=${index}&lang=${lang}`, 60);
}

export async function apiNewList(pageNo = 1, pageSize = 15, lang = "in") {
  return await fetchExternal(`/api/new/${pageNo}?pageSize=${pageSize}&lang=${lang}`, 60);
}

export async function apiGetRankList(rankType = 1, lang = "in") {
  return await fetchExternal(`/api/rank/${rankType}?lang=${lang}`, 3600);
}

export async function apiSearchSuggest(keyword: string, lang = "in") {
  return await fetchExternal(`/api/suggest/${keyword}?lang=${lang}`);
}

export async function apiSearchByKeyword(keyword: string, pageNo = 1, pageSize = 20, lang = "in") {
  return await fetchExternal(`/api/search/${encodeURIComponent(keyword)}/${pageNo}?pageSize=${pageSize}&lang=${lang}`);
}

export async function apiGetChapters(bookId: string, lang = "in") {
  return await fetchExternal(`/api/chapters/${bookId}?lang=${lang}`, 300);
}

export async function apiGetDramaDetail(bookId: string, lang = "in") {
  return await fetchExternal(`/api/drama/detail/${bookId}?lang=${lang}`, 300);
}

export async function apiClassify(genre: string, pageNo = 1, sort = 1, lang = "in") {
  return await fetchExternal(`/api/classify?lang=${lang}&pageNo=${pageNo}&genre=${genre}&sort=${sort}`, 60);
}
