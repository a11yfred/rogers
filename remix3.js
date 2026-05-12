import { mountFocusDebugger }      from './overlay/focus.js'
import { mountNamesDebugger }      from './overlay/names.js'
import { mountHeadingMapDebugger } from './overlay/headings.js'
import { mountTabStopsDebugger }   from './overlay/tabstops.js'
import { mountDebugLauncher }      from './overlay/launcher.js'
import { mountDebugHelp }          from './overlay/help.js'
import { mountDeployBanner }       from './overlay/banner.js'

// Remix 3 / vanilla adapter for @a11yfred/rogers.
// No framework dependency. Mount in a client entry point or clientLoader.
// All overlays are dev-only and no-op in production.
//
// Usage:
//   import { rogers } from '@a11yfred/rogers/remix3'
//   // in app/entry.client.js or a root clientLoader:
//   const debug = rogers({ focus: true, names: true, deploy: 'netlify' })
//   // cleanup if needed (e.g. HMR):
//   debug.destroy()

export function rogers({
  focus         = false,
  names         = false,
  headings      = false,
  tabStops      = false,
  deploy        = null,
  launcher      = null,
  help          = null,
} = {}) {
  const overlays = []

  if (focus)    overlays.push(mountFocusDebugger())
  if (names)    overlays.push(mountNamesDebugger())
  if (headings) overlays.push(mountHeadingMapDebugger())
  if (tabStops) overlays.push(mountTabStopsDebugger())
  if (deploy)   overlays.push(mountDeployBanner(deploy))

  if (launcher) {
    const { position = 'bottom-right', onCommand, customSections = [] } = launcher
    overlays.push(mountDebugLauncher({ position, onCommand, customSections }))
  }

  let helpPanel = null
  if (help) {
    const { onClose, customCommands = [] } = help
    helpPanel = mountDebugHelp({ onClose, customCommands })
    overlays.push(helpPanel)
  }

  return {
    openHelp()  { helpPanel?.open() },
    closeHelp() { helpPanel?.close() },
    destroy()   { overlays.forEach(o => o.destroy()) },
  }
}
