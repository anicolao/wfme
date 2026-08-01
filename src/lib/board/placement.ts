export type PlacementIcon = 'Council' | 'Stronghold' | 'Roads' | 'Shadow' | 'Dwarven' | 'Elven' | 'Wild' | 'Scout';

export type PlacementCard = { id: string; name: string; icons: readonly PlacementIcon[]; cost: number };
export type Destination = { id: string; name: string; icons: readonly PlacementIcon[]; cost: number; requirement?: { faction: string; standing: number }; scoutable?: boolean };
export type PlacementState = { resources: { gold: number; mithril: number; provisions: number }; standing: Record<string, number>; occupied: string[]; scouts: string[] };

export const PLACEMENT_CARDS: readonly PlacementCard[] = [
  { id: 'armed-escort-01', name: 'Armed Escort', icons: ['Council', 'Stronghold'], cost: 0 },
  { id: 'the-open-road-01', name: 'The Open Road', icons: ['Roads'], cost: 0 },
  { id: 'diplomatic-mission-01', name: 'Diplomatic Mission', icons: ['Shadow', 'Dwarven', 'Elven', 'Wild'], cost: 0 },
  { id: 'reconnaissance-01', name: 'Reconnaissance', icons: ['Stronghold', 'Roads'], cost: 0 }
];

export const DESTINATIONS: readonly Destination[] = [
  { id: 'hall-fire', name: 'Hall of Fire', icons: ['Council'], cost: 0 },
  { id: 'minas-tirith', name: 'Minas Tirith', icons: ['Stronghold'], cost: 1, scoutable: true },
  { id: 'edoras', name: 'Edoras', icons: ['Roads'], cost: 1, scoutable: true },
  { id: 'tribute-shadow', name: 'Tribute to the Shadow', icons: ['Shadow'], cost: 0, requirement: { faction: 'shadow', standing: 0 } },
  { id: 'dwarven-caravans', name: 'Dwarven Caravans', icons: ['Dwarven'], cost: 1, requirement: { faction: 'dwarven', standing: 0 } },
  { id: 'hidden-counsel', name: 'Hidden Counsel', icons: ['Elven'], cost: 0, requirement: { faction: 'elven', standing: 0 } },
  { id: 'hidden-paths', name: 'Hidden Paths', icons: ['Wild'], cost: 0, requirement: { faction: 'wild', standing: 0 } }
];

export function legalDestinations(card: PlacementCard, state: PlacementState): Destination[] {
  return DESTINATIONS.filter((destination) => {
    const iconMatch = card.icons.some((icon) => destination.icons.includes(icon));
    const available = !state.occupied.includes(destination.id) || (destination.scoutable && state.scouts.includes(destination.id));
    const requirement = !destination.requirement || (state.standing[destination.requirement.faction] ?? 0) >= destination.requirement.standing;
    return iconMatch && available && requirement && state.resources.gold + state.resources.mithril + state.resources.provisions >= destination.cost;
  });
}

export function placeAgent(card: PlacementCard, destination: Destination, state: PlacementState): PlacementState {
  if (!legalDestinations(card, state).some((candidate) => candidate.id === destination.id)) throw new Error('Illegal Agent placement');
  const resources = { ...state.resources };
  let remaining = destination.cost;
  for (const resource of ['gold', 'provisions', 'mithril'] as const) {
    const paid = Math.min(resources[resource], remaining);
    resources[resource] -= paid;
    remaining -= paid;
  }
  return { ...state, resources, occupied: [...state.occupied.filter((id) => id !== destination.id), destination.id], scouts: state.scouts.filter((id) => id !== destination.id) };
}
