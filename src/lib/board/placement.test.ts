import { describe, expect, it } from 'vitest';
import { DESTINATIONS, legalDestinations, PLACEMENT_CARDS, placeAgent, type PlacementState } from './placement';

const state: PlacementState = { resources: { gold: 1, mithril: 0, provisions: 1 }, standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 }, occupied: [], scouts: [] };

describe('Agent placement legality', () => {
  it('matches card icons and pays the destination cost atomically', () => {
    const card = PLACEMENT_CARDS.find(({ id }) => id === 'the-open-road-01')!;
    const edoras = DESTINATIONS.find(({ id }) => id === 'edoras')!;
    expect(legalDestinations(card, state).map(({ id }) => id)).toContain('edoras');
    expect(placeAgent(card, edoras, state)).toMatchObject({ resources: { gold: 0, provisions: 1 }, occupied: ['edoras'] });
  });

  it('allows an occupied destination only when a Scout infiltrates it', () => {
    const card = PLACEMENT_CARDS.find(({ id }) => id === 'the-open-road-01')!;
    const occupied = { ...state, occupied: ['edoras'] };
    expect(legalDestinations(card, occupied).map(({ id }) => id)).not.toContain('edoras');
    expect(legalDestinations(card, { ...occupied, scouts: ['edoras'] }).map(({ id }) => id)).toContain('edoras');
  });
});
