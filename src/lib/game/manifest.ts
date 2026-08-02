export type PlacementIcon = 'Council' | 'Stronghold' | 'Roads' | 'Shadow' | 'Dwarven' | 'Elven' | 'Wild' | 'Scout';

export type CommanderId = 'aragorn' | 'theoden' | 'galadriel' | 'gandalf' | 'eowyn' | 'saruman' | 'witch-king' | 'treebeard';

export const COMMANDERS: ReadonlyArray<{ id: CommanderId; name: string; epithet: string }> = [
  { id: 'aragorn', name: 'Aragorn', epithet: 'Heir Returned' },
  { id: 'theoden', name: 'Théoden', epithet: 'King of the Mark' },
  { id: 'galadriel', name: 'Galadriel', epithet: 'Lady of Light' },
  { id: 'gandalf', name: 'Gandalf', epithet: 'Bearer of Narya' },
  { id: 'eowyn', name: 'Éowyn', epithet: 'Shieldmaiden' },
  { id: 'saruman', name: 'Saruman', epithet: 'Voice of Many Colours' },
  { id: 'witch-king', name: 'Witch-king', epithet: 'Lord of the Nine' },
  { id: 'treebeard', name: 'Treebeard', epithet: 'Eldest of the Ents' }
];

export type StartingCardIdentity = {
  id: string;
  name: string;
  copies: number;
};

export const STARTING_CARD_IDENTITIES: readonly StartingCardIdentity[] = [
  { id: 'rallying-words', name: 'Rallying Words', copies: 2 },
  { id: 'armed-escort', name: 'Armed Escort', copies: 2 },
  { id: 'the-open-road', name: 'The Open Road', copies: 2 },
  { id: 'diplomatic-mission', name: 'Diplomatic Mission', copies: 1 },
  { id: 'reconnaissance', name: 'Reconnaissance', copies: 1 },
  { id: 'seek-allies', name: 'Seek Allies', copies: 1 },
  { id: 'token-of-command', name: 'Token of Command', copies: 1 }
];

export type AgentCardDefinition = StartingCardIdentity & {
  placementIcons: readonly PlacementIcon[];
  journeyEffect?:
    | { kind: 'recruit-companies'; amount: 1 }
    | { kind: 'optional-trash-self' };
  reviewedCapabilities: readonly ['agent-placement'];
};

