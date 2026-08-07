import type {
  CardInstance,
  FateInstance,
  GameState,
  MatchState,
  WarEffortInstance
} from './reducer';

const HIDDEN_DEFINITION = '[hidden]';

function hiddenCards(count: number, zone: string): CardInstance[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `[hidden:${zone}:${index + 1}]`,
    definitionId: HIDDEN_DEFINITION
  }));
}

function hiddenFate(count: number, zone: string): FateInstance[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `[hidden:${zone}:${index + 1}]`,
    definitionId: HIDDEN_DEFINITION
  }));
}

function hiddenWarEfforts(count: number): WarEffortInstance[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `[hidden:war-effort-deck:${index + 1}]`,
    definitionId: HIDDEN_DEFINITION
  })) as unknown as WarEffortInstance[];
}

function hiddenIds(count: number, zone: string): string[] {
  return Array.from({ length: count }, (_, index) => `[hidden:${zone}:${index + 1}]`);
}

function localDrawPile(cards: readonly CardInstance[], revealedIds: ReadonlySet<string>): CardInstance[] {
  return [...cards]
    .sort((left, right) => left.definitionId.localeCompare(right.definitionId) || left.id.localeCompare(right.id))
    .map((card, index) => revealedIds.has(card.id)
      ? structuredClone(card)
      : { id: `[hidden:local-draw-pile:${index + 1}]`, definitionId: card.definitionId });
}

function redactPrivateChoice(
  pendingChoice: MatchState['pendingChoice'],
  localUid: string
): MatchState['pendingChoice'] {
  if (!pendingChoice || pendingChoice.actorUid === localUid) return pendingChoice;

  switch (pendingChoice.kind) {
    case 'commander-fate-foresight': {
      const fateIds = hiddenIds(pendingChoice.fateIds.length, 'fate-choice');
      return {
        ...pendingChoice,
        fateIds,
        options: fateIds.map((id) => `take-fate:${id}`)
      };
    }
    case 'commander-ring-eowyn':
    case 'chronicle-card-choice':
    case 'ranger-mustering-trash':
    case 'plot-discard':
    case 'tidings-afar': {
      const cardInstanceIds = hiddenIds(pendingChoice.cardInstanceIds.length, 'card-choice');
      return { ...pendingChoice, cardInstanceIds, options: hiddenIds(pendingChoice.options.length, 'choice') };
    }
    case 'chronicle-elven-foresight': {
      const cardInstanceIds = hiddenIds(pendingChoice.cardInstanceIds.length, 'deck-choice');
      return { ...pendingChoice, cardInstanceIds, options: hiddenIds(pendingChoice.options.length, 'deck-order') };
    }
    case 'battle-fate-keep':
    case 'elven-favor': {
      const drawnFateIds = hiddenIds(pendingChoice.drawnFateIds.length, 'fate-choice');
      return { ...pendingChoice, drawnFateIds, options: hiddenIds(pendingChoice.options.length, 'choice') };
    }
    case 'divided-counsel-review':
      return {
        ...pendingChoice,
        cardInstanceIds: hiddenIds(pendingChoice.cardInstanceIds.length, 'revealed-hand')
      };
    default:
      return pendingChoice;
  }
}

/**
 * Produces the only GameState that presentation components may receive.
 *
 * Counts and public zones remain available, while shuffle seeds, deck order,
 * opponent private zones, and another seat's private decision identifiers are
 * replaced with inert sentinels. This is a rendering safety boundary, not an
 * adversarial-security claim: the trusted client still receives the event log.
 */
export function projectSeatView(state: GameState, localUid: string): GameState {
  const view = structuredClone(state);
  for (const finished of view.finishedMatches) finished.seed = HIDDEN_DEFINITION;
  if (!state.match) return view;

  const sourceMatch = state.match;
  const viewMatch = view.match!;
  const pendingChoice = sourceMatch.pendingChoice;
  const revealedDrawIds = pendingChoice?.kind === 'chronicle-elven-foresight' && pendingChoice.actorUid === localUid
    ? new Set(pendingChoice.cardInstanceIds)
    : new Set<string>();
  const revealedFateIds = pendingChoice?.kind === 'commander-fate-foresight' && pendingChoice.actorUid === localUid
    ? new Set(pendingChoice.fateIds)
    : new Set<string>();
  viewMatch.seed = HIDDEN_DEFINITION;
  viewMatch.fateDeck = sourceMatch.fateDeck.map((fate, index) => revealedFateIds.has(fate.id)
    ? structuredClone(fate)
    : hiddenFate(1, `fate-deck:${index + 1}`)[0]);
  viewMatch.chronicleDeck = hiddenCards(sourceMatch.chronicleDeck.length, 'chronicle-deck');
  viewMatch.battleDeck = hiddenIds(sourceMatch.battleDeck.length, 'battle-deck');
  viewMatch.warEffortDeck = hiddenWarEfforts(sourceMatch.warEffortDeck.length);
  viewMatch.rivalActionDeck = hiddenIds(sourceMatch.rivalActionDeck.length, 'rival-action-deck');

  for (const [uid, sourcePlayer] of Object.entries(sourceMatch.players)) {
    const player = viewMatch.players[uid];
    player.drawPile = uid === localUid
      ? localDrawPile(sourcePlayer.drawPile, revealedDrawIds)
      : hiddenCards(sourcePlayer.drawPile.length, `${uid}:draw-pile`);
    if (uid !== localUid) {
      player.hand = hiddenCards(sourcePlayer.hand.length, `${uid}:hand`);
      player.fateHand = hiddenFate(sourcePlayer.fateHand.length, `${uid}:fate-hand`);
    }
  }

  if (pendingChoice?.kind === 'divided-counsel-review' && pendingChoice.actorUid === localUid) {
    const target = viewMatch.players[pendingChoice.targetUid];
    const sourceTarget = sourceMatch.players[pendingChoice.targetUid];
    const revealedIds = new Set(pendingChoice.cardInstanceIds);
    target.hand = sourceTarget.hand.map((card, index) => revealedIds.has(card.id)
      ? structuredClone(card)
      : hiddenCards(1, `${pendingChoice.targetUid}:hand:${index + 1}`)[0]);
  }

  if (sourceMatch.queuedChronicleCardChoice?.actorUid !== localUid) {
    const queued = sourceMatch.queuedChronicleCardChoice;
    if (queued) {
      viewMatch.queuedChronicleCardChoice = {
        ...queued,
        cardInstanceIds: hiddenIds(queued.cardInstanceIds.length, 'queued-card-choice')
      };
    }
  }
  viewMatch.pendingChoice = redactPrivateChoice(sourceMatch.pendingChoice, localUid);
  return view;
}
