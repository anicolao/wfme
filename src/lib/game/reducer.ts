import type { GameEvent } from './events';
import { REDUCER_VERSION, SCHEMA_VERSION } from './events';
import {
  AGENT_CARD_DEFINITIONS,
  BATTLE_CARD_DEFINITIONS,
  BOARD_SPACE_DEFINITIONS,
  CHRONICLE_CARD_DEFINITIONS,
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

type PaidChronicleId = 'dwarven-smith' | 'uruk-hai-captain' | 'envoy-dale' | 'palantir-glimpse';
type HandcraftChronicleId = 'ranger-north' | 'lore-imladris' | 'grey-pilgrim' | 'palantir-glimpse';
export type FactionId = 'shadow' | 'dwarven' | 'elven' | 'wild';

type FateDrawResume =
  | { kind: 'finish-agent' }
  | {
    kind: 'agent-destination';
    actorName: string;
    cardInstanceId: string;
    spaceId: string;
    ignoredResourceCost: boolean;
    commanderDeploymentAllowance: number;
  }
  | { kind: 'battle-reward' }
  | { kind: 'battle-keep-one' }
  | {
    kind: 'elven-favor';
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    resumeBattleStanding: boolean;
  }
  | { kind: 'master-muster'; actorName: string; remainingCardInstanceIds: readonly string[] }
  | { kind: 'reveal-muster'; actorName: string; palantirFateDraws: number }
  | { kind: 'secret-bargain-recall'; actorName: string };

type QueuedFateDraw = {
  actorUid: string;
  count: number;
  source: string;
  resume: FateDrawResume;
};

export type MatchPlayer = {
  uid: string;
  commander: CommanderId;
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
  commanderPersistentUsedThisRound: boolean;
  wonBattleIds: string[];
  pairedBattleIds: string[];
  scouts: { supply: number };
  scoutsRecalledThisRound: number;
  fateHand: FateInstance[];
  councilSeat: boolean;
  entDraught: boolean;
};

export type AgentOccupation = {
  uid: string;
  agentNumber: number;
};

export type FinalStanding = {
  uid: string;
  rank: number;
  renown: number;
  mithril: number;
  gold: number;
  provisions: number;
  totalStanding: number;
};

export type FinalResult = {
  trigger: 'renown' | 'battle-deck';
  winnerUids: string[];
  standings: FinalStanding[];
};

export type FinishedMatch = FinalResult & {
  epoch: number;
  seed: string;
};

export type MatchState = {
  epoch: number;
  seed: string;
  round: number;
  playerOrder: string[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  turnMode: 'agent' | 'reveal' | 'battle' | 'endgame';
  players: Record<string, MatchPlayer>;
  boardAgents: Record<string, AgentOccupation[]>;
  boardScouts: Record<string, string>;
  fateDeck: FateInstance[];
  fateDiscard: FateInstance[];
  chronicleDeck: CardInstance[];
  chronicleRow: CardInstance[];
  activeBattleId: string | null;
  battleDeck: string[];
  battleDiscard: string[];
  battleCompanies: Record<string, number>;
  battleEnts: Record<string, number>;
  battleParticipantUids: string[];
  battleBonusStrength: Record<string, number>;
  eowynNoLivingManUsed: boolean;
  witchKingBlackBreathUsed: boolean;
  consecutiveBattlePasses: number;
  consecutiveEndgamePasses: number;
  endgameTrigger: 'renown' | 'battle-deck' | null;
  finalResult: FinalResult | null;
  battleHistory: Array<{ battleId: string; winnerUid: string | null; strengths: Record<string, number> }>;
  criticalControl: Record<'minas-tirith' | 'osgiliath' | 'edoras', string | null>;
  richesMithril: Record<'deep-fangorn' | 'entwash' | 'edoras', number>;
  damBreached: boolean;
  queuedChroniclePayment: { actorUid: string; definitionId: PaidChronicleId } | null;
  queuedChronicleCardChoice: {
    actorUid: string;
    definitionId: HandcraftChronicleId;
    cardInstanceIds: string[];
  } | null;
  queuedChronicleStandingLoss: { actorUid: string } | null;
  queuedChronicleStandingGain: { actorUid: string } | null;
  queuedCommanderRing: { actorUid: string } | null;
  queuedCommanderEngines: { actorUid: string; resume: 'agent' | 'battle' } | null;
  queuedCommanderBlackBreath: { actorUid: string; strengthLoss: number } | null;
  queuedMessengerMothRecall: { actorUid: string } | null;
  queuedElvenForesight: { actorUid: string } | null;
  queuedFateDraws: QueuedFateDraw[];
  queuedAgentFollowup: {
    actorUid: string;
    seekAlliesCardId: string | null;
    placeScout: boolean;
  } | null;
  queuedScoutPlacementRestriction: { actorUid: string; postIds: readonly string[] } | null;
  queuedBattleDeployment: {
    actorUid: string;
    spaceId: string;
    additionalGarrisonAllowance: number;
    additionalGarrisonSource: 'Khazad Guard' | 'Ride Now' | null;
  } | null;
  pendingBattleRewardChoices: Array<{ kind: 'standing' | 'place-scout' | 'fate-keep-one'; actorUid: string }>;
  pendingChoice: null | {
    kind: 'commander-fate-foresight';
    actorUid: string;
    fateIds: readonly string[];
    remainingDraws: number;
    source: string;
    resume: FateDrawResume;
    options: readonly string[];
  } | {
    kind: 'token-command-order';
    actorUid: string;
    cardInstanceId: string;
    spaceId: string;
    ignoredResourceCost: boolean;
    options: readonly ['ring-first', 'space-first'];
  } | {
    kind: 'commander-ring-standing';
    actorUid: string;
    resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null;
    options: readonly `standing-${FactionId}`[];
  } | {
    kind: 'commander-ring-gandalf';
    actorUid: string;
    resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null;
    options: readonly ('gandalf-draw-fate' | 'gandalf-recruit')[];
  } | {
    kind: 'commander-ring-eowyn';
    actorUid: string;
    resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null;
    cardInstanceIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'commander-engines-isengard';
    actorUid: string;
    resume: 'agent' | 'battle';
    options: readonly ('pay-engines' | 'decline-engines')[];
  } | {
    kind: 'chronicle-payment';
    actorUid: string;
    definitionId: PaidChronicleId;
    options: readonly ('pay-chronicle-cost' | 'decline-chronicle-cost')[];
  } | {
    kind: 'chronicle-card-choice';
    actorUid: string;
    definitionId: HandcraftChronicleId;
    cardInstanceIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'chronicle-muster-scout';
    actorUid: string;
    cardInstanceId: string;
    remainingCardInstanceIds: readonly string[];
    postIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'chronicle-muster-fate';
    actorUid: string;
    cardInstanceId: string;
    remainingCardInstanceIds: readonly string[];
    options: readonly ('pay-master-fate' | 'decline-master-fate')[];
  } | {
    kind: 'chronicle-standing-loss';
    actorUid: string;
    options: readonly `lose-standing-${FactionId}`[];
  } | {
    kind: 'chronicle-standing-gain';
    actorUid: string;
    options: readonly `standing-${FactionId}`[];
  } | {
    kind: 'chronicle-messenger-moth';
    actorUid: string;
    placedPostId: string;
    postIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'chronicle-elven-foresight';
    actorUid: string;
    cardInstanceIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'chronicle-paths-cost';
    actorUid: string;
    cardInstanceId: string;
    spaceId: string;
    postIds: readonly string[];
    costResource: 'Gold' | 'Mithril' | 'Provision';
    costAmount: number;
    options: readonly string[];
  } | {
    kind: 'critical-defense';
    actorUid: string;
    locationId: 'minas-tirith' | 'osgiliath' | 'edoras';
    options: readonly ['deploy-defender', 'decline-defender'];
  } | {
    kind: 'fangorn-moot';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly ('take-ent-draught' | 'gain-provision-breach-dam' | 'gain-provision-leave-dam')[];
  } | {
    kind: 'deep-fangorn';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly ('gain-4-mithril' | 'summon-2-ents')[];
  } | {
    kind: 'entwash';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly ('gain-2-mithril' | 'summon-1-ent')[];
  } | {
    kind: 'osgiliath';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly ('pay-0-mithril' | 'pay-1-mithril')[];
  } | {
    kind: 'great-forge';
    actorUid: string;
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
    options: readonly ('standing-shadow' | 'standing-dwarven' | 'standing-elven' | 'standing-wild')[];
  } | {
    kind: 'battle-standing';
    actorUid: string;
    options: readonly ('standing-shadow' | 'standing-dwarven' | 'standing-elven' | 'standing-wild')[];
  } | {
    kind: 'battle-fate-keep';
    actorUid: string;
    drawnFateIds: readonly string[];
    options: readonly string[];
  } | {
    kind: 'battle-deployment';
    actorUid: string;
    spaceId: string;
    maximum: number;
    additionalGarrisonAllowance: number;
    additionalGarrisonSource: 'Khazad Guard' | 'Ride Now' | null;
    options: readonly string[];
  } | {
    kind: 'ranger-mustering-trash';
    actorUid: string;
    cardInstanceIds: readonly string[];
    followupSeekAlliesCardId: string | null;
    followupPlaceScout: boolean;
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
    resumeBattleStanding?: boolean;
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
    allowedPostIds: readonly string[] | null;
    commanderRingResumeSpace?: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null;
    resumeTurn?: 'agent' | 'reveal';
    resumeBattleReward?: boolean;
    options: readonly [];
  } | {
    kind: 'plot-discard';
    actorUid: string;
    cardInstanceIds: readonly string[];
    resumeTurn: 'agent' | 'reveal';
    options: readonly string[];
  } | {
    kind: 'gifts-tokens';
    actorUid: string;
    resumeTurn: 'agent' | 'reveal';
    options: readonly ('gain-2-gold' | 'pay-2-gold')[];
  } | {
    kind: 'tidings-afar';
    actorUid: string;
    cardInstanceIds: readonly string[];
    resumeTurn: 'agent' | 'reveal';
    options: readonly string[];
  } | {
    kind: 'divided-counsel-opponent';
    actorUid: string;
    resumeTurn: 'agent' | 'reveal';
    options: readonly string[];
  } | {
    kind: 'divided-counsel-response';
    actorUid: string;
    fateActorUid: string;
    resumeTurn: 'agent' | 'reveal';
    options: readonly ('lose-1-gold' | 'reveal-hand')[];
  } | {
    kind: 'divided-counsel-review';
    actorUid: string;
    targetUid: string;
    cardInstanceIds: readonly string[];
    resumeTurn: 'agent' | 'reveal';
    options: readonly ['finish-review'];
  } | {
    kind: 'long-memory';
    actorUid: string;
    cardInstanceIds: readonly string[];
    resumeTurn: 'agent' | 'reveal';
    options: readonly string[];
  } | {
    kind: 'fell-sorcery';
    actorUid: string;
    strengthLoss: number;
    options: readonly string[];
  } | {
    kind: 'commander-black-breath';
    actorUid: string;
    strengthLoss: number;
    options: readonly string[];
  } | {
    kind: 'gather-intelligence';
    actorUid: string;
    cardInstanceId: string;
    spaceId: string;
    ignoredResourceCost: boolean;
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
  phase: 'lobby' | 'playing' | 'finished';
  players: LobbyPlayer[];
  match: MatchState | null;
  finishedMatches: FinishedMatch[];
  rematchReadyUids: string[];
  diagnostics: string[];
  eventCount: number;
};

export const EMPTY_GAME: GameState = {
  roomCode: null,
  hostUid: null,
  phase: 'lobby',
  players: [],
  match: null,
  finishedMatches: [],
  rematchReadyUids: [],
  diagnostics: [],
  eventCount: 0
};

function displayName(payload: Record<string, unknown>): string | null {
  const value = payload.displayName;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 32 ? trimmed : null;
}

function startingDeck(uid: string, seat: number, seed: string, epoch: number): CardInstance[] {
  const instances = STARTING_CARD_IDENTITIES.flatMap((definition) =>
    Array.from({ length: definition.copies }, (_, index) => ({
      id: `match-${epoch}:${uid}:starting:${definition.id}:${index + 1}`,
      definitionId: definition.id
    }))
  );
  // Anonymous Firebase UIDs are deliberately not part of game randomness. A
  // published seed must reproduce the same setup for humans, tests, and replay.
  return shuffled(instances, `${seed}:seat-${seat}:starting-deck`);
}

function battleDeck(seed: string): string[] {
  const selectedByAge = ([1, 2, 3] as const).flatMap((age) => {
    const candidates = BATTLE_CARD_DEFINITIONS.filter((battle) => battle.age === age);
    const count = age === 1 ? 1 : age === 2 ? 5 : candidates.length;
    return shuffled(candidates, `${seed}:battle-age-${age}`).slice(0, count);
  });
  return selectedByAge.map((battle) => battle.id);
}

function createMatch(state: GameState, seed: string, epoch: number): MatchState {
  const playerOrder = shuffled(
    state.players.map((player) => player.uid),
    `${seed}:player-order`
  );
  const players = Object.fromEntries(
    state.players.map((player) => {
      const deck = startingDeck(player.uid, player.seat, seed, epoch);
      return [
        player.uid,
        {
          uid: player.uid,
          commander: player.commander!,
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
          commanderPersistentUsedThisRound: false,
          wonBattleIds: [],
          pairedBattleIds: [],
          scouts: { supply: 3 },
          scoutsRecalledThisRound: 0,
      fateHand: [],
      councilSeat: false,
      entDraught: false
        }
      ];
    })
  );
  const chronicleFoundation = CHRONICLE_CARD_DEFINITIONS.filter((definition) => !definition.incrementalDeckInsertion);
  const chronicleExtensions = CHRONICLE_CARD_DEFINITIONS.filter((definition) => definition.incrementalDeckInsertion);
  const chronicleInstances = shuffled(chronicleFoundation.flatMap((definition) =>
    Array.from({ length: definition.copies }, (_, index) => ({
      id: `match-${epoch}:chronicle:${definition.id}:${index + 1}`,
      definitionId: definition.id
    }))
  ), `${seed}:chronicle-deck`);
  for (const instance of chronicleExtensions.flatMap((definition) =>
    Array.from({ length: definition.copies }, (_, index) => ({
      id: `match-${epoch}:chronicle:${definition.id}:${index + 1}`,
      definitionId: definition.id
    })))) {
    const insertionPoints = shuffled(
      Array.from({ length: chronicleInstances.length + 1 }, (_, index) => index),
      `${seed}:chronicle-insertion:${instance.id.replace(/^match-\d+:/, '')}`
    );
    chronicleInstances.splice(insertionPoints[0], 0, instance);
  }
  const selectedBattles = battleDeck(seed);
  return {
    epoch,
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
      id: `match-${epoch}:fate:${index + 1}`,
      definitionId: index < 2
        ? 'sudden-charge'
        : index === 18 || index === 22
          ? 'fell-sorcery'
        : index === 2 || index === 3
          ? 'secret-ways'
        : index === 5 || index === 6
          ? 'chance-meeting'
        : index === 7 || index === 8
          ? 'gifts-tokens'
        : index === 10 || index === 11
          ? 'tidings-afar'
        : index === 12 || index === 15
          ? 'divided-counsel'
        : index === 16 || index === 17
          ? 'long-memory'
        : index === 9 || index === 29
          ? 'hold-line'
          : index === 13 || index === 14
            ? 'hidden-archers'
            : index === 20 || index === 25
              ? 'reinforcements'
            : index === 4 || index === 19
                ? 'desperate-valor'
                : index === 21 || index === 23
                  ? 'lore-beyond-price'
                  : index === 24 || index === 26
                    ? 'keeper-oaths'
                    : 'the-long-game'
    })), `${seed}:fate-deck`),
    fateDiscard: [],
    chronicleDeck: chronicleInstances.slice(5),
    chronicleRow: chronicleInstances.slice(0, 5),
    activeBattleId: selectedBattles[0] ?? null,
    battleDeck: selectedBattles.slice(1),
    battleDiscard: [],
    battleCompanies: {},
    battleEnts: {},
    battleParticipantUids: [],
    battleBonusStrength: {},
    eowynNoLivingManUsed: false,
    witchKingBlackBreathUsed: false,
    consecutiveBattlePasses: 0,
    consecutiveEndgamePasses: 0,
    endgameTrigger: null,
    finalResult: null,
    battleHistory: [],
    criticalControl: { 'minas-tirith': null, osgiliath: null, edoras: null },
    richesMithril: { 'deep-fangorn': 0, entwash: 0, edoras: 0 },
    damBreached: false,
    queuedChroniclePayment: null,
    queuedChronicleCardChoice: null,
    queuedChronicleStandingLoss: null,
    queuedChronicleStandingGain: null,
    queuedCommanderRing: null,
    queuedCommanderEngines: null,
    queuedCommanderBlackBreath: null,
    queuedMessengerMothRecall: null,
    queuedElvenForesight: null,
    queuedFateDraws: [],
    queuedAgentFollowup: null,
    queuedScoutPlacementRestriction: null,
    queuedBattleDeployment: null,
    pendingBattleRewardChoices: [],
    pendingChoice: null,
    reserveSupply: { 'muster-host': 8 },
    alliances: { shadow: null, dwarven: null, elven: null, wild: null },
    activity: [
      `The seeded match begins. ${state.players.find((player) => player.uid === playerOrder[0])?.displayName ?? 'Seat 1'} acts first.`,
      selectedBattles[0] ? `${BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === selectedBattles[0])!.name} is the active Battle.` : 'No reviewed Battle remains.'
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
  if (
    card?.definitionId === 'token-of-command' &&
    !(['aragorn', 'theoden', 'galadriel', 'gandalf', 'eowyn', 'saruman'] as const).includes(state.players.find((candidate) => candidate.uid === actorUid)?.commander as 'aragorn' | 'theoden' | 'galadriel' | 'gandalf' | 'eowyn' | 'saruman')
  ) return [];
  const ownedScoutCount = Object.values(match.boardScouts).filter((uid) => uid === actorUid).length;
  const canUsePaths = definition.journeyEffect?.kind === 'recall-scout-ignore-space-cost' && ownedScoutCount > 0;
  return BOARD_SPACE_DEFINITIONS.filter((space) => {
    const resourceCost = mandatoryResourceCost(match, player, space);
    const canPayCost = !resourceCost || player.resources[resourceCost.resource] >= resourceCost.amount;
    if (!canPayCost && !canUsePaths) return false;
    if (space.effect.kind === 'great-forge' && player.standing.dwarven < space.effect.requiredDwarvenStanding) return false;
    if (space.effect.kind === 'fangorn-moot' && player.standing.wild < space.effect.requiredWildStanding) return false;
    if (space.effect.kind === 'secret-bargain') {
      const hasOtherAgent = Object.entries(match.boardAgents).some(([, occupations]) =>
        occupations.some((occupation) => occupation.uid === actorUid)
      );
      if (
        player.standing.shadow < space.effect.requiredShadowStanding ||
        !hasOtherAgent
      ) return false;
    }
    if (space.effect.kind === 'captain-host') {
      if (player.captainUnlocked || player.captainAgentPending) return false;
    }
    const connectedOwnScout = OBSERVATION_POSTS.some(
      (post) => post.connectedSpaceIds.includes(space.id) && match.boardScouts[post.id] === actorUid
    );
    const iconMatches = definition.placementIcons.some((icon) => space.placementIcons.includes(icon))
      || (definition.placementIcons.includes('Scout') && connectedOwnScout);
    const occupants = match.boardAgents[space.id] ?? [];
    const canInfiltrate = connectedOwnScout && occupants.some((occupant) => occupant.uid !== actorUid);
    if (occupants.length > 0 && !canPayCost && canUsePaths && ownedScoutCount < 2) return false;
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

function resolveGandalfHighCostAcquisition(match: MatchState, player: MatchPlayer, cost: number): void {
  if (
    cost < 5 ||
    player.commander !== 'gandalf' ||
    player.commanderPersistentUsedThisRound
  ) {
    return;
  }
  player.commanderPersistentUsedThisRound = true;
  const drawn = drawOneCard(match, player.uid, 'A Wizard Is Never Late');
  match.activity.push(
    drawn
      ? 'Gandalf draws 1 card with A Wizard Is Never Late after acquiring a card costing at least 5 Influence.'
      : 'A Wizard Is Never Late finds no card for Gandalf to draw after the high-cost acquisition.'
  );
}

function recallAndBeginNextRound(match: MatchState): void {
  if (Object.values(match.players).some((player) => player.renown >= 10) || match.battleDeck.length === 0) {
    match.turnMode = 'endgame';
    match.currentPlayerIndex = match.firstPlayerIndex;
    match.consecutiveEndgamePasses = 0;
    match.endgameTrigger = Object.values(match.players).some((player) => player.renown >= 10) ? 'renown' : 'battle-deck';
    match.activity.push(
      match.endgameTrigger === 'renown'
        ? 'Endgame begins because a Commander has reached 10 Renown.'
        : 'Endgame begins because the final Battle has resolved.'
    );
    return;
  }
  if (!(match.boardAgents['deep-fangorn']?.length > 0)) match.richesMithril['deep-fangorn'] += 1;
  if (!(match.boardAgents.entwash?.length > 0)) match.richesMithril.entwash += 1;
  if (!(match.boardAgents.edoras?.length > 0)) {
    match.richesMithril.edoras += 1;
  }
  match.round += 1;
  match.boardAgents = {};
  match.pendingChoice = null;
  match.pendingBattleRewardChoices = [];
  match.queuedCommanderEngines = null;
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
    player.commanderPersistentUsedThisRound = false;
    player.scoutsRecalledThisRound = 0;
    drawToFive(match, uid);
  }
  match.firstPlayerIndex = (match.firstPlayerIndex + 1) % match.playerOrder.length;
  match.currentPlayerIndex = match.firstPlayerIndex;
  match.activeBattleId = match.battleDeck.shift() ?? null;
  const nextBattle = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === match.activeBattleId);
  const defender = nextBattle?.contestedLocationId ? match.criticalControl[nextBattle.contestedLocationId] : null;
  if (defender && match.players[defender].companies.supply > 0) {
    match.pendingChoice = {
      kind: 'critical-defense',
      actorUid: defender,
      locationId: nextBattle!.contestedLocationId!,
      options: ['deploy-defender', 'decline-defender']
    };
    match.activity.push(`The controller of ${BOARD_SPACE_DEFINITIONS.find((space) => space.id === nextBattle?.contestedLocationId)?.name} may deploy 1 defending Company from supply.`);
  }
  match.activity.push(`Recall completes. Round ${match.round} begins.`);
}

function finalStanding(match: MatchState, uid: string): FinalStanding {
  const player = match.players[uid];
  return {
    uid,
    rank: 0,
    renown: player.renown,
    mithril: player.resources.mithril,
    gold: player.resources.gold,
    provisions: player.resources.provisions,
    totalStanding: Object.values(player.standing).reduce((total, amount) => total + amount, 0)
  };
}

function sameFinalScore(left: FinalStanding, right: FinalStanding): boolean {
  return left.renown === right.renown
    && left.mithril === right.mithril
    && left.gold === right.gold
    && left.provisions === right.provisions
    && left.totalStanding === right.totalStanding;
}

function finishEndgame(match: MatchState): void {
  const standings = match.playerOrder.map((uid) => finalStanding(match, uid)).sort((left, right) =>
    right.renown - left.renown
    || right.mithril - left.mithril
    || right.gold - left.gold
    || right.provisions - left.provisions
    || right.totalStanding - left.totalStanding
    || match.playerOrder.indexOf(left.uid) - match.playerOrder.indexOf(right.uid)
  );
  for (let index = 0; index < standings.length; index += 1) {
    standings[index].rank = index > 0 && sameFinalScore(standings[index], standings[index - 1])
      ? standings[index - 1].rank
      : index + 1;
  }
  const winnerUids = standings.filter((standing) => standing.rank === 1).map((standing) => standing.uid);
  match.finalResult = {
    trigger: match.endgameTrigger ?? 'battle-deck',
    winnerUids,
    standings
  };
  match.activity.push(
    winnerUids.length === 1
      ? 'Final scoring names one victorious Commander.'
      : `${winnerUids.length} Commanders share victory after every tiebreak.`
  );
}

function recruitCompanies(match: MatchState, player: MatchPlayer, amount: number): number {
  const recruited = Math.min(amount, player.companies.supply);
  player.companies.supply -= recruited;
  player.companies.garrison += recruited;
  player.recruitedThisRound += recruited;
  if (
    recruited >= 2 &&
    player.commander === 'saruman' &&
    !player.commanderPersistentUsedThisRound
  ) {
    player.commanderPersistentUsedThisRound = true;
    match.queuedCommanderEngines = {
      actorUid: player.uid,
      resume: match.turnMode === 'battle' ? 'battle' : 'agent'
    };
    match.activity.push(`Saruman's first effect recruiting at least 2 Companies this round readies Engines of Isengard.`);
  }
  return recruited;
}

function openQueuedCommanderEngines(match: MatchState): boolean {
  const queued = match.queuedCommanderEngines;
  if (!queued) return false;
  match.queuedCommanderEngines = null;
  const player = match.players[queued.actorUid];
  if (player.resources.gold < 1) {
    match.activity.push(`Saruman cannot pay 1 Gold for Engines of Isengard after its first qualifying recruitment this round.`);
    return false;
  }
  if (player.companies.supply < 1) {
    match.activity.push(`Engines of Isengard finds no Company remaining in Saruman's supply.`);
    return false;
  }
  match.pendingChoice = {
    kind: 'commander-engines-isengard',
    actorUid: queued.actorUid,
    resume: queued.resume,
    options: ['pay-engines', 'decline-engines']
  };
  match.activity.push(`Saruman may pay 1 Gold to recruit 1 additional Company with Engines of Isengard.`);
  return true;
}

function isBattleSpace(space: (typeof BOARD_SPACE_DEFINITIONS)[number]): boolean {
  return 'battleSpace' in space.effect && space.effect.battleSpace === true;
}

function battleConnectedObservationPostIds(): string[] {
  return OBSERVATION_POSTS
    .filter((post) => post.connectedSpaceIds.some((spaceId) => {
      const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === spaceId);
      return Boolean(space && isBattleSpace(space));
    }))
    .map((post) => post.id);
}

function openScoutPlacement(
  match: MatchState,
  actorUid: string,
  continuation: {
    followupSeekAlliesCardId: string | null;
    commanderRingResumeSpace?: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null;
    resumeTurn?: 'agent' | 'reveal';
    resumeBattleReward?: boolean;
  }
): boolean {
  const restriction = match.queuedScoutPlacementRestriction?.actorUid === actorUid
    ? match.queuedScoutPlacementRestriction
    : null;
  const allowedPostIds = restriction?.postIds ?? OBSERVATION_POSTS.map((post) => post.id);
  const player = match.players[actorUid];
  const hasEmptyAllowedPost = allowedPostIds.some((postId) => !match.boardScouts[postId]);
  const canRelocateToAllowedPost = player.scouts.supply < 1 && OBSERVATION_POSTS.some((post) =>
    match.boardScouts[post.id] === actorUid && (hasEmptyAllowedPost || allowedPostIds.includes(post.id))
  );
  const canPlace = player.scouts.supply > 0 ? hasEmptyAllowedPost : canRelocateToAllowedPost;
  if (restriction) match.queuedScoutPlacementRestriction = null;
  if (!canPlace) {
    match.activity.push(`${restriction ? 'Warden of Ithilien' : 'A Scout effect'} cannot place a Scout because no legal observation post can be opened.`);
    return false;
  }
  match.pendingChoice = {
    kind: 'place-scout',
    actorUid,
    allowedPostIds: restriction ? allowedPostIds : null,
    ...continuation,
    options: []
  };
  return true;
}

function hasMandatoryResourceCost(space: (typeof BOARD_SPACE_DEFINITIONS)[number]): boolean {
  return [
    'white-council-seat',
    'mirror-galadriel',
    'pits-isengard',
    'deep-roads',
    'ranger-mustering',
    'deep-fangorn',
    'entwash',
    'archives-rivendell',
    'great-forge',
    'secret-bargain',
    'captain-host'
  ].includes(space.effect.kind);
}

type MandatoryResourceCost = {
  resource: 'gold' | 'mithril' | 'provisions';
  label: 'Gold' | 'Mithril' | 'Provision';
  amount: number;
};

function mandatoryResourceCost(
  match: MatchState,
  player: MatchPlayer,
  space: (typeof BOARD_SPACE_DEFINITIONS)[number]
): MandatoryResourceCost | null {
  if (space.effect.kind === 'white-council-seat') return { resource: 'gold', label: 'Gold', amount: space.effect.costGold };
  if (space.effect.kind === 'mirror-galadriel') return { resource: 'mithril', label: 'Mithril', amount: space.effect.costMithril };
  if (space.effect.kind === 'pits-isengard') return { resource: 'mithril', label: 'Mithril', amount: space.effect.costMithril };
  if (space.effect.kind === 'deep-roads') return { resource: 'mithril', label: 'Mithril', amount: space.effect.costMithril };
  if (space.effect.kind === 'ranger-mustering') return { resource: 'provisions', label: 'Provision', amount: space.effect.costProvisions };
  if (space.effect.kind === 'deep-fangorn') return { resource: 'provisions', label: 'Provision', amount: space.effect.costProvisions };
  if (space.effect.kind === 'entwash') return { resource: 'provisions', label: 'Provision', amount: space.effect.costProvisions };
  if (space.effect.kind === 'archives-rivendell') return { resource: 'provisions', label: 'Provision', amount: space.effect.costProvisions };
  if (space.effect.kind === 'great-forge') return { resource: 'mithril', label: 'Mithril', amount: space.effect.costMithril };
  if (space.effect.kind === 'secret-bargain') return { resource: 'gold', label: 'Gold', amount: space.effect.costGold };
  if (space.effect.kind === 'captain-host') {
    const amount = Object.values(match.players).some((candidate) => candidate.captainUnlocked || candidate.captainAgentPending)
      ? space.effect.laterCostGold
      : space.effect.firstCostGold;
    return { resource: 'gold', label: 'Gold', amount };
  }
  return null;
}

function payMandatoryResourceCost(match: MatchState, player: MatchPlayer, space: (typeof BOARD_SPACE_DEFINITIONS)[number]): boolean {
  const cost = mandatoryResourceCost(match, player, space);
  if (!cost) return true;
  if (player.resources[cost.resource] < cost.amount) return false;
  player.resources[cost.resource] -= cost.amount;
  return true;
}

function canSummonEnts(match: MatchState, player: MatchPlayer): boolean {
  if (!player.entDraught || !match.activeBattleId) return false;
  const contested = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === match.activeBattleId)?.contestedLocationId;
  return match.damBreached || (contested !== 'minas-tirith' && contested !== 'osgiliath' && contested !== 'edoras');
}

