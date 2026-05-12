// Known a11y overlay script signatures — src substrings and global variable names.
// Vendor list source: overlayfactsheet.com
// CDN domains and globals sourced from community research (overlay-fact-sheet, fwa, etc.)
export const OVERLAY_SIGNATURES = [
  { name: 'accessiBe',          src: 'acsbapp.com',              global: 'acsbJS' },
  { name: 'AudioEye',           src: 'audioeye.com',             global: 'AudioEye' },
  { name: 'UserWay',            src: 'userway.org',              global: 'UserWay' },
  { name: 'EqualWeb',           src: 'equalweb.com',             global: 'EqualWeb' },
  { name: 'MaxAccess',          src: 'maxaccess.io',             global: 'MaxAccess' },
  { name: 'Recite Me',          src: 'reciteme.com',             global: 'ReciteMe' },
  { name: 'ADA Site Comply',    src: 'adasitecompliance.com',    global: null },
  { name: 'Accessflow',         src: 'accessflow.ai',            global: null },
  { name: 'Ally',               src: 'allytechno.com',           global: null },
  { name: 'Enabler',            src: 'wcag.io',                  global: null },
  { name: 'UsableNet Assistive',src: 'usablenet.com',            global: null },
  { name: 'Equally AI',         src: 'equally.ai',               global: 'equally' },
  { name: 'Eye-Able',           src: 'eye-able.com',             global: 'EyeAble' },
  { name: 'TruAbilities',       src: 'truabilities.com',         global: null },
  { name: 'Adally',             src: 'adally.com',               global: null },
  { name: 'FACIL\'iti',         src: 'faciliti.com',             global: null },
  { name: 'WebAbility',         src: 'webability.io',            global: null },
  { name: 'Accessiway',         src: 'accessiway.com',           global: null },
  { name: 'True Accessibility', src: 'trueaccessibility.com',    global: null },
  { name: 'DIGIaccess',         src: 'digiaccess.net',           global: null },
  { name: 'Purple Lens',        src: 'pluro.com',                global: null },
  { name: 'User1st',            src: 'user1st.com',              global: null },
  { name: 'BrowseAloud',        src: 'browsealoud.com',          global: 'browsealoud' },
]

/**
 * Scans the current page for known a11y overlay scripts.
 * Checks both script[src] attributes and injected global variables.
 *
 * @param {typeof OVERLAY_SIGNATURES} [signatures]
 * @returns {string[]} Names of detected overlays
 */
export function detectOverlays(signatures = OVERLAY_SIGNATURES) {
  const found = []
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  for (const sig of signatures) {
    const bySrc = scripts.some(s => s.src.includes(sig.src))
    const byGlobal = sig.global && typeof window[sig.global] !== 'undefined'
    if (bySrc || byGlobal) found.push(sig.name)
  }
  return found
}
