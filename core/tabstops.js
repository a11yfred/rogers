const IS_DEV = !!globalThis.ROGERS_DEV

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])', 'area[href]',
  'audio[controls]', 'video[controls]', 'details > summary:first-of-type',
].join(',')

export function isTabbable(el) {
  if (el.closest('[aria-hidden="true"]')) return false
  if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false
  return true
}

export function getTabOrder() {
  const all = Array.from(document.querySelectorAll(FOCUSABLE)).filter(isTabbable)
  const positive = all.filter(el => (el.tabIndex ?? 0) > 0).sort((a, b) => a.tabIndex - b.tabIndex)
  const natural  = all.filter(el => (el.tabIndex ?? 0) === 0)
  return [...positive, ...natural]
}

/**
 * Records keyboard focus events in sequence, calling onStop(stop) for each,
 * where stop is { seq, cx, cy, label }.
 *
 * Returns { clear, destroy }.
 * No-ops in production.
 *
 * @returns {{ clear: () => void, destroy: () => void }}
 */
export function createTabStopWatcher(onStop, onClear) {
  if (!IS_DEV) return { clear() {}, destroy() {} }

  let seq = 0

  const handleFocusIn = (e) => {
    const el = e.target
    if (!el || el === document.body || el === document.documentElement) return
    if (el.closest('[aria-hidden="true"]')) return

    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return

    const cx = rect.left + rect.width  / 2 + window.scrollX
    const cy = rect.top  + rect.height / 2 + window.scrollY

    seq += 1
    onStop({ seq, cx, cy, label: el.tagName.toLowerCase() })
  }

  document.addEventListener('focusin', handleFocusIn)

  return {
    clear() {
      seq = 0
      onClear()
    },
    destroy() {
      document.removeEventListener('focusin', handleFocusIn)
    },
  }
}
