import assert from "node:assert/strict";
import test from "node:test";
import {
  createTeamSpeakCommandQueue,
  retryTeamSpeakFlood,
  TeamSpeakInputMuteState,
  TeamSpeakOutputMuteState,
} from "./teamspeak-command-policy.js";

test("TeamSpeak flood retry waits once and returns the successful command result", async () => {
  const delays: number[] = [];
  let calls = 0;
  const result = await retryTeamSpeakFlood(
    async () => {
      calls++;
      if (calls === 1) throw new Error("TeamSpeak server error: client is flooding (id=524)");
      return "ok";
    },
    () => true,
    async (milliseconds) => { delays.push(milliseconds); },
  );

  assert.equal(result, "ok");
  assert.equal(calls, 2);
  assert.deepEqual(delays, [1_000]);
});

test("TeamSpeak flood retry is bounded and preserves the final server error", async () => {
  const delays: number[] = [];
  const flooding = new Error("TeamSpeak server error: client is flooding (id=524)");
  let calls = 0;

  await assert.rejects(
    retryTeamSpeakFlood(
      async () => { calls++; throw flooding; },
      () => true,
      async (milliseconds) => { delays.push(milliseconds); },
    ),
    (error: unknown) => error === flooding,
  );

  assert.equal(calls, 3);
  assert.deepEqual(delays, [1_000, 2_000]);
});

test("TeamSpeak flood retry does not retry permission errors", async () => {
  const permissionError = new Error("TeamSpeak server error: insufficient client permissions (id=2568)");
  let calls = 0;

  await assert.rejects(
    retryTeamSpeakFlood(
      async () => { calls++; throw permissionError; },
      () => true,
      async () => { assert.fail("permission errors must not be retried"); },
    ),
    (error: unknown) => error === permissionError,
  );
  assert.equal(calls, 1);
});

test("TeamSpeak flood retry stops after the connection generation changes", async () => {
  let current = true;
  let calls = 0;

  await assert.rejects(
    retryTeamSpeakFlood(
      async () => { calls++; throw new Error("client is flooding (id=524)"); },
      () => current,
      async () => { current = false; },
    ),
    /session is not ready/,
  );
  assert.equal(calls, 1);
});

test("TeamSpeak command queue serializes work and continues after rejection", async () => {
  const queue = createTeamSpeakCommandQueue();
  const order: string[] = [];
  const first = queue(async () => {
    order.push("first:start");
    await Promise.resolve();
    order.push("first:end");
    throw new Error("expected failure");
  });
  const second = queue(async () => { order.push("second"); return 42; });

  await assert.rejects(first, /expected failure/);
  assert.equal(await second, 42);
  assert.deepEqual(order, ["first:start", "first:end", "second"]);
});

test("new TeamSpeak clients skip the already-unmuted default and deduplicate successful state sync", async () => {
  const state = new TeamSpeakInputMuteState();
  const queue = createTeamSpeakCommandQueue();
  state.assume(false);
  let writes = 0;

  assert.equal(await state.sync(false, queue, async () => { writes++; }, () => true), false);
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), true);
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), false);
  assert.equal(writes, 1);
});

test("failed mute updates remain unsynchronized so a later operation can retry", async () => {
  const state = new TeamSpeakInputMuteState();
  const queue = createTeamSpeakCommandQueue();
  const flooding = new Error("client is flooding (id=524)");
  let writes = 0;

  await assert.rejects(state.sync(true, queue, async () => { writes++; throw flooding; }, () => true, async () => {}), (error: unknown) => error === flooding);
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), true);
  assert.equal(writes, 4);
});

test("output mute state deduplicates acknowledged updates and retries after reconnect invalidation", async () => {
  const state = new TeamSpeakOutputMuteState();
  const queue = createTeamSpeakCommandQueue();
  state.assume(false);
  let writes = 0;

  assert.equal(await state.sync(false, queue, async () => { writes++; }, () => true), false);
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), true);
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), false);
  state.invalidate();
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), true);
  assert.equal(writes, 2);
});

test("failed output mute updates are retried instead of cached", async () => {
  const state = new TeamSpeakOutputMuteState();
  const queue = createTeamSpeakCommandQueue();
  const failure = new Error("permission denied");

  await assert.rejects(state.sync(true, queue, async () => { throw failure; }, () => true), (error: unknown) => error === failure);
  let writes = 0;
  assert.equal(await state.sync(true, queue, async () => { writes++; }, () => true), true);
  assert.equal(writes, 1);
});
