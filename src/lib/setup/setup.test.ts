import { describe, expect, it } from 'vitest';
import { BATTLE_MANIFEST, CHRONICLE_MANIFEST, expandInstances, FATE_MANIFEST, STARTING_DECK_MANIFEST } from './manifests';
import { createSeededSetup, privatePlayerSetup, publicSetup } from './setup';

describe('versioned seeded setup', () => {
  it('matches the reviewed component counts', () => {
    expect(expandInstances(STARTING_DECK_MANIFEST)).toHaveLength(10);
    expect(expandInstances(CHRONICLE_MANIFEST)).toHaveLength(54);
    expect(expandInstances(FATE_MANIFEST)).toHaveLength(30);
    expect(expandInstances(BATTLE_MANIFEST)).toHaveLength(16);
  });

  it('is deterministic and keeps private hands out of the public projection', () => {
    const first = createSeededSetup('middle-earth-001', ['aragorn-seat', 'galadriel-seat']);
    const second = createSeededSetup('middle-earth-001', ['aragorn-seat', 'galadriel-seat']);
    expect(second).toEqual(first);
    expect(publicSetup(first)).not.toHaveProperty('players[0].hand');
    expect(privatePlayerSetup(first, 'aragorn-seat')?.hand).toHaveLength(5);
    expect(publicSetup(first).chronicleRow).toHaveLength(5);
  });
});
