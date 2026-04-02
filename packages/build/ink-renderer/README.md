# @claude-patterns/ink-renderer

High-level render types and component stubs for terminal UI.

## Source Reference

- **Files:** `ink/` (97 files)
- **LOC:** 19,848
- **KB Section:** 22 — Ink Renderer
- **Tier:** Build P3

## Key Concepts

- **Flexbox layout model** — Box component with row/column direction, padding, margin
- **Ink render lifecycle** — render() returns instance with rerender, unmount, waitUntilExit
- **Frame metrics** — FPS tracking, frame time, drop count for performance monitoring

## Exports

- `RenderOptions` — stdout, stdin, exitOnCtrlC, patchConsole
- `InkInstance` — Render handle: rerender, unmount, waitUntilExit, clear
- `BoxProps` — Flexbox layout properties
- `TextProps` — Text styling (color, bold, wrap mode, etc.)
- `ButtonProps` — Interactive button with onPress handler
- `FrameMetrics` — FPS and frame performance tracking
- `Ink` — Core renderer class
- `render()` — Top-level render function
- `Box()`, `Text()`, `Button()` — Component stubs

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
