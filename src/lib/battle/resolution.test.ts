import { describe, expect, it } from 'vitest';
import { deployRecruit, initialBattleState, resolveBattle, revealSwords } from './resolution';

describe('battle resolution', () => {
  it('ranks strength, then combat Fate, and assigns rewards', () => {
    let state = initialBattleState();
    state = deployRecruit(state, 'aragorn', 2);
    state = revealSwords(state, 'galadriel', 2);
    const result = resolveBattle(state);
    expect(result.ranks.map((rank) => rank.uid)).toEqual(['aragorn', 'galadriel']);
    expect(result.ranks[0].reward).toContain('Standard');
  });
  it('does not mutate a resolved battle', () => {
    const result = resolveBattle(initialBattleState());
    expect(() => deployRecruit(result, 'aragorn')).toThrow('Battle is not open');
  });
});
