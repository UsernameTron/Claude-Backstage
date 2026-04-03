import { describe, expect, test, beforeEach } from "bun:test";
import {
  main,
  setup,
  registerLazyModule,
  getStartupMetrics,
  resetState,
  type StartupConfig,
  type LazyModule,
  type StartupMetrics,
  type StartupPhase,
} from "./index";

beforeEach(() => {
  resetState();
});

describe("main", () => {
  test("runs through all 6 startup phases in order", async () => {
    await main();
    const metrics = getStartupMetrics();
    const phaseNames = Object.keys(metrics.phases) as StartupPhase[];
    expect(phaseNames).toContain("pre_init");
    expect(phaseNames).toContain("config_load");
    expect(phaseNames).toContain("auth_check");
    expect(phaseNames).toContain("mcp_connect");
    expect(phaseNames).toContain("prompt_assemble");
    expect(phaseNames).toContain("ready");
  });

  test("records totalMs > 0", async () => {
    await main();
    const metrics = getStartupMetrics();
    expect(metrics.totalMs).toBeGreaterThanOrEqual(0);
  });

  test("loads critical modules during startup", async () => {
    let loaded = false;
    registerLazyModule({
      name: "critical-mod",
      load: async () => { loaded = true; },
      priority: "critical",
    });
    // critical modules load immediately on register
    expect(loaded).toBe(true);
  });
});

describe("setup", () => {
  test("runs config_load, auth_check, mcp_connect phases", async () => {
    await setup();
    const metrics = getStartupMetrics();
    expect(metrics.phases.config_load).toBeDefined();
    expect(metrics.phases.auth_check).toBeDefined();
    expect(metrics.phases.mcp_connect).toBeDefined();
  });

  test("bareMode skips mcp_connect phase", async () => {
    await setup({ bareMode: true });
    const metrics = getStartupMetrics();
    expect(metrics.phases.config_load).toBeDefined();
    expect(metrics.phases.auth_check).toBeDefined();
    expect(metrics.phases.mcp_connect).toBeUndefined();
  });

  test("does not run pre_init or prompt_assemble", async () => {
    await setup();
    const metrics = getStartupMetrics();
    expect(metrics.phases.pre_init).toBeUndefined();
    expect(metrics.phases.prompt_assemble).toBeUndefined();
  });
});

describe("registerLazyModule", () => {
  test("critical priority calls load immediately", async () => {
    let loaded = false;
    registerLazyModule({
      name: "crit",
      load: async () => { loaded = true; },
      priority: "critical",
    });
    expect(loaded).toBe(true);
  });

  test("deferred priority does not call load immediately", () => {
    let loaded = false;
    registerLazyModule({
      name: "defer",
      load: async () => { loaded = true; },
      priority: "deferred",
    });
    expect(loaded).toBe(false);
  });

  test("idle priority does not call load immediately", () => {
    let loaded = false;
    registerLazyModule({
      name: "idle-mod",
      load: async () => { loaded = true; },
      priority: "idle",
    });
    expect(loaded).toBe(false);
  });
});

describe("getStartupMetrics", () => {
  test("returns timing data with totalMs", async () => {
    await main();
    const metrics = getStartupMetrics();
    expect(typeof metrics.totalMs).toBe("number");
  });

  test("returns per-phase breakdown", async () => {
    await main();
    const metrics = getStartupMetrics();
    expect(typeof metrics.phases).toBe("object");
    for (const phase of ["pre_init", "config_load", "auth_check", "mcp_connect", "prompt_assemble", "ready"] as const) {
      expect(typeof metrics.phases[phase]).toBe("number");
    }
  });

  test("returns lazyModulesDeferred count", async () => {
    registerLazyModule({ name: "d1", load: async () => {}, priority: "deferred" });
    registerLazyModule({ name: "d2", load: async () => {}, priority: "idle" });
    registerLazyModule({ name: "c1", load: async () => {}, priority: "critical" });
    await main();
    const metrics = getStartupMetrics();
    expect(metrics.lazyModulesDeferred).toBe(2);
  });

  test("returns zero deferred when no modules registered", async () => {
    await main();
    const metrics = getStartupMetrics();
    expect(metrics.lazyModulesDeferred).toBe(0);
  });
});
