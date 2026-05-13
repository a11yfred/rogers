# @a11yfred/rogers

Rogers is an accessibility debug tool for testing and development. Drop it into any project to see keyboard focus, accessible names, heading structure, and tab order in real time. No framework required, no dependencies.

## Install

```bash
npm install --save-dev @a11yfred/rogers
```

## How it works

Rogers has two layers:

- **Core:** plain JavaScript functions that watch the DOM. No framework needed.
- **Adapters:** thin wrappers for React, Vue, Angular, and Remix that wire the core into your framework's lifecycle.

Each adapter takes your framework's own hooks as parameters. Rogers never imports a framework itself, so it adds nothing to your bundle.

## Enabling rogers

Rogers checks `globalThis.ROGERS_DEV` at startup. If it is not `true`, all functions return immediately and do nothing.

Set it using a condition your build tool evaluates at build time, not a plain `true`. This ensures the flag is always `false` in a production bundle, even if someone forgets to remove the import.

```js
// Vite
if (import.meta.env.DEV) globalThis.ROGERS_DEV = true

// webpack / CRA
if (process.env.NODE_ENV !== 'production') globalThis.ROGERS_DEV = true

// Remix / Next.js
if (process.env.NODE_ENV === 'development') globalThis.ROGERS_DEV = true
```

Do this once in your app entry point, before rogers is imported. Never write `globalThis.ROGERS_DEV = true` as a bare statement. A build tool cannot tree-shake a hardcoded `true`.

For a plain HTML demo or local prototype with no build step, a bare `true` is fine since there is no production build:

```html
<script>globalThis.ROGERS_DEV = true</script>
<script type="module" src="./your-app.js"></script>
```

## File structure

```text
@a11yfred/rogers
├── core/
│   ├── focus.js      # focus tracking
│   ├── names.js      # accessible name lookup
│   ├── headings.js   # heading collection
│   └── tabstops.js   # tab order
├── overlay/          # DOM overlay renderers (no framework)
├── index.js          # vanilla exports
├── react.js          # React adapter
├── vue.js            # Vue adapter
├── angular.js        # Angular adapter
├── remix3.js         # Remix 3 adapter
└── debug.css         # styles for all overlays
```

## Demo

Run the demo locally with no install required:

```bash
npm run demo
```

Then open `http://localhost:3000`. The demo shows all four debug tools running on a page with intentional accessibility issues to inspect.

## Framework integration

Import `debug.css` once in your app entry point.

```js
import '@a11yfred/rogers/debug.css'
```

### Vanilla JS

```js
import {
  mountFocusDebugger, mountNamesDebugger,
  mountHeadingMapDebugger, mountTabStopsDebugger,
  mountDebugLauncher,
} from '@a11yfred/rogers'
import '@a11yfred/rogers/debug.css'

const state = { focus: null, names: null, headings: null, tabstops: null }

const launcher = mountDebugLauncher({
  onToggle(key, on) {
    if (on && !state[key])  state[key] = mount(key)
    if (!on && state[key]) { state[key].destroy(); state[key] = null }
  },
})

function mount(key) {
  if (key === 'focus')    return mountFocusDebugger()
  if (key === 'names')    return mountNamesDebugger()
  if (key === 'headings') return mountHeadingMapDebugger()
  if (key === 'tabstops') return mountTabStopsDebugger()
}
```

### React

```jsx
import { useState, useEffect, useRef } from 'react'
import { createComponents } from '@a11yfred/rogers/react'
import '@a11yfred/rogers/debug.css'

const {
  FocusDebugger, NamesDebugger, HeadingMapDebugger,
  TabStopsDebugger, DebugLauncher,
} = createComponents({ useEffect, useRef })

export default function Root() {
  const [active, setActive] = useState({
    focus: false, names: false, headings: false, tabstops: false,
  })

  function handleToggle(key, on) {
    setActive(prev => ({ ...prev, [key]: on }))
  }

  return (
    <>
      <Outlet />
      <FocusDebugger    enabled={active.focus} />
      <NamesDebugger    enabled={active.names} />
      <HeadingMapDebugger enabled={active.headings} />
      <TabStopsDebugger enabled={active.tabstops} />
      <DebugLauncher    enabled onToggle={handleToggle} />
    </>
  )
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

In a component:

```vue
<script setup>
import { ref } from 'vue'

