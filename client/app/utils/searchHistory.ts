const SEARCH_HISTORY_KEY = 'shop_search_history'
const SEARCH_HISTORY_LIMIT = 8

export function readSearchHistory(): string[] {
  if (!import.meta.client) return []

  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(item => String(item ?? '').trim())
      .filter(Boolean)
      .slice(0, SEARCH_HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function pushSearchHistory(term: string): string[] {
  const normalized = term.trim()
  if (!normalized || !import.meta.client) {
    return readSearchHistory()
  }

  const next = [
    normalized,
    ...readSearchHistory().filter(
      item => item.toLowerCase() !== normalized.toLowerCase()
    )
  ].slice(0, SEARCH_HISTORY_LIMIT)

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
  return next
}

export function removeSearchHistoryItem(term: string): string[] {
  const next = readSearchHistory().filter(
    item => item.toLowerCase() !== term.trim().toLowerCase()
  )

  if (import.meta.client) {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
  }

  return next
}

export function clearSearchHistory(): string[] {
  if (import.meta.client) {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }
  return []
}
