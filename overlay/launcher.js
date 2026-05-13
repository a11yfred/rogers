const IS_DEV = !!globalThis.ROGERS_DEV

const POSITION_STYLES = {
  'bottom-right':  'bottom:1.25rem;right:1.25rem',
  'bottom-left':   'bottom:1.25rem;left:1.25rem',
  'bottom-center': 'bottom:1.25rem;left:50%;transform:translateX(-50%)',
  'top-right':     'top:1.25rem;right:1.25rem',
  'top-left':      'top:1.25rem;left:1.25rem',
  'top-center':    'top:1.25rem;left:50%;transform:translateX(-50%)',
  'middle-right':  'top:50%;right:1.25rem;transform:translateY(-50%)',
  'middle-left':   'top:50%;left:1.25rem;transform:translateY(-50%)',
}

const STANDARD_TOOLS = [
  { key: 'focus',    label: 'Focus watcher',  desc: 'Toast + flash on keyboard focus' },
  { key: 'names',    label: 'Names tooltip',  desc: 'Accessible name on hover' },
  { key: 'headings', label: 'Heading map',    desc: 'Outline overlay + panel' },
  { key: 'tabstops', label: 'Tab stops',      desc: 'Tab order sequence overlay' },
]

const FAB_SVG = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="10,1 17.66,5.5 17.66,14.5 10,19 2.34,14.5 2.34,5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="10" y1="1" x2="10" y2="7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="10" y1="12.5" x2="10" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="17.66" y1="5.5" x2="12.17" y2="8.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="7.83" y1="11.25" x2="2.34" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="2.34" y1="5.5" x2="7.83" y2="8.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="12.17" y1="11.25" x2="17.66" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

const INPUT_ICON_SVG = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
  <rect x="1.5" y="1.5" width="13" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/>
  <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

/**
 * Mounts the debug launcher FAB + toggle menu as vanilla DOM.
 *
 * @param {{
 *   position?: string,
 *   onToggle?: (key: string, active: boolean) => void,
 *   customTools?: Array<{ key: string, label: string, desc: string }>,
 *   initialState?: Record<string, boolean>
 * }} options
 * @returns {{ destroy: () => void, setActive: (key: string, active: boolean) => void }}
 */
export function mountDebugLauncher({ position = 'bottom-right', onToggle, customTools = [], initialState = {} } = {}) {
  if (!IS_DEV) return { destroy() {}, setActive() {} }

  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-right']
  const allTools = [...STANDARD_TOOLS, ...customTools]

  // ── State ──────────────────────────────────────────────────────────────────
  let open = false
  const active = Object.fromEntries(allTools.map(t => [t.key, initialState[t.key] ?? false]))

  // ── FAB ───────────────────────────────────────────────────────────────────
  const fab = document.createElement('button')
  fab.className = 'debug-launcher-fab'
  fab.setAttribute('style', posStyle)
  fab.setAttribute('aria-label', 'Open debug menu')
  fab.setAttribute('aria-expanded', 'false')
  fab.setAttribute('title', 'Debug Menu')
  fab.innerHTML = `${FAB_SVG}<span class="debug-launcher-fab__label">debug</span>`
  document.body.appendChild(fab)

  // ── Backdrop ──────────────────────────────────────────────────────────────
  const backdrop = document.createElement('div')
  backdrop.className = 'debug-fab-menu-backdrop'
  backdrop.style.display = 'none'
  document.body.appendChild(backdrop)

  // ── Menu ──────────────────────────────────────────────────────────────────
  const menu = document.createElement('div')
  menu.setAttribute('style', posStyle)
  menu.style.display = 'none'
  document.body.appendChild(menu)

  // ── Helpers ───────────────────────────────────────────────────────────────
  function close() {
    open = false
    fab.setAttribute('aria-expanded', 'false')
    backdrop.style.display = 'none'
    menu.style.display = 'none'
  }

  function toggle(key) {
    active[key] = !active[key]
    onToggle?.(key, active[key])
    renderMenu()
  }

  function toggleAll(on) {
    allTools.forEach(t => {
      active[t.key] = on
      onToggle?.(t.key, on)
    })
    renderMenu()
  }

  function renderMenu() {
    backdrop.style.display = ''
    menu.style.display = ''
    fab.setAttribute('aria-expanded', 'true')

    const allOn  = allTools.every(t => active[t.key])
    const allOff = allTools.every(t => !active[t.key])

    menu.className = 'debug-fab-menu'
    menu.setAttribute('role', 'menu')
    menu.innerHTML = `
      <div class="debug-fab-menu__header">
        <span class="debug-fab-menu__title">Debug</span>
        <button class="debug-fab-menu__close" aria-label="Close debug menu">✕</button>
      </div>
      <div class="debug-fab-menu__body">
        <div class="debug-fab-menu__section">
          <div class="debug-fab-menu__section-title">Tools</div>
          ${allTools.map(tool => `
            <button class="debug-fab-menu__row debug-fab-menu__row--toggle ${active[tool.key] ? 'debug-fab-menu__row--on' : ''}"
              role="menuitemcheckbox" aria-checked="${active[tool.key]}" data-key="${tool.key}">
              <span class="debug-fab-menu__toggle-indicator">${active[tool.key] ? '●' : '○'}</span>
              <span class="debug-fab-menu__toggle-label">${tool.label}</span>
              <span class="debug-fab-menu__desc">${tool.desc}</span>
            </button>
          `).join('')}
        </div>
        <div class="debug-fab-menu__section debug-fab-menu__section--actions">
          <button class="debug-fab-menu__action-btn" data-action="all-on" ${allOn ? 'disabled' : ''}>All on</button>
          <button class="debug-fab-menu__action-btn" data-action="all-off" ${allOff ? 'disabled' : ''}>All off</button>
        </div>
      </div>
    `

    menu.querySelector('.debug-fab-menu__close').addEventListener('click', close)

    menu.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => toggle(btn.dataset.key))
    })

    menu.querySelector('[data-action="all-on"]').addEventListener('click', () => toggleAll(true))
    menu.querySelector('[data-action="all-off"]').addEventListener('click', () => toggleAll(false))
  }

  // ── Event wiring ──────────────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    open = !open
    if (open) renderMenu()
    else close()
  })

  backdrop.addEventListener('click', close)

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && open) close()
  }
  document.addEventListener('keydown', handleKeydown)

  return {
    setActive(key, on) {
      active[key] = on
      if (open) renderMenu()
    },
    destroy() {
      document.removeEventListener('keydown', handleKeydown)
      fab.remove()
      backdrop.remove()
      menu.remove()
    },
  }
}
