export type Effort = { id: string; name: string; cost: number; reward: number };
export type EffortState = { row: Effort[]; active: string | null; completed: string[]; renown: number };
export const EFFORTS: Effort[] = [{ id: 'iron-road', name: 'Rebuild the Iron Road', cost: 2, reward: 2 }, { id: 'white-tree', name: 'Restore the White Tree', cost: 3, reward: 3 }];
export function initialEffortState(): EffortState { return { row: EFFORTS, active: null, completed: [], renown: 0 }; }
export function acceptEffort(state: EffortState, id: string): EffortState { if (state.active) throw new Error('Only one War Effort may be active'); if (!state.row.some((e) => e.id === id)) throw new Error('Unknown War Effort'); return { ...state, active: id }; }
export function completeEffort(state: EffortState, resources: number): EffortState { const effort = state.row.find((e) => e.id === state.active); if (!effort || resources < effort.cost) throw new Error('Insufficient resources'); return { ...state, active: null, completed: [...state.completed, effort.id], renown: state.renown + effort.reward }; }
