/**
 * Multi-Step IVR Input Validator — compound DTMF sequence validation for IVR flows.
 *
 * Translate tier — applies Claude Code's compound command decomposition pattern
 * (Section 8.6, Pattern 8) to multi-step DTMF input validation. Decomposes complex
 * caller input sequences (e.g., "press 1, then 3, then 2") into individual steps
 * and validates each step against the IVR call flow graph.
 *
 * Source Pattern: Compound command decomposition (Section 8.6, Pattern 8)
 * Tier: Translate P2.
 *
 * Key insight: Complex IVR interactions involve multi-step DTMF sequences where
 * each step transitions the caller through the flow graph. Validating these
 * sequences end-to-end mirrors how Claude Code decomposes compound commands
 * into individual operations and validates each one.
 */

import type { IVRCallFlow, IVRNode } from "@claude-patterns/ivr-call-flow-validator";

export type { IVRCallFlow, IVRNode } from "@claude-patterns/ivr-call-flow-validator";

/**
 * A single step in a DTMF input sequence.
 */
export interface DTMFStep {
  input: string;
  expectedNodeId?: string;
  actualNodeId?: string;
}

/**
 * A complete DTMF input sequence starting from a specific entry node.
 */
export interface DTMFSequence {
  steps: DTMFStep[];
  entryNodeId: string;
}

/**
 * Result of validating a DTMF sequence against a call flow.
 */
export interface SequenceValidationResult {
  valid: boolean;
  failedAtStep: number | null;
  steps: DTMFStep[];
  reachableEndpoint: string | null;
}

/**
 * Decompose a raw input string into individual DTMF steps.
 *
 * Handles common formats: "1,3,2", "1-3-2", "132".
 *
 * @param rawInput - The raw input string to decompose
 * @returns Array of individual DTMF input strings
 */
export function decomposeInput(rawInput: string): string[] {
  if (!rawInput) return [];
  return rawInput
    .split(/[,\-]/)
    .map((s) => s.trim())
    .flatMap((s) => (s.length > 1 ? s.split("") : [s]))
    .filter(Boolean);
}

/**
 * Validate a DTMF input sequence against an IVR call flow.
 *
 * Walks the flow graph step by step, checking that each input leads to a valid
 * transition. Reports the first step where validation fails.
 *
 * @param flow - The IVR call flow to validate against
 * @param sequence - Array of DTMF inputs (e.g., ["1", "3", "2"])
 * @returns Validation result with step-by-step details
 */
export function validateSequence(
  flow: IVRCallFlow,
  sequence: string[]
): SequenceValidationResult {
  const steps: DTMFStep[] = [];
  let currentNodeId = flow.entryNode;

  for (let i = 0; i < sequence.length; i++) {
    const input = sequence[i];
    const node = flow.nodes[currentNodeId];
    if (!node) {
      return { valid: false, failedAtStep: i, steps, reachableEndpoint: null };
    }

    const transition =
      node.transitions.find((t) => t.input === input) ||
      (node.defaultTransition?.input === input
        ? node.defaultTransition
        : undefined) ||
      node.defaultTransition;

    if (!transition) {
      return { valid: false, failedAtStep: i, steps, reachableEndpoint: null };
    }

    steps.push({
      input,
      expectedNodeId: transition.targetNode,
      actualNodeId: transition.targetNode,
    });
    currentNodeId = transition.targetNode;
  }

  return {
    valid: true,
    failedAtStep: null,
    steps,
    reachableEndpoint: currentNodeId,
  };
}

/** Terminal node types that do not require outbound transitions. */
const TERMINAL_NODE_TYPES = new Set(["disconnect", "transfer", "voicemail"]);

/**
 * Generate all possible DTMF sequences through a flow up to a maximum depth.
 *
 * @param flow - The IVR call flow to traverse
 * @param maxDepth - Maximum sequence length (default: 10)
 * @returns Array of all possible DTMF sequences
 */
export function generateAllSequences(
  flow: IVRCallFlow,
  maxDepth: number = 10
): DTMFSequence[] {
  const results: DTMFSequence[] = [];
  const queue: Array<{ nodeId: string; steps: DTMFStep[] }> = [
    { nodeId: flow.entryNode, steps: [] },
  ];

  while (queue.length > 0) {
    const item = queue.shift()!;
    const node = flow.nodes[item.nodeId];

    if (
      !node ||
      item.steps.length >= maxDepth ||
      node.transitions.length === 0
    ) {
      results.push({ steps: item.steps, entryNodeId: flow.entryNode });
      continue;
    }

    for (const transition of node.transitions) {
      queue.push({
        nodeId: transition.targetNode,
        steps: [...item.steps, { input: transition.input }],
      });
    }

    if (node.defaultTransition) {
      const alreadyHasTarget = node.transitions.some(
        (t) => t.targetNode === node.defaultTransition!.targetNode
      );
      if (!alreadyHasTarget) {
        queue.push({
          nodeId: node.defaultTransition.targetNode,
          steps: [
            ...item.steps,
            { input: node.defaultTransition.input },
          ],
        });
      }
    }
  }

  return results;
}

/**
 * Find DTMF sequences that lead to dead-end nodes (non-terminal nodes with no exits).
 *
 * @param flow - The IVR call flow to analyze
 * @returns Array of sequences that terminate at dead-end nodes
 */
export function findDeadEndSequences(flow: IVRCallFlow): DTMFSequence[] {
  const allSequences = generateAllSequences(flow);
  return allSequences.filter((seq) => {
    if (seq.steps.length === 0) return false;
    const lastStep = seq.steps[seq.steps.length - 1];
    // Walk to find the final node
    let nodeId = flow.entryNode;
    for (const step of seq.steps) {
      const node = flow.nodes[nodeId];
      if (!node) return false;
      const transition = node.transitions.find(
        (t) => t.input === step.input
      ) || node.defaultTransition;
      if (!transition) return false;
      nodeId = transition.targetNode;
    }
    const finalNode = flow.nodes[nodeId];
    if (!finalNode) return false;
    // Dead end: non-terminal node with no outgoing transitions
    return (
      !TERMINAL_NODE_TYPES.has(finalNode.type) &&
      finalNode.transitions.length === 0 &&
      !finalNode.defaultTransition
    );
  });
}
