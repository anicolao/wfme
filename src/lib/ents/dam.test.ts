import { describe, expect, it } from 'vitest';
import { breachDam, initialEntState, summonEnt } from './dam';
describe('Ents and the Dam', () => { it('rejects a summon while the battle is protected', () => expect(() => summonEnt(initialEntState())).toThrow('illegal')); it('doubles rewards only after a legal breach', () => { const state = breachDam({ ...initialEntState(), protectedBattle: false, summoned: true, draught: 0 }); expect(state.rewardMultiplier).toBe(2); }); });
