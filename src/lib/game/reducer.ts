import type { GameEvent } from './events';
import { REDUCER_VERSION, SCHEMA_VERSION } from './events';
import {
  AGENT_CARD_DEFINITIONS,
  BATTLE_CARD_DEFINITIONS,
  BOARD_SPACE_DEFINITIONS,
  COMMANDERS,
  FATE_CARD_DEFINITIONS,
  MUSTER_CARD_DEFINITIONS,
  OBSERVATION_POSTS,
  RESERVE_CARD_DEFINITIONS,
  STARTING_CARD_IDENTITIES,
  cardName,
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

export type FateInstance = { id: string; definitionId: string };

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
  captainUnlocked: boolean;
  captainAgentPending: boolean;
  resources: { gold: number; mithril: number; provisions: number };
  standing: { shadow: number; dwarven: number; elven: number; wild: number };
  companies: { supply: number; garrison: number };
  recruitedThisRound: number;
  wonBattleIds: string[];
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
  turnMode: 'agent' | 'reveal' | 'battle';
  players: Record<string, MatchPlayer>;
  boardAgents: Record<string, AgentOccupation[]>;
  boardScouts: Record<string, string>;
  fateDeck: FateInstance[];
  fateDiscard: FateInstance[];
  activeBattleId: string | null;
  battleDeck: string[];
  battleDiscard: string[];
  battleCompanies: Record<string, number>;
  battleBonusStrength: Record<string, number>;
  consecutiveBattlePasses: number;
  battleHistory: Array<{ battleId: string; winnerUid: string | null; strengths: Record<string, number> }>;
  queuedBattleDeployment: { actorUid: string; spaceId: string } | null;
  pendingChoice: null | {
    kind: 'battle-deployment';
    actorUid: string;
    spaceId: string;
    maximum: number;
    options: readonly string[];
  } | {
    kind: 'ranger-mustering-trash';
    actorUid: string;
    cardInstanceIds: readonly string[];
    followupSeekAlliesCardId: string | null;
    options: readonly string[];
  } | {
    kind: 'secret-bargain-fate';
    actorUid: string;
    options: readonly ['cycle-fate', 'keep-fate'];
  } | {
    kind: 'secret-bargain-recall';
    actorUid: string;
    spaceIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'muster-free-peoples';
    actorUid: string;
    options: readonly ['pay-2-gold', 'decline'];
  } | {
    kind: 'elven-favor';
    actorUid: string;
    drawnFateIds: readonly string[];
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly string[];
  } | {
    kind: 'seek-allies';
    actorUid: string;
    cardInstanceId: string;
    options: readonly ['trash-self', 'keep-card'];
  } | {
    kind: 'place-scout';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
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
          captainUnlocked: false,
          captainAgentPending: false,
          resources: { gold: 0, mithril: 0, provisions: 1 },
          standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 },
          companies: { supply: 9, garrison: 3 },
          recruitedThisRound: 0,
          wonBattleIds: [],
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
    fateDeck: shuffled(Array.from({ length: 30 }, (_, index) => ({
      id: `fate:${index + 1}`,
      definitionId: index < 2 ? 'sudden-charge' : 'sealed-fate'
    })), `${seed}:fate-deck`),
    fateDiscard: [],
    activeBattleId: BATTLE_CARD_DEFINITIONS[0]?.id ?? null,
    battleDeck: BATTLE_CARD_DEFINITIONS.slice(1).map((battle) => battle.id),
    battleDiscard: [],
    battleCompanies: {},
    battleBonusStrength: {},
    consecutiveBattlePasses: 0,
    battleHistory: [],
    queuedBattleDeployment: null,
    pendingChoice: null,
    reserveSupply: { 'muster-host': 8 },
    alliances: { shadow: null, dwarven: null, elven: null, wild: null },
    activity: [
      `The seeded match begins. ${state.players.find((player) => player.uid === playerOrder[0])?.displayName ?? 'Seat 1'} acts first.`,
      BATTLE_CARD_DEFINITIONS[0] ? `${BATTLE_CARD_DEFINITIONS[0].name} is the active Battle.` : 'No reviewed Battle remains.'
    ]
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
    if (space.effect.kind === 'mirror-galadriel' && player.resources.mithril < space.effect.costMithril) return false;
    if (space.effect.kind === 'pits-isengard' && player.resources.mithril < space.effect.costMithril) return false;
    if (space.effect.kind === 'deep-roads' && player.resources.mithril < space.effect.costMithril) return false;
    if (space.effect.kind === 'ranger-mustering' && player.resources.provisions < space.effect.costProvisions) return false;
    if (space.effect.kind === 'secret-bargain') {
      const hasOtherAgent = Object.entries(match.boardAgents).some(([, occupations]) =>
        occupations.some((occupation) => occupation.uid === actorUid)
      );
      if (
        player.standing.shadow < space.effect.requiredShadowStanding ||
        player.resources.gold < space.effect.costGold ||
        !hasOtherAgent
      ) return false;
    }
    if (space.effect.kind === 'captain-host') {
      const cost = Object.values(match.players).some((candidate) => candidate.captainUnlocked || candidate.captainAgentPending)
        ? space.effect.laterCostGold
        : space.effect.firstCostGold;
      if (player.captainUnlocked || player.captainAgentPending || player.resources.gold < cost) return false;
    }
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
      const nextPlayer = match.players[match.playerOrder[index]];
      if (nextPlayer.captainAgentPending) {
        nextPlayer.captainAgentPending = false;
        nextPlayer.captainUnlocked = true;
        nextPlayer.availableAgents += 1;
        match.activity.push('A newly appointed Captain joins their Commander at the beginning of their next turn.');
      }
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

function drawOneCard(match: MatchState, uid: string, reason: string): CardInstance | undefined {
  const player = match.players[uid];
  if (player.drawPile.length === 0 && player.discardPile.length > 0) {
    const seat = match.playerOrder.indexOf(uid) + 1;
    player.drawPile = shuffled(
      player.discardPile,
      `${match.seed}:round-${match.round}:seat-${seat}:${reason}:midround-reshuffle:${match.activity.length}`
    );
    player.discardPile = [];
    match.activity.push(`${reason} causes a deterministic discard reshuffle before the draw.`);
  }
  const drawn = player.drawPile.shift();
  if (drawn) player.hand.push(drawn);
  return drawn;
}

function recallAndBeginNextRound(match: MatchState): void {
  match.round += 1;
  match.boardAgents = {};
  match.pendingChoice = null;
  match.turnMode = 'agent';
  for (const uid of match.playerOrder) {
    const player = match.players[uid];
    player.availableAgents = player.captainUnlocked || player.captainAgentPending ? 3 : 2;
    player.captainUnlocked ||= player.captainAgentPending;
    player.captainAgentPending = false;
    player.revealedThisRound = false;
    player.revealInfluence = 0;
    player.revealedSwords = 0;
    player.recruitedThisRound = 0;
    drawToFive(match, uid);
  }
  match.firstPlayerIndex = (match.firstPlayerIndex + 1) % match.playerOrder.length;
  match.currentPlayerIndex = match.firstPlayerIndex;
  match.activeBattleId = match.battleDeck.shift() ?? null;
  match.activity.push(`Recall completes. Round ${match.round} begins.`);
}

function recruitCompanies(player: MatchPlayer, amount: number): number {
  const recruited = Math.min(amount, player.companies.supply);
  player.companies.supply -= recruited;
  player.companies.garrison += recruited;
  player.recruitedThisRound += recruited;
  return recruited;
}

function isBattleSpace(space: (typeof BOARD_SPACE_DEFINITIONS)[number]): boolean {
  return 'battleSpace' in space.effect && space.effect.battleSpace === true;
}

function openBattleDeployment(match: MatchState, actorUid: string, spaceId: string): boolean {
  if (!match.activeBattleId) return false;
  const player = match.players[actorUid];
  const fresh = Math.min(player.recruitedThisRound, player.companies.garrison);
  const existing = player.companies.garrison - fresh;
  const maximum = fresh + Math.min(2, existing);
  match.pendingChoice = {
    kind: 'battle-deployment', actorUid, spaceId, maximum,
    options: Array.from({ length: maximum + 1 }, (_, amount) => `deploy:${amount}`)
  };
  return true;
}

function finishAgentAction(match: MatchState, actorUid: string): void {
  const queued = match.queuedBattleDeployment;
  if (queued?.actorUid === actorUid) {
    match.queuedBattleDeployment = null;
    openBattleDeployment(match, actorUid, queued.spaceId);
  }
  if (!match.pendingChoice) advanceToNextAgentPlayer(match);
}

export function battleStrength(match: MatchState, uid: string): number {
  const companies = match.battleCompanies[uid] ?? 0;
  if (companies < 1) return 0;
  return companies * 2 + match.players[uid].revealedSwords + (match.battleBonusStrength[uid] ?? 0);
}

function clockwiseParticipants(match: MatchState): string[] {
  return Array.from({ length: match.playerOrder.length }, (_, offset) =>
    match.playerOrder[(match.firstPlayerIndex + offset) % match.playerOrder.length]
  ).filter((uid) => (match.battleCompanies[uid] ?? 0) > 0);
}

function applyBattleReward(match: MatchState, uid: string, rank: 0 | 1 | 2): void {
  const definition = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === match.activeBattleId);
  if (!definition) return;
  const reward = definition.rewards[rank];
  const player = match.players[uid];
  if (reward.gold) player.resources.gold += reward.gold;
  if (reward.recruitCompanies) recruitCompanies(player, reward.recruitCompanies);
}

