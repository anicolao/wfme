export type FactionId = 'shadow' | 'dwarven' | 'elven' | 'wild';
export type FactionState = { standing: Record<FactionId, number>; alliance: FactionId | null; councilSeat: boolean; captain: boolean; renown: number };

export const FACTION_NAMES: Record<FactionId, string> = { shadow: 'Shadow Hosts', dwarven: 'Dwarven Holds', elven: 'Elven Realms', wild: 'Wild Kindreds' };

export function initialFactionState(): FactionState {
  return { standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 }, alliance: null, councilSeat: false, captain: false, renown: 0 };
}

export function gainStanding(state: FactionState, faction: FactionId, amount = 1): FactionState {
  const standing = { ...state.standing, [faction]: Math.min(6, state.standing[faction] + amount) };
  const crossedTwo = state.standing[faction] < 2 && standing[faction] >= 2;
  const crossedFour = state.standing[faction] < 4 && standing[faction] >= 4;
  return {
    ...state,
    standing,
    alliance: crossedFour ? faction : state.alliance,
    councilSeat: state.councilSeat || crossedTwo,
    renown: state.renown + (crossedFour ? 1 : 0)
  };
}

export function claimCaptain(state: FactionState): FactionState {
  if (!state.councilSeat) throw new Error('Council seat required');
  return { ...state, captain: true };
}
