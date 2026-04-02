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

// FSM transition function — maps (state, input) to (nextState, sideEffects)
export function transition(_state: VimState, _input: string): TransitionResult {
  // TODO: extract from vim/ FSM transition logic
  throw new Error("TODO: extract from vim/ FSM transition logic");
}

// Factory for initial vim state (normal mode, no pending operator)
export function createInitialVimState(): VimState {
  // TODO: extract from vim/ initial state factory
  throw new Error("TODO: extract from vim/ initial state factory");
}
