const IS_DEV = !!globalThis.ROGERS_DEV

const LEVEL_COLORS = {
  H1: 'rgb(255 100 100)',
  H2: 'rgb(255 170  60)',
  H3: 'rgb(100 220 100)',
  H4: 'rgb( 80 190 255)',
  H5: 'rgb(200 130 255)',
  H6: 'rgb(255 210  80)',
}

export function collectHeadings() {
  const els = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
  return els
    .filter(el => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null)
    .map((el, i) => {
      const rect = el.getBoundingClientRect()
      const tag  = el.tagName.toUpperCase()
      const text = el.textContent.trim().slice(0, 60)
      return {
        key: i,
        tag,
        text,
        color: LEVEL_COLORS[tag] ?? 'rgb(200 200 200)',
        top:   rect.top  + window.scrollY,
        left:  rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      }
    })
}

/**
 * Scans headings immediately and re-scans on scroll and layout changes,
 * calling onHeadings(headings[]) each time.
 *
 * Returns { refresh, destroy } so callers can trigger a manual re-scan.
 * No-ops in production.
 *
 * @returns {{ refresh: () => void, destroy: () => void }}
 */
export function createHeadingWatcher(onHeadings) {
  if (!IS_DEV) return { refresh() {}, destroy() {} }

  const refresh = () => onHeadings(collectHeadings())

  refresh()

  const ro = new ResizeObserver(refresh)
  ro.observe(document.body)
  window.addEventListener('scroll', refresh, { passive: true })

  return {
    refresh,
    destroy() {
      ro.disconnect()
      window.removeEventListener('scroll', refresh)
    },
  }
}
