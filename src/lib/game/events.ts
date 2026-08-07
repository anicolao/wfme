export const SCHEMA_VERSION = 2;
export const REDUCER_VERSION = 'integrated-tracer-v1';

export type GameEventType =
  | 'game/created'
  | 'player/joined'
  | 'player/commander-selected'
  | 'player/ready'
  | 'game/war-efforts-set'
  | 'game/rivals-set'
  | 'match/started'
  | 'agent/placed'
  | 'choice/resolved'
  | 'turn/revealed'
  | 'card/acquired'
  | 'reveal/finished'
  | 'scout/placed'
  | 'fate/played'
  | 'battle/passed'
  | 'endgame/passed'
  | 'war-effort/completed'
  | 'match/rematch-ready';

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
  createdAtMillis = Date.now(),
  matchEpoch = 1
): GameEvent {
  return {
    id: `${actorUid}-${String(clientSeq).padStart(6, '0')}`,
    type,
    payload: { ...payload, matchEpoch },
    actorUid,
    clientSeq,
    createdAtMillis,
    schemaVersion: SCHEMA_VERSION,
    reducerVersion: REDUCER_VERSION
  };
}
