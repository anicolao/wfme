import { describe, expect, it } from 'vitest';
import { createEvent } from './events';
import { OBSERVATION_POSTS } from './manifest';
import { battleStrength, currentPlayerUid, legalAgentSpaces, reduceGame } from './reducer';

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
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'sudden-charge')).toHaveLength(2);
    const rejectedFate = reduceGame([...readyRoom(), createEvent('fate/played', currentPlayerUid(first)!, 5, { cardInstanceId: 'fate:1' }, 11)]);
    expect(rejectedFate.diagnostics.at(-1)).toContain('illegal Fate play');
    expect(rejectedFate.match!.fateDiscard).toEqual([]);
  });

  it('resolves Diplomatic Mission at Dwarven Caravans and advances the real turn', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actorUid = before.match!.playerOrder[0];
    const card = before.match!.players[actorUid].hand.find((candidate) => candidate.definitionId === 'diplomatic-mission');
    expect(card, 'the committed tracer seed must put Diplomatic Mission in the first hand').toBeDefined();
    expect(legalAgentSpaces(before, actorUid, card!.id)).toEqual([
      'dwarven-caravans', 'tribute-shadow', 'hidden-counsel', 'hidden-paths', 'ranger-mustering'
    ]);

    const after = reduceGame([
      ...events,
      createEvent('agent/placed', actorUid, 5, { cardInstanceId: card!.id, spaceId: 'dwarven-caravans' }, 11)
    ]);
    expect(after.diagnostics).toEqual([]);
    expect(after.match!.boardAgents['dwarven-caravans'][0].uid).toBe(actorUid);
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
    expect(legalAgentSpaces(afterFirst, actor, mission!.id)).toEqual([
      'tribute-shadow', 'hidden-counsel', 'hidden-paths', 'ranger-mustering'
    ]);

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
    expect(afterTribute.match!.boardAgents['tribute-shadow'][0].uid).toBe(actor);
    expect(afterTribute.match!.playerOrder[afterTribute.match!.currentPlayerIndex]).not.toBe(actor);
  });

  it('resolves Hidden Counsel with a private physical Fate draw', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actor = before.match!.playerOrder[0];
    const mission = before.match!.players[actor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const expectedFate = before.match!.fateDeck[0];
    const after = reduceGame([...events, createEvent('agent/placed', actor, 5, {
      cardInstanceId: mission.id, spaceId: 'hidden-counsel'
    }, 11)]);

    expect(after.diagnostics).toEqual([]);
    expect(after.match!.players[actor].standing.elven).toBe(1);
    expect(after.match!.players[actor].fateHand).toEqual([expectedFate]);
    expect(after.match!.fateDeck).toHaveLength(29);
    expect(after.match!.fateDiscard).toEqual([]);
    expect(after.match!.activity.at(-1)).toContain('receiving 0 Fate from opponents');
  });

  it('resolves Elven favor as an ordered keep-one choice and conserves every Fate instance', () => {
    const stream = readyRoom('elven-favor');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const target = reduceGame(stream).match!.playerOrder[0];

    for (let step = 0; step < 500; step += 1) {
      const state = reduceGame(stream);
      if (state.match!.players[target].standing.elven >= 4) break;
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
        sequences[current] += 1;
        stream.push(createEvent(type, current, sequences[current], payload, timestamp++));
      };
      if (match.pendingChoice?.kind === 'seek-allies') append('choice/resolved', { choice: 'keep-card' });
      else if (match.turnMode === 'reveal') append('reveal/finished', {});
      else {
        const factionCard = current === target
          ? player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies')
          : undefined;
        if (factionCard && !match.boardAgents['hidden-counsel'] && player.availableAgents > 0) {
          append('agent/placed', { cardInstanceId: factionCard.id, spaceId: 'hidden-counsel' });
        } else append('turn/revealed', {});
      }
    }

    const pending = reduceGame(stream);
    expect(pending.diagnostics).toEqual([]);
    expect(pending.match!.players[target].standing.elven).toBe(4);
    expect(pending.match!.players[target].renown).toBe(2);
    expect(pending.match!.alliances.elven).toBe(target);
    expect(pending.match!.pendingChoice?.kind).toBe('elven-favor');
    if (pending.match!.pendingChoice?.kind !== 'elven-favor') throw new Error('Elven favor must be pending');
    const chosen = pending.match!.pendingChoice.options[0];
    sequences[target] += 1;
    stream.push(createEvent('choice/resolved', target, sequences[target], { choice: chosen }, timestamp));
    const resolved = reduceGame(stream);
    const allFate = [
      ...resolved.match!.fateDeck,
      ...resolved.match!.fateDiscard,
      ...Object.values(resolved.match!.players).flatMap((player) => player.fateHand)
    ];
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.fateDiscard).toHaveLength(1);
    expect(new Set(allFate.map((fate) => fate.id)).size).toBe(30);
    expect(allFate).toHaveLength(30);
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
    expect(after.match!.boardAgents['take-war-effort'][0].uid).toBe(actor);
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
    expect(legalAgentSpaces(beforeMuster, roadActor, escort.id)).toEqual(['hall-fire', 'muster-free-peoples', 'minas-tirith']);

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

    for (const actorUid of [shadowActor, roadActor]) {
      sequences[actorUid] += 1;
      roundThreeEvents.push(createEvent('turn/revealed', actorUid, sequences[actorUid], {}, timestamp++));
      sequences[actorUid] += 1;
      roundThreeEvents.push(createEvent('reveal/finished', actorUid, sequences[actorUid], {}, timestamp++));
    }
    let extended = reduceGame(roundThreeEvents);
    const acquiredCard = extended.match!.players[dwarfActor].hand.find((card) => card.definitionId === 'muster-host')!;
    sequences[dwarfActor] += 1;
    roundThreeEvents.push(createEvent('agent/placed', dwarfActor, sequences[dwarfActor], {
      cardInstanceId: acquiredCard.id, spaceId: 'take-war-effort'
    }, timestamp++));
    sequences[dwarfActor] += 1;
    roundThreeEvents.push(createEvent('turn/revealed', dwarfActor, sequences[dwarfActor], {}, timestamp++));
    sequences[dwarfActor] += 1;
    roundThreeEvents.push(createEvent('reveal/finished', dwarfActor, sequences[dwarfActor], {}, timestamp++));
    sequences[roadActor] += 1;
    roundThreeEvents.push(createEvent('turn/revealed', roadActor, sequences[roadActor], {}, timestamp++));
    sequences[roadActor] += 1;
    roundThreeEvents.push(createEvent('reveal/finished', roadActor, sequences[roadActor], {}, timestamp++));
    extended = reduceGame(roundThreeEvents);
    const secondMission = extended.match!.players[dwarfActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    sequences[dwarfActor] += 1;
    const respected = reduceGame([...roundThreeEvents, createEvent('agent/placed', dwarfActor, sequences[dwarfActor], {
      cardInstanceId: secondMission.id, spaceId: 'dwarven-caravans'
    }, timestamp)]);
    expect(respected.diagnostics).toEqual([]);
    expect(respected.match!.players[dwarfActor].standing.dwarven).toBe(2);
    expect(respected.match!.players[dwarfActor].renown).toBe(1);
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

  it('resolves the Seek Allies self-trash only after its faction space', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actor = before.match!.playerOrder[0];
    const seek = before.match!.players[actor].hand.find((card) => card.definitionId === 'seek-allies')!;
    const placed = createEvent('agent/placed', actor, 5, { cardInstanceId: seek.id, spaceId: 'tribute-shadow' }, 11);
    const pending = reduceGame([...events, placed]);
    expect(pending.match!.players[actor].resources.gold).toBe(2);
    expect(pending.match!.players[actor].standing.shadow).toBe(1);
    expect(pending.match!.pendingChoice).toEqual({
      kind: 'seek-allies', actorUid: actor, cardInstanceId: seek.id, options: ['trash-self', 'keep-card']
    });
    expect(currentPlayerUid(pending)).toBe(actor);

    const trashed = reduceGame([...events, placed, createEvent('choice/resolved', actor, 6, { choice: 'trash-self' }, 12)]);
    expect(trashed.diagnostics).toEqual([]);
    expect(trashed.match!.players[actor].trashPile).toEqual([seek]);
    expect(trashed.match!.players[actor].journey).toEqual([]);
    expect(currentPlayerUid(trashed)).not.toBe(actor);
  });

  it('can keep Seek Allies in the Journey and rejects an unrelated choice option', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actor = before.match!.playerOrder[0];
    const seek = before.match!.players[actor].hand.find((card) => card.definitionId === 'seek-allies')!;
    const placed = createEvent('agent/placed', actor, 5, { cardInstanceId: seek.id, spaceId: 'dwarven-caravans' }, 11);
    const rejected = reduceGame([...events, placed, createEvent('choice/resolved', actor, 6, { choice: 'pay-2-gold' }, 12)]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.pendingChoice?.kind).toBe('seek-allies');
    const kept = reduceGame([...events, placed, createEvent('choice/resolved', actor, 6, { choice: 'keep-card' }, 12)]);
    expect(kept.diagnostics).toEqual([]);
    expect(kept.match!.players[actor].journey).toEqual([seek]);
    expect(kept.match!.players[actor].trashPile).toEqual([]);
  });

  it('places a Reconnaissance Scout on one reviewed empty observation post', () => {
    let events = readyRoom('scout-0');
    let before = reduceGame(events);
    for (let index = 1; index < 100; index += 1) {
      const actor = before.match!.playerOrder[0];
      if (before.match!.players[actor].hand.some((card) => card.definitionId === 'reconnaissance')) break;
      events = readyRoom(`scout-${index}`);
      before = reduceGame(events);
    }
    const actor = before.match!.playerOrder[0];
    const reconnaissance = before.match!.players[actor].hand.find((card) => card.definitionId === 'reconnaissance')!;
    expect(reconnaissance).toBeDefined();
    const placement = createEvent('agent/placed', actor, 5, {
      cardInstanceId: reconnaissance.id, spaceId: 'take-war-effort'
    }, 11);
    const pending = reduceGame([...events, placement]);
    expect(pending.match!.pendingChoice).toEqual({ kind: 'place-scout', actorUid: actor, followupSeekAlliesCardId: null, options: [] });
    expect(pending.match!.players[actor].scouts.supply).toBe(3);
    expect(currentPlayerUid(pending)).toBe(actor);

    const illegal = reduceGame([...events, placement, createEvent('scout/placed', actor, 6, { postId: 'not-a-post' }, 12)]);
    expect(illegal.diagnostics.at(-1)).toContain('illegal Scout placement');
    expect(illegal.match!.boardScouts).toEqual({});

    const placed = reduceGame([...events, placement, createEvent('scout/placed', actor, 6, { postId: 'old-south-road' }, 12)]);
    expect(placed.diagnostics).toEqual([]);
    expect(placed.match!.boardScouts).toEqual({ 'old-south-road': actor });
    expect(placed.match!.players[actor].scouts.supply).toBe(2);
    expect(placed.match!.pendingChoice).toBeNull();
    expect(currentPlayerUid(placed)).not.toBe(actor);
  });

  it('gathers intelligence before resolving the connected board and Journey effects', () => {
    let events = readyRoom('intelligence-0');
    let started = reduceGame(events);
    for (let index = 1; index < 100; index += 1) {
      const actor = started.match!.playerOrder[0];
      const hand = started.match!.players[actor].hand;
      if (
        hand.some((card) => card.definitionId === 'reconnaissance') &&
        hand.some((card) => card.definitionId === 'diplomatic-mission')
      ) break;
      events = readyRoom(`intelligence-${index}`);
      started = reduceGame(events);
    }
    const [actor, second, third] = started.match!.playerOrder;
    const reconnaissance = started.match!.players[actor].hand.find((card) => card.definitionId === 'reconnaissance')!;
    const mission = started.match!.players[actor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    expect(reconnaissance).toBeDefined();
    expect(mission).toBeDefined();
    const setup = [
      ...events,
      createEvent('agent/placed', actor, 5, { cardInstanceId: reconnaissance.id, spaceId: 'take-war-effort' }, 11),
      createEvent('scout/placed', actor, 6, { postId: 'redhorn-pass' }, 12),
      createEvent('turn/revealed', second, 4, {}, 13),
      createEvent('reveal/finished', second, 5, {}, 14),
      createEvent('turn/revealed', third, 4, {}, 15),
      createEvent('reveal/finished', third, 5, {}, 16)
    ];
    const beforeGather = reduceGame(setup);
    const intelligenceCard = beforeGather.match!.players[actor].hand.find((card) => card.id === mission.id)!;
    const nextDraw = beforeGather.match!.players[actor].drawPile[0];
    const placement = createEvent('agent/placed', actor, 7, {
      cardInstanceId: intelligenceCard.id, spaceId: 'dwarven-caravans'
    }, 17);
    const pending = reduceGame([...setup, placement]);
    expect(pending.diagnostics).toEqual([]);
    expect(pending.match!.pendingChoice).toEqual({
      kind: 'gather-intelligence',
      actorUid: actor,
      cardInstanceId: intelligenceCard.id,
      spaceId: 'dwarven-caravans',
      postIds: ['redhorn-pass'],
      options: ['recall:redhorn-pass', 'decline-intelligence']
    });
    expect(pending.match!.boardAgents['dwarven-caravans'][0].uid).toBe(actor);
    expect(pending.match!.players[actor].resources.provisions).toBe(1);
    expect(pending.match!.players[actor].standing.dwarven).toBe(0);

    const gathered = reduceGame([
      ...setup,
      placement,
      createEvent('choice/resolved', actor, 8, { choice: 'recall:redhorn-pass' }, 18)
    ]);
    expect(gathered.diagnostics).toEqual([]);
    expect(gathered.match!.boardScouts['redhorn-pass']).toBeUndefined();
    expect(gathered.match!.players[actor].scouts.supply).toBe(3);
    expect(gathered.match!.players[actor].hand).toContainEqual(nextDraw);
    expect(gathered.match!.players[actor].resources.provisions).toBe(2);
    expect(gathered.match!.players[actor].standing.dwarven).toBe(1);
    expect(gathered.match!.pendingChoice).toBeNull();

    const declined = reduceGame([
      ...setup,
      placement,
      createEvent('choice/resolved', actor, 8, { choice: 'decline-intelligence' }, 18)
    ]);
    expect(declined.diagnostics).toEqual([]);
    expect(declined.match!.boardScouts['redhorn-pass']).toBe(actor);
    expect(declined.match!.players[actor].scouts.supply).toBe(2);
    expect(declined.match!.players[actor].hand).not.toContainEqual(nextDraw);
    expect(declined.match!.players[actor].resources.provisions).toBe(2);
  });

  it('recalls a connected Scout to infiltrate without replacing the blocking Agent', () => {
    const events = readyRoom('infiltration-20');
    const started = reduceGame(events);
    const [actor, blocker, third] = started.match!.playerOrder;
    const reconnaissance = started.match!.players[actor].hand.find((card) => card.definitionId === 'reconnaissance')!;
    const blockerMission = started.match!.players[blocker].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const setup = [
      ...events,
      createEvent('agent/placed', actor, 5, { cardInstanceId: reconnaissance.id, spaceId: 'take-war-effort' }, 11),
      createEvent('scout/placed', actor, 6, { postId: 'redhorn-pass' }, 12),
      createEvent('agent/placed', blocker, 5, { cardInstanceId: blockerMission.id, spaceId: 'dwarven-caravans' }, 13),
      createEvent('turn/revealed', third, 4, {}, 14),
      createEvent('reveal/finished', third, 5, {}, 15)
    ];
    const before = reduceGame(setup);
    const infiltratingMission = before.match!.players[actor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    expect(infiltratingMission).toBeDefined();
    expect(legalAgentSpaces(before, actor, infiltratingMission.id)).toContain('dwarven-caravans');

    const missingScoutIntent = reduceGame([
      ...setup,
      createEvent('agent/placed', actor, 7, {
        cardInstanceId: infiltratingMission.id, spaceId: 'dwarven-caravans'
      }, 16)
    ]);
    expect(missingScoutIntent.diagnostics.at(-1)).toContain('illegal Agent infiltration');
    expect(missingScoutIntent.match!.boardAgents['dwarven-caravans']).toEqual([{ uid: blocker, agentNumber: 1 }]);
    expect(missingScoutIntent.match!.boardScouts['redhorn-pass']).toBe(actor);

    const infiltrated = reduceGame([
      ...setup,
      createEvent('agent/placed', actor, 7, {
        cardInstanceId: infiltratingMission.id,
        spaceId: 'dwarven-caravans',
        infiltrationPostId: 'redhorn-pass'
      }, 16)
    ]);
    expect(infiltrated.diagnostics).toEqual([]);
    expect(infiltrated.match!.boardAgents['dwarven-caravans']).toEqual([
      { uid: blocker, agentNumber: 1 },
      { uid: actor, agentNumber: 2 }
    ]);
    expect(infiltrated.match!.boardScouts['redhorn-pass']).toBeUndefined();
    expect(infiltrated.match!.players[actor].scouts.supply).toBe(3);
    expect(infiltrated.match!.players[actor].resources.provisions).toBe(2);
    expect(infiltrated.match!.players[actor].standing.dwarven).toBe(1);
  });

  it('awards the Dwarven favor and transfers its Alliance only for a strict standing lead', () => {
    const stream = readyRoom('alliance-transfer');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const started = reduceGame(stream);
    const claimant = started.match!.playerOrder[0];
    const challenger = started.match!.playerOrder[1];

    const advanceUntilStanding = (target: string, standing: number) => {
      for (let step = 0; step < 500; step += 1) {
        const state = reduceGame(stream);
        if (state.match!.players[target].standing.dwarven >= standing) return state;
        const current = currentPlayerUid(state)!;
        const match = state.match!;
        const player = match.players[current];
        const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
          sequences[current] += 1;
          stream.push(createEvent(type, current, sequences[current], payload, timestamp++));
        };
        if (match.pendingChoice?.kind === 'seek-allies') {
          append('choice/resolved', { choice: 'keep-card' });
        } else if (match.turnMode === 'reveal') {
          append('reveal/finished', {});
        } else {
          const factionCard = current === target
            ? player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies')
            : undefined;
          if (factionCard && !match.boardAgents['dwarven-caravans'] && player.availableAgents > 0) {
            append('agent/placed', { cardInstanceId: factionCard.id, spaceId: 'dwarven-caravans' });
          } else {
            append('turn/revealed', {});
          }
        }
      }
      throw new Error(`standing ${standing} was not reached`);
    };

    const claimed = advanceUntilStanding(claimant, 4);
    expect(claimed.diagnostics).toEqual([]);
    expect(claimed.match!.alliances.dwarven).toBe(claimant);
    expect(claimed.match!.players[claimant].resources.provisions).toBe(7);
    expect(claimed.match!.players[claimant].renown).toBe(2);

    const tied = advanceUntilStanding(challenger, 4);
    expect(tied.match!.alliances.dwarven).toBe(claimant);
    expect(tied.match!.players[claimant].renown).toBe(2);
    expect(tied.match!.players[challenger].renown).toBe(1);

    const transferred = advanceUntilStanding(challenger, 5);
    expect(transferred.diagnostics).toEqual([]);
    expect(transferred.match!.alliances.dwarven).toBe(challenger);
    expect(transferred.match!.players[claimant].renown).toBe(1);
    expect(transferred.match!.players[challenger].renown).toBe(2);
  });

  it('pays for a Council seat, adds Reveal Influence, and resolves a repeat Fate visit', () => {
    const stream = readyRoom('council-economy');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const target = reduceGame(stream).match!.playerOrder[0];
    const append = (state: ReturnType<typeof reduceGame>, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const current = currentPlayerUid(state)!;
      sequences[current] += 1;
      stream.push(createEvent(type, current, sequences[current], payload, timestamp++));
    };
    const advance = (repeat: boolean) => {
      for (let step = 0; step < 800; step += 1) {
        const state = reduceGame(stream);
        const targetPlayer = state.match!.players[target];
        if (targetPlayer.councilSeat && (!repeat || targetPlayer.fateHand.length === 1)) return state;
        const current = currentPlayerUid(state)!;
        const match = state.match!;
        const player = match.players[current];
        if (match.pendingChoice?.kind === 'seek-allies') {
          append(state, 'choice/resolved', { choice: 'keep-card' });
        } else if (match.turnMode === 'reveal') {
          append(state, 'reveal/finished', {});
        } else if (current !== target) {
          append(state, 'turn/revealed', {});
        } else {
          const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
          const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
          const factionCard = player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies');
          if (councilCard && player.resources.gold >= 5 && !match.boardAgents['white-council-seat'] && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'white-council-seat' });
          } else if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
          } else if (factionCard && !match.boardAgents['tribute-shadow'] && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: factionCard.id, spaceId: 'tribute-shadow' });
          } else {
            append(state, 'turn/revealed', {});
          }
        }
      }
      const failed = reduceGame(stream);
      throw new Error(`Council visit was not reached: round ${failed.match!.round}, gold ${failed.match!.players[target].resources.gold}, diagnostics ${failed.diagnostics.at(-1) ?? 'none'}`);
    };

    const seated = advance(false);
    expect(seated.diagnostics).toEqual([]);
    expect(seated.match!.players[target].councilSeat).toBe(true);
    expect(seated.match!.players[target].fateHand).toEqual([]);

    for (let step = 0; step < 30; step += 1) {
      const state = reduceGame(stream);
      if (currentPlayerUid(state) === target && state.match!.turnMode === 'agent' && !state.match!.pendingChoice) {
        const player = state.match!.players[target];
        const expected = player.hand.reduce((total, card) => total + (
          // The catalog lookup is intentionally mirrored by the public total assertion below.
          card.definitionId === 'rallying-words' ? 2 : card.definitionId === 'armed-escort' ? 0 : 1
        ), 0) + 2;
        append(state, 'turn/revealed', {});
        const revealed = reduceGame(stream);
        expect(revealed.match!.players[target].revealInfluence).toBe(expected);
        append(revealed, 'reveal/finished', {});
        break;
      }
      if (state.match!.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else append(state, 'turn/revealed', {});
    }

    const repeated = advance(true);
    expect(repeated.diagnostics).toEqual([]);
    expect(repeated.match!.players[target].resources.mithril).toBe(2);
    expect(repeated.match!.players[target].fateHand).toHaveLength(1);
    expect(repeated.match!.fateDeck).toHaveLength(29);

    let beforeMirror: ReturnType<typeof reduceGame> | null = null;
    let mirrorCardId = '';
    let beforeMirrorHandSize = 0;
    for (let step = 0; step < 100; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const player = state.match!.players[current];
      if (state.match!.pendingChoice?.kind === 'seek-allies') {
        append(state, 'choice/resolved', { choice: 'keep-card' });
      } else if (state.match!.turnMode === 'reveal') {
        append(state, 'reveal/finished', {});
      } else if (current === target) {
        const factionCard = player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies');
        if (factionCard && player.availableAgents > 0 && !state.match!.boardAgents['mirror-galadriel']) {
          beforeMirror = state;
          mirrorCardId = factionCard.id;
          beforeMirrorHandSize = player.hand.length;
          append(state, 'agent/placed', { cardInstanceId: factionCard.id, spaceId: 'mirror-galadriel' });
          break;
        }
        append(state, 'turn/revealed', {});
      } else append(state, 'turn/revealed', {});
    }
    expect(beforeMirror, 'the real deck cycle must reach an Elven-access card').not.toBeNull();
    expect(legalAgentSpaces(beforeMirror!, target, mirrorCardId)).toContain('mirror-galadriel');
    const awaitingScout = reduceGame(stream);
    expect(awaitingScout.diagnostics).toEqual([]);
    expect(awaitingScout.match!.players[target].resources.mithril).toBe(1);
    expect(awaitingScout.match!.players[target].standing.elven).toBe(1);
    expect(awaitingScout.match!.players[target].hand).toHaveLength(beforeMirrorHandSize);
    expect(awaitingScout.match!.pendingChoice).toMatchObject({
      kind: 'place-scout', actorUid: target
    });
    expect(currentPlayerUid(awaitingScout)).toBe(target);

    append(awaitingScout, 'scout/placed', { postId: 'last-homely-house' });
    let completedMirror = reduceGame(stream);
    if (completedMirror.match!.pendingChoice?.kind === 'seek-allies') {
      append(completedMirror, 'choice/resolved', { choice: 'keep-card' });
      completedMirror = reduceGame(stream);
    }
    expect(completedMirror.diagnostics).toEqual([]);
    expect(completedMirror.match!.boardScouts['last-homely-house']).toBe(target);
    expect(completedMirror.match!.players[target].scouts.supply).toBe(2);
    expect(completedMirror.match!.pendingChoice).toBeNull();

    let beforeBargain: ReturnType<typeof reduceGame> | null = null;
    for (let step = 0; step < 400; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      if (match.pendingChoice?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (match.pendingChoice?.kind === 'place-scout') append(state, 'scout/placed', { postId: 'northern-eaves' });
      else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current !== target) append(state, 'turn/revealed', {});
      else {
        const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
        const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
        const hasOtherAgent = Object.entries(match.boardAgents).some(([spaceId, occupations]) =>
          spaceId !== 'secret-bargain' && occupations.some((occupation) => occupation.uid === target)
        );
        if (
          councilCard && hasOtherAgent &&
          legalAgentSpaces(state, target, councilCard.id).includes('secret-bargain')
        ) {
          beforeBargain = state;
          append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'secret-bargain' });
          break;
        }
        if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
        } else append(state, 'turn/revealed', {});
      }
    }
    expect(beforeBargain, 'the real economy must fund a legal Secret Bargain').not.toBeNull();
    const oldFateId = beforeBargain!.match!.players[target].fateHand[0].id;
    const replacementFateId = beforeBargain!.match!.fateDeck[0].id;
    const beforeBargainHandSize = beforeBargain!.match!.players[target].hand.length;
    const awaitingCycle = reduceGame(stream);
    expect(awaitingCycle.match!.players[target].resources.gold).toBe(beforeBargain!.match!.players[target].resources.gold - 3);
    expect(awaitingCycle.match!.pendingChoice).toEqual({
      kind: 'secret-bargain-fate', actorUid: target, options: ['cycle-fate', 'keep-fate']
    });
    append(awaitingCycle, 'choice/resolved', { choice: 'cycle-fate' });
    const awaitingRecall = reduceGame(stream);
    expect(awaitingRecall.match!.fateDiscard.map((fate) => fate.id)).toContain(oldFateId);
    expect(awaitingRecall.match!.players[target].fateHand.map((fate) => fate.id)).toContain(replacementFateId);
    expect(awaitingRecall.match!.pendingChoice?.kind).toBe('secret-bargain-recall');
    if (awaitingRecall.match!.pendingChoice?.kind !== 'secret-bargain-recall') throw new Error('Agent recall must follow Fate cycling');
    const recallChoice = awaitingRecall.match!.pendingChoice.options[0];
    const recalledSpace = recallChoice.slice('recall:'.length);
    const availableBeforeRecall = awaitingRecall.match!.players[target].availableAgents;
    append(awaitingRecall, 'choice/resolved', { choice: recallChoice });
    const bargained = reduceGame(stream);
    expect(bargained.diagnostics).toEqual([]);
    expect(bargained.match!.boardAgents[recalledSpace]?.some((occupation) => occupation.uid === target) ?? false).toBe(false);
    expect(bargained.match!.players[target].availableAgents).toBe(availableBeforeRecall + 1);
    expect(bargained.match!.players[target].hand).toHaveLength(beforeBargainHandSize);
    expect(bargained.match!.pendingChoice).toBeNull();

    let beforeCaptain: ReturnType<typeof reduceGame> | null = null;
    let captainCardId = '';
    for (let step = 0; step < 800; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      if (match.pendingChoice?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (match.pendingChoice?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id]);
        if (!emptyPost) throw new Error('an empty Scout post is required');
        append(state, 'scout/placed', { postId: emptyPost.id });
      } else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current !== target) append(state, 'turn/revealed', {});
      else {
        const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
        const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
        if (councilCard && legalAgentSpaces(state, target, councilCard.id).includes('captain-host')) {
          beforeCaptain = state;
          captainCardId = councilCard.id;
          append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'captain-host' });
          break;
        }
        if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
        } else append(state, 'turn/revealed', {});
      }
    }
    expect(beforeCaptain, 'the real road economy must fund Captain of the Host').not.toBeNull();
    expect(beforeCaptain!.match!.players[target].resources.gold).toBeGreaterThanOrEqual(8);
    expect(legalAgentSpaces(beforeCaptain!, target, captainCardId)).toContain('captain-host');
    const afterCaptain = reduceGame(stream);
    const captainPlayer = afterCaptain.match!.players[target];
    expect(afterCaptain.diagnostics).toEqual([]);
    expect(captainPlayer.resources.gold).toBe(beforeCaptain!.match!.players[target].resources.gold - 8);
    expect(afterCaptain.match!.boardAgents['captain-host']?.some((occupation) => occupation.uid === target)).toBe(true);
    expect(captainPlayer.captainUnlocked || captainPlayer.captainAgentPending).toBe(true);

    for (let step = 0; step < 20 && !reduceGame(stream).match!.players[target].captainUnlocked; step += 1) {
      const state = reduceGame(stream);
      if (state.match!.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else append(state, 'turn/revealed', {});
    }
    const captainArrived = reduceGame(stream);
    expect(captainArrived.match!.players[target].captainUnlocked).toBe(true);
    expect(captainArrived.match!.players[target].captainAgentPending).toBe(false);
    const futureCouncilCard = captainArrived.match!.players[target].hand.find((card) => card.definitionId === 'armed-escort');
    if (futureCouncilCard) expect(legalAgentSpaces(captainArrived, target, futureCouncilCard.id)).not.toContain('captain-host');

    const secondCaptainUid = captainArrived.match!.playerOrder.find((uid) => uid !== target)!;
    let beforeSecondCaptain: ReturnType<typeof reduceGame> | null = null;
    for (let step = 0; step < 800; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      if (match.pendingChoice?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current !== secondCaptainUid) append(state, 'turn/revealed', {});
      else {
        const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
        const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
        if (councilCard && legalAgentSpaces(state, current, councilCard.id).includes('captain-host')) {
          beforeSecondCaptain = state;
          append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'captain-host' });
          break;
        }
        if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
        } else append(state, 'turn/revealed', {});
      }
    }
    expect(beforeSecondCaptain, 'a later player must be able to afford the reduced Captain price').not.toBeNull();
    const afterSecondCaptain = reduceGame(stream);
    expect(afterSecondCaptain.diagnostics).toEqual([]);
    expect(afterSecondCaptain.match!.players[secondCaptainUid].resources.gold)
      .toBe(beforeSecondCaptain!.match!.players[secondCaptainUid].resources.gold - 6);

    let beforePits: ReturnType<typeof reduceGame> | null = null;
    for (let step = 0; step < 1200; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      const pending = match.pendingChoice;
      if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pending?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'muster-free-peoples') append(state, 'choice/resolved', { choice: 'decline' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id]);
        if (!emptyPost) throw new Error('an empty Scout post is required');
        append(state, 'scout/placed', { postId: emptyPost.id });
      } else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current !== target) append(state, 'turn/revealed', {});
      else {
        const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
        const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
        const factionCard = player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies');
        if (factionCard && legalAgentSpaces(state, current, factionCard.id).includes('pits-isengard')) {
          beforePits = state;
          append(state, 'agent/placed', { cardInstanceId: factionCard.id, spaceId: 'pits-isengard' });
          break;
        }
        if (councilCard && !match.boardAgents['white-council-seat'] && player.resources.gold >= 5 && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'white-council-seat' });
        } else if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
        } else append(state, 'turn/revealed', {});
      }
    }
    expect(beforePits, 'repeat Council visits must fund Pits of Isengard').not.toBeNull();
    let afterPits = reduceGame(stream);
    if (afterPits.match!.pendingChoice?.kind === 'gather-intelligence') {
      append(afterPits, 'choice/resolved', { choice: 'decline-intelligence' });
      afterPits = reduceGame(stream);
    }
    const beforePitsPlayer = beforePits!.match!.players[target];
    const afterPitsPlayer = afterPits.match!.players[target];
    const expectedRecruitment = Math.min(4, beforePitsPlayer.companies.supply);
    expect(afterPits.diagnostics).toEqual([]);
    expect(afterPitsPlayer.resources.mithril).toBe(beforePitsPlayer.resources.mithril - 4);
    expect(afterPitsPlayer.standing.shadow).toBe(Math.min(6, beforePitsPlayer.standing.shadow + 1));
    expect(afterPitsPlayer.fateHand.length).toBe(beforePitsPlayer.fateHand.length + 1);
    expect(afterPitsPlayer.companies.garrison).toBe(beforePitsPlayer.companies.garrison + expectedRecruitment);
    expect(afterPits.match!.boardAgents['pits-isengard']?.some((occupation) => occupation.uid === target)).toBe(true);

    const reachFactionSpace = (spaceId: 'deep-roads' | 'hidden-paths' | 'ranger-mustering') => {
      for (let step = 0; step < 1200; step += 1) {
        const state = reduceGame(stream);
        const current = currentPlayerUid(state)!;
        const match = state.match!;
        const player = match.players[current];
        const pending = match.pendingChoice;
        if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
        else if (pending?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
        else if (pending?.kind === 'ranger-mustering-trash') append(state, 'choice/resolved', { choice: 'decline-trash' });
        else if (pending?.kind === 'muster-free-peoples') append(state, 'choice/resolved', { choice: 'decline' });
        else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
        else if (current !== target) append(state, 'turn/revealed', {});
        else {
          const councilCard = player.hand.find((card) => card.definitionId === 'armed-escort');
          const roadCard = player.hand.find((card) => card.definitionId === 'the-open-road' || card.definitionId === 'muster-host');
          const factionCard = player.hand.find((card) => card.definitionId === 'diplomatic-mission' || card.definitionId === 'seek-allies');
          if (factionCard && legalAgentSpaces(state, current, factionCard.id).includes(spaceId)) {
            append(state, 'agent/placed', { cardInstanceId: factionCard.id, spaceId });
            return state;
          }
          if (spaceId === 'deep-roads' && councilCard && !match.boardAgents['white-council-seat'] && player.resources.gold >= 5 && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'white-council-seat' });
          } else if (spaceId === 'deep-roads' && roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
          } else append(state, 'turn/revealed', {});
        }
      }
      throw new Error(`${spaceId} was not reached through the real deck and economy`);
    };

    const beforeDeepRoads = reachFactionSpace('deep-roads');
    let afterDeepRoads = reduceGame(stream);
    if (afterDeepRoads.match!.pendingChoice?.kind === 'gather-intelligence') {
      append(afterDeepRoads, 'choice/resolved', { choice: 'decline-intelligence' });
      afterDeepRoads = reduceGame(stream);
    }
    expect(afterDeepRoads.match!.players[target].resources.mithril)
      .toBe(beforeDeepRoads.match!.players[target].resources.mithril - 5);
    expect(afterDeepRoads.match!.players[target].standing.dwarven)
      .toBe(Math.min(6, beforeDeepRoads.match!.players[target].standing.dwarven + 1));
    expect(afterDeepRoads.match!.boardAgents['deep-roads']?.some((occupation) => occupation.uid === target)).toBe(true);

    const beforeHiddenPaths = reachFactionSpace('hidden-paths');
    let afterHiddenPaths = reduceGame(stream);
    if (afterHiddenPaths.match!.pendingChoice?.kind === 'gather-intelligence') {
      append(afterHiddenPaths, 'choice/resolved', { choice: 'decline-intelligence' });
      afterHiddenPaths = reduceGame(stream);
    }
    expect(afterHiddenPaths.match!.players[target].standing.wild).toBe(1);
    expect(afterHiddenPaths.match!.players[target].hand.length).toBe(beforeHiddenPaths.match!.players[target].hand.length);

    const beforeRangers = reachFactionSpace('ranger-mustering');
    let awaitingRangerTrash = reduceGame(stream);
    if (awaitingRangerTrash.match!.pendingChoice?.kind === 'gather-intelligence') {
      append(awaitingRangerTrash, 'choice/resolved', { choice: 'decline-intelligence' });
      awaitingRangerTrash = reduceGame(stream);
    }
    expect(awaitingRangerTrash.match!.players[target].resources.provisions)
      .toBe(beforeRangers.match!.players[target].resources.provisions - 1);
    expect(awaitingRangerTrash.match!.players[target].standing.wild).toBe(2);
    expect(awaitingRangerTrash.match!.pendingChoice?.kind).toBe('ranger-mustering-trash');
    if (awaitingRangerTrash.match!.pendingChoice?.kind !== 'ranger-mustering-trash') throw new Error('Ranger trash choice is required');
    const chosenTrash = awaitingRangerTrash.match!.pendingChoice.options.find((option) => option.startsWith('trash-card:'))!;
    const trashBefore = awaitingRangerTrash.match!.players[target].trashPile.length;
    append(awaitingRangerTrash, 'choice/resolved', { choice: chosenTrash });
    const afterRangers = reduceGame(stream);
    expect(afterRangers.diagnostics).toEqual([]);
    expect(afterRangers.match!.players[target].trashPile).toHaveLength(trashBefore + 1);
    expect(afterRangers.match!.boardAgents['ranger-mustering']?.some((occupation) => occupation.uid === target)).toBe(true);
  });

  it('draws Fate at Hall of Fire and grants Influence only while its Agent remains that round', () => {
    const setup = readyRoom();
    const started = reduceGame(setup);
    const [roadActor, dwarfActor, shadowActor] = started.match!.playerOrder;
    const road = started.match!.players[roadActor].hand.find((card) => card.definitionId === 'the-open-road')!;
    const afterRoadEvent = createEvent('agent/placed', roadActor, 5, { cardInstanceId: road.id, spaceId: 'take-war-effort' }, 11);
    const afterRoad = reduceGame([...setup, afterRoadEvent]);
    const dwarfMission = afterRoad.match!.players[dwarfActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const dwarfEvent = createEvent('agent/placed', dwarfActor, 5, { cardInstanceId: dwarfMission.id, spaceId: 'dwarven-caravans' }, 12);
    const afterDwarf = reduceGame([...setup, afterRoadEvent, dwarfEvent]);
    const shadowMission = afterDwarf.match!.players[shadowActor].hand.find((card) => card.definitionId === 'diplomatic-mission')!;
    const shadowEvent = createEvent('agent/placed', shadowActor, 5, { cardInstanceId: shadowMission.id, spaceId: 'tribute-shadow' }, 13);
    const beforeHall = reduceGame([...setup, afterRoadEvent, dwarfEvent, shadowEvent]);
    const escort = beforeHall.match!.players[roadActor].hand.find((card) => card.definitionId === 'armed-escort')!;
    const hallEvent = createEvent('agent/placed', roadActor, 6, { cardInstanceId: escort.id, spaceId: 'hall-fire' }, 14);
    const atHall = reduceGame([...setup, afterRoadEvent, dwarfEvent, shadowEvent, hallEvent]);

    expect(atHall.diagnostics).toEqual([]);
    expect(atHall.match!.players[roadActor].fateHand).toHaveLength(1);
    expect(atHall.match!.fateDeck).toHaveLength(29);
    expect(atHall.match!.players[roadActor].companies.garrison).toBe(4);
    expect(atHall.match!.boardAgents['hall-fire']).toEqual([{ uid: roadActor, agentNumber: 2 }]);

    const firstRound = [
      ...setup, afterRoadEvent, dwarfEvent, shadowEvent, hallEvent,
      createEvent('turn/revealed', dwarfActor, 6, {}, 15),
      createEvent('reveal/finished', dwarfActor, 7, {}, 16),
      createEvent('turn/revealed', shadowActor, 6, {}, 17),
      createEvent('reveal/finished', shadowActor, 7, {}, 18)
    ];
    const beforeHallReveal = reduceGame(firstRound);
    const firstBase = beforeHallReveal.match!.players[roadActor].hand.reduce((total, card) => total + (
      card.definitionId === 'rallying-words' ? 2 : card.definitionId === 'armed-escort' ? 0 : 1
    ), 0);
    const hallReveal = reduceGame([...firstRound, createEvent('turn/revealed', roadActor, 7, {}, 19)]);
    expect(hallReveal.match!.players[roadActor].revealInfluence).toBe(firstBase + 1);

    const roundTwoLead = [
      ...firstRound,
      createEvent('turn/revealed', roadActor, 7, {}, 19),
      createEvent('reveal/finished', roadActor, 8, {}, 20),
      createEvent('turn/revealed', dwarfActor, 8, {}, 21),
      createEvent('reveal/finished', dwarfActor, 9, {}, 22),
      createEvent('turn/revealed', shadowActor, 8, {}, 23),
      createEvent('reveal/finished', shadowActor, 9, {}, 24)
    ];
    const beforePlainReveal = reduceGame(roundTwoLead);
    expect(beforePlainReveal.match!.boardAgents).toEqual({});
    const secondBase = beforePlainReveal.match!.players[roadActor].hand.reduce((total, card) => total + (
      card.definitionId === 'rallying-words' ? 2 : card.definitionId === 'armed-escort' ? 0 : 1
    ), 0);
    const plainReveal = reduceGame([...roundTwoLead, createEvent('turn/revealed', roadActor, 9, {}, 25)]);
    expect(plainReveal.diagnostics).toEqual([]);
    expect(plainReveal.match!.players[roadActor].revealInfluence).toBe(secondBase);
    expect(plainReveal.match!.players[roadActor].fateHand).toHaveLength(1);
  });

  it('runs a three-player Battle from legal deployments through ranked rewards and cleanup', () => {
    const stream = readyRoom('battle-three');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    const battleSpaces = ['minas-tirith', 'hidden-paths', 'ranger-mustering'];
    const used = new Set<string>();

    for (let guard = 0; guard < 80; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') {
        append(current, 'choice/resolved', { choice: `deploy:${pending.maximum}` });
      } else if (pending?.kind === 'ranger-mustering-trash') {
        append(current, 'choice/resolved', { choice: 'decline-trash' });
      } else if (pending?.kind === 'seek-allies') {
        append(current, 'choice/resolved', { choice: 'keep-card' });
      } else if (match.turnMode === 'reveal') {
        append(current, 'reveal/finished', {});
      } else if ((match.battleCompanies[current] ?? 0) > 0) {
        append(current, 'turn/revealed', {});
      } else {
        const player = match.players[current];
        const placement = player.hand
          .flatMap((card) => legalAgentSpaces(state, current, card.id)
            .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
            .map((spaceId) => ({ card, spaceId })))
          .sort((left, right) => {
            const preference = (id: string) => id === 'armed-escort' ? 0 : id === 'diplomatic-mission' ? 1 : 2;
            return preference(left.card.definitionId) - preference(right.card.definitionId);
          })[0];
        expect(placement, `${current} must reach an unused Battle space from a real opening hand`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }

    const fateWindow = reduceGame(stream);
    expect(fateWindow.diagnostics).toEqual([]);
    expect(fateWindow.match!.turnMode).toBe('battle');
    expect(Object.values(fateWindow.match!.battleCompanies).filter((amount) => amount > 0)).toHaveLength(3);
    const strengthBefore = Object.fromEntries(fateWindow.match!.playerOrder.map((uid) => [uid, battleStrength(fateWindow.match!, uid)]));
    const expectedWinner = Object.entries(strengthBefore).sort(([, left], [, right]) => right - left)[0][0];
    while (reduceGame(stream).match!.turnMode === 'battle') {
      const state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'battle/passed', {});
    }
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.round).toBe(2);
    expect(resolved.match!.battleHistory).toHaveLength(1);
    expect(resolved.match!.battleHistory[0].winnerUid).toBe(expectedWinner);
    expect(resolved.match!.players[expectedWinner].wonBattleIds).toEqual(['crossing-isen']);
    expect(Object.values(resolved.match!.battleCompanies)).toEqual([0, 0, 0]);
    expect(resolved.match!.players[expectedWinner].resources.gold).toBeGreaterThanOrEqual(3);

    used.clear();
    for (let guard = 0; guard < 80; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') append(current, 'choice/resolved', { choice: `deploy:${pending.maximum}` });
      else if (pending?.kind === 'ranger-mustering-trash') append(current, 'choice/resolved', { choice: 'decline-trash' });
      else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id])!;
        append(current, 'scout/placed', { postId: emptyPost.id });
      } else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if ((match.battleCompanies[current] ?? 0) > 0) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        expect(placement, `${current} must reach round two's contested Battle`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }
    expect(reduceGame(stream).match!.activeBattleId).toBe('siege-minas-tirith');
    while (reduceGame(stream).match!.turnMode === 'battle') {
      const state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'battle/passed', {});
    }
    const afterSiege = reduceGame(stream);
    const controller = afterSiege.match!.criticalControl['minas-tirith'];
    expect(controller).not.toBeNull();
    expect(afterSiege.match!.players[controller!].renown).toBeGreaterThanOrEqual(1);
    expect(afterSiege.match!.players[controller!].wonBattleIds).toContain('siege-minas-tirith');

    const controllerGold = afterSiege.match!.players[controller!].resources.gold;
    for (let guard = 0; guard < 12; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.boardAgents['minas-tirith']) break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else {
        const player = state.match!.players[current];
        const strongholdCard = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('minas-tirith'));
        if (strongholdCard) append(current, 'agent/placed', { cardInstanceId: strongholdCard.id, spaceId: 'minas-tirith' });
        else append(current, 'turn/revealed', {});
      }
    }
    const afterVisit = reduceGame(stream);
    expect(afterVisit.match!.boardAgents['minas-tirith']).toBeDefined();
    expect(afterVisit.match!.players[controller!].resources.gold).toBe(controllerGold + 1);
  });
});
