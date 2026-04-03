import { describe, test, expect } from "bun:test";
import { createStore, type Store, type Listener } from "./index";

describe("state-store", () => {
  describe("createStore", () => {
    test("creates a store with initial state", () => {
      const store = createStore({ count: 0 });
      expect(store.getState()).toEqual({ count: 0 });
    });

    test("returns an object with getState, setState, subscribe", () => {
      const store = createStore({ value: "hello" });
      expect(typeof store.getState).toBe("function");
      expect(typeof store.setState).toBe("function");
      expect(typeof store.subscribe).toBe("function");
    });
  });

  describe("getState", () => {
    test("returns shallow copy — not the same reference", () => {
      const initial = { count: 0 };
      const store = createStore(initial);
      const state = store.getState();
      expect(state).toEqual({ count: 0 });
      expect(state).not.toBe(initial);
    });

    test("reflects updated state after setState", () => {
      const store = createStore({ count: 0 });
      store.setState((prev) => ({ ...prev, count: 5 }));
      expect(store.getState()).toEqual({ count: 5 });
    });
  });

  describe("setState", () => {
    test("updates state via updater function", () => {
      const store = createStore({ count: 0 });
      store.setState((prev) => ({ ...prev, count: prev.count + 1 }));
      expect(store.getState().count).toBe(1);
    });

    test("notifies listeners on state change", () => {
      const store = createStore({ count: 0 });
      let called = false;
      store.subscribe(() => {
        called = true;
      });
      store.setState((prev) => ({ ...prev, count: 1 }));
      expect(called).toBe(true);
    });

    test("does NOT notify when Object.is(old, new) is true", () => {
      const store = createStore({ count: 0 });
      let callCount = 0;
      store.subscribe(() => {
        callCount++;
      });
      // Return same reference — should not notify
      store.setState((prev) => prev);
      expect(callCount).toBe(0);
    });
  });

  describe("subscribe", () => {
    test("returns unsubscribe function", () => {
      const store = createStore({ count: 0 });
      const unsub = store.subscribe(() => {});
      expect(typeof unsub).toBe("function");
    });

    test("unsubscribed listener is not called", () => {
      const store = createStore({ count: 0 });
      let called = false;
      const unsub = store.subscribe(() => {
        called = true;
      });
      unsub();
      store.setState((prev) => ({ ...prev, count: 1 }));
      expect(called).toBe(false);
    });

    test("multiple listeners all receive notifications", () => {
      const store = createStore({ count: 0 });
      let count1 = 0;
      let count2 = 0;
      store.subscribe(() => count1++);
      store.subscribe(() => count2++);
      store.setState((prev) => ({ ...prev, count: 1 }));
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });

  describe("onChange callback", () => {
    test("receives old and new state on change", () => {
      let captured: { oldState: unknown; newState: unknown } | null = null;
      const store = createStore({ count: 0 }, (change) => {
        captured = change;
      });
      store.setState((prev) => ({ ...prev, count: 42 }));
      expect(captured).not.toBeNull();
      expect((captured as any).oldState).toEqual({ count: 0 });
      expect((captured as any).newState).toEqual({ count: 42 });
    });
  });
});