function openBattleDeployment(
  match: MatchState,
  actorUid: string,
  spaceId: string,
  additionalGarrisonAllowance = 0,
  additionalGarrisonSource: 'Khazad Guard' | 'Ride Now' | null = null
): boolean {
  if (!match.activeBattleId) return false;
  const player = match.players[actorUid];
  const fresh = Math.min(player.recruitedThisRound, player.companies.garrison);
  const existing = player.companies.garrison - fresh;
  const maximum = fresh + Math.min(2 + additionalGarrisonAllowance, existing);
  match.pendingChoice = {
    kind: 'battle-deployment', actorUid, spaceId, maximum, additionalGarrisonAllowance, additionalGarrisonSource,
    options: Array.from({ length: maximum + 1 }, (_, amount) => `deploy:${amount}`)
  };
  return true;
}

function openChroniclePayment(match: MatchState, actorUid: string, definitionId: PaidChronicleId): void {
  const player = match.players[actorUid];
  const effect = AGENT_CARD_DEFINITIONS.find((definition) => definition.id === definitionId)?.journeyEffect;
  const costGold = effect?.kind === 'optional-pay-gold-mithril' || effect?.kind === 'optional-pay-gold-recruit'
    ? effect.costGold
    : effect?.kind === 'gain-gold-optional-pay-standing'
      ? effect.costGold
      : Number.POSITIVE_INFINITY;
  const options: ('pay-chronicle-cost' | 'decline-chronicle-cost')[] = ['decline-chronicle-cost'];
  const canPay = effect?.kind === 'optional-pay-mithril-draw-discard'
    ? player.resources.mithril >= effect.costMithril
    : player.resources.gold >= costGold;
  if (canPay) options.unshift('pay-chronicle-cost');
  match.pendingChoice = { kind: 'chronicle-payment', actorUid, definitionId, options };
}

function openChronicleCardChoice(
  match: MatchState,
  actorUid: string,
  definitionId: HandcraftChronicleId,
  eligibleIds: readonly string[]
): boolean {
  const player = match.players[actorUid];
  const cards = definitionId === 'grey-pilgrim'
    ? [...player.hand, ...player.discardPile]
    : player.hand;
  const cardInstanceIds = eligibleIds.filter((id) => cards.some((card) => card.id === id));
  const requiresDiscard = definitionId === 'ranger-north' || definitionId === 'palantir-glimpse';
  if (requiresDiscard && cardInstanceIds.length === 0) return false;
  const options = requiresDiscard
    ? cardInstanceIds.map((id) => `discard-card:${id}`)
    : [...cardInstanceIds.map((id) => `trash-card:${id}`), 'decline-trash'];
  match.pendingChoice = { kind: 'chronicle-card-choice', actorUid, definitionId, cardInstanceIds, options };
  return true;
}

