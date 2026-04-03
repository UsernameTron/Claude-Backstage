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

// --- Module-level state ---
const bindings: Map<KeybindingSource, ParsedBinding[]> = new Map();

const KNOWN_MODIFIERS: ReadonlySet<string> = new Set<Modifier>(["ctrl", "alt", "shift", "meta", "cmd"]);

function isModifier(value: string): value is Modifier {
  return KNOWN_MODIFIERS.has(value);
}

// Parse a raw keystroke string into a structured binding
export function parseKeystroke(raw: string): ParsedBinding {
  // Find last "+" to split key from modifiers.
  // Edge case: "Ctrl++" means key is "+" and modifier is "ctrl".
  const lastPlus = raw.lastIndexOf("+");

  let key: string;
  let modPart: string;

  if (lastPlus === -1) {
    // No "+" at all — single key like "a"
    key = raw.toLowerCase();
    modPart = "";
  } else {
    const afterPlus = raw.slice(lastPlus + 1);
    if (afterPlus === "") {
      // Ends with "+", so key is "+" — modifiers are everything before the trailing "+"
      key = "+";
      const beforeTrailing = raw.slice(0, lastPlus);
      modPart = beforeTrailing;
    } else {
      key = afterPlus.toLowerCase();
      modPart = raw.slice(0, lastPlus);
    }
  }

  const modifiers: Modifier[] = modPart
    ? modPart
        .split("+")
        .map((m) => m.toLowerCase().trim())
        .filter(isModifier)
    : [];

  return { key, modifiers, context: "global", command: "" };
}

// Register a binding under a given source
export function registerBinding(
  source: KeybindingSource,
  binding: ParsedBinding,
): void {
  const list = bindings.get(source) || [];
  list.push(binding);
  bindings.set(source, list);
}

// Load all bindings from a given source
export function loadKeybindings(source: KeybindingSource): ParsedBinding[] {
  return bindings.get(source) || [];
}

// Resolve a key + modifiers in a context to a command
export function resolveKey(
  key: string,
  modifiers: Modifier[],
  context: KeyContext,
): ResolveResult {
  const normalizedKey = key.toLowerCase();
  const sortedMods = [...modifiers].sort();

  const matches: ParsedBinding[] = [];

  for (const sourceBindings of bindings.values()) {
    for (const b of sourceBindings) {
      if (b.key !== normalizedKey) continue;
      const bSortedMods = [...b.modifiers].sort();
      if (bSortedMods.length !== sortedMods.length) continue;
      if (!bSortedMods.every((m, i) => m === sortedMods[i])) continue;
      if (b.context !== context && b.context !== "global") continue;
      matches.push(b);
    }
  }

  if (matches.length === 0) {
    return { command: null, binding: null, conflicts: [] };
  }

  return {
    command: matches[0].command,
    binding: matches[0],
    conflicts: matches.slice(1),
  };
}

// Detect conflicts across a set of bindings
export function detectConflicts(bindings: ParsedBinding[]): KeybindingWarning[] {
  const groups = new Map<string, ParsedBinding[]>();

  for (const b of bindings) {
    const groupKey = `${b.key}|${[...b.modifiers].sort().join(",")}|${b.context}`;
    const list = groups.get(groupKey) || [];
    list.push(b);
    groups.set(groupKey, list);
  }

  const warnings: KeybindingWarning[] = [];

  for (const [, group] of groups) {
    if (group.length < 2) continue;
    // Only conflict if commands differ
    const commands = new Set(group.map((b) => b.command));
    if (commands.size <= 1) continue;
    warnings.push({
      type: "conflict",
      message: `Conflict: ${group[0].key} in ${group[0].context}`,
      bindings: group,
    });
  }

  return warnings;
}

// Clear all registered bindings (for test isolation)
export function resetState(): void {
  bindings.clear();
}
