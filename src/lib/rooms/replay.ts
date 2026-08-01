export const ROOM_SCHEMA_VERSION = 1;
export const ROOM_REDUCER_VERSION = 'rooms-v1';
export const ROOM_CODE_LENGTH = 5;
export const MAX_HUMAN_SEATS = 4;

export type CommanderId = 'aragorn' | 'galadriel' | 'gandalf' | 'theoden';

export type RoomEventType =
  | 'game/created'
  | 'player/joined'
  | 'player/commander-selected'
  | 'player/ready'
  | 'game/started'
  | 'turn/action';

export type RoomEvent = {
  id: string;
  type: RoomEventType;
  payload: Record<string, string | number | boolean>;
  actorUid: string;
  clientSeq: number;
  createdAt: number;
  schemaVersion: number;
  reducerVersion: string;
};

export type RoomPlayer = {
  uid: string;
  displayName: string;
  commander: CommanderId | null;
  ready: boolean;
  seat: number;
};

export type RoomState = {
  roomCode: string;
  hostUid: string;
  phase: 'lobby' | 'ready' | 'playing';
  players: RoomPlayer[];
  turnIndex: number;
  round: number;
  actionLog: string[];
  eventCount: number;
  lastEventId: string | null;
};

export const COMMANDERS: ReadonlyArray<{ id: CommanderId; name: string; epithet: string }> = [
  { id: 'aragorn', name: 'Aragorn', epithet: 'Heir of Isildur' },
  { id: 'galadriel', name: 'Galadriel', epithet: 'Lady of Lothlórien' },
  { id: 'gandalf', name: 'Gandalf', epithet: 'The Grey Pilgrim' },
  { id: 'theoden', name: 'Théoden', epithet: 'King of Rohan' }
];

export function initialRoomState(roomCode: string, hostUid: string): RoomState {
  return { roomCode, hostUid, phase: 'lobby', players: [], turnIndex: 0, round: 1, actionLog: [], eventCount: 0, lastEventId: null };
}

export function createEvent(
  type: RoomEventType,
  actorUid: string,
  clientSeq: number,
  payload: Record<string, string | number | boolean>,
  createdAt = Date.now()
): RoomEvent {
  return {
    id: `${actorUid}-${String(clientSeq).padStart(6, '0')}`,
    type,
    payload,
    actorUid,
    clientSeq,
    createdAt,
    schemaVersion: ROOM_SCHEMA_VERSION,
    reducerVersion: ROOM_REDUCER_VERSION
  };
}

export function reduceRoomEvents(room: RoomState, events: readonly RoomEvent[]): RoomState {
  const next: RoomState = {
    ...room,
    players: room.players.map((player) => ({ ...player })),
    actionLog: [...room.actionLog]
  };
  let started = room.phase === 'playing';

  for (const event of [...events].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))) {
    if (event.schemaVersion !== ROOM_SCHEMA_VERSION || event.reducerVersion !== ROOM_REDUCER_VERSION) {
      continue;
    }
    if (event.type === 'game/created') {
      next.roomCode = String(event.payload.roomCode);
      next.hostUid = event.actorUid;
    } else if (event.type === 'player/joined') {
      const uid = String(event.payload.uid);
      if (!next.players.some((player) => player.uid === uid) && next.players.length < MAX_HUMAN_SEATS) {
        next.players.push({
          uid,
          displayName: String(event.payload.displayName),
          commander: null,
          ready: false,
          seat: next.players.length + 1
        });
      }
    } else if (event.type === 'player/commander-selected') {
      const player = next.players.find((candidate) => candidate.uid === event.actorUid);
      const commander = String(event.payload.commander) as CommanderId;
      if (player && COMMANDERS.some((candidate) => candidate.id === commander)) {
        player.commander = commander;
        player.ready = false;
      }
    } else if (event.type === 'player/ready') {
      const player = next.players.find((candidate) => candidate.uid === event.actorUid);
      if (player && player.commander) player.ready = Boolean(event.payload.ready);
    } else if (event.type === 'game/started') {
      if (event.actorUid === next.hostUid && next.players.length >= 2 && next.players.every((player) => player.ready)) started = true;
    } else if (event.type === 'turn/action' && started) {
      const current = next.players[next.turnIndex];
      if (current?.uid === event.actorUid) {
        next.actionLog.push(`${current.displayName}: ${String(event.payload.action)}`);
        next.turnIndex = (next.turnIndex + 1) % next.players.length;
        if (next.turnIndex === 0) next.round += 1;
      }
    }
  }

  next.eventCount = events.length;
  next.lastEventId = events.at(-1)?.id ?? null;
  next.phase = started ? 'playing' : next.players.length > 0 && next.players.every((player) => player.ready) ? 'ready' : 'lobby';
  return next;
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH);
}

export function randomRoomCode(random = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: ROOM_CODE_LENGTH }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
}
