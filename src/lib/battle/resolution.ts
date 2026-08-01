export type BattleRank = { uid: string; strength: number; fate: number; reward: string };
export type BattleState = {
  title: string;
  baseStrength: Record<string, number>;
  recruits: Record<string, number>;
  swords: Record<string, number>;
  combatFate: Record<string, number>;
  resolved: boolean;
  ranks: BattleRank[];
};

export function initialBattleState(): BattleState {
  return { title: "Helm's Deep", baseStrength: { aragorn: 2, galadriel: 1 }, recruits: { aragorn: 0, galadriel: 0 }, swords: { aragorn: 0, galadriel: 0 }, combatFate: { aragorn: 0, galadriel: 0 }, resolved: false, ranks: [] };
}

export function deployRecruit(state: BattleState, uid: string, amount = 1): BattleState {
  if (state.resolved || !state.baseStrength[uid]) throw new Error('Battle is not open');
  return { ...state, recruits: { ...state.recruits, [uid]: (state.recruits[uid] ?? 0) + amount } };
}

export function revealSwords(state: BattleState, uid: string, amount = 1): BattleState {
  if (state.resolved || !state.baseStrength[uid]) throw new Error('Battle is not open');
  return { ...state, swords: { ...state.swords, [uid]: (state.swords[uid] ?? 0) + amount } };
}

export function resolveBattle(state: BattleState): BattleState {
  if (state.resolved) return state;
  const ranks = Object.keys(state.baseStrength).map((uid) => ({ uid, strength: state.baseStrength[uid] + (state.recruits[uid] ?? 0) + (state.swords[uid] ?? 0), fate: state.combatFate[uid] ?? 0, reward: '' })).sort((a, b) => b.strength - a.strength || b.fate - a.fate || a.uid.localeCompare(b.uid));
  const rewards = ['Standard + 2 Renown', '1 Renown', 'No reward'];
  return { ...state, resolved: true, ranks: ranks.map((rank, index) => ({ ...rank, reward: rewards[index] ?? 'No reward' })) };
}
