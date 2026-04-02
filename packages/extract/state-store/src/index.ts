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

// Factory function — Object.is reference equality prevents cascading re-renders
export function createStore<T>(
  initialState: T,
  onChange?: OnChange<T>,
): Store<T> {
  // TODO: extract from state/store.ts
  throw new Error("TODO: extract from state/store.ts");
}
