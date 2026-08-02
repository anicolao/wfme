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
    expect(afterTribute.match!.boardAgents['tribute-shadow'][0].uid).toBe(actor);
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
    expect(pending.match!.pendingChoice).toEqual({ kind: 'place-scout', actorUid: actor, options: [] });
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
});
