import { describe, expect, it } from 'vitest';
import { createEvent } from './events';
import { AGENT_CARD_DEFINITIONS, BATTLE_CARD_DEFINITIONS, CHRONICLE_CARD_DEFINITIONS, MUSTER_CARD_DEFINITIONS, OBSERVATION_POSTS } from './manifest';
import { battleStrength, currentPlayerUid, legalAgentSpaces, reduceGame } from './reducer';
import { shuffled } from './prng';

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

function completedAgentRound(seed = 'road-2') {
  const setup = readyRoom(seed);
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
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'hold-line')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'hidden-archers')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'reinforcements')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'desperate-valor')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'chance-meeting')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'gifts-tokens')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'tidings-afar')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'divided-counsel')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'long-memory')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'fell-sorcery')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'lore-beyond-price')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'keeper-oaths')).toHaveLength(2);
    expect(first.match!.fateDeck.filter((card) => card.definitionId === 'the-long-game')).toHaveLength(2);
    expect(first.match!.chronicleRow).toHaveLength(5);
    expect(first.match!.chronicleDeck).toHaveLength(47);
    const chronicleInstances = [...first.match!.chronicleRow, ...first.match!.chronicleDeck];
    expect(new Set(chronicleInstances.map((card) => card.id)).size).toBe(52);
    for (const definition of CHRONICLE_CARD_DEFINITIONS) {
      expect(chronicleInstances.filter((card) => card.definitionId === definition.id)).toHaveLength(2);
    }
    const expectedFoundationOrder = shuffled(CHRONICLE_CARD_DEFINITIONS
      .filter((definition) => !definition.incrementalDeckInsertion)
      .flatMap((definition) => Array.from({ length: definition.copies }, (_, index) => `chronicle:${definition.id}:${index + 1}`)),
    'road-2:chronicle-deck');
    const incrementalDefinitionIds = new Set<string>(CHRONICLE_CARD_DEFINITIONS
      .filter((definition) => definition.incrementalDeckInsertion)
      .map((definition) => definition.id));
    expect(chronicleInstances.filter((card) => !incrementalDefinitionIds.has(card.definitionId)).map((card) => card.id))
      .toEqual(expectedFoundationOrder);
    const selectedBattleIds = [first.match!.activeBattleId!, ...first.match!.battleDeck];
    expect(selectedBattleIds).toHaveLength(10);
    expect(new Set(selectedBattleIds)).toHaveLength(10);
    expect(selectedBattleIds.map((id) => BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === id)!.age)).toEqual([
      1, 2, 2, 2, 2, 2, 3, 3, 3, 3
    ]);
    expect(BATTLE_CARD_DEFINITIONS.filter((battle) => !selectedBattleIds.includes(battle.id))).toHaveLength(6);
    const otherSetup = reduceGame(readyRoom('ten-battle-selection'));
    expect([otherSetup.match!.activeBattleId!, ...otherSetup.match!.battleDeck]).not.toEqual(selectedBattleIds);
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
    expect(legalAgentSpaces(before, actor, road.id)).toEqual(['take-war-effort', 'edoras', 'entwash']);

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

  it('collects the printed and accumulated Riches at Edoras', () => {
    const events = readyRoom();
    const before = reduceGame(events);
    const actor = before.match!.playerOrder[0];
    const road = before.match!.players[actor].hand.find((card) => card.definitionId === 'the-open-road')!;
    const mithrilBefore = before.match!.players[actor].resources.mithril;
    const after = reduceGame([...events, createEvent('agent/placed', actor, 5, {
      cardInstanceId: road.id,
      spaceId: 'edoras'
    }, 11)]);

    expect(after.diagnostics).toEqual([]);
    expect(after.match!.players[actor].resources.mithril).toBe(mithrilBefore + 1);
    expect(after.match!.richesMithril.edoras).toBe(0);
    expect(after.match!.boardAgents.edoras[0].uid).toBe(actor);
    expect(after.match!.activity.at(-1)).toContain('taking 0 bonus Mithril from Riches');
  });

  it('requires Wild respect and resolves both final Fangorn Moot decisions', () => {
    const stream = readyRoom('fangorn-moot-3');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const opening = reduceGame(stream);
    const target = opening.match!.playerOrder[0];
    const openingStronghold = opening.match!.players[target].hand.find((card) => card.definitionId === 'armed-escort' || card.definitionId === 'reconnaissance');
    expect(openingStronghold).toBeDefined();
    expect(legalAgentSpaces(opening, target, openingStronghold!.id)).not.toContain('fangorn-moot');
    const append = (state: ReturnType<typeof reduceGame>, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const actorUid = currentPlayerUid(state)!;
      sequences[actorUid] += 1;
      stream.push(createEvent(type, actorUid, sequences[actorUid], payload, timestamp++));
    };

    for (let guard = 0; guard < 120; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      const current = currentPlayerUid(state)!;
      const player = match.players[current];
      if (current === target && match.turnMode === 'agent' && player.standing.wild >= 2) {
        const stronghold = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('fangorn-moot'));
        if (stronghold) {
          append(state, 'agent/placed', { cardInstanceId: stronghold.id, spaceId: 'fangorn-moot' });
          break;
        }
      }
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') append(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (pending?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pending?.kind === 'ranger-mustering-trash') append(state, 'choice/resolved', { choice: 'decline-trash' });
      else if (pending?.kind === 'critical-defense') append(state, 'choice/resolved', { choice: 'decline-defender' });
      else if (match.turnMode === 'battle') append(state, 'battle/passed', {});
      else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current === target && player.standing.wild < 2) {
        const wild = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('hidden-paths'));
        if (wild) append(state, 'agent/placed', { cardInstanceId: wild.id, spaceId: 'hidden-paths' });
        else append(state, 'turn/revealed', {});
      } else append(state, 'turn/revealed', {});
    }

    const pending = reduceGame(stream);
    expect(pending.diagnostics).toEqual([]);
    expect(pending.match!.players[target].standing.wild).toBeGreaterThanOrEqual(2);
    expect(pending.match!.pendingChoice).toEqual(expect.objectContaining({
      kind: 'fangorn-moot',
      actorUid: target,
      options: ['take-ent-draught', 'gain-provision-breach-dam', 'gain-provision-leave-dam']
    }));
    const provisions = pending.match!.players[target].resources.provisions;
    const garrison = pending.match!.players[target].companies.garrison;
    const supply = pending.match!.players[target].companies.supply;

    sequences[target] += 1;
    const draughtStream = [...stream, createEvent('choice/resolved', target, sequences[target], { choice: 'take-ent-draught' }, timestamp)];
    const draughtSequences = { ...sequences };
    const draughtTimestamp = timestamp + 1;
    const draught = reduceGame(draughtStream);
    expect(draught.diagnostics).toEqual([]);
    expect(draught.match!.players[target].entDraught).toBe(true);
    expect(draught.match!.players[target].resources.provisions).toBe(provisions + 1);
    expect(draught.match!.players[target].companies.garrison).toBe(garrison + Math.min(1, supply));
    expect(draught.match!.damBreached).toBe(false);

    const breach = reduceGame([...stream, createEvent('choice/resolved', target, sequences[target], { choice: 'gain-provision-breach-dam' }, timestamp)]);
    expect(breach.diagnostics).toEqual([]);
    expect(breach.match!.players[target].entDraught).toBe(false);
    expect(breach.match!.players[target].resources.provisions).toBe(provisions + 1);
    expect(breach.match!.players[target].companies.garrison).toBe(garrison);
    expect(breach.match!.damBreached).toBe(true);

    const entStream = [...draughtStream];
    let nextTimestamp = timestamp + 1;
    let beforeDeep: ReturnType<typeof reduceGame> | null = null;
    let protectedDeepChecked = false;
    const appendEnt = (state: ReturnType<typeof reduceGame>, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const actorUid = currentPlayerUid(state)!;
      sequences[actorUid] += 1;
      entStream.push(createEvent(type, actorUid, sequences[actorUid], payload, nextTimestamp++));
    };
    for (let guard = 0; guard < 160; guard += 1) {
      const state = reduceGame(entStream);
      const match = state.match!;
      if (match.pendingChoice?.kind === 'deep-fangorn') {
        if (!match.damBreached) {
          const contested = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === match.activeBattleId)?.contestedLocationId;
          if (contested === 'minas-tirith' || contested === 'osgiliath' || contested === 'edoras') {
            expect(match.pendingChoice.options).toEqual(['gain-4-mithril']);
            const rejected = reduceGame([...entStream, createEvent('choice/resolved', target, sequences[target] + 1, { choice: 'summon-2-ents' }, nextTimestamp)]);
            expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
            expect(rejected.match!.battleEnts[target] ?? 0).toBe(0);
            protectedDeepChecked = true;
          } else {
            expect(match.pendingChoice.options).toEqual(['gain-4-mithril', 'summon-2-ents']);
            if (protectedDeepChecked) {
              beforeDeep = state;
              break;
            }
          }
          appendEnt(state, 'choice/resolved', { choice: 'gain-4-mithril' });
          continue;
        }
        beforeDeep = state;
        break;
      }
      const current = currentPlayerUid(state)!;
      const player = match.players[current];
      const pendingChoice = match.pendingChoice;
      if (pendingChoice?.kind === 'fangorn-moot') appendEnt(state, 'choice/resolved', { choice: 'gain-provision-breach-dam' });
      else if (pendingChoice?.kind === 'battle-deployment') appendEnt(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (pendingChoice?.kind === 'place-scout') {
        const post = OBSERVATION_POSTS.find((candidate) => !match.boardScouts[candidate.id])!;
        appendEnt(state, 'scout/placed', { postId: post.id });
      } else if (pendingChoice?.kind === 'gather-intelligence') appendEnt(state, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pendingChoice?.kind === 'seek-allies') appendEnt(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pendingChoice?.kind === 'critical-defense') appendEnt(state, 'choice/resolved', { choice: 'decline-defender' });
      else if (match.turnMode === 'battle') appendEnt(state, 'battle/passed', {});
      else if (match.turnMode === 'reveal') appendEnt(state, 'reveal/finished', {});
      else if (current === target) {
        const destination = !match.damBreached && player.resources.provisions < 3
          ? 'dwarven-caravans'
          : !match.damBreached && !protectedDeepChecked
            ? 'deep-fangorn'
            : !match.damBreached
              ? 'fangorn-moot'
            : player.resources.provisions < 3
              ? 'dwarven-caravans'
              : 'deep-fangorn';
        const card = player.hand.find((candidate) => legalAgentSpaces(state, current, candidate.id).includes(destination));
        if (card) appendEnt(state, 'agent/placed', { cardInstanceId: card.id, spaceId: destination });
        else appendEnt(state, 'turn/revealed', {});
      } else appendEnt(state, 'turn/revealed', {});
    }
    expect(beforeDeep, 'the real event stream must reach a paid Deep Fangorn choice').not.toBeNull();
    expect(protectedDeepChecked).toBe(true);
    expect(beforeDeep!.diagnostics).toEqual([]);
    expect(beforeDeep!.match!.damBreached).toBe(true);
    expect(beforeDeep!.match!.pendingChoice).toEqual(expect.objectContaining({
      kind: 'deep-fangorn', options: ['gain-4-mithril', 'summon-2-ents']
    }));
    const richesTaken = beforeDeep!.match!.round - 1;
    expect(beforeDeep!.match!.players[target].resources.provisions).toBeGreaterThanOrEqual(0);
    expect(beforeDeep!.match!.players[target].resources.mithril).toBeGreaterThanOrEqual(richesTaken);
    sequences[target] += 1;
    entStream.push(createEvent('choice/resolved', target, sequences[target], { choice: 'summon-2-ents' }, nextTimestamp++));
    const summoned = reduceGame(entStream);
    expect(summoned.diagnostics).toEqual([]);
    expect(summoned.match!.battleEnts[target]).toBe(2);
    expect(battleStrength(summoned.match!, target)).toBeGreaterThanOrEqual(6);

    entStream.splice(0, entStream.length, ...draughtStream);
    Object.assign(sequences, draughtSequences);
    nextTimestamp = draughtTimestamp;
    let beforeEntwash: ReturnType<typeof reduceGame> | null = null;
    for (let guard = 0; guard < 180; guard += 1) {
      const state = reduceGame(entStream);
      const match = state.match!;
      if (match.pendingChoice?.kind === 'entwash') {
        if (match.pendingChoice.options.includes('summon-1-ent')) {
          beforeEntwash = state;
          break;
        }
        appendEnt(state, 'choice/resolved', { choice: 'gain-2-mithril' });
        continue;
      }
      const current = currentPlayerUid(state)!;
      const player = match.players[current];
      const pendingChoice = match.pendingChoice;
      if (pendingChoice?.kind === 'battle-deployment') appendEnt(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (pendingChoice?.kind === 'place-scout') {
        const post = OBSERVATION_POSTS.find((candidate) => !match.boardScouts[candidate.id])!;
        appendEnt(state, 'scout/placed', { postId: post.id });
      } else if (pendingChoice?.kind === 'gather-intelligence') appendEnt(state, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pendingChoice?.kind === 'seek-allies') appendEnt(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pendingChoice?.kind === 'critical-defense') appendEnt(state, 'choice/resolved', { choice: 'decline-defender' });
      else if (match.turnMode === 'battle') appendEnt(state, 'battle/passed', {});
      else if (match.turnMode === 'reveal') appendEnt(state, 'reveal/finished', {});
      else if (current === target) {
        const road = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('entwash'));
        const provision = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('dwarven-caravans'));
        if (player.resources.provisions >= 1 && road) appendEnt(state, 'agent/placed', { cardInstanceId: road.id, spaceId: 'entwash' });
        else if (provision) appendEnt(state, 'agent/placed', { cardInstanceId: provision.id, spaceId: 'dwarven-caravans' });
        else appendEnt(state, 'turn/revealed', {});
      } else appendEnt(state, 'turn/revealed', {});
    }
    expect(beforeEntwash, 'ordinary play must reach Entwash after the Deep Fangorn Battle').not.toBeNull();
    expect(beforeEntwash!.diagnostics).toEqual([]);
    expect(beforeEntwash!.match!.pendingChoice).toEqual(expect.objectContaining({
      kind: 'entwash', options: ['gain-2-mithril', 'summon-1-ent']
    }));
    sequences[target] += 1;
    entStream.push(createEvent('choice/resolved', target, sequences[target], { choice: 'summon-1-ent' }, nextTimestamp++));
    const oneEnt = reduceGame(entStream);
    expect(oneEnt.diagnostics).toEqual([]);
    expect(oneEnt.match!.battleEnts[target]).toBe((beforeEntwash!.match!.battleEnts[target] ?? 0) + 1);
    expect(battleStrength(oneEnt.match!, target)).toBe(battleStrength(beforeEntwash!.match!, target) + 3);
    expect(oneEnt.match!.richesMithril.entwash).toBe(0);
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
    expect(legalAgentSpaces(beforeMuster, roadActor, escort.id)).toEqual(['hall-fire', 'muster-free-peoples', 'minas-tirith', 'osgiliath']);

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
    expect(roundTwo.match!.richesMithril.edoras).toBe(1);
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
    expect(roundThree.match!.richesMithril.edoras).toBe(2);
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

  it('buys, refills, reshuffles, draws, and executes every reviewed Chronicle card', () => {
    const reachAcquiredCard = (
      definitionId: (typeof CHRONICLE_CARD_DEFINITIONS)[number]['id'],
      minimumGold = 0,
      prepareScout = false,
      minimumDrawPile = 0,
      minimumSeedCandidate = 0,
      minimumScoutCount = prepareScout ? 1 : 0,
      minimumMithril = 0
    ) => {
      const definition = CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === definitionId)!;
      let completed: { events: ReturnType<typeof readyRoom>; seed: string } | null = null;
      for (let candidate = 0; candidate < 5_000 && !completed; candidate += 1) {
        try {
          if (candidate < minimumSeedCandidate) continue;
          const seed = `chronicle-${definitionId}-${candidate}`;
          const attempt = definition.cost > 5
            ? { events: readyRoom(seed) }
            : completedAgentRound(seed);
          const attemptEvents = [...attempt.events];
          let attemptState = reduceGame(attemptEvents);
          if (attemptState.diagnostics.length > 0) continue;
          const attemptActor = currentPlayerUid(attemptState)!;
          const attemptSequences = Object.fromEntries(['host', 'guest-a', 'guest-b'].map((uid) => [uid,
            Math.max(...attemptEvents.filter((event) => event.actorUid === uid).map((event) => event.clientSeq))
          ]));
          let attemptTimestamp = Math.max(...attemptEvents.map((event) => event.createdAtMillis)) + 1;
          const appendAttempt = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
            attemptSequences[uid] += 1;
            attemptEvents.push(createEvent(type, uid, attemptSequences[uid], payload, attemptTimestamp++));
          };
          if (definition.cost > 5) {
            const councilCard = attemptState.match!.players[attemptActor].hand.find((card) => card.definitionId === 'armed-escort');
            if (!councilCard) continue;
            appendAttempt(attemptActor, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'hall-fire' });
            attemptState = reduceGame(attemptEvents);
            if (attemptState.diagnostics.length > 0) continue;
            while (currentPlayerUid(attemptState) !== attemptActor) {
              const current = currentPlayerUid(attemptState)!;
              appendAttempt(current, 'turn/revealed', {});
              appendAttempt(current, 'reveal/finished', {});
              attemptState = reduceGame(attemptEvents);
            }
          }
          const revealedAttempt = reduceGame([
            ...attemptEvents,
            createEvent('turn/revealed', attemptActor, attemptSequences[attemptActor] + 1, {}, attemptTimestamp)
          ]);
          if (
            revealedAttempt.match!.chronicleRow.some((card) => card.definitionId === definitionId) &&
            revealedAttempt.match!.players[attemptActor].revealInfluence >= definition.cost &&
            revealedAttempt.match!.players[attemptActor].resources.gold >= minimumGold &&
            (definition.cost <= 5 || revealedAttempt.match!.players[attemptActor].fateHand.some((card) =>
              card.definitionId === 'chance-meeting'
            ))
          ) completed = { ...attempt, events: attemptEvents, seed };
        } catch {
          // Some seeds do not put the setup cards in the opening hands; keep looking.
        }
      }
      expect(completed, `a deterministic ordinary setup must offer ${definition.name}`).not.toBeNull();
      const stream = [...completed!.events];
      const sequences = Object.fromEntries(['host', 'guest-a', 'guest-b'].map((uid) => [uid,
        Math.max(...stream.filter((event) => event.actorUid === uid).map((event) => event.clientSeq))
      ]));
      let timestamp = Math.max(...stream.map((event) => event.createdAtMillis)) + 1;
      const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
        sequences[uid] += 1;
        stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      };
      let state = reduceGame(stream);
      const actor = currentPlayerUid(state)!;
      append(actor, 'turn/revealed', {});
      state = reduceGame(stream);
      const offered = state.match!.chronicleRow.find((card) => card.definitionId === definitionId)!;
      const influenceBefore = state.match!.players[actor].revealInfluence;
      const refill = state.match!.chronicleDeck[0];
      expect(influenceBefore).toBeGreaterThanOrEqual(definition.cost);
      append(actor, 'card/acquired', { definitionId, cardInstanceId: offered.id });
      state = reduceGame(stream);
      expect(state.diagnostics).toEqual([]);
      expect(state.match!.players[actor].revealInfluence).toBe(influenceBefore - definition.cost);
      expect(state.match!.players[actor].discardPile).toContainEqual(offered);
      expect(state.match!.chronicleDeck).toHaveLength(46);
      expect(state.match!.chronicleRow).toHaveLength(5);
      expect(state.match!.chronicleRow).toContainEqual(refill);

      append(actor, 'card/acquired', { definitionId, cardInstanceId: offered.id });
      const rejected = reduceGame(stream);
      expect(rejected.diagnostics.at(-1)).toContain('illegal acquisition');
      stream.pop();

      append(actor, 'reveal/finished', {});
      for (let guard = 0; guard < 80; guard += 1) {
        state = reduceGame(stream);
        if (
          state.match!.round >= 3 &&
          currentPlayerUid(state) === actor &&
          state.match!.turnMode === 'agent' &&
          state.match!.players[actor].hand.some((card) => card.id === offered.id) &&
          state.match!.players[actor].drawPile.length >= minimumDrawPile &&
          state.match!.players[actor].resources.mithril >= minimumMithril &&
          (minimumMithril === 0 || !Object.values(state.match!.boardAgents).flat().some((occupation) => occupation.uid === actor)) &&
          Object.values(state.match!.boardScouts).filter((uid) => uid === actor).length >= minimumScoutCount
        ) break;
        const current = currentPlayerUid(state)!;
        if (current === actor && state.match!.players[actor].resources.mithril < minimumMithril) {
          const edorasCard = state.match!.players[actor].hand.find((card) =>
            card.id !== offered.id && legalAgentSpaces(state, actor, card.id).includes('edoras')
          );
          if (edorasCard) {
            append(actor, 'agent/placed', { cardInstanceId: edorasCard.id, spaceId: 'edoras' });
            for (let continuation = 0; continuation < 4; continuation += 1) {
              state = reduceGame(stream);
              const pending = state.match!.pendingChoice;
              if (pending?.kind === 'place-scout') {
                const post = OBSERVATION_POSTS.find((candidate) =>
                  !state.match!.boardScouts[candidate.id] &&
                  (pending.allowedPostIds === null || pending.allowedPostIds.includes(candidate.id))
                );
                expect(post).toBeDefined();
                append(actor, 'scout/placed', { postId: post!.id });
              } else if (pending?.kind === 'seek-allies') {
                append(actor, 'choice/resolved', { choice: 'keep-card' });
              } else if (pending?.kind === 'battle-deployment') {
                append(actor, 'choice/resolved', { choice: 'deploy:0' });
              } else break;
            }
            continue;
          }
        }
        if (current === actor && Object.values(state.match!.boardScouts).filter((uid) => uid === actor).length < minimumScoutCount) {
          const reconnaissance = state.match!.players[actor].hand.find((card) => card.definitionId === 'reconnaissance');
          if (reconnaissance) {
            append(actor, 'agent/placed', { cardInstanceId: reconnaissance.id, spaceId: 'take-war-effort' });
            state = reduceGame(stream);
            if (state.match!.pendingChoice?.kind === 'place-scout') {
              const preferredPostIds = minimumScoutCount === 1
                ? ['old-south-road']
                : OBSERVATION_POSTS.map((post) => post.id);
              const emptyPost = OBSERVATION_POSTS.find((post) =>
                preferredPostIds.includes(post.id) && !state.match!.boardScouts[post.id]
              );
              expect(emptyPost).toBeDefined();
              append(actor, 'scout/placed', { postId: emptyPost!.id });
            }
            continue;
          }
        }
        if (state.match!.turnMode === 'battle') {
          append(current, 'battle/passed', {});
          continue;
        }
        if (state.match!.turnMode === 'endgame') break;
        const nextType = state.match!.turnMode === 'reveal' ? 'reveal/finished' : 'turn/revealed';
        const beforeAdvance = minimumMithril > 0 ? {
          round: state.match!.round,
          mode: state.match!.turnMode,
          current,
          pending: state.match!.pendingChoice?.kind ?? null,
          revealed: state.match!.players[current].revealedThisRound,
          agents: state.match!.players[current].availableAgents
        } : null;
        append(current, nextType, {});
        if (beforeAdvance) {
          const advanced = reduceGame(stream);
          expect(advanced.diagnostics, JSON.stringify({ nextType, beforeAdvance })).toEqual([]);
        }
      }
      state = reduceGame(stream);
      expect(state.diagnostics, `round ${state.match!.round}, mode ${state.match!.turnMode}, hand ${state.match!.players[actor].hand.length}, draw ${state.match!.players[actor].drawPile.length}`).toEqual([]);
      expect(state.match!.round).toBeGreaterThanOrEqual(3);
      const acquired = state.match!.players[actor].hand.find((card) => card.id === offered.id)!;
      expect(acquired, `seed ${completed!.seed}, round ${state.match!.round}, mode ${state.match!.turnMode}, draw ${state.match!.players[actor].drawPile.length}, discard ${state.match!.players[actor].discardPile.map((card) => card.definitionId).join(',')}`).toEqual(offered);
      return { stream, append, actor, acquired, before: state };
    };

    const rider = reachAcquiredCard('rider-rohan');
    const riderGarrison = rider.before.match!.players[rider.actor].companies.garrison;
    rider.append(rider.actor, 'agent/placed', { cardInstanceId: rider.acquired.id, spaceId: 'minas-tirith' });
    const afterRider = reduceGame(rider.stream);
    expect(afterRider.diagnostics).toEqual([]);
    expect(afterRider.match!.players[rider.actor].companies.garrison).toBe(riderGarrison + 2);

    const guide = reachAcquiredCard('bree-land-guide');
    const guideResources = structuredClone(guide.before.match!.players[guide.actor].resources);
    guide.append(guide.actor, 'agent/placed', { cardInstanceId: guide.acquired.id, spaceId: 'take-war-effort' });
    const afterGuide = reduceGame(guide.stream);
    expect(afterGuide.diagnostics).toEqual([]);
    expect(afterGuide.match!.players[guide.actor].resources.provisions).toBe(guideResources.provisions + 1);
    expect(afterGuide.match!.players[guide.actor].resources.gold).toBe(guideResources.gold + 2);

    const captain = reachAcquiredCard('captain-gondor');
    const captainPlayer = captain.before.match!.players[captain.actor];
    const captainGarrison = captainPlayer.companies.garrison;
    const captainFate = captainPlayer.fateHand.length;
    captain.append(captain.actor, 'agent/placed', { cardInstanceId: captain.acquired.id, spaceId: 'hall-fire' });
    const afterCaptain = reduceGame(captain.stream);
    expect(afterCaptain.diagnostics).toEqual([]);
    expect(afterCaptain.match!.players[captain.actor].companies.garrison).toBe(captainGarrison + 2);
    expect(afterCaptain.match!.players[captain.actor].fateHand).toHaveLength(captainFate + 1);

    const eagle = reachAcquiredCard('eagle-misty-mountains');
    const eaglePlayer = eagle.before.match!.players[eagle.actor];
    const eagleGarrison = eaglePlayer.companies.garrison;
    const eagleHand = eaglePlayer.hand.length;
    eagle.append(eagle.actor, 'agent/placed', { cardInstanceId: eagle.acquired.id, spaceId: 'minas-tirith' });
    const afterEagle = reduceGame(eagle.stream);
    expect(afterEagle.diagnostics).toEqual([]);
    expect(afterEagle.match!.players[eagle.actor].companies.garrison).toBe(eagleGarrison + 2);
    expect(afterEagle.match!.players[eagle.actor].hand).toHaveLength(eagleHand + 1);

    const lady = reachAcquiredCard('lady-golden-wood');
    const ladyFate = lady.before.match!.players[lady.actor].fateHand.length;
    lady.append(lady.actor, 'agent/placed', { cardInstanceId: lady.acquired.id, spaceId: 'hidden-counsel' });
    let afterLady = reduceGame(lady.stream);
    expect(afterLady.diagnostics).toEqual([]);
    expect(afterLady.match!.players[lady.actor].fateHand).toHaveLength(ladyFate + 2);
    expect(afterLady.match!.pendingChoice).toMatchObject({ kind: 'place-scout', actorUid: lady.actor });
    const ladyPost = OBSERVATION_POSTS.find((post) => !afterLady.match!.boardScouts[post.id])!;
    lady.append(lady.actor, 'scout/placed', { postId: ladyPost.id });
    afterLady = reduceGame(lady.stream);
    expect(afterLady.diagnostics).toEqual([]);
    expect(afterLady.match!.boardScouts[ladyPost.id]).toBe(lady.actor);

    const steward = reachAcquiredCard('stewards-messenger');
    const stewardGold = steward.before.match!.players[steward.actor].resources.gold;
    steward.append(steward.actor, 'agent/placed', { cardInstanceId: steward.acquired.id, spaceId: 'hall-fire' });
    const afterSteward = reduceGame(steward.stream);
    expect(afterSteward.diagnostics).toEqual([]);
    expect(afterSteward.match!.players[steward.actor].resources.gold).toBe(stewardGold + 1);

    const delving = reachAcquiredCard('delving-expedition');
    const delvingPlayer = delving.before.match!.players[delving.actor];
    const delvingMithril = delvingPlayer.resources.mithril;
    const delvingProvisions = delvingPlayer.resources.provisions;
    const delvingRiches = delving.before.match!.richesMithril.entwash;
    expect(delvingProvisions).toBeGreaterThanOrEqual(1);
    delving.append(delving.actor, 'agent/placed', { cardInstanceId: delving.acquired.id, spaceId: 'entwash' });
    const afterDelving = reduceGame(delving.stream);
    expect(afterDelving.diagnostics).toEqual([]);
    expect(afterDelving.match!.players[delving.actor].resources.mithril).toBe(delvingMithril + delvingRiches + 1);
    expect(afterDelving.match!.players[delving.actor].resources.provisions).toBe(delvingProvisions - 1);
    expect(afterDelving.match!.pendingChoice).toMatchObject({ kind: 'entwash', actorUid: delving.actor });

    const durin = reachAcquiredCard('durins-heir');
    const durinPlayer = durin.before.match!.players[durin.actor];
    const durinMithril = durinPlayer.resources.mithril;
    const durinGarrison = durinPlayer.companies.garrison;
    const durinSupply = durinPlayer.companies.supply;
    durin.append(durin.actor, 'agent/placed', { cardInstanceId: durin.acquired.id, spaceId: 'dwarven-caravans' });
    const afterDurin = reduceGame(durin.stream);
    expect(afterDurin.diagnostics).toEqual([]);
    expect(afterDurin.match!.players[durin.actor].resources.mithril).toBe(durinMithril + 1);
    expect(afterDurin.match!.players[durin.actor].companies.garrison).toBe(durinGarrison + Math.min(2, durinSupply));
    expect(afterDurin.match!.players[durin.actor].companies.supply).toBe(durinSupply - Math.min(2, durinSupply));

    const voice = reachAcquiredCard('voice-orthanc');
    const voicePlayer = voice.before.match!.players[voice.actor];
    const voiceGold = voicePlayer.resources.gold;
    const opponentGold = Object.fromEntries(voice.before.match!.playerOrder
      .filter((uid) => uid !== voice.actor)
      .map((uid) => [uid, voice.before.match!.players[uid].resources.gold]));
    voice.append(voice.actor, 'agent/placed', { cardInstanceId: voice.acquired.id, spaceId: 'tribute-shadow' });
    const afterVoice = reduceGame(voice.stream);
    expect(afterVoice.diagnostics).toEqual([]);
    expect(afterVoice.match!.players[voice.actor].resources.gold).toBe(voiceGold + 4);
    for (const [uid, gold] of Object.entries(opponentGold)) {
      expect(afterVoice.match!.players[uid].resources.gold).toBe(gold > voiceGold + 2 ? gold - 1 : gold);
    }

    const smith = reachAcquiredCard('dwarven-smith');
    const smithPlayer = smith.before.match!.players[smith.actor];
    const smithGold = smithPlayer.resources.gold;
    const smithMithril = smithPlayer.resources.mithril;
    smith.append(smith.actor, 'agent/placed', { cardInstanceId: smith.acquired.id, spaceId: 'dwarven-caravans' });
    let afterSmith = reduceGame(smith.stream);
    expect(afterSmith.diagnostics).toEqual([]);
    expect(afterSmith.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-payment', actorUid: smith.actor, definitionId: 'dwarven-smith'
    });
    const smithPays = smithGold >= 1;
    expect(afterSmith.match!.pendingChoice!.options).toEqual(smithPays
      ? ['pay-chronicle-cost', 'decline-chronicle-cost']
      : ['decline-chronicle-cost']);
    smith.append(smith.actor, 'choice/resolved', { choice: smithPays ? 'pay-chronicle-cost' : 'decline-chronicle-cost' });
    afterSmith = reduceGame(smith.stream);
    expect(afterSmith.diagnostics).toEqual([]);
    expect(afterSmith.match!.players[smith.actor].resources.gold).toBe(smithGold - (smithPays ? 1 : 0));
    expect(afterSmith.match!.players[smith.actor].resources.mithril).toBe(smithMithril + (smithPays ? 1 : 0));

    const uruk = reachAcquiredCard('uruk-hai-captain');
    const urukPlayer = uruk.before.match!.players[uruk.actor];
    const urukGold = urukPlayer.resources.gold;
    const urukGarrison = urukPlayer.companies.garrison;
    const urukSupply = urukPlayer.companies.supply;
    uruk.append(uruk.actor, 'agent/placed', { cardInstanceId: uruk.acquired.id, spaceId: 'tribute-shadow' });
    let afterUruk = reduceGame(uruk.stream);
    expect(afterUruk.diagnostics).toEqual([]);
    expect(afterUruk.match!.players[uruk.actor].resources.gold).toBe(urukGold + 2);
    expect(afterUruk.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-payment', actorUid: uruk.actor, definitionId: 'uruk-hai-captain',
      options: ['pay-chronicle-cost', 'decline-chronicle-cost']
    });
    uruk.append(uruk.actor, 'choice/resolved', { choice: 'pay-chronicle-cost' });
    afterUruk = reduceGame(uruk.stream);
    expect(afterUruk.diagnostics).toEqual([]);
    expect(afterUruk.match!.players[uruk.actor].resources.gold).toBe(urukGold + 1);
    expect(afterUruk.match!.players[uruk.actor].companies.garrison).toBe(urukGarrison + Math.min(3, urukSupply));
    expect(afterUruk.match!.players[uruk.actor].companies.supply).toBe(urukSupply - Math.min(3, urukSupply));

    const envoy = reachAcquiredCard('envoy-dale');
    const envoyPlayer = envoy.before.match!.players[envoy.actor];
    const envoyGold = envoyPlayer.resources.gold;
    const envoyStanding = envoyPlayer.standing.dwarven;
    envoy.append(envoy.actor, 'agent/placed', { cardInstanceId: envoy.acquired.id, spaceId: 'dwarven-caravans' });
    let afterEnvoy = reduceGame(envoy.stream);
    expect(afterEnvoy.diagnostics).toEqual([]);
    expect(afterEnvoy.match!.players[envoy.actor].resources.gold).toBe(envoyGold + 2);
    expect(afterEnvoy.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-payment', actorUid: envoy.actor, definitionId: 'envoy-dale',
      options: ['pay-chronicle-cost', 'decline-chronicle-cost']
    });
    envoy.append(envoy.actor, 'choice/resolved', { choice: 'pay-chronicle-cost' });
    afterEnvoy = reduceGame(envoy.stream);
    expect(afterEnvoy.diagnostics).toEqual([]);
    expect(afterEnvoy.match!.players[envoy.actor].resources.gold).toBe(envoyGold);
    expect(afterEnvoy.match!.players[envoy.actor].standing.dwarven).toBe(Math.min(6, envoyStanding + 2));

    const ranger = reachAcquiredCard('ranger-north');
    const rangerHand = ranger.before.match!.players[ranger.actor].hand.length;
    ranger.append(ranger.actor, 'agent/placed', { cardInstanceId: ranger.acquired.id, spaceId: 'take-war-effort' });
    let afterRanger = reduceGame(ranger.stream);
    expect(afterRanger.diagnostics).toEqual([]);
    expect(afterRanger.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-card-choice', actorUid: ranger.actor, definitionId: 'ranger-north'
    });
    const rangerPending = afterRanger.match!.pendingChoice;
    if (rangerPending?.kind !== 'chronicle-card-choice') throw new Error('Ranger discard choice is required');
    const rangerPendingHand = afterRanger.match!.players[ranger.actor].hand.length;
    expect(rangerPendingHand).toBeGreaterThanOrEqual(rangerHand);
    const rangerDiscardId = rangerPending.cardInstanceIds[0];
    ranger.append(ranger.actor, 'choice/resolved', { choice: `discard-card:${rangerDiscardId}` });
    afterRanger = reduceGame(ranger.stream);
    expect(afterRanger.diagnostics).toEqual([]);
    expect(afterRanger.match!.players[ranger.actor].hand).toHaveLength(rangerPendingHand - 1);
    expect(afterRanger.match!.players[ranger.actor].discardPile).toContainEqual(
      expect.objectContaining({ id: rangerDiscardId })
    );

    const lore = reachAcquiredCard('lore-imladris');
    const loreHand = lore.before.match!.players[lore.actor].hand.length;
    const loreTrash = lore.before.match!.players[lore.actor].trashPile.length;
    lore.append(lore.actor, 'agent/placed', { cardInstanceId: lore.acquired.id, spaceId: 'hidden-counsel' });
    let afterLore = reduceGame(lore.stream);
    expect(afterLore.diagnostics).toEqual([]);
    expect(afterLore.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-card-choice', actorUid: lore.actor, definitionId: 'lore-imladris'
    });
    const lorePending = afterLore.match!.pendingChoice;
    if (lorePending?.kind !== 'chronicle-card-choice') throw new Error('Lore trash choice is required');
    const lorePendingHand = afterLore.match!.players[lore.actor].hand.length;
    expect(lorePendingHand).toBeGreaterThanOrEqual(loreHand - 1);
    const loreTrashId = lorePending.cardInstanceIds[0];
    lore.append(lore.actor, 'choice/resolved', { choice: `trash-card:${loreTrashId}` });
    afterLore = reduceGame(lore.stream);
    expect(afterLore.diagnostics).toEqual([]);
    expect(afterLore.match!.players[lore.actor].hand).toHaveLength(lorePendingHand - 1);
    expect(afterLore.match!.players[lore.actor].trashPile).toHaveLength(loreTrash + 1);

    const pilgrim = reachAcquiredCard('grey-pilgrim');
    const pilgrimTrash = pilgrim.before.match!.players[pilgrim.actor].trashPile.length;
    const chanceMeeting = pilgrim.before.match!.players[pilgrim.actor].fateHand.find((card) => card.definitionId === 'chance-meeting');
    expect(chanceMeeting).toBeDefined();
    pilgrim.append(pilgrim.actor, 'fate/played', { cardInstanceId: chanceMeeting!.id });
    const pilgrimDiscardChoice = reduceGame(pilgrim.stream).match!.pendingChoice;
    expect(pilgrimDiscardChoice).toMatchObject({ kind: 'plot-discard', actorUid: pilgrim.actor });
    const discardOption = pilgrimDiscardChoice!.options.find((option) => option !== `discard:${pilgrim.acquired.id}`)!;
    pilgrim.append(pilgrim.actor, 'choice/resolved', { choice: discardOption });
    pilgrim.append(pilgrim.actor, 'agent/placed', { cardInstanceId: pilgrim.acquired.id, spaceId: 'hall-fire' });
    let afterPilgrim = reduceGame(pilgrim.stream);
    expect(afterPilgrim.diagnostics).toEqual([]);
    expect(afterPilgrim.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-card-choice', actorUid: pilgrim.actor, definitionId: 'grey-pilgrim'
    });
    const pilgrimPending = afterPilgrim.match!.pendingChoice;
    if (pilgrimPending?.kind !== 'chronicle-card-choice') throw new Error('Pilgrim trash choice is required');
    const pilgrimPendingHand = afterPilgrim.match!.players[pilgrim.actor].hand.length;
    const pilgrimPendingDiscard = afterPilgrim.match!.players[pilgrim.actor].discardPile.length;
    expect(pilgrimPending.cardInstanceIds).toEqual([
      ...afterPilgrim.match!.players[pilgrim.actor].hand,
      ...afterPilgrim.match!.players[pilgrim.actor].discardPile
    ].map((card) => card.id));
    const pilgrimDiscardId = pilgrimPending.cardInstanceIds.find((id) =>
      afterPilgrim.match!.players[pilgrim.actor].discardPile.some((candidate) => candidate.id === id)
    );
    const pilgrimTrashId = pilgrimDiscardId ?? pilgrimPending.cardInstanceIds[0];
    expect(pilgrimTrashId).toBeDefined();
    const trashFromDiscard = Boolean(pilgrimDiscardId);
    pilgrim.append(pilgrim.actor, 'choice/resolved', { choice: `trash-card:${pilgrimTrashId}` });
    afterPilgrim = reduceGame(pilgrim.stream);
    expect(afterPilgrim.diagnostics).toEqual([]);
    expect(afterPilgrim.match!.players[pilgrim.actor].hand).toHaveLength(pilgrimPendingHand - (trashFromDiscard ? 0 : 1));
    expect(afterPilgrim.match!.players[pilgrim.actor].discardPile).toHaveLength(pilgrimPendingDiscard - (trashFromDiscard ? 1 : 0));
    expect(afterPilgrim.match!.players[pilgrim.actor].trashPile).toHaveLength(pilgrimTrash + 1);

    const rumor = reachAcquiredCard('whispered-rumor');
    rumor.append(rumor.actor, 'agent/placed', { cardInstanceId: rumor.acquired.id, spaceId: 'hidden-counsel' });
    let afterRumor = reduceGame(rumor.stream);
    expect(afterRumor.diagnostics).toEqual([]);
    expect(afterRumor.match!.pendingChoice).toMatchObject({ kind: 'place-scout', actorUid: rumor.actor });
    const rumorPost = OBSERVATION_POSTS.find((post) => !afterRumor.match!.boardScouts[post.id])!;
    rumor.append(rumor.actor, 'scout/placed', { postId: rumorPost.id });
    afterRumor = reduceGame(rumor.stream);
    expect(afterRumor.diagnostics).toEqual([]);
    expect(afterRumor.match!.boardScouts[rumorPost.id]).toBe(rumor.actor);

    const informer = reachAcquiredCard('goblin-informer');
    const informerGold = informer.before.match!.players[informer.actor].resources.gold;
    informer.append(informer.actor, 'agent/placed', { cardInstanceId: informer.acquired.id, spaceId: 'tribute-shadow' });
    const afterInformer = reduceGame(informer.stream);
    expect(afterInformer.diagnostics).toEqual([]);
    expect(afterInformer.match!.players[informer.actor].resources.gold).toBe(informerGold + 3);

    const orcish = reachAcquiredCard('orcish-muster');
    const orcishPlayer = orcish.before.match!.players[orcish.actor];
    const orcishGarrison = orcishPlayer.companies.garrison;
    const orcishSupply = orcishPlayer.companies.supply;
    const orcishShadow = orcishPlayer.standing.shadow;
    orcish.append(orcish.actor, 'agent/placed', { cardInstanceId: orcish.acquired.id, spaceId: 'tribute-shadow' });
    let afterOrcish = reduceGame(orcish.stream);
    expect(afterOrcish.diagnostics).toEqual([]);
    expect(afterOrcish.match!.players[orcish.actor].companies.garrison).toBe(orcishGarrison + Math.min(2, orcishSupply));
    expect(afterOrcish.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-standing-loss', actorUid: orcish.actor
    });
    const orcishBeforeIllegal = afterOrcish.match!.players[orcish.actor];
    orcish.append(orcish.actor, 'choice/resolved', { choice: 'lose-standing-not-a-faction' });
    const rejectedOrcish = reduceGame(orcish.stream);
    expect(rejectedOrcish.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedOrcish.match!.players[orcish.actor].standing).toEqual(orcishBeforeIllegal.standing);
    orcish.stream.pop();
    orcish.append(orcish.actor, 'choice/resolved', { choice: 'lose-standing-shadow' });
    afterOrcish = reduceGame(orcish.stream);
    expect(afterOrcish.diagnostics).toEqual([]);
    expect(afterOrcish.match!.players[orcish.actor].standing.shadow).toBe(orcishShadow);
    expect(afterOrcish.match!.pendingChoice).toBeNull();

    const moth = reachAcquiredCard('messenger-moth', 0, true);
    expect(moth.before.match!.boardScouts['old-south-road']).toBe(moth.actor);
    const mothHandBefore = moth.before.match!.players[moth.actor].hand.length;
    moth.append(moth.actor, 'agent/placed', { cardInstanceId: moth.acquired.id, spaceId: 'hidden-paths' });
    let afterMoth = reduceGame(moth.stream);
    expect(afterMoth.diagnostics).toEqual([]);
    expect(afterMoth.match!.pendingChoice).toMatchObject({ kind: 'place-scout', actorUid: moth.actor });
    moth.append(moth.actor, 'scout/placed', { postId: 'northern-eaves' });
    afterMoth = reduceGame(moth.stream);
    expect(afterMoth.diagnostics).toEqual([]);
    expect(afterMoth.match!.pendingChoice).toEqual({
      kind: 'chronicle-messenger-moth',
      actorUid: moth.actor,
      placedPostId: 'northern-eaves',
      postIds: ['old-south-road'],
      options: ['recall-moth:old-south-road', 'decline-moth-recall']
    });
    moth.append(moth.actor, 'choice/resolved', { choice: 'recall-moth:northern-eaves' });
    const rejectedMoth = reduceGame(moth.stream);
    expect(rejectedMoth.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedMoth.match!.boardScouts['northern-eaves']).toBe(moth.actor);
    moth.stream.pop();
    moth.append(moth.actor, 'choice/resolved', { choice: 'recall-moth:old-south-road' });
    afterMoth = reduceGame(moth.stream);
    expect(afterMoth.diagnostics).toEqual([]);
    expect(afterMoth.match!.boardScouts['old-south-road']).toBeUndefined();
    expect(afterMoth.match!.boardScouts['northern-eaves']).toBe(moth.actor);
    expect(afterMoth.match!.players[moth.actor].hand).toHaveLength(mothHandBefore + 1);
    expect(afterMoth.match!.pendingChoice).toMatchObject({ kind: 'battle-deployment', actorUid: moth.actor });
    expect(afterMoth.match!.queuedMessengerMothRecall).toBeNull();
    const legalMothChoice = moth.stream.at(-1)!;
    const declinedMoth = reduceGame([
      ...moth.stream.slice(0, -1),
      { ...legalMothChoice, payload: { choice: 'decline-moth-recall' } }
    ]);
    expect(declinedMoth.diagnostics).toEqual([]);
    expect(declinedMoth.match!.boardScouts['old-south-road']).toBe(moth.actor);
    expect(declinedMoth.match!.boardScouts['northern-eaves']).toBe(moth.actor);
    expect(declinedMoth.match!.players[moth.actor].hand).toHaveLength(mothHandBefore);
    expect(declinedMoth.match!.pendingChoice).toMatchObject({ kind: 'battle-deployment', actorUid: moth.actor });

    const foresight = reachAcquiredCard('elven-foresight', 0, false, 3, 101);
    const foresightTop = foresight.before.match!.players[foresight.actor].drawPile.slice(0, 3);
    expect(foresightTop).toHaveLength(3);
    foresight.append(foresight.actor, 'agent/placed', { cardInstanceId: foresight.acquired.id, spaceId: 'hall-fire' });
    let afterForesight = reduceGame(foresight.stream);
    expect(afterForesight.diagnostics).toEqual([]);
    expect(afterForesight.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-elven-foresight',
      actorUid: foresight.actor,
      cardInstanceIds: foresightTop.map((card) => card.id)
    });
    const foresightPending = afterForesight.match!.pendingChoice;
    if (foresightPending?.kind !== 'chronicle-elven-foresight') throw new Error('Elven Foresight ordering is required');
    expect(foresightPending.options).toHaveLength(6);
    const unauthorizedForesightActor = afterForesight.match!.playerOrder.find((uid) => uid !== foresight.actor)!;
    foresight.append(unauthorizedForesightActor, 'choice/resolved', { choice: foresightPending.options[0] });
    const unauthorizedForesight = reduceGame(foresight.stream);
    expect(unauthorizedForesight.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(unauthorizedForesight.match!.players[foresight.actor].drawPile.slice(0, 3)).toEqual(foresightTop);
    foresight.stream.pop();
    foresight.append(foresight.actor, 'choice/resolved', {
      choice: `order-draw:${foresightTop[0].id}|${foresightTop[0].id}|${foresightTop[2].id}`
    });
    const duplicateForesight = reduceGame(foresight.stream);
    expect(duplicateForesight.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(duplicateForesight.match!.players[foresight.actor].drawPile.slice(0, 3)).toEqual(foresightTop);
    foresight.stream.pop();
    const reversedForesight = [...foresightTop].reverse();
    foresight.append(foresight.actor, 'choice/resolved', {
      choice: `order-draw:${reversedForesight.map((card) => card.id).join('|')}`
    });
    afterForesight = reduceGame(foresight.stream);
    expect(afterForesight.diagnostics).toEqual([]);
    expect(afterForesight.match!.players[foresight.actor].drawPile.slice(0, 3)).toEqual(reversedForesight);
    expect(afterForesight.match!.pendingChoice).toBeNull();
    expect(afterForesight.match!.activity.at(-1)).toContain('returns the cards seen by Elven Foresight');

    const khazad = reachAcquiredCard('khazad-guard');
    const khazadPlayer = khazad.before.match!.players[khazad.actor];
    const khazadMithril = khazadPlayer.resources.mithril;
    const khazadGarrison = khazadPlayer.companies.garrison;
    const khazadSupply = khazadPlayer.companies.supply;
    const khazadFresh = khazadPlayer.recruitedThisRound;
    const minasRecruit = Math.min(1, khazadSupply);
    const garrisonAfterMinas = khazadGarrison + minasRecruit;
    const freshAfterMinas = Math.min(khazadFresh + minasRecruit, garrisonAfterMinas);
    const existingAfterMinas = garrisonAfterMinas - freshAfterMinas;
    const expectedKhazadMaximum = freshAfterMinas + Math.min(3, existingAfterMinas);
    khazad.append(khazad.actor, 'agent/placed', { cardInstanceId: khazad.acquired.id, spaceId: 'minas-tirith' });
    let afterKhazad = reduceGame(khazad.stream);
    expect(afterKhazad.diagnostics).toEqual([]);
    expect(afterKhazad.match!.players[khazad.actor].resources.mithril).toBe(khazadMithril + 1);
    expect(afterKhazad.match!.players[khazad.actor].companies.garrison).toBe(garrisonAfterMinas);
    expect(afterKhazad.match!.pendingChoice).toMatchObject({
      kind: 'battle-deployment',
      actorUid: khazad.actor,
      maximum: expectedKhazadMaximum,
      additionalGarrisonAllowance: 1
    });
    khazad.append(khazad.actor, 'choice/resolved', { choice: `deploy:${expectedKhazadMaximum + 1}` });
    const rejectedKhazad = reduceGame(khazad.stream);
    expect(rejectedKhazad.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedKhazad.match!.players[khazad.actor].companies.garrison).toBe(garrisonAfterMinas);
    expect(rejectedKhazad.match!.battleCompanies[khazad.actor] ?? 0).toBe(0);
    khazad.stream.pop();
    khazad.append(khazad.actor, 'choice/resolved', { choice: `deploy:${expectedKhazadMaximum}` });
    afterKhazad = reduceGame(khazad.stream);
    expect(afterKhazad.diagnostics).toEqual([]);
    expect(afterKhazad.match!.players[khazad.actor].companies.garrison).toBe(garrisonAfterMinas - expectedKhazadMaximum);
    expect(afterKhazad.match!.battleCompanies[khazad.actor]).toBe(expectedKhazadMaximum);
    expect(afterKhazad.match!.pendingChoice).toBeNull();

    const warden = reachAcquiredCard('warden-ithilien', 0, true, 0, 0, 3);
    const wardenScoutSupply = warden.before.match!.players[warden.actor].scouts.supply;
    expect(wardenScoutSupply).toBe(0);
    const wardenPostsBefore = structuredClone(warden.before.match!.boardScouts);
    const recalledPostId = OBSERVATION_POSTS.find((post) => wardenPostsBefore[post.id] === warden.actor)!.id;
    warden.append(warden.actor, 'agent/placed', { cardInstanceId: warden.acquired.id, spaceId: 'hidden-paths' });
    let afterWarden = reduceGame(warden.stream);
    expect(afterWarden.diagnostics).toEqual([]);
    expect(afterWarden.match!.pendingChoice).toMatchObject({
      kind: 'place-scout',
      actorUid: warden.actor,
      allowedPostIds: ['redhorn-pass', 'last-homely-house', 'northern-eaves', 'muster-field', 'old-south-road', 'banks-entwash', 'seeing-stone-road']
    });
    expect(afterWarden.match!.queuedScoutPlacementRestriction).toBeNull();
    const unauthorizedWardenActor = afterWarden.match!.playerOrder.find((uid) => uid !== warden.actor)!;
    warden.append(unauthorizedWardenActor, 'scout/placed', { postId: 'muster-field', recallPostId: recalledPostId });
    const unauthorizedWarden = reduceGame(warden.stream);
    expect(unauthorizedWarden.diagnostics.at(-1)).toContain('illegal Scout placement');
    expect(unauthorizedWarden.match!.boardScouts).toEqual(wardenPostsBefore);
    warden.stream.pop();
    warden.append(warden.actor, 'scout/placed', { postId: 'council-antechamber', recallPostId: recalledPostId });
    const rejectedWarden = reduceGame(warden.stream);
    expect(rejectedWarden.diagnostics.at(-1)).toContain('illegal Scout placement');
    expect(rejectedWarden.match!.boardScouts).toEqual(wardenPostsBefore);
    expect(rejectedWarden.match!.players[warden.actor].scouts.supply).toBe(0);
    warden.stream.pop();
    warden.append(warden.actor, 'scout/placed', { postId: 'muster-field', recallPostId: recalledPostId });
    afterWarden = reduceGame(warden.stream);
    expect(afterWarden.diagnostics).toEqual([]);
    expect(afterWarden.match!.boardScouts[recalledPostId]).toBeUndefined();
    expect(afterWarden.match!.boardScouts['muster-field']).toBe(warden.actor);
    expect(afterWarden.match!.players[warden.actor].scouts.supply).toBe(0);
    expect(afterWarden.match!.pendingChoice).toMatchObject({ kind: 'battle-deployment', actorUid: warden.actor });

    const rangerWarden = reachAcquiredCard('warden-ithilien');
    rangerWarden.append(rangerWarden.actor, 'agent/placed', {
      cardInstanceId: rangerWarden.acquired.id,
      spaceId: 'ranger-mustering'
    });
    let afterRangerWarden = reduceGame(rangerWarden.stream);
    expect(afterRangerWarden.diagnostics).toEqual([]);
    expect(afterRangerWarden.match!.pendingChoice).toMatchObject({
      kind: 'ranger-mustering-trash',
      actorUid: rangerWarden.actor,
      followupPlaceScout: true
    });
    expect(afterRangerWarden.match!.queuedScoutPlacementRestriction).toMatchObject({ actorUid: rangerWarden.actor });
    rangerWarden.append(rangerWarden.actor, 'choice/resolved', { choice: 'decline-trash' });
    afterRangerWarden = reduceGame(rangerWarden.stream);
    expect(afterRangerWarden.diagnostics).toEqual([]);
    expect(afterRangerWarden.match!.pendingChoice).toMatchObject({
      kind: 'place-scout',
      actorUid: rangerWarden.actor,
      allowedPostIds: expect.not.arrayContaining(['orthanc-eye', 'council-antechamber'])
    });
    rangerWarden.append(rangerWarden.actor, 'scout/placed', { postId: 'redhorn-pass' });
    afterRangerWarden = reduceGame(rangerWarden.stream);
    expect(afterRangerWarden.diagnostics).toEqual([]);
    expect(afterRangerWarden.match!.boardScouts['redhorn-pass']).toBe(rangerWarden.actor);
    expect(afterRangerWarden.match!.pendingChoice).toMatchObject({ kind: 'battle-deployment', actorUid: rangerWarden.actor });

    const unaffordablePalantir = reachAcquiredCard('palantir-glimpse');
    expect(unaffordablePalantir.before.match!.players[unaffordablePalantir.actor].resources.mithril).toBe(0);
    const unaffordableSpace = legalAgentSpaces(
      unaffordablePalantir.before,
      unaffordablePalantir.actor,
      unaffordablePalantir.acquired.id
    ).find((spaceId) => spaceId === 'tribute-shadow' || spaceId === 'hidden-counsel');
    expect(unaffordableSpace).toBeDefined();
    unaffordablePalantir.append(unaffordablePalantir.actor, 'agent/placed', {
      cardInstanceId: unaffordablePalantir.acquired.id,
      spaceId: unaffordableSpace!
    });
    let afterUnaffordablePalantir = reduceGame(unaffordablePalantir.stream);
    expect(afterUnaffordablePalantir.diagnostics).toEqual([]);
    expect(afterUnaffordablePalantir.match!.pendingChoice).toEqual({
      kind: 'chronicle-payment',
      actorUid: unaffordablePalantir.actor,
      definitionId: 'palantir-glimpse',
      options: ['decline-chronicle-cost']
    });
    const unaffordableHand = structuredClone(afterUnaffordablePalantir.match!.players[unaffordablePalantir.actor].hand);
    const unaffordableDrawPile = structuredClone(afterUnaffordablePalantir.match!.players[unaffordablePalantir.actor].drawPile);
    unaffordablePalantir.append(unaffordablePalantir.actor, 'choice/resolved', { choice: 'pay-chronicle-cost' });
    const rejectedUnaffordablePalantir = reduceGame(unaffordablePalantir.stream);
    expect(rejectedUnaffordablePalantir.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedUnaffordablePalantir.match!.players[unaffordablePalantir.actor].resources.mithril).toBe(0);
    expect(rejectedUnaffordablePalantir.match!.players[unaffordablePalantir.actor].hand).toEqual(unaffordableHand);
    expect(rejectedUnaffordablePalantir.match!.players[unaffordablePalantir.actor].drawPile).toEqual(unaffordableDrawPile);
    unaffordablePalantir.stream.pop();
    unaffordablePalantir.append(unaffordablePalantir.actor, 'choice/resolved', { choice: 'decline-chronicle-cost' });
    afterUnaffordablePalantir = reduceGame(unaffordablePalantir.stream);
    expect(afterUnaffordablePalantir.diagnostics).toEqual([]);
    expect(afterUnaffordablePalantir.match!.pendingChoice).toBeNull();

    const palantir = reachAcquiredCard('palantir-glimpse', 0, false, 2, 0, 0, 1);
    const palantirPlayer = palantir.before.match!.players[palantir.actor];
    const palantirMithril = palantirPlayer.resources.mithril;
    const palantirHand = palantirPlayer.hand.length;
    const palantirDrawPile = palantirPlayer.drawPile.length;
    const palantirSpace = legalAgentSpaces(palantir.before, palantir.actor, palantir.acquired.id)
      .find((spaceId) => spaceId === 'tribute-shadow' || spaceId === 'hidden-counsel');
    expect(palantirSpace).toBeDefined();
    palantir.append(palantir.actor, 'agent/placed', {
      cardInstanceId: palantir.acquired.id,
      spaceId: palantirSpace!
    });
    let afterPalantir = reduceGame(palantir.stream);
    expect(afterPalantir.diagnostics).toEqual([]);
    if (afterPalantir.match!.pendingChoice?.kind === 'gather-intelligence') {
      expect(afterPalantir.match!.pendingChoice.actorUid).toBe(palantir.actor);
      palantir.append(palantir.actor, 'choice/resolved', { choice: 'decline-intelligence' });
      afterPalantir = reduceGame(palantir.stream);
      expect(afterPalantir.diagnostics).toEqual([]);
    }
    expect(afterPalantir.match!.pendingChoice).toEqual({
      kind: 'chronicle-payment',
      actorUid: palantir.actor,
      definitionId: 'palantir-glimpse',
      options: ['pay-chronicle-cost', 'decline-chronicle-cost']
    });
    expect(afterPalantir.match!.players[palantir.actor].resources.mithril).toBe(palantirMithril);
    const unauthorizedPalantirActor = afterPalantir.match!.playerOrder.find((uid) => uid !== palantir.actor)!;
    palantir.append(unauthorizedPalantirActor, 'choice/resolved', { choice: 'pay-chronicle-cost' });
    const unauthorizedPalantir = reduceGame(palantir.stream);
    expect(unauthorizedPalantir.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(unauthorizedPalantir.match!.players[palantir.actor].resources.mithril).toBe(palantirMithril);
    expect(unauthorizedPalantir.match!.players[palantir.actor].hand).toHaveLength(palantirHand - 1);
    palantir.stream.pop();
    palantir.append(palantir.actor, 'choice/resolved', { choice: 'pay-chronicle-cost' });
    afterPalantir = reduceGame(palantir.stream);
    expect(afterPalantir.diagnostics).toEqual([]);
    expect(afterPalantir.match!.players[palantir.actor].resources.mithril).toBe(palantirMithril - 1);
    expect(afterPalantir.match!.players[palantir.actor].drawPile).toHaveLength(palantirDrawPile - 2);
    expect(afterPalantir.match!.players[palantir.actor].hand).toHaveLength(palantirHand + 1);
    expect(afterPalantir.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-card-choice',
      actorUid: palantir.actor,
      definitionId: 'palantir-glimpse'
    });
    const palantirPending = afterPalantir.match!.pendingChoice;
    if (palantirPending?.kind !== 'chronicle-card-choice') throw new Error('Palantír discard choice is required');
    expect(palantirPending.options).toEqual(palantirPending.cardInstanceIds.map((id) => `discard-card:${id}`));
    const pendingPalantirHand = structuredClone(afterPalantir.match!.players[palantir.actor].hand);
    palantir.append(palantir.actor, 'choice/resolved', { choice: `trash-card:${palantirPending.cardInstanceIds[0]}` });
    const rejectedPalantirDiscard = reduceGame(palantir.stream);
    expect(rejectedPalantirDiscard.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedPalantirDiscard.match!.players[palantir.actor].hand).toEqual(pendingPalantirHand);
    palantir.stream.pop();
    const palantirDiscardId = palantirPending.cardInstanceIds[0];
    palantir.append(palantir.actor, 'choice/resolved', { choice: `discard-card:${palantirDiscardId}` });
    afterPalantir = reduceGame(palantir.stream);
    expect(afterPalantir.diagnostics).toEqual([]);
    expect(afterPalantir.match!.players[palantir.actor].hand).toHaveLength(palantirHand);
    expect(afterPalantir.match!.players[palantir.actor].discardPile).toContainEqual(
      expect.objectContaining({ id: palantirDiscardId })
    );
    expect(afterPalantir.match!.pendingChoice).toBeNull();

    const palantirMuster = reachAcquiredCard('palantir-glimpse');
    const palantirMusterPlayer = palantirMuster.before.match!.players[palantirMuster.actor];
    const palantirFateBefore = palantirMusterPlayer.fateHand.length;
    const palantirFateDeckBefore = palantirMuster.before.match!.fateDeck.length;
    const palantirPrintedInfluence = palantirMusterPlayer.hand.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.influence ?? 0), 0
    );
    palantirMuster.append(palantirMuster.actor, 'turn/revealed', {});
    const afterPalantirMuster = reduceGame(palantirMuster.stream);
    expect(afterPalantirMuster.diagnostics).toEqual([]);
    expect(afterPalantirMuster.match!.players[palantirMuster.actor].revealInfluence).toBe(palantirPrintedInfluence);
    expect(afterPalantirMuster.match!.players[palantirMuster.actor].fateHand).toHaveLength(palantirFateBefore + 1);
    expect(afterPalantirMuster.match!.fateDeck).toHaveLength(palantirFateDeckBefore - 1);
    expect(afterPalantirMuster.match!.activity.at(-1)).toContain('privately draws 1 Fate with 1 Palantír Glimpse');

    const paths = reachAcquiredCard('paths-dead', 0, true);
    const pathsPlayer = paths.before.match!.players[paths.actor];
    expect(pathsPlayer.resources.provisions).toBeLessThan(3);
    expect(paths.before.match!.boardScouts['old-south-road']).toBe(paths.actor);
    expect(legalAgentSpaces(paths.before, paths.actor, paths.acquired.id)).toContain('deep-fangorn');
    const ordinaryLegalityState = structuredClone(paths.before);
    const ordinaryRoadCard = { id: 'test:ordinary-open-road', definitionId: 'the-open-road' };
    ordinaryLegalityState.match!.players[paths.actor].hand.push(ordinaryRoadCard);
    expect(AGENT_CARD_DEFINITIONS.find((definition) => definition.id === ordinaryRoadCard.definitionId)?.placementIcons).toContain('Roads');
    expect(legalAgentSpaces(ordinaryLegalityState, paths.actor, ordinaryRoadCard.id)).not.toContain('deep-fangorn');
    expect(pathsPlayer.standing.dwarven).toBeLessThan(2);
    expect(legalAgentSpaces(paths.before, paths.actor, paths.acquired.id)).not.toContain('great-forge');
    const pathsProvisions = pathsPlayer.resources.provisions;
    const pathsScoutSupply = pathsPlayer.scouts.supply;
    paths.append(paths.actor, 'agent/placed', { cardInstanceId: paths.acquired.id, spaceId: 'deep-fangorn' });
    let awaitingPaths = reduceGame(paths.stream);
    expect(awaitingPaths.diagnostics).toEqual([]);
    expect(awaitingPaths.match!.pendingChoice).toEqual({
      kind: 'chronicle-paths-cost',
      actorUid: paths.actor,
      cardInstanceId: paths.acquired.id,
      spaceId: 'deep-fangorn',
      postIds: ['old-south-road'],
      costResource: 'Provision',
      costAmount: 3,
      options: ['recall-paths:old-south-road']
    });
    const unauthorizedPathsActor = awaitingPaths.match!.playerOrder.find((uid) => uid !== paths.actor)!;
    paths.append(unauthorizedPathsActor, 'choice/resolved', { choice: 'recall-paths:old-south-road' });
    const unauthorizedPaths = reduceGame(paths.stream);
    expect(unauthorizedPaths.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(unauthorizedPaths.match!.boardScouts['old-south-road']).toBe(paths.actor);
    expect(unauthorizedPaths.match!.players[paths.actor].resources.provisions).toBe(pathsProvisions);
    paths.stream.pop();
    paths.append(paths.actor, 'choice/resolved', { choice: 'recall-paths:forged-post' });
    const forgedPaths = reduceGame(paths.stream);
    expect(forgedPaths.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(forgedPaths.match!.boardScouts['old-south-road']).toBe(paths.actor);
    paths.stream.pop();
    paths.append(paths.actor, 'choice/resolved', { choice: 'recall-paths:old-south-road' });
    awaitingPaths = reduceGame(paths.stream);
    expect(awaitingPaths.diagnostics).toEqual([]);
    expect(awaitingPaths.match!.players[paths.actor].resources.provisions).toBe(pathsProvisions);
    expect(awaitingPaths.match!.players[paths.actor].scouts.supply).toBe(pathsScoutSupply + 1);
    expect(awaitingPaths.match!.players[paths.actor].scoutsRecalledThisRound).toBe(1);
    expect(awaitingPaths.match!.boardScouts['old-south-road']).toBeUndefined();
    expect(awaitingPaths.match!.pendingChoice).toMatchObject({ kind: 'deep-fangorn', actorUid: paths.actor });
    expect(awaitingPaths.match!.activity).toContainEqual(expect.stringContaining('ignores 3 Provision'));
    paths.append(paths.actor, 'choice/resolved', { choice: 'gain-4-mithril' });
    const pathsDeployment = reduceGame(paths.stream);
    expect(pathsDeployment.diagnostics).toEqual([]);
    expect(pathsDeployment.match!.pendingChoice).toMatchObject({ kind: 'battle-deployment', actorUid: paths.actor });
    expect(pathsDeployment.match!.activity).toContainEqual(expect.stringContaining('ignoring the 3 Provisions cost through the Paths of the Dead'));

    const paidPaths = reachAcquiredCard('paths-dead', 0, true);
    const paidPathsPlayer = paidPaths.before.match!.players[paidPaths.actor];
    expect(paidPathsPlayer.resources.provisions).toBeGreaterThanOrEqual(1);
    const paidPathsProvisions = paidPathsPlayer.resources.provisions;
    paidPaths.append(paidPaths.actor, 'agent/placed', { cardInstanceId: paidPaths.acquired.id, spaceId: 'entwash' });
    let awaitingPaidPaths = reduceGame(paidPaths.stream);
    expect(awaitingPaidPaths.diagnostics).toEqual([]);
    expect(awaitingPaidPaths.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-paths-cost',
      actorUid: paidPaths.actor,
      options: ['pay-space-cost', 'recall-paths:old-south-road']
    });
    paidPaths.append(paidPaths.actor, 'choice/resolved', { choice: 'pay-space-cost' });
    awaitingPaidPaths = reduceGame(paidPaths.stream);
    expect(awaitingPaidPaths.diagnostics).toEqual([]);
    expect(awaitingPaidPaths.match!.players[paidPaths.actor].resources.provisions).toBe(paidPathsProvisions - 1);
    expect(awaitingPaidPaths.match!.players[paidPaths.actor].scoutsRecalledThisRound).toBe(0);
    expect(awaitingPaidPaths.match!.boardScouts['old-south-road']).toBe(paidPaths.actor);
    expect(awaitingPaidPaths.match!.pendingChoice).toMatchObject({ kind: 'entwash', actorUid: paidPaths.actor });

    const freePaths = reachAcquiredCard('paths-dead', 0, true);
    const freePathsResources = structuredClone(freePaths.before.match!.players[freePaths.actor].resources);
    const freePathsSpace = legalAgentSpaces(freePaths.before, freePaths.actor, freePaths.acquired.id)
      .find((spaceId) => ['take-war-effort', 'osgiliath', 'edoras'].includes(spaceId));
    expect(freePathsSpace).toBeDefined();
    freePaths.append(freePaths.actor, 'agent/placed', { cardInstanceId: freePaths.acquired.id, spaceId: freePathsSpace! });
    const afterFreePaths = reduceGame(freePaths.stream);
    expect(afterFreePaths.diagnostics).toEqual([]);
    expect(afterFreePaths.match!.pendingChoice).toMatchObject({
      kind: 'gather-intelligence',
      actorUid: freePaths.actor,
      ignoredResourceCost: false
    });
    expect(afterFreePaths.match!.players[freePaths.actor].resources.provisions).toBe(freePathsResources.provisions);
    expect(afterFreePaths.match!.players[freePaths.actor].resources.mithril).toBe(freePathsResources.mithril);

    const masterJourney = reachAcquiredCard('master-lake-town');
    const masterJourneyPlayer = masterJourney.before.match!.players[masterJourney.actor];
    const masterGoldBefore = masterJourneyPlayer.resources.gold;
    expect(legalAgentSpaces(masterJourney.before, masterJourney.actor, masterJourney.acquired.id)).toContain('hall-fire');
    masterJourney.append(masterJourney.actor, 'agent/placed', {
      cardInstanceId: masterJourney.acquired.id,
      spaceId: 'hall-fire'
    });
    const afterMasterJourney = reduceGame(masterJourney.stream);
    expect(afterMasterJourney.diagnostics).toEqual([]);
    expect(afterMasterJourney.match!.players[masterJourney.actor].resources.gold).toBe(masterGoldBefore + 3);
    expect(afterMasterJourney.match!.players[masterJourney.actor].journey).toContainEqual(masterJourney.acquired);
    expect(afterMasterJourney.match!.pendingChoice).toBeNull();

    const nazgulJourney = reachAcquiredCard('lord-nazgul');
    const nazgulPlayer = nazgulJourney.before.match!.players[nazgulJourney.actor];
    const nazgulFateBefore = nazgulPlayer.fateHand.length;
    const nazgulFateDeckBefore = nazgulJourney.before.match!.fateDeck.length;
    const nazgulGarrisonBefore = nazgulPlayer.companies.garrison;
    const nazgulSupplyBefore = nazgulPlayer.companies.supply;
    expect(legalAgentSpaces(nazgulJourney.before, nazgulJourney.actor, nazgulJourney.acquired.id)).toContain('tribute-shadow');
    nazgulJourney.append(nazgulJourney.actor, 'agent/placed', {
      cardInstanceId: nazgulJourney.acquired.id,
      spaceId: 'tribute-shadow'
    });
    const afterNazgulJourney = reduceGame(nazgulJourney.stream);
    expect(afterNazgulJourney.diagnostics).toEqual([]);
    expect(afterNazgulJourney.match!.players[nazgulJourney.actor].fateHand).toHaveLength(nazgulFateBefore + 1);
    expect(afterNazgulJourney.match!.fateDeck).toHaveLength(nazgulFateDeckBefore - 1);
    expect(afterNazgulJourney.match!.players[nazgulJourney.actor].companies.garrison).toBe(nazgulGarrisonBefore + Math.min(2, nazgulSupplyBefore));
    expect(afterNazgulJourney.match!.players[nazgulJourney.actor].companies.supply).toBe(nazgulSupplyBefore - Math.min(2, nazgulSupplyBefore));
    expect(afterNazgulJourney.match!.players[nazgulJourney.actor].journey).toContainEqual(nazgulJourney.acquired);
    expect(afterNazgulJourney.match!.pendingChoice).toBeNull();

    const masterMuster = reachAcquiredCard('master-lake-town');
    let beforeMasterMuster = masterMuster.before;
    if (beforeMasterMuster.match!.players[masterMuster.actor].resources.gold < 2) {
      const fundingCard = beforeMasterMuster.match!.players[masterMuster.actor].hand.find((card) =>
        card.definitionId === 'the-open-road' && legalAgentSpaces(beforeMasterMuster, masterMuster.actor, card.id).includes('take-war-effort')
      );
      expect(fundingCard).toBeDefined();
      masterMuster.append(masterMuster.actor, 'agent/placed', {
        cardInstanceId: fundingCard!.id,
        spaceId: 'take-war-effort'
      });
      beforeMasterMuster = reduceGame(masterMuster.stream);
      while (currentPlayerUid(beforeMasterMuster) !== masterMuster.actor) {
        const current = currentPlayerUid(beforeMasterMuster)!;
        masterMuster.append(current, 'turn/revealed', {});
        masterMuster.append(current, 'reveal/finished', {});
        beforeMasterMuster = reduceGame(masterMuster.stream);
      }
    }
    const masterMusterPlayer = beforeMasterMuster.match!.players[masterMuster.actor];
    const masterMusterGold = masterMusterPlayer.resources.gold;
    const masterMusterFate = masterMusterPlayer.fateHand.length;
    const masterMusterFateDeck = beforeMasterMuster.match!.fateDeck.length;
    const masterPrintedInfluence = masterMusterPlayer.hand.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.influence ?? 0), 0
    );
    masterMuster.append(masterMuster.actor, 'turn/revealed', {});
    let afterMasterMuster = reduceGame(masterMuster.stream);
    expect(afterMasterMuster.diagnostics).toEqual([]);
    expect(afterMasterMuster.match!.players[masterMuster.actor].revealInfluence).toBe(masterPrintedInfluence);
    expect(afterMasterMuster.match!.pendingChoice).toEqual({
      kind: 'chronicle-muster-fate',
      actorUid: masterMuster.actor,
      cardInstanceId: masterMuster.acquired.id,
      remainingCardInstanceIds: [],
      options: ['pay-master-fate', 'decline-master-fate']
    });
    const unauthorizedMasterActor = afterMasterMuster.match!.playerOrder.find((uid) => uid !== masterMuster.actor)!;
    masterMuster.append(unauthorizedMasterActor, 'choice/resolved', { choice: 'pay-master-fate' });
    const unauthorizedMaster = reduceGame(masterMuster.stream);
    expect(unauthorizedMaster.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(unauthorizedMaster.match!.players[masterMuster.actor].resources.gold).toBe(masterMusterGold);
    expect(unauthorizedMaster.match!.players[masterMuster.actor].fateHand).toHaveLength(masterMusterFate);
    masterMuster.stream.pop();
    masterMuster.append(masterMuster.actor, 'choice/resolved', { choice: 'pay-master-fate' });
    afterMasterMuster = reduceGame(masterMuster.stream);
    expect(afterMasterMuster.diagnostics).toEqual([]);
    expect(afterMasterMuster.match!.players[masterMuster.actor].resources.gold).toBe(masterMusterGold - 2);
    expect(afterMasterMuster.match!.players[masterMuster.actor].fateHand).toHaveLength(masterMusterFate + 1);
    expect(afterMasterMuster.match!.fateDeck).toHaveLength(masterMusterFateDeck - 1);
    expect(afterMasterMuster.match!.pendingChoice).toBeNull();
    expect(afterMasterMuster.match!.activity.at(-1)).toContain('pays 2 Gold and privately draws 1 Fate with Master of Lake-town');

    const declinedMaster = reachAcquiredCard('master-lake-town');
    const declinedMasterPlayer = declinedMaster.before.match!.players[declinedMaster.actor];
    const declinedMasterGold = declinedMasterPlayer.resources.gold;
    const declinedMasterFate = declinedMasterPlayer.fateHand.length;
    expect(declinedMasterGold).toBeLessThan(2);
    declinedMaster.append(declinedMaster.actor, 'turn/revealed', {});
    const awaitingDeclinedMaster = reduceGame(declinedMaster.stream);
    expect(awaitingDeclinedMaster.diagnostics).toEqual([]);
    expect(awaitingDeclinedMaster.match!.pendingChoice).toEqual({
      kind: 'chronicle-muster-fate',
      actorUid: declinedMaster.actor,
      cardInstanceId: declinedMaster.acquired.id,
      remainingCardInstanceIds: [],
      options: ['decline-master-fate']
    });
    declinedMaster.append(declinedMaster.actor, 'choice/resolved', { choice: 'pay-master-fate' });
    const rejectedDeclinedMaster = reduceGame(declinedMaster.stream);
    expect(rejectedDeclinedMaster.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedDeclinedMaster.match!.players[declinedMaster.actor].resources.gold).toBe(declinedMasterGold);
    expect(rejectedDeclinedMaster.match!.players[declinedMaster.actor].fateHand).toHaveLength(declinedMasterFate);
    declinedMaster.stream.pop();
    declinedMaster.append(declinedMaster.actor, 'choice/resolved', { choice: 'decline-master-fate' });
    const afterDeclinedMaster = reduceGame(declinedMaster.stream);
    expect(afterDeclinedMaster.diagnostics).toEqual([]);
    expect(afterDeclinedMaster.match!.players[declinedMaster.actor].resources.gold).toBe(declinedMasterGold);
    expect(afterDeclinedMaster.match!.players[declinedMaster.actor].fateHand).toHaveLength(declinedMasterFate);
    expect(afterDeclinedMaster.match!.pendingChoice).toBeNull();

    const informerMuster = reachAcquiredCard('goblin-informer', 0, true);
    const informerScout = reduceGame(informerMuster.stream);
    expect(informerScout.match!.boardScouts['old-south-road']).toBe(informerMuster.actor);
    informerMuster.append(informerMuster.actor, 'turn/revealed', {});
    const awaitingInformer = reduceGame(informerMuster.stream);
    expect(awaitingInformer.diagnostics).toEqual([]);
    expect(awaitingInformer.match!.pendingChoice).toMatchObject({
      kind: 'chronicle-muster-scout',
      actorUid: informerMuster.actor,
      postIds: ['old-south-road']
    });
    const swordsBeforeRecall = awaitingInformer.match!.players[informerMuster.actor].revealedSwords;
    informerMuster.append(informerMuster.actor, 'choice/resolved', { choice: 'recall-scout:old-south-road' });
    const recalledInformer = reduceGame(informerMuster.stream);
    expect(recalledInformer.diagnostics).toEqual([]);
    expect(recalledInformer.match!.pendingChoice).toBeNull();
    expect(recalledInformer.match!.players[informerMuster.actor].revealedSwords).toBe(swordsBeforeRecall + 1);
    expect(recalledInformer.match!.players[informerMuster.actor].scoutsRecalledThisRound).toBe(1);
    expect(recalledInformer.match!.boardScouts['old-south-road']).toBeUndefined();

    const rumorMuster = reachAcquiredCard('whispered-rumor', 0, true);
    const rumorBeforeRecall = reduceGame(rumorMuster.stream);
    const connectedRoadSpaces = ['take-war-effort', 'osgiliath', 'edoras'];
    const recallCard = rumorBeforeRecall.match!.players[rumorMuster.actor].hand.find((card) =>
      card.id !== rumorMuster.acquired.id && legalAgentSpaces(rumorBeforeRecall, rumorMuster.actor, card.id)
        .some((spaceId) => connectedRoadSpaces.includes(spaceId))
    );
    expect(recallCard, 'the deterministic Rumor proof must retain a card connected to its Scout').toBeDefined();
    const recallSpace = legalAgentSpaces(rumorBeforeRecall, rumorMuster.actor, recallCard!.id)
      .find((spaceId) => connectedRoadSpaces.includes(spaceId))!;
    rumorMuster.append(rumorMuster.actor, 'agent/placed', {
      cardInstanceId: recallCard!.id,
      spaceId: recallSpace
    });
    const rumorGather = reduceGame(rumorMuster.stream);
    expect(rumorGather.match!.pendingChoice).toMatchObject({
      kind: 'gather-intelligence',
      actorUid: rumorMuster.actor,
      postIds: ['old-south-road']
    });
    rumorMuster.append(rumorMuster.actor, 'choice/resolved', { choice: 'recall:old-south-road' });
    let rumorRecalled = reduceGame(rumorMuster.stream);
    while (rumorRecalled.match!.pendingChoice?.actorUid === rumorMuster.actor) {
      const pending = rumorRecalled.match!.pendingChoice;
      const continuation = pending.kind === 'osgiliath'
        ? 'pay-0-mithril'
        : pending.kind === 'battle-deployment'
          ? 'deploy:0'
          : null;
      if (!continuation) break;
      rumorMuster.append(rumorMuster.actor, 'choice/resolved', { choice: continuation });
      rumorRecalled = reduceGame(rumorMuster.stream);
    }
    while (currentPlayerUid(rumorRecalled) !== rumorMuster.actor) {
      const current = currentPlayerUid(rumorRecalled)!;
      rumorMuster.append(current, 'turn/revealed', {});
      rumorMuster.append(current, 'reveal/finished', {});
      rumorRecalled = reduceGame(rumorMuster.stream);
    }
    const printedRumorInfluence = rumorRecalled.match!.players[rumorMuster.actor].hand.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.influence ?? 0), 0
    );
    rumorMuster.append(rumorMuster.actor, 'turn/revealed', {});
    const rumorRevealed = reduceGame(rumorMuster.stream);
    expect(rumorRevealed.diagnostics).toEqual([]);
    expect(rumorRevealed.match!.players[rumorMuster.actor].scoutsRecalledThisRound).toBe(1);
    expect(rumorRevealed.match!.players[rumorMuster.actor].revealInfluence).toBe(printedRumorInfluence + 1);

    const economyMuster = {
      'stewards-messenger': { influence: 2, swords: 0 },
      'delving-expedition': { influence: 1, swords: 1 },
      'durins-heir': { influence: 2, swords: 2 },
      'voice-orthanc': { influence: 3, swords: 0 },
      'dwarven-smith': { influence: 2, swords: 0 },
      'uruk-hai-captain': { influence: 0, swords: 3 },
      'envoy-dale': { influence: 2, swords: 0 },
      'ranger-north': { influence: 1, swords: 1 },
      'lore-imladris': { influence: 2, swords: 0 },
      'grey-pilgrim': { influence: 4, swords: 1 },
      'whispered-rumor': { influence: 1, swords: 0 },
      'goblin-informer': { influence: 0, swords: 1 },
      'orcish-muster': { influence: 0, swords: 2 },
      'elven-foresight': { influence: 3, swords: 0 },
      'palantir-glimpse': { influence: 2, swords: 0 },
      'paths-dead': { influence: 1, swords: 2 },
      'master-lake-town': { influence: 3, swords: 0 },
      'lord-nazgul': { influence: 2, swords: 4 }
    } as const;
    for (const [definitionId, printed] of Object.entries(economyMuster)) {
      expect(MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === definitionId)?.muster).toEqual(printed);
      const mustered = reachAcquiredCard(definitionId as keyof typeof economyMuster);
      const expected = mustered.before.match!.players[mustered.actor].hand.reduce((total, instance) => {
        const box = MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === instance.definitionId)?.muster;
        return { influence: total.influence + (box?.influence ?? 0), swords: total.swords + (box?.swords ?? 0) };
      }, { influence: 0, swords: 0 });
      mustered.append(mustered.actor, 'turn/revealed', {});
      const afterMuster = reduceGame(mustered.stream);
      expect(afterMuster.diagnostics).toEqual([]);
      expect(afterMuster.match!.players[mustered.actor].revealInfluence).toBe(expected.influence);
      expect(afterMuster.match!.players[mustered.actor].revealedSwords).toBe(expected.swords);
    }
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
    expect(pending.match!.pendingChoice).toEqual({ kind: 'place-scout', actorUid: actor, allowedPostIds: null, followupSeekAlliesCardId: null, options: [] });
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
      ignoredResourceCost: false,
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
    let stream = readyRoom('council-economy');
    let sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    let target = reduceGame(stream).match!.playerOrder[0];
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

    stream = readyRoom('captain-economy');
    sequences = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    timestamp = 11;
    target = reduceGame(stream).match!.playerOrder[0];
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

    stream = readyRoom('faction-strongholds');
    sequences = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    timestamp = 11;
    target = reduceGame(stream).match!.playerOrder[0];
    let beforePits: ReturnType<typeof reduceGame> | null = null;
    for (let step = 0; step < 1200; step += 1) {
      const state = reduceGame(stream);
      const current = currentPlayerUid(state)!;
      const match = state.match!;
      const player = match.players[current];
      const pending = match.pendingChoice;
      if (match.turnMode === 'endgame') break;
      if (pending?.kind === 'battle-deployment') append(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
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
        if (roadCard && match.richesMithril.edoras >= 4 && !match.boardAgents.edoras && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'edoras' });
        } else if (councilCard && !match.boardAgents['white-council-seat'] && player.resources.gold >= 5 && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: councilCard.id, spaceId: 'white-council-seat' });
        } else if (roadCard && !match.boardAgents['take-war-effort'] && player.availableAgents > 0) {
          append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'take-war-effort' });
        } else append(state, 'turn/revealed', {});
      }
    }
    const pitsFailure = reduceGame(stream);
    expect(
      beforePits,
      `the real economy must fund Pits of Isengard before Endgame (round ${pitsFailure.match!.round}, ${pitsFailure.match!.turnMode}, resources ${JSON.stringify(pitsFailure.match!.players[target].resources)})`
    ).not.toBeNull();
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
      stream = readyRoom(`faction-${spaceId}`);
      sequences = { host: 4, 'guest-a': 3, 'guest-b': 3 };
      timestamp = 11;
      target = reduceGame(stream).match!.playerOrder[0];
      for (let step = 0; step < 1200; step += 1) {
        const state = reduceGame(stream);
        const current = currentPlayerUid(state)!;
        const match = state.match!;
        const player = match.players[current];
        const pending = match.pendingChoice;
        if (pending?.kind === 'battle-deployment') append(state, 'choice/resolved', { choice: 'deploy:0' });
        else if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
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
          if (spaceId === 'deep-roads' && roadCard && match.richesMithril.edoras >= 5 && !match.boardAgents.edoras && player.availableAgents > 0) {
            append(state, 'agent/placed', { cardInstanceId: roadCard.id, spaceId: 'edoras' });
          } else if (spaceId === 'deep-roads' && councilCard && !match.boardAgents['white-council-seat'] && player.resources.gold >= 5 && player.availableAgents > 0) {
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
    expect(awaitingRangerTrash.match!.players[target].standing.wild)
      .toBe(Math.min(6, beforeRangers.match!.players[target].standing.wild + 1));
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

  it('executes Archives, Osgiliath, and Great Forge through real turns and ordered choices', () => {
    const stream = readyRoom('complete-board-1');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (state: ReturnType<typeof reduceGame>, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    const started = reduceGame(stream);
    const [forgeUid, archivesUid, osgiliathUid] = started.match!.playerOrder;
    let archivesComplete = false;
    let osgiliathComplete = false;
    let forgeComplete = false;
    let archiveDrawProof = false;
    let osgiliathGoldBefore = 0;
    let forgeGoldBefore = 0;
    let forgeMithrilBefore = 0;
    let forgeWildBefore = 0;

    for (let guard = 0; guard < 1200 && !(archivesComplete && osgiliathComplete && forgeComplete); guard += 1) {
      const state = reduceGame(stream);
      expect(state.diagnostics).toEqual([]);
      const match = state.match!;
      const uid = currentPlayerUid(state)!;
      const player = match.players[uid];
      const pending = match.pendingChoice;
      if (pending?.kind === 'critical-defense') append(state, 'choice/resolved', { choice: 'decline-defender' });
      else if (pending?.kind === 'battle-deployment') append(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (pending?.kind === 'osgiliath') {
        append(state, 'choice/resolved', { choice: 'pay-0-mithril' });
        const after = reduceGame(stream);
        expect(after.match!.players[uid].resources.gold).toBe(osgiliathGoldBefore + 2);
        osgiliathComplete = true;
      } else if (pending?.kind === 'great-forge') {
        append(state, 'choice/resolved', { choice: 'standing-wild' });
        const after = reduceGame(stream);
        expect(after.match!.players[uid].resources.gold).toBe(forgeGoldBefore + 5);
        expect(after.match!.players[uid].resources.mithril).toBe(forgeMithrilBefore - 3);
        expect(after.match!.players[uid].standing.wild).toBe(forgeWildBefore + 1);
        forgeComplete = true;
      } else if (pending?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'gather-intelligence') append(state, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id]);
        if (!emptyPost) throw new Error('the complete-board journey requires an empty Scout post');
        append(state, 'scout/placed', { postId: emptyPost.id });
      } else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (uid === osgiliathUid && !osgiliathComplete) {
        const placement = player.hand.flatMap((card) => legalAgentSpaces(state, uid, card.id)
          .filter((spaceId) => spaceId === 'osgiliath')
          .map((spaceId) => ({ card, spaceId })))[0];
        if (placement) {
          osgiliathGoldBefore = player.resources.gold;
          append(state, 'agent/placed', { cardInstanceId: placement.card.id, spaceId: placement.spaceId });
        } else append(state, 'turn/revealed', {});
      } else if (uid === archivesUid && !archivesComplete) {
        const archivePlacement = player.hand.flatMap((card) => legalAgentSpaces(state, uid, card.id)
          .filter((spaceId) => spaceId === 'archives-rivendell')
          .map((spaceId) => ({ card, spaceId })))[0];
        if (archivePlacement && player.resources.provisions >= 2) {
          const cardsBefore = player.hand.length + player.drawPile.length + player.discardPile.length + player.journey.length + player.muster.length + player.trashPile.length;
          append(state, 'agent/placed', { cardInstanceId: archivePlacement.card.id, spaceId: archivePlacement.spaceId });
          const after = reduceGame(stream);
          const afterPlayer = after.match!.players[uid];
          const cardsAfter = afterPlayer.hand.length + afterPlayer.drawPile.length + afterPlayer.discardPile.length + afterPlayer.journey.length + afterPlayer.muster.length + afterPlayer.trashPile.length;
          expect(afterPlayer.resources.provisions).toBe(player.resources.provisions - 2);
          expect(cardsAfter).toBe(cardsBefore);
          expect(afterPlayer.hand.length).toBe(player.hand.length + 1);
          archiveDrawProof = true;
          archivesComplete = true;
        } else {
          const provisionPlacement = player.hand.flatMap((card) => legalAgentSpaces(state, uid, card.id)
            .filter((spaceId) => spaceId === 'dwarven-caravans')
            .map((spaceId) => ({ card, spaceId })))[0];
          if (player.resources.provisions < 2 && provisionPlacement) {
            append(state, 'agent/placed', { cardInstanceId: provisionPlacement.card.id, spaceId: provisionPlacement.spaceId });
          } else append(state, 'turn/revealed', {});
        }
      } else if (uid === forgeUid && !forgeComplete) {
        const forgePlacement = player.hand.flatMap((card) => legalAgentSpaces(state, uid, card.id)
          .filter((spaceId) => spaceId === 'great-forge')
          .map((spaceId) => ({ card, spaceId })))[0];
        if (forgePlacement) {
          forgeGoldBefore = player.resources.gold;
          forgeMithrilBefore = player.resources.mithril;
          forgeWildBefore = player.standing.wild;
          append(state, 'agent/placed', { cardInstanceId: forgePlacement.card.id, spaceId: forgePlacement.spaceId });
        } else {
          const desiredSpace = player.standing.dwarven < 2 ? 'dwarven-caravans' : 'edoras';
          const setupPlacement = player.hand.flatMap((card) => legalAgentSpaces(state, uid, card.id)
            .filter((spaceId) => spaceId === desiredSpace)
            .map((spaceId) => ({ card, spaceId })))[0];
          if (setupPlacement) append(state, 'agent/placed', { cardInstanceId: setupPlacement.card.id, spaceId: setupPlacement.spaceId });
          else append(state, 'turn/revealed', {});
        }
      } else append(state, 'turn/revealed', {});
    }

    const complete = reduceGame(stream);
    expect(complete.diagnostics).toEqual([]);
    expect({ archivesComplete, osgiliathComplete, forgeComplete, archiveDrawProof }).toEqual({
      archivesComplete: true,
      osgiliathComplete: true,
      forgeComplete: true,
      archiveDrawProof: true
    });
    expect(complete.match!.activity.some((entry) => entry.includes('at Osgiliath'))).toBe(true);
    expect(complete.match!.activity.some((entry) => entry.includes('standing at Great Forge'))).toBe(true);
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

  it('plays Secret Ways during Agent or Reveal and resumes the same turn after Scout placement', () => {
    const buildPlotTurn = () => {
      const stream = readyRoom('plot-0');
      const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
      let timestamp = 11;
      const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
        const state = reduceGame(stream);
        const uid = currentPlayerUid(state)!;
        sequences[uid] += 1;
        stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      };
      const started = reduceGame(stream);
      const actor = currentPlayerUid(started)!;
      const escort = started.match!.players[actor].hand.find((card) => card.definitionId === 'armed-escort');
      expect(escort, 'the published Plot seed gives the first actor a real Council card').toBeDefined();
      append('agent/placed', { cardInstanceId: escort!.id, spaceId: 'hall-fire' });
      expect(reduceGame(stream).match!.players[actor].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'secret-ways' }));
      for (let other = 0; other < 2; other += 1) {
        append('turn/revealed', {});
        append('reveal/finished', {});
      }
      expect(currentPlayerUid(reduceGame(stream))).toBe(actor);
      return { stream, sequences, timestamp, actor };
    };

    const agent = buildPlotTurn();
    const agentBefore = reduceGame(agent.stream);
    const agentFate = agentBefore.match!.players[agent.actor].fateHand.find((card) => card.definitionId === 'secret-ways')!;
    agent.sequences[agent.actor] += 1;
    agent.stream.push(createEvent('fate/played', agent.actor, agent.sequences[agent.actor], { cardInstanceId: agentFate.id }, agent.timestamp++));
    const awaitingAgentScout = reduceGame(agent.stream);
    expect(awaitingAgentScout.match!.pendingChoice).toEqual({
      kind: 'place-scout', actorUid: agent.actor, allowedPostIds: null, followupSeekAlliesCardId: null, resumeTurn: 'agent', options: []
    });
    expect(awaitingAgentScout.match!.fateDiscard.at(-1)).toEqual(agentFate);
    agent.sequences[agent.actor] += 1;
    agent.stream.push(createEvent('scout/placed', agent.actor, agent.sequences[agent.actor], { postId: 'orthanc-eye' }, agent.timestamp++));
    const resumedAgent = reduceGame(agent.stream);
    expect(resumedAgent.diagnostics).toEqual([]);
    expect(resumedAgent.match!.turnMode).toBe('agent');
    expect(currentPlayerUid(resumedAgent)).toBe(agent.actor);
    expect(resumedAgent.match!.players[agent.actor].availableAgents).toBe(1);
    expect(resumedAgent.match!.boardScouts['orthanc-eye']).toBe(agent.actor);

    const reveal = buildPlotTurn();
    reveal.sequences[reveal.actor] += 1;
    reveal.stream.push(createEvent('turn/revealed', reveal.actor, reveal.sequences[reveal.actor], {}, reveal.timestamp++));
    const revealed = reduceGame(reveal.stream);
    const revealFate = revealed.match!.players[reveal.actor].fateHand.find((card) => card.definitionId === 'secret-ways')!;
    reveal.sequences[reveal.actor] += 1;
    reveal.stream.push(createEvent('fate/played', reveal.actor, reveal.sequences[reveal.actor], { cardInstanceId: revealFate.id }, reveal.timestamp++));
    expect(reduceGame(reveal.stream).match!.pendingChoice).toMatchObject({ kind: 'place-scout', resumeTurn: 'reveal' });
    reveal.sequences[reveal.actor] += 1;
    reveal.stream.push(createEvent('scout/placed', reveal.actor, reveal.sequences[reveal.actor], { postId: 'redhorn-pass' }, reveal.timestamp++));
    const resumedReveal = reduceGame(reveal.stream);
    expect(resumedReveal.diagnostics).toEqual([]);
    expect(resumedReveal.match!.turnMode).toBe('reveal');
    expect(currentPlayerUid(resumedReveal)).toBe(reveal.actor);
    expect(resumedReveal.match!.boardScouts['redhorn-pass']).toBe(reveal.actor);
    expect(resumedReveal.match!.players[reveal.actor].muster).toHaveLength(revealed.match!.players[reveal.actor].muster.length);
  });

  it('draws and privately discards for A Chance Meeting before resuming the same turn', () => {
    const stream = readyRoom('chance-9');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const appendCurrent = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const state = reduceGame(stream);
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    const started = reduceGame(stream);
    const actor = currentPlayerUid(started)!;
    const escort = started.match!.players[actor].hand.find((card) => card.definitionId === 'armed-escort');
    expect(escort).toBeDefined();
    appendCurrent('agent/placed', { cardInstanceId: escort!.id, spaceId: 'hall-fire' });
    expect(reduceGame(stream).match!.players[actor].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'chance-meeting' }));
    for (let other = 0; other < 2; other += 1) {
      appendCurrent('turn/revealed', {});
      appendCurrent('reveal/finished', {});
    }

    const beforePlay = reduceGame(stream);
    expect(currentPlayerUid(beforePlay)).toBe(actor);
    const beforePlayer = beforePlay.match!.players[actor];
    const beforeHandIds = new Set(beforePlayer.hand.map((card) => card.id));
    const fate = beforePlayer.fateHand.find((card) => card.definitionId === 'chance-meeting')!;
    appendCurrent('fate/played', { cardInstanceId: fate.id });
    const awaitingDiscard = reduceGame(stream);
    const pending = awaitingDiscard.match!.pendingChoice;
    expect(pending).toMatchObject({ kind: 'plot-discard', actorUid: actor, resumeTurn: 'agent' });
    expect(awaitingDiscard.match!.players[actor].hand).toHaveLength(beforePlayer.hand.length + 1);
    expect(awaitingDiscard.match!.players[actor].drawPile).toHaveLength(beforePlayer.drawPile.length - 1);
    const drawn = awaitingDiscard.match!.players[actor].hand.find((card) => !beforeHandIds.has(card.id));
    expect(drawn).toBeDefined();
    expect(pending?.options).toContain(`discard:${drawn!.id}`);

    appendCurrent('choice/resolved', { choice: `discard:${drawn!.id}` });
    const resumed = reduceGame(stream);
    expect(resumed.diagnostics).toEqual([]);
    expect(resumed.match!.pendingChoice).toBeNull();
    expect(resumed.match!.players[actor].hand).toHaveLength(beforePlayer.hand.length);
    expect(resumed.match!.players[actor].discardPile.at(-1)).toEqual(drawn);
    expect(resumed.match!.fateDiscard.at(-1)).toEqual(fate);
    expect(currentPlayerUid(resumed)).toBe(actor);
    expect(resumed.match!.turnMode).toBe('agent');
    expect([
      ...resumed.match!.players[actor].hand,
      ...resumed.match!.players[actor].drawPile,
      ...resumed.match!.players[actor].discardPile,
      ...resumed.match!.players[actor].journey,
      ...resumed.match!.players[actor].muster,
      ...resumed.match!.players[actor].trashPile
    ]).toHaveLength(10);
  });

  it('resolves both Gifts and Tokens resource branches and resumes the same turn', () => {
    const buildGiftChoice = () => {
      const stream = readyRoom('gifts-34');
      const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
      let timestamp = 11;
      const appendCurrent = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
        const state = reduceGame(stream);
        const uid = currentPlayerUid(state)!;
        sequences[uid] += 1;
        stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      };
      const started = reduceGame(stream);
      const actor = currentPlayerUid(started)!;
      const mission = started.match!.players[actor].hand.find((card) => card.definitionId === 'diplomatic-mission');
      const escort = started.match!.players[actor].hand.find((card) => card.definitionId === 'armed-escort');
      expect(mission).toBeDefined();
      expect(escort).toBeDefined();
      appendCurrent('agent/placed', { cardInstanceId: mission!.id, spaceId: 'tribute-shadow' });
      for (let other = 0; other < 2; other += 1) {
        appendCurrent('turn/revealed', {});
        appendCurrent('reveal/finished', {});
      }
      expect(currentPlayerUid(reduceGame(stream))).toBe(actor);
      appendCurrent('agent/placed', { cardInstanceId: escort!.id, spaceId: 'hall-fire' });
      const beforePlay = reduceGame(stream);
      expect(beforePlay.match!.players[actor].resources.gold).toBe(2);
      const fate = beforePlay.match!.players[actor].fateHand.find((card) => card.definitionId === 'gifts-tokens')!;
      appendCurrent('fate/played', { cardInstanceId: fate.id });
      expect(reduceGame(stream).match!.pendingChoice).toEqual({
        kind: 'gifts-tokens', actorUid: actor, resumeTurn: 'agent', options: ['gain-2-gold', 'pay-2-gold']
      });
      return { stream, sequences, timestamp, actor, fate };
    };

    const goldGift = buildGiftChoice();
    goldGift.sequences[goldGift.actor] += 1;
    goldGift.stream.push(createEvent('choice/resolved', goldGift.actor, goldGift.sequences[goldGift.actor], { choice: 'gain-2-gold' }, goldGift.timestamp));
    const afterGold = reduceGame(goldGift.stream);
    expect(afterGold.diagnostics).toEqual([]);
    expect(afterGold.match!.players[goldGift.actor].resources.gold).toBe(4);
    expect(afterGold.match!.pendingChoice).toBeNull();
    expect(currentPlayerUid(afterGold)).toBe(goldGift.actor);

    const tokenGift = buildGiftChoice();
    tokenGift.sequences[tokenGift.actor] += 1;
    tokenGift.stream.push(createEvent('choice/resolved', tokenGift.actor, tokenGift.sequences[tokenGift.actor], { choice: 'pay-2-gold' }, tokenGift.timestamp));
    const afterTokens = reduceGame(tokenGift.stream);
    expect(afterTokens.diagnostics).toEqual([]);
    expect(afterTokens.match!.players[tokenGift.actor].resources).toMatchObject({ gold: 0, mithril: 1, provisions: 2 });
    expect(afterTokens.match!.fateDiscard.at(-1)).toEqual(tokenGift.fate);
    expect(afterTokens.match!.pendingChoice).toBeNull();
    expect(currentPlayerUid(afterTokens)).toBe(tokenGift.actor);
  });

  it('draws two cards with Tidings from Afar, privately top-decks one, and resumes the same turn', () => {
    const stream = readyRoom('tidings-12');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const appendCurrent = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const state = reduceGame(stream);
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    const started = reduceGame(stream);
    const actor = currentPlayerUid(started)!;
    const escort = started.match!.players[actor].hand.find((card) => card.definitionId === 'armed-escort');
    expect(escort).toBeDefined();
    appendCurrent('agent/placed', { cardInstanceId: escort!.id, spaceId: 'hall-fire' });
    expect(reduceGame(stream).match!.players[actor].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'tidings-afar' }));
    for (let other = 0; other < 2; other += 1) {
      appendCurrent('turn/revealed', {});
      appendCurrent('reveal/finished', {});
    }

    const beforePlay = reduceGame(stream);
    expect(currentPlayerUid(beforePlay)).toBe(actor);
    const beforePlayer = beforePlay.match!.players[actor];
    const fate = beforePlayer.fateHand.find((card) => card.definitionId === 'tidings-afar')!;
    appendCurrent('fate/played', { cardInstanceId: fate.id });
    const awaitingTopDeck = reduceGame(stream);
    const pending = awaitingTopDeck.match!.pendingChoice;
    expect(pending).toMatchObject({ kind: 'tidings-afar', actorUid: actor, resumeTurn: 'agent' });
    expect(awaitingTopDeck.match!.players[actor].hand).toHaveLength(beforePlayer.hand.length + 2);
    expect(awaitingTopDeck.match!.players[actor].drawPile).toHaveLength(beforePlayer.drawPile.length - 2);
    expect(pending?.options).toHaveLength(beforePlayer.hand.length + 2);

    const rejected = reduceGame([
      ...stream,
      createEvent('choice/resolved', actor, sequences[actor] + 1, { choice: 'top-deck:not-in-hand' }, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.pendingChoice).toEqual(pending);

    if (pending?.kind !== 'tidings-afar') throw new Error('Tidings choice is required');
    const returnedId = pending.cardInstanceIds.at(-1)!;
    appendCurrent('choice/resolved', { choice: `top-deck:${returnedId}` });
    const resumed = reduceGame(stream);
    expect(resumed.diagnostics).toEqual([]);
    expect(resumed.match!.pendingChoice).toBeNull();
    expect(resumed.match!.players[actor].hand).toHaveLength(beforePlayer.hand.length + 1);
    expect(resumed.match!.players[actor].drawPile[0].id).toBe(returnedId);
    expect(resumed.match!.fateDiscard.at(-1)).toEqual(fate);
    expect(currentPlayerUid(resumed)).toBe(actor);
    expect(resumed.match!.turnMode).toBe('agent');
    expect([
      ...resumed.match!.players[actor].hand,
      ...resumed.match!.players[actor].drawPile,
      ...resumed.match!.players[actor].discardPile,
      ...resumed.match!.players[actor].journey,
      ...resumed.match!.players[actor].muster,
      ...resumed.match!.players[actor].trashPile
    ]).toHaveLength(10);
  });

  it('lets the chosen Divided Counsel opponent lose Gold or reveal their hand out of turn', () => {
    const buildCounsel = () => {
      const stream = readyRoom('divided-10');
      const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
      let timestamp = 11;
      const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
        sequences[uid] += 1;
        stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      };
      let state = reduceGame(stream);
      const fateActor = currentPlayerUid(state)!;
      const escort = state.match!.players[fateActor].hand.find((card) => card.definitionId === 'armed-escort')!;
      append(fateActor, 'agent/placed', { cardInstanceId: escort.id, spaceId: 'hall-fire' });
      state = reduceGame(stream);
      const target = currentPlayerUid(state)!;
      const mission = state.match!.players[target].hand.find((card) => legalAgentSpaces(state, target, card.id).includes('tribute-shadow'))!;
      append(target, 'agent/placed', { cardInstanceId: mission.id, spaceId: 'tribute-shadow' });
      state = reduceGame(stream);
      const third = currentPlayerUid(state)!;
      append(third, 'turn/revealed', {});
      append(third, 'reveal/finished', {});
      state = reduceGame(stream);
      expect(currentPlayerUid(state)).toBe(fateActor);
      expect(state.match!.players[target].resources.gold).toBe(2);
      const fate = state.match!.players[fateActor].fateHand.find((card) => card.definitionId === 'divided-counsel')!;
      append(fateActor, 'fate/played', { cardInstanceId: fate.id });
      expect(reduceGame(stream).match!.pendingChoice).toEqual({
        kind: 'divided-counsel-opponent',
        actorUid: fateActor,
        resumeTurn: 'agent',
        options: state.match!.playerOrder.filter((uid) => uid !== fateActor).map((uid) => `opponent:${uid}`)
      });
      append(fateActor, 'choice/resolved', { choice: `opponent:${target}` });
      expect(reduceGame(stream).match!.pendingChoice).toEqual({
        kind: 'divided-counsel-response',
        actorUid: target,
        fateActorUid: fateActor,
        resumeTurn: 'agent',
        options: ['lose-1-gold', 'reveal-hand']
      });
      return { stream, sequences, timestamp, append, fateActor, target, fate };
    };

    const paid = buildCounsel();
    paid.append(paid.target, 'choice/resolved', { choice: 'lose-1-gold' });
    const afterPayment = reduceGame(paid.stream);
    expect(afterPayment.diagnostics).toEqual([]);
    expect(afterPayment.match!.players[paid.target].resources.gold).toBe(1);
    expect(afterPayment.match!.pendingChoice).toBeNull();
    expect(afterPayment.match!.fateDiscard.at(-1)).toEqual(paid.fate);
    expect(currentPlayerUid(afterPayment)).toBe(paid.fateActor);

    const revealed = buildCounsel();
    const targetHand = reduceGame(revealed.stream).match!.players[revealed.target].hand.map((card) => card.id);
    revealed.append(revealed.target, 'choice/resolved', { choice: 'reveal-hand' });
    const review = reduceGame(revealed.stream);
    expect(review.diagnostics).toEqual([]);
    expect(review.match!.pendingChoice).toEqual({
      kind: 'divided-counsel-review',
      actorUid: revealed.fateActor,
      targetUid: revealed.target,
      cardInstanceIds: targetHand,
      resumeTurn: 'agent',
      options: ['finish-review']
    });
    revealed.append(revealed.fateActor, 'choice/resolved', { choice: 'finish-review' });
    const afterReview = reduceGame(revealed.stream);
    expect(afterReview.diagnostics).toEqual([]);
    expect(afterReview.match!.players[revealed.target].resources.gold).toBe(2);
    expect(afterReview.match!.pendingChoice).toBeNull();
    expect(currentPlayerUid(afterReview)).toBe(revealed.fateActor);
  });

  it('cycles one affordable exact Chronicle instance with Long Memory and resumes the interrupted turn', () => {
    let stream = readyRoom('memory-0');
    for (let candidate = 0; candidate < 500; candidate += 1) {
      const attempt = readyRoom(`memory-${candidate}`);
      const state = reduceGame(attempt);
      const actor = currentPlayerUid(state)!;
      const rowCosts = state.match!.chronicleRow.map((instance) =>
        CHRONICLE_CARD_DEFINITIONS.find((definition) => definition.id === instance.definitionId)!.cost
      );
      if (
        state.match!.players[actor].hand.some((card) => card.definitionId === 'armed-escort') &&
        state.match!.fateDeck[0]?.definitionId === 'long-memory' &&
        rowCosts.some((cost) => cost <= 3) &&
        rowCosts.some((cost) => cost > 3)
      ) {
        stream = attempt;
        break;
      }
    }
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    let state = reduceGame(stream);
    const actor = currentPlayerUid(state)!;
    const escort = state.match!.players[actor].hand.find((card) => card.definitionId === 'armed-escort')!;
    append(actor, 'agent/placed', { cardInstanceId: escort.id, spaceId: 'hall-fire' });
    for (let other = 0; other < 2; other += 1) {
      state = reduceGame(stream);
      const uid = currentPlayerUid(state)!;
      append(uid, 'turn/revealed', {});
      append(uid, 'reveal/finished', {});
    }
    state = reduceGame(stream);
    expect(currentPlayerUid(state)).toBe(actor);
    const fate = state.match!.players[actor].fateHand.find((card) => card.definitionId === 'long-memory')!;
    const rowBefore = [...state.match!.chronicleRow];
    const deckBefore = [...state.match!.chronicleDeck];
    const affordable = (definitionId: string) => CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === definitionId)!.cost <= 3;
    expect(deckBefore).toHaveLength(47);
    append(actor, 'fate/played', { cardInstanceId: fate.id });
    const awaitingChoice = reduceGame(stream);
    expect(awaitingChoice.match!.pendingChoice).toEqual({
      kind: 'long-memory',
      actorUid: actor,
      cardInstanceIds: rowBefore.filter((card) => affordable(card.definitionId)).map((card) => card.id),
      resumeTurn: 'agent',
      options: rowBefore.filter((card) => affordable(card.definitionId)).map((card) => `chronicle:${card.id}`)
    });
    expect(awaitingChoice.match!.fateDiscard.at(-1)).toEqual(fate);

    const expensive = rowBefore.find((card) => !affordable(card.definitionId))!;
    const rejected = reduceGame([
      ...stream,
      createEvent('choice/resolved', actor, sequences[actor] + 1, { choice: `chronicle:${expensive.id}` }, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.chronicleRow).toEqual(rowBefore);
    expect(rejected.match!.chronicleDeck).toEqual(deckBefore);

    const otherUid = awaitingChoice.match!.playerOrder.find((uid) => uid !== actor)!;
    const rejectedAuthority = reduceGame([
      ...stream,
      createEvent('choice/resolved', otherUid, sequences[otherUid] + 1, { choice: awaitingChoice.match!.pendingChoice!.options[0] }, timestamp)
    ]);
    expect(rejectedAuthority.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejectedAuthority.match!.chronicleRow).toEqual(rowBefore);
    expect(rejectedAuthority.match!.chronicleDeck).toEqual(deckBefore);

    const cycled = rowBefore.find((card) => affordable(card.definitionId))!;
    append(actor, 'choice/resolved', { choice: `chronicle:${cycled.id}` });
    const resumed = reduceGame(stream);
    expect(resumed.diagnostics).toEqual([]);
    expect(resumed.match!.pendingChoice).toBeNull();
    expect(resumed.match!.chronicleRow[rowBefore.indexOf(cycled)]).toEqual(deckBefore[0]);
    expect(resumed.match!.chronicleDeck).toEqual([...deckBefore.slice(1), cycled]);
    expect(resumed.match!.chronicleRow).toHaveLength(5);
    expect(new Set([...resumed.match!.chronicleRow, ...resumed.match!.chronicleDeck].map((card) => card.id))).toEqual(
      new Set([...rowBefore, ...deckBefore].map((card) => card.id))
    );
    expect(currentPlayerUid(resumed)).toBe(actor);
    expect(resumed.match!.turnMode).toBe('agent');
  });

  it('pays for Fell Sorcery, rejects friendly targets, and weakens one opposing Battle force', () => {
    const stream = readyRoom('fell-11');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    let state = reduceGame(stream);
    const caster = currentPlayerUid(state)!;
    const hallCard = state.match!.players[caster].hand.find((card) => legalAgentSpaces(state, caster, card.id).includes('hall-fire'))!;
    append(caster, 'agent/placed', { cardInstanceId: hallCard.id, spaceId: 'hall-fire' });
    state = reduceGame(stream);
    expect(state.match!.players[caster].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'fell-sorcery' }));

    const firstOpponent = currentPlayerUid(state)!;
    const minasCard = state.match!.players[firstOpponent].hand.find((card) => legalAgentSpaces(state, firstOpponent, card.id).includes('minas-tirith'))!;
    append(firstOpponent, 'agent/placed', { cardInstanceId: minasCard.id, spaceId: 'minas-tirith' });
    append(firstOpponent, 'choice/resolved', { choice: 'deploy:1' });

    state = reduceGame(stream);
    const secondOpponent = currentPlayerUid(state)!;
    const entwashCard = state.match!.players[secondOpponent].hand.find((card) => legalAgentSpaces(state, secondOpponent, card.id).includes('entwash'))!;
    append(secondOpponent, 'agent/placed', { cardInstanceId: entwashCard.id, spaceId: 'entwash' });
    append(secondOpponent, 'choice/resolved', { choice: 'gain-2-mithril' });
    append(secondOpponent, 'choice/resolved', { choice: 'deploy:1' });

    state = reduceGame(stream);
    expect(currentPlayerUid(state)).toBe(caster);
    const edorasCard = state.match!.players[caster].hand.find((card) => legalAgentSpaces(state, caster, card.id).includes('edoras'))!;
    append(caster, 'agent/placed', { cardInstanceId: edorasCard.id, spaceId: 'edoras' });
    append(caster, 'choice/resolved', { choice: 'deploy:1' });

    for (let guard = 0; guard < 3; guard += 1) {
      state = reduceGame(stream);
      const actor = currentPlayerUid(state)!;
      append(actor, 'turn/revealed', {});
      append(actor, 'reveal/finished', {});
    }
    state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.turnMode).toBe('battle');
    expect(state.match!.battleParticipantUids).toHaveLength(3);

    for (let guard = 0; guard < 3 && currentPlayerUid(state) !== caster; guard += 1) {
      append(currentPlayerUid(state)!, 'battle/passed', {});
      state = reduceGame(stream);
    }
    expect(currentPlayerUid(state)).toBe(caster);
    const fate = state.match!.players[caster].fateHand.find((card) => card.definitionId === 'fell-sorcery')!;
    const mithrilBefore = state.match!.players[caster].resources.mithril;
    const target = state.match!.battleParticipantUids.find((uid) => uid !== caster)!;
    const strengthBefore = battleStrength(state.match!, target);
    append(caster, 'fate/played', { cardInstanceId: fate.id });
    const awaitingTarget = reduceGame(stream);
    expect(awaitingTarget.diagnostics).toEqual([]);
    expect(awaitingTarget.match!.players[caster].resources.mithril).toBe(mithrilBefore - 1);
    expect(awaitingTarget.match!.players[caster].fateHand).not.toContainEqual(fate);
    expect(awaitingTarget.match!.fateDiscard.at(-1)).toEqual(fate);
    expect(awaitingTarget.match!.pendingChoice).toEqual({
      kind: 'fell-sorcery',
      actorUid: caster,
      strengthLoss: 3,
      options: awaitingTarget.match!.battleParticipantUids.filter((uid) => uid !== caster).map((uid) => `opponent:${uid}`)
    });

    const rejected = reduceGame([
      ...stream,
      createEvent('choice/resolved', caster, sequences[caster] + 1, { choice: `opponent:${caster}` }, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.pendingChoice).toEqual(awaitingTarget.match!.pendingChoice);
    expect(battleStrength(rejected.match!, target)).toBe(strengthBefore);

    append(caster, 'choice/resolved', { choice: `opponent:${target}` });
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.pendingChoice).toBeNull();
    expect(battleStrength(resolved.match!, target)).toBe(Math.max(0, strengthBefore - 3));
    expect(currentPlayerUid(resolved)).toBe(caster);
    expect(resolved.match!.consecutiveBattlePasses).toBe(0);
  });

  it('plays selected Age II Defence of Dale with exact Renown and Dwarven standing', () => {
    const stream = readyRoom('defence-dale');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 100; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'defence-dale') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(2);
    expect(state.match!.activeBattleId).toBe('defence-dale');
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'the selected Battle must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });

    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.turnMode).toBe('battle');
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const dwarvenBefore = combat.match!.players[winner].standing.dwarven;
    append(winner, 'battle/passed', {});
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.battleHistory.at(-1)).toMatchObject({ battleId: 'defence-dale', winnerUid: winner });
    expect(resolved.match!.players[winner].wonBattleIds).toContain('defence-dale');
    expect(resolved.match!.players[winner].renown).toBe(renownBefore + 1);
    expect(resolved.match!.players[winner].standing.dwarven).toBe(dwarvenBefore + 1);
  });

  it('plays Last March of the Ents as a final Battle and permanently breaches the Dam', () => {
    const stream = readyRoom('last-march-ents-0');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 120; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'last-march-ents') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(10);
    expect(state.match!.activeBattleId).toBe('last-march-ents');
    expect(state.match!.damBreached).toBe(false);
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'Last March must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });

    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.turnMode).toBe('battle');
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const mithrilBefore = combat.match!.players[winner].resources.mithril;
    append(winner, 'battle/passed', {});
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.battleHistory.at(-1)).toMatchObject({ battleId: 'last-march-ents', winnerUid: winner });
    expect(resolved.match!.players[winner].wonBattleIds).toContain('last-march-ents');
    expect(resolved.match!.players[winner].renown).toBe(renownBefore + 2);
    expect(resolved.match!.players[winner].resources.mithril).toBe(mithrilBefore + 2);
    expect(resolved.match!.damBreached).toBe(true);
  });

  it('plays selected Age II Assault on the Fords with exact Renown and Wild standing', () => {
    const stream = readyRoom('assault-fords');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 140; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'assault-fords') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(5);
    expect(state.match!.activeBattleId).toBe('assault-fords');
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'Assault on the Fords must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });

    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const wildBefore = combat.match!.players[winner].standing.wild;
    append(winner, 'battle/passed', {});
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.battleHistory.at(-1)).toMatchObject({ battleId: 'assault-fords', winnerUid: winner });
    expect(resolved.match!.players[winner].wonBattleIds).toContain('assault-fords');
    expect(resolved.match!.players[winner].renown).toBe(renownBefore + 1);
    expect(resolved.match!.players[winner].standing.wild).toBe(wildBefore + 1);
    expect(resolved.match!.round).toBe(6);
  });

  it('queues ranked Assault standing choices with actor authority and immutable replay', () => {
    const stream = readyRoom('assault-ranked-choice');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 140; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'assault-fords') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const battleSpaces = ['minas-tirith', 'hidden-paths', 'ranger-mustering', 'osgiliath', 'edoras'];
    const used = new Set<string>();
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
      } else if (pending?.kind === 'osgiliath') append(current, 'choice/resolved', { choice: 'pay-0-mithril' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if ((match.battleCompanies[current] ?? 0) > 0) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        expect(placement, `${current} must reach an unused Assault Battle space`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }

    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.activeBattleId).toBe('assault-fords');
    expect(combat.match!.battleParticipantUids).toHaveLength(3);
    const strengths = Object.fromEntries(combat.match!.battleParticipantUids.map((uid) => [uid, battleStrength(combat.match!, uid)]));
    const rankedStrengths = [...new Set(Object.values(strengths))].sort((a, b) => b - a);
    const first = combat.match!.battleParticipantUids.filter((uid) => strengths[uid] === rankedStrengths[0]);
    const second = combat.match!.battleParticipantUids.filter((uid) => strengths[uid] === rankedStrengths[1]);
    const expectedChoiceUids = first.length > 1 ? first : second.length === 1 ? second : [];
    expect(expectedChoiceUids.length, 'the deterministic seed must exercise a first- or second-rank standing reward').toBeGreaterThan(0);

    while (reduceGame(stream).match!.activeBattleId) {
      const state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'battle/passed', {});
    }
    let awaiting = reduceGame(stream);
    for (const expectedUid of expectedChoiceUids) {
      expect(awaiting.match!.pendingChoice).toEqual({
        kind: 'battle-standing',
        actorUid: expectedUid,
        options: ['standing-shadow', 'standing-dwarven', 'standing-elven', 'standing-wild']
      });
      const unauthorized = awaiting.match!.playerOrder.find((uid) => uid !== expectedUid)!;
      const rejected = reduceGame([
        ...stream,
        createEvent('choice/resolved', unauthorized, sequences[unauthorized] + 1, { choice: 'standing-dwarven' }, timestamp)
      ]);
      expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
      expect(rejected.match!.pendingChoice).toEqual(awaiting.match!.pendingChoice);
      const before = awaiting.match!.players[expectedUid].standing.dwarven;
      const invalid = reduceGame([
        ...stream,
        createEvent('choice/resolved', expectedUid, sequences[expectedUid] + 1, { choice: 'standing-free-peoples' }, timestamp)
      ]);
      expect(invalid.diagnostics.at(-1)).toContain('illegal choice resolution');
      expect(invalid.match!.players[expectedUid].standing.dwarven).toBe(before);
      append(expectedUid, 'choice/resolved', { choice: 'standing-dwarven' });
      awaiting = reduceGame(stream);
      expect(awaiting.diagnostics).toEqual([]);
      expect(awaiting.match!.players[expectedUid].standing.dwarven).toBe(before + 1);
    }
    expect(awaiting.match!.pendingChoice).toBeNull();
    expect(awaiting.match!.pendingBattleRewardChoices).toEqual([]);
    expect(awaiting.match!.round).toBe(3);
    expect(reduceGame(stream)).toEqual(awaiting);
  });

  it('plays Ambush in Ithilien with an exact winner reward and ordered finite Scout placement', () => {
    expect(BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === 'ambush-ithilien')).toMatchObject({
      age: 2,
      standard: 'Horse',
      rewards: [
        { renown: 1, placeScouts: 1 },
        { drawFate: 1, mithril: 1 },
        { mithril: 1 }
      ]
    });
    const stream = readyRoom('ambush-ithilien');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 160; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'ambush-ithilien') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(2);
    expect(state.match!.activeBattleId).toBe('ambush-ithilien');
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'Ambush in Ithilien must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });

    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const scoutsBefore = combat.match!.players[winner].scouts.supply;
    append(winner, 'battle/passed', {});
    const awaiting = reduceGame(stream);
    expect(awaiting.diagnostics).toEqual([]);
    expect(awaiting.match!.players[winner].renown).toBe(renownBefore + 1);
    expect(awaiting.match!.players[winner].wonBattleIds).toContain('ambush-ithilien');
    expect(awaiting.match!.pendingChoice).toMatchObject({
      kind: 'place-scout', actorUid: winner, resumeBattleReward: true
    });
    expect(awaiting.match!.round).toBe(2);

    const emptyPost = OBSERVATION_POSTS.find((post) => !awaiting.match!.boardScouts[post.id])!;
    const unauthorized = awaiting.match!.playerOrder.find((uid) => uid !== winner)!;
    const rejected = reduceGame([
      ...stream,
      createEvent('scout/placed', unauthorized, sequences[unauthorized] + 1, { postId: emptyPost.id }, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal Scout placement');
    expect(rejected.match!.pendingChoice).toEqual(awaiting.match!.pendingChoice);
    expect(rejected.match!.boardScouts[emptyPost.id]).toBeUndefined();

    append(winner, 'scout/placed', { postId: emptyPost.id });
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.boardScouts[emptyPost.id]).toBe(winner);
    expect(resolved.match!.players[winner].scouts.supply).toBe(scoutsBefore - 1);
    expect(resolved.match!.pendingBattleRewardChoices).toEqual([]);
    expect(resolved.match!.pendingChoice).toBeNull();
    expect(resolved.match!.round).toBe(3);
    expect(reduceGame(stream)).toEqual(resolved);
  });

  it('awards Ambush runner-up Fate and Mithril before any Scout choice', () => {
    const stream = readyRoom('ambush-ranked-rewards');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    for (let guard = 0; guard < 160; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'ambush-ithilien') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }

    const battleSpaces = ['minas-tirith', 'hidden-paths', 'ranger-mustering', 'osgiliath', 'edoras'];
    const used = new Set<string>();
    const deployed = new Set<string>();
    for (let guard = 0; guard < 80; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') {
        append(current, 'choice/resolved', { choice: `deploy:${Math.max(1, pending.maximum)}` });
        deployed.add(current);
      } else if (pending?.kind === 'ranger-mustering-trash') append(current, 'choice/resolved', { choice: 'decline-trash' });
      else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id])!;
        append(current, 'scout/placed', { postId: emptyPost.id });
      } else if (pending?.kind === 'osgiliath') append(current, 'choice/resolved', { choice: 'pay-0-mithril' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (deployed.size >= 2 || deployed.has(current)) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        expect(placement, `${current} must reach an unused Ambush Battle space`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }

    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.activeBattleId).toBe('ambush-ithilien');
    expect(combat.match!.battleParticipantUids).toHaveLength(2);
    const strengths = Object.fromEntries(combat.match!.battleParticipantUids.map((uid) => [uid, battleStrength(combat.match!, uid)]));
    const [left, right] = combat.match!.battleParticipantUids;
    const runnerUids = strengths[left] === strengths[right]
      ? [left, right]
      : [strengths[left] < strengths[right] ? left : right];
    const before = Object.fromEntries(runnerUids.map((uid) => [uid, {
      mithril: combat.match!.players[uid].resources.mithril,
      fate: combat.match!.players[uid].fateHand.length
    }]));

    while (reduceGame(stream).match!.activeBattleId) {
      const state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'battle/passed', {});
    }
    let resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    for (const uid of runnerUids) {
      expect(resolved.match!.players[uid].resources.mithril).toBe(before[uid].mithril + 1);
      expect(resolved.match!.players[uid].fateHand).toHaveLength(before[uid].fate + 1);
    }
    if (resolved.match!.pendingChoice?.kind === 'place-scout') {
      const recipient = resolved.match!.pendingChoice.actorUid;
      const emptyPost = OBSERVATION_POSTS.find((post) => !resolved.match!.boardScouts[post.id])!;
      append(recipient, 'scout/placed', { postId: emptyPost.id });
      resolved = reduceGame(stream);
    }
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.round).toBe(5);
  });

  it('plays Treachery at Orthanc with its exact sole-winner reward and Star trophy', () => {
    expect(BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === 'treachery-orthanc')).toMatchObject({
      age: 2,
      standard: 'Star',
      rewards: [
        { renown: 1, shadowStanding: 1 },
        { drawTwoFateKeepOne: true },
        { drawFate: 1 }
      ]
    });
    const stream = readyRoom('treachery-orthanc-0');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 180; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'treachery-orthanc') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(2);
    expect(state.match!.activeBattleId).toBe('treachery-orthanc');
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'Treachery must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });
    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const shadowBefore = combat.match!.players[winner].standing.shadow;
    append(winner, 'battle/passed', {});
    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.match!.players[winner].renown).toBe(renownBefore + 1);
    expect(resolved.match!.players[winner].standing.shadow).toBe(shadowBefore + 1);
    expect(resolved.match!.players[winner].wonBattleIds).toContain('treachery-orthanc');
    expect(resolved.match!.pendingBattleRewardChoices).toEqual([]);
    expect(resolved.match!.pendingChoice).toBeNull();
    expect(resolved.match!.round).toBe(3);
    expect(reduceGame(stream)).toEqual(resolved);
  });

  it('orders Treachery ranked Fate choices privately and blocks every other player before Recall', () => {
    const stream = readyRoom('treachery-ranked-fate');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    for (let guard = 0; guard < 180; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'treachery-orthanc') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }

    const battleSpaces = ['minas-tirith', 'hidden-paths', 'ranger-mustering', 'osgiliath', 'edoras'];
    const used = new Set<string>();
    const deployed = new Set<string>();
    for (let guard = 0; guard < 80; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') {
        append(current, 'choice/resolved', { choice: `deploy:${Math.max(1, pending.maximum)}` });
        deployed.add(current);
      } else if (pending?.kind === 'ranger-mustering-trash') append(current, 'choice/resolved', { choice: 'decline-trash' });
      else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id])!;
        append(current, 'scout/placed', { postId: emptyPost.id });
      } else if (pending?.kind === 'osgiliath') append(current, 'choice/resolved', { choice: 'pay-0-mithril' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (deployed.size >= 2 || deployed.has(current)) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        expect(placement, `${current} must reach an unused Treachery Battle space`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }

    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.activeBattleId).toBe('treachery-orthanc');
    expect(combat.match!.battleParticipantUids).toHaveLength(2);
    const strengths = Object.fromEntries(combat.match!.battleParticipantUids.map((uid) => [uid, battleStrength(combat.match!, uid)]));
    const [left, right] = combat.match!.battleParticipantUids;
    const recipients = strengths[left] === strengths[right]
      ? [left, right]
      : [strengths[left] < strengths[right] ? left : right];
    const fateBefore = Object.fromEntries(recipients.map((uid) => [uid, combat.match!.players[uid].fateHand.length]));
    const discardBefore = combat.match!.fateDiscard.length;
    while (reduceGame(stream).match!.activeBattleId) {
      const active = reduceGame(stream);
      append(currentPlayerUid(active)!, 'battle/passed', {});
    }

    for (const expectedUid of recipients) {
      const awaiting = reduceGame(stream);
      expect(awaiting.diagnostics).toEqual([]);
      expect(awaiting.match!.round).toBe(5);
      expect(awaiting.match!.pendingChoice).toMatchObject({
        kind: 'battle-fate-keep', actorUid: expectedUid
      });
      if (awaiting.match!.pendingChoice?.kind !== 'battle-fate-keep') throw new Error('expected a private Treachery Fate choice');
      expect(awaiting.match!.pendingChoice.drawnFateIds).toHaveLength(2);
      expect(awaiting.match!.players[expectedUid].fateHand).toHaveLength(fateBefore[expectedUid] + 2);
      const unauthorized = awaiting.match!.playerOrder.find((uid) => uid !== expectedUid)!;
      const rejected = reduceGame([
        ...stream,
        createEvent('choice/resolved', unauthorized, sequences[unauthorized] + 1, {
          choice: awaiting.match!.pendingChoice.options[0]
        }, timestamp)
      ]);
      expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
      expect(rejected.match!.pendingChoice).toEqual(awaiting.match!.pendingChoice);
      append(expectedUid, 'choice/resolved', { choice: awaiting.match!.pendingChoice.options[0] });
    }

    const resolved = reduceGame(stream);
    expect(resolved.diagnostics).toEqual([]);
    for (const uid of recipients) expect(resolved.match!.players[uid].fateHand).toHaveLength(fateBefore[uid] + 1);
    expect(resolved.match!.fateDiscard).toHaveLength(discardBefore + recipients.length);
    expect(resolved.match!.pendingBattleRewardChoices).toEqual([]);
    expect(resolved.match!.pendingChoice).toBeNull();
    expect(resolved.match!.round).toBe(6);
    expect(reduceGame(stream)).toEqual(resolved);
  });

  it('plays Clash at the Morannon with its exact first-rank reward and final Star trophy', () => {
    expect(BATTLE_CARD_DEFINITIONS).toHaveLength(16);
    expect(BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === 'clash-morannon')).toMatchObject({
      age: 3,
      standard: 'Star',
      rewards: [
        { renown: 2, chooseFactionStanding: 1 },
        { renown: 1, recruitCompanies: 2 },
        { renown: 1 }
      ]
    });
    const stream = readyRoom('clash-morannon');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 200; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'clash-morannon') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.round).toBe(10);
    expect(state.match!.activeBattleId).toBe('clash-morannon');
    const winner = currentPlayerUid(state)!;
    const placement = state.match!.players[winner].hand.flatMap((card) =>
      legalAgentSpaces(state, winner, card.id)
        .filter((spaceId) => spaceId === 'minas-tirith' || spaceId === 'edoras')
        .map((spaceId) => ({ card, spaceId }))
    )[0];
    expect(placement, 'Clash at the Morannon must be reached by a real Stronghold or Roads card').toBeDefined();
    append(winner, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
    state = reduceGame(stream);
    if (state.match!.pendingChoice?.kind === 'place-scout') {
      const emptyPost = OBSERVATION_POSTS.find((post) => !state.match!.boardScouts[post.id])!;
      append(winner, 'scout/placed', { postId: emptyPost.id });
      state = reduceGame(stream);
    }
    if (state.match!.pendingChoice?.kind === 'seek-allies') {
      append(winner, 'choice/resolved', { choice: 'keep-card' });
      state = reduceGame(stream);
    }
    expect(state.match!.pendingChoice?.kind).toBe('battle-deployment');
    append(winner, 'choice/resolved', { choice: 'deploy:1' });
    for (let guard = 0; guard < 10; guard += 1) {
      state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }
    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.battleParticipantUids).toEqual([winner]);
    const renownBefore = combat.match!.players[winner].renown;
    const standingBefore = combat.match!.players[winner].standing.dwarven;
    append(winner, 'battle/passed', {});
    let awaiting = reduceGame(stream);
    expect(awaiting.diagnostics).toEqual([]);
    expect(awaiting.match!.players[winner].renown).toBe(renownBefore + 2);
    expect(awaiting.match!.players[winner].wonBattleIds).toContain('clash-morannon');
    expect(awaiting.match!.pendingChoice).toEqual({
      kind: 'battle-standing',
      actorUid: winner,
      options: ['standing-shadow', 'standing-dwarven', 'standing-elven', 'standing-wild']
    });
    expect(awaiting.match!.round).toBe(10);
    append(winner, 'choice/resolved', { choice: 'standing-dwarven' });
    awaiting = reduceGame(stream);
    expect(awaiting.diagnostics).toEqual([]);
    expect(awaiting.match!.players[winner].standing.dwarven).toBe(standingBefore + 1);
    expect(awaiting.match!.pendingBattleRewardChoices).toEqual([]);
    expect(awaiting.match!.pendingChoice).toBeNull();
    expect(awaiting.match!.round).toBe(10);
    expect(awaiting.match!.turnMode).toBe('endgame');
    expect(awaiting.match!.endgameTrigger).toBe('battle-deck');
    expect(reduceGame(stream)).toEqual(awaiting);
  });

  it('orders Clash standing authority and grants finite runner-up recruitment before Recall', () => {
    const stream = readyRoom('clash-morannon-5');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    for (let guard = 0; guard < 200; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.activeBattleId === 'clash-morannon') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }

    const battleSpaces = ['minas-tirith', 'hidden-paths', 'ranger-mustering', 'osgiliath', 'edoras'];
    const used = new Set<string>();
    const deployed = new Set<string>();
    for (let guard = 0; guard < 80; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') {
        append(current, 'choice/resolved', { choice: `deploy:${Math.max(1, pending.maximum)}` });
        deployed.add(current);
      } else if (pending?.kind === 'ranger-mustering-trash') append(current, 'choice/resolved', { choice: 'decline-trash' });
      else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id])!;
        append(current, 'scout/placed', { postId: emptyPost.id });
      } else if (pending?.kind === 'osgiliath') append(current, 'choice/resolved', { choice: 'pay-0-mithril' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (deployed.size >= 2 || deployed.has(current)) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        expect(placement, `${current} must reach an unused Morannon Battle space`).toBeDefined();
        used.add(placement!.spaceId);
        append(current, 'agent/placed', { cardInstanceId: placement!.card.id, spaceId: placement!.spaceId });
      }
    }

    const combat = reduceGame(stream);
    expect(combat.diagnostics).toEqual([]);
    expect(combat.match!.activeBattleId).toBe('clash-morannon');
    expect(combat.match!.battleParticipantUids).toHaveLength(2);
    const strengths = Object.fromEntries(combat.match!.battleParticipantUids.map((uid) => [uid, battleStrength(combat.match!, uid)]));
    const [left, right] = combat.match!.battleParticipantUids;
    expect(strengths[left]).not.toBe(strengths[right]);
    const winner = strengths[left] > strengths[right] ? left : right;
    const runner = strengths[left] < strengths[right] ? left : right;
    const winnerRenownBefore = combat.match!.players[winner].renown;
    const runnerRenownBefore = combat.match!.players[runner].renown;
    const runnerGarrisonBefore = combat.match!.players[runner].companies.garrison;
    const runnerSupplyBefore = combat.match!.players[runner].companies.supply;
    while (reduceGame(stream).match!.activeBattleId) {
      const active = reduceGame(stream);
      append(currentPlayerUid(active)!, 'battle/passed', {});
    }

    let awaiting = reduceGame(stream);
    expect(awaiting.diagnostics).toEqual([]);
    expect(awaiting.match!.players[winner].renown).toBe(winnerRenownBefore + 2);
    expect(awaiting.match!.players[runner].renown).toBe(runnerRenownBefore + 1);
    expect(awaiting.match!.players[runner].companies.garrison).toBe(
      runnerGarrisonBefore + Math.min(2, runnerSupplyBefore)
    );
    expect(awaiting.match!.pendingChoice).toMatchObject({ kind: 'battle-standing', actorUid: winner });
    const unauthorized = awaiting.match!.playerOrder.find((uid) => uid !== winner)!;
    const rejected = reduceGame([
      ...stream,
      createEvent('choice/resolved', unauthorized, sequences[unauthorized] + 1, { choice: 'standing-wild' }, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal choice resolution');
    expect(rejected.match!.pendingChoice).toEqual(awaiting.match!.pendingChoice);
    append(winner, 'choice/resolved', { choice: 'standing-wild' });
    awaiting = reduceGame(stream);
    expect(awaiting.diagnostics).toEqual([]);
    expect(awaiting.match!.pendingChoice).toBeNull();
    expect(awaiting.match!.round).toBe(10);
    expect(awaiting.match!.turnMode).toBe('endgame');
    expect(reduceGame(stream)).toEqual(awaiting);
  });

  it('exhausts the Battle deck into ordered Endgame passes and a shared deterministic result', () => {
    const stream = readyRoom('endgame-shared-victory');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };

    for (let guard = 0; guard < 220; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.turnMode === 'endgame') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else append(current, 'turn/revealed', {});
    }

    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.phase).toBe('playing');
    expect(state.match!.round).toBe(10);
    expect(state.match!.battleHistory).toHaveLength(0);
    expect(state.match!.battleDiscard).toHaveLength(10);
    expect(state.match!.turnMode).toBe('endgame');
    expect(state.match!.endgameTrigger).toBe('battle-deck');
    expect(state.match!.finalResult).toBeNull();

    const first = currentPlayerUid(state)!;
    const unauthorized = state.match!.playerOrder.find((uid) => uid !== first)!;
    const rejected = reduceGame([
      ...stream,
      createEvent('endgame/passed', unauthorized, sequences[unauthorized] + 1, {}, timestamp)
    ]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal Endgame pass');
    expect(rejected.match!.consecutiveEndgamePasses).toBe(0);

    for (let pass = 0; pass < 3; pass += 1) {
      state = reduceGame(stream);
      const actor = currentPlayerUid(state)!;
      append(actor, 'endgame/passed', {});
      state = reduceGame(stream);
      expect(state.diagnostics).toEqual([]);
      expect(state.match!.consecutiveEndgamePasses).toBe(pass + 1);
      expect(state.phase).toBe(pass < 2 ? 'playing' : 'finished');
    }

    expect(state.match!.finalResult).toEqual({
      trigger: 'battle-deck',
      winnerUids: state.match!.playerOrder,
      standings: state.match!.playerOrder.map((uid) => ({
        uid,
        rank: 1,
        renown: 0,
        mithril: 0,
        gold: 0,
        provisions: 1,
        totalStanding: 0
      }))
    });
    expect(reduceGame(stream)).toEqual(state);
  });

  it('plays Lore Beyond Price from a real draw and earned Mithril before final scoring', () => {
    const stream = readyRoom('lore-23');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (uid: string, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    let loreUid = '';
    for (let guard = 0; guard < 260; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'endgame') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      const player = match.players[current];
      if (pending?.kind === 'place-scout') {
        const post = OBSERVATION_POSTS.find((candidate) => !match.boardScouts[candidate.id])!;
        append(current, 'scout/placed', { postId: post.id });
      } else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'battle-deployment') append(current, 'choice/resolved', { choice: 'deploy:0' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (!loreUid) {
        const card = player.hand.find((candidate) => legalAgentSpaces(state, current, candidate.id).includes('hall-fire'));
        expect(card).toBeDefined();
        append(current, 'agent/placed', { cardInstanceId: card!.id, spaceId: 'hall-fire' });
        loreUid = current;
      } else if (current === loreUid && player.resources.mithril < 4 && match.richesMithril.edoras >= 4) {
        const card = player.hand.find((candidate) => legalAgentSpaces(state, current, candidate.id).includes('edoras'));
        if (card) append(current, 'agent/placed', { cardInstanceId: card.id, spaceId: 'edoras' });
        else append(current, 'turn/revealed', {});
      } else append(current, 'turn/revealed', {});
    }
    let state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.turnMode).toBe('endgame');
    expect(state.match!.players[loreUid].resources.mithril).toBeGreaterThanOrEqual(4);
    const lore = state.match!.players[loreUid].fateHand.find((card) => card.definitionId === 'lore-beyond-price');
    expect(lore).toBeDefined();
    const mithrilBefore = state.match!.players[loreUid].resources.mithril;
    const renownBefore = state.match!.players[loreUid].renown;
    append(loreUid, 'fate/played', { cardInstanceId: lore!.id });
    state = reduceGame(stream);
    expect(state.match!.players[loreUid].resources.mithril).toBe(mithrilBefore - 4);
    expect(state.match!.players[loreUid].renown).toBe(renownBefore + 1);
    expect(state.match!.fateDiscard.at(-1)).toEqual(lore);
    expect(currentPlayerUid(state)).toBe(loreUid);
    expect(state.match!.consecutiveEndgamePasses).toBe(0);
    for (let pass = 0; pass < 3; pass += 1) {
      state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'endgame/passed', {});
    }
    state = reduceGame(stream);
    expect(state.phase).toBe('finished');
    expect(state.match!.finalResult!.winnerUids).toEqual([loreUid]);
  });

  it('plays Keeper of Oaths only after earning two real Alliances', () => {
    const stream = readyRoom('keeper-4');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    const append = (state: ReturnType<typeof reduceGame>, type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
    };
    let state = reduceGame(stream);
    const keeperUid = currentPlayerUid(state)!;
    const hallCard = state.match!.players[keeperUid].hand.find((card) => legalAgentSpaces(state, keeperUid, card.id).includes('hall-fire'));
    expect(hallCard).toBeDefined();
    append(state, 'agent/placed', { cardInstanceId: hallCard!.id, spaceId: 'hall-fire' });
    state = reduceGame(stream);
    expect(state.match!.players[keeperUid].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'keeper-oaths' }));

    for (let guard = 0; guard < 500; guard += 1) {
      state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'endgame') break;
      const current = currentPlayerUid(state)!;
      const player = match.players[current];
      const pending = match.pendingChoice;
      if (pending?.kind === 'seek-allies') append(state, 'choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'battle-deployment') append(state, 'choice/resolved', { choice: 'deploy:0' });
      else if (match.turnMode === 'battle') append(state, 'battle/passed', {});
      else if (match.turnMode === 'reveal') append(state, 'reveal/finished', {});
      else if (current === keeperUid && Object.values(match.alliances).filter((uid) => uid === keeperUid).length < 2) {
        const destinations = [
          ...(player.standing.dwarven < 4 ? ['dwarven-caravans'] : []),
          ...(player.standing.shadow < 4 ? ['tribute-shadow'] : [])
        ];
        const placement = destinations.flatMap((spaceId) => player.hand
          .filter((card) => legalAgentSpaces(state, current, card.id).includes(spaceId))
          .map((card) => ({ card, spaceId })))[0];
        if (placement) append(state, 'agent/placed', { cardInstanceId: placement.card.id, spaceId: placement.spaceId });
        else append(state, 'turn/revealed', {});
      } else append(state, 'turn/revealed', {});
    }

    state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.turnMode).toBe('endgame');
    expect(state.match!.alliances.dwarven).toBe(keeperUid);
    expect(state.match!.alliances.shadow).toBe(keeperUid);
    while (currentPlayerUid(state) !== keeperUid) {
      append(state, 'endgame/passed', {});
      state = reduceGame(stream);
    }
    const keeper = state.match!.players[keeperUid].fateHand.find((card) => card.definitionId === 'keeper-oaths');
    expect(keeper).toBeDefined();
    const renownBefore = state.match!.players[keeperUid].renown;
    append(state, 'fate/played', { cardInstanceId: keeper!.id });
    state = reduceGame(stream);
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.players[keeperUid].renown).toBe(renownBefore + 1);
    expect(state.match!.fateDiscard.at(-1)).toEqual(keeper);
    expect(currentPlayerUid(state)).toBe(keeperUid);
    expect(state.match!.consecutiveEndgamePasses).toBe(0);
  });

  it('rejects Keeper of Oaths at Endgame without two Alliances', () => {
    const stream = readyRoom('keeper-4');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    let state = reduceGame(stream);
    const keeperUid = currentPlayerUid(state)!;
    const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      state = reduceGame(stream);
    };
    const hallCard = state.match!.players[keeperUid].hand.find((card) => legalAgentSpaces(state, keeperUid, card.id).includes('hall-fire'))!;
    append('agent/placed', { cardInstanceId: hallCard.id, spaceId: 'hall-fire' });
    for (let guard = 0; guard < 200 && state.match!.turnMode !== 'endgame'; guard += 1) {
      append(state.match!.turnMode === 'reveal' ? 'reveal/finished' : 'turn/revealed', {});
    }
    while (currentPlayerUid(state) !== keeperUid) append('endgame/passed', {});
    const keeper = state.match!.players[keeperUid].fateHand.find((card) => card.definitionId === 'keeper-oaths')!;
    const renownBefore = state.match!.players[keeperUid].renown;
    sequences[keeperUid] += 1;
    const rejected = reduceGame([...stream, createEvent('fate/played', keeperUid, sequences[keeperUid], { cardInstanceId: keeper.id }, timestamp)]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal Fate play');
    expect(rejected.match!.players[keeperUid].renown).toBe(renownBefore);
    expect(rejected.match!.players[keeperUid].fateHand).toContainEqual(keeper);
    expect(rejected.match!.fateDiscard).not.toContainEqual(keeper);
  });

  it('plays The Long Game only after acquiring four physical five-cost Chronicle cards', () => {
    const stream = readyRoom('catalog-proof-201');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    let state = reduceGame(stream);
    const longGameUid = currentPlayerUid(state)!;
    const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      state = reduceGame(stream);
    };
    const highCostOwned = () => {
      const player = state.match!.players[longGameUid];
      return [...player.hand, ...player.drawPile, ...player.discardPile].filter((instance) => {
        const definition = CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === instance.definitionId);
        return Boolean(definition && definition.cost >= 5);
      });
    };

    const hallCard = state.match!.players[longGameUid].hand.find((card) => legalAgentSpaces(state, longGameUid, card.id).includes('hall-fire'))!;
    append('agent/placed', { cardInstanceId: hallCard.id, spaceId: 'hall-fire' });
    expect(state.match!.players[longGameUid].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'the-long-game' }));

    for (let guard = 0; guard < 600 && state.match!.turnMode !== 'endgame'; guard += 1) {
      const match = state.match!;
      const current = currentPlayerUid(state)!;
      const player = match.players[current];
      const pending = match.pendingChoice;
      if (pending?.kind === 'place-scout') {
        const post = OBSERVATION_POSTS.find((candidate) => !match.boardScouts[candidate.id])!;
        append('scout/placed', { postId: post.id });
      } else if (pending?.kind === 'seek-allies') append('choice/resolved', { choice: 'keep-card' });
      else if (pending?.kind === 'gather-intelligence') append('choice/resolved', { choice: 'decline-intelligence' });
      else if (pending?.kind === 'chronicle-muster-fate') append('choice/resolved', { choice: 'decline-master-fate' });
      else if (match.turnMode === 'reveal') {
        if (current === longGameUid && highCostOwned().length < 4) {
          const affordableHigh = match.chronicleRow.find((instance) => {
            const definition = CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === instance.definitionId)!;
            return definition.cost >= 5 && definition.cost <= player.revealInfluence;
          });
          const affordableCycle = [...match.chronicleRow]
            .sort((left, right) => CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === left.definitionId)!.cost - CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === right.definitionId)!.cost)
            .find((instance) => CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === instance.definitionId)!.cost <= player.revealInfluence);
          const acquisition = affordableHigh ?? affordableCycle;
          if (acquisition) append('card/acquired', { definitionId: acquisition.definitionId, cardInstanceId: acquisition.id });
          else append('reveal/finished', {});
        } else append('reveal/finished', {});
      } else append('turn/revealed', {});
    }

    expect(state.diagnostics).toEqual([]);
    expect(state.match!.turnMode).toBe('endgame');
    expect(highCostOwned().length).toBeGreaterThanOrEqual(4);
    while (currentPlayerUid(state) !== longGameUid) append('endgame/passed', {});
    const longGame = state.match!.players[longGameUid].fateHand.find((card) => card.definitionId === 'the-long-game')!;
    const renownBefore = state.match!.players[longGameUid].renown;
    append('fate/played', { cardInstanceId: longGame.id });
    expect(state.diagnostics).toEqual([]);
    expect(state.match!.players[longGameUid].renown).toBe(renownBefore + 1);
    expect(state.match!.fateDiscard.at(-1)).toEqual(longGame);
    expect(currentPlayerUid(state)).toBe(longGameUid);
    expect(state.match!.consecutiveEndgamePasses).toBe(0);
  });

  it('rejects The Long Game without four owned five-cost Chronicle cards', () => {
    const stream = readyRoom('long-game-25');
    const sequences: Record<string, number> = { host: 4, 'guest-a': 3, 'guest-b': 3 };
    let timestamp = 11;
    let state = reduceGame(stream);
    const longGameUid = currentPlayerUid(state)!;
    const append = (type: Parameters<typeof createEvent>[0], payload: Record<string, unknown>) => {
      const uid = currentPlayerUid(state)!;
      sequences[uid] += 1;
      stream.push(createEvent(type, uid, sequences[uid], payload, timestamp++));
      state = reduceGame(stream);
    };
    const hallCard = state.match!.players[longGameUid].hand.find((card) => legalAgentSpaces(state, longGameUid, card.id).includes('hall-fire'))!;
    append('agent/placed', { cardInstanceId: hallCard.id, spaceId: 'hall-fire' });
    for (let guard = 0; guard < 220 && state.match!.turnMode !== 'endgame'; guard += 1) {
      append(state.match!.turnMode === 'reveal' ? 'reveal/finished' : 'turn/revealed', {});
    }
    while (currentPlayerUid(state) !== longGameUid) append('endgame/passed', {});
    const longGame = state.match!.players[longGameUid].fateHand.find((card) => card.definitionId === 'the-long-game')!;
    const renownBefore = state.match!.players[longGameUid].renown;
    sequences[longGameUid] += 1;
    const rejected = reduceGame([...stream, createEvent('fate/played', longGameUid, sequences[longGameUid], { cardInstanceId: longGame.id }, timestamp)]);
    expect(rejected.diagnostics.at(-1)).toContain('illegal Fate play');
    expect(rejected.match!.players[longGameUid].renown).toBe(renownBefore);
    expect(rejected.match!.players[longGameUid].fateHand).toContainEqual(longGame);
    expect(rejected.match!.fateDiscard).not.toContainEqual(longGame);
  });

  it('runs a three-player Battle from legal deployments through ranked rewards and cleanup', () => {
    const stream = readyRoom('battle-reinforce-1796691');
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
    expect(resolved.match!.players[expectedWinner].wonBattleIds).toEqual(['raid-westfold']);
    expect(Object.values(resolved.match!.battleCompanies)).toEqual([0, 0, 0]);
    expect(resolved.match!.players[expectedWinner].resources.provisions).toBeGreaterThanOrEqual(2);

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
      else if (Object.values(match.battleCompanies).some((amount) => amount > 0)) append(current, 'turn/revealed', {});
      else {
        const placement = match.players[current].hand.flatMap((card) => legalAgentSpaces(state, current, card.id)
          .filter((spaceId) => battleSpaces.includes(spaceId) && !used.has(spaceId))
          .map((spaceId) => ({ card, spaceId })))[0];
        if (placement) {
          used.add(placement.spaceId);
          append(current, 'agent/placed', { cardInstanceId: placement.card.id, spaceId: placement.spaceId });
        } else append(current, 'turn/revealed', {});
      }
    }
    expect(reduceGame(stream).match!.activeBattleId).toBe('siege-minas-tirith');
    while (reduceGame(stream).match!.turnMode === 'battle') {
      const state = reduceGame(stream);
      append(currentPlayerUid(state)!, 'battle/passed', {});
    }
    let afterSiege = reduceGame(stream);
    const controller = afterSiege.match!.criticalControl['minas-tirith'];
    expect(controller).not.toBeNull();
    expect(afterSiege.match!.players[controller!].renown).toBeGreaterThanOrEqual(1);
    expect(afterSiege.match!.players[controller!].wonBattleIds).toContain('siege-minas-tirith');
    expect(afterSiege.match!.battleCompanies[controller!] ?? 0).toBe(0);
    for (let guard = 0; guard < 80 && afterSiege.match!.activeBattleId !== 'battle-pelennor-fields'; guard += 1) {
      const current = currentPlayerUid(afterSiege)!;
      if (afterSiege.match!.pendingChoice?.kind === 'critical-defense') append(afterSiege.match!.pendingChoice.actorUid, 'choice/resolved', { choice: 'decline-defender' });
      else if (afterSiege.match!.pendingChoice?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (afterSiege.match!.turnMode === 'battle') append(current, 'battle/passed', {});
      else if (afterSiege.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (
        current === controller &&
        afterSiege.match!.players[current].fateHand.filter((card) => card.definitionId === 'reinforcements').length < 2
      ) {
        const fatePlacement = afterSiege.match!.players[current].hand.flatMap((card) =>
          legalAgentSpaces(afterSiege, current, card.id)
            .filter((spaceId) => spaceId === 'hall-fire' || spaceId === 'hidden-counsel')
            .map((spaceId) => ({ card, spaceId }))
        )[0];
        if (fatePlacement) append(current, 'agent/placed', { cardInstanceId: fatePlacement.card.id, spaceId: fatePlacement.spaceId });
        else append(current, 'turn/revealed', {});
      } else append(current, 'turn/revealed', {});
      afterSiege = reduceGame(stream);
    }
    expect(afterSiege.diagnostics).toEqual([]);
    expect(afterSiege.match!.activeBattleId).toBe('battle-pelennor-fields');
    expect(afterSiege.match!.pendingChoice).toMatchObject({
      kind: 'critical-defense', actorUid: controller, locationId: 'minas-tirith'
    });
    expect(afterSiege.match!.activity).toContain('The controller of Minas Tirith may deploy 1 defending Company from supply.');
    append(controller!, 'choice/resolved', { choice: 'deploy-defender' });
    const afterDefense = reduceGame(stream);
    expect(afterDefense.match!.battleCompanies[controller!]).toBe(1);
    expect(afterDefense.match!.activity).toContain(`${afterDefense.players.find((player) => player.uid === controller)?.displayName} deploys 1 defending Company from supply at Minas Tirith.`);

    const renownBeforePelennor = afterDefense.match!.players[controller!].renown;
    let controllerDrewFirstReinforcements = afterDefense.match!.players[controller!].fateHand
      .filter((card) => card.definitionId === 'reinforcements').length >= 1;
    let controllerDrewSecondReinforcements = afterDefense.match!.players[controller!].fateHand
      .filter((card) => card.definitionId === 'reinforcements').length >= 2;
    for (let guard = 0; guard < 12; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (current === controller && !controllerDrewFirstReinforcements) {
        const hallCard = state.match!.players[current].hand.find((card) => legalAgentSpaces(state, current, card.id).includes('hall-fire'));
        expect(hallCard, 'the controller must have a real Council card for Hall of Fire').toBeDefined();
        append(current, 'agent/placed', { cardInstanceId: hallCard!.id, spaceId: 'hall-fire' });
        controllerDrewFirstReinforcements = true;
        expect(reduceGame(stream).match!.players[current].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'reinforcements' }));
      } else if (current === controller && !controllerDrewSecondReinforcements) {
        const counselCard = state.match!.players[current].hand.find((card) => legalAgentSpaces(state, current, card.id).includes('hidden-counsel'));
        expect(counselCard, 'the controller must have a real faction card for Hidden Counsel').toBeDefined();
        append(current, 'agent/placed', { cardInstanceId: counselCard!.id, spaceId: 'hidden-counsel' });
        const pending = reduceGame(stream).match!.pendingChoice;
        if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
        controllerDrewSecondReinforcements = true;
        expect(reduceGame(stream).match!.players[current].fateHand.filter((card) => card.definitionId === 'reinforcements')).toHaveLength(2);
      } else append(current, 'turn/revealed', {});
    }
    const pelennorCombat = reduceGame(stream);
    expect(pelennorCombat.match!.turnMode).toBe('battle');
    expect(Object.entries(pelennorCombat.match!.battleCompanies).filter(([, amount]) => amount > 0)).toEqual([[controller, 1]]);
    expect(pelennorCombat.match!.players[controller!].companies.garrison).toBe(1);
    const reinforcements = pelennorCombat.match!.players[controller!].fateHand.filter((card) => card.definitionId === 'reinforcements');
    expect(reinforcements).toHaveLength(2);
    const strengthBeforeReinforcements = battleStrength(pelennorCombat.match!, controller!);
    append(controller!, 'fate/played', { cardInstanceId: reinforcements[0].id });
    const afterReinforcements = reduceGame(stream);
    expect(afterReinforcements.match!.battleCompanies[controller!]).toBe(2);
    expect(afterReinforcements.match!.players[controller!].companies.garrison).toBe(0);
    expect(battleStrength(afterReinforcements.match!, controller!)).toBe(strengthBeforeReinforcements + 2);
    expect(afterReinforcements.match!.fateDiscard.at(-1)?.definitionId).toBe('reinforcements');
    expect(afterReinforcements.match!.activity).toContain(`${afterReinforcements.players.find((player) => player.uid === controller)?.displayName} plays Reinforcements and deploys 1 Company from garrison.`);
    const strengthBeforeFallback = battleStrength(afterReinforcements.match!, controller!);
    append(controller!, 'fate/played', { cardInstanceId: reinforcements[1].id });
    const afterFallback = reduceGame(stream);
    expect(afterFallback.match!.battleCompanies[controller!]).toBe(2);
    expect(afterFallback.match!.players[controller!].companies.garrison).toBe(0);
    expect(battleStrength(afterFallback.match!, controller!)).toBe(strengthBeforeFallback + 2);
    expect(afterFallback.match!.fateDiscard.at(-1)?.definitionId).toBe('reinforcements');
    expect(afterFallback.match!.activity).toContain(`${afterFallback.players.find((player) => player.uid === controller)?.displayName} plays Reinforcements with no Company available and gains +2 Strength.`);
    append(controller!, 'battle/passed', {});
    const afterPelennor = reduceGame(stream);
    expect(afterPelennor.diagnostics).toEqual([]);
    expect(afterPelennor.match!.players[controller!].wonBattleIds).toEqual(expect.arrayContaining([
      'siege-minas-tirith',
      'battle-pelennor-fields'
    ]));
    expect(afterPelennor.match!.players[controller!].pairedBattleIds).toEqual([
      'siege-minas-tirith',
      'battle-pelennor-fields'
    ]);
    expect(afterPelennor.match!.players[controller!].renown).toBe(renownBeforePelennor + 3);
    expect(afterPelennor.match!.activity).toContain('White Tree Standards are paired face down for 1 Renown.');

    const controllerGold = afterPelennor.match!.players[controller!].resources.gold;
    for (let guard = 0; guard < 12; guard += 1) {
      const state = reduceGame(stream);
      if (state.match!.boardAgents['minas-tirith']) break;
      const current = currentPlayerUid(state)!;
      if (state.match!.pendingChoice?.kind === 'critical-defense') append(state.match!.pendingChoice.actorUid, 'choice/resolved', { choice: 'decline-defender' });
      else if (state.match!.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else {
        const player = state.match!.players[current];
        const strongholdCard = player.hand.find((card) => legalAgentSpaces(state, current, card.id).includes('minas-tirith'));
        if (strongholdCard) append(current, 'agent/placed', { cardInstanceId: strongholdCard.id, spaceId: 'minas-tirith' });
        else append(current, 'turn/revealed', {});
      }
    }
    const afterVisit = reduceGame(stream);
    expect(afterVisit.match!.boardAgents['minas-tirith'], `round ${afterVisit.match!.round}, mode ${afterVisit.match!.turnMode}, pending ${afterVisit.match!.pendingChoice?.kind ?? 'none'}, diagnostics ${afterVisit.diagnostics.at(-1) ?? 'none'}`).toBeDefined();
    expect(afterVisit.match!.players[controller!].resources.gold).toBe(controllerGold + 1);
    const helmParticipant = afterVisit.match!.boardAgents['minas-tirith'][0].uid;

    let drewDesperateValor = false;
    for (let guard = 0; guard < 24; guard += 1) {
      const state = reduceGame(stream);
      const match = state.match!;
      if (match.turnMode === 'battle') break;
      const current = currentPlayerUid(state)!;
      const pending = match.pendingChoice;
      if (pending?.kind === 'battle-deployment') append(current, 'choice/resolved', { choice: `deploy:${pending.maximum}` });
      else if (pending?.kind === 'gather-intelligence') append(current, 'choice/resolved', { choice: 'decline-intelligence' });
      else if (pending?.kind === 'place-scout') {
        const emptyPost = OBSERVATION_POSTS.find((post) => !match.boardScouts[post.id])!;
        append(current, 'scout/placed', { postId: emptyPost.id });
      } else if (pending?.kind === 'seek-allies') append(current, 'choice/resolved', { choice: 'keep-card' });
      else if (match.turnMode === 'reveal') append(current, 'reveal/finished', {});
      else if (current === helmParticipant && !drewDesperateValor) {
        const fatePlacement = match.players[current].hand.flatMap((card) =>
          legalAgentSpaces(state, current, card.id)
            .filter((spaceId) => spaceId === 'hall-fire' || spaceId === 'hidden-counsel')
            .map((spaceId) => ({ card, spaceId }))
        )[0];
        expect(fatePlacement, 'the Helm’s Deep participant must retain a real Fate-draw placement').toBeDefined();
        append(current, 'agent/placed', { cardInstanceId: fatePlacement!.card.id, spaceId: fatePlacement!.spaceId });
        drewDesperateValor = true;
        expect(reduceGame(stream).match!.players[current].fateHand).toContainEqual(expect.objectContaining({ definitionId: 'desperate-valor' }));
      } else append(current, 'turn/revealed', {});
    }
    const helmsDeepCombat = reduceGame(stream);
    expect(helmsDeepCombat.match!.activeBattleId).toBe('battle-helms-deep');
    expect(helmsDeepCombat.match!.turnMode).toBe('battle');
    expect(helmsDeepCombat.match!.battleParticipantUids).toEqual([helmParticipant]);
    const companiesBeforeValor = helmsDeepCombat.match!.battleCompanies[helmParticipant];
    expect(companiesBeforeValor).toBeGreaterThan(0);
    const valor = helmsDeepCombat.match!.players[helmParticipant].fateHand.find((card) => card.definitionId === 'desperate-valor')!;
    const supplyBeforeValor = helmsDeepCombat.match!.players[helmParticipant].companies.supply;
    append(helmParticipant, 'fate/played', { cardInstanceId: valor.id });
    const afterValor = reduceGame(stream);
    expect(afterValor.match!.battleCompanies[helmParticipant]).toBe(companiesBeforeValor - 1);
    expect(afterValor.match!.players[helmParticipant].companies.supply).toBe(supplyBeforeValor + 1);
    expect(battleStrength(afterValor.match!, helmParticipant)).toBe(companiesBeforeValor === 1
      ? 0
      : battleStrength(helmsDeepCombat.match!, helmParticipant) + 3);
    expect(afterValor.match!.battleParticipantUids).toEqual([helmParticipant]);
    expect(afterValor.match!.activity).toContain(`${afterValor.players.find((player) => player.uid === helmParticipant)?.displayName} plays Desperate Valor, returns 1 Company to supply, and gains +5 Strength.`);
    append(helmParticipant, 'battle/passed', {});
    const afterHelmsDeep = reduceGame(stream);
    expect(afterHelmsDeep.diagnostics).toEqual([]);
    expect(afterHelmsDeep.match!.criticalControl.edoras).toBe(companiesBeforeValor === 1 ? null : helmParticipant);
  });
});
