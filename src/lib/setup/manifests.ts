export const MANIFEST_VERSION = 'wfme-0.1.0';

export type Manifest<T> = {
  manifestVersion: string;
  provenance: string;
  reviewed: boolean;
  entries: readonly T[];
};

export type BoardDestination = { id: string; name: string; category: 'faction' | 'council' | 'map' | 'road'; critical?: boolean };
export type CardDefinition = { id: string; name: string; copies: number };

const boardNames: readonly [string, BoardDestination['category'], boolean?][] = [
  ['tribute-shadow', 'faction'], ['pits-isengard', 'faction'], ['dwarven-caravans', 'faction'], ['deep-roads', 'faction'],
  ['hidden-counsel', 'faction'], ['mirror-galadriel', 'faction'], ['hidden-paths', 'faction'], ['ranger-mustering', 'faction'],
  ['hall-fire', 'council'], ['muster-free-peoples', 'council'], ['white-council-seat', 'council'], ['secret-bargain', 'council'],
  ['captain-host', 'council'], ['minas-tirith', 'map', true], ['archives-rivendell', 'map'], ['fangorn-moot', 'map'],
  ['osgiliath', 'map', true], ['take-war-effort', 'road'], ['great-forge', 'road'], ['deep-fangorn', 'road'],
  ['entwash', 'road'], ['edoras', 'road', true]
];

export const BOARD_MANIFEST: Manifest<BoardDestination> = {
  manifestVersion: MANIFEST_VERSION,
  provenance: 'BOARD_LAYOUT.md § Board zones and observation-post network',
  reviewed: true,
  entries: boardNames.map(([id, category, critical]) => ({ id, name: id.replaceAll('-', ' '), category, ...(critical ? { critical } : {}) }))
};

const startingNames = [
  ['rallying-words', 2], ['armed-escort', 2], ['the-open-road', 2], ['diplomatic-mission', 1],
  ['reconnaissance', 1], ['seek-allies', 1], ['token-of-command', 1]
] as const;
const chronicleNames = ['rider-rohan', 'bree-guide', 'whispered-rumor', 'goblin-informer', 'dwarven-smith', 'ranger-north', 'stewards-messenger', 'orcish-muster', 'lore-imladris', 'delving-expedition', 'messenger-moth', 'captain-gondor', 'uruk-hai-captain', 'elven-foresight', 'khazad-guard', 'warden-ithilien', 'palantir-glimpse', 'paths-dead', 'envoy-dale', 'eagle-misty-mountains', 'lady-golden-wood', 'master-lake-town', 'durins-heir', 'voice-orthanc', 'grey-pilgrim', 'lord-nazgul', 'heir-isildur'];
const fateNames = ['chance-meeting', 'long-memory', 'secret-ways', 'gifts-tokens', 'divided-counsel', 'tidings-afar', 'sudden-charge', 'hold-line', 'hidden-archers', 'fell-sorcery', 'reinforcements', 'desperate-valor', 'keeper-oaths', 'lore-beyond-price', 'long-game'];
const battleNames = ['raid-westfold', 'skirmish-amon-hen', 'crossing-isen', 'battle-osgiliath', 'siege-minas-tirith', 'wargs-wild', 'ambush-ithilien', 'contest-aglarond', 'muster-edoras', 'assault-fords', 'treachery-orthanc', 'defence-dale', 'battle-helms-deep', 'battle-pelennor', 'clash-morannon', 'last-march-ents'];

function cards(names: readonly string[], copies: number): readonly CardDefinition[] {
  return names.map((id) => ({ id, name: id.replaceAll('-', ' '), copies }));
}

export const STARTING_DECK_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'CARD_CATALOG.md § Shared starting deck', reviewed: true, entries: startingNames.map(([id, copies]) => ({ id, name: id.replaceAll('-', ' '), copies })) };
export const CHRONICLE_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'CARD_CATALOG.md § Chronicle deck', reviewed: true, entries: cards(chronicleNames, 2) };
export const FATE_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'CARD_CATALOG.md § Fate deck', reviewed: true, entries: cards(fateNames, 2) };
export const BATTLE_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'CARD_CATALOG.md § Battle deck', reviewed: true, entries: cards(battleNames, 1) };
export const COMMANDER_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'CARD_CATALOG.md § Commanders', reviewed: true, entries: cards(['aragorn', 'theoden', 'galadriel', 'gandalf', 'eowyn', 'saruman', 'witch-king', 'treebeard'], 1) };
export const RIVAL_MANIFEST: Manifest<CardDefinition> = { manifestVersion: MANIFEST_VERSION, provenance: 'RIVALS.md § Rival profiles', reviewed: true, entries: cards(['black-captain', 'mountain-king', 'far-seer', 'border-marshal'], 1) };

export function expandInstances(manifest: Manifest<CardDefinition>): string[] {
  return manifest.entries.flatMap((entry) => Array.from({ length: entry.copies }, (_, index) => `${entry.id}-${String(index + 1).padStart(2, '0')}`));
}
