const IS_DEV = import.meta.env.DEV

function renderSection(section) {
  return `
    <section class="debug-help-section">
      <h3 class="debug-help-section-title">${section.heading}</h3>
      ${section.note ? `<p class="debug-help-note">${section.note}</p>` : ''}
      <table class="debug-help-table"><tbody>
        ${section.rows.map(r => `<tr><td><code>${r.cmd}</code></td><td>${r.desc}</td></tr>`).join('')}
      </tbody></table>
    </section>
  `
}

/**
 * Mounts the debug help panel as vanilla DOM. Returns { open, close, destroy }.
 *
 * @param {{ onClose?: () => void, customCommands?: Array }} options
 */
export function mountDebugHelp({ onClose, customCommands = [] } = {}) {
  if (!IS_DEV) return { open() {}, close() {}, destroy() {} }

  const overlay = document.createElement('div')
  overlay.className = 'debug-help-overlay'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.display = 'none'

  overlay.innerHTML = `
    <div class="debug-help-panel">
      <div class="debug-help-header">
        <span class="debug-help-title">Debug Commands</span>
        <button class="debug-help-close" aria-label="Close debug help">✕</button>
      </div>
      <div class="debug-help-body">
        ${renderSection({
          heading: 'A11y Testing',
          note: 'Append <code>off</code> to disable any toggle (e.g. <code>debug all off</code>).',
          rows: [
            { cmd: 'debug all',   desc: 'All debug tools (KB focus, announce, names)' },
            { cmd: 'debug names', desc: 'Accessible name tooltip on hover' },
          ],
        })}
        ${renderSection({
          heading: 'Deployment',
          rows: [
            { cmd: 'debug deploy off',     desc: 'Off (no banner)' },
            { cmd: 'debug deploy on',      desc: 'Netlify, active target' },
            { cmd: 'debug deploy netlify', desc: 'Netlify banner' },
            { cmd: 'debug deploy pages',   desc: 'GitHub Pages' },
            { cmd: 'debug deploy vercel',  desc: 'Vercel' },
          ],
        })}
        ${customCommands.map(renderSection).join('')}
        <section class="debug-help-section">
          <h3 class="debug-help-section-title">Easter Eggs</h3>
          <h4 class="debug-help-subsection-title">Hidden Languages</h4>
          <p class="debug-help-note">Append <code> off</code> to any command to restore English (e.g. <code>klingon off</code>).</p>
          <table class="debug-help-table"><tbody>
            <tr><td><code>pig latin</code></td><td>Pig Latin</td></tr>
            <tr><td><code>pirate</code></td><td>Pirate English</td></tr>
            <tr><td><code>klingon</code></td><td>tlhIngan Hol (Klingon)</td></tr>
            <tr><td><code>valyrian</code></td><td>High Valyrian</td></tr>
            <tr><td><code>belter</code></td><td>Lang Belta (The Expanse)</td></tr>
            <tr><td><code>dothraki</code></td><td>Dothraki (Game of Thrones)</td></tr>
            <tr><td><code>toki pona</code></td><td>Toki Pona (minimalist conlang)</td></tr>
            <tr><td><code>navi</code></td><td>Na'vi (Avatar)</td></tr>
            <tr><td><code>quenya</code></td><td>Quenya (Tolkien High Elvish)</td></tr>
            <tr><td><code>sindarin</code></td><td>Sindarin (Tolkien Grey Elvish)</td></tr>
            <tr><td><code>hodor</code></td><td>Hodor (Game of Thrones)</td></tr>
            <tr><td><code>dovahzul</code></td><td>Dovahzul (Skyrim Dragon Language)</td></tr>
            <tr><td><code>nadsat</code></td><td>Nadsat (A Clockwork Orange)</td></tr>
            <tr><td><code>newspeak</code></td><td>Newspeak (1984)</td></tr>
            <tr><td><code>mandoa</code></td><td>Mando'a (Star Wars)</td></tr>
            <tr><td><code>cityspeak</code></td><td>Cityspeak (Blade Runner polyglot)</td></tr>
            <tr><td><code>simlish</code></td><td>Simlish (The Sims)</td></tr>
            <tr><td><code>alienese</code></td><td>Alienese / Futurama English</td></tr>
          </tbody></table>
          <h4 class="debug-help-subsection-title">Secret Settings</h4>
          <table class="debug-help-table"><tbody>
            <tr><td><code>fiesta mode off</code></td><td>Restore appearance to Auto</td></tr>
          </tbody></table>
        </section>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  const panel = overlay.querySelector('.debug-help-panel')

  function doClose() {
    overlay.style.display = 'none'
    onClose?.()
  }

  overlay.querySelector('.debug-help-close').addEventListener('click', doClose)
  overlay.addEventListener('click', doClose)
  panel.addEventListener('click', (e) => e.stopPropagation())

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') doClose()
  }
  document.addEventListener('keydown', handleKeydown)

  return {
    open()  { overlay.style.display = '' },
    close() { overlay.style.display = 'none' },
    destroy() {
      document.removeEventListener('keydown', handleKeydown)
      overlay.remove()
    },
  }
}
