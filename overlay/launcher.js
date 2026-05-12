const IS_DEV = import.meta.env.DEV

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

const STANDARD_SECTIONS = [
  {
    heading: 'A11y Testing',
    rows: [
      { cmd: 'debug all',       desc: 'All debug tools on' },
      { cmd: 'debug all off',   desc: 'All debug tools off' },
      { cmd: 'debug names',     desc: 'Name tooltips on' },
      { cmd: 'debug names off', desc: 'Name tooltips off' },
    ],
  },
  {
    heading: 'Deploy Banner',
    rows: [
      { cmd: 'debug deploy off',     desc: 'Off' },
      { cmd: 'debug deploy netlify', desc: 'Netlify' },
      { cmd: 'debug deploy pages',   desc: 'GitHub Pages' },
      { cmd: 'debug deploy vercel',  desc: 'Vercel' },
    ],
  },
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
 * Mounts the debug launcher FAB + command menu as vanilla DOM.
 *
 * @param {{ position?: string, onCommand?: (cmd: string) => void, customSections?: Array }} options
 * @returns {{ destroy: () => void }}
 */
export function mountDebugLauncher({ position = 'bottom-right', onCommand, customSections = [] } = {}) {
  if (!IS_DEV) return { destroy() {} }

  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-right']
  const allSections = [...STANDARD_SECTIONS, ...customSections]

  // ── State ──────────────────────────────────────────────────────────────────
  let open      = false
  let inputMode = false

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
    inputMode = false
    fab.setAttribute('aria-expanded', 'false')
    backdrop.style.display = 'none'
    menu.style.display = 'none'
  }

  function fire(cmd) {
    onCommand?.(cmd)
    close()
  }

  function renderMenu() {
    backdrop.style.display = ''
    menu.style.display = ''
    fab.setAttribute('aria-expanded', 'true')

    if (inputMode) {
      menu.className = 'debug-fab-menu debug-fab-menu--input'
      menu.innerHTML = `
        <div class="debug-fab-menu__header">
          <span class="debug-fab-menu__title">Command</span>
          <button class="debug-fab-menu__close" aria-label="Back to menu">←</button>
        </div>
        <input class="debug-spotlight-input debug-fab-input" type="text" placeholder="debug …"
          aria-label="Debug command input" autocomplete="off" spellcheck="false" />
        <p class="debug-spotlight-hint">Type a command and press <code>Enter</code> — <code>Esc</code> to close</p>
      `
      const input = menu.querySelector('input')
      input.focus()

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { const cmd = input.value.trim(); if (cmd) fire(cmd) }
        if (e.key === 'Escape') close()
      })

      menu.querySelector('.debug-fab-menu__close').addEventListener('click', () => {
        inputMode = false
        renderMenu()
      })
    } else {
      menu.className = 'debug-fab-menu'
      menu.setAttribute('role', 'menu')
      menu.innerHTML = `
        <div class="debug-fab-menu__header">
          <span class="debug-fab-menu__title">Debug</span>
          <div class="debug-fab-menu__header-actions">
            <button class="debug-fab-menu__icon-btn" aria-label="Open command input" title="Type a command  (/)">
              ${INPUT_ICON_SVG}
            </button>
            <button class="debug-fab-menu__close" aria-label="Close debug menu">✕</button>
          </div>
        </div>
        <div class="debug-fab-menu__body">
          ${allSections.map(section => `
            <div class="debug-fab-menu__section">
              <div class="debug-fab-menu__section-title">${section.heading}</div>
              ${section.rows.map(row => `
                <button class="debug-fab-menu__row" role="menuitem" data-cmd="${row.cmd}">
                  <code class="debug-fab-menu__cmd">${row.cmd}</code>
                  <span class="debug-fab-menu__desc">${row.desc}</span>
                </button>
              `).join('')}
            </div>
          `).join('')}
          <div class="debug-fab-menu__input-hint">Press <kbd>/</kbd> to type a command</div>
        </div>
      `

      menu.querySelector('.debug-fab-menu__icon-btn').addEventListener('click', () => {
        inputMode = true
        renderMenu()
      })

      menu.querySelector('.debug-fab-menu__close').addEventListener('click', close)

      menu.querySelectorAll('[data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => fire(btn.dataset.cmd))
      })
    }
  }

  // ── Event wiring ──────────────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    open = !open
    if (open) renderMenu()
    else close()
  })

  backdrop.addEventListener('click', close)

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && open) { close(); return }
    if (e.key === '/' && open && !inputMode) {
      e.preventDefault()
      inputMode = true
      renderMenu()
    }
  }
  document.addEventListener('keydown', handleKeydown)

  return {
    destroy() {
      document.removeEventListener('keydown', handleKeydown)
      fab.remove()
      backdrop.remove()
      menu.remove()
    },
  }
}
