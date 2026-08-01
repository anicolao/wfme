import { BATTLE_MANIFEST, CHRONICLE_MANIFEST, expandInstances, FATE_MANIFEST, MANIFEST_VERSION, STARTING_DECK_MANIFEST } from './manifests';
import { shuffled } from './prng';

export type PlayerSetup = {
  uid: string;
  deck: string[];
  hand: string[];
  drawPile: string[];
  discard: string[];
  resources: { gold: number; mithril: number; provisions: number };
};

export type SeededSetup = {
  seed: string;
  manifestVersion: string;
  firstPlayerUid: string;
  chronicleRow: string[];
  chronicleDeck: string[];
  fateDeck: string[];
  battleDeck: string[];
  players: PlayerSetup[];
};

export function createSeededSetup(seed: string, playerUids: readonly string[]): SeededSetup {
  const order = shuffled(playerUids, `${seed}:players`);
  const chronicle = shuffled(expandInstances(CHRONICLE_MANIFEST), `${seed}:chronicle`);
  const starting = expandInstances(STARTING_DECK_MANIFEST);
  const players = order.map((uid) => {
    const deck = shuffled(starting.map((card, index) => `${uid}:${card}:${index}`), `${seed}:${uid}:deck`);
    return { uid, deck, hand: deck.slice(0, 5), drawPile: deck.slice(5), discard: [], resources: { gold: 0, mithril: 0, provisions: 2 } };
  });
  return {
    seed,
    manifestVersion: MANIFEST_VERSION,
    firstPlayerUid: order[0],
    chronicleRow: chronicle.slice(0, 5),
    chronicleDeck: chronicle.slice(5),
    fateDeck: shuffled(expandInstances(FATE_MANIFEST), `${seed}:fate`),
    battleDeck: shuffled(expandInstances(BATTLE_MANIFEST), `${seed}:battle`),
    players
  };
}

export function publicSetup(setup: SeededSetup) {
  return { seed: setup.seed, manifestVersion: setup.manifestVersion, firstPlayerUid: setup.firstPlayerUid, chronicleRow: setup.chronicleRow, battleDeckCount: setup.battleDeck.length, playerUids: setup.players.map(({ uid }) => uid) };
}

export function privatePlayerSetup(setup: SeededSetup, uid: string) {
  return setup.players.find((player) => player.uid === uid) ?? null;
}