export const AGENT_CARD_DEFINITIONS: readonly AgentCardDefinition[] = [
  {
    id: 'muster-host',
    name: 'Muster the Host',
    copies: 8,
    placementIcons: ['Stronghold', 'Roads'],
    journeyEffect: { kind: 'recruit-companies', amount: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'armed-escort',
    name: 'Armed Escort',
    copies: 2,
    placementIcons: ['Council', 'Stronghold'],
    journeyEffect: { kind: 'recruit-companies', amount: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'the-open-road',
    name: 'The Open Road',
    copies: 2,
    placementIcons: ['Roads'],
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'diplomatic-mission',
    name: 'Diplomatic Mission',
    copies: 1,
    placementIcons: ['Shadow', 'Dwarven', 'Elven', 'Wild'],
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'seek-allies',
    name: 'Seek Allies',
    copies: 1,
    placementIcons: ['Shadow', 'Dwarven', 'Elven', 'Wild'],
    journeyEffect: { kind: 'optional-trash-self' },
    reviewedCapabilities: ['agent-placement']
  }
];

export type MusterCardDefinition = {
  id: string;
  name: string;
  muster: { influence: number; swords: number };
};

export const MUSTER_CARD_DEFINITIONS: readonly MusterCardDefinition[] = [
  { id: 'rallying-words', name: 'Rallying Words', muster: { influence: 2, swords: 0 } },
  { id: 'armed-escort', name: 'Armed Escort', muster: { influence: 0, swords: 1 } },
  { id: 'the-open-road', name: 'The Open Road', muster: { influence: 1, swords: 0 } },
  { id: 'diplomatic-mission', name: 'Diplomatic Mission', muster: { influence: 1, swords: 0 } },
  { id: 'reconnaissance', name: 'Reconnaissance', muster: { influence: 1, swords: 0 } },
  { id: 'seek-allies', name: 'Seek Allies', muster: { influence: 1, swords: 0 } },
  { id: 'token-of-command', name: 'Token of Command', muster: { influence: 1, swords: 0 } },
  { id: 'muster-host', name: 'Muster the Host', muster: { influence: 1, swords: 1 } }
];

export type ReserveCardId = 'muster-host';

export type ReserveCardDefinition = Omit<MusterCardDefinition, 'id'> & {
  id: ReserveCardId;
  copies: number;
  cost: number;
  onAcquireRenown: number;
};

export const RESERVE_CARD_DEFINITIONS: readonly ReserveCardDefinition[] = [
  {
    id: 'muster-host', name: 'Muster the Host', copies: 8, cost: 2,
    onAcquireRenown: 0, muster: { influence: 1, swords: 1 }
  }
];

export type BoardRegion = 'Shadow Hosts' | 'Dwarven Holds' | 'Elven Realms' | 'Wild Kindreds' | 'White Council' | 'Strongholds' | 'Roads';

export type BoardSpaceIdentity = {
  id: string;
  name: string;
  region: BoardRegion;
};

export const BOARD_LAYOUT: readonly BoardSpaceIdentity[] = [
  { id: 'tribute-shadow', name: 'Tribute to the Shadow', region: 'Shadow Hosts' },
  { id: 'pits-isengard', name: 'Pits of Isengard', region: 'Shadow Hosts' },
  { id: 'dwarven-caravans', name: 'Dwarven Caravans', region: 'Dwarven Holds' },
  { id: 'deep-roads', name: 'Deep Roads', region: 'Dwarven Holds' },
  { id: 'hidden-counsel', name: 'Hidden Counsel', region: 'Elven Realms' },
  { id: 'mirror-galadriel', name: 'Mirror of Galadriel', region: 'Elven Realms' },
  { id: 'hidden-paths', name: 'Hidden Paths', region: 'Wild Kindreds' },
  { id: 'ranger-mustering', name: 'Ranger Mustering', region: 'Wild Kindreds' },
  { id: 'hall-fire', name: 'Hall of Fire', region: 'White Council' },
  { id: 'muster-free-peoples', name: 'Muster the Free Peoples', region: 'White Council' },
  { id: 'white-council-seat', name: 'Seat on the White Council', region: 'White Council' },
  { id: 'secret-bargain', name: 'Secret Bargain', region: 'White Council' },
  { id: 'captain-host', name: 'Captain of the Host', region: 'White Council' },
  { id: 'minas-tirith', name: 'Minas Tirith', region: 'Strongholds' },
  { id: 'archives-rivendell', name: 'Archives of Rivendell', region: 'Strongholds' },
  { id: 'fangorn-moot', name: 'Fangorn Moot', region: 'Strongholds' },
  { id: 'osgiliath', name: 'Osgiliath', region: 'Strongholds' },
  { id: 'take-war-effort', name: 'Take Up a War Effort', region: 'Roads' },
  { id: 'great-forge', name: 'Great Forge', region: 'Roads' },
  { id: 'deep-fangorn', name: 'Deep Fangorn', region: 'Roads' },
  { id: 'entwash', name: 'Entwash', region: 'Roads' },
  { id: 'edoras', name: 'Edoras', region: 'Roads' }
];

export type BoardSpaceDefinition = BoardSpaceIdentity & {
  placementIcons: readonly PlacementIcon[];
  effect:
    | { kind: 'dwarven-caravans'; gainStanding: 'dwarven'; gainProvisions: 1 }
    | { kind: 'tribute-shadow'; gainStanding: 'shadow'; gainGold: 2 }
    | { kind: 'take-war-effort'; drawCards: 1; gainGoldWithoutModule: 2 }
    | { kind: 'muster-free-peoples'; recruitCompanies: 2; optionalGoldCost: 2; optionalGainProvisions: 1 };
  reviewedCapabilities: readonly ['agent-placement'];
};

export const BOARD_SPACE_DEFINITIONS: readonly BoardSpaceDefinition[] = [
  {
    id: 'dwarven-caravans',
    name: 'Dwarven Caravans',
    region: 'Dwarven Holds',
    placementIcons: ['Dwarven'],
    effect: { kind: 'dwarven-caravans', gainStanding: 'dwarven', gainProvisions: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'tribute-shadow',
    name: 'Tribute to the Shadow',
    region: 'Shadow Hosts',
    placementIcons: ['Shadow'],
    effect: { kind: 'tribute-shadow', gainStanding: 'shadow', gainGold: 2 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'take-war-effort',
    name: 'Take Up a War Effort',
    region: 'Roads',
    placementIcons: ['Roads'],
    effect: { kind: 'take-war-effort', drawCards: 1, gainGoldWithoutModule: 2 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'muster-free-peoples',
    name: 'Muster the Free Peoples',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'muster-free-peoples', recruitCompanies: 2, optionalGoldCost: 2, optionalGainProvisions: 1 },
    reviewedCapabilities: ['agent-placement']
  }
];

export function cardName(id: string): string {
  return STARTING_CARD_IDENTITIES.find((card) => card.id === id)?.name
    ?? RESERVE_CARD_DEFINITIONS.find((card) => card.id === id)?.name
    ?? id;
}
