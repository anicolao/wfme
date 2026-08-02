import type { GameEvent } from './events';
import { REDUCER_VERSION, SCHEMA_VERSION } from './events';
import {
  AGENT_CARD_DEFINITIONS,
  BOARD_SPACE_DEFINITIONS,
  COMMANDERS,
  MUSTER_CARD_DEFINITIONS,
  OBSERVATION_POSTS,
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

export type FateInstance = { id: string };

export type MatchPlayer = {
  uid: string;
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  trashPile: CardInstance[];
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
  scouts: { supply: number };
  fateHand: FateInstance[];
  councilSeat: boolean;
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
  boardAgents: Record<string, AgentOccupation[]>;
  boardScouts: Record<string, string>;
  fateDeck: FateInstance[];
  fateDiscard: FateInstance[];
  pendingChoice: null | {
    kind: 'muster-free-peoples';
    actorUid: string;
    options: readonly ['pay-2-gold', 'decline'];
  } | {
    kind: 'elven-favor';
    actorUid: string;
    drawnFateIds: readonly string[];
    followupSeekAlliesCardId: string | null;
    options: readonly string[];
  } | {
    kind: 'seek-allies';
    actorUid: string;
    cardInstanceId: string;
    options: readonly ['trash-self', 'keep-card'];
  } | {
    kind: 'place-scout';
    actorUid: string;
    options: readonly [];
  } | {
    kind: 'gather-intelligence';
    actorUid: string;
    cardInstanceId: string;
    spaceId: string;
    postIds: readonly string[];
    options: readonly string[];
  };
  reserveSupply: Record<ReserveCardId, number>;
  alliances: Record<'shadow' | 'dwarven' | 'elven' | 'wild', string | null>;
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
          trashPile: [],
          journey: [],
          muster: [],
          revealInfluence: 0,
          revealedSwords: 0,
          revealedThisRound: false,
          renown: 0,
          availableAgents: 2,
          resources: { gold: 0, mithril: 0, provisions: 1 },
          standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 },
          companies: { supply: 9, garrison: 3 },
          scouts: { supply: 3 },
          fateHand: [],
          councilSeat: false
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
    boardScouts: {},
    fateDeck: shuffled(Array.from({ length: 30 }, (_, index) => ({ id: `fate:${index + 1}` })), `${seed}:fate-deck`),
    fateDiscard: [],
    pendingChoice: null,
    reserveSupply: { 'muster-host': 8 },
    alliances: { shadow: null, dwarven: null, elven: null, wild: null },
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
  return BOARD_SPACE_DEFINITIONS.filter((space) => {
    if (space.effect.kind === 'white-council-seat' && player.resources.gold < space.effect.costGold) return false;
    const connectedOwnScout = OBSERVATION_POSTS.some(
      (post) => post.connectedSpaceIds.includes(space.id) && match.boardScouts[post.id] === actorUid
    );
    const iconMatches = definition.placementIcons.some((icon) => space.placementIcons.includes(icon))
      || (definition.placementIcons.includes('Scout') && connectedOwnScout);
    const occupants = match.boardAgents[space.id] ?? [];
    const canInfiltrate = connectedOwnScout && occupants.some((occupant) => occupant.uid !== actorUid);
    return iconMatches && (occupants.length === 0 || canInfiltrate);
  }).map((space) => space.id);
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

function recruitCompanies(player: MatchPlayer, amount: number): number {
  const recruited = Math.min(amount, player.companies.supply);
  player.companies.supply -= recruited;
  player.companies.garrison += recruited;
  return recruited;
}

function gainStanding(
  match: MatchState,
  player: MatchPlayer,
  faction: 'shadow' | 'dwarven' | 'elven' | 'wild',
  followupSeekAlliesCardId: string | null = null
): void {
  const before = player.standing[faction];
  player.standing[faction] = Math.min(6, before + 1);
  const after = player.standing[faction];
  if (before < 2 && after >= 2) player.renown += 1;
  if (before < 4 && after >= 4) {
    if (faction === 'shadow') recruitCompanies(player, 2);
    if (faction === 'dwarven') player.resources.provisions += 2;
    if (faction === 'elven') {
      const drawn = match.fateDeck.splice(0, 2);
      player.fateHand.push(...drawn);
      if (drawn.length > 1) {
        match.pendingChoice = {
          kind: 'elven-favor',
          actorUid: player.uid,
          drawnFateIds: drawn.map((fate) => fate.id),
          followupSeekAlliesCardId,
          options: drawn.map((fate) => `keep:${fate.id}`)
        };
      }
    }
    if (faction === 'wild') {
      player.resources.provisions += 1;
      recruitCompanies(player, 1);
    }
  }
  const holder = match.alliances[faction];
  if (after >= 4 && (!holder || match.players[holder].standing[faction] < after)) {
    if (holder) match.players[holder].renown -= 1;
    match.alliances[faction] = player.uid;
    player.renown += 1;
  }
}

function resolveAgentEffects(
  state: GameState,
  actorName: string,
  actorUid: string,
  card: CardInstance,
  space: (typeof BOARD_SPACE_DEFINITIONS)[number]
): void {
  const match = state.match!;
  const player = match.players[actorUid];
  const cardDefinition = AGENT_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId)!;
  const seekAlliesCardId = cardDefinition.journeyEffect?.kind === 'optional-trash-self' ? card.id : null;
  let resolution: string;
  if (cardDefinition.journeyEffect?.kind === 'recruit-companies') {
    recruitCompanies(player, cardDefinition.journeyEffect.amount);
  }
  if (space.effect.kind === 'dwarven-caravans') {
    player.resources.provisions += space.effect.gainProvisions;
    gainStanding(match, player, 'dwarven');
    resolution = 'gaining 1 Dwarven standing and 1 Provision';
  } else if (space.effect.kind === 'tribute-shadow') {
    player.resources.gold += space.effect.gainGold;
    gainStanding(match, player, 'shadow');
    resolution = 'gaining 1 Shadow standing and 2 Gold';
  } else if (space.effect.kind === 'hidden-counsel') {
    gainStanding(match, player, 'elven', seekAlliesCardId);
    const drawn = match.fateDeck.shift();
    if (drawn) player.fateHand.push(drawn);
    let transfers = 0;
    for (const opponentUid of match.playerOrder.filter((uid) => uid !== actorUid)) {
      const opponent = match.players[opponentUid];
      if (opponent.fateHand.length < space.effect.stealFromOpponentsAtFateCount) continue;
      const [transferred] = shuffled(
        opponent.fateHand,
        `${match.seed}:round-${match.round}:hidden-counsel:${actorUid}:${opponentUid}:${match.activity.length}`
      );
      opponent.fateHand.splice(opponent.fateHand.findIndex((fate) => fate.id === transferred.id), 1);
      player.fateHand.push(transferred);
      transfers += 1;
    }
    resolution = `gaining 1 Elven standing, drawing ${drawn ? '1 Fate' : 'no Fate'}, and receiving ${transfers} Fate from opponents holding four or more`;
  } else if (space.effect.kind === 'take-war-effort') {
    const drawn = player.drawPile.shift();
    if (drawn) player.hand.push(drawn);
    player.resources.gold += space.effect.gainGoldWithoutModule;
    resolution = `drawing ${drawn ? '1 card' : 'no card'} and gaining 2 Gold because War Efforts are disabled`;
  } else if (space.effect.kind === 'muster-free-peoples') {
    const recruited = recruitCompanies(player, space.effect.recruitCompanies);
    resolution = `recruiting ${recruited} Companies`;
    if (player.resources.gold >= space.effect.optionalGoldCost) {
      match.pendingChoice = {
        kind: 'muster-free-peoples',
        actorUid: player.uid,
        options: ['pay-2-gold', 'decline']
      };
    }
  } else if (space.effect.kind === 'hall-of-fire') {
    const fate = match.fateDeck.shift();
    if (fate) player.fateHand.push(fate);
    resolution = `drawing ${fate ? '1 Fate' : 'no Fate'} and gaining 1 Influence during this round's Reveal while the Agent remains`;
  } else if (!player.councilSeat) {
    player.councilSeat = true;
    resolution = 'taking a Council seat and gaining 2 Influence on every future Reveal';
  } else {
    player.resources.mithril += space.effect.repeatGainMithril;
    const fate = match.fateDeck.shift();
    if (fate) player.fateHand.push(fate);
    const recruited = recruitCompanies(player, space.effect.repeatRecruitCompanies);
    resolution = `gaining 2 Mithril, drawing ${fate ? '1 Fate' : 'no Fate'}, and recruiting ${recruited} Companies`;
  }
  if (cardDefinition.journeyEffect?.kind === 'optional-trash-self' && !match.pendingChoice) {
    match.pendingChoice = {
      kind: 'seek-allies',
      actorUid: player.uid,
      cardInstanceId: card.id,
      options: ['trash-self', 'keep-card']
    };
  }
  if (cardDefinition.journeyEffect?.kind === 'place-scout') {
    match.pendingChoice = {
      kind: 'place-scout',
      actorUid: player.uid,
      options: []
    };
  }
  match.activity.push(`${actorName} sends an Agent to ${space.name}, ${resolution}.`);
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
    const infiltrationPostId = event.payload.infiltrationPostId;
    if (
      state.phase !== 'playing' ||
      typeof cardInstanceId !== 'string' ||
      typeof spaceId !== 'string' ||
      !legalAgentSpaces(state, event.actorUid, cardInstanceId).includes(spaceId) ||
      !state.match
    ) return 'illegal Agent placement';
    const player = state.match.players[event.actorUid];
    const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === spaceId)!;
    if (space.effect.kind === 'white-council-seat') {
      if (player.resources.gold < space.effect.costGold) return 'illegal Agent placement';
      player.resources.gold -= space.effect.costGold;
    }
    const occupants = state.match.boardAgents[spaceId] ?? [];
    if (occupants.length > 0) {
      const post = typeof infiltrationPostId === 'string'
        ? OBSERVATION_POSTS.find((candidate) => candidate.id === infiltrationPostId)
        : undefined;
      if (
        !post ||
        !post.connectedSpaceIds.includes(spaceId) ||
        state.match.boardScouts[post.id] !== event.actorUid ||
        !occupants.some((occupant) => occupant.uid !== event.actorUid)
      ) return 'illegal Agent infiltration';
      delete state.match.boardScouts[post.id];
      player.scouts.supply += 1;
      state.match.activity.push(`${actor.displayName} recalls their Scout from ${post.name} to infiltrate ${space.name}.`);
    } else if (infiltrationPostId !== undefined) {
      return 'illegal Agent infiltration';
    }
    const cardIndex = player.hand.findIndex((card) => card.id === cardInstanceId);
    const [card] = player.hand.splice(cardIndex, 1);
    player.journey.push(card);
    const agentNumber = 3 - player.availableAgents;
    player.availableAgents -= 1;
    state.match.boardAgents[spaceId] = [...occupants, { uid: event.actorUid, agentNumber }];
    const gatheringPosts = OBSERVATION_POSTS.filter(
      (post) => post.connectedSpaceIds.includes(spaceId) && state.match!.boardScouts[post.id] === event.actorUid
    ).map((post) => post.id);
    if (gatheringPosts.length > 0) {
      state.match.pendingChoice = {
        kind: 'gather-intelligence',
        actorUid: event.actorUid,
        cardInstanceId: card.id,
        spaceId,
        postIds: gatheringPosts,
        options: [...gatheringPosts.map((postId) => `recall:${postId}`), 'decline-intelligence']
      };
      state.match.activity.push(`${actor.displayName} places an Agent at ${space.name} and may gather intelligence before resolving it.`);
      return null;
    }
    resolveAgentEffects(state, actor.displayName, event.actorUid, card, space);
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
      typeof choice !== 'string' ||
      !pending.options.some((option) => option === choice)
    ) return 'illegal choice resolution';
    const player = state.match.players[event.actorUid];
    if (pending.kind === 'gather-intelligence') {
      if (choice.startsWith('recall:')) {
        const postId = choice.slice('recall:'.length);
        if (!pending.postIds.includes(postId) || state.match.boardScouts[postId] !== event.actorUid) {
          return 'illegal choice resolution';
        }
        delete state.match.boardScouts[postId];
        player.scouts.supply += 1;
        const drawn = player.drawPile.shift();
        if (drawn) player.hand.push(drawn);
        const postName = OBSERVATION_POSTS.find((post) => post.id === postId)!.name;
        state.match.activity.push(`${actor.displayName} recalls their Scout from ${postName} and draws ${drawn ? '1 card' : 'no card'}.`);
      } else {
        state.match.activity.push(`${actor.displayName} leaves their Scouts in place.`);
      }
      const card = player.journey.find((candidate) => candidate.id === pending.cardInstanceId);
      const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.spaceId);
      if (!card || !space) return 'illegal choice resolution';
      state.match.pendingChoice = null;
      resolveAgentEffects(state, actor.displayName, event.actorUid, card, space);
      if (!state.match.pendingChoice) advanceToNextAgentPlayer(state.match);
      return null;
    }
    if (pending.kind === 'elven-favor') {
      const keptId = choice.slice('keep:'.length);
      if (!pending.drawnFateIds.includes(keptId)) return 'illegal choice resolution';
      const discardedId = pending.drawnFateIds.find((id) => id !== keptId);
      const discardedIndex = player.fateHand.findIndex((fate) => fate.id === discardedId);
      if (discardedIndex < 0) return 'illegal choice resolution';
      const [discarded] = player.fateHand.splice(discardedIndex, 1);
      state.match.fateDiscard.push(discarded);
      state.match.activity.push(`${actor.displayName} keeps one of the two Fate cards granted by Elven favor and discards the other.`);
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies',
          actorUid: player.uid,
          cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else {
        state.match.pendingChoice = null;
        advanceToNextAgentPlayer(state.match);
      }
      return null;
    }
    if (pending.kind === 'muster-free-peoples') {
      if (choice === 'pay-2-gold') {
        if (player.resources.gold < 2) return 'illegal choice resolution';
        player.resources.gold -= 2;
        player.resources.provisions += 1;
        state.match.activity.push(`${actor.displayName} pays 2 Gold for 1 Provision.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps their Gold.`);
      }
    } else if (pending.kind === 'seek-allies') {
      if (choice === 'trash-self') {
        const cardIndex = player.journey.findIndex((card) => card.id === pending.cardInstanceId);
        if (cardIndex < 0) return 'illegal choice resolution';
        const [trashed] = player.journey.splice(cardIndex, 1);
        player.trashPile.push(trashed);
        state.match.activity.push(`${actor.displayName} trashes Seek Allies.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps Seek Allies in their Journey.`);
      }
    } else {
      return 'illegal choice resolution';
    }
    state.match.pendingChoice = null;
    advanceToNextAgentPlayer(state.match);
    return null;
  }

  if (event.type === 'scout/placed') {
    const postId = event.payload.postId;
    const recallPostId = event.payload.recallPostId;
    const pending = state.match?.pendingChoice;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      !pending ||
      pending.kind !== 'place-scout' ||
      pending.actorUid !== event.actorUid ||
      currentPlayerUid(state) !== event.actorUid ||
      typeof postId !== 'string' ||
      !OBSERVATION_POSTS.some((post) => post.id === postId)
    ) return 'illegal Scout placement';
    const player = state.match.players[event.actorUid];
    if (player.scouts.supply < 1) {
      if (typeof recallPostId !== 'string' || state.match.boardScouts[recallPostId] !== event.actorUid) {
        return 'illegal Scout placement';
      }
      delete state.match.boardScouts[recallPostId];
      player.scouts.supply += 1;
    } else if (recallPostId !== undefined) {
      return 'illegal Scout placement';
    }
    if (state.match.boardScouts[postId]) return 'illegal Scout placement';
    player.scouts.supply -= 1;
    state.match.boardScouts[postId] = event.actorUid;
    state.match.pendingChoice = null;
    state.match.activity.push(`${actor.displayName} places a Scout at ${OBSERVATION_POSTS.find((post) => post.id === postId)!.name}.`);
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
    if (player.councilSeat) player.revealInfluence += 2;
    if (state.match.boardAgents['hall-fire']?.some((occupation) => occupation.uid === event.actorUid)) {
      player.revealInfluence += 1;
    }
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
