const IS_DEV = import.meta.env.DEV

const CONTROL_TAGS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG'])
const INTERACTIVE_ROLES = new Set([
  'button', 'checkbox', 'radio', 'combobox', 'listbox', 'menuitem',
  'menuitemcheckbox', 'menuitemradio', 'option', 'slider', 'spinbutton',
  'switch', 'tab', 'textbox', 'treeitem', 'link', 'searchbox',
])

export function isControl(el) {
  const tag = el.tagName.toUpperCase()
  if (CONTROL_TAGS.has(tag)) return true
  if (tag === 'A' && el.hasAttribute('href')) return true
  const role = el.getAttribute('role')
  if (role && INTERACTIVE_ROLES.has(role)) return true
  return false
}

export function getAccessibleName(el) {
  const tag = el.tagName.toUpperCase()

  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return { name: ariaLabel.trim(), source: 'aria-label' }

  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy.split(/\s+/).filter(Boolean)
      .map(id => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean).join(' ')
    if (text) return { name: text, source: 'aria-labelledby' }
  }

  if (tag === 'IMG') {
    const alt = el.getAttribute('alt')
    if (alt !== null) return { name: alt || '(empty)', source: 'alt' }
    return { name: '(no alt)', source: 'missing' }
  }

  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (label) return { name: label.textContent.trim(), source: 'label[for]' }
    }
    const parentLabel = el.closest('label')
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true)
      clone.querySelector('input,select,textarea')?.remove()
      const text = clone.textContent.trim()
      if (text) return { name: text, source: 'parent label' }
    }
    const placeholder = el.getAttribute('placeholder')
    if (placeholder) return { name: placeholder, source: 'placeholder' }
    const ariaDescribedBy = el.getAttribute('aria-describedby')
    if (ariaDescribedBy) {
      const text = document.getElementById(ariaDescribedBy)?.textContent?.trim()
      if (text) return { name: text, source: 'aria-describedby' }
    }
    return { name: '(no label)', source: 'missing' }
  }

  const title = el.getAttribute('title')
  if (title) return { name: title.trim(), source: 'title' }

  const text = el.textContent?.trim().replace(/\s+/g, ' ')
  if (text) {
    return { name: text.length > 60 ? text.slice(0, 60) + '…' : text, source: 'text content' }
  }

  return { name: '(none)', source: 'none' }
}

const TOOLTIP_LEFT_OFFSET = 14
const TOOLTIP_TOP_OFFSET  = 20

/**
 * Attaches mousemove/mouseover/mouseleave listeners and calls:
 *   onTooltip({ name, source, x, y }) — element under cursor changed
 *   onClear()                          — cursor left a control or the document
 *
 * No-ops in production.
 *
 * @returns {{ destroy: () => void }}
 */
export function createNamesWatcher(onTooltip, onClear) {
  if (!IS_DEV) return { destroy() {} }

  let cursorX = 0
  let cursorY = 0

  const handleMove = (e) => {
    cursorX = e.clientX
    cursorY = e.clientY
  }

  const handleOver = (e) => {
    const el = e.target
    if (!el || el === document.body || el === document.documentElement || !isControl(el)) {
      onClear()
      return
    }
    const { name, source } = getAccessibleName(el)
    onTooltip({
      name,
      source,
      x: cursorX + TOOLTIP_LEFT_OFFSET,
      y: cursorY + TOOLTIP_TOP_OFFSET,
    })
  }

  const handleOut = () => onClear()

  document.addEventListener('mousemove', handleMove, { passive: true })
  document.addEventListener('mouseover', handleOver)
  document.addEventListener('mouseleave', handleOut)

  return {
    destroy() {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleOut)
    },
  }
}