function resolveBattle(match: MatchState): void {
  const battleId = match.activeBattleId;
  const definition = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === battleId);
  if (!battleId || !definition) {
    recallAndBeginNextRound(match);
    return;
  }
  const participants = clockwiseParticipants(match);
  const strengths = Object.fromEntries(participants.map((uid) => [uid, battleStrength(match, uid)]));
  const positive = participants.filter((uid) => strengths[uid] > 0);
  const groups = [...new Set(positive.map((uid) => strengths[uid]))]
    .sort((a, b) => b - a)
    .map((strength) => positive.filter((uid) => strengths[uid] === strength));
  let winnerUid: string | null = null;
  const first = groups[0] ?? [];
  if (first.length === 1) {
    winnerUid = first[0];
    applyBattleReward(match, winnerUid, 0);
    const second = groups[1] ?? [];
    if (second.length === 1) {
      applyBattleReward(match, second[0], 1);
      const third = groups[2] ?? [];
      if (match.playerOrder.length === 4 && third.length === 1) applyBattleReward(match, third[0], 2);
    } else if (second.length > 1) {
      for (const uid of second) applyBattleReward(match, uid, 2);
    }
  } else if (first.length > 1) {
    for (const uid of first) applyBattleReward(match, uid, 1);
    if (match.playerOrder.length === 4 && first.length === 2) {
      const third = groups[1] ?? [];
      if (third.length === 1) applyBattleReward(match, third[0], 2);
    }
  }
  if (winnerUid) {
    match.players[winnerUid].wonBattleIds.push(battleId);
    match.activity.push(`${definition.name} is won at ${strengths[winnerUid]} Strength.`);
  } else {
    match.battleDiscard.push(battleId);
    match.activity.push(`${definition.name} has no sole winner.`);
  }
  match.battleHistory.push({ battleId, winnerUid, strengths });
  for (const uid of match.playerOrder) {
    match.players[uid].companies.supply += match.battleCompanies[uid] ?? 0;
    match.battleCompanies[uid] = 0;
    match.battleBonusStrength[uid] = 0;
  }
  match.activeBattleId = null;
  recallAndBeginNextRound(match);
}

