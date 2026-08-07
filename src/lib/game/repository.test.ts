import { describe, expect, it } from 'vitest';
import { createEvent } from './events';
import { normalizeRoomCode, orderCommittedGameEvents, randomRoomCode } from './repository';

describe('room codes', () => {
  it('normalizes human input to the five-character protocol', () => {
    expect(normalizeRoomCode(' ri-ven! ')).toBe('RIVEN');
  });

  it('uses the unambiguous room alphabet', () => {
    const code = randomRoomCode(() => 0);
    expect(code).toBe('AAAAA');
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{5}$/);
  });

  it('orders acknowledged events by server commit time and event ID, never the client clock', () => {
    const created = createEvent('game/created', 'host', 1, { roomCode: 'RIVEN', displayName: 'Mara' }, 100);
    const joined = createEvent('player/joined', 'guest', 1, { displayName: 'Rin' }, 50);
    const tied = createEvent('player/joined', 'z-guest', 1, { displayName: 'Pip' }, -100);
    expect(orderCommittedGameEvents([
      { event: tied, committedAtMillis: 20 },
      { event: joined, committedAtMillis: 20 },
      { event: created, committedAtMillis: 10 }
    ])).toEqual([created, joined, tied]);
  });
});