function openGoblinMusterChoice(
  match: MatchState,
  actorUid: string,
  cardInstanceIds: readonly string[]
): boolean {
  const [cardInstanceId, ...remainingCardInstanceIds] = cardInstanceIds;
  if (!cardInstanceId) return false;
  const postIds = OBSERVATION_POSTS
    .filter((post) => match.boardScouts[post.id] === actorUid)
    .map((post) => post.id);
  if (postIds.length === 0) return false;
  match.pendingChoice = {
    kind: 'chronicle-muster-scout',
    actorUid,
    cardInstanceId,
    remainingCardInstanceIds,
    postIds,
    options: [...postIds.map((postId) => `recall-scout:${postId}`), 'decline-scout-recall']
  };
  return true;
}

function openMasterMusterChoice(
  match: MatchState,
  actorUid: string,
  cardInstanceIds: readonly string[]
): boolean {
  const [cardInstanceId, ...remainingCardInstanceIds] = cardInstanceIds;
  if (!cardInstanceId) return false;
  const player = match.players[actorUid];
  if (!player.muster.some((card) => card.id === cardInstanceId && card.definitionId === 'master-lake-town')) {
    return false;
  }
  const options: ('pay-master-fate' | 'decline-master-fate')[] = ['decline-master-fate'];
  if (player.resources.gold >= 2 && match.fateDeck.length > 0) options.unshift('pay-master-fate');
  match.pendingChoice = {
    kind: 'chronicle-muster-fate',
    actorUid,
    cardInstanceId,
    remainingCardInstanceIds,
    options
  };
  return true;
}

function openChronicleStandingLoss(match: MatchState, actorUid: string): boolean {
  const player = match.players[actorUid];
  const factions: readonly FactionId[] = ['shadow', 'dwarven', 'elven', 'wild'];
  const options = factions
    .filter((faction) => player.standing[faction] > 0)
    .map((faction) => `lose-standing-${faction}` as const);
  if (options.length === 0) {
    match.activity.push(`${cardName('orcish-muster')} cannot reduce standing already at zero.`);
    return false;
  }
  match.pendingChoice = { kind: 'chronicle-standing-loss', actorUid, options };
  return true;
}

export function eligibleHeirStandingOptions(
  player: Pick<MatchPlayer, 'standing'>
): readonly `standing-${FactionId}`[] {
  const factions: readonly FactionId[] = ['shadow', 'dwarven', 'elven', 'wild'];
  return factions
    .filter((faction) => player.standing[faction] <= 1)
    .map((faction) => `standing-${faction}` as const);
}

export function fairSeemingPromiseGold(
  player: Pick<MatchPlayer, 'standing'>
): number {
  const factions: readonly FactionId[] = ['shadow', 'dwarven', 'elven', 'wild'];
  return Math.min(3, factions.filter((faction) => player.standing[faction] >= 2).length);
}

function openChronicleStandingGain(match: MatchState, actorUid: string): boolean {
  const options = eligibleHeirStandingOptions(match.players[actorUid]);
  if (options.length === 0) {
    match.activity.push(`${cardName('heir-isildur')} finds no faction at 1 standing or less.`);
    return false;
  }
  match.pendingChoice = { kind: 'chronicle-standing-gain', actorUid, options };
  return true;
}

function openAragornRing(
  match: MatchState,
  actorUid: string,
  resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null
): boolean {
  const options = eligibleHeirStandingOptions(match.players[actorUid]);
  if (options.length === 0) {
    match.activity.push('Andúril Aflame finds no faction at 1 or less standing.');
    return false;
  }
  match.pendingChoice = { kind: 'commander-ring-standing', actorUid, resumeSpace, options };
  return true;
}

function applyTheodenRing(match: MatchState, actorUid: string): void {
  match.players[actorUid].resources.provisions += 1;
  match.activity.push('Théoden gains 1 Provision with Ride Now.');
}

function applySarumanRing(match: MatchState, actorUid: string): void {
  const player = match.players[actorUid];
  const gold = fairSeemingPromiseGold(player);
  player.resources.gold += gold;
  match.activity.push(`Saruman gains ${gold} Gold with A Fair-seeming Promise from ${gold} respected faction${gold === 1 ? '' : 's'}.`);
}

function resolveGaladrielRingDraw(match: MatchState, actorUid: string): void {
  const observationPostCount = OBSERVATION_POSTS.filter(
    (post) => match.boardScouts[post.id] === actorUid
  ).length;
  const drawn = observationPostCount >= 2
    ? drawOneCard(match, actorUid, 'Mirror Unveiled')
    : undefined;
  match.activity.push(
    observationPostCount >= 2
      ? `Galadriel draws ${drawn ? '1 card' : 'no card'} with Mirror Unveiled because her Scouts watch ${observationPostCount} different observation posts.`
      : `Galadriel does not draw with Mirror Unveiled because her Scouts watch only ${observationPostCount} observation post${observationPostCount === 1 ? '' : 's'}.`
  );
}

function openGaladrielRing(
  match: MatchState,
  actorUid: string,
  resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null
): boolean {
  const opened = openScoutPlacement(match, actorUid, {
    followupSeekAlliesCardId: null,
    commanderRingResumeSpace: resumeSpace
  });
  if (opened) {
    match.activity.push('Galadriel unveils the Mirror and must place 1 Scout before checking its vision.');
    return true;
  }
  resolveGaladrielRingDraw(match, actorUid);
  return false;
}

function openGandalfRing(
  match: MatchState,
  actorUid: string,
  resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null
): void {
  const player = match.players[actorUid];
  const hasStrictlyFewerGarrisonCompanies = match.playerOrder
    .filter((uid) => uid !== actorUid)
    .every((uid) => player.companies.garrison < match.players[uid].companies.garrison);
  const options: ('gandalf-draw-fate' | 'gandalf-recruit')[] = ['gandalf-draw-fate'];
  if (hasStrictlyFewerGarrisonCompanies) options.push('gandalf-recruit');
  match.pendingChoice = {
    kind: 'commander-ring-gandalf',
    actorUid,
    resumeSpace,
    options
  };
  match.activity.push(
    hasStrictlyFewerGarrisonCompanies
      ? 'Gandalf kindles courage and may draw 1 Fate or recruit 2 Companies.'
      : 'Gandalf kindles courage and may draw 1 Fate; his garrison is not smaller than every opponent’s.'
  );
}

function openEowynRing(
  match: MatchState,
  actorUid: string,
  resumeSpace: { cardInstanceId: string; spaceId: string; ignoredResourceCost: boolean } | null
): boolean {
  const player = match.players[actorUid];
  const cardInstanceIds = [...player.hand, ...player.discardPile].map((card) => card.id);
  if (cardInstanceIds.length === 0) {
    match.activity.push('Éowyn finds no deed to relinquish and draws no card with Choose Deeds.');
    return false;
  }
  match.pendingChoice = {
    kind: 'commander-ring-eowyn',
    actorUid,
    resumeSpace,
    cardInstanceIds,
    options: [...cardInstanceIds.map((id) => `trash-card:${id}`), 'decline-trash']
  };
  match.activity.push('Éowyn may trash one private card from her hand or discard pile with Choose Deeds.');
  return true;
}

function permutations<T>(values: readonly T[]): T[][] {
  if (values.length < 2) return [values.slice()];
  return values.flatMap((value, index) =>
    permutations([...values.slice(0, index), ...values.slice(index + 1)]).map((tail) => [value, ...tail])
  );
}

function openElvenForesight(match: MatchState, actorUid: string): boolean {
  const cardInstanceIds = match.players[actorUid].drawPile.slice(0, 3).map((card) => card.id);
  if (cardInstanceIds.length < 2) {
    match.activity.push(`Elven Foresight finds only ${cardInstanceIds.length} card${cardInstanceIds.length === 1 ? '' : 's'} in the deck, so its order is unchanged.`);
    return false;
  }
  match.pendingChoice = {
    kind: 'chronicle-elven-foresight',
    actorUid,
    cardInstanceIds,
    options: permutations(cardInstanceIds).map((ids) => `order-draw:${ids.join('|')}`)
  };
  return true;
}

function openRevealMusterChoices(match: MatchState, actorUid: string): void {
  const player = match.players[actorUid];
  if (!openGoblinMusterChoice(
    match,
    actorUid,
    player.muster.filter((card) => card.definitionId === 'goblin-informer').map((card) => card.id)
  )) {
    openMasterMusterChoice(
      match,
      actorUid,
      player.muster.filter((card) => card.definitionId === 'master-lake-town').map((card) => card.id)
    );
  }
}

function drawFateOrOpenForesight(
  match: MatchState,
  actorUid: string,
  count: number,
  source: string,
  resume: FateDrawResume
): FateInstance[] | null {
  const request = { actorUid, count, source, resume };
  if (match.pendingChoice?.kind === 'commander-fate-foresight') {
    match.queuedFateDraws.push(request);
    return null;
  }
  const player = match.players[actorUid];
  if (
    count > 0 &&
    match.fateDeck.length > 0 &&
    player.commander === 'galadriel' &&
    !player.commanderPersistentUsedThisRound
  ) {
    player.commanderPersistentUsedThisRound = true;
    const fateIds = match.fateDeck.slice(0, 2).map((fate) => fate.id);
    if (fateIds.length > 1) {
      match.pendingChoice = {
        kind: 'commander-fate-foresight',
        actorUid,
        fateIds,
        remainingDraws: count - 1,
        source,
        resume,
        options: fateIds.map((id) => `take-fate:${id}`)
      };
      match.activity.push(`Galadriel privately looks at the top two Fate cards with Foresight before drawing from ${source}.`);
      return null;
    }
    match.activity.push(`Galadriel's Foresight finds only one Fate card, so she draws it without a choice.`);
  }
  const drawn = match.fateDeck.splice(0, count);
  player.fateHand.push(...drawn);
  return drawn;
}

function continueAfterElvenFavor(
  match: MatchState,
  actorUid: string,
  followupSeekAlliesCardId: string | null,
  followupPlaceScout: boolean,
  resumeBattleStanding: boolean
): void {
  if (drainQueuedFateDraw(match)) return;
  if (followupPlaceScout) {
    if (!openScoutPlacement(match, actorUid, { followupSeekAlliesCardId })) {
      if (followupSeekAlliesCardId) {
        match.pendingChoice = {
          kind: 'seek-allies', actorUid, cardInstanceId: followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (resumeBattleStanding) continueBattleRewardChoicesOrRecall(match);
      else finishAgentAction(match, actorUid);
    }
  } else if (followupSeekAlliesCardId) {
    match.pendingChoice = {
      kind: 'seek-allies', actorUid, cardInstanceId: followupSeekAlliesCardId,
      options: ['trash-self', 'keep-card']
    };
  } else if (resumeBattleStanding) continueBattleRewardChoicesOrRecall(match);
  else finishAgentAction(match, actorUid);
}

function resumeFateDraw(match: MatchState, request: QueuedFateDraw, drawn: FateInstance[]): void {
  if (request.resume.kind === 'agent-destination') {
    const resume = request.resume;
    const card = match.players[request.actorUid].journey.find((candidate) => candidate.id === resume.cardInstanceId);
    const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === resume.spaceId);
    if (!card || !space) return;
    resolveAgentEffects(
      match,
      resume.actorName,
      request.actorUid,
      card,
      space,
      resume.ignoredResourceCost,
      resume.commanderDeploymentAllowance,
      true
    );
    if (!match.pendingChoice) finishAgentAction(match, request.actorUid);
    return;
  }
  if (request.resume.kind === 'finish-agent') {
    if (!drainQueuedFateDraw(match)) finishAgentAction(match, request.actorUid);
    return;
  }
  if (request.resume.kind === 'battle-reward') {
    if (!drainQueuedFateDraw(match)) continueBattleRewardChoicesOrRecall(match);
    return;
  }
  if (request.resume.kind === 'battle-keep-one') {
    if (drawn.length < 2) {
      match.activity.push(`A ranked player draws and keeps ${drawn.length} Fate because the deck cannot supply two cards.`);
      continueBattleRewardChoicesOrRecall(match);
      return;
    }
    match.pendingChoice = {
      kind: 'battle-fate-keep', actorUid: request.actorUid,
      drawnFateIds: drawn.map((fate) => fate.id),
      options: drawn.map((fate) => `keep:${fate.id}`)
    };
    match.activity.push('A ranked player privately draws two Fate cards and must keep one before Recall.');
    return;
  }
  if (request.resume.kind === 'elven-favor') {
    if (drawn.length > 1) {
      match.pendingChoice = {
        kind: 'elven-favor', actorUid: request.actorUid,
        drawnFateIds: drawn.map((fate) => fate.id),
        followupSeekAlliesCardId: request.resume.followupSeekAlliesCardId,
        followupPlaceScout: request.resume.followupPlaceScout,
        resumeBattleStanding: request.resume.resumeBattleStanding,
        options: drawn.map((fate) => `keep:${fate.id}`)
      };
    } else {
      continueAfterElvenFavor(
        match,
        request.actorUid,
        request.resume.followupSeekAlliesCardId,
        request.resume.followupPlaceScout,
        request.resume.resumeBattleStanding
      );
    }
    return;
  }
  if (request.resume.kind === 'master-muster') {
    match.activity.push(`${request.resume.actorName} pays 2 Gold and privately draws ${drawn.length} Fate with Master of Lake-town.`);
    openMasterMusterChoice(match, request.actorUid, request.resume.remainingCardInstanceIds);
    return;
  }
  if (request.resume.kind === 'reveal-muster') {
    match.activity.push(`${request.resume.actorName} privately draws ${drawn.length} Fate with ${request.resume.palantirFateDraws} ${request.resume.palantirFateDraws === 1 ? 'Palantír Glimpse' : 'Palantír Glimpses'}.`);
    openRevealMusterChoices(match, request.actorUid);
    return;
  }
  match.activity.push(`${request.resume.actorName} cycles one Fate card through the public discard.`);
  beginSecretBargainRecall(match, request.actorUid);
}

function drainQueuedFateDraw(match: MatchState): boolean {
  if (match.pendingChoice) return true;
  const request = match.queuedFateDraws.shift();
  if (!request) return false;
  const drawn = drawFateOrOpenForesight(match, request.actorUid, request.count, request.source, request.resume);
  if (drawn) resumeFateDraw(match, request, drawn);
  return true;
}

function finishAgentAction(match: MatchState, actorUid: string): void {
  if (openQueuedCommanderEngines(match)) return;
  const queuedAgentFollowup = match.queuedAgentFollowup;
  if (queuedAgentFollowup?.actorUid === actorUid) {
    match.queuedAgentFollowup = null;
    if (queuedAgentFollowup.seekAlliesCardId) {
      match.pendingChoice = {
        kind: 'seek-allies',
        actorUid,
        cardInstanceId: queuedAgentFollowup.seekAlliesCardId,
        options: ['trash-self', 'keep-card']
      };
      return;
    }
    if (queuedAgentFollowup.placeScout && openScoutPlacement(match, actorUid, { followupSeekAlliesCardId: null })) {
      return;
    }
  }
  const queuedCardChoice = match.queuedChronicleCardChoice;
  if (queuedCardChoice?.actorUid === actorUid) {
    match.queuedChronicleCardChoice = null;
    if (openChronicleCardChoice(match, actorUid, queuedCardChoice.definitionId, queuedCardChoice.cardInstanceIds)) return;
  }
  const queuedPayment = match.queuedChroniclePayment;
  if (queuedPayment?.actorUid === actorUid) {
    match.queuedChroniclePayment = null;
    openChroniclePayment(match, actorUid, queuedPayment.definitionId);
    return;
  }
  const queuedStandingLoss = match.queuedChronicleStandingLoss;
  if (queuedStandingLoss?.actorUid === actorUid) {
    match.queuedChronicleStandingLoss = null;
    if (openChronicleStandingLoss(match, actorUid)) return;
  }
  const queuedStandingGain = match.queuedChronicleStandingGain;
  if (queuedStandingGain?.actorUid === actorUid) {
    match.queuedChronicleStandingGain = null;
    if (openChronicleStandingGain(match, actorUid)) return;
  }
  const queuedElvenForesight = match.queuedElvenForesight;
  if (queuedElvenForesight?.actorUid === actorUid) {
    match.queuedElvenForesight = null;
    if (openElvenForesight(match, actorUid)) return;
  }
  const queuedRing = match.queuedCommanderRing;
  if (queuedRing?.actorUid === actorUid) {
    match.queuedCommanderRing = null;
    if (match.players[actorUid].commander === 'aragorn') {
      if (openAragornRing(match, actorUid, null)) return;
    } else if (match.players[actorUid].commander === 'theoden') {
      applyTheodenRing(match, actorUid);
      if (match.queuedBattleDeployment?.actorUid === actorUid) {
        match.queuedBattleDeployment.additionalGarrisonAllowance += 1;
        match.queuedBattleDeployment.additionalGarrisonSource = 'Ride Now';
      }
    } else if (match.players[actorUid].commander === 'galadriel') {
      if (openGaladrielRing(match, actorUid, null)) return;
    } else if (match.players[actorUid].commander === 'gandalf') {
      openGandalfRing(match, actorUid, null);
      return;
    } else if (match.players[actorUid].commander === 'eowyn') {
      if (openEowynRing(match, actorUid, null)) return;
    } else if (match.players[actorUid].commander === 'saruman') {
      applySarumanRing(match, actorUid);
    }
  }
  const queued = match.queuedBattleDeployment;
  if (queued?.actorUid === actorUid) {
    match.queuedBattleDeployment = null;
    openBattleDeployment(
      match,
      actorUid,
      queued.spaceId,
      queued.additionalGarrisonAllowance,
      queued.additionalGarrisonSource
    );
    if (match.pendingChoice) return;
  }
  if (!match.pendingChoice) advanceToNextAgentPlayer(match);
}

export function battleStrength(match: MatchState, uid: string): number {
  const companies = match.battleCompanies[uid] ?? 0;
  const ents = match.battleEnts[uid] ?? 0;
  if (companies + ents < 1) return 0;
  return Math.max(0, companies * 2 + ents * 3 + match.players[uid].revealedSwords + (match.battleBonusStrength[uid] ?? 0));
}

function clockwiseParticipants(match: MatchState): string[] {
  if (match.turnMode === 'battle' && match.battleParticipantUids.length > 0) return match.battleParticipantUids;
  return Array.from({ length: match.playerOrder.length }, (_, offset) =>
    match.playerOrder[(match.firstPlayerIndex + offset) % match.playerOrder.length]
  ).filter((uid) => (match.battleCompanies[uid] ?? 0) + (match.battleEnts[uid] ?? 0) > 0);
}

function applyBattleReward(match: MatchState, uid: string, rank: 0 | 1 | 2): void {
  const definition = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === match.activeBattleId);
  if (!definition) return;
  const reward = definition.rewards[rank];
  const player = match.players[uid];
  const copies = (match.battleEnts[uid] ?? 0) > 0 ? 2 : 1;
  for (let copy = 0; copy < copies; copy += 1) {
    if (reward.gold) player.resources.gold += reward.gold;
    if (reward.mithril) player.resources.mithril += reward.mithril;
    if (reward.provisions) player.resources.provisions += reward.provisions;
    if (reward.renown) player.renown += reward.renown;
    if (reward.shadowStanding) {
      for (let step = 0; step < reward.shadowStanding; step += 1) gainStanding(match, player, 'shadow');
    }
    if (reward.dwarvenStanding) {
      for (let step = 0; step < reward.dwarvenStanding; step += 1) gainStanding(match, player, 'dwarven');
    }
    if (reward.wildStanding) {
      for (let step = 0; step < reward.wildStanding; step += 1) gainStanding(match, player, 'wild');
    }
    if (reward.chooseFactionStanding) {
      for (let step = 0; step < reward.chooseFactionStanding; step += 1) {
        match.pendingBattleRewardChoices.push({ kind: 'standing', actorUid: uid });
      }
    }
    if (reward.placeScouts) {
      for (let step = 0; step < reward.placeScouts; step += 1) {
        match.pendingBattleRewardChoices.push({ kind: 'place-scout', actorUid: uid });
      }
    }
    if (reward.drawTwoFateKeepOne) {
      match.pendingBattleRewardChoices.push({ kind: 'fate-keep-one', actorUid: uid });
    }
    if (reward.drawFate) {
      drawFateOrOpenForesight(match, uid, reward.drawFate, 'a Battle reward', { kind: 'battle-reward' });
    }
  }
  if (reward.recruitCompanies) recruitCompanies(match, player, reward.recruitCompanies * copies);
  if (reward.breachDam) match.damBreached = true;
  if (reward.controlLocationId) match.criticalControl[reward.controlLocationId] = uid;
}

