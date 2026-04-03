/**
 * @claude-patterns/state-store
 *
 * Lightweight reactive state store with immutability guarantees.
 * Source: state/store.ts + state/AppStateStore.ts (603 LOC)
 * KB: Section 7 — State Management
 * Tier: Extract P2
 */

// Listener and onChange callback types
export type Listener = () => void;
export type OnChange<T> = (change: { newState: T; oldState: T }) => void;

// DeepImmutable utility type — recursively makes all fields readonly
export type DeepImmutable<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
  : T extends Set<infer S>
    ? ReadonlySet<DeepImmutable<S>>
    : T extends object
      ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
      : T;

// Store interface with getState/setState/subscribe
export interface Store<T> {
  getState(): T;
  setState(updater: (prev: T) => T): void;
  subscribe(listener: Listener): () => void;
}

/**
 * Factory function — Object.is reference equality prevents cascading re-renders.
 *
 * Design: Uses a Set<Listener> for O(1) subscribe/unsubscribe.
 * getState returns a shallow copy for flat objects to enforce read-only contract.
 * setState uses Object.is to skip no-op updates (same reference = no change).
 */
export function createStore<T>(
  initialState: T,
  onChange?: OnChange<T>,
): Store<T> {
  let state: T = initialState;
  const listeners = new Set<Listener>();

  function getState(): T {
    // Shallow copy for flat objects — enforces readonly contract
    // without DeepImmutable runtime cost
    if (state !== null && typeof state === "object" && !Array.isArray(state)) {
      return { ...state };
    }
    return state;
  }

  function setState(updater: (prev: T) => T): void {
    const newState = updater(state);
    // Object.is equality check — skip if same reference
    if (Object.is(state, newState)) {
      return;
    }
    const oldState = state;
    state = newState;

    // Fire onChange callback if provided
    if (onChange) {
      onChange({ newState, oldState });
    }

    // Notify all listeners
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { getState, setState, subscribe };
}
