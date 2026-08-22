export function clearOverlayLocks(): void {
  if (!import.meta.client) {
    return
  }

  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('pointer-events')
  document.body.style.removeProperty('padding-right')
  document.documentElement.style.removeProperty('overflow')
  document.body.removeAttribute('data-scroll-locked')
  document.documentElement.removeAttribute('data-scroll-locked')
}
