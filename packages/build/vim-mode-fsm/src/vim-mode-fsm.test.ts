import { describe, test, expect } from "bun:test";
import {
  createInitialVimState,
  transition,
  type VimState,
} from "./index";

describe("vim-mode-fsm", () => {
  describe("createInitialVimState", () => {
    test("returns correct defaults", () => {
      const state = createInitialVimState();
      expect(state.mode).toBe("normal");
      expect(state.count).toBeNull();
      expect(state.operator).toBeNull();
      expect(state.register).toBe('"');
      expect(state.lastMotion).toBeNull();
    });
  });

  describe("normal mode transitions", () => {
    const normal = (): VimState => createInitialVimState();

    test("'i' transitions to insert mode", () => {
      const result = transition(normal(), "i");
      expect(result.nextState.mode).toBe("insert");
      expect(result.sideEffects).toEqual([
        { type: "mode_change", payload: { from: "normal", to: "insert" } },
      ]);
    });

    test("'v' transitions to visual mode", () => {
      const result = transition(normal(), "v");
      expect(result.nextState.mode).toBe("visual");
      expect(result.sideEffects[0].type).toBe("mode_change");
    });

    test("'V' transitions to visual_line mode", () => {
      const result = transition(normal(), "V");
      expect(result.nextState.mode).toBe("visual_line");
    });

    test("'R' transitions to replace mode", () => {
      const result = transition(normal(), "R");
      expect(result.nextState.mode).toBe("replace");
    });

    test("':' transitions to command_line mode", () => {
      const result = transition(normal(), ":");
      expect(result.nextState.mode).toBe("command_line");
    });

    test("'/' transitions to search mode", () => {
      const result = transition(normal(), "/");
      expect(result.nextState.mode).toBe("search");
    });
  });

  describe("operator keys", () => {
    const normal = (): VimState => createInitialVimState();

    test("'d' enters operator_pending with delete", () => {
      const result = transition(normal(), "d");
      expect(result.nextState.mode).toBe("operator_pending");
      expect(result.nextState.operator).toBe("delete");
    });

    test("'c' enters operator_pending with change", () => {
      const result = transition(normal(), "c");
      expect(result.nextState.mode).toBe("operator_pending");
      expect(result.nextState.operator).toBe("change");
    });

    test("'y' enters operator_pending with yank", () => {
      const result = transition(normal(), "y");
      expect(result.nextState.mode).toBe("operator_pending");
      expect(result.nextState.operator).toBe("yank");
    });
  });

  describe("insert mode", () => {
    test("Escape returns to normal mode", () => {
      const insertState: VimState = {
        mode: "insert",
        count: null,
        operator: null,
        register: '"',
        lastMotion: null,
      };
      const result = transition(insertState, "Escape");
      expect(result.nextState.mode).toBe("normal");
      expect(result.sideEffects[0]).toEqual({
        type: "mode_change",
        payload: { from: "insert", to: "normal" },
      });
    });
  });

  describe("visual mode", () => {
    test("Escape returns to normal mode", () => {
      const visualState: VimState = {
        mode: "visual",
        count: null,
        operator: null,
        register: '"',
        lastMotion: null,
      };
      const result = transition(visualState, "Escape");
      expect(result.nextState.mode).toBe("normal");
    });
  });

  describe("operator_pending mode", () => {
    const opState: VimState = {
      mode: "operator_pending",
      count: null,
      operator: "delete",
      register: '"',
      lastMotion: null,
    };

    test("motion 'w' executes operator and returns to normal", () => {
      const result = transition(opState, "w");
      expect(result.nextState.mode).toBe("normal");
      expect(result.nextState.operator).toBeNull();
      expect(result.sideEffects.some((e) => e.type === "operator")).toBe(true);
      const opEffect = result.sideEffects.find((e) => e.type === "operator");
      expect(opEffect?.payload.operator).toBe("delete");
      expect(opEffect?.payload.motion).toBe("w");
    });

    test("Escape cancels to normal mode", () => {
      const result = transition(opState, "Escape");
      expect(result.nextState.mode).toBe("normal");
      expect(result.nextState.operator).toBeNull();
    });
  });

  describe("edge cases", () => {
    test("unknown key in normal mode stays in normal with empty sideEffects", () => {
      const result = transition(createInitialVimState(), "z");
      expect(result.nextState.mode).toBe("normal");
      expect(result.sideEffects).toEqual([]);
    });

    test("count accumulation: '5' sets count to 5", () => {
      const result = transition(createInitialVimState(), "5");
      expect(result.nextState.count).toBe(5);
      expect(result.nextState.mode).toBe("normal");
    });

    test("command_line mode: Escape returns to normal", () => {
      const cmdState: VimState = {
        mode: "command_line",
        count: null,
        operator: null,
        register: '"',
        lastMotion: null,
      };
      const result = transition(cmdState, "Escape");
      expect(result.nextState.mode).toBe("normal");
    });

    test("search mode: Escape returns to normal", () => {
      const searchState: VimState = {
        mode: "search",
        count: null,
        operator: null,
        register: '"',
        lastMotion: null,
      };
      const result = transition(searchState, "Escape");
      expect(result.nextState.mode).toBe("normal");
    });

    test("replace mode: Escape returns to normal", () => {
      const replaceState: VimState = {
        mode: "replace",
        count: null,
        operator: null,
        register: '"',
        lastMotion: null,
      };
      const result = transition(replaceState, "Escape");
      expect(result.nextState.mode).toBe("normal");
    });
  });
});
