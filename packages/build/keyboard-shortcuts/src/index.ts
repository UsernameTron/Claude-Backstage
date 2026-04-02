/**
 * @claude-patterns/keyboard-shortcuts
 *
 * Keybinding loading, resolution, conflict detection, and keystroke parsing.
 * Source: keybindings/ (14 files, 3,159 LOC)
 * KB: Section 21 — Keyboard Shortcuts
 * Tier: Build P3
 */

// 17 keybinding contexts
export type KeyContext =
  | "global"
  | "editor"
  | "terminal"
  | "panel"
  | "dialog"
  | "menu"
  | "sidebar"
  | "statusbar"
  | "tab"
  | "search"
  | "debug"
  | "explorer"
  | "scm"
  | "output"
  | "problems"
  | "extensions"
  | "settings";

// Keyboard modifier keys
export type Modifier = "ctrl" | "alt" | "shift" | "meta" | "cmd";

// Parsed key binding with context and optional when-clause
export interface ParsedBinding {
  key: string;
  modifiers: Modifier[];
  context: KeyContext;
  command: string;
  when?: string;
}

// Warning from conflict detection
export interface KeybindingWarning {
  type: "conflict" | "invalid" | "shadowed";
  message: string;
  bindings: ParsedBinding[];
}

// Result of resolving a keystroke to a command
export interface ResolveResult {
  command: string | null;
  binding: ParsedBinding | null;
  conflicts: ParsedBinding[];
}

// Source of keybinding definitions
export type KeybindingSource = "default" | "user" | "extension" | "platform";

// Load all bindings from a given source
export function loadKeybindings(_source: KeybindingSource): ParsedBinding[] {
  // TODO: extract from keybindings/ loading logic
  throw new Error("TODO: extract from keybindings/ loading logic");
}

// Resolve a key + modifiers in a context to a command
export function resolveKey(
  _key: string,
  _modifiers: Modifier[],
  _context: KeyContext,
): ResolveResult {
  // TODO: extract from keybindings/ resolution logic
  throw new Error("TODO: extract from keybindings/ resolution logic");
}

// Parse a raw keystroke string into a structured binding
export function parseKeystroke(_raw: string): ParsedBinding {
  // TODO: extract from keybindings/ parser
  throw new Error("TODO: extract from keybindings/ parser");
}

// Detect conflicts across a set of bindings
export function detectConflicts(_bindings: ParsedBinding[]): KeybindingWarning[] {
  // TODO: extract from keybindings/ conflict detection
  throw new Error("TODO: extract from keybindings/ conflict detection");
}
