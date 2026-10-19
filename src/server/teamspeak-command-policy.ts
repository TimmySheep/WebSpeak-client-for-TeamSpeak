import { normalizeTeamSpeakError } from "../errors.js";

export const TEAM_SPEAK_FLOOD_RETRY_DELAYS_MS = [1_000, 2_000] as const;
export const TEAM_SPEAK_BOOTSTRAP_COMMAND_GAP_MS = 250;

export type WaitForTeamSpeakCommand = (milliseconds: number) => Promise<void>;
export type TeamSpeakCommandQueue = <T>(operation: () => Promise<T>) => Promise<T>;

export function waitForTeamSpeakCommand(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Retry a rejected command only for TeamSpeak's explicit flood-protection response. */
export async function retryTeamSpeakFlood<T>(
  operation: () => Promise<T>,
  isCurrent: () => boolean,
  wait: WaitForTeamSpeakCommand = waitForTeamSpeakCommand,
  onRetry?: (attempt: number, delayMs: number) => void,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (!isCurrent()) throw new Error("TeamSpeak session is not ready");
    try {
      const result = await operation();
      if (!isCurrent()) throw new Error("TeamSpeak session is not ready");
      return result;
    } catch (error: unknown) {
      const delayMs = TEAM_SPEAK_FLOOD_RETRY_DELAYS_MS[attempt];
      if (!isCurrent() || normalizeTeamSpeakError(error).code !== "flooding" || delayMs === undefined) throw error;
      onRetry?.(attempt + 1, delayMs);
      await wait(delayMs);
    }
  }
}

/** Serialize state-changing TeamSpeak commands without letting a rejection poison later work. */
export function createTeamSpeakCommandQueue(): TeamSpeakCommandQueue {
  let tail: Promise<void> = Promise.resolve();
  return <T>(operation: () => Promise<T>): Promise<T> => {
    const result = tail.then(operation);
    tail = result.then(() => undefined, () => undefined);
    return result;
  };
}

/** Cache the acknowledged TeamSpeak input-mute state; update it only after success. */
export class TeamSpeakInputMuteState {
  private synchronized: boolean | null = null;

  assume(muted: boolean): void {
    this.synchronized = muted;
  }

  invalidate(): void {
    this.synchronized = null;
  }

  sync(
    muted: boolean,
    queue: TeamSpeakCommandQueue,
    operation: () => Promise<void>,
    isCurrent: () => boolean,
    wait: WaitForTeamSpeakCommand = waitForTeamSpeakCommand,
    onRetry?: (attempt: number, delayMs: number) => void,
  ): Promise<boolean> {
    return queue(async () => {
      if (!isCurrent()) throw new Error("TeamSpeak session is not ready");
      if (this.synchronized === muted) return false;
      await retryTeamSpeakFlood(operation, isCurrent, wait, onRetry);
      this.synchronized = muted;
      return true;
    });
  }
}

/** Cache the acknowledged TeamSpeak output-mute state; update it only after success. */
export class TeamSpeakOutputMuteState {
  private synchronized: boolean | null = null;

  assume(muted: boolean): void {
    this.synchronized = muted;
  }

  invalidate(): void {
    this.synchronized = null;
  }

  sync(
    muted: boolean,
    queue: TeamSpeakCommandQueue,
    operation: () => Promise<void>,
    isCurrent: () => boolean,
    wait: WaitForTeamSpeakCommand = waitForTeamSpeakCommand,
    onRetry?: (attempt: number, delayMs: number) => void,
  ): Promise<boolean> {
    return queue(async () => {
      if (!isCurrent()) throw new Error("TeamSpeak session is not ready");
      if (this.synchronized === muted) return false;
      await retryTeamSpeakFlood(operation, isCurrent, wait, onRetry);
      this.synchronized = muted;
      return true;
    });
  }
}
