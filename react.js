import { useEffect, useRef } from 'react'
import { mountFocusDebugger }      from './overlay/focus.js'
import { mountNamesDebugger }      from './overlay/names.js'
import { mountHeadingMapDebugger } from './overlay/headings.js'
import { mountTabStopsDebugger }   from './overlay/tabstops.js'
import { mountDebugLauncher }      from './overlay/launcher.js'
import { mountDebugHelp }          from './overlay/help.js'
import { mountDeployBanner }       from './overlay/banner.js'

const IS_DEV = import.meta.env.DEV

function useOverlay(mountFn, enabled, deps) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountFn()
    return () => overlay.destroy()
  // deps passed by caller
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function FocusDebugger({ enabled = true }) {
  useOverlay(() => mountFocusDebugger(), enabled, [enabled])
  return null
}

export function NamesDebugger({ enabled = true }) {
  useOverlay(() => mountNamesDebugger(), enabled, [enabled])
  return null
}

export function HeadingMapDebugger({ enabled = false }) {
  useOverlay(() => mountHeadingMapDebugger(), enabled, [enabled])
  return null
}

export function TabStopsDebugger({ enabled = false }) {
  useOverlay(() => mountTabStopsDebugger(), enabled, [enabled])
  return null
}

export function DebugLauncher({ enabled = false, position = 'bottom-right', onCommand, customSections = [] }) {
  useOverlay(
    () => mountDebugLauncher({ position, onCommand, customSections }),
    enabled,
    [enabled, position, onCommand, customSections],
  )
  return null
}

export function DebugHelp({ open, onClose, customCommands = [] }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!IS_DEV) return
    const panel = mountDebugHelp({ onClose, customCommands })
    panelRef.current = panel
    return () => { panel.destroy(); panelRef.current = null }
  // customCommands is a stable reference from caller
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  useEffect(() => {
    if (!IS_DEV) return
    if (open) panelRef.current?.open()
    else panelRef.current?.close()
  }, [open])

  return null
}

export function DeployBanner({ target }) {
  const bannerRef = useRef(null)

  useEffect(() => {
    if (!IS_DEV) return
    const banner = mountDeployBanner(target)
    bannerRef.current = banner
    return () => { banner.destroy(); bannerRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bannerRef.current?.setTarget(target)
  }, [target])

  return null
}
