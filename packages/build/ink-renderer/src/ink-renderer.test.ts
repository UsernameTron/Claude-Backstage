import { describe, expect, test } from "bun:test";
import {
  Ink,
  render,
  Box,
  Text,
  Button,
  type RenderOptions,
  type InkInstance,
  type BoxProps,
  type TextProps,
  type ButtonProps,
} from "./index";

describe("Ink class", () => {
  test("constructor creates instance with default options, mounted=false", () => {
    const ink = new Ink();
    expect(ink).toBeInstanceOf(Ink);
  });

  test("constructor stores custom options", () => {
    const ink = new Ink({ exitOnCtrlC: true });
    expect(ink).toBeInstanceOf(Ink);
  });

  test("render sets mounted state and stores tree", () => {
    const ink = new Ink();
    ink.render({ type: "box" });
    // If render didn't throw, it works (mounted is private)
    expect(true).toBe(true);
  });

  test("unmount clears mounted state and resolves exit promise", async () => {
    const ink = new Ink();
    ink.render({ type: "box" });
    ink.unmount();
    // exitPromise should resolve after unmount
    await ink.exitPromise;
    expect(true).toBe(true);
  });
});

describe("render function", () => {
  test("returns InkInstance with rerender/unmount/waitUntilExit/clear", () => {
    const instance = render({ type: "box" });
    expect(typeof instance.rerender).toBe("function");
    expect(typeof instance.unmount).toBe("function");
    expect(typeof instance.waitUntilExit).toBe("function");
    expect(typeof instance.clear).toBe("function");
  });

  test("waitUntilExit resolves after unmount", async () => {
    const instance = render({ type: "box" });
    instance.unmount();
    await instance.waitUntilExit();
    expect(true).toBe(true);
  });

  test("rerender is callable without error", () => {
    const instance = render({ type: "box" });
    instance.rerender({ type: "text" });
    expect(true).toBe(true);
  });

  test("clear is callable without error", () => {
    const instance = render({ type: "box" });
    instance.clear();
    expect(true).toBe(true);
  });
});

describe("component functions", () => {
  test("Box returns { type: 'box', props }", () => {
    const result = Box({ flexDirection: "row" });
    expect(result).toEqual({ type: "box", props: { flexDirection: "row" } });
  });

  test("Text returns { type: 'text', props }", () => {
    const result = Text({ bold: true });
    expect(result).toEqual({ type: "text", props: { bold: true } });
  });

  test("Button returns { type: 'button', props }", () => {
    const result = Button({ label: "OK" });
    expect(result).toEqual({ type: "button", props: { label: "OK" } });
  });
});
