import { describe, test, expect } from "bun:test";
import {
  decomposeInput,
  validateSequence,
  generateAllSequences,
  findDeadEndSequences,
  type DTMFStep,
  type DTMFSequence,
  type SequenceValidationResult,
} from "./index";
import type { IVRCallFlow, IVRNode } from "@claude-patterns/ivr-call-flow-validator";

/**
 * Helper: build a simple 3-node flow.
 *   main-menu --1--> submenu --2--> endpoint (disconnect)
 */
function makeSimpleFlow(): IVRCallFlow {
  return {
    id: "flow-1",
    name: "Simple Flow",
    entryNode: "main-menu",
    nodes: {
      "main-menu": {
        id: "main-menu",
        type: "menu",
        label: "Main Menu",
        transitions: [{ input: "1", targetNode: "submenu" }],
      },
      submenu: {
        id: "submenu",
        type: "menu",
        label: "Sub Menu",
        transitions: [{ input: "2", targetNode: "endpoint" }],
      },
      endpoint: {
        id: "endpoint",
        type: "disconnect",
        label: "Goodbye",
        transitions: [],
      },
    },
    version: "1.0",
  };
}

/**
 * Helper: flow with a dead-end node (non-terminal, no transitions).
 */
function makeDeadEndFlow(): IVRCallFlow {
  return {
    id: "flow-2",
    name: "Dead End Flow",
    entryNode: "menu",
    nodes: {
      menu: {
        id: "menu",
        type: "menu",
        label: "Menu",
        transitions: [
          { input: "1", targetNode: "dead-end" },
          { input: "2", targetNode: "safe-exit" },
        ],
      },
      "dead-end": {
        id: "dead-end",
        type: "announcement",
        label: "Stuck Here",
        transitions: [],
      },
      "safe-exit": {
        id: "safe-exit",
        type: "disconnect",
        label: "Exit",
        transitions: [],
      },
    },
    version: "1.0",
  };
}

describe("decomposeInput", () => {
  test("splits comma-separated input", () => {
    expect(decomposeInput("1,3,2")).toEqual(["1", "3", "2"]);
  });

  test("splits dash-separated input", () => {
    expect(decomposeInput("1-3-2")).toEqual(["1", "3", "2"]);
  });

  test("splits individual digits", () => {
    expect(decomposeInput("132")).toEqual(["1", "3", "2"]);
  });

  test("trims whitespace around separators", () => {
    expect(decomposeInput("1, 3, 2")).toEqual(["1", "3", "2"]);
  });

  test("returns empty array for empty string", () => {
    expect(decomposeInput("")).toEqual([]);
  });

  test("returns single digit for single character", () => {
    expect(decomposeInput("5")).toEqual(["5"]);
  });
});

describe("validateSequence", () => {
  test("validates successful sequence through simple flow", () => {
    const flow = makeSimpleFlow();
    const result = validateSequence(flow, ["1", "2"]);
    expect(result.valid).toBe(true);
    expect(result.failedAtStep).toBeNull();
    expect(result.reachableEndpoint).toBe("endpoint");
    expect(result.steps).toHaveLength(2);
  });

  test("fails when transition does not exist", () => {
    const flow = makeSimpleFlow();
    const result = validateSequence(flow, ["9"]);
    expect(result.valid).toBe(false);
    expect(result.failedAtStep).toBe(0);
    expect(result.reachableEndpoint).toBeNull();
  });

  test("fails at correct step in multi-step sequence", () => {
    const flow = makeSimpleFlow();
    const result = validateSequence(flow, ["1", "9"]);
    expect(result.valid).toBe(false);
    expect(result.failedAtStep).toBe(1);
  });

  test("returns empty steps for empty sequence", () => {
    const flow = makeSimpleFlow();
    const result = validateSequence(flow, []);
    expect(result.valid).toBe(true);
    expect(result.steps).toHaveLength(0);
    expect(result.reachableEndpoint).toBe("main-menu");
  });
});

describe("generateAllSequences", () => {
  test("generates sequences up to maxDepth", () => {
    const flow = makeSimpleFlow();
    const sequences = generateAllSequences(flow, 3);
    expect(sequences.length).toBeGreaterThanOrEqual(1);
    for (const seq of sequences) {
      expect(seq.steps.length).toBeLessThanOrEqual(3);
      expect(seq.entryNodeId).toBe("main-menu");
    }
  });

  test("finds the full path through simple flow", () => {
    const flow = makeSimpleFlow();
    const sequences = generateAllSequences(flow, 5);
    const fullPath = sequences.find((s) => s.steps.length === 2);
    expect(fullPath).toBeDefined();
    expect(fullPath!.steps[0].input).toBe("1");
    expect(fullPath!.steps[1].input).toBe("2");
  });
});

describe("findDeadEndSequences", () => {
  test("finds dead-end sequences in flow with stuck node", () => {
    const flow = makeDeadEndFlow();
    const deadEnds = findDeadEndSequences(flow);
    expect(deadEnds.length).toBeGreaterThanOrEqual(1);
    // The dead-end path is menu -> dead-end (announcement, no transitions)
    const deadEndPath = deadEnds.find((s) =>
      s.steps.some((step) => step.input === "1")
    );
    expect(deadEndPath).toBeDefined();
  });

  test("does not flag terminal nodes as dead ends", () => {
    const flow = makeSimpleFlow();
    const deadEnds = findDeadEndSequences(flow);
    // disconnect is terminal, not a dead end
    expect(deadEnds).toHaveLength(0);
  });
});
