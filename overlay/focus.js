import { createFocusWatcher } from '../core/focus.js'

const IS_DEV = !!globalThis.ROGERS_DEV

/**
 * Mounts the focus toast DOM node and wires a focusin watcher.
 * Returns { destroy }.
 */
export function mountFocusDebugger() {
  if (!IS_DEV) return { destroy() {} }

  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  document.body.appendChild(el)

  let showTimer = null
  let fadeTimer = null

  function render(toast) {
    if (!toast) { el.removeAttribute('class'); el.innerHTML = ''; return }
    el.className = `focus-toast${toast.fading ? ' focus-toast--fading' : ''}`
    el.innerHTML = `
      <div class="focus-toast__row">
        <span class="focus-toast__label">KB Focus</span>
        <code class="focus-toast__target">${toast.label}</code>
      </div>
      <div class="focus-toast__indicators">
        <span class="focus-toast__indicator ${toast.hasFocusOutline ? 'focus-toast__indicator--on' : 'focus-toast__indicator--off'}">
          :focus ${toast.hasFocusOutline ? '✓' : '✗'}
        </span>
        <span class="focus-toast__indicator ${toast.isFocusVisible ? 'focus-toast__indicator--on' : 'focus-toast__indicator--off'}">
          :focus-visible ${toast.isFocusVisible ? '✓' : '✗'}
        </span>
      </div>
    `
  }

  const watcher = createFocusWatcher((data) => {
    clearTimeout(showTimer)
    clearTimeout(fadeTimer)
    render({ ...data, fading: false })
    showTimer = setTimeout(() => {
      render({ ...data, fading: true })
      fadeTimer = setTimeout(() => render(null), 400)
    }, 3000)
  })

  return {
    destroy() {
      watcher.destroy()
      clearTimeout(showTimer)
      clearTimeout(fadeTimer)
      el.remove()
    },
  }
}
