import assert from "node:assert/strict";
import test from "node:test";
import { parseClientCommand } from "./voice-protocol.js";

test("accepts a boolean output mute state command", () => {
  assert.deepEqual(parseClientCommand(JSON.stringify({ type: "setOutputMuted", payload: { muted: true } })), {
    type: "setOutputMuted",
    payload: { muted: true },
  });
});

test("rejects a non-boolean output mute state", () => {
  assert.deepEqual(parseClientCommand(JSON.stringify({ type: "setOutputMuted", payload: { muted: "true" } })), {
    error: { code: "INVALID_OUTPUT_STATE", message: "扬声器状态无效" },
  });
});