function continueBattleRewardChoicesOrRecall(match: MatchState): void {
  if (openQueuedCommanderEngines(match)) return;
  const next = match.pendingBattleRewardChoices.shift();
  if (next?.kind === 'standing') {
    match.pendingChoice = {
      kind: 'battle-standing',
      actorUid: next.actorUid,
      options: ['standing-shadow', 'standing-dwarven', 'standing-elven', 'standing-wild']
    };
    match.activity.push('A ranked player must choose a faction for a Battle standing reward.');
    return;
  }
  if (next?.kind === 'place-scout') {
    if (!openScoutPlacement(match, next.actorUid, {
      followupSeekAlliesCardId: null,
      resumeBattleReward: true
    })) {
      match.activity.push('A ranked Scout reward is lost because no observation post can be opened.');
      continueBattleRewardChoicesOrRecall(match);
      return;
    }
    match.activity.push('A ranked player must place a Scout before Recall.');
    return;
  }
  if (next?.kind === 'fate-keep-one') {
    const request: QueuedFateDraw = {
      actorUid: next.actorUid, count: 2, source: 'a Battle reward', resume: { kind: 'battle-keep-one' }
    };
    const drawn = drawFateOrOpenForesight(match, request.actorUid, request.count, request.source, request.resume);
    if (drawn) resumeFateDraw(match, request, drawn);
    return;
  }
  recallAndBeginNextRound(match);
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
    const winner = match.players[winnerUid];
    const matchingFaceUpBattleId = winner.wonBattleIds.find((ownedBattleId) =>
      !winner.pairedBattleIds.includes(ownedBattleId) &&
      BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === ownedBattleId)?.standard === definition.standard
    );
    winner.wonBattleIds.push(battleId);
    if (matchingFaceUpBattleId) {
      winner.pairedBattleIds.push(matchingFaceUpBattleId, battleId);
      winner.renown += 1;
      match.activity.push(`${definition.standard} Standards are paired face down for 1 Renown.`);
    }
    match.activity.push(`${definition.name} is won at ${strengths[winnerUid]} Strength.`);
  } else {
    match.battleDiscard.push(battleId);
    match.activity.push(`${definition.name} has no sole winner.`);
  }
  match.battleHistory.push({ battleId, winnerUid, strengths });
  for (const uid of match.playerOrder) {
    match.players[uid].companies.supply += match.battleCompanies[uid] ?? 0;
    match.battleCompanies[uid] = 0;
    match.battleEnts[uid] = 0;
    match.battleBonusStrength[uid] = 0;
  }
  match.battleParticipantUids = [];
  match.eowynNoLivingManUsed = false;
  match.witchKingBlackBreathUsed = false;
  match.queuedCommanderBlackBreath = null;
  match.activeBattleId = null;
  if (!match.pendingChoice) continueBattleRewardChoicesOrRecall(match);
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
  match.battleParticipantUids = participants;
  match.eowynNoLivingManUsed = false;
  match.witchKingBlackBreathUsed = false;
  match.queuedCommanderBlackBreath = null;
  match.consecutiveBattlePasses = 0;
  match.currentPlayerIndex = match.playerOrder.indexOf(participants[0]);
  match.activity.push('The Combat Fate window opens with every participant at their revealed Strength.');
}

function resolveEowynNoLivingMan(
  match: MatchState,
  fateActorUid: string,
  fateActorName: string,
  fateActorStrengthBefore: number
): void {
  if (match.eowynNoLivingManUsed) return;
  const eowynUid = match.battleParticipantUids.find((uid) => match.players[uid].commander === 'eowyn');
  if (!eowynUid || eowynUid === fateActorUid) return;
  const eowynStrength = battleStrength(match, eowynUid);
  const fateActorStrengthAfter = battleStrength(match, fateActorUid);
  if (fateActorStrengthBefore > eowynStrength || fateActorStrengthAfter <= eowynStrength) return;
  match.battleBonusStrength[eowynUid] = (match.battleBonusStrength[eowynUid] ?? 0) + 2;
  match.eowynNoLivingManUsed = true;
  match.activity.push(`Éowyn answers ${fateActorName}'s Combat Fate with No Living Man and gains +2 Strength.`);
}

export function blackBreathStrengthLoss(entsInBattle: number): number {
  return Math.max(0, entsInBattle) + 1;
}

function queueWitchKingBlackBreath(match: MatchState, actorUid: string): void {
  const player = match.players[actorUid];
  if (player.commander !== 'witch-king' || match.witchKingBlackBreathUsed) return;
  match.witchKingBlackBreathUsed = true;
  match.queuedCommanderBlackBreath = {
    actorUid,
    strengthLoss: blackBreathStrengthLoss(match.battleEnts[actorUid] ?? 0)
  };
  match.activity.push(`The Witch-king readies Black Breath after playing his first Combat Fate this Battle.`);
}

function openQueuedWitchKingBlackBreath(match: MatchState): boolean {
  const queued = match.queuedCommanderBlackBreath;
  if (!queued) return false;
  match.queuedCommanderBlackBreath = null;
  const options = match.battleParticipantUids
    .filter((uid) => uid !== queued.actorUid)
    .map((uid) => `opponent:${uid}`);
  if (options.length === 0) return false;
  match.pendingChoice = {
    kind: 'commander-black-breath',
    actorUid: queued.actorUid,
    strengthLoss: queued.strengthLoss,
    options
  };
  match.activity.push(`The Witch-king must choose an opponent to lose ${queued.strengthLoss} Strength to Black Breath.`);
  return true;
}

function gainStanding(
  match: MatchState,
  player: MatchPlayer,
  faction: 'shadow' | 'dwarven' | 'elven' | 'wild',
  followupSeekAlliesCardId: string | null = null,
  followupPlaceScout = false,
  resumeBattleStanding = false
): void {
  const before = player.standing[faction];
  player.standing[faction] = Math.min(6, before + 1);
  const after = player.standing[faction];
  if (
    after > before &&
    before >= 2 &&
    player.commander === 'aragorn' &&
    !player.commanderPersistentUsedThisRound
  ) {
    player.commanderPersistentUsedThisRound = true;
    const recruited = recruitCompanies(match, player, 1);
    match.activity.push(`Aragorn's Line Unbroken recruits ${recruited} Company${recruited === 1 ? '' : 'ies'}.`);
  }
  if (before < 2 && after >= 2) player.renown += 1;
  if (before < 4 && after >= 4) {
    if (faction === 'shadow') recruitCompanies(match, player, 2);
    if (faction === 'dwarven') player.resources.provisions += 2;
    if (faction === 'elven') {
      const resume: FateDrawResume = {
        kind: 'elven-favor', followupSeekAlliesCardId, followupPlaceScout, resumeBattleStanding
      };
      const drawn = drawFateOrOpenForesight(match, player.uid, 2, 'Elven favor', resume);
      if (drawn && drawn.length > 1) {
        match.pendingChoice = {
          kind: 'elven-favor',
          actorUid: player.uid,
          drawnFateIds: drawn.map((fate) => fate.id),
          followupSeekAlliesCardId,
          followupPlaceScout,
          resumeBattleStanding,
          options: drawn.map((fate) => `keep:${fate.id}`)
        };
      }
    }
    if (faction === 'wild') {
      player.resources.provisions += 1;
      recruitCompanies(match, player, 1);
    }
  }
  const holder = match.alliances[faction];
  if (after >= 4 && (!holder || match.players[holder].standing[faction] < after)) {
    if (holder) match.players[holder].renown -= 1;
    match.alliances[faction] = player.uid;
    player.renown += 1;
  }
}

