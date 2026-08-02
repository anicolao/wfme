import type { GameEvent } from './events';
import { REDUCER_VERSION, SCHEMA_VERSION } from './events';
import {
  AGENT_CARD_DEFINITIONS,
  BOARD_SPACE_DEFINITIONS,
  COMMANDERS,
  MUSTER_CARD_DEFINITIONS,
  RESERVE_CARD_DEFINITIONS,
  STARTING_CARD_IDENTITIES,
  type CommanderId,
  type ReserveCardId
} from './manifest';
import { shuffled } from './prng';

export type LobbyPlayer = {
  uid: string;
  displayName: string;
  seat: number;
  commander: CommanderId | null;
  ready: boolean;
};

export type CardInstance = {
  id: string;
  definitionId: string;
};

export type MatchPlayer = {
  uid: string;
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  journey: CardInstance[];
  muster: CardInstance[];
  revealInfluence: number;
  revealedSwords: number;
  revealedThisRound: boolean;
  renown: number;
  availableAgents: number;
  resources: { gold: number; mithril: number; provisions: number };
  standing: { shadow: number; dwarven: number; elven: number; wild: number };
  companies: { supply: number; garrison: number };
};

export type AgentOccupation = {
  uid: string;
  agentNumber: number;
};

export type MatchState = {
  seed: string;
  round: number;
  playerOrder: string[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  turnMode: 'agent' | 'reveal';
  players: Record<string, MatchPlayer>;
  boardAgents: Record<string, AgentOccupation>;
  pendingChoice: null | {
    kind: 'muster-free-peoples';
    actorUid: string;
    options: readonly ['pay-2-gold', 'decline'];
  };
  reserveSupply: Record<ReserveCardId, number>;
  activity: string[];
};

export type GameState = {
  roomCode: string | null;
  hostUid: string | null;
  phase: 'lobby' | 'playing';
  players: LobbyPlayer[];
  match: MatchState | null;
  diagnostics: string[];
  eventCount: number;
};

export const EMPTY_GAME: GameState = {
  roomCode: null,
  hostUid: null,
  phase: 'lobby',
  players: [],
  match: null,
  diagnostics: [],
  eventCount: 0
};

function displayName(payload: Record<string, unknown>): string | null {
  const value = payload.displayName;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 32 ? trimmed : null;
}

function startingDeck(uid: string, seat: number, seed: string): CardInstance[] {
  const instances = STARTING_CARD_IDENTITIES.flatMap((definition) =>
    Array.from({ length: definition.copies }, (_, index) => ({
      id: `${uid}:starting:${definition.id}:${index + 1}`,
      definitionId: definition.id
    }))
  );
  // Anonymous Firebase UIDs are deliberately not part of game randomness. A
  // published seed must reproduce the same setup for humans, tests, and replay.
  return shuffled(instances, `${seed}:seat-${seat}:starting-deck`);
}

function createMatch(state: GameState, seed: string): MatchState {
  const playerOrder = shuffled(
    state.players.map((player) => player.uid),
    `${seed}:player-order`
  );
  const players = Object.fromEntries(
    state.players.map((player) => {
      const deck = startingDeck(player.uid, player.seat, seed);
      return [
        player.uid,
        {
          uid: player.uid,
          hand: deck.slice(0, 5),
          drawPile: deck.slice(5),
          discardPile: [],
          journey: [],
          muster: [],
          revealInfluence: 0,
          revealedSwords: 0,
          revealedThisRound: false,
          renown: 0,
          availableAgents: 2,
          resources: { gold: 0, mithril: 0, provisions: 1 },
          standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 },
          companies: { supply: 9, garrison: 3 }
        }
      ];
    })
  );
  return {
    seed,
    round: 1,
    playerOrder,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    turnMode: 'agent',
    players,
    boardAgents: {},
    pendingChoice: null,
    reserveSupply: { 'muster-host': 8 },
    activity: [`The seeded match begins. ${state.players.find((player) => player.uid === playerOrder[0])?.displayName ?? 'Seat 1'} acts first.`]
  };
}

