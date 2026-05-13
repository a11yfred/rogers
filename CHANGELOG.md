# Changelog

## 0.2.1  -  2026-05-13

Docs cleanup: remove em dashes, fix markdownlint issues, update package tree framing.

---

## 0.2.0  -  2026-05-13

### Breaking change

`IS_DEV` guard changed from `import.meta.env.DEV` to `globalThis.ROGERS_DEV`.

Rogers is now build-tool-agnostic. To enable debug overlays in a Vite project, add to `vite.config.js`:

```js
define: { 'globalThis.ROGERS_DEV': 'import.meta.env.DEV' }
```

For other build tools, set `globalThis.ROGERS_DEV = true` before importing rogers.

### Features

- New toggle-based FAB (`DebugLauncher`): on/off switches with all-on/all-off actions, replaces command-based rows
- `onToggle` API on `DebugLauncher`
- Added `index.html` demo page
- Fix: focus toast positioning corrected

---

## 0.1.0  -  2026-05-09

Initial release. React adapter (`createComponents`), Vue, Angular, and Remix 3 adapters. Focus, names, tab stops, heading map debuggers. Deploy banner. Debug launcher FAB.