function loseStanding(match: MatchState, player: MatchPlayer, faction: FactionId): void {
  const before = player.standing[faction];
  const after = Math.max(0, before - 1);
  player.standing[faction] = after;
  if (before >= 2 && after < 2) player.renown -= 1;

  const holder = match.alliances[faction];
  if (holder !== player.uid) return;
  const successor = match.playerOrder
    .filter((uid) => uid !== player.uid && match.players[uid].standing[faction] > after)
    .sort((left, right) => match.players[right].standing[faction] - match.players[left].standing[faction])[0];
  if (!successor) return;
  player.renown -= 1;
  match.alliances[faction] = successor;
  match.players[successor].renown += 1;
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
  match: MatchState,
  actorName: string,
  actorUid: string,
  card: CardInstance,
  space: (typeof BOARD_SPACE_DEFINITIONS)[number],
  ignoredResourceCost = false,
  commanderDeploymentAllowance = 0,
  skipJourney = false
): void {
  const player = match.players[actorUid];
  const cardDefinition = AGENT_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId)!;
  if (!skipJourney &&
    isBattleSpace(space) &&
    player.commander === 'theoden' &&
    !player.commanderPersistentUsedThisRound
  ) {
    player.commanderPersistentUsedThisRound = true;
    const recruited = recruitCompanies(match, player, 1);
    match.activity.push(`Théoden's Forth Eorlingas recruits ${recruited} Company${recruited === 1 ? '' : 'ies'}.`);
  }
  const seekAlliesCardId = cardDefinition.journeyEffect?.kind === 'optional-trash-self' ? card.id : null;
  const hasJourneyScoutPlacement = cardDefinition.journeyEffect?.kind === 'place-scout'
    || cardDefinition.journeyEffect?.kind === 'draw-fate-place-scout'
    || cardDefinition.journeyEffect?.kind === 'place-scout-optional-recall-draw'
    || cardDefinition.journeyEffect?.kind === 'place-scout-connected-battle';
  const costResolution = (printedCost: string) => ignoredResourceCost
    ? `ignoring the ${printedCost} cost through the Paths of the Dead`
    : `paying ${printedCost}`;
  let resolution: string;
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'recruit-companies') {
    recruitCompanies(match, player, cardDefinition.journeyEffect.amount);
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-provisions') {
    player.resources.provisions += cardDefinition.journeyEffect.amount;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-gold') {
    player.resources.gold += cardDefinition.journeyEffect.amount;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'draw-card-battle-recruit') {
    for (let index = 0; index < cardDefinition.journeyEffect.draw; index += 1) drawOneCard(match, player.uid, cardDefinition.name);
    if (isBattleSpace(space)) recruitCompanies(match, player, cardDefinition.journeyEffect.recruit);
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'draw-fate-place-scout') {
    drawFateOrOpenForesight(
      match, actorUid, cardDefinition.journeyEffect.drawFate, cardDefinition.name, {
        kind: 'agent-destination', actorName, cardInstanceId: card.id, spaceId: space.id,
        ignoredResourceCost, commanderDeploymentAllowance
      }
    );
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'draw-fate-recruit') {
    drawFateOrOpenForesight(
      match, actorUid, cardDefinition.journeyEffect.drawFate, cardDefinition.name, {
        kind: 'agent-destination', actorName, cardInstanceId: card.id, spaceId: space.id,
        ignoredResourceCost, commanderDeploymentAllowance
      }
    );
    recruitCompanies(match, player, cardDefinition.journeyEffect.recruit);
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'council-seat-gold') {
    player.resources.gold += player.councilSeat
      ? cardDefinition.journeyEffect.withSeat
      : cardDefinition.journeyEffect.withoutSeat;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'paid-space-mithril' && hasMandatoryResourceCost(space)) {
    player.resources.mithril += cardDefinition.journeyEffect.amount;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-mithril-recruit') {
    player.resources.mithril += cardDefinition.journeyEffect.mithril;
    recruitCompanies(match, player, cardDefinition.journeyEffect.recruit);
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-gold-tax-richer') {
    player.resources.gold += cardDefinition.journeyEffect.gold;
    for (const opponentUid of match.playerOrder.filter((uid) => uid !== actorUid)) {
      const opponent = match.players[opponentUid];
      if (opponent.resources.gold > player.resources.gold) {
        opponent.resources.gold = Math.max(0, opponent.resources.gold - cardDefinition.journeyEffect.opponentLoss);
      }
    }
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-gold-optional-pay-standing') {
    player.resources.gold += cardDefinition.journeyEffect.gainGold;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'recruit-lose-standing') {
    recruitCompanies(match, player, cardDefinition.journeyEffect.recruit);
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'place-scout-optional-recall-draw') {
    match.queuedMessengerMothRecall = { actorUid };
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'reorder-draw-pile') {
    match.queuedElvenForesight = { actorUid };
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'gain-mithril-extra-battle-deploy') {
    player.resources.mithril += cardDefinition.journeyEffect.mithril;
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'place-scout-connected-battle') {
    match.queuedScoutPlacementRestriction = {
      actorUid,
      postIds: battleConnectedObservationPostIds()
    };
  }
  if (!skipJourney && cardDefinition.journeyEffect?.kind === 'optional-pay-mithril-draw-discard') {
    match.queuedChroniclePayment = {
      actorUid,
      definitionId: cardDefinition.id as PaidChronicleId
    };
  }
  if (!skipJourney &&
    cardDefinition.journeyEffect?.kind === 'draw-discard-card' ||
    cardDefinition.journeyEffect?.kind === 'draw-optional-trash'
  ) {
    for (let index = 0; index < cardDefinition.journeyEffect.draw; index += 1) {
      drawOneCard(match, player.uid, cardDefinition.name);
    }
    const eligible = cardDefinition.journeyEffect.kind === 'draw-optional-trash' && cardDefinition.journeyEffect.includeDiscard
      ? [...player.hand, ...player.discardPile]
      : player.hand;
    match.queuedChronicleCardChoice = {
      actorUid,
      definitionId: cardDefinition.id as HandcraftChronicleId,
      cardInstanceIds: eligible.map((candidate) => candidate.id)
    };
  }
  if (
    !skipJourney &&
    match.pendingChoice?.kind === 'commander-fate-foresight' &&
    match.pendingChoice.resume.kind === 'agent-destination' &&
    match.pendingChoice.resume.cardInstanceId === card.id
  ) return;
  if (space.effect.kind === 'dwarven-caravans') {
    player.resources.provisions += space.effect.gainProvisions;
    gainStanding(match, player, 'dwarven');
    resolution = 'gaining 1 Dwarven standing and 1 Provision';
  } else if (space.effect.kind === 'deep-roads') {
    gainStanding(match, player, 'dwarven', seekAlliesCardId);
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    resolution = `gaining 1 Dwarven standing and recruiting ${recruited} Companies for Battle`;
  } else if (space.effect.kind === 'tribute-shadow') {
    player.resources.gold += space.effect.gainGold;
    gainStanding(match, player, 'shadow');
    resolution = 'gaining 1 Shadow standing and 2 Gold';
  } else if (space.effect.kind === 'pits-isengard') {
    gainStanding(match, player, 'shadow', seekAlliesCardId);
    const fate = drawFateOrOpenForesight(match, actorUid, 1, 'Pits of Isengard', { kind: 'finish-agent' });
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    resolution = `gaining 1 Shadow standing, drawing ${fate === null || fate.length > 0 ? '1 Fate' : 'no Fate'}, and recruiting ${recruited} Companies`;
  } else if (space.effect.kind === 'hidden-paths') {
    gainStanding(match, player, 'wild', seekAlliesCardId);
    const drawn = drawOneCard(match, player.uid, 'Hidden Paths');
    resolution = `gaining 1 Wild standing and drawing ${drawn ? '1 card' : 'no card'} for Battle`;
  } else if (space.effect.kind === 'ranger-mustering') {
    gainStanding(match, player, 'wild');
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    const trashable = [...player.hand, ...player.discardPile].map((candidate) => candidate.id);
    resolution = `gaining 1 Wild standing, recruiting ${recruited} Company for Battle, and preparing an optional trash`;
    if (trashable.length > 0) {
      match.pendingChoice = {
        kind: 'ranger-mustering-trash', actorUid: player.uid, cardInstanceIds: trashable,
        followupSeekAlliesCardId: seekAlliesCardId,
        followupPlaceScout: hasJourneyScoutPlacement,
        options: [...trashable.map((id) => `trash-card:${id}`), 'decline-trash']
      };
    }
  } else if (space.effect.kind === 'hidden-counsel') {
    gainStanding(match, player, 'elven', seekAlliesCardId, hasJourneyScoutPlacement);
    const drawn = drawFateOrOpenForesight(match, actorUid, 1, 'Hidden Counsel', { kind: 'finish-agent' });
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
    resolution = `gaining 1 Elven standing, drawing ${drawn === null || drawn.length > 0 ? '1 Fate' : 'no Fate'}, and receiving ${transfers} Fate from opponents holding four or more`;
  } else if (space.effect.kind === 'mirror-galadriel') {
    gainStanding(match, player, 'elven', seekAlliesCardId, true);
    const drawn = player.drawPile.shift();
    if (drawn) player.hand.push(drawn);
    resolution = `gaining 1 Elven standing, drawing ${drawn ? '1 card' : 'no card'}, and preparing to place 1 Scout`;
    if (!match.pendingChoice) {
      openScoutPlacement(match, player.uid, { followupSeekAlliesCardId: seekAlliesCardId });
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
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    resolution = `recruiting ${recruited} Companies`;
    if (player.resources.gold >= space.effect.optionalGoldCost) {
      match.pendingChoice = {
        kind: 'muster-free-peoples',
        actorUid: player.uid,
        options: ['pay-2-gold', 'decline']
      };
    }
  } else if (space.effect.kind === 'hall-of-fire') {
    const fate = drawFateOrOpenForesight(match, actorUid, 1, 'Hall of Fire', { kind: 'finish-agent' });
    resolution = `drawing ${fate === null || fate.length > 0 ? '1 Fate' : 'no Fate'} and gaining 1 Influence during this round's Reveal while the Agent remains`;
  } else if (space.effect.kind === 'minas-tirith') {
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    const drawn = drawOneCard(match, player.uid, 'Minas Tirith');
    resolution = `recruiting ${recruited} Company, drawing ${drawn ? '1 card' : 'no card'}, and preparing forces for Battle`;
  } else if (space.effect.kind === 'archives-rivendell') {
    const recruited = recruitCompanies(match, player, space.effect.recruitCompanies);
    const drawn = Array.from({ length: space.effect.drawCards }, () => drawOneCard(match, player.uid, 'Archives of Rivendell')).filter(Boolean).length;
    resolution = `${costResolution('2 Provisions')}, recruiting ${recruited} Companies, drawing ${drawn} cards, and preparing forces for Battle`;
  } else if (space.effect.kind === 'osgiliath') {
    const options: ('pay-0-mithril' | 'pay-1-mithril')[] = ['pay-0-mithril'];
    if (player.resources.mithril >= space.effect.optionalCostMithril) options.push('pay-1-mithril');
    match.pendingChoice = {
      kind: 'osgiliath', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId,
      followupPlaceScout: hasJourneyScoutPlacement, options
    };
    resolution = 'choosing whether to pay 1 Mithril for 2 or 4 Gold before deploying to Battle';
  } else if (space.effect.kind === 'great-forge') {
    player.resources.gold += space.effect.gainGold;
    match.pendingChoice = {
      kind: 'great-forge', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId,
      followupPlaceScout: hasJourneyScoutPlacement,
      options: ['standing-shadow', 'standing-dwarven', 'standing-elven', 'standing-wild']
    };
    resolution = `${costResolution('3 Mithril')}, gaining 5 Gold, and choosing one faction standing`;
  } else if (space.effect.kind === 'fangorn-moot') {
    const options: ('take-ent-draught' | 'gain-provision-breach-dam' | 'gain-provision-leave-dam')[] = [];
    if (!player.entDraught) options.push('take-ent-draught');
    if (!match.damBreached) options.push('gain-provision-breach-dam');
    options.push('gain-provision-leave-dam');
    match.pendingChoice = {
      kind: 'fangorn-moot', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId,
      followupPlaceScout: hasJourneyScoutPlacement, options
    };
    resolution = 'calling the Moot to choose Ent-draught or the fate of the Dam';
  } else if (space.effect.kind === 'deep-fangorn') {
    const riches = match.richesMithril['deep-fangorn'];
    player.resources.mithril += riches;
    match.richesMithril['deep-fangorn'] = 0;
    const options: ('gain-4-mithril' | 'summon-2-ents')[] = ['gain-4-mithril'];
    if (canSummonEnts(match, player)) options.push('summon-2-ents');
    match.pendingChoice = {
      kind: 'deep-fangorn', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId,
      followupPlaceScout: hasJourneyScoutPlacement, options
    };
    resolution = `${costResolution('3 Provisions')}, taking ${riches} Riches, and choosing Mithril or Ents`;
  } else if (space.effect.kind === 'entwash') {
    const riches = match.richesMithril.entwash;
    player.resources.mithril += riches;
    match.richesMithril.entwash = 0;
    const options: ('gain-2-mithril' | 'summon-1-ent')[] = ['gain-2-mithril'];
    if (canSummonEnts(match, player)) options.push('summon-1-ent');
    match.pendingChoice = {
      kind: 'entwash', actorUid: player.uid, followupSeekAlliesCardId: seekAlliesCardId,
      followupPlaceScout: hasJourneyScoutPlacement, options
    };
    resolution = `${costResolution('1 Provision')}, taking ${riches} Riches, and choosing Mithril or an Ent`;
  } else if (space.effect.kind === 'edoras') {
    const riches = match.richesMithril.edoras;
    player.resources.mithril += space.effect.gainMithril + riches;
    match.richesMithril.edoras = 0;
    resolution = `gaining ${space.effect.gainMithril} Mithril and taking ${riches} bonus Mithril from Riches`;
  } else if (!player.councilSeat) {
    player.councilSeat = true;
    resolution = 'taking a Council seat and gaining 2 Influence on every future Reveal';
  } else {
    player.resources.mithril += space.effect.repeatGainMithril;
    const fate = drawFateOrOpenForesight(match, actorUid, 1, 'Seat on the White Council', { kind: 'finish-agent' });
    const recruited = recruitCompanies(match, player, space.effect.repeatRecruitCompanies);
    resolution = `gaining 2 Mithril, drawing ${fate === null || fate.length > 0 ? '1 Fate' : 'no Fate'}, and recruiting ${recruited} Companies`;
  }
  if (
    cardDefinition.journeyEffect?.kind === 'optional-pay-gold-mithril' ||
    cardDefinition.journeyEffect?.kind === 'optional-pay-gold-recruit' ||
    cardDefinition.journeyEffect?.kind === 'gain-gold-optional-pay-standing'
  ) {
    const definitionId = cardDefinition.id as PaidChronicleId;
    if (match.pendingChoice) match.queuedChroniclePayment = { actorUid, definitionId };
    else openChroniclePayment(match, actorUid, definitionId);
  }
  if (cardDefinition.journeyEffect?.kind === 'recruit-lose-standing') {
    if (match.pendingChoice) match.queuedChronicleStandingLoss = { actorUid };
    else openChronicleStandingLoss(match, actorUid);
  }
  if (cardDefinition.journeyEffect?.kind === 'gain-low-faction-standing') {
    if (match.pendingChoice) match.queuedChronicleStandingGain = { actorUid };
    else openChronicleStandingGain(match, actorUid);
  }
  const needsSeekAllies = cardDefinition.journeyEffect?.kind === 'optional-trash-self';
  const pendingCarriesSeekAllies = match.pendingChoice && 'followupSeekAlliesCardId' in match.pendingChoice;
  const pendingCarriesScout = match.pendingChoice && 'followupPlaceScout' in match.pendingChoice;
  const queueSeekAllies = needsSeekAllies && !!match.pendingChoice && !pendingCarriesSeekAllies;
  const queueScout = hasJourneyScoutPlacement && !!match.pendingChoice && !pendingCarriesScout;
  if (queueSeekAllies || queueScout) {
    match.queuedAgentFollowup = {
      actorUid,
      seekAlliesCardId: queueSeekAllies ? card.id : null,
      placeScout: queueScout
    };
  } else if (needsSeekAllies && !match.pendingChoice) {
    match.pendingChoice = {
      kind: 'seek-allies', actorUid: player.uid, cardInstanceId: card.id,
      options: ['trash-self', 'keep-card']
    };
  } else if (hasJourneyScoutPlacement && !match.pendingChoice) {
    openScoutPlacement(match, player.uid, { followupSeekAlliesCardId: null });
  }
  if (isBattleSpace(space) && match.activeBattleId) {
    const cardDeploymentAllowance = cardDefinition.journeyEffect?.kind === 'gain-mithril-extra-battle-deploy'
      ? cardDefinition.journeyEffect.additionalGarrisonCompany
      : 0;
    const additionalGarrisonAllowance = cardDeploymentAllowance + commanderDeploymentAllowance;
    const additionalGarrisonSource = commanderDeploymentAllowance > 0
      ? 'Ride Now' as const
      : cardDeploymentAllowance > 0
        ? 'Khazad Guard' as const
        : null;
    if (match.pendingChoice || match.queuedCommanderRing?.actorUid === actorUid) {
      match.queuedBattleDeployment = {
        actorUid,
        spaceId: space.id,
        additionalGarrisonAllowance,
        additionalGarrisonSource
      };
    } else {
      openBattleDeployment(match, actorUid, space.id, additionalGarrisonAllowance, additionalGarrisonSource);
    }
  }
  match.activity.push(`${actorName} sends an Agent to ${space.name}, ${resolution}.`);
}

function beginAgentResolution(
  state: GameState,
  actorName: string,
  actorUid: string,
  card: CardInstance,
  space: (typeof BOARD_SPACE_DEFINITIONS)[number],
  ignoredResourceCost = false
): void {
  if (card.definitionId === 'token-of-command') {
    const commander = state.match!.players[actorUid].commander;
    const ringName = commander === 'theoden'
      ? 'Ride Now'
      : commander === 'galadriel'
        ? 'Mirror Unveiled'
        : commander === 'gandalf'
          ? 'Kindle Courage'
          : commander === 'eowyn'
            ? 'Choose Deeds'
            : commander === 'saruman'
              ? 'A Fair-seeming Promise'
              : 'Andúril Aflame';
    state.match!.pendingChoice = {
      kind: 'token-command-order',
      actorUid,
      cardInstanceId: card.id,
      spaceId: space.id,
      ignoredResourceCost,
      options: ['ring-first', 'space-first']
    };
    state.match!.activity.push(`${actorName} sends Token of Command to ${space.name} and chooses whether ${ringName} resolves before or after the destination.`);
    return;
  }
  resolveAgentEffects(state.match!, actorName, actorUid, card, space, ignoredResourceCost);
  if (!state.match!.pendingChoice) finishAgentAction(state.match!, actorUid);
}