function commanderId(value: unknown): CommanderId | null {
  return typeof value === 'string' && COMMANDERS.some((commander) => commander.id === value)
    ? (value as CommanderId)
    : null;
}

export function currentPlayerUid(state: GameState): string | null {
  if (!state.match) return null;
  return state.match.playerOrder[state.match.currentPlayerIndex] ?? null;
}

export function legalAgentSpaces(state: GameState, actorUid: string, cardInstanceId: string): string[] {
  const match = state.match;
  const player = match?.players[actorUid];
  if (!match || match.turnMode !== 'agent' || match.pendingChoice || !player || currentPlayerUid(state) !== actorUid || player.availableAgents < 1) return [];
  const card = player.hand.find((candidate) => candidate.id === cardInstanceId);
  const definition = card && AGENT_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId);
  if (!definition) return [];
  return BOARD_SPACE_DEFINITIONS.filter(
    (space) =>
      !match.boardAgents[space.id] &&
      definition.placementIcons.some((icon) => space.placementIcons.includes(icon))
  ).map((space) => space.id);
}

function advanceToNextAgentPlayer(match: MatchState): void {
  for (let offset = 1; offset <= match.playerOrder.length; offset += 1) {
    const index = (match.currentPlayerIndex + offset) % match.playerOrder.length;
    if (!match.players[match.playerOrder[index]].revealedThisRound) {
      match.currentPlayerIndex = index;
      return;
    }
  }
}

function drawToFive(match: MatchState, uid: string): void {
  const player = match.players[uid];
  while (player.hand.length < 5) {
    if (player.drawPile.length === 0 && player.discardPile.length > 0) {
      const seat = match.playerOrder.indexOf(uid) + 1;
      player.drawPile = shuffled(player.discardPile, `${match.seed}:round-${match.round}:seat-${seat}:reshuffle`);
      player.discardPile = [];
    }
    const card = player.drawPile.shift();
    if (!card) break;
    player.hand.push(card);
  }
}

function recallAndBeginNextRound(match: MatchState): void {
  match.round += 1;
  match.boardAgents = {};
  match.pendingChoice = null;
  match.turnMode = 'agent';
  for (const uid of match.playerOrder) {
    const player = match.players[uid];
    player.availableAgents = 2;
    player.revealedThisRound = false;
    player.revealInfluence = 0;
    player.revealedSwords = 0;
    drawToFive(match, uid);
  }
  match.firstPlayerIndex = (match.firstPlayerIndex + 1) % match.playerOrder.length;
  match.currentPlayerIndex = match.firstPlayerIndex;
  match.activity.push(`Recall completes. Round ${match.round} begins.`);
}

