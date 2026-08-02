export const SCHEMA_VERSION = 2;
export const REDUCER_VERSION = 'integrated-tracer-v1';

export type GameEventType =
  | 'game/created'
  | 'player/joined'
  | 'player/commander-selected'
  | 'player/ready'
  | 'match/started'
  | 'agent/placed'
  | 'choice/resolved'
  | 'turn/revealed'
  | 'card/acquired'
  | 'reveal/finished';

export type GameEvent = {
  id: string;
  type: GameEventType;
  payload: Record<string, unknown>;
  actorUid: string;
  clientSeq: number;
  createdAtMillis: number;
  schemaVersion: number;
  reducerVersion: string;
};

export function createEvent(
  type: GameEventType,
  actorUid: string,
  clientSeq: number,
  payload: Record<string, unknown>,
  createdAtMillis = Date.now()
): GameEvent {
  return {
    id: `${actorUid}-${String(clientSeq).padStart(6, '0')}`,
    type,
    payload,
    actorUid,
    clientSeq,
    createdAtMillis,
    schemaVersion: SCHEMA_VERSION,
    reducerVersion: REDUCER_VERSION
  };
}
