import { describe, expect, it } from 'vitest';
import { acquire, reshuffle, trash, zoneCount, type DeckZones } from './deck';

const initial: DeckZones = { deck: ['a', 'b'], hand: ['c'], discard: [], trash: [], chronicleRow: ['row-1', 'row-2'], chronicleDeck: ['row-3'], influence: 3 };

describe('reveal and deck zones', () => {
  it('acquires one row card, refills the row, and conserves instances', () => {
    const next = acquire(initial, 'row-1', 2, []);
    expect(next.chronicleRow).toEqual(['row-2', 'row-3']);
    expect(next.discard).toEqual(['row-1']);
    expect(zoneCount(next)).toBe(zoneCount(initial));
  });

  it('reshuffles only an empty deck and trashes from hand', () => {
    const next = trash({ ...initial, hand: ['c'] }, 'c');
    expect(next.trash).toEqual(['c']);
    expect(reshuffle({ ...next, deck: [] }, ['c']).discard).toEqual([]);
  });
});
