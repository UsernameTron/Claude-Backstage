/**
 * Genesys Flow Security Validator — security audit for Genesys Architect call flows.
 *
 * Translate tier — applies Claude Code's security audit patterns (Sections 8-10, 38)
 * to Genesys Cloud Architect flow validation. Checks flows for common security
 * vulnerabilities such as unprotected data actions, missing encryption on sensitive
 * variables, and exposed PII in logging nodes.
 *
 * Source Pattern: Security audit patterns (dangerous command detection, path validation)
 * Tier: Translate P1.
 *
 * Key insight: Genesys Architect flows are directed graphs where each node can
 * introduce security vulnerabilities. Unprotected data action calls, PII logged
 * in debug nodes, and unvalidated external inputs mirror the security concerns
 * Claude Code addresses through its dangerous command detection and path validation
 * subsystems.
 */

/**
 * Severity levels for flow validation findings.
 */
export type ValidationSeverity = "critical" | "warning" | "info";

/**
 * A node in a Genesys Architect flow.
 */
export interface ArchitectNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, unknown>;
  outgoingEdges: string[];
}

/**
 * A complete Genesys Architect flow definition.
 */
export interface ArchitectFlow {
  id: string;
  name: string;
  type: string;
  nodes: ArchitectNode[];
  edges: Array<{ source: string; target: string }>;
  version: string;
}

/**
 * A security validation rule that checks a flow for a specific vulnerability.
 */
export interface FlowValidationRule {
  id: string;
  severity: ValidationSeverity;
  check: (flow: ArchitectFlow) => FlowVulnerability[];
  description: string;
}

/**
 * A security vulnerability found in a flow.
 */
export interface FlowVulnerability {
  ruleId: string;
  severity: ValidationSeverity;
  nodeId: string;
  flowName: string;
  description: string;
  remediation: string;
}

/**
 * Result of validating a flow against all security rules.
 */
export interface FlowValidationResult {
  valid: boolean;
  vulnerabilities: FlowVulnerability[];
  checkedRules: number;
  flowName: string;
}

/**
 * Create a FlowVulnerability from a rule match on a specific node.
 */
function makeVulnerability(
  ruleId: string,
  severity: ValidationSeverity,
  node: ArchitectNode,
  flow: ArchitectFlow,
  remediation: string
): FlowVulnerability {
  return {
    ruleId,
    severity,
    nodeId: node.id,
    flowName: flow.name,
    description: `${ruleId} found on node "${node.id}" (${node.type})`,
    remediation,
  };
}

/**
 * Return the set of built-in security validation rules.
 *
 * @returns Array of built-in validation rules
 */
export function getBuiltInRules(): FlowValidationRule[] {
  return [
    {
      id: "unprotected-data-action",
      severity: "critical",
      description: "Data action without encryption",
      check: (flow: ArchitectFlow): FlowVulnerability[] =>
        flow.nodes
          .filter(
            (n) => n.type === "data_action" && n.properties.encrypted !== true
          )
          .map((n) =>
            makeVulnerability(
              "unprotected-data-action",
              "critical",
              n,
              flow,
              "Enable encryption on data action node"
            )
          ),
    },
    {
      id: "pii-in-debug",
      severity: "warning",
      description: "PII exposed in debug/log nodes",
      check: (flow: ArchitectFlow): FlowVulnerability[] =>
        flow.nodes
          .filter(
            (n) =>
              (n.type.includes("debug") || n.type.includes("log")) &&
              n.properties.logPii === true
          )
          .map((n) =>
            makeVulnerability(
              "pii-in-debug",
              "warning",
              n,
              flow,
              "Disable PII logging in debug/log nodes"
            )
          ),
    },
    {
      id: "unvalidated-external-input",
      severity: "warning",
      description: "External input without validation",
      check: (flow: ArchitectFlow): FlowVulnerability[] =>
        flow.nodes
          .filter(
            (n) => n.type === "input" && n.properties.validated !== true
          )
          .map((n) =>
            makeVulnerability(
              "unvalidated-external-input",
              "warning",
              n,
              flow,
              "Add input validation before processing external input"
            )
          ),
    },
  ];
}

/**
 * Validate a Genesys Architect flow against all built-in security rules.
 *
 * @param flow - The Architect flow to validate
 * @returns Validation result with any vulnerabilities found
 */
export function validateFlow(flow: ArchitectFlow): FlowValidationResult {
  const rules = getBuiltInRules();
  const vulnerabilities = rules.flatMap((r) => r.check(flow));
  return {
    valid: vulnerabilities.length === 0,
    vulnerabilities,
    checkedRules: rules.length,
    flowName: flow.name,
  };
}
