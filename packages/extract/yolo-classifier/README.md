# @claude-patterns/yolo-classifier

Model-watching-model architecture for permission decisions. An independent API call judges the primary model's tool-use actions using two template sets (external/Anthropic).

- **Source:** `utils/permissions/yoloClassifier.ts` (1,495 LOC)
- **KB:** Section 8.5 / Pattern 1
- **Tier:** Extract P1
- **Depends:** permission-system
- **Downstream:** none

## Key Pattern

The YOLO classifier makes a separate API call with its own prompt to evaluate whether a tool use should be allowed. This "model watching model" pattern provides an independent safety layer. Two template sets handle internal (Anthropic) vs external deployment contexts.

## Status

Working implementation. Exports `classifierDecision()` (mode-aware risk analysis with dangerous pattern detection), `classifierShared()` (template retrieval for external/Anthropic contexts), and `classifierToPermission()` (result conversion). Tests in `src/yolo-classifier.test.ts`.