function beginBattleOrRecall(match: MatchState): void {
  const participants = clockwiseParticipants(match);
  if (!match.activeBattleId || participants.length === 0) {
    if (match.activeBattleId) {
      match.battleDiscard.push(match.activeBattleId);
      match.activity.push('The active Battle passes without participating forces.');
      match.activeBattleId = null;
    }
    recallAndBeginNextRound(match);
    return;
  }
  match.turnMode = 'battle';
  match.consecutiveBattlePasses = 0;
  match.currentPlayerIndex = match.playerOrder.indexOf(participants[0]);
  match.activity.push('The Combat Fate window opens with every participant at their revealed Strength.');
}

function gainStanding(
  match: MatchState,
  player: MatchPlayer,
  faction: 'shadow' | 'dwarven' | 'elven' | 'wild',
  followupSeekAlliesCardId: string | null = null,
  followupPlaceScout = false
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
          followupPlaceScout,
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

function beginSecretBargainRecall(match: MatchState, actorUid: string): void {
  const spaceIds = Object.entries(match.boardAgents)
    .filter(([spaceId, occupations]) =>
      spaceId !== 'secret-bargain' && occupations.some((occupation) => occupation.uid === actorUid)
    )
    .map(([spaceId]) => spaceId);
  match.pendingChoice = {
    kind: 'secret-bargain-recall',
    actorUid,
    spaceIds,
    options: spaceIds.map((spaceId) => `recall:${spaceId}`)
  };
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
  } else if (space.effect.kind === 'deep-roads') {
    gainStanding(match, player, 'dwarven', seekAlliesCardId);
    const recruited = recruitCompanies(player, space.effect.recruitCompanies);
    resolution = `gaining 1 Dwarven standing and recruiting ${recruited} Companies for Battle`;
  } else if (space.effect.kind === 'tribute-shadow') {
    player.resources.gold += space.effect.gainGold;
    gainStanding(match, player, 'shadow');
    resolution = 'gaining 1 Shadow standing and 2 Gold';
  } else if (space.effect.kind === 'pits-isengard') {
    gainStanding(match, player, 'shadow', seekAlliesCardId);
    const fate = match.fateDeck.shift();
    if (fate) player.fateHand.push(fate);
    const recruited = recruitCompanies(player, space.effect.recruitCompanies);
    resolution = `gaining 1 Shadow standing, drawing ${fate ? '1 Fate' : 'no Fate'}, and recruiting ${recruited} Companies`;
  } else if (space.effect.kind === 'hidden-paths') {
    gainStanding(match, player, 'wild', seekAlliesCardId);
    const drawn = drawOneCard(match, player.uid, 'Hidden Paths');
    resolution = `gaining 1 Wild standing and drawing ${drawn ? '1 card' : 'no card'} for Battle`;
  } else if (space.effect.kind === 'ranger-mustering') {
    gainStanding(match, player, 'wild');
    const recruited = recruitCompanies(player, space.effect.recruitCompanies);
    const trashable = [...player.hand, ...player.discardPile].map((candidate) => candidate.id);
    resolution = `gaining 1 Wild standing, recruiting ${recruited} Company for Battle, and preparing an optional trash`;
    if (trashable.length > 0) {
      match.pendingChoice = {
        kind: 'ranger-mustering-trash', actorUid: player.uid, cardInstanceIds: trashable,
        followupSeekAlliesCardId: seekAlliesCardId,
        options: [...trashable.map((id) => `trash-card:${id}`), 'decline-trash']
      };
    }
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
  } else if (space.effect.kind === 'mirror-galadriel') {
    gainStanding(match, player, 'elven', seekAlliesCardId, true);
    const drawn = player.drawPile.shift();
    if (drawn) player.hand.push(drawn);
    resolution = `gaining 1 Elven standing, drawing ${drawn ? '1 card' : 'no card'}, and preparing to place 1 Scout`;
    if (!match.pendingChoice) {
      match.pendingChoice = {
        kind: 'place-scout', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId, options: []
      };
    }
  } else if (space.effect.kind === 'secret-bargain') {
    resolution = 'preparing an optional Fate cycle, recalling another Agent, and drawing 1 card';
    if (player.fateHand.length > 0) {
      match.pendingChoice = {
        kind: 'secret-bargain-fate', actorUid: player.uid, options: ['cycle-fate', 'keep-fate']
      };
    } else beginSecretBargainRecall(match, player.uid);
  } else if (space.effect.kind === 'captain-host') {
    player.captainAgentPending = true;
    resolution = 'appointing a Captain whose third Agent becomes available at the beginning of their next turn';
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
  } else if (space.effect.kind === 'minas-tirith') {
    const recruited = recruitCompanies(player, space.effect.recruitCompanies);
    const drawn = drawOneCard(match, player.uid, 'Minas Tirith');
    resolution = `recruiting ${recruited} Company, drawing ${drawn ? '1 card' : 'no card'}, and preparing forces for Battle`;
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
      followupSeekAlliesCardId: null,
      options: []
    };
  }
  if (isBattleSpace(space) && match.activeBattleId) {
    if (match.pendingChoice) match.queuedBattleDeployment = { actorUid, spaceId: space.id };
    else openBattleDeployment(match, actorUid, space.id);
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
    if (space.effect.kind === 'mirror-galadriel') {
      if (player.resources.mithril < space.effect.costMithril) return 'illegal Agent placement';
      player.resources.mithril -= space.effect.costMithril;
    }
    if (space.effect.kind === 'pits-isengard') {
      if (player.resources.mithril < space.effect.costMithril) return 'illegal Agent placement';
      player.resources.mithril -= space.effect.costMithril;
    }
    if (space.effect.kind === 'deep-roads') {
      if (player.resources.mithril < space.effect.costMithril) return 'illegal Agent placement';
      player.resources.mithril -= space.effect.costMithril;
    }
    if (space.effect.kind === 'ranger-mustering') {
      if (player.resources.provisions < space.effect.costProvisions) return 'illegal Agent placement';
      player.resources.provisions -= space.effect.costProvisions;
    }
    if (space.effect.kind === 'secret-bargain') {
      if (
        player.standing.shadow < space.effect.requiredShadowStanding ||
        player.resources.gold < space.effect.costGold
      ) return 'illegal Agent placement';
      player.resources.gold -= space.effect.costGold;
    }
    if (space.effect.kind === 'captain-host') {
      const cost = Object.values(state.match.players).some((candidate) => candidate.captainUnlocked || candidate.captainAgentPending)
        ? space.effect.laterCostGold
        : space.effect.firstCostGold;
      if (player.captainUnlocked || player.captainAgentPending || player.resources.gold < cost) return 'illegal Agent placement';
      player.resources.gold -= cost;
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
    const agentNumber = 1 + Object.values(state.match.boardAgents).flat().filter((occupation) => occupation.uid === event.actorUid).length;
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
    if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
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
    if (pending.kind === 'ranger-mustering-trash') {
      if (choice !== 'decline-trash') {
        const cardId = choice.slice('trash-card:'.length);
        if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
        const handIndex = player.hand.findIndex((card) => card.id === cardId);
        const discardIndex = player.discardPile.findIndex((card) => card.id === cardId);
        const source = handIndex >= 0 ? player.hand : player.discardPile;
        const index = handIndex >= 0 ? handIndex : discardIndex;
        if (index < 0) return 'illegal choice resolution';
        const [trashed] = source.splice(index, 1);
        player.trashPile.push(trashed);
        state.match.activity.push(`${actor.displayName} trashes ${cardName(trashed.definitionId)} at Ranger Mustering.`);
      } else state.match.activity.push(`${actor.displayName} declines to trash a card at Ranger Mustering.`);
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'secret-bargain-fate') {
      if (choice === 'cycle-fate') {
        const discarded = player.fateHand.shift();
        if (!discarded) return 'illegal choice resolution';
        state.match.fateDiscard.push(discarded);
        const drawn = state.match.fateDeck.shift();
        if (drawn) player.fateHand.push(drawn);
        state.match.activity.push(`${actor.displayName} cycles one Fate card through the public discard.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps their Fate cards.`);
      }
      beginSecretBargainRecall(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'secret-bargain-recall') {
      const spaceId = choice.slice('recall:'.length);
      if (!pending.spaceIds.includes(spaceId)) return 'illegal choice resolution';
      const occupations = state.match.boardAgents[spaceId] ?? [];
      const occupationIndex = occupations.findIndex((occupation) => occupation.uid === event.actorUid);
      if (occupationIndex < 0) return 'illegal choice resolution';
      occupations.splice(occupationIndex, 1);
      if (occupations.length === 0) delete state.match.boardAgents[spaceId];
      else state.match.boardAgents[spaceId] = occupations;
      player.availableAgents += 1;
      const drawn = drawOneCard(state.match, event.actorUid, 'Secret Bargain');
      const spaceName = BOARD_SPACE_DEFINITIONS.find((space) => space.id === spaceId)?.name ?? spaceId;
      state.match.activity.push(`${actor.displayName} recalls their Agent from ${spaceName} and draws ${drawn ? '1 card' : 'no card'}.`);
      state.match.pendingChoice = null;
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
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
      if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
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
      if (pending.followupPlaceScout) {
        state.match.pendingChoice = {
          kind: 'place-scout', actorUid: player.uid,
          followupSeekAlliesCardId: pending.followupSeekAlliesCardId, options: []
        };
      } else if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies',
          actorUid: player.uid,
          cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
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
    } else if (pending.kind === 'battle-deployment') {
      const amount = Number(choice.slice('deploy:'.length));
      if (!Number.isInteger(amount) || amount < 0 || amount > pending.maximum || amount > player.companies.garrison) {
        return 'illegal choice resolution';
      }
      player.companies.garrison -= amount;
      player.recruitedThisRound = Math.max(0, player.recruitedThisRound - Math.min(amount, player.recruitedThisRound));
      state.match.battleCompanies[event.actorUid] = (state.match.battleCompanies[event.actorUid] ?? 0) + amount;
      state.match.activity.push(`${actor.displayName} deploys ${amount} ${amount === 1 ? 'Company' : 'Companies'} to ${BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === state.match!.activeBattleId)?.name ?? 'the Battle'}.`);
    } else {
      return 'illegal choice resolution';
    }
    state.match.pendingChoice = null;
    finishAgentAction(state.match, event.actorUid);
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
    state.match.activity.push(`${actor.displayName} places a Scout at ${OBSERVATION_POSTS.find((post) => post.id === postId)!.name}.`);
    if (pending.followupSeekAlliesCardId) {
      state.match.pendingChoice = {
        kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
        options: ['trash-self', 'keep-card']
      };
    } else {
      state.match.pendingChoice = null;
      finishAgentAction(state.match, event.actorUid);
    }
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
    player.revealedThisRound = true;
    state.match.turnMode = 'agent';
    state.match.activity.push(`${actor.displayName} finishes their Reveal turn.`);
    if (state.match.playerOrder.every((uid) => state.match!.players[uid].revealedThisRound)) {
      beginBattleOrRecall(state.match);
    } else {
      advanceToNextAgentPlayer(state.match);
    }
    return null;
  }

  if (event.type === 'battle/passed') {
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'battle' ||
      currentPlayerUid(state) !== event.actorUid ||
      (state.match.battleCompanies[event.actorUid] ?? 0) < 1
    ) return 'illegal Battle pass';
    const participants = clockwiseParticipants(state.match);
    state.match.consecutiveBattlePasses += 1;
    state.match.activity.push(`${actor.displayName} passes in the Combat Fate window at ${battleStrength(state.match, event.actorUid)} Strength.`);
    if (state.match.consecutiveBattlePasses >= participants.length) {
      resolveBattle(state.match);
    } else {
      const currentIndex = participants.indexOf(event.actorUid);
      const nextUid = participants[(currentIndex + 1) % participants.length];
      state.match.currentPlayerIndex = state.match.playerOrder.indexOf(nextUid);
    }
    return null;
  }

  if (event.type === 'fate/played') {
    const cardInstanceId = event.payload.cardInstanceId;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'battle' ||
      currentPlayerUid(state) !== event.actorUid ||
      typeof cardInstanceId !== 'string' ||
      (state.match.battleCompanies[event.actorUid] ?? 0) < 1
    ) return 'illegal Fate play';
    const player = state.match.players[event.actorUid];
    const cardIndex = player.fateHand.findIndex((card) => card.id === cardInstanceId);
    const card = player.fateHand[cardIndex];
    const definition = card && FATE_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId);
    if (!card || !definition || definition.timing !== 'Combat') return 'illegal Fate play';
    player.fateHand.splice(cardIndex, 1);
    state.match.fateDiscard.push(card);
    state.match.battleBonusStrength[event.actorUid] = (state.match.battleBonusStrength[event.actorUid] ?? 0) + definition.effect.amount;
    state.match.consecutiveBattlePasses = 0;
    state.match.activity.push(`${actor.displayName} plays ${definition.name} for ${definition.effect.amount} Strength.`);
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
