# @claude-patterns/keyboard-shortcuts

Keybinding loading, resolution, conflict detection, and keystroke parsing.

## Source Reference

- **Files:** `keybindings/` (14 files)
- **LOC:** 3,159
- **KB Section:** 21 — Keyboard Shortcuts
- **Tier:** Build P3

## Key Concepts

- **17 contexts** — Bindings scoped to global, editor, terminal, panel, dialog, etc.
- **Conflict detection** — Identifies shadowed, conflicting, and invalid bindings
- **Source layering** — Default < platform < user < extension precedence

## Exports

- `KeyContext` — 17-context union type
- `Modifier` — Modifier key union (ctrl, alt, shift, meta, cmd)
- `ParsedBinding` — Structured binding with key, modifiers, context, command
- `KeybindingWarning` — Conflict/invalid/shadowed warning
- `ResolveResult` — Resolution result with command, binding, conflicts
- `KeybindingSource` — Source union (default, user, extension, platform)
- `loadKeybindings()` — Load bindings from a source
- `resolveKey()` — Resolve keystroke to command in context
- `parseKeystroke()` — Parse raw keystroke string
- `detectConflicts()` — Detect binding conflicts

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
