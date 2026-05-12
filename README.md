# @a11yfred/rogers

Vanilla-first accessibility debug panel with a thin React wrapper. The savory layer of the [ulam](../../../docs/ulam.md) framework.

The React Query DevTools of accessibility. Drop it into any project, see focus, names, and contrast in real time.

## Packages

rogers is one of four ulam packages:

```text
ulam
├── @ulam/ube          sweet   — UI, components, CSS, theming, router, announce
├── @ulam/calamansi    sour    — i18n, hooks, utilities, logic
├── @a11yfred/rogers        savory  — a11y debug panel, vanilla-first  ← you are here
└── @ulam/sawsawan     bridge  — wires the three together
```

## Architecture

Vanilla-first: core inspection logic has no framework dependency. React is a thin mount/unmount wrapper.

```text
@a11yfred/rogers
├── core/
│   ├── focus.js      — formatTarget, getOutlineInfo, flashElement, createFocusWatcher
│   ├── names.js      — isControl, getAccessibleName, createNamesWatcher
│   ├── headings.js   — collectHeadings, createHeadingWatcher
│   └── tabstops.js   — isTabbable, getTabOrder, createTabStopWatcher
├── react/            — thin React wrappers (useEffect → create*Watcher)
│   ├── FocusDebugger.jsx
│   ├── NamesDebugger.jsx
│   ├── HeadingMapDebugger.jsx
│   └── TabStopsDebugger.jsx
├── DeployBanner.jsx  — pure-render React (no DOM watcher)
├── DebugHelp.jsx     — pure-render React
└── DebugLauncher.jsx — React FAB + command input
```

The `create*Watcher` functions follow a common pattern:

```js
const watcher = createFocusWatcher(callback)
// ...later:
watcher.destroy()
```

They are dev-only: each function checks `import.meta.env.DEV` and returns a no-op `{ destroy() {} }` in production.

---

## Exports

### React components

| Export | Description |
| ------ | ----------- |
| `FocusDebugger` | Keyboard focus toast + element flash on every focus event |
| `NamesDebugger` | Cursor-following tooltip showing accessible name of hovered element |
| `TabStopsDebugger` | Numbered overlay + SVG lines recording keyboard tab order |
| `HeadingMapDebugger` | Heading outline overlay + floating hierarchy panel |
| `DeployBanner` | Fixed bottom-left banner showing active deployment target |
| `DebugHelp` | Full command reference panel |
| `DebugLauncher` | FAB + spotlight input for projects without a built-in command field |

### Vanilla core

| Export | Description |
| ------ | ----------- |
| `createFocusWatcher(onToast)` | Attaches `focusin` listener; calls `onToast({ label, hasFocusOutline, isFocusVisible })` |
| `createNamesWatcher(onTooltip, onClear)` | Mouse listeners; calls `onTooltip({ name, source, x, y })` |
| `createHeadingWatcher(onHeadings)` | ResizeObserver + scroll; calls `onHeadings(headings[])` |
| `createTabStopWatcher(onStop, onClear)` | `focusin` listener; calls `onStop({ seq, cx, cy, label })` |
| `formatTarget(el)` | Returns `<tag.class>` string for an element |
| `getOutlineInfo(el)` | Returns `{ hasFocusOutline, isFocusVisible }` |
| `flashElement(el)` | Briefly overlays the element with a teal flash |
| `isControl(el)` | Returns true if element is an interactive control |
| `getAccessibleName(el)` | Returns `{ name, source }` — the ARIA accessible name + its source |
| `collectHeadings()` | Returns an array of heading metadata objects |
| `isTabbable(el)` | Returns true if element is in the natural tab order |
| `getTabOrder()` | Returns all tabbable elements in tab order |

---

## Framework integration

### React / Remix

Use the pre-built React components. Render them once near the root — they are dev-only and render nothing in production.

```jsx
// app/root.jsx (Remix) or src/App.jsx (Vite)
import {
  FocusDebugger,
  NamesDebugger,
  DeployBanner,
} from '@a11yfred/rogers'

export default function Root() {
  const [debugFocus, setDebugFocus] = useState(false)
  const [debugNames, setDebugNames] = useState(false)

  return (
    <>
      <Outlet />
      <FocusDebugger enabled={debugFocus} />
      <NamesDebugger enabled={debugNames} />
      <DeployBanner target="netlify" />
    </>
  )
}
```

For `DebugLauncher`, wire `onCommand` to your state setters:

```jsx
<DebugLauncher
  enabled
  onCommand={(cmd) => {
    if (cmd === 'debug names') setDebugNames(true)
    if (cmd === 'debug names off') setDebugNames(false)
    if (cmd === 'debug all') { setDebugFocus(true); setDebugNames(true) }
    if (cmd === 'debug all off') { setDebugFocus(false); setDebugNames(false) }
  }}
/>
```

