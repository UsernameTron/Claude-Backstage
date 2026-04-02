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

// Make the classifier decision — separate API call with independent prompt
export function classifierDecision(
  context: ClassifierSharedContext,
): Promise<YoloClassifierResult> {
  // TODO: extract from utils/permissions/yoloClassifier.ts
  throw new Error("TODO: extract from utils/permissions/yoloClassifier.ts");
}

// Get the appropriate template for the classifier
export function classifierShared(
  template: ClassifierTemplate,
): string {
  // TODO: extract from utils/permissions/yoloClassifier.ts
  throw new Error("TODO: extract from utils/permissions/yoloClassifier.ts");
}

// Convert classifier result to permission result
export function classifierToPermission(
  result: YoloClassifierResult,
): PermissionResult {
  // TODO: extract from utils/permissions/yoloClassifier.ts
  throw new Error("TODO: extract from utils/permissions/yoloClassifier.ts");
}
