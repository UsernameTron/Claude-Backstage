/**
 * @claude-patterns/yolo-classifier
 *
 * Model-watching-model architecture — independent API call judges primary model's actions.
 * Source: utils/permissions/yoloClassifier.ts (1,495 LOC)
 * KB: Section 8.5 — YOLO Classifier
 * Tier: Extract P1
 */

import type { PermissionMode, PermissionResult } from "@claude-patterns/permission-system";

// YOLO classifier result from independent model call
export interface YoloClassifierResult {
  action: "allow" | "deny" | "ask";
  reason: string;
  confidence: "high" | "medium" | "low";
}

// Classifier template sets
export type ClassifierTemplate = "permissions_external" | "permissions_anthropic";

// Shared types between classifier and permission system
export interface ClassifierSharedContext {
  mode: PermissionMode;
  toolName: string;
  toolInput: Record<string, unknown>;
}

/**
 * Dangerous command patterns that should trigger "ask" or "deny" decisions.
 * Mirrors the DANGEROUS_BASH_PATTERNS from permission-system.
 */
const DANGEROUS_PATTERNS = [
  /\brm\s+-rf\b/,
  /\bsudo\b/,
  /\beval\b/,
  /\bexec\b/,
  /\bcurl\b.*\|\s*bash/,
  />\s*\/etc\//,
];

/**
 * Mode-based default actions for the classifier.
 * In the real system, an independent API call judges the action;
 * this pattern library simulates the decision logic based on permission mode
 * and tool input risk analysis (KB section 8.5).
 */
const MODE_DEFAULTS: Record<PermissionMode, "allow" | "deny" | "ask"> = {
  default: "ask",
  plan: "deny",
  acceptEdits: "ask",
  bypassPermissions: "allow",
  dontAsk: "deny",
  auto: "ask",
};

// Make the classifier decision — separate API call with independent prompt
export async function classifierDecision(
  context: ClassifierSharedContext,
): Promise<YoloClassifierResult> {
  const modeDefault = MODE_DEFAULTS[context.mode];

  // In bypass mode, always allow regardless of input
  if (modeDefault === "allow") {
    return {
      action: "allow",
      reason: `Mode ${context.mode}: all actions permitted`,
      confidence: "high",
    };
  }

  // In deny modes (plan, dontAsk), always deny
  if (modeDefault === "deny") {
    return {
      action: "deny",
      reason: `Mode ${context.mode}: action not permitted`,
      confidence: "high",
    };
  }

  // For ask modes, check if the tool input looks dangerous
  const inputStr =
    context.toolName === "Bash"
      ? String(context.toolInput.command || "")
      : JSON.stringify(context.toolInput);

  const isDangerous = DANGEROUS_PATTERNS.some((p) => p.test(inputStr));

  if (isDangerous) {
    return {
      action: "ask",
      reason: `Dangerous pattern detected in ${context.toolName} input`,
      confidence: "high",
    };
  }

  return {
    action: "ask",
    reason: `Default mode: ${context.toolName} requires confirmation`,
    confidence: "medium",
  };
}

/**
 * Classifier prompt templates used by the independent model call.
 * In the real system, these are full prompt strings sent to an API;
 * this pattern library returns the template identifier and purpose.
 */
const TEMPLATES: Record<ClassifierTemplate, string> = {
  permissions_external:
    "Evaluate external tool permission request. Check for dangerous patterns, " +
    "data exfiltration, and unauthorized access.",
  permissions_anthropic:
    "Evaluate anthropic-internal tool permission. Apply relaxed rules for " +
    "known-safe operations within the Anthropic ecosystem.",
};

// Get the appropriate template for the classifier
export function classifierShared(
  template: ClassifierTemplate,
): string {
  return TEMPLATES[template];
}

// Convert classifier result to permission result
export function classifierToPermission(
  result: YoloClassifierResult,
): PermissionResult {
  return {
    allowed: result.action === "allow",
    reason: result.reason,
  };
}