function applyEvent(state: GameState, event: GameEvent): string | null {
  if (event.type === 'game/created') {
    const roomCode = event.payload.roomCode;
    const name = displayName(event.payload);
    if (state.roomCode || typeof roomCode !== 'string' || !/^[A-Z0-9]{5}$/.test(roomCode) || !name) {
      return 'invalid game creation';
    }
    state.roomCode = roomCode;
    state.hostUid = event.actorUid;
    state.players.push({ uid: event.actorUid, displayName: name, seat: 1, commander: null, ready: false });
    return null;
  }

  if (!state.roomCode) return 'game does not exist';

  if (event.type === 'player/joined') {
    const name = displayName(event.payload);
    if (
      state.phase !== 'lobby' ||
      !name ||
      state.players.length >= 4 ||
      state.players.some((player) => player.uid === event.actorUid)
    ) return 'invalid player join';
    state.players.push({
      uid: event.actorUid,
      displayName: name,
      seat: state.players.length + 1,
      commander: null,
      ready: false
    });
    return null;
  }

  const actor = state.players.find((player) => player.uid === event.actorUid);
  if (!actor) return 'actor has no seat';

  if (event.type === 'player/commander-selected') {
    const requested = commanderId(event.payload.commanderId);
    if (
      state.phase !== 'lobby' ||
      !requested ||
      state.players.some((player) => player.uid !== actor.uid && player.commander === requested)
    ) return 'invalid Commander selection';
    actor.commander = requested;
    actor.ready = false;
    return null;
  }

  if (event.type === 'player/ready') {
    if (state.phase !== 'lobby' || !actor.commander || typeof event.payload.ready !== 'boolean') {
      return 'invalid ready state';
    }
    actor.ready = event.payload.ready;
    return null;
  }

  if (event.type === 'match/started') {
    const seed = event.payload.seed;
    if (
      state.phase !== 'lobby' ||
      event.actorUid !== state.hostUid ||
      state.players.length < 3 ||
      !state.players.every((player) => player.commander && player.ready) ||
      typeof seed !== 'string' ||
      seed.trim().length < 3
    ) return 'invalid match start';
    state.match = createMatch(state, seed.trim());
    state.phase = 'playing';
    return null;
  }

  if (event.type === 'agent/placed') {
    const cardInstanceId = event.payload.cardInstanceId;
    const spaceId = event.payload.spaceId;
    if (
      state.phase !== 'playing' ||
      typeof cardInstanceId !== 'string' ||
      typeof spaceId !== 'string' ||
      !legalAgentSpaces(state, event.actorUid, cardInstanceId).includes(spaceId) ||
      !state.match
    ) return 'illegal Agent placement';
    const player = state.match.players[event.actorUid];
    const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === spaceId)!;
    const cardIndex = player.hand.findIndex((card) => card.id === cardInstanceId);
    const [card] = player.hand.splice(cardIndex, 1);
    const cardDefinition = AGENT_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId)!;
    player.journey.push(card);
    const agentNumber = 3 - player.availableAgents;
    player.availableAgents -= 1;
    state.match.boardAgents[spaceId] = { uid: event.actorUid, agentNumber };
    let resolution: string;
    if (cardDefinition.journeyEffect?.recruitCompanies) {
      const recruited = Math.min(cardDefinition.journeyEffect.recruitCompanies, player.companies.supply);
      player.companies.supply -= recruited;
      player.companies.garrison += recruited;
    }
    if (space.effect.kind === 'dwarven-caravans') {
      player.resources.provisions += space.effect.gainProvisions;
      player.standing.dwarven += 1;
      resolution = 'gaining 1 Dwarven standing and 1 Provision';
    } else if (space.effect.kind === 'tribute-shadow') {
      player.resources.gold += space.effect.gainGold;
      player.standing.shadow += 1;
      resolution = 'gaining 1 Shadow standing and 2 Gold';
    } else if (space.effect.kind === 'take-war-effort') {
      const drawn = player.drawPile.shift();
      if (drawn) player.hand.push(drawn);
      player.resources.gold += space.effect.gainGoldWithoutModule;
      resolution = `drawing ${drawn ? '1 card' : 'no card'} and gaining 2 Gold because War Efforts are disabled`;
    } else {
      const recruited = Math.min(space.effect.recruitCompanies, player.companies.supply);
      player.companies.supply -= recruited;
      player.companies.garrison += recruited;
      resolution = `recruiting ${recruited} Companies`;
      if (player.resources.gold >= space.effect.optionalGoldCost) {
        state.match.pendingChoice = {
          kind: 'muster-free-peoples',
          actorUid: event.actorUid,
          options: ['pay-2-gold', 'decline']
        };
      }
    }
    state.match.activity.push(`${actor.displayName} sends an Agent to ${space.name}, ${resolution}.`);
    if (!state.match.pendingChoice) advanceToNextAgentPlayer(state.match);
    return null;
  }

  if (event.type === 'choice/resolved') {
    const choice = event.payload.choice;
    const pending = state.match?.pendingChoice;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      !pending ||
      pending.actorUid !== event.actorUid ||
      currentPlayerUid(state) !== event.actorUid ||
      (choice !== 'pay-2-gold' && choice !== 'decline')
    ) return 'illegal choice resolution';
    const player = state.match.players[event.actorUid];
    if (choice === 'pay-2-gold') {
      if (player.resources.gold < 2) return 'illegal choice resolution';
      player.resources.gold -= 2;
      player.resources.provisions += 1;
      state.match.activity.push(`${actor.displayName} pays 2 Gold for 1 Provision.`);
    } else {
      state.match.activity.push(`${actor.displayName} keeps their Gold.`);
    }
    state.match.pendingChoice = null;
    advanceToNextAgentPlayer(state.match);
    return null;
  }

  if (event.type === 'turn/revealed') {
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'agent' ||
      state.match.pendingChoice ||
      currentPlayerUid(state) !== event.actorUid
    ) return 'illegal Reveal';
    const player = state.match.players[event.actorUid];
    player.muster.push(...player.hand.splice(0));
    player.revealInfluence = player.muster.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.influence ?? 0), 0);
    player.revealedSwords = player.muster.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.swords ?? 0), 0);
    state.match.turnMode = 'reveal';
    state.match.activity.push(`${actor.displayName} Reveals ${player.muster.length} cards for ${player.revealInfluence} Influence and ${player.revealedSwords} swords.`);
    return null;
  }

  if (event.type === 'card/acquired') {
    const definitionId = event.payload.definitionId;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'reveal' ||
      currentPlayerUid(state) !== event.actorUid ||
      typeof definitionId !== 'string'
    ) return 'illegal acquisition';
    const definition = RESERVE_CARD_DEFINITIONS.find((card) => card.id === definitionId);
    const player = state.match.players[event.actorUid];
    if (!definition || definition.cost > player.revealInfluence || state.match.reserveSupply[definition.id] < 1) {
      return 'illegal acquisition';
    }
    const copy = definition.copies - state.match.reserveSupply[definition.id] + 1;
    state.match.reserveSupply[definition.id] -= 1;
    player.revealInfluence -= definition.cost;
    player.renown += definition.onAcquireRenown;
    player.discardPile.push({ id: `reserve:${definition.id}:${copy}`, definitionId: definition.id });
    state.match.activity.push(`${actor.displayName} acquires ${definition.name} for ${definition.cost} Influence.`);
    return null;
  }

  if (event.type === 'reveal/finished') {
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'reveal' ||
      currentPlayerUid(state) !== event.actorUid
    ) return 'illegal Reveal finish';
    const player = state.match.players[event.actorUid];
    player.discardPile.push(...player.journey.splice(0), ...player.muster.splice(0));
    player.revealInfluence = 0;
    player.revealedSwords = 0;
    player.revealedThisRound = true;
    state.match.turnMode = 'agent';
    state.match.activity.push(`${actor.displayName} finishes their Reveal turn.`);
    if (state.match.playerOrder.every((uid) => state.match!.players[uid].revealedThisRound)) {
      recallAndBeginNextRound(state.match);
    } else {
      advanceToNextAgentPlayer(state.match);
    }
    return null;
  }

  return 'unsupported event';
}

export function reduceGame(events: readonly GameEvent[]): GameState {
  const state = structuredClone(EMPTY_GAME);
  const seenIds = new Set<string>();
  const ordered = [...events].sort(
    (left, right) => left.createdAtMillis - right.createdAtMillis || left.id.localeCompare(right.id)
  );
  for (const event of ordered) {
    if (seenIds.has(event.id)) {
      state.diagnostics.push(`${event.id}: duplicate event ID`);
      continue;
    }
    seenIds.add(event.id);
    if (event.schemaVersion !== SCHEMA_VERSION || event.reducerVersion !== REDUCER_VERSION) {
      state.diagnostics.push(`${event.id}: incompatible version`);
      continue;
    }
    const before = structuredClone(state);
    const error = applyEvent(state, event);
    if (error) {
      Object.assign(state, before);
      state.diagnostics.push(`${event.id}: ${error}`);
      continue;
    }
    state.eventCount += 1;
  }
  return state;
}
