import { describe, expect, it } from 'vitest';
import { createEvent, initialRoomState, reduceRoomEvents } from './replay';

describe('room replay reducer', () => {
  it('replays creation, join, Commander choice, and readiness deterministically', () => {
    const events = [
      createEvent('game/created', 'host', 1, { roomCode: 'RIVEN' }, 1),
      createEvent('player/joined', 'host', 2, { uid: 'host', displayName: 'Mara' }, 2),
      createEvent('player/commander-selected', 'host', 3, { commander: 'aragorn' }, 3),
      createEvent('player/ready', 'host', 4, { ready: true }, 4)
    ];
    const state = reduceRoomEvents(initialRoomState('RIVEN', 'host'), events);
    expect(state.players[0]).toMatchObject({ displayName: 'Mara', commander: 'aragorn', ready: true });
    expect(state.phase).toBe('ready');
    expect(state.lastEventId).toBe('host-000004');
  });

  it('is idempotent for duplicate join intent and rejects readiness without a Commander', () => {
    const events = [
      createEvent('player/joined', 'guest', 1, { uid: 'guest', displayName: 'Rin' }, 1),
      createEvent('player/joined', 'guest', 1, { uid: 'guest', displayName: 'Rin' }, 1),
      createEvent('player/ready', 'guest', 2, { ready: true }, 2)
    ];
    const state = reduceRoomEvents(initialRoomState('RIVEN', 'host'), events);
    expect(state.players).toHaveLength(1);
    expect(state.players[0].ready).toBe(false);
  });

  it('starts a two-player game and advances legal turns', () => {
    const events = [
      createEvent('game/created', 'host', 1, { roomCode: 'RIVEN' }, 1),
      createEvent('player/joined', 'host', 2, { uid: 'host', displayName: 'Mara' }, 2),
      createEvent('player/commander-selected', 'host', 3, { commander: 'aragorn' }, 3),
      createEvent('player/ready', 'host', 4, { ready: true }, 4),
      createEvent('player/joined', 'guest', 1, { uid: 'guest', displayName: 'Rin' }, 5),
      createEvent('player/commander-selected', 'guest', 2, { commander: 'galadriel' }, 6),
      createEvent('player/ready', 'guest', 3, { ready: true }, 7),
      createEvent('game/started', 'host', 5, {}, 8),
      createEvent('turn/action', 'host', 6, { action: 'Travel to Edoras' }, 9)
    ];
    const state = reduceRoomEvents(initialRoomState('RIVEN', 'host'), events);
    expect(state.phase).toBe('playing');
    expect(state.players[state.turnIndex].uid).toBe('guest');
    expect(state.actionLog).toEqual(['Mara: Travel to Edoras']);
  });
});
