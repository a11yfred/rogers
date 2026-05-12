# @a11yfred/rogers

Rogers is an accessibility debug panel for testing and development. Drop it into any project to see keyboard focus, accessible names, heading structure, and tab order in real time. No framework required, no dependencies needed. It works with React, Vue, Angular, and Remix. Rogers only runs in development and does nothing in production. More planned soon.

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

Each adapter injects framework primitives rather than importing them — so rogers itself has zero framework dependencies.

### React / Remix 2

```jsx
import { useEffect, useRef } from 'react'
import { createComponents } from '@a11yfred/rogers/react'

const {
  FocusDebugger, NamesDebugger, DeployBanner,
  DebugLauncher, DebugHelp, TabStopsDebugger, HeadingMapDebugger,
} = createComponents({ useEffect, useRef })

export default function Root() {
  const [debugFocus, setDebugFocus] = useState(false)
  const [debugNames, setDebugNames] = useState(false)

  return (
    <>
      <Outlet />
      <FocusDebugger enabled={debugFocus} />
      <NamesDebugger enabled={debugNames} />
      <DeployBanner target="netlify" />
      <DebugLauncher
        enabled
        onCommand={(cmd) => {
          if (cmd === 'debug names')     setDebugNames(true)
          if (cmd === 'debug names off') setDebugNames(false)
          if (cmd === 'debug all')       { setDebugFocus(true); setDebugNames(true) }
          if (cmd === 'debug all off')   { setDebugFocus(false); setDebugNames(false) }
        }}
      />
    </>
  )
}
```

### Remix 3

Remix 3 drops React as a hard dependency. Use the vanilla adapter in your client entry point:

```js
// app/entry.client.js
import { rogers } from '@a11yfred/rogers/remix3'
import '@a11yfred/rogers/debug.css'

const debug = rogers({
  focus:   true,
  names:   true,
  deploy:  'netlify',
  launcher: {
    onCommand(cmd) {
      if (cmd === 'debug names') debug // handle via your own state
    },
  },
})

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => debug.destroy())
}
```

### Vue

```js
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { createComposables } from '@a11yfred/rogers/vue'
import '@a11yfred/rogers/debug.css'

const { useFocusDebugger, useNamesDebugger, useDebugLauncher } =
  createComposables({ onMounted, onUnmounted, watch, ref })
```

Then in a component:

```vue
<script setup>
import { ref } from 'vue'
const focusEnabled = ref(true)
const namesEnabled = ref(false)
useFocusDebugger(focusEnabled)
useNamesDebugger(namesEnabled)
useDebugLauncher({
  enabled: ref(true),
  onCommand(cmd) {
    if (cmd === 'debug names')     namesEnabled.value = true
    if (cmd === 'debug names off') namesEnabled.value = false
  },
})
</script>
```

### Angular

```ts
import { inject, DestroyRef } from '@angular/core'
import { createServices } from '@a11yfred/rogers/angular'

const { FocusDebuggerService, NamesDebuggerService, DebugLauncherService } =
  createServices({ DestroyRef, inject })
```

Provide and inject in a root component:

```ts
@Component({
  selector: 'app-root',
  providers: [FocusDebuggerService, NamesDebuggerService, DebugLauncherService],
})
export class AppComponent implements OnInit {
  private focus   = inject(FocusDebuggerService)
  private names   = inject(NamesDebuggerService)
  private launcher = inject(DebugLauncherService)

  ngOnInit() {
    this.focus.enable()
    this.launcher.enable({
      onCommand: (cmd) => {
        if (cmd === 'debug names')     this.names.enable()
        if (cmd === 'debug names off') this.names.disable()
      },
    })
  }
}
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
