export type EntState = { draught: number; summoned: boolean; damBreached: boolean; protectedBattle: boolean; rewardMultiplier: number };
export function initialEntState(): EntState { return { draught: 1, summoned: false, damBreached: false, protectedBattle: true, rewardMultiplier: 1 }; }
export function summonEnt(state: EntState): EntState { if (state.draught < 1 || state.summoned || state.protectedBattle) throw new Error('Ent summon is illegal'); return { ...state, draught: state.draught - 1, summoned: true }; }
export function breachDam(state: EntState): EntState { if (!state.summoned || state.damBreached) throw new Error('Dam breach is illegal'); return { ...state, damBreached: true, protectedBattle: false, rewardMultiplier: 2 }; }
