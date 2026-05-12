# @a11yfred/rogers

Rogers is an accessibility debug panel for testing and development. Drop it into any project to see keyboard focus, accessible names, heading structure, and tab order in real time. No framework required, no dependencies needed. It works with React, Vue, Angular, and Remix. Rogers only runs in development and does nothing in production. More planned soon.

## Install

```bash
npm install --save-dev @a11yfred/rogers
```

## How it works

Rogers has two layers:

- **Core** — plain JavaScript functions that watch the DOM. No framework needed.
- **Adapters** — thin wrappers for React, Vue, Angular, and Remix that wire the core into your framework's lifecycle.

Each adapter takes your framework's own hooks as parameters. Rogers never imports a framework itself, so it adds nothing to your bundle.

All watcher functions check `import.meta.env.DEV` at startup. In a production build they return immediately and do nothing.

## File structure

```text
@a11yfred/rogers
├── core/
│   ├── focus.js      — focus tracking
│   ├── names.js      — accessible name lookup
│   ├── headings.js   — heading collection
│   └── tabstops.js   — tab order
├── overlay/          — DOM overlay renderers (no framework)
├── index.js          — vanilla exports
├── react.js          — React / Remix 2 adapter
├── vue.js            — Vue adapter
├── angular.js        — Angular adapter
├── remix3.js         — Remix 3 / vanilla adapter
└── debug.css         — styles for all overlays
```

## Framework integration

Import `debug.css` once in your app entry point.

```js
import '@a11yfred/rogers/debug.css'
```

### React / Remix 2

```jsx
import { useState, useEffect, useRef } from 'react'
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

Remix 3 does not require React. Use the vanilla adapter in your client entry point.

```js
// app/entry.client.js
import { rogers } from '@a11yfred/rogers/remix3'
import '@a11yfred/rogers/debug.css'

const debug = rogers({
  focus:    true,
  names:    true,
  deploy:   'netlify',
  launcher: {
    onCommand(cmd) {
      // handle commands via your own state
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

In a component:

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

### Vanilla JS

```js
import { createFocusWatcher, createNamesWatcher } from '@a11yfred/rogers'

const focus = createFocusWatcher(({ label, isFocusVisible }) => {
  console.log(`[focus] ${label} | :focus-visible ${isFocusVisible ? '✓' : '✗'}`)
})

const names = createNamesWatcher(
  ({ name, source }) => console.log(`[name] ${name} (${source})`),
  () => {},
)

// Clean up when done
focus.destroy()
names.destroy()
```

## Vanilla API

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

## React components

These are returned by `createComponents({ useEffect, useRef })`.

| Component | Description |
| --------- | ----------- |
| `FocusDebugger` | Shows a toast and flashes the element on every focus event |
| `NamesDebugger` | Shows a tooltip with the accessible name of the hovered element |
| `TabStopsDebugger` | Numbered overlay showing the tab order |
| `HeadingMapDebugger` | Overlay showing heading structure |
| `DeployBanner` | Fixed banner showing the active deployment target |
| `DebugHelp` | Full command reference panel |
| `DebugLauncher` | Floating button and command input |

## Debug commands

These work in the `DebugLauncher` command input.

| Command | Effect |
| ------- | ------ |
| `debug help` | Show the command reference panel |
| `debug all on` | Enable focus and names |
| `debug all off` | Disable focus and names |
| `debug names on` | Show accessible name tooltip |
| `debug names off` | Hide accessible name tooltip |

## CSS

Import `debug.css` once. It covers all components and overlays. The styles are self-contained and work regardless of your app's theme.

## License

MIT
