# @claude-patterns/state-store

Lightweight reactive state store with immutability guarantees.

## Source Reference

- **Files:** `state/store.ts` + `state/AppStateStore.ts`
- **LOC:** 603
- **KB Section:** 7 — State Management
- **Tier:** Extract P2

## Key Concepts

- **DeepImmutable** — Compile-time safety via recursive readonly mapping
- **Object.is reference equality** — Prevents cascading re-renders on unchanged state
- **React compatible** — Works with `useSyncExternalStore` hook

## Exports

- `Store<T>` — Interface: getState, setState, subscribe
- `createStore<T>()` — Factory function with optional onChange callback
- `DeepImmutable<T>` — Recursive readonly utility type
- `Listener` / `OnChange<T>` — Callback types

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** agent-dialogue-loop
