import { describe, test, expect } from "bun:test";
import {
  validateFlow,
  getBuiltInRules,
  type ArchitectFlow,
  type ArchitectNode,
  type FlowValidationRule,
  type FlowVulnerability,
} from "./index";

function makeNode(overrides: Partial<ArchitectNode> & { id: string }): ArchitectNode {
  return {
    type: "task",
    label: overrides.id,
    properties: {},
    outgoingEdges: [],
    ...overrides,
  };
}

function makeFlow(nodes: ArchitectNode[]): ArchitectFlow {
  return {
    id: "flow-1",
    name: "Test Flow",
    type: "inbound",
    nodes,
    edges: [],
    version: "1.0",
  };
}

describe("getBuiltInRules", () => {
  test("returns array of 3 rules", () => {
    const rules = getBuiltInRules();
    expect(rules).toHaveLength(3);
  });

  test("each rule has required properties", () => {
    const rules = getBuiltInRules();
    for (const rule of rules) {
      expect(rule.id).toBeDefined();
      expect(rule.severity).toBeDefined();
      expect(typeof rule.check).toBe("function");
      expect(rule.description).toBeDefined();
    }
  });

  test("includes unprotected-data-action rule", () => {
    const rules = getBuiltInRules();
    const rule = rules.find((r) => r.id === "unprotected-data-action");
    expect(rule).toBeDefined();
    expect(rule!.severity).toBe("critical");
  });

  test("includes pii-in-debug rule", () => {
    const rules = getBuiltInRules();
    const rule = rules.find((r) => r.id === "pii-in-debug");
    expect(rule).toBeDefined();
    expect(rule!.severity).toBe("warning");
  });

  test("includes unvalidated-external-input rule", () => {
    const rules = getBuiltInRules();
    const rule = rules.find((r) => r.id === "unvalidated-external-input");
    expect(rule).toBeDefined();
    expect(rule!.severity).toBe("warning");
  });
});

describe("validateFlow", () => {
  test("returns valid for clean flow", () => {
    const flow = makeFlow([
      makeNode({ id: "n1", type: "task", properties: {} }),
    ]);
    const result = validateFlow(flow);
    expect(result.valid).toBe(true);
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.flowName).toBe("Test Flow");
  });

  test("detects unprotected data action", () => {
    const flow = makeFlow([
      makeNode({
        id: "da1",
        type: "data_action",
        properties: { encrypted: false },
      }),
    ]);
    const result = validateFlow(flow);
    expect(result.valid).toBe(false);
    expect(result.vulnerabilities.length).toBeGreaterThanOrEqual(1);
    const vuln = result.vulnerabilities.find(
      (v) => v.ruleId === "unprotected-data-action"
    );
    expect(vuln).toBeDefined();
    expect(vuln!.nodeId).toBe("da1");
  });

  test("passes encrypted data action", () => {
    const flow = makeFlow([
      makeNode({
        id: "da2",
        type: "data_action",
        properties: { encrypted: true },
      }),
    ]);
    const result = validateFlow(flow);
    const vuln = result.vulnerabilities.find(
      (v) => v.ruleId === "unprotected-data-action"
    );
    expect(vuln).toBeUndefined();
  });

  test("detects pii in debug node", () => {
    const flow = makeFlow([
      makeNode({
        id: "dbg1",
        type: "debug",
        properties: { logPii: true },
      }),
    ]);
    const result = validateFlow(flow);
    expect(result.valid).toBe(false);
    const vuln = result.vulnerabilities.find((v) => v.ruleId === "pii-in-debug");
    expect(vuln).toBeDefined();
  });

  test("detects pii in log node", () => {
    const flow = makeFlow([
      makeNode({
        id: "log1",
        type: "log",
        properties: { logPii: true },
      }),
    ]);
    const result = validateFlow(flow);
    const vuln = result.vulnerabilities.find((v) => v.ruleId === "pii-in-debug");
    expect(vuln).toBeDefined();
  });

  test("detects unvalidated external input", () => {
    const flow = makeFlow([
      makeNode({
        id: "inp1",
        type: "input",
        properties: { validated: false },
      }),
    ]);
    const result = validateFlow(flow);
    const vuln = result.vulnerabilities.find(
      (v) => v.ruleId === "unvalidated-external-input"
    );
    expect(vuln).toBeDefined();
  });

  test("passes validated input node", () => {
    const flow = makeFlow([
      makeNode({
        id: "inp2",
        type: "input",
        properties: { validated: true },
      }),
    ]);
    const result = validateFlow(flow);
    const vuln = result.vulnerabilities.find(
      (v) => v.ruleId === "unvalidated-external-input"
    );
    expect(vuln).toBeUndefined();
  });

  test("reports checkedRules count", () => {
    const flow = makeFlow([]);
    const result = validateFlow(flow);
    expect(result.checkedRules).toBe(3);
  });

  test("detects multiple vulnerabilities", () => {
    const flow = makeFlow([
      makeNode({
        id: "da",
        type: "data_action",
        properties: {},
      }),
      makeNode({
        id: "dbg",
        type: "debug",
        properties: { logPii: true },
      }),
      makeNode({
        id: "inp",
        type: "input",
        properties: {},
      }),
    ]);
    const result = validateFlow(flow);
    expect(result.valid).toBe(false);
    expect(result.vulnerabilities.length).toBeGreaterThanOrEqual(3);
  });
});
