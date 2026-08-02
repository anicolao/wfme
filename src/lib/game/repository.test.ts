import { describe, expect, it } from 'vitest';
import { normalizeRoomCode, randomRoomCode } from './repository';

describe('room codes', () => {
  it('normalizes human input to the five-character protocol', () => {
    expect(normalizeRoomCode(' ri-ven! ')).toBe('RIVEN');
  });

  it('uses the unambiguous room alphabet', () => {
    const code = randomRoomCode(() => 0);
    expect(code).toBe('AAAAA');
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{5}$/);
  });
});