### Vue

Use the vanilla core directly. Create composables that wrap `create*Watcher`:

```js
// composables/useRogers.js
import { ref, onMounted, onUnmounted } from 'vue'
import { createFocusWatcher, createNamesWatcher } from '@a11yfred/rogers'

export function useFocusDebugger(enabled) {
  const toast = ref(null)
  let watcher = null

  onMounted(() => {
    if (!enabled.value) return
    watcher = createFocusWatcher((data) => { toast.value = data })
  })

  onUnmounted(() => watcher?.destroy())

  return { toast }
}

export function useNamesDebugger(enabled) {
  const tooltip = ref(null)
  let watcher = null

  onMounted(() => {
    if (!enabled.value) return
    watcher = createNamesWatcher(
      (data) => { tooltip.value = data },
      () => { tooltip.value = null },
    )
  })

  onUnmounted(() => watcher?.destroy())

  return { tooltip }
}
```

Then in a component:

```vue
<script setup>
import { ref } from 'vue'
import { useFocusDebugger } from './composables/useRogers'

const enabled = ref(true)
const { toast } = useFocusDebugger(enabled)
</script>

<template>
  <div v-if="toast" class="focus-toast" aria-hidden="true">
    <code>{{ toast.label }}</code>
    <span>:focus-visible {{ toast.isFocusVisible ? '✓' : '✗' }}</span>
  </div>
</template>
```

Import `debug.css` once in your app entry:

```js
import '@a11yfred/rogers/debug.css'
```

### Angular

Use the vanilla core in Angular services:

```ts
// debug.service.ts
import { Injectable, OnDestroy } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { createFocusWatcher, createNamesWatcher } from '@a11yfred/rogers'

@Injectable({ providedIn: 'root' })
export class DebugService implements OnDestroy {
  toast$ = new BehaviorSubject<{ label: string; hasFocusOutline: boolean; isFocusVisible: boolean } | null>(null)
  tooltip$ = new BehaviorSubject<{ name: string; source: string; x: number; y: number } | null>(null)

  private focusWatcher: { destroy(): void } | null = null
  private namesWatcher: { destroy(): void } | null = null

  enableFocus() {
    this.focusWatcher?.destroy()
    this.focusWatcher = createFocusWatcher((data) => this.toast$.next(data))
  }

  enableNames() {
    this.namesWatcher?.destroy()
    this.namesWatcher = createNamesWatcher(
      (data) => this.tooltip$.next(data),
      () => this.tooltip$.next(null),
    )
  }

  disableAll() {
    this.focusWatcher?.destroy()
    this.namesWatcher?.destroy()
    this.focusWatcher = null
    this.namesWatcher = null
    this.toast$.next(null)
    this.tooltip$.next(null)
  }

  ngOnDestroy() { this.disableAll() }
}
```

Use in a component:

```ts
@Component({
  selector: 'app-focus-toast',
  template: `
    <div *ngIf="debug.toast$ | async as toast" class="focus-toast" aria-hidden="true">
      <code>{{ toast.label }}</code>
      <span>:focus-visible {{ toast.isFocusVisible ? '✓' : '✗' }}</span>
    </div>
  `,
})
export class FocusToastComponent {
  constructor(public debug: DebugService) {}
}
```

Import `debug.css` in `angular.json` styles or your global stylesheet:

```json
"styles": ["node_modules/@a11yfred/rogers/debug.css", "src/styles.css"]
```

### Vanilla JS (script tag / no framework)

Use the watcher factories directly. Wire them to your own DOM or to nothing — just inspect:

```js
import { createFocusWatcher, createNamesWatcher } from '@a11yfred/rogers'

// Log focus events to the console
const focus = createFocusWatcher(({ label, isFocusVisible }) => {
  console.log(`[focus] ${label} | :focus-visible ${isFocusVisible ? '✓' : '✗'}`)
})

// Log accessible names on hover
const names = createNamesWatcher(
  ({ name, source }) => console.log(`[name] ${name} (${source})`),
  () => {},
)

// Clean up when done
focus.destroy()
names.destroy()
```

---

## Debug commands

Type in the search bar (live search on) or submit (live search off):

| Command | Effect |
| ------- | ------ |
| `debug help` | Show the full command reference panel |
| `debug all on` | Enable focus toast and announce visualization |
| `debug all off` | Disable focus toast and announce visualization |
| `debug names on` | Show accessible name tooltip on hover |
| `debug names off` | Hide accessible name tooltip |

---

## CSS

All styles live in `debug.css`. Import it once — it covers all components.

rogers CSS is self-contained and opinionated (dark, high contrast). No ube token dependency — looks the same regardless of host app theme.

---

## License

MIT
