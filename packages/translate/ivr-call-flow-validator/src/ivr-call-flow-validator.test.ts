import { describe, test, expect } from "bun:test";
import {
  validate,
  getUnreachableNodes,
  getTransitionCoverage,
  type IVRCallFlow,
  type IVRNode,
} from "./index";

function makeNode(overrides: Partial<IVRNode> & { id: string }): IVRNode {
  return {
    type: "menu",
    label: overrides.id,
    transitions: [],
    ...overrides,
  };
}

function makeFlow(overrides: Partial<IVRCallFlow> = {}): IVRCallFlow {
  return {
    id: "test-flow",
    name: "Test Flow",
    entryNode: "entry",
    nodes: {
      entry: makeNode({ id: "entry", type: "menu" }),
    },
    version: "1.0",
    ...overrides,
  };
}

describe("validate", () => {
  test("validates simple valid flow (entry -> menu -> exit)", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({
          id: "entry",
          type: "menu",
          transitions: [{ input: "1", targetNode: "menu" }],
          defaultTransition: { input: "timeout", targetNode: "menu" },
        }),
        menu: makeNode({
          id: "menu",
          type: "menu",
          transitions: [{ input: "1", targetNode: "exit" }],
          defaultTransition: { input: "timeout", targetNode: "exit" },
        }),
        exit: makeNode({ id: "exit", type: "disconnect" }),
      },
    });
    const result = validate(flow);
    // No errors expected (warnings may exist for low coverage)
    expect(result.valid).toBe(true);
  });

  test("detects unreachable node", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({
          id: "entry",
          type: "menu",
          transitions: [{ input: "1", targetNode: "exit" }],
        }),
        exit: makeNode({ id: "exit", type: "disconnect" }),
        orphan: makeNode({ id: "orphan", type: "menu" }),
      },
    });
    const result = validate(flow);
    const unreachableIssues = result.issues.filter(
      (i) => i.nodeId === "orphan" && i.message.includes("unreachable"),
    );
    expect(unreachableIssues.length).toBeGreaterThan(0);
  });

  test("detects missing DTMF transitions on menu node", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({
          id: "entry",
          type: "menu",
          transitions: [{ input: "1", targetNode: "entry" }],
        }),
      },
    });
    const result = validate(flow);
    const coverageIssues = result.issues.filter(
      (i) => i.message.includes("coverage"),
    );
    expect(coverageIssues.length).toBeGreaterThan(0);
  });

  test("validates empty single-node flow", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({ id: "entry", type: "disconnect" }),
      },
    });
    const result = validate(flow);
    // disconnect node is terminal, so valid
    expect(result.valid).toBe(true);
  });
});

describe("getUnreachableNodes", () => {
  test("returns disconnected node IDs", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({
          id: "entry",
          type: "menu",
          transitions: [{ input: "1", targetNode: "reachable" }],
        }),
        reachable: makeNode({ id: "reachable", type: "disconnect" }),
        orphan1: makeNode({ id: "orphan1", type: "menu" }),
        orphan2: makeNode({ id: "orphan2", type: "queue" }),
      },
    });
    const unreachable = getUnreachableNodes(flow);
    expect(unreachable).toContain("orphan1");
    expect(unreachable).toContain("orphan2");
    expect(unreachable).not.toContain("entry");
    expect(unreachable).not.toContain("reachable");
  });

  test("returns empty array when all nodes reachable", () => {
    const flow = makeFlow({
      nodes: {
        entry: makeNode({
          id: "entry",
          type: "menu",
          transitions: [{ input: "1", targetNode: "exit" }],
        }),
        exit: makeNode({ id: "exit", type: "disconnect" }),
      },
    });
    expect(getUnreachableNodes(flow)).toEqual([]);
  });
});

describe("getTransitionCoverage", () => {
  test("returns correct ratio for partial coverage", () => {
    const node = makeNode({
      id: "test",
      transitions: [
        { input: "1", targetNode: "a" },
        { input: "2", targetNode: "b" },
        { input: "3", targetNode: "c" },
      ],
    });
    // 3 transitions out of 12 DTMF inputs (0-9, *, #) = 0.25
    expect(getTransitionCoverage(node)).toBeCloseTo(0.25);
  });

  test("returns 0 for node with no transitions", () => {
    const node = makeNode({ id: "empty" });
    expect(getTransitionCoverage(node)).toBe(0);
  });

  test("returns 1.0 for fully covered node", () => {
    const dtmfInputs = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"] as const;
    const node = makeNode({
      id: "full",
      transitions: dtmfInputs.map((input) => ({
        input,
        targetNode: "target",
      })),
    });
    expect(getTransitionCoverage(node)).toBeCloseTo(1.0);
  });
});
