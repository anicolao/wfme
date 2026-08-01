import { describe, expect, it } from 'vitest';
import { claimCaptain, gainStanding, initialFactionState } from './standing';

describe('faction thresholds', () => {
  it('grants the Council seat at two and Alliance plus Renown at four', () => {
    const atTwo = gainStanding(gainStanding(initialFactionState(), 'elven'), 'elven');
    expect(atTwo.councilSeat).toBe(true);
    const atFour = gainStanding(gainStanding(atTwo, 'elven'), 'elven');
    expect(atFour.alliance).toBe('elven');
    expect(atFour.renown).toBe(1);
  });

  it('requires a Council seat before Captain of the Host', () => {
    expect(() => claimCaptain(initialFactionState())).toThrow('Council seat required');
    expect(claimCaptain({ ...initialFactionState(), councilSeat: true }).captain).toBe(true);
  });
});
