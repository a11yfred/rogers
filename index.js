// @a11yfred/rogers — portable a11y debug tools
// React shim: import from '@a11yfred/rogers/react'

// Vanilla overlay (no framework dependency)
export { mountFocusDebugger }      from './overlay/focus.js'
export { mountNamesDebugger }      from './overlay/names.js'
export { mountHeadingMapDebugger } from './overlay/headings.js'
export { mountTabStopsDebugger }   from './overlay/tabstops.js'
export { mountDebugLauncher }      from './overlay/launcher.js'
export { mountDebugHelp }          from './overlay/help.js'
export { mountDeployBanner }       from './overlay/banner.js'

// Vanilla core (no framework dependency)
export { createFocusWatcher, formatTarget, getOutlineInfo, flashElement } from './core/focus.js'
export { createNamesWatcher, isControl, getAccessibleName }               from './core/names.js'
export { createHeadingWatcher, collectHeadings }                          from './core/headings.js'
export { createTabStopWatcher, isTabbable, getTabOrder }                  from './core/tabstops.js'
export { detectOverlays, OVERLAY_SIGNATURES }                             from './core/overlays.js'
export { WCAG_CRITERIA, isValidSC }                                       from './core/wcag.js'
