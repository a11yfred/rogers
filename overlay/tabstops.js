import { createTabStopWatcher } from '../core/tabstops.js'

const IS_DEV = import.meta.env.DEV

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Mounts the tab stops overlay DOM and wires a tab stop watcher.
 * Returns { destroy }.
 */
export function mountTabStopsDebugger() {
  if (!IS_DEV) return { destroy() {} }

  const root = document.createElement('div')
  root.className = 'tab-stops-overlay'
  root.setAttribute('aria-hidden', 'true')
  document.body.appendChild(root)

  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'tab-stops-svg')
  root.appendChild(svg)

  const hint = document.createElement('div')
  hint.className = 'tab-stops-hint'
  hint.textContent = 'Tab through the page to record focus order'
  root.appendChild(hint)

  const clearBtn = document.createElement('button')
  clearBtn.className = 'tab-stops-clear'
  clearBtn.textContent = 'Clear'
  clearBtn.style.display = 'none'
  root.appendChild(clearBtn)

  let stops = []

  function renderStop(stop) {
    stops.push(stop)
    hint.style.display = 'none'
    clearBtn.style.display = ''

    // Badge
    const badge = document.createElement('div')
    badge.className = 'tab-stop-badge'
    badge.style.left = `${stop.cx}px`
    badge.style.top  = `${stop.cy}px`
    badge.textContent = stop.seq
    root.insertBefore(badge, svg.nextSibling)

    // SVG line from previous stop
    if (stops.length > 1) {
      const prev = stops[stops.length - 2]
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', prev.cx)
      line.setAttribute('y1', prev.cy)
      line.setAttribute('x2', stop.cx)
      line.setAttribute('y2', stop.cy)
      line.setAttribute('stroke', 'rgb(0 200 230 / 0.55)')
      line.setAttribute('stroke-width', '1.5')
      line.setAttribute('stroke-dasharray', '4 3')
      svg.appendChild(line)
    }
  }

  function clearAll() {
    stops = []
    svg.innerHTML = ''
    // Remove all badges (everything between svg and hint)
    Array.from(root.children).forEach(child => {
      if (child !== svg && child !== hint && child !== clearBtn) child.remove()
    })
    hint.style.display = ''
    clearBtn.style.display = 'none'
    watcherRef?.clear()
  }

  clearBtn.addEventListener('click', clearAll)

  let watcherRef = null
  const watcher = createTabStopWatcher(renderStop, clearAll)
  watcherRef = watcher

  return {
    destroy() {
      watcher.destroy()
      root.remove()
    },
  }
}
