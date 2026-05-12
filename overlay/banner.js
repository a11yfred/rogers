const IS_DEV = import.meta.env.DEV

const LABELS = {
  netlify: 'Deploying to Netlify',
  pages:   'Deploying to GitHub Pages',
  vercel:  'Deploying to Vercel',
  off:     'Deploying OFF',
}

/**
 * Mounts the deploy banner DOM node. Returns { setTarget, destroy }.
 * target: 'netlify' | 'pages' | 'vercel' | 'off' | null
 */
export function mountDeployBanner(target) {
  if (!IS_DEV) return { setTarget() {}, destroy() {} }

  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  document.body.appendChild(el)

  function setTarget(t) {
    if (!t) { el.style.display = 'none'; return }
    el.style.display = ''
    el.className = `deploy-banner deploy-banner--${t}`
    el.textContent = LABELS[t] ?? t
  }

  setTarget(target)

  return {
    setTarget,
    destroy() { el.remove() },
  }
}
