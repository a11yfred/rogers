import { createNamesWatcher } from '../core/names.js'

const IS_DEV = import.meta.env.DEV

/**
 * Mounts the names tooltip DOM node and wires a mouse watcher.
 * Returns { destroy }.
 */
export function mountNamesDebugger() {
  if (!IS_DEV) return { destroy() {} }

  const el = document.createElement('div')
  el.className = 'names-tooltip'
  el.setAttribute('aria-hidden', 'true')
  el.style.display = 'none'
  document.body.appendChild(el)

  const watcher = createNamesWatcher(
    ({ name, source, x, y }) => {
      el.style.display = ''
      el.style.left = `${x}px`
      el.style.top  = `${y}px`
      el.innerHTML = `
        <span class="names-tooltip__source">${source}</span>
        <span class="names-tooltip__name">${name}</span>
      `
    },
    () => {
      el.style.display = 'none'
    },
  )

  return {
    destroy() {
      watcher.destroy()
      el.remove()
    },
  }
}
