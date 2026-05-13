const IS_DEV = !!globalThis.ROGERS_DEV

const SKIP_CLASSES = new Set(['sr-only'])

export function formatTarget(el) {
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter(c => !SKIP_CLASSES.has(c))
    .slice(0, 2)
  const cls = classes.length ? '.' + classes.join('.') : ''
  return `<${tag}${cls}>`
}

export function getOutlineInfo(el) {
  const style = getComputedStyle(el)
  const hasFocusOutline = parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none'
  const isFocusVisible = document.querySelector(':focus-visible') === el
  return { hasFocusOutline, isFocusVisible }
}

export function flashElement(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return
  const overlay = document.createElement('div')
  overlay.className = 'focus-debug-flash'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), 750)
}

/**
 * Attaches a focusin listener and calls onToast({ label, hasFocusOutline, isFocusVisible })
 * on every keyboard focus event. No-ops in production.
 *
 * @returns {{ destroy: () => void }}
 */
export function createFocusWatcher(onToast) {
  if (!IS_DEV) return { destroy() {} }

  const handleFocusIn = (e) => {
    const el = e.target
    if (!el || el === document.body) return
    const { hasFocusOutline, isFocusVisible } = getOutlineInfo(el)
    flashElement(el)
    onToast({ label: formatTarget(el), hasFocusOutline, isFocusVisible })
  }

  document.addEventListener('focusin', handleFocusIn)
  return {
    destroy() {
      document.removeEventListener('focusin', handleFocusIn)
    },
  }
}
