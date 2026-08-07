import { describe, expect, it } from 'vitest';
import { createEvent } from './events';
import { reduceGame } from './reducer';
import { projectSeatView } from './seat-view';

function startedRoom() {
  return reduceGame([
    createEvent('game/created', 'host', 1, { roomCode: 'RIVEN', displayName: 'Mara' }, 1),
    createEvent('player/joined', 'guest-a', 1, { displayName: 'Rin' }, 2),
    createEvent('player/joined', 'guest-b', 1, { displayName: 'Pip' }, 3),
    createEvent('player/commander-selected', 'host', 2, { commanderId: 'aragorn' }, 4),
    createEvent('player/commander-selected', 'guest-a', 2, { commanderId: 'treebeard' }, 5),
    createEvent('player/commander-selected', 'guest-b', 2, { commanderId: 'gandalf' }, 6),
    createEvent('player/ready', 'host', 3, { ready: true }, 7),
    createEvent('player/ready', 'guest-a', 3, { ready: true }, 8),
    createEvent('player/ready', 'guest-b', 3, { ready: true }, 9),
    createEvent('match/started', 'host', 4, { seed: 'seat-safe-secret-seed' }, 10)
  ]);
}

describe('seat-safe presentation projection', () => {
  it('preserves public zones and counts without exposing private identities or deck order', () => {
    const state = startedRoom();
    const original = structuredClone(state);
    const opponent = state.match!.players['guest-a'];
    const local = state.match!.players.host;
    const privateIds = [
      ...opponent.hand,
      ...opponent.drawPile,
      ...opponent.fateHand,
      ...state.match!.fateDeck,
      ...state.match!.chronicleDeck
    ].map((card) => card.id);

    const view = projectSeatView(state, 'host');
    const serialized = JSON.stringify(view);

    expect(view.match!.players.host.hand).toEqual(local.hand);
    expect(view.match!.players.host.fateHand).toEqual(local.fateHand);
    expect(view.match!.players.host.drawPile).toHaveLength(local.drawPile.length);
    expect(view.match!.players.host.drawPile.map((card) => card.definitionId).sort())
      .toEqual(local.drawPile.map((card) => card.definitionId).sort());
    for (const card of local.drawPile) expect(serialized).not.toContain(card.id);
    expect(view.match!.players['guest-a'].hand).toHaveLength(opponent.hand.length);
    expect(view.match!.players['guest-a'].hand.every((card) => card.definitionId === '[hidden]')).toBe(true);
    expect(view.match!.players['guest-a'].drawPile.every((card) => card.definitionId === '[hidden]')).toBe(true);
    expect(view.match!.players['guest-a'].fateHand.every((card) => card.definitionId === '[hidden]')).toBe(true);
    expect(view.match!.chronicleRow).toEqual(state.match!.chronicleRow);
    expect(view.match!.fateDiscard).toEqual(state.match!.fateDiscard);
    expect(view.match!.chronicleDeck).toHaveLength(state.match!.chronicleDeck.length);
    expect(view.match!.fateDeck).toHaveLength(state.match!.fateDeck.length);
    expect(view.match!.seed).toBe('[hidden]');
    expect(serialized).not.toContain('seat-safe-secret-seed');
    for (const privateId of privateIds) expect(serialized).not.toContain(privateId);
    expect(state).toEqual(original);
  });

  it('removes another seat private decision identifiers while preserving option counts', () => {
    const state = startedRoom();
    const opponentCardIds = state.match!.players['guest-a'].hand.slice(0, 2).map((card) => card.id);
    state.match!.pendingChoice = {
      kind: 'plot-discard',
      actorUid: 'guest-a',
      cardInstanceIds: opponentCardIds,
      resumeTurn: 'agent',
      options: opponentCardIds.map((id) => `discard:${id}`)
    };

    const view = projectSeatView(state, 'host');
    expect(view.match!.pendingChoice).toMatchObject({ kind: 'plot-discard', actorUid: 'guest-a' });
    if (view.match!.pendingChoice?.kind !== 'plot-discard') throw new Error('expected plot choice');
    expect(view.match!.pendingChoice.cardInstanceIds).toHaveLength(2);
    expect(view.match!.pendingChoice.options).toHaveLength(2);
    for (const cardId of opponentCardIds) expect(JSON.stringify(view)).not.toContain(cardId);
  });

  it('reveals only the local cards explicitly exposed by a Foresight decision', () => {
    const state = startedRoom();
    const fateIds = state.match!.fateDeck.slice(0, 2).map((fate) => fate.id);
    state.match!.pendingChoice = {
      kind: 'commander-fate-foresight',
      actorUid: 'host',
      fateIds,
      remainingDraws: 1,
      source: 'test',
      resume: { kind: 'finish-agent' },
      options: fateIds.map((id) => `take-fate:${id}`)
    };

    const view = projectSeatView(state, 'host');
    expect(view.match!.fateDeck.filter((fate) => fate.definitionId !== '[hidden]').map((fate) => fate.id))
      .toEqual(fateIds);
    const projectedFateIds = view.match!.fateDeck.map((fate) => fate.id);
    for (const hidden of state.match!.fateDeck.slice(2)) expect(projectedFateIds).not.toContain(hidden.id);
  });
});
