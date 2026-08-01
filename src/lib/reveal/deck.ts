export type DeckZones = { deck: string[]; hand: string[]; discard: string[]; trash: string[]; chronicleRow: string[]; chronicleDeck: string[]; influence: number };

export function draw(deck: DeckZones, count: number): DeckZones {
  const next = { ...deck, deck: [...deck.deck], hand: [...deck.hand] };
  for (let index = 0; index < count && next.deck.length > 0; index += 1) next.hand.push(next.deck.shift()!);
  return next;
}

export function acquire(deck: DeckZones, cardId: string, cost: number, refill: readonly string[]): DeckZones {
  if (!deck.chronicleRow.includes(cardId) || deck.influence < cost) throw new Error('Illegal acquisition');
  const chronicleRow = deck.chronicleRow.filter((id) => id !== cardId);
  const chronicleDeck = [...deck.chronicleDeck];
  const refillCard = chronicleDeck.shift() ?? refill.find((id) => !chronicleRow.includes(id));
  if (refillCard) chronicleRow.push(refillCard);
  return { ...deck, chronicleRow, chronicleDeck, influence: deck.influence - cost, discard: [...deck.discard, cardId] };
}

export function reshuffle(deck: DeckZones, shuffledDiscard: readonly string[]): DeckZones {
  if (deck.deck.length > 0) return deck;
  return { ...deck, deck: [...shuffledDiscard], discard: [] };
}

export function trash(deck: DeckZones, cardId: string): DeckZones {
  const hand = deck.hand.filter((id) => id !== cardId);
  if (hand.length === deck.hand.length) throw new Error('Card is not in hand');
  return { ...deck, hand, trash: [...deck.trash, cardId] };
}

export function zoneCount(deck: DeckZones): number {
  return deck.deck.length + deck.hand.length + deck.discard.length + deck.trash.length + deck.chronicleRow.length + deck.chronicleDeck.length;
}
