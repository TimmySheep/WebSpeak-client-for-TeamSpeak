import assert from "node:assert/strict";
import test from "node:test";
import type { DirectoryClientInfo } from "@echosixhiya/teamspeak-client";
import type { Logger } from "../logger.js";
import { DirectorySynchronizer } from "./directory-sync.js";
import { TSClient, type TSDirectorySnapshot } from "./ts-client.js";

const silentLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
  child() { return this; },
};

function createProtocolHarness(rows: Record<string, string>[]) {
  const gateway = new TSClient({ target: { host: "127.0.0.1", port: 9987 }, nickname: "Me" }, silentLogger);
  // Replace only transport I/O; exercise the gateway's actual connect and
  // refresh paths with the decoded rows returned by the SDK command API.
  Object.assign(gateway, {
    adapter: { connect: async () => {} },
    client: {
      clientID: () => 41,
      channelID: () => 7n,
      execCommand: async () => {},
      execCommandWithResponse: async (command: string) => {
        if (command === "channellist") return [{ cid: "7", pid: "0", channel_name: "Room" }];
        assert.equal(command, "clientlist -uid -away -voice -groups");
        return rows;
      },
    },
  });
  return gateway;
}

function memberRow(status: Record<string, string> = {}): Record<string, string> {
  return {
    clid: "41", cid: "7", client_nickname: "Me", client_unique_identifier: "uid-41",
    client_type: "0", client_servergroups: "6", ...status,
  };
}

for (const away of [false, true]) {
  test(`initial connection preserves the server's ${away ? "away" : "online"} status`, async () => {
    const gateway = createProtocolHarness([memberRow({ client_away: away ? "1" : "0", client_away_message: away ? "Back soon" : "" })]);
    let snapshot: TSDirectorySnapshot | undefined;
    gateway.on("directorySnapshot", (value: TSDirectorySnapshot) => { snapshot = value; });

    await gateway.connect();

    assert.ok(snapshot);
    assert.equal(snapshot?.clients[0]?.away, away);
    assert.equal(snapshot?.clients[0]?.awayMessage, away ? "Back soon" : "");
  });
}

test("member refresh restores presence and audio status omitted by client-enter", async () => {
  const gateway = createProtocolHarness([memberRow({
    client_away: "0", client_away_message: "", client_input_muted: "0",
    client_output_muted: "1", client_is_channel_commander: "1",
  })]);
  const directory = new DirectorySynchronizer();
  directory.applySnapshot({ channels: [], clients: [] });
  directory.applyClientEnter({ id: 41, channelID: 7n, nickname: "Me", uid: "uid-41", type: 0, serverGroups: ["6"] });
  gateway.on("directoryClientsSnapshot", (clients: DirectoryClientInfo[]) => directory.applyClientListSnapshot(clients));
  await gateway.connect();

  await gateway.refreshDirectoryClients();

  const member = directory.getSnapshot()?.clients[0];
  assert.equal(member?.away, false);
  assert.equal(member?.inputMuted, false);
  assert.equal(member?.outputMuted, true);
  assert.equal(member?.channelCommander, true);
});

test("omitted optional status remains unknown and does not erase known directory state", async () => {
  const gateway = createProtocolHarness([memberRow()]);
  const directory = new DirectorySynchronizer();
  directory.applySnapshot({ channels: [], clients: [{ id: 41, channelID: 7n, nickname: "Me", uid: "uid-41", type: 0, serverGroups: ["6"], away: true }] });
  let snapshot: TSDirectorySnapshot | undefined;
  gateway.on("directorySnapshot", (value: TSDirectorySnapshot) => { snapshot = value; });
  gateway.on("directoryClientsSnapshot", (clients: DirectoryClientInfo[]) => directory.applyClientListSnapshot(clients));

  await gateway.connect();
  await gateway.refreshDirectoryClients();

  assert.ok(snapshot);
  assert.equal(snapshot?.clients[0]?.away, undefined);
  assert.equal(snapshot?.clients[0]?.inputMuted, undefined);
  assert.equal(directory.getSnapshot()?.clients[0]?.away, true);
});
