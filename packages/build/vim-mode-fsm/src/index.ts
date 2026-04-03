/**
 * @claude-patterns/vim-mode-fsm
 *
 * Finite state machine for vim modal editing with 11 modes.
 * Source: vim/ (5 files, 1,513 LOC)
 * KB: Recipe 5 — Vim Mode FSM
 * Tier: Build P3
 */

// 11-state mode union
export type VimMode =
  | "normal"
  | "insert"
  | "visual"
  | "visual_line"
  | "visual_block"
  | "replace"
  | "operator_pending"
  | "command_line"
  | "search"
  | "ex"
  | "select";

// Motion classification
export type MotionType =
  | "word"
  | "line"
  | "char"
  | "paragraph"
  | "sentence"
  | "search"
  | "mark"
  | "scroll";

// Operator classification
export type OperatorType =
  | "delete"
  | "change"
  | "yank"
  | "indent"
  | "outdent"
  | "format"
  | "uppercase"
  | "lowercase"
  | "toggleCase";

// Text object targets
export type TextObject =
  | "word"
  | "WORD"
  | "sentence"
  | "paragraph"
  | "bracket"
  | "quote"
  | "tag"
  | "block";

// Core vim state — tracks current mode, pending operator, and register
export interface VimState {
  mode: VimMode;
  count: number | null;
  operator: OperatorType | null;
  register: string;
  lastMotion: MotionType | null;
}

// Command-line input state
export interface CommandState {
  buffer: string;
  cursorPosition: number;
}

// Persistent state across mode transitions
export interface PersistentState {
  registers: Record<string, string>;
  marks: Record<string, number>;
  searchHistory: string[];
}

// Action produced by FSM transitions
export interface VimAction {
  type: "motion" | "operator" | "text_object" | "mode_change" | "command";
  payload: Record<string, unknown>;
}

// Result of a state transition
export interface TransitionResult {
  nextState: VimState;
  sideEffects: VimAction[];
}

// --- Mode-switch key mappings ---
const MODE_SWITCH_KEYS: Record<string, VimMode> = {
  i: "insert",
  I: "insert",
  a: "insert",
  A: "insert",
  o: "insert",
  O: "insert",
  v: "visual",
  V: "visual_line",
  R: "replace",
  ":": "command_line",
  "/": "search",
  "?": "search",
};

const OPERATOR_KEYS: Record<string, OperatorType> = {
  d: "delete",
  c: "change",
  y: "yank",
  ">": "indent",
  "<": "outdent",
  gq: "format",
  gU: "uppercase",
  gu: "lowercase",
  "~": "toggleCase",
};

const MOTION_KEYS = new Set([
  "w", "b", "e", "W", "B", "E",
  "j", "k", "h", "l",
  "$", "0", "^",
  "G", "gg",
  "{", "}",
  "(", ")",
  "f", "F", "t", "T",
]);

// --- Helper: create mode-change side effect ---
function modeChange(from: VimMode, to: VimMode): VimAction {
  return { type: "mode_change", payload: { from, to } };
}

// --- Handler functions for each mode ---

function handleNormalMode(state: VimState, input: string): TransitionResult {
  // Digit keys for count accumulation (1-9, or 0 if count already started)
  if (/^[1-9]$/.test(input) || (input === "0" && state.count !== null)) {
    const digit = parseInt(input, 10);
    const newCount = state.count !== null ? state.count * 10 + digit : digit;
    return {
      nextState: { ...state, count: newCount },
      sideEffects: [],
    };
  }

  // Mode-switch keys
  if (input in MODE_SWITCH_KEYS) {
    const targetMode = MODE_SWITCH_KEYS[input];
    return {
      nextState: { ...state, mode: targetMode, count: null },
      sideEffects: [modeChange("normal", targetMode)],
    };
  }

  // Operator keys
  if (input in OPERATOR_KEYS) {
    const op = OPERATOR_KEYS[input];
    return {
      nextState: { ...state, mode: "operator_pending", operator: op, count: null },
      sideEffects: [modeChange("normal", "operator_pending")],
    };
  }

  // Escape in normal mode — no-op
  if (input === "Escape") {
    return { nextState: state, sideEffects: [] };
  }

  // Unknown key — stay in normal, no side effects
  return { nextState: state, sideEffects: [] };
}

function handleInsertMode(state: VimState, input: string): TransitionResult {
  if (input === "Escape") {
    return {
      nextState: { ...state, mode: "normal" },
      sideEffects: [modeChange("insert", "normal")],
    };
  }
  // All other keys: typing (stay in insert, no FSM side effects)
  return { nextState: state, sideEffects: [] };
}

function handleVisualMode(state: VimState, input: string): TransitionResult {
  if (input === "Escape") {
    return {
      nextState: { ...state, mode: "normal" },
      sideEffects: [modeChange(state.mode, "normal")],
    };
  }

  // Operator keys in visual mode execute immediately on selection
  if (input in OPERATOR_KEYS) {
    const op = OPERATOR_KEYS[input];
    return {
      nextState: { ...state, mode: "normal", operator: null },
      sideEffects: [
        { type: "operator", payload: { operator: op, motion: "selection" } },
        modeChange(state.mode, "normal"),
      ],
    };
  }

  return { nextState: state, sideEffects: [] };
}

function handleOperatorPending(state: VimState, input: string): TransitionResult {
  if (input === "Escape") {
    return {
      nextState: { ...state, mode: "normal", operator: null },
      sideEffects: [modeChange("operator_pending", "normal")],
    };
  }

  // Motion keys execute the pending operator
  if (MOTION_KEYS.has(input)) {
    return {
      nextState: { ...state, mode: "normal", operator: null },
      sideEffects: [
        { type: "operator", payload: { operator: state.operator, motion: input } },
        modeChange("operator_pending", "normal"),
      ],
    };
  }

  return { nextState: state, sideEffects: [] };
}

function handleEscapeToNormal(state: VimState, input: string): TransitionResult {
  if (input === "Escape") {
    return {
      nextState: { ...state, mode: "normal" },
      sideEffects: [modeChange(state.mode, "normal")],
    };
  }
  return { nextState: state, sideEffects: [] };
}

// FSM transition function — maps (state, input) to (nextState, sideEffects)
export function transition(state: VimState, input: string): TransitionResult {
  switch (state.mode) {
    case "normal":
      return handleNormalMode(state, input);
    case "insert":
      return handleInsertMode(state, input);
    case "visual":
    case "visual_line":
    case "visual_block":
      return handleVisualMode(state, input);
    case "operator_pending":
      return handleOperatorPending(state, input);
    case "replace":
    case "command_line":
    case "search":
    case "ex":
    case "select":
      return handleEscapeToNormal(state, input);
    default:
      return { nextState: state, sideEffects: [] };
  }
}

// Factory for initial vim state (normal mode, no pending operator)
export function createInitialVimState(): VimState {
  return {
    mode: "normal",
    count: null,
    operator: null,
    register: '"',
    lastMotion: null,
  };
}
