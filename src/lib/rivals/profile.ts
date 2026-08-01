export type Rival = { id: string; name: string; priority: string[]; reward: string };
export const RIVALS: Rival[] = [{ id: 'saruman', name: 'Saruman', priority: ['Council', 'Stronghold'], reward: '1 Strength' }, { id: 'witch-king', name: 'Witch-king', priority: ['Shadow', 'Roads'], reward: '1 Fear' }];
export function rivalAction(rival: Rival, available: string[]): { space: string; reward: string } { return { space: rival.priority.find((space) => available.includes(space)) ?? rival.priority[0], reward: rival.reward }; }
