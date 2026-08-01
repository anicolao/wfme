import { expect, it } from 'vitest'; import { addRenown, completeRound, initialRoundState } from './round';
it('ends at ten Renown and resolves ties by Riches', () => { const state = addRenown(initialRoundState(), 'aragorn', 10); expect(state.ended).toBe(true); expect(state.winner).toBe('aragorn'); });
it('rotates first player between rounds', () => expect(completeRound(initialRoundState()).firstPlayer).toBe('galadriel'));