function continuePlacedAgent(
  state: GameState,
  actorName: string,
  actorUid: string,
  card: CardInstance,
  space: (typeof BOARD_SPACE_DEFINITIONS)[number],
  ignoredResourceCost = false
): void {
  const match = state.match!;
  const player = match.players[actorUid];
  const controllerResource = space.id === 'minas-tirith'
    ? { locationId: 'minas-tirith' as const, resource: 'gold' as const, label: 'Gold' }
    : space.id === 'osgiliath'
      ? { locationId: 'osgiliath' as const, resource: 'gold' as const, label: 'Gold' }
      : space.id === 'edoras'
        ? { locationId: 'edoras' as const, resource: 'mithril' as const, label: 'Mithril' }
        : null;
  if (controllerResource) {
    const controllerUid = match.criticalControl[controllerResource.locationId];
    if (controllerUid) {
      match.players[controllerUid].resources[controllerResource.resource] += 1;
      match.activity.push(`${state.players.find((candidate) => candidate.uid === controllerUid)?.displayName ?? 'The controller'} gains 1 ${controllerResource.label} from ${space.name}.`);
    }
  }
  const gatheringPosts = OBSERVATION_POSTS.filter(
    (post) => post.connectedSpaceIds.includes(space.id) && match.boardScouts[post.id] === actorUid
  ).map((post) => post.id);
  if (gatheringPosts.length > 0) {
    match.pendingChoice = {
      kind: 'gather-intelligence',
      actorUid,
      cardInstanceId: card.id,
      spaceId: space.id,
      ignoredResourceCost,
      postIds: gatheringPosts,
      options: [...gatheringPosts.map((postId) => `recall:${postId}`), 'decline-intelligence']
    };
    match.activity.push(`${actorName} places an Agent at ${space.name} and may gather intelligence before resolving it.`);
    return;
  }
  beginAgentResolution(state, actorName, actorUid, card, space, ignoredResourceCost);
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

  if (
    state.match &&
    !['player/commander-selected', 'player/ready', 'match/started'].includes(event.type) &&
    event.payload.matchEpoch !== state.match.epoch
  ) return 'stale match epoch';

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
    state.match = createMatch(state, seed.trim(), 1);
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
    const card = player.hand.find((candidate) => candidate.id === cardInstanceId)!;
    const cardDefinition = AGENT_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId)!;
    const pathsCost = cardDefinition.journeyEffect?.kind === 'recall-scout-ignore-space-cost'
      ? mandatoryResourceCost(state.match, player, space)
      : null;
    if (!pathsCost && !payMandatoryResourceCost(state.match, player, space)) return 'illegal Agent placement';
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
      player.scoutsRecalledThisRound += 1;
      state.match.activity.push(`${actor.displayName} recalls their Scout from ${post.name} to infiltrate ${space.name}.`);
    } else if (infiltrationPostId !== undefined) {
      return 'illegal Agent infiltration';
    }
    const cardIndex = player.hand.findIndex((candidate) => candidate.id === cardInstanceId);
    player.hand.splice(cardIndex, 1);
    player.journey.push(card);
    const agentNumber = 1 + Object.values(state.match.boardAgents).flat().filter((occupation) => occupation.uid === event.actorUid).length;
    player.availableAgents -= 1;
    state.match.boardAgents[spaceId] = [...occupants, { uid: event.actorUid, agentNumber }];
    if (pathsCost) {
      const postIds = OBSERVATION_POSTS
        .filter((post) => state.match!.boardScouts[post.id] === event.actorUid)
        .map((post) => post.id);
      const options = postIds.map((postId) => `recall-paths:${postId}`);
      if (player.resources[pathsCost.resource] >= pathsCost.amount) options.unshift('pay-space-cost');
      if (options.length === 0) return 'illegal Agent placement';
      state.match.pendingChoice = {
        kind: 'chronicle-paths-cost',
        actorUid: event.actorUid,
        cardInstanceId: card.id,
        spaceId,
        postIds,
        costResource: pathsCost.label,
        costAmount: pathsCost.amount,
        options
      };
      state.match.activity.push(`${actor.displayName} places an Agent at ${space.name} and must pay its resource cost or recall a Scout through the Paths of the Dead.`);
      return null;
    }
    continuePlacedAgent(state, actor.displayName, event.actorUid, card, space);
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
      (
        pending.kind !== 'critical-defense' &&
        pending.kind !== 'divided-counsel-response' &&
        pending.kind !== 'battle-standing' &&
        pending.kind !== 'battle-fate-keep' &&
        pending.kind !== 'commander-fate-foresight' &&
        !(pending.kind === 'commander-engines-isengard' && pending.resume === 'battle') &&
        !(pending.kind === 'elven-favor' && pending.resumeBattleStanding) &&
        currentPlayerUid(state) !== event.actorUid
      ) ||
      typeof choice !== 'string' ||
      !pending.options.some((option) => option === choice)
    ) return 'illegal choice resolution';
    const player = state.match.players[event.actorUid];
    if (pending.kind === 'commander-fate-foresight') {
      if (!choice.startsWith('take-fate:')) return 'illegal choice resolution';
      const chosenId = choice.slice('take-fate:'.length);
      const currentTop = state.match.fateDeck.slice(0, pending.fateIds.length);
      if (
        pending.fateIds.length !== 2 ||
        currentTop.length !== pending.fateIds.length ||
        currentTop.some((fate, index) => fate.id !== pending.fateIds[index])
      ) return 'illegal choice resolution';
      const chosenIndex = currentTop.findIndex((fate) => fate.id === chosenId);
      if (chosenIndex < 0) return 'illegal choice resolution';
      const unchosen = currentTop[chosenIndex === 0 ? 1 : 0];
      const [chosen] = currentTop.splice(chosenIndex, 1);
      state.match.fateDeck.splice(0, pending.fateIds.length);
      state.match.fateDeck.push(unchosen);
      const additional = state.match.fateDeck.splice(0, pending.remainingDraws);
      const drawn = [chosen, ...additional];
      player.fateHand.push(...drawn);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} takes one private Fate card with Foresight and puts the other on the bottom of the Fate deck.`);
      resumeFateDraw(state.match, {
        actorUid: event.actorUid,
        count: 1 + pending.remainingDraws,
        source: pending.source,
        resume: pending.resume
      }, drawn);
      return null;
    }
    if (pending.kind === 'critical-defense') {
      if (choice === 'deploy-defender') {
        if (player.companies.supply < 1) return 'illegal choice resolution';
        player.companies.supply -= 1;
        state.match.battleCompanies[event.actorUid] = (state.match.battleCompanies[event.actorUid] ?? 0) + 1;
        state.match.activity.push(`${actor.displayName} deploys 1 defending Company from supply at ${BOARD_SPACE_DEFINITIONS.find((space) => space.id === pending.locationId)?.name}.`);
      } else {
        state.match.activity.push(`${actor.displayName} declines to deploy a defending Company at ${BOARD_SPACE_DEFINITIONS.find((space) => space.id === pending.locationId)?.name}.`);
      }
      state.match.pendingChoice = null;
      return null;
    }
    if (pending.kind === 'commander-engines-isengard') {
      if (choice === 'pay-engines' && (player.resources.gold < 1 || player.companies.supply < 1)) {
        return 'illegal choice resolution';
      }
      state.match.pendingChoice = null;
      if (choice === 'pay-engines') {
        player.resources.gold -= 1;
        const recruited = recruitCompanies(state.match, player, 1);
        state.match.activity.push(`${actor.displayName} pays 1 Gold and recruits ${recruited} additional Company with Engines of Isengard.`);
      } else {
        state.match.activity.push(`${actor.displayName} declines to power Engines of Isengard for this round.`);
      }
      if (pending.resume === 'battle') continueBattleRewardChoicesOrRecall(state.match);
      else finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'token-command-order') {
      const card = player.journey.find((candidate) => candidate.id === pending.cardInstanceId);
      const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.spaceId);
      if (!card || card.definitionId !== 'token-of-command' || !space) return 'illegal choice resolution';
      const commander = player.commander;
      if (commander !== 'aragorn' && commander !== 'theoden' && commander !== 'galadriel' && commander !== 'gandalf' && commander !== 'eowyn' && commander !== 'saruman') {
        return 'illegal choice resolution';
      }
      state.match.pendingChoice = null;
      if (choice === 'ring-first') {
        if (commander === 'aragorn') {
          if (!openAragornRing(state.match, event.actorUid, {
            cardInstanceId: card.id,
            spaceId: space.id,
            ignoredResourceCost: pending.ignoredResourceCost
          })) {
            resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
            if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
          }
        } else if (commander === 'theoden') {
          applyTheodenRing(state.match, event.actorUid);
          resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost, 1);
          if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
        } else if (commander === 'galadriel') {
          if (!openGaladrielRing(state.match, event.actorUid, {
            cardInstanceId: card.id,
            spaceId: space.id,
            ignoredResourceCost: pending.ignoredResourceCost
          })) {
            resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
            if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
          }
        } else if (commander === 'gandalf') {
          openGandalfRing(state.match, event.actorUid, {
            cardInstanceId: card.id,
            spaceId: space.id,
            ignoredResourceCost: pending.ignoredResourceCost
          });
        } else if (commander === 'eowyn') {
          if (openEowynRing(state.match, event.actorUid, {
            cardInstanceId: card.id,
            spaceId: space.id,
            ignoredResourceCost: pending.ignoredResourceCost
          })) return null;
          resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
          if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
        } else {
          applySarumanRing(state.match, event.actorUid);
          resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
          if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
        }
      } else {
        state.match.queuedCommanderRing = { actorUid: event.actorUid };
        resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
        if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'commander-ring-gandalf') {
      state.match.pendingChoice = null;
      if (choice === 'gandalf-draw-fate') {
        const drawn = drawFateOrOpenForesight(
          state.match,
          event.actorUid,
          1,
          'Kindle Courage',
          { kind: 'finish-agent' }
        );
        state.match.activity.push(`Gandalf draws ${drawn?.length ? '1 private Fate' : 'no Fate'} with Kindle Courage.`);
      } else {
        const recruited = recruitCompanies(state.match, player, 2);
        state.match.activity.push(`Gandalf recruits ${recruited} ${recruited === 1 ? 'Company' : 'Companies'} with Kindle Courage.`);
      }
      if (pending.resumeSpace) {
        const card = player.journey.find((candidate) => candidate.id === pending.resumeSpace!.cardInstanceId);
        const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.resumeSpace!.spaceId);
        if (!card || card.definitionId !== 'token-of-command' || !space) return 'illegal choice resolution';
        resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.resumeSpace.ignoredResourceCost);
        if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      } else {
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'commander-ring-eowyn') {
      if (choice.startsWith('trash-card:')) {
        const cardId = choice.slice('trash-card:'.length);
        if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
        const handIndex = player.hand.findIndex((card) => card.id === cardId);
        const discardIndex = player.discardPile.findIndex((card) => card.id === cardId);
        if (handIndex < 0 && discardIndex < 0) return 'illegal choice resolution';
        const [trashed] = handIndex >= 0
          ? player.hand.splice(handIndex, 1)
          : player.discardPile.splice(discardIndex, 1);
        player.trashPile.push(trashed);
        const drawn = drawOneCard(state.match, event.actorUid, 'Choose Deeds');
        state.match.activity.push(`${actor.displayName} trashes one private card and draws ${drawn ? '1 card' : 'no card'} with Choose Deeds.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps every card and draws no card with Choose Deeds.`);
      }
      state.match.pendingChoice = null;
      if (pending.resumeSpace) {
        const card = player.journey.find((candidate) => candidate.id === pending.resumeSpace!.cardInstanceId);
        const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.resumeSpace!.spaceId);
        if (!card || card.definitionId !== 'token-of-command' || !space) return 'illegal choice resolution';
        resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.resumeSpace.ignoredResourceCost);
        if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      } else {
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'commander-ring-standing') {
      const faction = choice.slice('standing-'.length) as FactionId;
      if (!(['shadow', 'dwarven', 'elven', 'wild'] as const).includes(faction) || player.standing[faction] > 1) {
        return 'illegal choice resolution';
      }
      gainStanding(state.match, player, faction);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} gains 1 ${faction} standing with Andúril Aflame.`);
      if (pending.resumeSpace) {
        const card = player.journey.find((candidate) => candidate.id === pending.resumeSpace!.cardInstanceId);
        const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.resumeSpace!.spaceId);
        if (!card || card.definitionId !== 'token-of-command' || !space) return 'illegal choice resolution';
        resolveAgentEffects(state.match, actor.displayName, event.actorUid, card, space, pending.resumeSpace.ignoredResourceCost);
        if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      } else {
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'chronicle-paths-cost') {
      const card = player.journey.find((candidate) => candidate.id === pending.cardInstanceId);
      const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.spaceId);
      if (!card || card.definitionId !== 'paths-dead' || !space) return 'illegal choice resolution';
      let ignoredResourceCost = false;
      if (choice === 'pay-space-cost') {
        if (!payMandatoryResourceCost(state.match, player, space)) return 'illegal choice resolution';
        state.match.activity.push(`${actor.displayName} pays ${pending.costAmount} ${pending.costResource} at ${space.name}.`);
      } else if (choice.startsWith('recall-paths:')) {
        const postId = choice.slice('recall-paths:'.length);
        if (!pending.postIds.includes(postId) || state.match.boardScouts[postId] !== event.actorUid) {
          return 'illegal choice resolution';
        }
        delete state.match.boardScouts[postId];
        player.scouts.supply += 1;
        player.scoutsRecalledThisRound += 1;
        ignoredResourceCost = true;
        const postName = OBSERVATION_POSTS.find((post) => post.id === postId)?.name ?? postId;
        state.match.activity.push(`${actor.displayName} recalls their Scout from ${postName} through the Paths of the Dead and ignores ${pending.costAmount} ${pending.costResource}.`);
      } else return 'illegal choice resolution';
      state.match.pendingChoice = null;
      continuePlacedAgent(state, actor.displayName, event.actorUid, card, space, ignoredResourceCost);
      return null;
    }
    if (pending.kind === 'chronicle-payment') {
      const effect = AGENT_CARD_DEFINITIONS.find((definition) => definition.id === pending.definitionId)?.journeyEffect;
      state.match.pendingChoice = null;
      if (choice === 'pay-chronicle-cost') {
        if (effect?.kind === 'optional-pay-mithril-draw-discard') {
          if (player.resources.mithril < effect.costMithril) return 'illegal choice resolution';
          player.resources.mithril -= effect.costMithril;
          for (let index = 0; index < effect.draw; index += 1) {
            drawOneCard(state.match, player.uid, cardName(pending.definitionId));
          }
          const eligibleIds = player.hand.map((card) => card.id);
          state.match.activity.push(`${actor.displayName} pays ${effect.costMithril} Mithril and privately draws up to ${effect.draw} cards with Palantír Glimpse.`);
          if (openChronicleCardChoice(state.match, event.actorUid, 'palantir-glimpse', eligibleIds)) return null;
          finishAgentAction(state.match, event.actorUid);
          return null;
        }
        const costGold = effect?.kind === 'optional-pay-gold-mithril' || effect?.kind === 'optional-pay-gold-recruit'
          ? effect.costGold
          : effect?.kind === 'gain-gold-optional-pay-standing'
            ? effect.costGold
            : Number.POSITIVE_INFINITY;
        if (player.resources.gold < costGold) return 'illegal choice resolution';
        player.resources.gold -= costGold;
        if (effect?.kind === 'optional-pay-gold-mithril') {
          player.resources.mithril += effect.gainMithril;
          state.match.activity.push(`${actor.displayName} pays ${costGold} Gold to gain ${effect.gainMithril} Mithril from Dwarven Smith.`);
        } else if (effect?.kind === 'optional-pay-gold-recruit') {
          const recruited = recruitCompanies(state.match, player, effect.recruit);
          state.match.activity.push(`${actor.displayName} pays ${costGold} Gold to recruit ${recruited} Companies with Uruk-hai Captain.`);
        } else if (effect?.kind === 'gain-gold-optional-pay-standing') {
          gainStanding(state.match, player, effect.faction);
          state.match.activity.push(`${actor.displayName} pays ${costGold} Gold to gain 1 Dwarven standing from Envoy of Dale.`);
        } else return 'illegal choice resolution';
      } else {
        state.match.activity.push(`${actor.displayName} declines the optional payment on ${cardName(pending.definitionId)}.`);
      }
      if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-card-choice') {
      if (choice.startsWith('discard-card:')) {
        if (pending.definitionId !== 'ranger-north' && pending.definitionId !== 'palantir-glimpse') return 'illegal choice resolution';
        const cardId = choice.slice('discard-card:'.length);
        const cardIndex = player.hand.findIndex((candidate) => candidate.id === cardId);
        if (!pending.cardInstanceIds.includes(cardId) || cardIndex < 0) return 'illegal choice resolution';
        const [discarded] = player.hand.splice(cardIndex, 1);
        player.discardPile.push(discarded);
        state.match.activity.push(`${actor.displayName} discards one private card to complete ${cardName(pending.definitionId)}.`);
      } else if (choice.startsWith('trash-card:')) {
        if (pending.definitionId === 'ranger-north' || pending.definitionId === 'palantir-glimpse') return 'illegal choice resolution';
        const cardId = choice.slice('trash-card:'.length);
        if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
        const handIndex = player.hand.findIndex((candidate) => candidate.id === cardId);
        const discardIndex = player.discardPile.findIndex((candidate) => candidate.id === cardId);
        if (handIndex < 0 && discardIndex < 0) return 'illegal choice resolution';
        const [trashed] = handIndex >= 0
          ? player.hand.splice(handIndex, 1)
          : player.discardPile.splice(discardIndex, 1);
        player.trashPile.push(trashed);
        state.match.activity.push(`${actor.displayName} trashes one private card with ${cardName(pending.definitionId)}.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps every card offered by ${cardName(pending.definitionId)}.`);
      }
      state.match.pendingChoice = null;
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-standing-loss') {
      const faction = choice.slice('lose-standing-'.length) as FactionId;
      if (!(['shadow', 'dwarven', 'elven', 'wild'] as const).includes(faction)) {
        return 'illegal choice resolution';
      }
      const before = player.standing[faction];
      if (before < 1) return 'illegal choice resolution';
      loseStanding(state.match, player, faction);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} loses 1 ${faction} standing to complete Orcish Muster.`);
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-standing-gain') {
      const faction = choice.slice('standing-'.length) as FactionId;
      if (!(['shadow', 'dwarven', 'elven', 'wild'] as const).includes(faction) || player.standing[faction] > 1) {
        return 'illegal choice resolution';
      }
      gainStanding(state.match, player, faction);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} gains 1 ${faction} standing with Heir of Isildur.`);
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-messenger-moth') {
      if (choice.startsWith('recall-moth:')) {
        const postId = choice.slice('recall-moth:'.length);
        if (!pending.postIds.includes(postId) || postId === pending.placedPostId || state.match.boardScouts[postId] !== event.actorUid) {
          return 'illegal choice resolution';
        }
        delete state.match.boardScouts[postId];
        player.scouts.supply += 1;
        player.scoutsRecalledThisRound += 1;
        const drawn = drawOneCard(state.match, event.actorUid, 'Messenger Moth');
        const postName = OBSERVATION_POSTS.find((post) => post.id === postId)?.name ?? postId;
        state.match.activity.push(`${actor.displayName} recalls their Scout from ${postName} with Messenger Moth and draws ${drawn ? '1 card' : 'no card'}.`);
      } else if (choice === 'decline-moth-recall') {
        state.match.activity.push(`${actor.displayName} leaves their other Scouts in place for Messenger Moth.`);
      } else return 'illegal choice resolution';
      state.match.pendingChoice = null;
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-elven-foresight') {
      if (!choice.startsWith('order-draw:')) return 'illegal choice resolution';
      const orderedIds = choice.slice('order-draw:'.length).split('|');
      const currentTop = player.drawPile.slice(0, pending.cardInstanceIds.length);
      if (
        orderedIds.length !== pending.cardInstanceIds.length ||
        new Set(orderedIds).size !== pending.cardInstanceIds.length ||
        !orderedIds.every((id) => pending.cardInstanceIds.includes(id)) ||
        !pending.cardInstanceIds.every((id) => currentTop.some((card) => card.id === id))
      ) return 'illegal choice resolution';
      const byId = new Map(currentTop.map((card) => [card.id, card]));
      player.drawPile.splice(0, currentTop.length, ...orderedIds.map((id) => byId.get(id)!));
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} returns the cards seen by Elven Foresight to the top of their deck in a private order.`);
      finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (pending.kind === 'chronicle-muster-scout') {
      if (choice.startsWith('recall-scout:')) {
        const postId = choice.slice('recall-scout:'.length);
        if (!pending.postIds.includes(postId) || state.match.boardScouts[postId] !== event.actorUid) {
          return 'illegal choice resolution';
        }
        const firstRecall = player.scoutsRecalledThisRound === 0;
        delete state.match.boardScouts[postId];
        player.scouts.supply += 1;
        player.scoutsRecalledThisRound += 1;
        player.revealedSwords += 1;
        if (firstRecall) {
          player.revealInfluence += player.muster.filter((card) => card.definitionId === 'whispered-rumor').length;
        }
        const postName = OBSERVATION_POSTS.find((post) => post.id === postId)?.name ?? postId;
        state.match.activity.push(`${actor.displayName} recalls their Scout from ${postName} with Goblin Informer for 1 additional sword.`);
      } else {
        state.match.activity.push(`${actor.displayName} leaves every Scout in place for this Goblin Informer.`);
      }
      state.match.pendingChoice = null;
      if (!openGoblinMusterChoice(state.match, event.actorUid, pending.remainingCardInstanceIds)) {
        openMasterMusterChoice(
          state.match,
          event.actorUid,
          player.muster.filter((card) => card.definitionId === 'master-lake-town').map((card) => card.id)
        );
      }
      return null;
    }
    if (pending.kind === 'chronicle-muster-fate') {
      if (!player.muster.some((card) => card.id === pending.cardInstanceId && card.definitionId === 'master-lake-town')) {
        return 'illegal choice resolution';
      }
      if (choice === 'pay-master-fate') {
        if (player.resources.gold < 2 || state.match.fateDeck.length < 1) return 'illegal choice resolution';
        player.resources.gold -= 2;
        state.match.pendingChoice = null;
        const request: QueuedFateDraw = {
          actorUid: event.actorUid,
          count: 1,
          source: 'Master of Lake-town',
          resume: { kind: 'master-muster', actorName: actor.displayName, remainingCardInstanceIds: pending.remainingCardInstanceIds }
        };
        const drawn = drawFateOrOpenForesight(state.match, request.actorUid, request.count, request.source, request.resume);
        if (!drawn) return null;
        state.match.activity.push(`${actor.displayName} pays 2 Gold and privately draws ${drawn.length} Fate with Master of Lake-town.`);
      } else {
        state.match.activity.push(`${actor.displayName} keeps their Gold for this Master of Lake-town.`);
        state.match.pendingChoice = null;
      }
      openMasterMusterChoice(state.match, event.actorUid, pending.remainingCardInstanceIds);
      return null;
    }
    if (pending.kind === 'plot-discard') {
      const cardId = choice.slice('discard:'.length);
      if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
      const cardIndex = player.hand.findIndex((card) => card.id === cardId);
      if (cardIndex < 0) return 'illegal choice resolution';
      const [discarded] = player.hand.splice(cardIndex, 1);
      player.discardPile.push(discarded);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} discards one private card to complete A Chance Meeting and resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      return null;
    }
    if (pending.kind === 'gifts-tokens') {
      if (choice === 'pay-2-gold') {
        if (player.resources.gold < 2) return 'illegal choice resolution';
        player.resources.gold -= 2;
        player.resources.mithril += 1;
        player.resources.provisions += 1;
        state.match.activity.push(`${actor.displayName} pays 2 Gold and gains 1 Mithril and 1 Provision from Gifts and Tokens.`);
      } else {
        player.resources.gold += 2;
        state.match.activity.push(`${actor.displayName} gains 2 Gold from Gifts and Tokens.`);
      }
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      return null;
    }
    if (pending.kind === 'tidings-afar') {
      const cardId = choice.slice('top-deck:'.length);
      if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
      const cardIndex = player.hand.findIndex((card) => card.id === cardId);
      if (cardIndex < 0) return 'illegal choice resolution';
      const [returned] = player.hand.splice(cardIndex, 1);
      player.drawPile.unshift(returned);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} puts one private card on top of their deck to complete Tidings from Afar and resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      return null;
    }
    if (pending.kind === 'divided-counsel-opponent') {
      const targetUid = choice.slice('opponent:'.length);
      if (targetUid === event.actorUid || !state.match.playerOrder.includes(targetUid)) return 'illegal choice resolution';
      const target = state.match.players[targetUid];
      const options: ('lose-1-gold' | 'reveal-hand')[] = target.resources.gold >= 1
        ? ['lose-1-gold', 'reveal-hand']
        : ['reveal-hand'];
      state.match.pendingChoice = {
        kind: 'divided-counsel-response',
        actorUid: targetUid,
        fateActorUid: event.actorUid,
        resumeTurn: pending.resumeTurn,
        options
      };
      state.match.activity.push(`${actor.displayName} chooses ${state.players.find((candidate) => candidate.uid === targetUid)?.displayName ?? 'an opponent'} for Divided Counsel.`);
      return null;
    }
    if (pending.kind === 'divided-counsel-response') {
      if (choice === 'lose-1-gold') {
        if (player.resources.gold < 1) return 'illegal choice resolution';
        player.resources.gold -= 1;
        state.match.pendingChoice = null;
        state.match.activity.push(`${actor.displayName} loses 1 Gold to Divided Counsel. ${state.players.find((candidate) => candidate.uid === pending.fateActorUid)?.displayName ?? 'The Fate player'} resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      } else {
        state.match.pendingChoice = {
          kind: 'divided-counsel-review',
          actorUid: pending.fateActorUid,
          targetUid: event.actorUid,
          cardInstanceIds: player.hand.map((card) => card.id),
          resumeTurn: pending.resumeTurn,
          options: ['finish-review']
        };
        state.match.activity.push(`${actor.displayName} reveals their hand only to ${state.players.find((candidate) => candidate.uid === pending.fateActorUid)?.displayName ?? 'the Fate player'}.`);
      }
      return null;
    }
    if (pending.kind === 'divided-counsel-review') {
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} finishes reviewing the Divided Counsel hand and resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      return null;
    }
    if (pending.kind === 'long-memory') {
      const cardId = choice.slice('chronicle:'.length);
      if (!pending.cardInstanceIds.includes(cardId)) return 'illegal choice resolution';
      const rowIndex = state.match.chronicleRow.findIndex((card) => card.id === cardId);
      if (rowIndex < 0) return 'illegal choice resolution';
      const [cycled] = state.match.chronicleRow.splice(rowIndex, 1);
      state.match.chronicleDeck.push(cycled);
      const refill = state.match.chronicleDeck.shift();
      if (refill) state.match.chronicleRow.splice(rowIndex, 0, refill);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} puts ${cardName(cycled.definitionId)} on the bottom of the Chronicle deck, refills its place, and resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn.`);
      return null;
    }
    if (pending.kind === 'fell-sorcery') {
      const targetUid = choice.slice('opponent:'.length);
      if (targetUid === event.actorUid || !state.match.battleParticipantUids.includes(targetUid)) {
        return 'illegal choice resolution';
      }
      state.match.battleBonusStrength[targetUid] = (state.match.battleBonusStrength[targetUid] ?? 0) - pending.strengthLoss;
      state.match.pendingChoice = null;
      state.match.consecutiveBattlePasses = 0;
      state.match.activity.push(`${actor.displayName} chooses ${state.players.find((candidate) => candidate.uid === targetUid)?.displayName ?? 'an opponent'} to lose ${pending.strengthLoss} Strength to Fell Sorcery.`);
      openQueuedWitchKingBlackBreath(state.match);
      return null;
    }
    if (pending.kind === 'commander-black-breath') {
      const targetUid = choice.slice('opponent:'.length);
      if (targetUid === event.actorUid || !state.match.battleParticipantUids.includes(targetUid)) {
        return 'illegal choice resolution';
      }
      state.match.battleBonusStrength[targetUid] = (state.match.battleBonusStrength[targetUid] ?? 0) - pending.strengthLoss;
      state.match.pendingChoice = null;
      state.match.consecutiveBattlePasses = 0;
      state.match.activity.push(`${actor.displayName} chooses ${state.players.find((candidate) => candidate.uid === targetUid)?.displayName ?? 'an opponent'} to lose ${pending.strengthLoss} Strength to Black Breath.`);
      return null;
    }
    if (pending.kind === 'fangorn-moot') {
      if (choice === 'take-ent-draught') {
        if (player.entDraught) return 'illegal choice resolution';
        player.entDraught = true;
        const recruited = recruitCompanies(state.match, player, 1);
        player.resources.provisions += 1;
        state.match.activity.push(`${actor.displayName} takes Ent-draught, recruits ${recruited} Company, and gains 1 Provision at Fangorn Moot.`);
      } else {
        player.resources.provisions += 1;
        if (choice === 'gain-provision-breach-dam') {
          if (state.match.damBreached) return 'illegal choice resolution';
          state.match.damBreached = true;
          state.match.activity.push(`${actor.displayName} gains 1 Provision and breaches the Dam at Fangorn Moot.`);
        } else state.match.activity.push(`${actor.displayName} gains 1 Provision and leaves the Dam intact at Fangorn Moot.`);
      }
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'deep-fangorn') {
      if (choice === 'summon-2-ents') {
        if (!canSummonEnts(state.match, player)) return 'illegal choice resolution';
        state.match.battleEnts[event.actorUid] = (state.match.battleEnts[event.actorUid] ?? 0) + 2;
        state.match.activity.push(`${actor.displayName} summons 2 Ents from Deep Fangorn directly into the active Battle.`);
      } else {
        player.resources.mithril += 4;
        state.match.activity.push(`${actor.displayName} gains 4 Mithril in Deep Fangorn.`);
      }
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'entwash') {
      if (choice === 'summon-1-ent') {
        if (!canSummonEnts(state.match, player)) return 'illegal choice resolution';
        state.match.battleEnts[event.actorUid] = (state.match.battleEnts[event.actorUid] ?? 0) + 1;
        state.match.activity.push(`${actor.displayName} summons 1 Ent from Entwash directly into the active Battle.`);
      } else {
        player.resources.mithril += 2;
        state.match.activity.push(`${actor.displayName} gains 2 Mithril at Entwash.`);
      }
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'osgiliath') {
      const paid = choice === 'pay-1-mithril';
      if (paid) {
        if (player.resources.mithril < 1) return 'illegal choice resolution';
        player.resources.mithril -= 1;
      }
      player.resources.gold += paid ? 4 : 2;
      state.match.activity.push(`${actor.displayName} ${paid ? 'pays 1 Mithril and gains 4 Gold' : 'pays no Mithril and gains 2 Gold'} at Osgiliath.`);
      if (pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
      } else {
        state.match.pendingChoice = null;
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'great-forge') {
      const faction = choice.slice('standing-'.length) as 'shadow' | 'dwarven' | 'elven' | 'wild';
      gainStanding(
        state.match,
        player,
        faction,
        pending.followupSeekAlliesCardId,
        pending.followupPlaceScout
      );
      state.match.activity.push(`${actor.displayName} gains 1 ${faction[0].toUpperCase()}${faction.slice(1)} standing at Great Forge.`);
      if (!state.match.pendingChoice && pending.followupSeekAlliesCardId) {
        state.match.pendingChoice = {
          kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
          options: ['trash-self', 'keep-card']
        };
      } else if (!state.match.pendingChoice && pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
      } else if (!state.match.pendingChoice) {
        finishAgentAction(state.match, event.actorUid);
      }
      return null;
    }
    if (pending.kind === 'battle-standing') {
      const faction = choice.slice('standing-'.length) as 'shadow' | 'dwarven' | 'elven' | 'wild';
      state.match.pendingChoice = null;
      gainStanding(state.match, player, faction, null, false, true);
      state.match.activity.push(`${actor.displayName} gains 1 ${faction[0].toUpperCase()}${faction.slice(1)} standing from a Battle reward.`);
      if (!state.match.pendingChoice) continueBattleRewardChoicesOrRecall(state.match);
      return null;
    }
    if (pending.kind === 'battle-fate-keep') {
      const keptId = choice.slice('keep:'.length);
      if (!pending.drawnFateIds.includes(keptId)) return 'illegal choice resolution';
      const discardedId = pending.drawnFateIds.find((id) => id !== keptId);
      const discardedIndex = player.fateHand.findIndex((fate) => fate.id === discardedId);
      if (discardedIndex < 0) return 'illegal choice resolution';
      const [discarded] = player.fateHand.splice(discardedIndex, 1);
      state.match.fateDiscard.push(discarded);
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} privately keeps one of two Fate cards from a Battle reward and discards the other.`);
      continueBattleRewardChoicesOrRecall(state.match);
      return null;
    }
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
      } else if (pending.followupPlaceScout) {
        if (!openScoutPlacement(state.match, player.uid, { followupSeekAlliesCardId: null })) {
          finishAgentAction(state.match, event.actorUid);
        }
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
        state.match.pendingChoice = null;
        const request: QueuedFateDraw = {
          actorUid: event.actorUid,
          count: 1,
          source: 'Secret Bargain',
          resume: { kind: 'secret-bargain-recall', actorName: actor.displayName }
        };
        const drawn = drawFateOrOpenForesight(state.match, request.actorUid, request.count, request.source, request.resume);
        if (!drawn) return null;
        state.match.activity.push(`${actor.displayName} cycles one Fate card through the public discard.`);
      } else {
        state.match.pendingChoice = null;
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
        player.scoutsRecalledThisRound += 1;
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
      beginAgentResolution(state, actor.displayName, event.actorUid, card, space, pending.ignoredResourceCost);
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
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} keeps one of the two Fate cards granted by Elven favor and discards the other.`);
      continueAfterElvenFavor(
        state.match,
        event.actorUid,
        pending.followupSeekAlliesCardId,
        pending.followupPlaceScout,
        pending.resumeBattleStanding ?? false
      );
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
      (!pending.resumeBattleReward && currentPlayerUid(state) !== event.actorUid) ||
      typeof postId !== 'string' ||
      !OBSERVATION_POSTS.some((post) => post.id === postId) ||
      (pending.allowedPostIds !== null && !pending.allowedPostIds.includes(postId))
    ) return 'illegal Scout placement';
    const player = state.match.players[event.actorUid];
    if (player.scouts.supply < 1) {
      if (typeof recallPostId !== 'string' || state.match.boardScouts[recallPostId] !== event.actorUid) {
        return 'illegal Scout placement';
      }
      delete state.match.boardScouts[recallPostId];
      player.scouts.supply += 1;
      player.scoutsRecalledThisRound += 1;
    } else if (recallPostId !== undefined) {
      return 'illegal Scout placement';
    }
    if (state.match.boardScouts[postId]) return 'illegal Scout placement';
    player.scouts.supply -= 1;
    state.match.boardScouts[postId] = event.actorUid;
    state.match.activity.push(`${actor.displayName} places a Scout at ${OBSERVATION_POSTS.find((post) => post.id === postId)!.name}.`);
    if (pending.commanderRingResumeSpace !== undefined) {
      resolveGaladrielRingDraw(state.match, event.actorUid);
      state.match.pendingChoice = null;
      if (pending.commanderRingResumeSpace) {
        const card = player.journey.find((candidate) => candidate.id === pending.commanderRingResumeSpace!.cardInstanceId);
        const space = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === pending.commanderRingResumeSpace!.spaceId);
        if (!card || card.definitionId !== 'token-of-command' || !space) return 'illegal Scout placement';
        resolveAgentEffects(
          state.match,
          actor.displayName,
          event.actorUid,
          card,
          space,
          pending.commanderRingResumeSpace.ignoredResourceCost
        );
      }
      if (!state.match.pendingChoice) finishAgentAction(state.match, event.actorUid);
      return null;
    }
    if (state.match.queuedMessengerMothRecall?.actorUid === event.actorUid) {
      state.match.queuedMessengerMothRecall = null;
      const postIds = OBSERVATION_POSTS
        .filter((post) => post.id !== postId && state.match!.boardScouts[post.id] === event.actorUid)
        .map((post) => post.id);
      if (postIds.length > 0) {
        state.match.pendingChoice = {
          kind: 'chronicle-messenger-moth',
          actorUid: event.actorUid,
          placedPostId: postId,
          postIds,
          options: [...postIds.map((id) => `recall-moth:${id}`), 'decline-moth-recall']
        };
        state.match.activity.push(`${actor.displayName} may recall a different Scout with Messenger Moth to draw 1 card.`);
        return null;
      }
    }
    if (pending.followupSeekAlliesCardId) {
      state.match.pendingChoice = {
        kind: 'seek-allies', actorUid: player.uid, cardInstanceId: pending.followupSeekAlliesCardId,
        options: ['trash-self', 'keep-card']
      };
    } else if (pending.resumeBattleReward) {
      state.match.pendingChoice = null;
      continueBattleRewardChoicesOrRecall(state.match);
    } else if (pending.resumeTurn) {
      state.match.pendingChoice = null;
      state.match.activity.push(`${actor.displayName} resumes their ${pending.resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn after resolving Secret Ways.`);
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
    if (player.scoutsRecalledThisRound > 0) {
      player.revealInfluence += player.muster.filter((card) => card.definitionId === 'whispered-rumor').length;
    }
    if (player.councilSeat) player.revealInfluence += 2;
    if (state.match.boardAgents['hall-fire']?.some((occupation) => occupation.uid === event.actorUid)) {
      player.revealInfluence += 1;
    }
    player.revealedSwords = player.muster.reduce((total, card) =>
      total + (MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster.swords ?? 0), 0);
    const palantirFateDraws = player.muster.filter((card) => card.definitionId === 'palantir-glimpse').length;
    state.match.turnMode = 'reveal';
    state.match.activity.push(`${actor.displayName} Reveals ${player.muster.length} cards for ${player.revealInfluence} Influence and ${player.revealedSwords} swords.`);
    if (palantirFateDraws > 0) {
      const request: QueuedFateDraw = {
        actorUid: event.actorUid,
        count: palantirFateDraws,
        source: 'Palantír Glimpse',
        resume: { kind: 'reveal-muster', actorName: actor.displayName, palantirFateDraws }
      };
      const drawn = drawFateOrOpenForesight(state.match, request.actorUid, request.count, request.source, request.resume);
      if (!drawn) return null;
      state.match.activity.push(`${actor.displayName} privately draws ${drawn.length} Fate with ${palantirFateDraws} ${palantirFateDraws === 1 ? 'Palantír Glimpse' : 'Palantír Glimpses'}.`);
    }
    openRevealMusterChoices(state.match, event.actorUid);
    return null;
  }

  if (event.type === 'card/acquired') {
    const definitionId = event.payload.definitionId;
    const cardInstanceId = event.payload.cardInstanceId;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'reveal' ||
      state.match.pendingChoice ||
      currentPlayerUid(state) !== event.actorUid ||
      typeof definitionId !== 'string' ||
      (cardInstanceId !== undefined && typeof cardInstanceId !== 'string')
    ) return 'illegal acquisition';
    const player = state.match.players[event.actorUid];
    const chronicleIndex = typeof cardInstanceId === 'string'
      ? state.match.chronicleRow.findIndex((card) => card.id === cardInstanceId)
      : -1;
    if (chronicleIndex >= 0) {
      const instance = state.match.chronicleRow[chronicleIndex];
      const definition = CHRONICLE_CARD_DEFINITIONS.find((card) => card.id === instance.definitionId);
      if (!definition || definition.id !== definitionId || definition.cost > player.revealInfluence) {
        return 'illegal acquisition';
      }
      state.match.chronicleRow.splice(chronicleIndex, 1);
      player.revealInfluence -= definition.cost;
      player.discardPile.push(instance);
      const refill = state.match.chronicleDeck.shift();
      if (refill) state.match.chronicleRow.splice(chronicleIndex, 0, refill);
      state.match.activity.push(`${actor.displayName} acquires ${definition.name} from the Chronicle Row for ${definition.cost} Influence${refill ? ' and refills its place' : ''}.`);
      resolveGandalfHighCostAcquisition(state.match, player, definition.cost);
      return null;
    }
    const definition = RESERVE_CARD_DEFINITIONS.find((card) => card.id === definitionId);
    if (!definition || definition.cost > player.revealInfluence || state.match.reserveSupply[definition.id] < 1) {
      return 'illegal acquisition';
    }
    const copy = definition.copies - state.match.reserveSupply[definition.id] + 1;
    state.match.reserveSupply[definition.id] -= 1;
    player.revealInfluence -= definition.cost;
    player.renown += definition.onAcquireRenown;
    player.discardPile.push({ id: `match-${state.match.epoch}:reserve:${definition.id}:${copy}`, definitionId: definition.id });
    state.match.activity.push(`${actor.displayName} acquires ${definition.name} for ${definition.cost} Influence.`);
    resolveGandalfHighCostAcquisition(state.match, player, definition.cost);
    return null;
  }

  if (event.type === 'reveal/finished') {
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'reveal' ||
      state.match.pendingChoice ||
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
      !state.match.battleParticipantUids.includes(event.actorUid)
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

  if (event.type === 'endgame/passed') {
    if (
      state.phase !== 'playing' ||
      !state.match ||
      state.match.turnMode !== 'endgame' ||
      state.match.pendingChoice ||
      currentPlayerUid(state) !== event.actorUid
    ) return 'illegal Endgame pass';
    state.match.consecutiveEndgamePasses += 1;
    state.match.activity.push(`${actor.displayName} passes in Endgame.`);
    if (state.match.consecutiveEndgamePasses >= state.match.playerOrder.length) {
      finishEndgame(state.match);
      state.finishedMatches.push({
        epoch: state.match.epoch,
        seed: state.match.seed,
        ...structuredClone(state.match.finalResult!)
      });
      state.rematchReadyUids = [];
      state.phase = 'finished';
    } else {
      state.match.currentPlayerIndex = (state.match.currentPlayerIndex + 1) % state.match.playerOrder.length;
    }
    return null;
  }

  if (event.type === 'match/rematch-ready') {
    const ready = event.payload.ready;
    if (state.phase !== 'finished' || !state.match?.finalResult || typeof ready !== 'boolean') {
      return 'invalid rematch readiness';
    }
    state.rematchReadyUids = ready
      ? [...new Set([...state.rematchReadyUids, event.actorUid])]
      : state.rematchReadyUids.filter((uid) => uid !== event.actorUid);
    state.match.activity.push(`${actor.displayName} ${ready ? 'is ready' : 'is no longer ready'} for a rematch.`);
    if (state.players.every((player) => state.rematchReadyUids.includes(player.uid))) {
      const nextEpoch = state.match.epoch + 1;
      const nextSeed = `${state.match.seed}:rematch-${nextEpoch}`;
      state.match = createMatch(state, nextSeed, nextEpoch);
      state.rematchReadyUids = [];
      state.phase = 'playing';
    }
    return null;
  }

  if (event.type === 'fate/played') {
    const cardInstanceId = event.payload.cardInstanceId;
    if (
      state.phase !== 'playing' ||
      !state.match ||
      currentPlayerUid(state) !== event.actorUid ||
      typeof cardInstanceId !== 'string' ||
      state.match.pendingChoice
    ) return 'illegal Fate play';
    const player = state.match.players[event.actorUid];
    const cardIndex = player.fateHand.findIndex((card) => card.id === cardInstanceId);
    const card = player.fateHand[cardIndex];
    const definition = card && FATE_CARD_DEFINITIONS.find((candidate) => candidate.id === card.definitionId);
    if (!card || !definition) return 'illegal Fate play';
    if (definition.timing === 'Endgame') {
      if (state.match.turnMode !== 'endgame') return 'illegal Fate play';
      if (definition.effect.kind === 'pay-mithril-renown') {
        if (player.resources.mithril < definition.effect.costMithril) return 'illegal Fate play';
        player.resources.mithril -= definition.effect.costMithril;
      } else if (definition.effect.kind === 'alliance-renown') {
        const heldAlliances = Object.values(state.match.alliances).filter((uid) => uid === event.actorUid).length;
        if (heldAlliances < definition.effect.requiredAlliances) return 'illegal Fate play';
      } else if (definition.effect.kind === 'high-cost-chronicle-renown') {
        const effect = definition.effect;
        const ownedHighCost = [...player.hand, ...player.drawPile, ...player.discardPile]
          .filter((instance) => {
            const chronicle = CHRONICLE_CARD_DEFINITIONS.find((candidate) => candidate.id === instance.definitionId);
            return Boolean(chronicle && chronicle.cost >= effect.minimumCost);
          });
        if (ownedHighCost.length < effect.requiredCards) return 'illegal Fate play';
      } else return 'illegal Fate play';
      player.fateHand.splice(cardIndex, 1);
      state.match.fateDiscard.push(card);
      player.renown += definition.effect.renown;
      state.match.consecutiveEndgamePasses = 0;
      state.match.activity.push(definition.effect.kind === 'pay-mithril-renown'
        ? `${actor.displayName} plays ${definition.name}, pays ${definition.effect.costMithril} Mithril, and gains ${definition.effect.renown} Renown.`
        : definition.effect.kind === 'alliance-renown'
          ? `${actor.displayName} plays ${definition.name} while holding ${definition.effect.requiredAlliances} Alliances and gains ${definition.effect.renown} Renown.`
          : `${actor.displayName} plays ${definition.name} while owning ${definition.effect.requiredCards} Chronicle cards costing ${definition.effect.minimumCost} or more and gains ${definition.effect.renown} Renown.`);
      return null;
    }
    if (definition.timing === 'Plot') {
      if (state.match.turnMode !== 'agent' && state.match.turnMode !== 'reveal') return 'illegal Fate play';
      if (definition.effect.kind === 'cycle-chronicle') {
        const maximumCost = definition.effect.maximumCost;
        if (!state.match.chronicleRow.some((instance) => {
          const chronicle = CHRONICLE_CARD_DEFINITIONS.find((candidate) => candidate.id === instance.definitionId);
          return Boolean(chronicle && chronicle.cost <= maximumCost);
        })) return 'illegal Fate play';
      }
      player.fateHand.splice(cardIndex, 1);
      state.match.fateDiscard.push(card);
      if (definition.effect.kind === 'place-scout') {
        openScoutPlacement(state.match, event.actorUid, {
          followupSeekAlliesCardId: null,
          resumeTurn: state.match.turnMode
        });
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${state.match.turnMode === 'agent' ? 'Agent' : 'Reveal'} turn and must place 1 Scout.`);
      } else if (definition.effect.kind === 'draw-discard') {
        const resumeTurn = state.match.turnMode;
        const drawn = drawOneCard(state.match, event.actorUid, definition.name);
        const cardInstanceIds = player.hand.map((candidate) => candidate.id);
        if (cardInstanceIds.length > 0) {
          state.match.pendingChoice = {
            kind: 'plot-discard',
            actorUid: event.actorUid,
            cardInstanceIds,
            resumeTurn,
            options: cardInstanceIds.map((id) => `discard:${id}`)
          };
        }
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn, draws ${drawn ? '1 card' : 'no card'}, and must discard 1 card.`);
      } else if (definition.effect.kind === 'choose-resources') {
        const options: ('gain-2-gold' | 'pay-2-gold')[] = ['gain-2-gold'];
        if (player.resources.gold >= definition.effect.payGold) options.push('pay-2-gold');
        state.match.pendingChoice = {
          kind: 'gifts-tokens',
          actorUid: event.actorUid,
          resumeTurn: state.match.turnMode,
          options
        };
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${state.match.turnMode === 'agent' ? 'Agent' : 'Reveal'} turn and must choose its resource gift.`);
      } else if (definition.effect.kind === 'draw-top-deck') {
        const resumeTurn = state.match.turnMode;
        let drawn = 0;
        for (let index = 0; index < definition.effect.draw; index += 1) {
          if (drawOneCard(state.match, event.actorUid, definition.name)) drawn += 1;
        }
        const cardInstanceIds = player.hand.map((candidate) => candidate.id);
        state.match.pendingChoice = {
          kind: 'tidings-afar',
          actorUid: event.actorUid,
          cardInstanceIds,
          resumeTurn,
          options: cardInstanceIds.map((id) => `top-deck:${id}`)
        };
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${resumeTurn === 'agent' ? 'Agent' : 'Reveal'} turn, draws ${drawn} cards, and must put 1 card on top of their deck.`);
      } else if (definition.effect.kind === 'opponent-gold-or-reveal') {
        state.match.pendingChoice = {
          kind: 'divided-counsel-opponent',
          actorUid: event.actorUid,
          resumeTurn: state.match.turnMode,
          options: state.match.playerOrder.filter((uid) => uid !== event.actorUid).map((uid) => `opponent:${uid}`)
        };
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${state.match.turnMode === 'agent' ? 'Agent' : 'Reveal'} turn and must choose an opponent.`);
      } else if (definition.effect.kind === 'cycle-chronicle') {
        const maximumCost = definition.effect.maximumCost;
        const eligibleIds = state.match.chronicleRow.flatMap((instance) => {
          const chronicle = CHRONICLE_CARD_DEFINITIONS.find((candidate) => candidate.id === instance.definitionId);
          return chronicle && chronicle.cost <= maximumCost ? [instance.id] : [];
        });
        state.match.pendingChoice = {
          kind: 'long-memory',
          actorUid: event.actorUid,
          cardInstanceIds: eligibleIds,
          resumeTurn: state.match.turnMode,
          options: eligibleIds.map((id) => `chronicle:${id}`)
        };
        state.match.activity.push(`${actor.displayName} plays ${definition.name} during their ${state.match.turnMode === 'agent' ? 'Agent' : 'Reveal'} turn and must cycle one affordable Chronicle card.`);
      }
      return null;
    }
    if (state.match.turnMode !== 'battle' || !state.match.battleParticipantUids.includes(event.actorUid)) return 'illegal Fate play';
    if (definition.effect.kind === 'place-scout' || definition.effect.kind === 'draw-discard' || definition.effect.kind === 'choose-resources' || definition.effect.kind === 'draw-top-deck' || definition.effect.kind === 'opponent-gold-or-reveal' || definition.effect.kind === 'cycle-chronicle' || definition.effect.kind === 'pay-mithril-renown' || definition.effect.kind === 'alliance-renown' || definition.effect.kind === 'high-cost-chronicle-renown') return 'illegal Fate play';
    if (definition.effect.kind === 'desperate-valor' && (state.match.battleCompanies[event.actorUid] ?? 0) < definition.effect.returnCompanies) {
      return 'illegal Fate play';
    }
    if (definition.effect.kind === 'fell-sorcery') {
      if (
        player.resources.mithril < definition.effect.costMithril ||
        !state.match.battleParticipantUids.some((uid) => uid !== event.actorUid)
      ) return 'illegal Fate play';
    }
    player.fateHand.splice(cardIndex, 1);
    state.match.fateDiscard.push(card);
    const activeBattle = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === state.match!.activeBattleId);
    const fateActorStrengthBefore = battleStrength(state.match, event.actorUid);
    queueWitchKingBlackBreath(state.match, event.actorUid);
    let strengthBonus = 0;
    if (definition.effect.kind === 'fell-sorcery') {
      player.resources.mithril -= definition.effect.costMithril;
      state.match.pendingChoice = {
        kind: 'fell-sorcery',
        actorUid: event.actorUid,
        strengthLoss: definition.effect.strengthLoss,
        options: state.match.battleParticipantUids.filter((uid) => uid !== event.actorUid).map((uid) => `opponent:${uid}`)
      };
      state.match.activity.push(`${actor.displayName} plays ${definition.name}, pays ${definition.effect.costMithril} Mithril, and must choose an opposing Battle participant.`);
      return null;
    }
    if (definition.effect.kind === 'reinforcements') {
      if (player.companies.garrison >= definition.effect.deployCompanies) {
        player.companies.garrison -= definition.effect.deployCompanies;
        state.match.battleCompanies[event.actorUid] = (state.match.battleCompanies[event.actorUid] ?? 0) + definition.effect.deployCompanies;
        state.match.activity.push(`${actor.displayName} plays ${definition.name} and deploys 1 Company from garrison.`);
      } else {
        strengthBonus = definition.effect.fallbackStrength;
        state.match.activity.push(`${actor.displayName} plays ${definition.name} with no Company available and gains +${strengthBonus} Strength.`);
      }
    } else if (definition.effect.kind === 'desperate-valor') {
      state.match.battleCompanies[event.actorUid] -= definition.effect.returnCompanies;
      player.companies.supply += definition.effect.returnCompanies;
      strengthBonus = definition.effect.strength;
      state.match.activity.push(`${actor.displayName} plays ${definition.name}, returns 1 Company to supply, and gains +${strengthBonus} Strength.`);
    } else {
      strengthBonus = definition.effect.kind === 'hidden-archers'
        ? Math.min(
            definition.effect.maximum,
            Object.values(state.match.boardScouts).filter((uid) => uid === event.actorUid).length
          )
        : definition.effect.amount + (
            definition.effect.kind === 'hold-line' && activeBattle?.contestedLocationId &&
            state.match.criticalControl[activeBattle.contestedLocationId] === event.actorUid
              ? definition.effect.controlledLocationBonus
              : 0
          );
      state.match.activity.push(`${actor.displayName} plays ${definition.name} for +${strengthBonus} Strength.`);
    }
    state.match.battleBonusStrength[event.actorUid] = (state.match.battleBonusStrength[event.actorUid] ?? 0) + strengthBonus;
    resolveEowynNoLivingMan(state.match, event.actorUid, actor.displayName, fateActorStrengthBefore);
    state.match.consecutiveBattlePasses = 0;
    openQueuedWitchKingBlackBreath(state.match);
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
