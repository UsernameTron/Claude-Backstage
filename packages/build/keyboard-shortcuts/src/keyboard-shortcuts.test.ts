import { describe, expect, test, beforeEach } from "bun:test";
import {
  parseKeystroke,
  loadKeybindings,
  resolveKey,
  detectConflicts,
  registerBinding,
  resetState,
  type ParsedBinding,
  type KeybindingWarning,
  type ResolveResult,
  type KeybindingSource,
  type Modifier,
  type KeyContext,
} from "./index";

beforeEach(() => {
  resetState();
});

describe("parseKeystroke", () => {
  test("parses Ctrl+Shift+P into key='p', modifiers=['ctrl','shift']", () => {
    const result = parseKeystroke("Ctrl+Shift+P");
    expect(result.key).toBe("p");
    expect(result.modifiers).toEqual(["ctrl", "shift"]);
    expect(result.context).toBe("global");
    expect(result.command).toBe("");
  });

  test("parses single key 'a'", () => {
    const result = parseKeystroke("a");
    expect(result.key).toBe("a");
    expect(result.modifiers).toEqual([]);
  });

  test("parses Ctrl++ with plus as the key", () => {
    const result = parseKeystroke("Ctrl++");
    expect(result.key).toBe("+");
    expect(result.modifiers).toEqual(["ctrl"]);
  });

  test("parses Alt+Tab", () => {
    const result = parseKeystroke("Alt+Tab");
    expect(result.key).toBe("tab");
    expect(result.modifiers).toEqual(["alt"]);
  });
});

describe("loadKeybindings", () => {
  test("returns empty array for unregistered source", () => {
    const result = loadKeybindings("user");
    expect(result).toEqual([]);
  });

  test("returns registered bindings after registerBinding", () => {
    const binding = parseKeystroke("Ctrl+S");
    binding.command = "save";
    registerBinding("default", binding);
    const result = loadKeybindings("default");
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe("save");
  });
});

describe("resolveKey", () => {
  test("finds correct binding matching key+modifiers+context", () => {
    const binding = parseKeystroke("Ctrl+S");
    binding.command = "save";
    registerBinding("default", binding);
    const result = resolveKey("s", ["ctrl"], "global");
    expect(result.command).toBe("save");
    expect(result.binding).not.toBeNull();
    expect(result.conflicts).toEqual([]);
  });

  test("returns null command for no match", () => {
    const result = resolveKey("z", ["ctrl"], "global");
    expect(result.command).toBeNull();
    expect(result.binding).toBeNull();
    expect(result.conflicts).toEqual([]);
  });

  test("returns conflicts when multiple bindings match same key+mods+context", () => {
    const b1: ParsedBinding = { key: "s", modifiers: ["ctrl"], context: "global", command: "save" };
    const b2: ParsedBinding = { key: "s", modifiers: ["ctrl"], context: "global", command: "search" };
    registerBinding("default", b1);
    registerBinding("user", b2);
    const result = resolveKey("s", ["ctrl"], "global");
    expect(result.command).toBe("save");
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].command).toBe("search");
  });
});

describe("detectConflicts", () => {
  test("finds conflicting bindings with same key+mods+context but different commands", () => {
    const bindings: ParsedBinding[] = [
      { key: "s", modifiers: ["ctrl"], context: "global", command: "save" },
      { key: "s", modifiers: ["ctrl"], context: "global", command: "search" },
    ];
    const warnings = detectConflicts(bindings);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe("conflict");
    expect(warnings[0].bindings).toHaveLength(2);
  });

  test("returns empty for non-conflicting bindings", () => {
    const bindings: ParsedBinding[] = [
      { key: "s", modifiers: ["ctrl"], context: "global", command: "save" },
      { key: "f", modifiers: ["ctrl"], context: "global", command: "find" },
    ];
    const warnings = detectConflicts(bindings);
    expect(warnings).toEqual([]);
  });

  test("returns empty for same command on same key", () => {
    const bindings: ParsedBinding[] = [
      { key: "s", modifiers: ["ctrl"], context: "global", command: "save" },
      { key: "s", modifiers: ["ctrl"], context: "global", command: "save" },
    ];
    const warnings = detectConflicts(bindings);
    expect(warnings).toEqual([]);
  });
});
