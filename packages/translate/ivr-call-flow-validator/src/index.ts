/**
 * IVR Call Flow Validator — exhaustive transition validation for IVR state machines.
 *
 * Translate tier — applies Vim FSM exhaustive transition pattern to IVR call flows.
 * Source Pattern: vim/ FSM (Recipe 5).
 * Tier: Translate P1.
 *
 * Key insight: IVR call flows are finite state machines where each node (menu,
 * announcement, transfer, etc.) must handle all possible DTMF inputs. Unreachable
 * nodes and dead ends indicate design errors. This mirrors how Claude Code's Vim
 * integration validates exhaustive mode transitions.
 */

/**
 * IVR node types representing distinct call flow stages.
 */
export type IVRNodeType =
  | "menu"
  | "announcement"
  | "transfer"
  | "voicemail"
  | "callback"
  | "queue"
  | "disconnect"
  | "data_dip"
  | "subflow";

/**
 * All possible DTMF inputs a caller can provide, plus timeout/no-input events.
 */
export type DTMFInput =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "*"
  | "#"
  | "timeout"
  | "no_input";

/**
 * A single transition from one IVR node to another, triggered by caller input.
 */
export interface IVRTransition {
  input: DTMFInput;
  targetNode: string;
  condition?: string;
}

/**
 * An IVR node representing a single step in the call flow state machine.
 */
export interface IVRNode {
  id: string;
  type: IVRNodeType;
  label: string;
  transitions: IVRTransition[];
  defaultTransition?: IVRTransition;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Complete IVR call flow definition — a directed graph of IVR nodes.
 */
export interface IVRCallFlow {
  id: string;
  name: string;
  entryNode: string;
  nodes: Record<string, IVRNode>;
  version: string;
}

/**
 * Severity levels for validation issues.
 */
export type ValidationSeverity = "error" | "warning" | "info";

/**
 * A single validation issue found in a call flow.
 */
export interface ValidationIssue {
  severity: ValidationSeverity;
  nodeId: string;
  message: string;
  missingInputs?: DTMFInput[];
}

/**
 * Result of validating an IVR call flow.
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  coverage: number;
}

/** Terminal node types that do not require outbound transitions. */
const TERMINAL_NODE_TYPES: Set<IVRNodeType> = new Set([
  "disconnect",
  "transfer",
  "voicemail",
]);

/** Total number of standard DTMF inputs (0-9, *, #). */
const DTMF_COUNT = 12;

/** Low coverage threshold below which a warning is emitted. */
const LOW_COVERAGE_THRESHOLD = 0.5;

/**
 * Validate an IVR call flow for completeness and correctness.
 *
 * Checks: orphan nodes, missing transitions, unreachable nodes, dead ends.
 * Uses BFS reachability and DTMF coverage analysis, mirroring the Vim FSM
 * exhaustive transition pattern (Recipe 5).
 *
 * @param flow - The IVR call flow to validate
 * @returns Validation result with issues and coverage score
 */
export function validate(flow: IVRCallFlow): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = Object.keys(flow.nodes);

  // Check unreachable nodes
  const unreachable = getUnreachableNodes(flow);
  for (const nodeId of unreachable) {
    issues.push({
      severity: "warning",
      nodeId,
      message: `Node "${nodeId}" is unreachable from entry node "${flow.entryNode}"`,
    });
  }

  // Check each node for transition coverage and dead ends
  let totalCoverage = 0;
  let coverageNodeCount = 0;

  for (const nodeId of nodeIds) {
    const node = flow.nodes[nodeId];
    const isTerminal = TERMINAL_NODE_TYPES.has(node.type);

    // Dead end check: non-terminal node with no transitions and no default
    if (!isTerminal && node.transitions.length === 0 && !node.defaultTransition) {
      issues.push({
        severity: "error",
        nodeId,
        message: `Non-terminal node "${nodeId}" has no transitions (dead end)`,
      });
    }

    // Coverage check for non-terminal nodes
    if (!isTerminal) {
      const coverage = getTransitionCoverage(node);
      totalCoverage += coverage;
      coverageNodeCount++;

      if (coverage < LOW_COVERAGE_THRESHOLD && node.transitions.length > 0) {
        issues.push({
          severity: "warning",
          nodeId,
          message: `Node "${nodeId}" has low DTMF coverage (${(coverage * 100).toFixed(0)}%)`,
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const avgCoverage = coverageNodeCount > 0 ? totalCoverage / coverageNodeCount : 1;

  return {
    valid: errorCount === 0,
    issues,
    coverage: avgCoverage,
  };
}

/**
 * Find all nodes that cannot be reached from the entry node.
 * Uses BFS traversal following transitions and defaultTransitions.
 *
 * @param flow - The IVR call flow to analyze
 * @returns Array of unreachable node IDs
 */
export function getUnreachableNodes(flow: IVRCallFlow): string[] {
  const visited = new Set<string>();
  const queue: string[] = [flow.entryNode];
  visited.add(flow.entryNode);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = flow.nodes[current];
    if (!node) continue;

    // Follow all explicit transitions
    for (const transition of node.transitions) {
      if (!visited.has(transition.targetNode)) {
        visited.add(transition.targetNode);
        queue.push(transition.targetNode);
      }
    }

    // Follow default transition
    if (node.defaultTransition && !visited.has(node.defaultTransition.targetNode)) {
      visited.add(node.defaultTransition.targetNode);
      queue.push(node.defaultTransition.targetNode);
    }
  }

  return Object.keys(flow.nodes).filter((id) => !visited.has(id));
}

/**
 * Calculate DTMF input coverage for a single node.
 * Coverage is the ratio of defined transitions to the 12 standard DTMF inputs
 * (0-9, *, #). Clamped to [0, 1].
 *
 * @param node - The IVR node to check
 * @returns Coverage ratio (0.0 to 1.0) of handled DTMF inputs
 */
export function getTransitionCoverage(node: IVRNode): number {
  const count = node.transitions.length;
  return Math.min(count / DTMF_COUNT, 1);
}
