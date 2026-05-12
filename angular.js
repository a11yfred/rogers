import { mountFocusDebugger }      from './overlay/focus.js'
import { mountNamesDebugger }      from './overlay/names.js'
import { mountHeadingMapDebugger } from './overlay/headings.js'
import { mountTabStopsDebugger }   from './overlay/tabstops.js'
import { mountDebugLauncher }      from './overlay/launcher.js'
import { mountDebugHelp }          from './overlay/help.js'
import { mountDeployBanner }       from './overlay/banner.js'

// Angular service factories for @a11yfred/rogers.
// Angular lifecycle methods are injected by the caller — no top-level Angular import.
// Usage: import { createServices } from '@a11yfred/rogers/angular'
//        const services = createServices({ DestroyRef, inject })
//        Use each service via Angular's inject() in a component or directive.

export function createServices({ DestroyRef, inject }) {

  function makeOverlayService(mountFn) {
    return class {
      #overlay = null
      #destroyRef = inject(DestroyRef)

      enable(options) {
        this.#overlay?.destroy()
        this.#overlay = mountFn(options)
        this.#destroyRef.onDestroy(() => {
          this.#overlay?.destroy()
          this.#overlay = null
        })
      }

      disable() {
        this.#overlay?.destroy()
        this.#overlay = null
      }
    }
  }

  const FocusDebuggerService      = makeOverlayService(() => mountFocusDebugger())
  const NamesDebuggerService      = makeOverlayService(() => mountNamesDebugger())
  const HeadingMapDebuggerService = makeOverlayService(() => mountHeadingMapDebugger())
  const TabStopsDebuggerService   = makeOverlayService(() => mountTabStopsDebugger())

  class DebugLauncherService {
    #overlay = null
    #destroyRef = inject(DestroyRef)

    enable({ position = 'bottom-right', onCommand, customSections = [] } = {}) {
      this.#overlay?.destroy()
      this.#overlay = mountDebugLauncher({ position, onCommand, customSections })
      this.#destroyRef.onDestroy(() => {
        this.#overlay?.destroy()
        this.#overlay = null
      })
    }

    disable() {
      this.#overlay?.destroy()
      this.#overlay = null
    }
  }

  class DebugHelpService {
    #panel = null
    #destroyRef = inject(DestroyRef)

    mount({ onClose, customCommands = [] } = {}) {
      this.#panel = mountDebugHelp({ onClose, customCommands })
      this.#destroyRef.onDestroy(() => {
        this.#panel?.destroy()
        this.#panel = null
      })
    }

    open()  { this.#panel?.open() }
    close() { this.#panel?.close() }
  }

  class DeployBannerService {
    #banner = null
    #destroyRef = inject(DestroyRef)

    mount(target) {
      this.#banner = mountDeployBanner(target)
      this.#destroyRef.onDestroy(() => {
        this.#banner?.destroy()
        this.#banner = null
      })
    }

    setTarget(target) { this.#banner?.setTarget(target) }
  }

  return {
    FocusDebuggerService,
    NamesDebuggerService,
    HeadingMapDebuggerService,
    TabStopsDebuggerService,
    DebugLauncherService,
    DebugHelpService,
    DeployBannerService,
  }
}
