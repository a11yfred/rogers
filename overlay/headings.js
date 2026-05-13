import { createHeadingWatcher } from '../core/headings.js'

const IS_DEV = !!globalThis.ROGERS_DEV

/**
 * Mounts the heading map overlay + panel DOM and wires a heading watcher.
 * Returns { destroy }.
 */
export function mountHeadingMapDebugger() {
  if (!IS_DEV) return { destroy() {} }

  const root = document.createElement('div')
  root.className = 'heading-map-overlay'
  root.setAttribute('aria-hidden', 'true')
  document.body.appendChild(root)

  // Panel is a persistent child — boxes are re-rendered on each update
  const panel = document.createElement('div')
  panel.className = 'heading-map-panel'
  root.appendChild(panel)

  let watcherRef = null

  function renderHeadings(headings) {
    // Remove old boxes (everything except the panel)
    Array.from(root.children).forEach(child => {
      if (child !== panel) child.remove()
    })

    headings.forEach(h => {
      const box = document.createElement('div')
      box.className = 'heading-map-box'
      box.style.cssText = `top:${h.top}px;left:${h.left}px;width:${h.width}px;height:${Math.max(h.height, 20)}px;border-color:${h.color}`
      const badge = document.createElement('span')
      badge.className = 'heading-map-badge'
      badge.style.background = h.color
      badge.textContent = h.tag
      box.appendChild(badge)
      root.insertBefore(box, panel)
    })

    panel.innerHTML = `
      <div class="heading-map-panel__title">Heading Map</div>
      <ol class="heading-map-panel__list">
        ${headings.map(h => `
          <li class="heading-map-panel__item" style="padding-left:${(parseInt(h.tag[1], 10) - 1) * 0.9}rem">
            <span class="heading-map-panel__level" style="color:${h.color}">${h.tag}</span>
            <span class="heading-map-panel__text">${h.text || '(empty)'}</span>
          </li>
        `).join('')}
      </ol>
      <button class="heading-map-panel__refresh">Refresh</button>
    `
    panel.querySelector('.heading-map-panel__refresh').addEventListener('click', () => {
      watcherRef?.refresh()
    })
  }

  const watcher = createHeadingWatcher(renderHeadings)
  watcherRef = watcher

  return {
    destroy() {
      watcher.destroy()
      root.remove()
    },
  }
}
