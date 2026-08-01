import { describe, expect, it } from 'vitest';
import {
  BOARD_DESTINATIONS,
  CHRONICLE_CARDS,
  FACTIONS,
  MAX_ROUNDS,
  OBSERVATION_POSTS,
  PLAYER_RANGE,
  ROUND_PHASES,
  TARGET_RENOWN
} from './design';

describe('documented design constants', () => {
  it('matches the core game scale', () => {
    expect(PLAYER_RANGE).toEqual({ minimum: 1, maximum: 4 });
    expect(TARGET_RENOWN).toBe(10);
    expect(MAX_ROUNDS).toBe(10);
    expect(BOARD_DESTINATIONS).toBe(22);
    expect(OBSERVATION_POSTS).toBe(9);
    expect(CHRONICLE_CARDS).toBe(54);
  });

  it('keeps the five ordered round phases and four factions unique', () => {
    expect(ROUND_PHASES).toEqual([
      'Round Start',
      'Player Turns',
      'Battle',
      'Riches',
      'Recall'
    ]);
    expect(new Set(FACTIONS.map(({ id }) => id)).size).toBe(4);
  });
});
