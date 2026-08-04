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
    | { kind: 'recruit-companies'; amount: number }
    | { kind: 'gain-provisions'; amount: number }
    | { kind: 'optional-trash-self' }
    | { kind: 'place-scout'; amount: 1 };
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
  },
  {
    id: 'reconnaissance',
    name: 'Reconnaissance',
    copies: 1,
    placementIcons: ['Stronghold', 'Roads'],
    journeyEffect: { kind: 'place-scout', amount: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'rider-rohan',
    name: 'Rider of Rohan',
    copies: 2,
    placementIcons: ['Stronghold'],
    journeyEffect: { kind: 'recruit-companies', amount: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'bree-land-guide',
    name: 'Bree-land Guide',
    copies: 2,
    placementIcons: ['Roads', 'Stronghold'],
    journeyEffect: { kind: 'gain-provisions', amount: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'captain-gondor',
    name: 'Captain of Gondor',
    copies: 2,
    placementIcons: ['Stronghold', 'Council'],
    journeyEffect: { kind: 'recruit-companies', amount: 2 },
    reviewedCapabilities: ['agent-placement']
  }
];

export type ObservationPostDefinition = {
  id: string;
  name: string;
  connectedSpaceIds: readonly string[];
};

export const OBSERVATION_POSTS: readonly ObservationPostDefinition[] = [
  { id: 'orthanc-eye', name: "Orthanc's Eye", connectedSpaceIds: ['tribute-shadow', 'pits-isengard', 'secret-bargain'] },
  { id: 'redhorn-pass', name: 'Redhorn Pass', connectedSpaceIds: ['dwarven-caravans', 'deep-roads', 'great-forge'] },
  { id: 'last-homely-house', name: 'The Last Homely House', connectedSpaceIds: ['hidden-counsel', 'mirror-galadriel', 'archives-rivendell'] },
  { id: 'northern-eaves', name: 'Northern Eaves', connectedSpaceIds: ['hidden-paths', 'ranger-mustering', 'deep-fangorn'] },
  { id: 'council-antechamber', name: 'Council Antechamber', connectedSpaceIds: ['hall-fire', 'white-council-seat', 'captain-host'] },
  { id: 'muster-field', name: 'Muster Field', connectedSpaceIds: ['muster-free-peoples', 'minas-tirith', 'osgiliath'] },
  { id: 'old-south-road', name: 'Old South Road', connectedSpaceIds: ['take-war-effort', 'osgiliath', 'edoras'] },
  { id: 'banks-entwash', name: 'Banks of Entwash', connectedSpaceIds: ['fangorn-moot', 'entwash', 'deep-fangorn'] },
  { id: 'seeing-stone-road', name: 'Seeing-stone Road', connectedSpaceIds: ['mirror-galadriel', 'secret-bargain', 'minas-tirith'] }
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
  { id: 'muster-host', name: 'Muster the Host', muster: { influence: 1, swords: 1 } },
  { id: 'rider-rohan', name: 'Rider of Rohan', muster: { influence: 1, swords: 1 } },
  { id: 'bree-land-guide', name: 'Bree-land Guide', muster: { influence: 1, swords: 0 } },
  { id: 'captain-gondor', name: 'Captain of Gondor', muster: { influence: 1, swords: 2 } }
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

export type ChronicleCardId = 'rider-rohan' | 'bree-land-guide' | 'captain-gondor';

export type ChronicleCardDefinition = {
  id: ChronicleCardId;
  name: string;
  copies: 2;
  cost: number;
  placementIcons: readonly PlacementIcon[];
  journeyText: string;
  muster: { influence: number; swords: number };
  reviewedCapabilities: readonly ['chronicle-market', 'agent-placement', 'reveal'];
};

/** The first executable Chronicle batch. Every printed box is live. */
export const CHRONICLE_CARD_DEFINITIONS: readonly ChronicleCardDefinition[] = [
  {
    id: 'rider-rohan', name: 'Rider of Rohan', copies: 2, cost: 2,
    placementIcons: ['Stronghold'], journeyText: 'Recruit 1 Company',
    muster: { influence: 1, swords: 1 },
    reviewedCapabilities: ['chronicle-market', 'agent-placement', 'reveal']
  },
  {
    id: 'bree-land-guide', name: 'Bree-land Guide', copies: 2, cost: 2,
    placementIcons: ['Roads', 'Stronghold'], journeyText: 'Gain 1 Provision',
    muster: { influence: 1, swords: 0 },
    reviewedCapabilities: ['chronicle-market', 'agent-placement', 'reveal']
  },
  {
    id: 'captain-gondor', name: 'Captain of Gondor', copies: 2, cost: 4,
    placementIcons: ['Stronghold', 'Council'], journeyText: 'Recruit 2 Companies',
    muster: { influence: 1, swords: 2 },
    reviewedCapabilities: ['chronicle-market', 'agent-placement', 'reveal']
  }
];

export type BattleReward = {
  gold?: number;
  mithril?: number;
  provisions?: number;
  recruitCompanies?: number;
  renown?: number;
  drawFate?: number;
  drawTwoFateKeepOne?: boolean;
  shadowStanding?: number;
  dwarvenStanding?: number;
  wildStanding?: number;
  chooseFactionStanding?: number;
  placeScouts?: number;
  breachDam?: boolean;
  controlLocationId?: 'minas-tirith' | 'osgiliath' | 'edoras';
};

export type BattleCardDefinition = {
  id: string;
  name: string;
  age: 1 | 2 | 3;
  standard: 'White Tree' | 'Horse' | 'Star';
  contestedLocationId: 'minas-tirith' | 'osgiliath' | 'edoras' | null;
  rewards: readonly [BattleReward, BattleReward, BattleReward];
  reviewedCapabilities: readonly ['battle-resolution'];
};

/** The first executable Battle batch. Later batches extend this real deck. */
export const BATTLE_CARD_DEFINITIONS: readonly BattleCardDefinition[] = [
  {
    id: 'crossing-isen',
    name: 'Crossing of the Isen',
    age: 1,
    standard: 'Star',
    contestedLocationId: null,
    rewards: [
      { gold: 3, recruitCompanies: 1 },
      { gold: 2 },
      { gold: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'siege-minas-tirith',
    name: 'Siege of Minas Tirith',
    age: 2,
    standard: 'White Tree',
    contestedLocationId: 'minas-tirith',
    rewards: [
      { controlLocationId: 'minas-tirith', renown: 1 },
      { gold: 3, drawFate: 1 },
      { gold: 2 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'battle-pelennor-fields',
    name: 'Battle of the Pelennor Fields',
    age: 3,
    standard: 'White Tree',
    contestedLocationId: 'minas-tirith',
    rewards: [
      { controlLocationId: 'minas-tirith', renown: 2 },
      { renown: 1, drawFate: 1 },
      { mithril: 2 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'battle-helms-deep',
    name: "Battle of Helm's Deep",
    age: 3,
    standard: 'Horse',
    contestedLocationId: 'edoras',
    rewards: [
      { controlLocationId: 'edoras', renown: 2 },
      { renown: 1, gold: 2 },
      { gold: 3 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'wargs-wild',
    name: 'Wargs in the Wild',
    age: 2,
    standard: 'Star',
    contestedLocationId: null,
    rewards: [
      { renown: 1, provisions: 1 },
      { provisions: 2 },
      { provisions: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'battle-osgiliath',
    name: 'Battle for Osgiliath',
    age: 2,
    standard: 'White Tree',
    contestedLocationId: 'osgiliath',
    rewards: [
      { controlLocationId: 'osgiliath', renown: 1 },
      { mithril: 2 },
      { mithril: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'raid-westfold',
    name: 'Raid on the Westfold',
    age: 1,
    standard: 'Horse',
    contestedLocationId: 'edoras',
    rewards: [
      { controlLocationId: 'edoras', provisions: 1 },
      { mithril: 1 },
      { gold: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'skirmish-amon-hen',
    name: 'Skirmish at Amon Hen',
    age: 1,
    standard: 'White Tree',
    contestedLocationId: null,
    rewards: [
      { mithril: 2, drawFate: 1 },
      { mithril: 1 },
      { gold: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'contest-aglarond',
    name: 'Contest for Aglarond',
    age: 2,
    standard: 'Star',
    contestedLocationId: 'edoras',
    rewards: [
      { controlLocationId: 'edoras', renown: 1 },
      { mithril: 3 },
      { mithril: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'muster-edoras',
    name: 'Muster at Edoras',
    age: 2,
    standard: 'Horse',
    contestedLocationId: 'edoras',
    rewards: [
      { controlLocationId: 'edoras', recruitCompanies: 3 },
      { recruitCompanies: 2, gold: 2 },
      { recruitCompanies: 1, gold: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'defence-dale',
    name: 'Defence of Dale',
    age: 2,
    standard: 'White Tree',
    contestedLocationId: null,
    rewards: [
      { renown: 1, dwarvenStanding: 1 },
      { mithril: 2, gold: 1 },
      { gold: 2 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'last-march-ents',
    name: 'Last March of the Ents',
    age: 3,
    standard: 'Horse',
    contestedLocationId: null,
    rewards: [
      { renown: 2, breachDam: true, mithril: 2 },
      { renown: 1, provisions: 2 },
      { renown: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'assault-fords',
    name: 'Assault on the Fords',
    age: 2,
    standard: 'Horse',
    contestedLocationId: null,
    rewards: [
      { renown: 1, wildStanding: 1 },
      { chooseFactionStanding: 1 },
      { gold: 2 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'ambush-ithilien',
    name: 'Ambush in Ithilien',
    age: 2,
    standard: 'Horse',
    contestedLocationId: null,
    rewards: [
      { renown: 1, placeScouts: 1 },
      { drawFate: 1, mithril: 1 },
      { mithril: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'treachery-orthanc',
    name: 'Treachery at Orthanc',
    age: 2,
    standard: 'Star',
    contestedLocationId: null,
    rewards: [
      { renown: 1, shadowStanding: 1 },
      { drawTwoFateKeepOne: true },
      { drawFate: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  },
  {
    id: 'clash-morannon',
    name: 'Clash at the Morannon',
    age: 3,
    standard: 'Star',
    contestedLocationId: null,
    rewards: [
      { renown: 2, chooseFactionStanding: 1 },
      { renown: 1, recruitCompanies: 2 },
      { renown: 1 }
    ],
    reviewedCapabilities: ['battle-resolution']
  }
];

export type FateCardDefinition = {
  id: 'secret-ways' | 'chance-meeting' | 'gifts-tokens' | 'tidings-afar' | 'divided-counsel' | 'long-memory' | 'sudden-charge' | 'hold-line' | 'hidden-archers' | 'fell-sorcery' | 'reinforcements' | 'desperate-valor' | 'lore-beyond-price' | 'keeper-oaths';
  name: string;
  copies: 2;
  timing: 'Plot' | 'Combat' | 'Endgame';
  effect:
    | { kind: 'place-scout'; amount: 1 }
    | { kind: 'draw-discard'; draw: 1; discard: 1 }
    | { kind: 'choose-resources'; gainGold: 2; payGold: 2; gainMithril: 1; gainProvision: 1 }
    | { kind: 'draw-top-deck'; draw: 2; topDeck: 1 }
    | { kind: 'opponent-gold-or-reveal'; loseGold: 1 }
    | { kind: 'cycle-chronicle'; maximumCost: 3 }
    | { kind: 'gain-battle-strength'; amount: 3 }
    | { kind: 'hold-line'; amount: 2; controlledLocationBonus: 2 }
    | { kind: 'hidden-archers'; maximum: 3 }
    | { kind: 'fell-sorcery'; costMithril: 1; strengthLoss: 3 }
    | { kind: 'reinforcements'; deployCompanies: 1; fallbackStrength: 2 }
    | { kind: 'desperate-valor'; returnCompanies: 1; strength: 5 }
    | { kind: 'pay-mithril-renown'; costMithril: 4; renown: 1 }
    | { kind: 'alliance-renown'; requiredAlliances: 2; renown: 1 };
  reviewedCapabilities: readonly ('plot-fate' | 'combat-fate' | 'endgame-fate')[];
};

export const FATE_CARD_DEFINITIONS: readonly FateCardDefinition[] = [
  {
    id: 'secret-ways',
    name: 'Secret Ways',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'place-scout', amount: 1 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'chance-meeting',
    name: 'A Chance Meeting',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'draw-discard', draw: 1, discard: 1 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'gifts-tokens',
    name: 'Gifts and Tokens',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'choose-resources', gainGold: 2, payGold: 2, gainMithril: 1, gainProvision: 1 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'tidings-afar',
    name: 'Tidings from Afar',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'draw-top-deck', draw: 2, topDeck: 1 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'divided-counsel',
    name: 'Divided Counsel',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'opponent-gold-or-reveal', loseGold: 1 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'long-memory',
    name: 'Long Memory',
    copies: 2,
    timing: 'Plot',
    effect: { kind: 'cycle-chronicle', maximumCost: 3 },
    reviewedCapabilities: ['plot-fate']
  },
  {
    id: 'sudden-charge',
    name: 'Sudden Charge',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'gain-battle-strength', amount: 3 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'hold-line',
    name: 'Hold the Line',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'hold-line', amount: 2, controlledLocationBonus: 2 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'hidden-archers',
    name: 'Hidden Archers',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'hidden-archers', maximum: 3 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'fell-sorcery',
    name: 'Fell Sorcery',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'fell-sorcery', costMithril: 1, strengthLoss: 3 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'reinforcements',
    name: 'Reinforcements',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'reinforcements', deployCompanies: 1, fallbackStrength: 2 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'desperate-valor',
    name: 'Desperate Valor',
    copies: 2,
    timing: 'Combat',
    effect: { kind: 'desperate-valor', returnCompanies: 1, strength: 5 },
    reviewedCapabilities: ['combat-fate']
  },
  {
    id: 'lore-beyond-price',
    name: 'Lore Beyond Price',
    copies: 2,
    timing: 'Endgame',
    effect: { kind: 'pay-mithril-renown', costMithril: 4, renown: 1 },
    reviewedCapabilities: ['endgame-fate']
  },
  {
    id: 'keeper-oaths',
    name: 'Keeper of Oaths',
    copies: 2,
    timing: 'Endgame',
    effect: { kind: 'alliance-renown', requiredAlliances: 2, renown: 1 },
    reviewedCapabilities: ['endgame-fate']
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
    | { kind: 'deep-roads'; costMithril: 5; gainStanding: 'dwarven'; recruitCompanies: 5; battleSpace: true }
    | { kind: 'tribute-shadow'; gainStanding: 'shadow'; gainGold: 2 }
    | { kind: 'pits-isengard'; costMithril: 4; gainStanding: 'shadow'; drawFate: 1; recruitCompanies: 4 }
    | { kind: 'hidden-paths'; gainStanding: 'wild'; drawCards: 1; battleSpace: true }
    | { kind: 'ranger-mustering'; costProvisions: 1; gainStanding: 'wild'; recruitCompanies: 1; optionalTrashFromHandOrDiscard: 1; battleSpace: true }
    | { kind: 'hidden-counsel'; gainStanding: 'elven'; drawFate: 1; stealFromOpponentsAtFateCount: 4 }
    | { kind: 'mirror-galadriel'; costMithril: 1; gainStanding: 'elven'; drawCards: 1; placeScouts: 1 }
    | { kind: 'secret-bargain'; requiredShadowStanding: 2; costGold: 3; optionalCycleFate: 1; recallOtherAgents: 1; drawCards: 1 }
    | { kind: 'captain-host'; firstCostGold: 8; laterCostGold: 6; unlockAgents: 1; availableNextTurn: true; oncePerGame: true }
    | { kind: 'take-war-effort'; drawCards: 1; gainGoldWithoutModule: 2 }
    | { kind: 'muster-free-peoples'; recruitCompanies: 2; optionalGoldCost: 2; optionalGainProvisions: 1 }
    | { kind: 'hall-of-fire'; drawFate: 1; revealInfluence: 1 }
    | { kind: 'minas-tirith'; recruitCompanies: 1; drawCards: 1; controllerBonusGold: 1; battleSpace: true }
    | { kind: 'archives-rivendell'; costProvisions: 2; recruitCompanies: 2; drawCards: 2; battleSpace: true }
    | { kind: 'osgiliath'; optionalCostMithril: 1; freeGold: 2; paidGold: 4; controllerBonusGold: 1; battleSpace: true }
    | { kind: 'great-forge'; requiredDwarvenStanding: 2; costMithril: 3; gainGold: 5; gainAnyStanding: 1 }
    | { kind: 'fangorn-moot'; requiredWildStanding: 2; grantEntDraught: true; recruitCompanies: 1; gainProvisions: 1; mayBreachDam: true; battleSpace: true }
    | { kind: 'deep-fangorn'; costProvisions: 3; gainMithril: 4; summonEnts: 2; riches: true; battleSpace: true }
    | { kind: 'entwash'; costProvisions: 1; gainMithril: 2; summonEnts: 1; riches: true; battleSpace: true }
    | { kind: 'edoras'; gainMithril: 1; controllerBonusMithril: 1; riches: true; battleSpace: true }
    | { kind: 'white-council-seat'; costGold: 5; repeatGainMithril: 2; repeatDrawFate: 1; repeatRecruitCompanies: 3; revealInfluence: 2 };
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
    id: 'deep-roads',
    name: 'Deep Roads',
    region: 'Dwarven Holds',
    placementIcons: ['Dwarven'],
    effect: { kind: 'deep-roads', costMithril: 5, gainStanding: 'dwarven', recruitCompanies: 5, battleSpace: true },
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
    id: 'pits-isengard',
    name: 'Pits of Isengard',
    region: 'Shadow Hosts',
    placementIcons: ['Shadow'],
    effect: { kind: 'pits-isengard', costMithril: 4, gainStanding: 'shadow', drawFate: 1, recruitCompanies: 4 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'hidden-counsel',
    name: 'Hidden Counsel',
    region: 'Elven Realms',
    placementIcons: ['Elven'],
    effect: { kind: 'hidden-counsel', gainStanding: 'elven', drawFate: 1, stealFromOpponentsAtFateCount: 4 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'hidden-paths',
    name: 'Hidden Paths',
    region: 'Wild Kindreds',
    placementIcons: ['Wild'],
    effect: { kind: 'hidden-paths', gainStanding: 'wild', drawCards: 1, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'ranger-mustering',
    name: 'Ranger Mustering',
    region: 'Wild Kindreds',
    placementIcons: ['Wild'],
    effect: { kind: 'ranger-mustering', costProvisions: 1, gainStanding: 'wild', recruitCompanies: 1, optionalTrashFromHandOrDiscard: 1, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'mirror-galadriel',
    name: 'Mirror of Galadriel',
    region: 'Elven Realms',
    placementIcons: ['Elven'],
    effect: { kind: 'mirror-galadriel', costMithril: 1, gainStanding: 'elven', drawCards: 1, placeScouts: 1 },
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
    id: 'hall-fire',
    name: 'Hall of Fire',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'hall-of-fire', drawFate: 1, revealInfluence: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'secret-bargain',
    name: 'Secret Bargain',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'secret-bargain', requiredShadowStanding: 2, costGold: 3, optionalCycleFate: 1, recallOtherAgents: 1, drawCards: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'captain-host',
    name: 'Captain of the Host',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'captain-host', firstCostGold: 8, laterCostGold: 6, unlockAgents: 1, availableNextTurn: true, oncePerGame: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'muster-free-peoples',
    name: 'Muster the Free Peoples',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'muster-free-peoples', recruitCompanies: 2, optionalGoldCost: 2, optionalGainProvisions: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'minas-tirith',
    name: 'Minas Tirith',
    region: 'Strongholds',
    placementIcons: ['Stronghold'],
    effect: { kind: 'minas-tirith', recruitCompanies: 1, drawCards: 1, controllerBonusGold: 1, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'archives-rivendell',
    name: 'Archives of Rivendell',
    region: 'Strongholds',
    placementIcons: ['Stronghold'],
    effect: { kind: 'archives-rivendell', costProvisions: 2, recruitCompanies: 2, drawCards: 2, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'osgiliath',
    name: 'Osgiliath',
    region: 'Strongholds',
    placementIcons: ['Stronghold'],
    effect: { kind: 'osgiliath', optionalCostMithril: 1, freeGold: 2, paidGold: 4, controllerBonusGold: 1, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'great-forge',
    name: 'Great Forge',
    region: 'Roads',
    placementIcons: ['Roads'],
    effect: { kind: 'great-forge', requiredDwarvenStanding: 2, costMithril: 3, gainGold: 5, gainAnyStanding: 1 },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'edoras',
    name: 'Edoras',
    region: 'Roads',
    placementIcons: ['Roads'],
    effect: { kind: 'edoras', gainMithril: 1, controllerBonusMithril: 1, riches: true, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'fangorn-moot',
    name: 'Fangorn Moot',
    region: 'Strongholds',
    placementIcons: ['Stronghold'],
    effect: { kind: 'fangorn-moot', requiredWildStanding: 2, grantEntDraught: true, recruitCompanies: 1, gainProvisions: 1, mayBreachDam: true, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'deep-fangorn',
    name: 'Deep Fangorn',
    region: 'Roads',
    placementIcons: ['Roads'],
    effect: { kind: 'deep-fangorn', costProvisions: 3, gainMithril: 4, summonEnts: 2, riches: true, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'entwash',
    name: 'Entwash',
    region: 'Roads',
    placementIcons: ['Roads'],
    effect: { kind: 'entwash', costProvisions: 1, gainMithril: 2, summonEnts: 1, riches: true, battleSpace: true },
    reviewedCapabilities: ['agent-placement']
  },
  {
    id: 'white-council-seat',
    name: 'Seat on the White Council',
    region: 'White Council',
    placementIcons: ['Council'],
    effect: { kind: 'white-council-seat', costGold: 5, repeatGainMithril: 2, repeatDrawFate: 1, repeatRecruitCompanies: 3, revealInfluence: 2 },
    reviewedCapabilities: ['agent-placement']
  }
];

export function cardName(id: string): string {
  return STARTING_CARD_IDENTITIES.find((card) => card.id === id)?.name
    ?? RESERVE_CARD_DEFINITIONS.find((card) => card.id === id)?.name
    ?? CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === id)?.name
    ?? id;
}
