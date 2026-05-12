import { mountFocusDebugger }      from './overlay/focus.js'
import { mountNamesDebugger }      from './overlay/names.js'
import { mountHeadingMapDebugger } from './overlay/headings.js'
import { mountTabStopsDebugger }   from './overlay/tabstops.js'
import { mountDebugLauncher }      from './overlay/launcher.js'
import { mountDebugHelp }          from './overlay/help.js'
import { mountDeployBanner }       from './overlay/banner.js'

// Vue composables for @a11yfred/rogers.
// Vue is injected by the caller — no top-level Vue import.
// Usage: import { createComposables } from '@a11yfred/rogers/vue'
//        const { useFocusDebugger } = createComposables({ onMounted, onUnmounted, watch, ref })

export function createComposables({ onMounted, onUnmounted, watch, ref }) {

  function useOverlay(mountFn, enabled) {
    let overlay = null

    onMounted(() => {
      if (enabled?.value ?? enabled) overlay = mountFn()
    })

    onUnmounted(() => {
      overlay?.destroy()
      overlay = null
    })

    if (watch && enabled?.value !== undefined) {
      watch(enabled, (val) => {
        if (val && !overlay) overlay = mountFn()
        else if (!val && overlay) { overlay.destroy(); overlay = null }
      })
    }
  }

  function useFocusDebugger(enabled = ref(true)) {
    useOverlay(() => mountFocusDebugger(), enabled)
  }

  function useNamesDebugger(enabled = ref(true)) {
    useOverlay(() => mountNamesDebugger(), enabled)
  }

  function useHeadingMapDebugger(enabled = ref(false)) {
    useOverlay(() => mountHeadingMapDebugger(), enabled)
  }

  function useTabStopsDebugger(enabled = ref(false)) {
    useOverlay(() => mountTabStopsDebugger(), enabled)
  }

  function useDebugLauncher(options = {}) {
    const { enabled = ref(false), position = 'bottom-right', onCommand, customSections = [] } = options
    useOverlay(() => mountDebugLauncher({ position, onCommand, customSections }), enabled)
  }

  function useDebugHelp({ open, onClose, customCommands = [] } = {}) {
    let panel = null

    onMounted(() => {
      panel = mountDebugHelp({ onClose, customCommands })
    })

    onUnmounted(() => {
      panel?.destroy()
      panel = null
    })

    if (watch && open?.value !== undefined) {
      watch(open, (val) => {
        if (val) panel?.open()
        else panel?.close()
      })
    }
  }

  function useDeployBanner(target) {
    let banner = null

    onMounted(() => {
      banner = mountDeployBanner(target?.value ?? target)
    })

    onUnmounted(() => {
      banner?.destroy()
      banner = null
    })

    if (watch && target?.value !== undefined) {
      watch(target, (val) => banner?.setTarget(val))
    }
  }

  return {
    useFocusDebugger,
    useNamesDebugger,
    useHeadingMapDebugger,
    useTabStopsDebugger,
    useDebugLauncher,
    useDebugHelp,
    useDeployBanner,
  }
}
