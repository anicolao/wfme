import { describe, expect, it } from 'vitest';
import { createEvent } from './events';
import { currentPlayerUid, legalAgentSpaces, reduceGame } from './reducer';

function readyRoom(seed = 'road-2') {
  const events = [
    createEvent('game/created', 'host', 1, { roomCode: 'RIVEN', displayName: 'Mara' }, 1),
    createEvent('player/joined', 'guest-a', 1, { displayName: 'Rin' }, 2),
    createEvent('player/joined', 'guest-b', 1, { displayName: 'Pip' }, 3),
    createEvent('player/commander-selected', 'host', 2, { commanderId: 'aragorn' }, 4),
    createEvent('player/commander-selected', 'guest-a', 2, { commanderId: 'galadriel' }, 5),
    createEvent('player/commander-selected', 'guest-b', 2, { commanderId: 'gandalf' }, 6),
    createEvent('player/ready', 'host', 3, { ready: true }, 7),
    createEvent('player/ready', 'guest-a', 3, { ready: true }, 8),
    createEvent('player/ready', 'guest-b', 3, { ready: true }, 9),
    createEvent('match/started', 'host', 4, { seed }, 10)
  ];
  return events;
}

function completedAgentRound() {
  const setup = readyRoom();
  const started = reduceGame(setup);
  const [roadActor, dwarfActor, shadowActor] = started.match!.playerOrder;
  const road = started.match!.players[roadActor].hand.find((card) => card.definitionId === 'the-open-road')!;
  const roadEvent = createEvent('agent/placed', roadActor, 5, { cardInstanceId: road.id, spaceId: 'take-war-effort' }, 11);
  const afterRoad = reduceGame([...setup, roadEvent]);
  const dwarf = afterRoad.match!.players[dwarfActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
  const dwarfEvent = createEvent('agent/placed', dwarfActor, 5, { cardInstanceId: dwarf.id, spaceId: 'dwarven-caravans' }, 12);
  const afterDwarf = reduceGame([...setup, roadEvent, dwarfEvent]);
  const shadow = afterDwarf.match!.players[shadowActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
  const shadowEvent = createEvent('agent/placed', shadowActor, 5, { cardInstanceId: shadow.id, spaceId: 'tribute-shadow' }, 13);
  const beforeMuster = reduceGame([...setup, roadEvent, dwarfEvent, shadowEvent]);
  const escort = beforeMuster.match!.players[roadActor].hand.find((card) => card.definitionId === 'armed-escort')!;
  return {
    order: { roadActor, dwarfActor, shadowActor },
    events: [
      ...setup, roadEvent, dwarfEvent, shadowEvent,
      createEvent('agent/placed', roadActor, 6, { cardInstanceId: escort.id, spaceId: 'muster-free-peoples' }, 14),
      createEvent('choice/resolved', roadActor, 7, { choice: 'pay-2-gold' }, 15)
    ]
  };
}

describe('integrated Agent placement replay', () => {
  it('creates a deterministic three-player match with conserved starting cards', () => {
    const first = reduceGame(readyRoom());
    const second = reduceGame(readyRoom());
    expect(first).toEqual(second);
    expect(first.phase).toBe('playing');
    expect(first.match?.playerOrder).toHaveLength(3);
    for (const player of Object.values(first.match?.players ?? {})) {
      expect(player.resources.provisions).toBe(1);
      expect(player.hand).toHaveLength(5);
      expect(player.drawPile).toHaveLength(5);
      expect(new Set([...player.hand, ...player.drawPile].map((card) => card.id)).size).toBe(10);
    }
  });

  it('resolves Diplomatic Mission at Dwarven Caravans and advances the real turn', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actorUid = before.match!.playerOrder[0];
    const card = before.match!.players[actorUid].hand.find((candidate) => candidate.definitionId === 'diplomatic-mission');
    expect(card, 'the committed tracer seed must put Diplomatic Mission in the first hand').toBeDefined();
    expect(legalAgentSpaces(before, actorUid, card!.id)).toEqual(['dwarven-caravans', 'tribute-shadow']);

    const after = reduceGame([
      ...events,
      createEvent('agent/placed', actorUid, 5, { cardInstanceId: card!.id, spaceId: 'dwarven-caravans' }, 11)
    ]);
    expect(after.diagnostics).toEqual([]);
    expect(after.match!.boardAgents['dwarven-caravans'].uid).toBe(actorUid);
    expect(after.match!.players[actorUid].resources.provisions).toBe(2);
    expect(after.match!.players[actorUid].standing.dwarven).toBe(1);
    expect(after.match!.players[actorUid].journey).toContainEqual(card);
    expect(after.match!.playerOrder[after.match!.currentPlayerIndex]).not.toBe(actorUid);
  });

  it('rejects an occupied placement without partial mutation', () => {
    const events = readyRoom();
    const started = reduceGame(events);
    const actorUid = started.match!.playerOrder[0];
    const card = started.match!.players[actorUid].hand.find((candidate) => candidate.definitionId === 'diplomatic-mission')!;
    const legal = createEvent('agent/placed', actorUid, 5, { cardInstanceId: card.id, spaceId: 'dwarven-caravans' }, 11);
    const next = started.match!.playerOrder[1];
    const rejected = createEvent('agent/placed', next, 5, { cardInstanceId: 'not-in-hand', spaceId: 'dwarven-caravans' }, 12);
    const state = reduceGame([...events, legal, rejected]);
    expect(state.diagnostics.at(-1)).toContain('illegal Agent placement');
    expect(state.match!.players[next].resources.provisions).toBe(1);
    expect(Object.keys(state.match!.boardAgents)).toEqual(['dwarven-caravans']);
  });

  it('resolves Tribute to the Shadow for the next human and reuses placement legality', () => {
    const events = readyRoom();
    const started = reduceGame(events);
    const first = started.match!.playerOrder[0];
    const firstCard = started.match!.players[first].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const firstPlacement = createEvent('agent/placed', first, 5, {
      cardInstanceId: firstCard.id,
      spaceId: 'dwarven-caravans'
    }, 11);
    const afterFirst = reduceGame([...events, firstPlacement]);
    const actor = afterFirst.match!.playerOrder[1];
    const mission = afterFirst.match!.players[actor].hand.find((card) => card.definitionId === 'diplomatic-mission');
    expect(mission, 'the committed seed must put Diplomatic Mission in the next hand').toBeDefined();
    expect(legalAgentSpaces(afterFirst, actor, mission!.id)).toEqual(['tribute-shadow']);

    const afterTribute = reduceGame([
      ...events,
      firstPlacement,
      createEvent('agent/placed', actor, 5, {
        cardInstanceId: mission!.id,
        spaceId: 'tribute-shadow'
      }, 12)
    ]);
    expect(afterTribute.diagnostics).toEqual([]);
    expect(afterTribute.match!.players[actor].resources.gold).toBe(2);
    expect(afterTribute.match!.players[actor].standing.shadow).toBe(1);
    expect(afterTribute.match!.boardAgents['tribute-shadow'].uid).toBe(actor);
    expect(afterTribute.match!.playerOrder[afterTribute.match!.currentPlayerIndex]).not.toBe(actor);
  });

  it('draws a private card and applies the disabled-module reward at Take Up a War Effort', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actor = before.match!.playerOrder[0];
    const road = before.match!.players[actor].hand.find((card) => card.definitionId === 'the-open-road')!;
    const drawn = before.match!.players[actor].drawPile[0];
    expect(legalAgentSpaces(before, actor, road.id)).toEqual(['take-war-effort']);

    const after = reduceGame([...events, createEvent('agent/placed', actor, 5, {
      cardInstanceId: road.id,
      spaceId: 'take-war-effort'
    }, 11)]);
    expect(after.diagnostics).toEqual([]);
    expect(after.match!.players[actor].resources.gold).toBe(2);
    expect(after.match!.players[actor].hand).toContainEqual(drawn);
    expect(after.match!.players[actor].hand).toHaveLength(5);
    expect(after.match!.players[actor].drawPile).toHaveLength(4);
    expect(after.match!.boardAgents['take-war-effort'].uid).toBe(actor);
  });

  it('orders Armed Escort recruitment before the optional Muster payment', () => {
    const events = readyRoom();
    const started = reduceGame(events);
    const [roadActor, dwarfActor, shadowActor] = started.match!.playerOrder;
    const road = started.match!.players[roadActor].hand.find((card) => card.definitionId === 'the-open-road')!;
    const afterRoadEvent = createEvent('agent/placed', roadActor, 5, { cardInstanceId: road.id, spaceId: 'take-war-effort' }, 11);
    const afterRoad = reduceGame([...events, afterRoadEvent]);
    const dwarf = afterRoad.match!.players[dwarfActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const dwarfEvent = createEvent('agent/placed', dwarfActor, 5, { cardInstanceId: dwarf.id, spaceId: 'dwarven-caravans' }, 12);
    const afterDwarf = reduceGame([...events, afterRoadEvent, dwarfEvent]);
    const shadow = afterDwarf.match!.players[shadowActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const shadowEvent = createEvent('agent/placed', shadowActor, 5, { cardInstanceId: shadow.id, spaceId: 'tribute-shadow' }, 13);
    const beforeMuster = reduceGame([...events, afterRoadEvent, dwarfEvent, shadowEvent]);
    const escort = beforeMuster.match!.players[roadActor].hand.find((card) => card.definitionId === 'armed-escort')!;
    expect(legalAgentSpaces(beforeMuster, roadActor, escort.id)).toEqual(['muster-free-peoples']);

    const musterEvent = createEvent('agent/placed', roadActor, 6, { cardInstanceId: escort.id, spaceId: 'muster-free-peoples' }, 14);
    const pending = reduceGame([...events, afterRoadEvent, dwarfEvent, shadowEvent, musterEvent]);
    expect(pending.diagnostics).toEqual([]);
    expect(pending.match!.players[roadActor].companies).toEqual({ supply: 6, garrison: 6 });
    expect(pending.match!.players[roadActor].resources).toEqual({ gold: 2, mithril: 0, provisions: 1 });
    expect(pending.match!.pendingChoice).toEqual({
      kind: 'muster-free-peoples', actorUid: roadActor, options: ['pay-2-gold', 'decline']
    });
    expect(currentPlayerUid(pending)).toBe(roadActor);
    expect(legalAgentSpaces(pending, roadActor, escort.id)).toEqual([]);

    const resolved = reduceGame([
      ...events, afterRoadEvent, dwarfEvent, shadowEvent, musterEvent,
      createEvent('choice/resolved', roadActor, 7, { choice: 'pay-2-gold' }, 15)
    ]);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.players[roadActor].resources).toEqual({ gold: 0, mithril: 0, provisions: 2 });
    expect(resolved.match!.pendingChoice).toBeNull();
    expect(currentPlayerUid(resolved)).not.toBe(roadActor);
  });

  it('rejects another player resolving a pending Council choice without mutation', () => {
    const events = readyRoom();
    const state = reduceGame(events);
    const actor = state.match!.playerOrder[0];
    const rejected = reduceGame([...events, createEvent('choice/resolved', state.match!.playerOrder[1], 5, { choice: 'pay-2-gold' }, 11)]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.players[actor].resources.gold).toBe(0);
  });

  it('Reveals, acquires from the Reserve, Recalls, and deterministically reshuffles', () => {
    const completed = completedAgentRound();
    const { roadActor, dwarfActor, shadowActor } = completed.order;
    const dwarfReveal = createEvent('turn/revealed', dwarfActor, 6, {}, 16);
    const revealed = reduceGame([...completed.events, dwarfReveal]);
    expect(revealed.match!.turnMode).toBe('reveal');
    expect(revealed.match!.players[dwarfActor].hand).toEqual([]);
    expect(revealed.match!.players[dwarfActor].muster).toHaveLength(4);
    expect(revealed.match!.players[dwarfActor].revealInfluence).toBe(4);
    expect(revealed.match!.players[dwarfActor].revealedSwords).toBe(1);

    const acquire = createEvent('card/acquired', dwarfActor, 7, { definitionId: 'muster-host' }, 17);
    const acquired = reduceGame([...completed.events, dwarfReveal, acquire]);
    expect(acquired.match!.reserveSupply['muster-host']).toBe(7);
    expect(acquired.match!.players[dwarfActor].revealInfluence).toBe(2);
    expect(acquired.match!.players[dwarfActor].discardPile).toContainEqual({
      id: 'reserve:muster-host:1', definitionId: 'muster-host'
    });

    const firstFinish = createEvent('reveal/finished', dwarfActor, 8, {}, 18);
    const shadowReveal = createEvent('turn/revealed', shadowActor, 6, {}, 19);
    const shadowFinish = createEvent('reveal/finished', shadowActor, 7, {}, 20);
    const roadReveal = createEvent('turn/revealed', roadActor, 8, {}, 21);
    const roadFinish = createEvent('reveal/finished', roadActor, 9, {}, 22);
    const roundTwoEvents = [...completed.events, dwarfReveal, acquire, firstFinish, shadowReveal, shadowFinish, roadReveal, roadFinish];
    const roundTwo = reduceGame(roundTwoEvents);
    expect(roundTwo.diagnostics).toEqual([]);
    expect(roundTwo.match!.round).toBe(2);
    expect(roundTwo.match!.boardAgents).toEqual({});
    expect(currentPlayerUid(roundTwo)).toBe(dwarfActor);
    for (const player of Object.values(roundTwo.match!.players)) {
      expect(player.availableAgents).toBe(2);
      expect(player.hand).toHaveLength(5);
      expect(player.revealedThisRound).toBe(false);
    }

    const roundThreeEvents = [...roundTwoEvents];
    const sequences: Record<string, number> = { [roadActor]: 9, [dwarfActor]: 8, [shadowActor]: 7 };
    let timestamp = 23;
    for (const actorUid of [dwarfActor, shadowActor, roadActor]) {
      sequences[actorUid] += 1;
      roundThreeEvents.push(createEvent('turn/revealed', actorUid, sequences[actorUid], {}, timestamp++));
      sequences[actorUid] += 1;
      roundThreeEvents.push(createEvent('reveal/finished', actorUid, sequences[actorUid], {}, timestamp++));
    }
    const roundThree = reduceGame(roundThreeEvents);
    expect(roundThree.diagnostics).toEqual([]);
    expect(roundThree.match!.round).toBe(3);
    const dwarfCards = [
      ...roundThree.match!.players[dwarfActor].hand,
      ...roundThree.match!.players[dwarfActor].drawPile,
      ...roundThree.match!.players[dwarfActor].discardPile
    ];
    expect(dwarfCards).toHaveLength(11);
    expect(dwarfCards.filter((card) => card.definitionId === 'muster-host')).toHaveLength(1);
    expect(new Set(dwarfCards.map((card) => card.id)).size).toBe(11);
    expect(roundThree.match!.players[dwarfActor].hand.some((card) => card.definitionId === 'muster-host')).toBe(true);
  });

  it('rejects unavailable Reserve definitions without mutating the player', () => {
    const completed = completedAgentRound();
    const actor = completed.order.dwarfActor;
    const state = reduceGame([
      ...completed.events,
      createEvent('turn/revealed', actor, 6, {}, 16),
      createEvent('card/acquired', actor, 7, { definitionId: 'deed-worthy-song' }, 17)
    ]);
    expect(state.diagnostics.at(-1)).toContain('illegal acquisition');
    expect(state.match!.reserveSupply['muster-host']).toBe(8);
    expect(state.match!.players[actor].renown).toBe(0);
  });
});
