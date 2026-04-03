import { describe, test, expect, beforeEach } from "bun:test";
import {
  checkRemoteFlag,
  checkAuthentication,
  checkRuntimeSupport,
  checkVoiceGating,
  compositeGateCheck,
  resetGatingState,
} from "./index";
import type { VoiceGatingConfig } from "./index";

describe("voice-input-gating", () => {
  beforeEach(() => {
    resetGatingState();
  });

  test("checkRemoteFlag returns true for enabled flag", () => {
    expect(checkRemoteFlag("voice_input_enabled")).toBe(true);
  });

  test("checkRemoteFlag returns false for disabled flag", () => {
    expect(checkRemoteFlag("nonexistent_flag")).toBe(false);
  });

  test("checkAuthentication returns true (simulated)", () => {
    expect(checkAuthentication("api_key")).toBe(true);
  });

  test("checkRuntimeSupport returns true for darwin", () => {
    expect(checkRuntimeSupport("darwin")).toBe(true);
  });

  test("checkRuntimeSupport returns true for linux", () => {
    expect(checkRuntimeSupport("linux")).toBe(true);
  });

  test("checkRuntimeSupport returns false for unsupported platform", () => {
    expect(checkRuntimeSupport("unsupported")).toBe(false);
  });

  test("checkVoiceGating returns allowed when all gates pass", () => {
    const config: VoiceGatingConfig = {
      featureFlagKey: "voice_input_enabled",
      requiredAuthType: "api_key",
      supportedPlatforms: ["darwin", "linux", "win32"],
    };
    const result = checkVoiceGating(config);
    expect(result.allowed).toBe(true);
    expect(result.deniedBy).toBeNull();
    expect(result.reason).toBe("all gates passed");
  });

  test("checkVoiceGating fails fast on remote flag denial", () => {
    const config: VoiceGatingConfig = {
      featureFlagKey: "disabled_flag",
      requiredAuthType: "api_key",
      supportedPlatforms: ["darwin"],
    };
    const result = checkVoiceGating(config);
    expect(result.allowed).toBe(false);
    expect(result.deniedBy).toBe("remote_flag");
  });

  test("compositeGateCheck evaluates gates in order and fails fast", () => {
    // With default state, all gates should pass
    const result = compositeGateCheck(
      ["remote_flag", "authentication", "runtime"],
      {
        featureFlagKey: "voice_input_enabled",
        requiredAuthType: "api_key",
        supportedPlatforms: ["darwin", "linux", "win32"],
      },
    );
    expect(result.allowed).toBe(true);
  });

  test("compositeGateCheck denies on runtime when platform unsupported", () => {
    const result = compositeGateCheck(
      ["remote_flag", "authentication", "runtime"],
      {
        featureFlagKey: "voice_input_enabled",
        requiredAuthType: "api_key",
        supportedPlatforms: ["unsupported_only"],
      },
    );
    expect(result.allowed).toBe(false);
    expect(result.deniedBy).toBe("runtime");
  });
});
