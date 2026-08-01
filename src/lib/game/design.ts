export const GAME_TITLE = 'The War for Middle-earth';
export const PLAYER_RANGE = { minimum: 1, maximum: 4 } as const;
export const TARGET_RENOWN = 10;
export const MAX_ROUNDS = 10;
export const BOARD_DESTINATIONS = 22;
export const OBSERVATION_POSTS = 9;
export const CHRONICLE_CARDS = 54;

export const ROUND_PHASES = [
  'Round Start',
  'Player Turns',
  'Battle',
  'Riches',
  'Recall'
] as const;

export const FACTIONS = [
  { id: 'shadow', name: 'Shadow Hosts', accent: '#a84535' },
  { id: 'dwarven', name: 'Dwarven Holds', accent: '#c18a45' },
  { id: 'elven', name: 'Elven Realms', accent: '#7ba6b8' },
  { id: 'wild', name: 'Wild Kindreds', accent: '#708c55' }
] as const;
