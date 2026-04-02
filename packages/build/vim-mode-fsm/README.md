# @claude-patterns/vim-mode-fsm

Finite state machine for vim modal editing with 11 modes.

## Source Reference

- **Files:** `vim/` (5 files)
- **LOC:** 1,513
- **KB:** Recipe 5 — Vim Mode FSM
- **Tier:** Build P3

## Key Concepts

- **11-state FSM** — Normal, insert, visual (3 variants), replace, operator-pending, command-line, search, ex, select
- **Operator-pending mode** — Composes operator + motion/text-object before executing
- **Transition function** — Pure (state, input) -> (nextState, sideEffects) mapping

## Exports

- `VimMode` — 11-state union type
- `VimState` — Core state: mode, count, operator, register, lastMotion
- `CommandState` — Command-line buffer and cursor
- `PersistentState` — Registers, marks, search history
- `transition()` — FSM transition function
- `createInitialVimState()` — Factory for initial normal-mode state
- `MotionType`, `OperatorType`, `TextObject`, `VimAction`, `TransitionResult` — Supporting types

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