const active = ref({ focus: false, names: false, headings: false, tabstops: false })

useFocusDebugger(computed(() => active.value.focus))
useNamesDebugger(computed(() => active.value.names))
useDebugLauncher({
  enabled: ref(true),
  onToggle(key, on) { active.value = { ...active.value, [key]: on } },
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

In a root component:

```ts
@Component({
  selector: 'app-root',
  providers: [FocusDebuggerService, NamesDebuggerService, DebugLauncherService],
})
export class AppComponent implements OnInit {
  private focus    = inject(FocusDebuggerService)
  private names    = inject(NamesDebuggerService)
  private launcher = inject(DebugLauncherService)

  ngOnInit() {
    this.launcher.enable({
      onToggle: (key, on) => {
        if (key === 'focus') on ? this.focus.enable() : this.focus.disable()
        if (key === 'names') on ? this.names.enable() : this.names.disable()
      },
    })
  }
}
```

### Remix 3

```js
// app/entry.client.js
import { rogers } from '@a11yfred/rogers/remix3'
import '@a11yfred/rogers/debug.css'

const debug = rogers({
  onToggle(key, on) {
    // handle tool state via your own state management
  },
})

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => debug.destroy())
}
```

## Vanilla API

### Core

| Export | Description |
| ------ | ----------- |
| `createFocusWatcher(onToast)` | Watches focus events. Calls `onToast({ label, hasFocusOutline, isFocusVisible })` |
| `createNamesWatcher(onTooltip, onClear)` | Watches mouse hover. Calls `onTooltip({ name, source, x, y })` |
| `createHeadingWatcher(onHeadings)` | Watches scroll and resize. Calls `onHeadings(headings[])` |
| `createTabStopWatcher(onStop, onClear)` | Watches tab keypresses. Calls `onStop({ seq, cx, cy, label })` |
| `formatTarget(el)` | Returns a `<tag.class>` string for an element |
| `getOutlineInfo(el)` | Returns `{ hasFocusOutline, isFocusVisible }` |
| `flashElement(el)` | Briefly highlights the element |
| `isControl(el)` | Returns true if the element is interactive |
| `getAccessibleName(el)` | Returns `{ name, source }` |
| `collectHeadings()` | Returns all headings on the page with metadata |
| `isTabbable(el)` | Returns true if the element is in the tab order |
| `getTabOrder()` | Returns all tabbable elements in order |

### Overlays

| Export | Description |
| ------ | ----------- |
| `mountFocusDebugger()` | Toast + element flash on keyboard focus |
| `mountNamesDebugger()` | Tooltip showing accessible name on hover |
| `mountHeadingMapDebugger()` | Overlay + panel showing heading structure |
| `mountTabStopsDebugger()` | Numbered overlay showing tab order |
| `mountDebugLauncher(options)` | Floating button with toggle menu |
| `mountDebugHelp(options)` | Full command reference panel |
| `mountDeployBanner(target)` | Fixed banner showing deployment target |

### mountDebugLauncher options

| Option | Type | Description |
| ------ | ---- | ----------- |
| `position` | `string` | FAB position. One of `bottom-right`, `bottom-left`, `bottom-center`, `top-right`, `top-left`, `top-center`, `middle-right`, `middle-left`. Default: `bottom-right` |
| `onToggle` | `(key, on) => void` | Called when a tool is toggled. `key` is one of `focus`, `names`, `headings`, `tabstops` |
| `customTools` | `Array` | Additional tools to show in the menu. Each item: `{ key, label, desc }` |
| `initialState` | `Record<string, boolean>` | Initial active state per tool key |

Returns `{ setActive(key, on), destroy() }`.

## CSS

Import `debug.css` once. It covers all overlays and is self-contained.

## License

MIT

---

*Built with help from Claude.*
