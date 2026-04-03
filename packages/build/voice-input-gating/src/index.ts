// voice-input-gating — Three-layer feature gating for voice input
// Source Pattern: Section 34 — remote flag check, authentication check, runtime composite check
// KB: Section 34

// --- Types & Interfaces ---

/**
 * The three layers of voice input gating, evaluated in order.
 * If any layer denies, subsequent layers are not checked.
 */
export type GateLayer = "remote_flag" | "authentication" | "runtime";

/**
 * Result of a gate check, indicating whether voice input is allowed
 * and which layer denied it (if any).
 */
export interface GateResult {
  allowed: boolean;
  deniedBy: GateLayer | null;
  reason: string;
}

/**
 * Configuration for voice input gating checks.
 */
export interface VoiceGatingConfig {
  featureFlagKey: string;
  requiredAuthType: string;
  supportedPlatforms: string[];
}

// --- Module-level state ---

/** Simulated set of enabled feature flags. */
const enabledFlags = new Set<string>(["voice_input_enabled"]);

/** Supported platforms for runtime checks. */
const SUPPORTED_PLATFORMS = ["darwin", "linux", "win32"];

/** Simulated current platform. */
let currentPlatform = "darwin";

/**
 * Reset gating state for test isolation.
 */
export function resetGatingState(): void {
  enabledFlags.clear();
  enabledFlags.add("voice_input_enabled");
  currentPlatform = "darwin";
}

/**
 * Alias for resetGatingState — consistent resetState() API across all packages.
 */
export const resetState = resetGatingState;

// --- Functions ---

/**
 * Checks the remote feature flag to determine if voice input is enabled.
 */
export function checkRemoteFlag(flagKey: string): boolean {
  return enabledFlags.has(flagKey);
}

/**
 * Checks whether the current session has the required authentication type.
 * Simulated: always returns true in reference implementation.
 */
export function checkAuthentication(_requiredType: string): boolean {
  return true;
}

/**
 * Checks whether the current platform supports voice input at runtime.
 */
export function checkRuntimeSupport(platform: string): boolean {
  return SUPPORTED_PLATFORMS.includes(platform);
}

/**
 * Evaluates multiple gate layers in order, failing fast on the first denial.
 */
export function compositeGateCheck(
  gates: GateLayer[],
  config: VoiceGatingConfig,
): GateResult {
  for (const gate of gates) {
    let passed = false;
    switch (gate) {
      case "remote_flag":
        passed = checkRemoteFlag(config.featureFlagKey);
        break;
      case "authentication":
        passed = checkAuthentication(config.requiredAuthType);
        break;
      case "runtime":
        passed = config.supportedPlatforms.some((p) =>
          checkRuntimeSupport(p),
        );
        break;
    }
    if (!passed) {
      return {
        allowed: false,
        deniedBy: gate,
        reason: `denied by ${gate} gate`,
      };
    }
  }
  return { allowed: true, deniedBy: null, reason: "all gates passed" };
}

/**
 * Runs all three gate layers in order against the given configuration.
 * Fails fast on the first denial.
 */
export function checkVoiceGating(config: VoiceGatingConfig): GateResult {
  return compositeGateCheck(
    ["remote_flag", "authentication", "runtime"],
    config,
  );
}
