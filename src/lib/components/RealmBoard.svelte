<script lang="ts">
  import { assets } from '$app/paths';
  import {
    AGENT_CARD_DEFINITIONS,
    BATTLE_CARD_DEFINITIONS,
    BOARD_LAYOUT,
    BOARD_SPACE_DEFINITIONS,
    CHRONICLE_CARD_DEFINITIONS,
    COMMANDERS,
    FATE_CARD_DEFINITIONS,
    MUSTER_CARD_DEFINITIONS,
    OBSERVATION_POSTS,
    RESERVE_CARD_DEFINITIONS,
    cardName,
    type BoardRegion
  } from '$lib/game/manifest';
  import { battleStrength, currentPlayerUid, legalAgentSpaces, type GameState } from '$lib/game/reducer';

  export let game: GameState;
  export let busy = false;
  export let localUid: string;
  export let selectedCardId = '';
  export let onSelectCard: (cardId: string) => void;
  export let onPlaceAgent: (spaceId: string, infiltrationPostId?: string) => void;
  export let onResolveChoice: (choice: string) => void;
  export let onReveal: () => void;
  export let onAcquire: (definitionId: string, cardInstanceId?: string) => void;
  export let onFinishReveal: () => void;
  export let onPlaceScout: (postId: string, recallPostId?: string) => void;
  export let onPassBattle: () => void;
  export let onPassEndgame: () => void;
  export let onPlayFate: (cardInstanceId: string) => void;
  export let onToggleRematchReady: () => void;
  let selectedScoutRecall = '';
  let selectedInfiltrationSpace = '';

  const regions: BoardRegion[] = [
    'Shadow Hosts',
    'Dwarven Holds',
    'Elven Realms',
    'Wild Kindreds',
    'White Council',
    'Strongholds',
    'Roads'
  ];
  const boardArt = `${assets}/board-layout-preview.jpg`;
  $: localMatch = game.match?.players[localUid];
  $: currentUid = currentPlayerUid(game);
  $: currentMatchPlayer = currentUid ? game.match?.players[currentUid] : undefined;
  $: legal = selectedCardId ? legalAgentSpaces(game, localUid, selectedCardId) : [];
  $: selectedDefinitionId = localMatch?.hand.find((card) => card.id === selectedCardId)?.definitionId;
  $: selectedIsImplemented = AGENT_CARD_DEFINITIONS.some((card) => card.id === selectedDefinitionId);
  $: selectedName = selectedDefinitionId ? cardName(selectedDefinitionId) : '';
  $: tokenCommander = game.match?.pendingChoice?.kind === 'token-command-order'
    ? game.match.players[game.match.pendingChoice.actorUid]?.commander
    : undefined;
  $: tokenRingName = tokenCommander === 'theoden' ? 'Ride Now' : tokenCommander === 'galadriel' ? 'Mirror Unveiled' : tokenCommander === 'gandalf' ? 'Kindle Courage' : tokenCommander === 'eowyn' ? 'Choose Deeds' : tokenCommander === 'saruman' ? 'A Fair-seeming Promise' : tokenCommander === 'witch-king' ? 'Terror Rides' : 'Andúril Aflame';

  function battleRewardText(reward: (typeof BATTLE_CARD_DEFINITIONS)[number]['rewards'][number]): string {
    return [
      reward.controlLocationId ? `control ${BOARD_LAYOUT.find((space) => space.id === reward.controlLocationId)?.name}` : '',
      reward.renown ? `${reward.renown} Renown` : '',
      reward.gold ? `${reward.gold} Gold` : '',
      reward.mithril ? `${reward.mithril} Mithril` : '',
      reward.provisions ? `${reward.provisions} Provisions` : '',
      reward.recruitCompanies ? `recruit ${reward.recruitCompanies}` : '',
      reward.drawTwoFateKeepOne ? 'draw 2 Fate, keep 1' : '',
      reward.drawFate ? `draw ${reward.drawFate} Fate` : '',
      reward.shadowStanding ? `${reward.shadowStanding} Shadow standing` : '',
      reward.dwarvenStanding ? `${reward.dwarvenStanding} Dwarven standing` : '',
      reward.wildStanding ? `${reward.wildStanding} Wild standing` : '',
      reward.chooseFactionStanding ? `${reward.chooseFactionStanding} standing with any faction` : '',
      reward.placeScouts ? `place ${reward.placeScouts} Scout` : '',
      reward.breachDam ? 'breach the Dam' : ''
    ].filter(Boolean).join(' + ');
  }

  function fateEffectText(definition: (typeof FATE_CARD_DEFINITIONS)[number]): string {
    return definition.effect.kind === 'place-scout'
      ? 'Place 1 Scout'
      : definition.effect.kind === 'draw-discard'
      ? 'Draw 1 card · discard 1 card'
      : definition.effect.kind === 'choose-resources'
      ? 'Gain 2 Gold · or pay 2 Gold for 1 Mithril + 1 Provision'
      : definition.effect.kind === 'draw-top-deck'
      ? 'Draw 2 cards · put 1 hand card on top of your deck'
      : definition.effect.kind === 'opponent-gold-or-reveal'
      ? 'Choose an opponent · they lose 1 Gold or reveal their hand'
      : definition.effect.kind === 'cycle-chronicle'
      ? 'Cycle a Chronicle card costing 3 or less · refill the Row'
      : definition.effect.kind === 'desperate-valor'
      ? 'Return 1 Battle Company · +5 Strength · zero Strength if no unit remains'
      : definition.effect.kind === 'reinforcements'
      ? 'Deploy 1 garrison Company · otherwise +2 Strength'
      : definition.effect.kind === 'hidden-archers'
      ? 'Gain Strength for Scouts on the board · maximum 3'
      : definition.effect.kind === 'fell-sorcery'
      ? 'Pay 1 Mithril · choose an opponent to lose 3 Strength'
      : definition.effect.kind === 'hold-line'
      ? '+2 Strength · +2 more while controlling the contested location'
      : definition.effect.kind === 'pay-mithril-renown'
      ? 'Pay 4 Mithril · gain 1 Renown'
      : definition.effect.kind === 'alliance-renown'
      ? 'Hold at least 2 Alliances · gain 1 Renown'
      : definition.effect.kind === 'high-cost-chronicle-renown'
      ? 'Own at least 4 Chronicle cards costing 5+ · gain 1 Renown'
      : `+${definition.effect.amount} Strength`;
  }

  function endgameFatePlayable(definition: (typeof FATE_CARD_DEFINITIONS)[number]): boolean {
    if (!localMatch || !game.match) return false;
    if (definition.effect.kind === 'pay-mithril-renown') return localMatch.resources.mithril >= definition.effect.costMithril;
    if (definition.effect.kind === 'alliance-renown') {
      return Object.values(game.match.alliances).filter((uid) => uid === localUid).length >= definition.effect.requiredAlliances;
    }
    if (definition.effect.kind === 'high-cost-chronicle-renown') {
      const effect = definition.effect;
      return [...localMatch.hand, ...localMatch.drawPile, ...localMatch.discardPile].filter((instance) => {
        const chronicle = CHRONICLE_CARD_DEFINITIONS.find((candidate) => candidate.id === instance.definitionId);
        return Boolean(chronicle && chronicle.cost >= effect.minimumCost);
      }).length >= effect.requiredCards;
    }
    return false;
  }

</script>

<section class="table" aria-labelledby="table-title">
  <header class="table-header">
    <div>
      <p class="eyebrow">{game.match && game.match.epoch > 1 ? `Match ${game.match.epoch} · ` : ''}Round {game.match?.round ?? 1} · {game.phase === 'finished' ? 'Finished match' : game.match?.turnMode === 'endgame' ? 'Endgame' : game.match?.turnMode === 'reveal' ? 'Reveal turn' : game.match?.turnMode === 'battle' ? 'Combat Fate' : 'Agent turns'}</p>
      <h1 id="table-title">The living board</h1>
      <p>
        {#if game.match?.finalResult}
          Final scoring is recorded for every Commander.
        {:else}
          {game.players.find((player) => player.uid === currentUid)?.displayName ?? 'A player'} chooses the next road.
        {/if}
      </p>
    </div>
  </header>

  <dl class="alliances" aria-label="Reviewed faction Alliances">
    <div data-testid="alliance-dwarven"><dt>Dwarven Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.dwarven)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="alliance-shadow"><dt>Shadow Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.shadow)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="alliance-elven"><dt>Elven Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.elven)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="fate-discard"><dt>Fate discard</dt><dd>{game.match?.fateDiscard.length ?? 0} cards</dd></div>
    <div data-testid="dam-status"><dt>Dam of Isengard</dt><dd>{game.match?.damBreached ? 'Breached' : 'Intact'}</dd></div>
  </dl>

  {#if game.match?.finalResult}
    <section class="endgame-area final" data-testid="final-result" aria-labelledby="final-result-title">
      <div>
        <p class="eyebrow">Final scoring · {game.match.finalResult.trigger === 'renown' ? '10 Renown reached' : 'Battle deck exhausted'}</p>
        <h2 id="final-result-title">{game.match.finalResult.winnerUids.length === 1 ? 'Victory in Middle-earth' : 'Shared victory in Middle-earth'}</h2>
        <p>{game.match.finalResult.winnerUids.map((uid) => game.players.find((player) => player.uid === uid)?.displayName).join(' and ')} {game.match.finalResult.winnerUids.length === 1 ? 'wins the game.' : 'share the game.'}</p>
      </div>
      <ol class="final-standings" aria-label="Final standings">
        {#each game.match.finalResult.standings as standing}
          <li data-testid={`final-standing-${standing.uid}`}>
            <strong>#{standing.rank} {game.players.find((player) => player.uid === standing.uid)?.displayName}</strong>
            <span>{standing.renown} Renown · {standing.mithril} Mithril · {standing.gold} Gold · {standing.provisions} Provisions · {standing.totalStanding} standing</span>
          </li>
        {/each}
      </ol>
    </section>
  {:else if game.match?.turnMode === 'endgame'}
    <section class="endgame-area" data-testid="endgame-window" aria-labelledby="endgame-title">
      <div>
        <p class="eyebrow">Final scoring window · {game.match.endgameTrigger === 'renown' ? '10 Renown reached' : 'Battle deck exhausted'}</p>
        <h2 id="endgame-title">The final reckoning</h2>
        <p>{game.players.find((player) => player.uid === currentUid)?.displayName} may resolve Endgame Fate or pass. Scoring begins after every Commander passes consecutively.</p>
      </div>
      <div class="battle-actions">
        {#each localMatch?.fateHand ?? [] as fate}
          {@const fateDefinition = FATE_CARD_DEFINITIONS.find((definition) => definition.id === fate.definitionId)}
          {#if fateDefinition?.timing === 'Endgame'}
            <button type="button" data-testid={`play-fate-${fate.id}`} disabled={currentUid !== localUid || busy || !endgameFatePlayable(fateDefinition)} onclick={() => onPlayFate(fate.id)}>
              Play {fateDefinition.name} · {fateEffectText(fateDefinition)}
            </button>
          {/if}
        {/each}
        <button type="button" data-testid="pass-endgame" disabled={currentUid !== localUid || busy} onclick={onPassEndgame}>Pass Endgame</button>
      </div>
    </section>
  {/if}

  {#if game.phase === 'finished'}
    <section class="rematch-panel" data-testid="rematch-panel" aria-labelledby="rematch-title">
      <div>
        <p class="eyebrow">Same fellowship · fresh campaign</p>
        <h2 id="rematch-title">Return to Middle-earth?</h2>
        <p>The next match begins automatically with a new deterministic seed after every Commander is ready.</p>
      </div>
      <ul aria-label="Rematch readiness">
        {#each game.players as player}
          <li data-testid={`rematch-ready-${player.uid}`}><strong>{player.displayName}</strong><span>{game.rematchReadyUids.includes(player.uid) ? 'Ready' : 'Deciding'}</span></li>
        {/each}
      </ul>
      <button type="button" data-testid="ready-rematch" disabled={busy} onclick={onToggleRematchReady}>
        {game.rematchReadyUids.includes(localUid) ? 'Withdraw rematch readiness' : 'Ready for rematch'}
      </button>
    </section>
  {/if}

  {#if game.finishedMatches.length > 0}
    <section class="match-history" data-testid="match-history" aria-labelledby="match-history-title">
      <p class="eyebrow">Immutable room record</p>
      <h2 id="match-history-title">Finished matches</h2>
      <ol>
        {#each game.finishedMatches as finished}
          <li>
            <strong>Match {finished.epoch} · {finished.winnerUids.map((uid) => game.players.find((player) => player.uid === uid)?.displayName).join(' and ')} {finished.winnerUids.length === 1 ? 'won' : 'shared victory'}</strong>
            <span>Seed {finished.seed} · {finished.trigger === 'renown' ? '10 Renown' : 'Battle deck exhausted'}</span>
            <span>{finished.standings.map((standing) => `#${standing.rank} ${game.players.find((player) => player.uid === standing.uid)?.displayName}: ${standing.renown} Renown, ${standing.mithril} Mithril, ${standing.gold} Gold, ${standing.provisions} Provisions, ${standing.totalStanding} standing`).join(' · ')}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  {#if (game.match?.turnMode === 'agent' || game.match?.turnMode === 'reveal') && currentUid === localUid && !game.match.pendingChoice}
    {@const plotFate = (localMatch?.fateHand ?? []).flatMap((fate) => {
      const definition = FATE_CARD_DEFINITIONS.find((candidate) => candidate.id === fate.definitionId);
      return definition?.timing === 'Plot' ? [{ fate, definition }] : [];
    })}
    {#if plotFate.length}
      <section class="battle-actions" data-testid="plot-fate-actions" aria-label="Plot Fate actions">
        {#each plotFate as playable}
          <button type="button" data-testid={`play-fate-${playable.fate.id}`} disabled={busy} onclick={() => onPlayFate(playable.fate.id)}>
            Play {playable.definition.name} · {fateEffectText(playable.definition)}
          </button>
        {/each}
      </section>
    {/if}
  {/if}

  {#if game.match?.activeBattleId}
    {@const activeBattle = BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === game.match?.activeBattleId)!}
    <section class="battle-area" data-testid="active-battle" aria-labelledby="battle-title">
      <div>
        <p class="eyebrow">Active Battle · Age {activeBattle.age} · {activeBattle.standard} Standard</p>
        <h2 id="battle-title">{activeBattle.name}</h2>
        <p>First: {battleRewardText(activeBattle.rewards[0])} · Second: {battleRewardText(activeBattle.rewards[1])} · Third: {battleRewardText(activeBattle.rewards[2])}</p>
        {#if activeBattle.contestedLocationId}<p><strong>Contested:</strong> {BOARD_LAYOUT.find((space) => space.id === activeBattle.contestedLocationId)?.name}</p>{/if}
      </div>
      <div class="battle-forces">
        {#each game.players as player}
          <article data-testid={`battle-force-${player.uid}`}>
            <strong>{player.displayName}</strong>
            <span>{game.match.battleCompanies[player.uid] ?? 0} Companies · {game.match.battleEnts[player.uid] ?? 0} Ents · {game.match.players[player.uid].revealedSwords} swords</span>
            <b>{battleStrength(game.match, player.uid)} Strength</b>
            {#if game.match.players[player.uid].commander === 'eowyn' && game.match.turnMode === 'battle'}
              <small>No Living Man · {game.match.eowynNoLivingManUsed ? 'spent this Battle' : 'ready'}</small>
            {/if}
            {#if game.match.players[player.uid].commander === 'witch-king' && game.match.turnMode === 'battle'}
              <small>Black Breath · {game.match.witchKingBlackBreathUsed ? 'spent this Battle' : 'ready'}</small>
            {/if}
          </article>
        {/each}
      </div>
      {#if game.match.turnMode === 'battle'}
        <div class="battle-actions">
          {#each localMatch?.fateHand ?? [] as fate}
            {@const fateDefinition = FATE_CARD_DEFINITIONS.find((definition) => definition.id === fate.definitionId)}
            {#if fateDefinition?.timing === 'Combat'}
              <button type="button" data-testid={`play-fate-${fate.id}`} disabled={currentUid !== localUid || busy} onclick={() => onPlayFate(fate.id)}>
                Play {fateDefinition.name} · {fateEffectText(fateDefinition)}
              </button>
            {/if}
          {/each}
          <button type="button" data-testid="pass-battle" disabled={currentUid !== localUid || busy} onclick={onPassBattle}>Pass Combat Fate</button>
        </div>
      {/if}
    </section>
  {/if}

  {#if (game.match?.turnMode === 'battle' && BATTLE_CARD_DEFINITIONS.find((battle) => battle.id === game.match?.activeBattleId)?.contestedLocationId) || Object.values(game.match?.criticalControl ?? {}).some(Boolean)}
    <dl class="critical-control" aria-label="Critical location control">
      {#each ['minas-tirith', 'osgiliath', 'edoras'] as locationId}
        <div data-testid={`control-${locationId}`}>
          <dt>{BOARD_LAYOUT.find((space) => space.id === locationId)?.name}</dt>
          <dd>{game.players.find((player) => player.uid === game.match?.criticalControl[locationId as keyof typeof game.match.criticalControl])?.displayName ?? 'Uncontrolled'}</dd>
        </div>
      {/each}
    </dl>
  {/if}

  <div class="game-grid">
    <aside class="players" aria-label="Players">
      {#each game.players as player}
        {@const matchPlayer = game.match?.players[player.uid]}
        <article class:current={player.uid === currentUid} class:local={player.uid === localUid}>
          <strong>{player.displayName}</strong>
          <span>{COMMANDERS.find((commander) => commander.id === player.commander)?.name ?? 'No Commander'}</span>
          <dl>
            <div><dt>Hand</dt><dd>{matchPlayer?.hand.length ?? 0}</dd></div>
            <div><dt>Agents</dt><dd>{matchPlayer?.availableAgents ?? 0}</dd></div>
            <div><dt>Provision</dt><dd>{matchPlayer?.resources.provisions ?? 0}</dd></div>
            <div><dt>Dwarven</dt><dd>{matchPlayer?.standing.dwarven ?? 0}</dd></div>
            <div><dt>Gold</dt><dd>{matchPlayer?.resources.gold ?? 0}</dd></div>
            <div><dt>Mithril</dt><dd>{matchPlayer?.resources.mithril ?? 0}</dd></div>
            <div><dt>Shadow</dt><dd>{matchPlayer?.standing.shadow ?? 0}</dd></div>
            <div><dt>Elven</dt><dd>{matchPlayer?.standing.elven ?? 0}</dd></div>
            <div><dt>Wild</dt><dd>{matchPlayer?.standing.wild ?? 0}</dd></div>
            <div><dt>Garrison</dt><dd>{matchPlayer?.companies.garrison ?? 0}</dd></div>
            <div><dt>Supply</dt><dd>{matchPlayer?.companies.supply ?? 0}</dd></div>
            <div><dt>Renown</dt><dd>{matchPlayer?.renown ?? 0}</dd></div>
            {#if matchPlayer?.wonBattleIds.length}
              <div data-testid={`battle-trophies-${player.uid}`}><dt>Standards</dt><dd>{matchPlayer.wonBattleIds.length - matchPlayer.pairedBattleIds.length} face up · {matchPlayer.pairedBattleIds.length / 2} paired</dd></div>
            {/if}
            <div><dt>Discard</dt><dd>{matchPlayer?.discardPile.length ?? 0}</dd></div>
            <div><dt>Trash</dt><dd>{matchPlayer?.trashPile.length ?? 0}</dd></div>
            <div><dt>Scouts</dt><dd>{matchPlayer?.scouts.supply ?? 0} supply</dd></div>
            <div><dt>Fate</dt><dd>{matchPlayer?.fateHand.length ?? 0}</dd></div>
            <div><dt>Ent-draught</dt><dd>{matchPlayer?.entDraught ? 'Ready' : '—'}</dd></div>
            {#if matchPlayer?.commander === 'treebeard'}
              <div><dt>Roused</dt><dd>{matchPlayer.treebeardEntBonusUsed ? 'Spent' : 'Ready'}</dd></div>
            {/if}
            <div><dt>Council</dt><dd>{matchPlayer?.councilSeat ? 'Seated' : '—'}</dd></div>
            <div><dt>Captain</dt><dd>{matchPlayer?.captainUnlocked ? 'Appointed' : matchPlayer?.captainAgentPending ? 'Arriving next turn' : '—'}</dd></div>
          </dl>
          {#if player.uid === localUid}<small>Your seat · private hand below</small>{/if}
          {#if matchPlayer?.revealedThisRound}<small>Reveal complete · waiting for Recall</small>{/if}
        </article>
      {/each}
    </aside>

    <div class="board-wrap">
      <div class="board-art" style={`--board-art: url('${boardArt}')`} aria-hidden="true"></div>
      <div class="board" aria-label="Middle-earth board">
        {#each regions as region}
          <section class="region" aria-labelledby={`region-${region.replaceAll(' ', '-').toLowerCase()}`}>
            <h2 id={`region-${region.replaceAll(' ', '-').toLowerCase()}`}>{region}</h2>
            <div class="spaces">
              {#each BOARD_LAYOUT.filter((space) => space.region === region) as space}
                {@const implemented = BOARD_SPACE_DEFINITIONS.some((definition) => definition.id === space.id)}
                {@const definition = BOARD_SPACE_DEFINITIONS.find((candidate) => candidate.id === space.id)}
                {@const occupants = (game.match?.boardAgents[space.id] ?? []).map((occupation) => game.players.find((player) => player.uid === occupation.uid)?.displayName).filter(Boolean)}
                {@const infiltrationPosts = OBSERVATION_POSTS.filter((post) => post.connectedSpaceIds.includes(space.id) && game.match?.boardScouts[post.id] === localUid)}
                <button
                  type="button"
                  class:implemented
                  class:occupied={occupants.length > 0}
                  disabled={!legal.includes(space.id)}
                  aria-label={`${space.name}${occupants.length ? `, occupied by ${occupants.join(' and ')}` : implemented ? ', implemented' : ', unavailable in current tracer'}`}
                  data-testid={`space-${space.id}`}
                  onclick={() => {
                    if (occupants.length && infiltrationPosts.length) selectedInfiltrationSpace = space.id;
                    else void onPlaceAgent(space.id);
                  }}
                >
                  <strong>{space.name}</strong>
                  {#if occupants.length}
                    <span>Agent · {occupants.join(' · ')}</span>
                    {#if definition?.effect.kind === 'edoras' || definition?.effect.kind === 'deep-fangorn' || definition?.effect.kind === 'entwash'}
                      <span>{game.match?.richesMithril[space.id as 'edoras' | 'deep-fangorn' | 'entwash'] ?? 0} Riches</span>
                    {/if}
                  {:else if implemented}
                    <span>
                      {definition?.effect.kind === 'dwarven-caravans'
                        ? 'Dwarven · +1 standing · +1 Provision'
                        : definition?.effect.kind === 'deep-roads'
                          ? 'Battle · pay 5 Mithril · Dwarven +1 · recruit 5'
                        : definition?.effect.kind === 'tribute-shadow'
                          ? 'Shadow · +1 standing · +2 Gold'
                        : definition?.effect.kind === 'pits-isengard'
                          ? 'Pay 4 Mithril · Shadow +1 · draw 1 Fate · recruit 4'
                        : definition?.effect.kind === 'hidden-paths'
                          ? 'Battle · Wild +1 · draw 1 card'
                        : definition?.effect.kind === 'ranger-mustering'
                          ? 'Battle · pay 1 Provision · Wild +1 · recruit 1 · optionally trash 1'
                          : definition?.effect.kind === 'hidden-counsel'
                            ? 'Elven · +1 standing · draw 1 Fate · gather Fate from opponents holding 4+'
                            : definition?.effect.kind === 'mirror-galadriel'
                              ? 'Pay 1 Mithril · Elven +1 · draw 1 card · place 1 Scout'
                              : definition?.effect.kind === 'secret-bargain'
                                ? 'Need Shadow 2 · pay 3 Gold · cycle Fate · recall another Agent · draw 1 card'
                              : definition?.effect.kind === 'captain-host'
                                ? 'Pay 8 Gold for the first Captain, then 6 · third Agent next turn · once per game'
                          : definition?.effect.kind === 'take-war-effort'
                          ? 'Draw 1 card · +2 Gold'
                            : definition?.effect.kind === 'muster-free-peoples'
                              ? 'Recruit 2 · optionally pay 2 Gold for 1 Provision'
                              : definition?.effect.kind === 'hall-of-fire'
                                ? 'Draw 1 Fate · +1 Reveal Influence this round while your Agent remains'
                                : definition?.effect.kind === 'minas-tirith'
                                  ? 'Battle · recruit 1 · draw 1 card · controller gains 1 Gold'
                                  : definition?.effect.kind === 'archives-rivendell'
                                    ? 'Battle · pay 2 Provisions · recruit 2 · draw 2 cards'
                                  : definition?.effect.kind === 'osgiliath'
                                    ? 'Battle · pay 0/1 Mithril · gain 2/4 Gold · controller gains 1 Gold'
                                  : definition?.effect.kind === 'great-forge'
                                    ? 'Need Dwarven 2 · pay 3 Mithril · gain 5 Gold · +1 any faction'
                                  : definition?.effect.kind === 'fangorn-moot'
                                    ? `Battle · need Wild 2 · take Ent-draught or gain 1 Provision and ${game.match?.damBreached ? 'leave the Dam breached' : 'breach the Dam'}`
                                  : definition?.effect.kind === 'deep-fangorn'
                                    ? `Battle · pay 3 Provisions · take ${game.match?.richesMithril['deep-fangorn'] ?? 0} Riches · gain 4 Mithril or summon 2 Ents`
                                  : definition?.effect.kind === 'entwash'
                                    ? `Battle · pay 1 Provision · take ${game.match?.richesMithril.entwash ?? 0} Riches · gain 2 Mithril or summon 1 Ent`
                                  : definition?.effect.kind === 'edoras'
                                    ? `Battle · gain 1 Mithril + ${game.match?.richesMithril.edoras ?? 0} Riches · controller gains 1 Mithril`
                                  : 'Pay 5 Gold · gain a permanent +2 Reveal Influence; repeat for 2 Mithril, 1 Fate, recruit 3'}
                    </span>
                  {:else}
                    <span>Later tracer</span>
                  {/if}
                </button>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    </div>
  </div>

  {#if selectedInfiltrationSpace}
    {@const infiltrationSpace = BOARD_LAYOUT.find((space) => space.id === selectedInfiltrationSpace)!}
    <section class="pending-choice" data-testid="infiltration-choice" aria-labelledby="infiltration-title">
      <div>
        <p class="eyebrow">Scout infiltration</p>
        <h2 id="infiltration-title">Recall a connected Scout to enter {infiltrationSpace.name}?</h2>
        <p>The blocking Agent remains. Your matching card and recalled Scout allow another Agent to share this space.</p>
      </div>
      <div class="choice-actions">
        {#each OBSERVATION_POSTS.filter((post) => post.connectedSpaceIds.includes(selectedInfiltrationSpace) && game.match?.boardScouts[post.id] === localUid) as post}
          <button type="button" onclick={() => {
            onPlaceAgent(selectedInfiltrationSpace, post.id);
            selectedInfiltrationSpace = '';
          }}>Recall {post.name} Scout</button>
        {/each}
        <button type="button" onclick={() => selectedInfiltrationSpace = ''}>Cancel</button>
      </div>
    </section>
  {/if}

  <section class="scout-network" data-testid="scout-network" aria-labelledby="scout-title">
    <div>
      <p class="eyebrow">Observation network · 9 posts</p>
      <h2 id="scout-title">{game.match?.pendingChoice?.kind === 'place-scout' ? (selectedScoutRecall ? 'Choose the Scout’s new post.' : game.match.pendingChoice.commanderRingResumeSpace !== undefined ? 'Where will Mirror Unveiled place Galadriel’s Scout?' : game.match.pendingChoice.allowedPostIds ? 'Choose a post connected to a Battle space.' : 'Choose an empty post for the Scout.') : 'Scouts watch the roads.'}</h2>
    </div>
    <div class="posts">
      {#each OBSERVATION_POSTS as post}
        {@const scoutUid = game.match?.boardScouts[post.id]}
        {@const scoutName = game.players.find((player) => player.uid === scoutUid)?.displayName}
        {@const placing = game.match?.pendingChoice?.kind === 'place-scout' && game.match.pendingChoice.actorUid === localUid}
        {@const allowedDestination = game.match?.pendingChoice?.kind !== 'place-scout' || game.match.pendingChoice.allowedPostIds === null || game.match.pendingChoice.allowedPostIds.includes(post.id)}
        {@const mustRecall = (localMatch?.scouts.supply ?? 0) < 1}
        {@const choosingRecall = placing && mustRecall && !selectedScoutRecall}
        <button
          type="button"
          class:scouted={Boolean(scoutUid)}
          class:recalling={selectedScoutRecall === post.id}
          disabled={!placing || (choosingRecall ? scoutUid !== localUid : !allowedDestination || Boolean(scoutUid) && post.id !== selectedScoutRecall)}
          aria-pressed={selectedScoutRecall === post.id}
          data-testid={`post-${post.id}`}
          onclick={() => {
            if (choosingRecall) selectedScoutRecall = post.id;
            else {
              onPlaceScout(post.id, selectedScoutRecall || undefined);
              selectedScoutRecall = '';
            }
          }}
        >
          <strong>{post.name}</strong>
          <span>{scoutName ? `Scout · ${scoutName}` : post.connectedSpaceIds.map((id) => BOARD_LAYOUT.find((space) => space.id === id)?.name).join(' · ')}</span>
        </button>
      {/each}
    </div>
  </section>

  {#if game.match?.pendingChoice?.kind === 'fell-sorcery'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="fell-sorcery-title">
      <div>
        <p class="eyebrow">Ordered Battle choice</p>
        <h2 id="fell-sorcery-title">Whose Strength will Fell Sorcery break?</h2>
        <p>The Mithril is paid and the Fate card is public. Choose one opposing Battle participant to lose 3 Strength before continuing the same Combat Fate turn.</p>
      </div>
      <div class="choice-actions">
        {#each game.match.pendingChoice.options as option}
          {@const targetUid = option.slice('opponent:'.length)}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(option)}>Choose {game.players.find((player) => player.uid === targetUid)?.displayName} · lose 3 Strength</button>
        {/each}
      </div>
    </section>
  {/if}

  {#if game.match?.pendingChoice?.kind === 'token-command-order'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="token-order-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="token-order-title">When will {tokenRingName}?</h2>
        <p>{tokenCommander === 'theoden' ? 'Choose whether Théoden gains Provision and one additional garrison deployment before or after the board space. Deployment follows both effects.' : tokenCommander === 'galadriel' ? 'Choose whether Galadriel places a Scout and checks for two different observation posts before or after the board space.' : tokenCommander === 'gandalf' ? 'Choose whether Gandalf draws Fate or checks his relative garrison before or after the board space.' : tokenCommander === 'eowyn' ? 'Choose whether Éowyn may trash one private card from hand or discard and then draw before or after the board space.' : tokenCommander === 'saruman' ? 'Choose whether Saruman counts factions at standing 2 or more and gains up to 3 Gold before or after the board space.' : tokenCommander === 'witch-king' ? 'Choose whether the Witch-king recruits before or after the board space. At a Battle space, that Company deploys immediately and he privately draws 1 Fate before ordinary deployment.' : 'Choose whether Aragorn gains low-faction standing before or after the board space. Deployment follows both effects.'}</p>
      </div>
      <div class="choice-actions">
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('ring-first')}>Ring ability first</button>
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('space-first')}>Destination first</button>
      </div>
    </section>
  {:else if game.match?.pendingChoice?.kind === 'commander-ring-standing'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="ring-standing-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="ring-standing-title">Which low faction answers Andúril?</h2>
        <p>Choose a faction currently at 1 standing or less. Its normal standing threshold, Renown, and Alliance effects resolve at the chosen point in this Agent turn.</p>
      </div>
      <div class="choice-actions">
        {#each game.match.pendingChoice.options as option}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(option)}>Gain 1 {option.slice('standing-'.length)} standing</button>
        {/each}
      </div>
    </section>
  {:else if game.match?.pendingChoice?.kind === 'commander-ring-gandalf'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="ring-gandalf-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="ring-gandalf-title">How will Gandalf kindle courage?</h2>
        <p>Draw one private Fate card, or recruit two finite Companies only while Gandalf has fewer Companies in his garrison than every opponent.</p>
      </div>
      <div class="choice-actions">
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('gandalf-draw-fate')}>Draw 1 Fate</button>
        {#if game.match.pendingChoice.options.includes('gandalf-recruit')}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('gandalf-recruit')}>Recruit 2 Companies</button>
        {/if}
      </div>
    </section>
  {:else if game.match?.pendingChoice?.kind === 'commander-ring-eowyn'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="ring-eowyn-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="ring-eowyn-title">Which deed will Éowyn relinquish?</h2>
        <p>Optionally trash one private card from hand or discard pile. Draw exactly one card only after a card is trashed.</p>
      </div>
      <div class="choice-actions">
        {#each game.match.pendingChoice.cardInstanceIds as cardId}
          {@const card = [...(localMatch?.hand ?? []), ...(localMatch?.discardPile ?? [])].find((candidate) => candidate.id === cardId)}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(`trash-card:${cardId}`)}>Trash {card ? cardName(card.definitionId) : 'private card'}</button>
        {/each}
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('decline-trash')}>Keep every card · draw none</button>
      </div>
    </section>
  {/if}

  {#if game.match?.pendingChoice?.kind === 'commander-fate-foresight'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="foresight-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="foresight-title">Which Fate does Galadriel foresee?</h2>
        <p>Look privately at the top two Fate cards before drawing from {game.match.pendingChoice.source}. Take one; the other exact card goes to the bottom of the Fate deck.</p>
      </div>
      <div class="choice-actions">
        {#each game.match.pendingChoice.fateIds as fateId, index}
          {@const fate = game.match.fateDeck.find((candidate) => candidate.id === fateId)}
          {@const definition = FATE_CARD_DEFINITIONS.find((candidate) => candidate.id === fate?.definitionId)}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(`take-fate:${fateId}`)}>
            {game.match.pendingChoice.actorUid === localUid ? `Take ${definition?.name ?? `Fate option ${index + 1}`}` : `Private Fate option ${index + 1}`}
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if game.match?.pendingChoice?.kind === 'commander-engines-isengard'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="engines-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="engines-title">Power the Engines of Isengard?</h2>
        <p>Saruman's first effect recruiting at least two Companies this round has resolved. Pay 1 Gold to recruit one additional finite Company, or decline; this opportunity does not return until next round.</p>
      </div>
      <div class="choice-actions">
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('pay-engines')}>Pay 1 Gold · recruit 1 Company</button>
        <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice('decline-engines')}>Decline Engines</button>
      </div>
    </section>
  {/if}

  {#if game.match?.pendingChoice?.kind === 'commander-black-breath'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="black-breath-title">
      <div>
        <p class="eyebrow">Ordered Commander choice</p>
        <h2 id="black-breath-title">Who suffers the Black Breath?</h2>
        <p>The Witch-king played his first Combat Fate this Battle. Choose one opposing participant to lose {game.match.pendingChoice.strengthLoss} Strength: one, plus one for each of his Ents in this Battle.</p>
      </div>
      <div class="choice-actions">
        {#each game.match.pendingChoice.options as option}
          {@const targetUid = option.slice('opponent:'.length)}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(option)}>Afflict {game.players.find((player) => player.uid === targetUid)?.displayName ?? 'opponent'} · −{game.match.pendingChoice.strengthLoss} Strength</button>
        {/each}
      </div>
    </section>
  {/if}

  {#if game.match?.pendingChoice && game.match.pendingChoice.kind !== 'place-scout' && game.match.pendingChoice.kind !== 'fell-sorcery' && game.match.pendingChoice.kind !== 'token-command-order' && game.match.pendingChoice.kind !== 'commander-ring-standing' && game.match.pendingChoice.kind !== 'commander-ring-gandalf' && game.match.pendingChoice.kind !== 'commander-ring-eowyn' && game.match.pendingChoice.kind !== 'commander-engines-isengard' && game.match.pendingChoice.kind !== 'commander-black-breath' && game.match.pendingChoice.kind !== 'commander-fate-foresight'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="choice-title">
      <div>
        <p class="eyebrow">Ordered {game.match.pendingChoice.kind === 'critical-defense' || game.match.pendingChoice.kind === 'battle-deployment' || game.match.pendingChoice.kind === 'battle-standing' || game.match.pendingChoice.kind === 'battle-fate-keep' ? 'Battle' : game.match.pendingChoice.kind === 'plot-discard' || game.match.pendingChoice.kind === 'gifts-tokens' || game.match.pendingChoice.kind === 'tidings-afar' || game.match.pendingChoice.kind === 'long-memory' || game.match.pendingChoice.kind.startsWith('divided-counsel') ? 'Plot Fate' : game.match.pendingChoice.kind === 'chronicle-payment' || game.match.pendingChoice.kind === 'chronicle-card-choice' || game.match.pendingChoice.kind === 'chronicle-muster-scout' || game.match.pendingChoice.kind === 'chronicle-muster-fate' || game.match.pendingChoice.kind === 'chronicle-standing-loss' || game.match.pendingChoice.kind === 'chronicle-standing-gain' || game.match.pendingChoice.kind === 'chronicle-messenger-moth' || game.match.pendingChoice.kind === 'chronicle-elven-foresight' || game.match.pendingChoice.kind === 'chronicle-paths-cost' ? 'Chronicle' : game.match.pendingChoice.kind === 'fangorn-moot' ? 'Fangorn Moot' : game.match.pendingChoice.kind === 'deep-fangorn' ? 'Deep Fangorn' : game.match.pendingChoice.kind === 'entwash' ? 'Entwash' : game.match.pendingChoice.kind === 'osgiliath' ? 'Osgiliath' : game.match.pendingChoice.kind === 'great-forge' ? 'Great Forge' : game.match.pendingChoice.kind === 'muster-free-peoples' ? 'Council' : game.match.pendingChoice.kind === 'ranger-mustering-trash' ? 'Ranger' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'Scout' : game.match.pendingChoice.kind === 'elven-favor' ? 'Elven favor' : game.match.pendingChoice.kind.startsWith('secret-bargain') ? 'Secret Bargain' : 'Journey'} choice</p>
        <h2 id="choice-title">{game.match.pendingChoice.kind === 'critical-defense' ? 'Defend the contested location?' : game.match.pendingChoice.kind === 'battle-deployment' ? 'Deploy Companies to the active Battle?' : game.match.pendingChoice.kind === 'battle-standing' ? 'Which faction gains standing?' : game.match.pendingChoice.kind === 'battle-fate-keep' ? 'Keep one of the two Fate cards?' : game.match.pendingChoice.kind === 'plot-discard' ? 'Which card will you discard?' : game.match.pendingChoice.kind === 'gifts-tokens' ? 'Which gift will you take?' : game.match.pendingChoice.kind === 'tidings-afar' ? 'Which card will you put on top?' : game.match.pendingChoice.kind === 'long-memory' ? 'Which Chronicle card will you cycle?' : game.match.pendingChoice.kind === 'divided-counsel-opponent' ? 'Whose counsel will you divide?' : game.match.pendingChoice.kind === 'divided-counsel-response' ? 'Lose Gold or reveal your hand?' : game.match.pendingChoice.kind === 'divided-counsel-review' ? 'What did your opponent reveal?' : game.match.pendingChoice.kind === 'chronicle-muster-fate' ? 'Pay the Master for a Fate card?' : game.match.pendingChoice.kind === 'chronicle-paths-cost' ? 'Pay the space cost or take the Paths?' : game.match.pendingChoice.kind === 'chronicle-payment' ? `Pay for ${cardName(game.match.pendingChoice.definitionId)}?` : game.match.pendingChoice.kind === 'chronicle-card-choice' ? game.match.pendingChoice.definitionId === 'ranger-north' ? 'Which card will the Ranger discard?' : game.match.pendingChoice.definitionId === 'palantir-glimpse' ? 'Which card will you discard after the glimpse?' : `Trash a card with ${cardName(game.match.pendingChoice.definitionId)}?` : game.match.pendingChoice.kind === 'chronicle-muster-scout' ? 'Recall a Scout with Goblin Informer?' : game.match.pendingChoice.kind === 'chronicle-standing-loss' ? 'Which faction loses standing?' : game.match.pendingChoice.kind === 'chronicle-standing-gain' ? 'Which low faction gains standing?' : game.match.pendingChoice.kind === 'chronicle-messenger-moth' ? 'Recall a different Scout with Messenger Moth?' : game.match.pendingChoice.kind === 'chronicle-elven-foresight' ? 'How will Elven Foresight order your deck?' : game.match.pendingChoice.kind === 'fangorn-moot' ? 'What does the Moot decide?' : game.match.pendingChoice.kind === 'deep-fangorn' ? 'Call the Ents or take Mithril?' : game.match.pendingChoice.kind === 'entwash' ? 'Call one Ent or take Mithril?' : game.match.pendingChoice.kind === 'osgiliath' ? 'How much Mithril will cross the river?' : game.match.pendingChoice.kind === 'great-forge' ? 'Which alliance receives the forged gifts?' : game.match.pendingChoice.kind === 'muster-free-peoples' ? 'Pay 2 Gold to gain 1 Provision?' : game.match.pendingChoice.kind === 'ranger-mustering-trash' ? 'Trash a card from hand or discard?' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'Recall a Scout to gather intelligence?' : game.match.pendingChoice.kind === 'elven-favor' ? 'Keep one of the two Fate cards?' : game.match.pendingChoice.kind === 'secret-bargain-fate' ? 'Cycle one Fate card?' : game.match.pendingChoice.kind === 'secret-bargain-recall' ? 'Recall another Agent?' : 'Trash Seek Allies?'}</h2>
        <p>{game.match.pendingChoice.kind === 'critical-defense' ? 'The controller may deploy one Company directly from supply before the first Agent turn.' : game.match.pendingChoice.kind === 'battle-deployment' ? `Deploy any Companies recruited this round plus up to ${2 + game.match.pendingChoice.additionalGarrisonAllowance} existing garrison Companies${game.match.pendingChoice.additionalGarrisonSource === 'Khazad Guard' ? ' with the Khazad Guard bonus' : game.match.pendingChoice.additionalGarrisonSource === 'Ride Now' ? ' with Ride Now' : ''}; ${game.match.pendingChoice.maximum} are currently eligible.` : game.match.pendingChoice.kind === 'battle-standing' ? 'Choose one faction. Its standing, threshold favor, Alliance ownership, and Renown resolve before Recall.' : game.match.pendingChoice.kind === 'battle-fate-keep' ? 'Only the ranked player can identify the two drawn cards. The unchosen card enters the public Fate discard before Recall.' : game.match.pendingChoice.kind === 'plot-discard' ? 'The draw is private. Choose one card from your resulting hand; only its owner sees its identity.' : game.match.pendingChoice.kind === 'gifts-tokens' ? 'Gain 2 Gold, or spend 2 Gold to gain 1 Mithril and 1 Provision when affordable.' : game.match.pendingChoice.kind === 'tidings-afar' ? 'The two draws are private. Choose one card from your resulting hand; only its owner sees its identity.' : game.match.pendingChoice.kind === 'long-memory' ? 'Choose a face-up card costing 3 or less. It goes beneath the Chronicle deck before its exact Row position refills.' : game.match.pendingChoice.kind === 'divided-counsel-opponent' ? 'Choose one opponent. That player must answer before your turn can resume.' : game.match.pendingChoice.kind === 'divided-counsel-response' ? 'If you cannot or will not lose 1 Gold, reveal your current hand only to the Fate player.' : game.match.pendingChoice.kind === 'divided-counsel-review' ? 'Only the Fate player can identify the revealed cards. Finish the review to resume the interrupted turn.' : game.match.pendingChoice.kind === 'chronicle-muster-fate' ? 'The card already contributes 3 Influence. Spend 2 Gold to draw one private physical Fate card, or keep the Gold and continue the same Reveal.' : game.match.pendingChoice.kind === 'chronicle-paths-cost' ? `The Agent is placed. Pay ${game.match.pendingChoice.costAmount} ${game.match.pendingChoice.costResource}, or recall one of your public Scouts to ignore that resource cost before any destination effect resolves.` : game.match.pendingChoice.kind === 'chronicle-payment' ? game.match.pendingChoice.definitionId === 'dwarven-smith' ? 'Spend 1 Gold to gain 1 Mithril, or keep the Gold.' : game.match.pendingChoice.definitionId === 'uruk-hai-captain' ? 'Spend 1 Gold to recruit up to 3 finite Companies, or keep the Gold.' : game.match.pendingChoice.definitionId === 'palantir-glimpse' ? 'Spend 1 Mithril to draw two private cards and then discard exactly one, or keep the Mithril.' : 'The Envoy already granted 2 Gold. Spend 2 Gold to gain 1 Dwarven standing, or keep it.' : game.match.pendingChoice.kind === 'chronicle-card-choice' ? game.match.pendingChoice.definitionId === 'ranger-north' || game.match.pendingChoice.definitionId === 'palantir-glimpse' ? 'The private draw is complete. Discard exactly one eligible hand card.' : game.match.pendingChoice.definitionId === 'lore-imladris' ? 'The private draw is complete. You may trash one eligible card from your hand.' : 'The private draw is complete. You may trash one eligible card from your hand or discard pile.' : game.match.pendingChoice.kind === 'chronicle-muster-scout' ? 'Recall one public Scout for 1 additional sword, or leave every Scout in place. A first recall this round also upgrades every Revealed Whispered Rumor.' : game.match.pendingChoice.kind === 'chronicle-standing-gain' ? 'Choose only a faction currently at 1 standing or less. Its normal standing threshold and Renown resolve before this Agent turn continues.' : game.match.pendingChoice.kind === 'fangorn-moot' ? 'Take the persistent Ent-draught with one Company and one Provision, or gain one Provision and decide whether to breach the Dam.' : game.match.pendingChoice.kind === 'deep-fangorn' ? 'The three-Provision cost and accumulated Riches have resolved. Ents require Ent-draught, an active Battle, and passage through the Dam when the Battle is protected.' : game.match.pendingChoice.kind === 'entwash' ? 'The one-Provision cost and accumulated Riches have resolved. The same Ent-draught, active-Battle, and protected-location rules apply.' : game.match.pendingChoice.kind === 'muster-free-peoples' ? 'The Companies have already been recruited.' : game.match.pendingChoice.kind === 'ranger-mustering-trash' ? 'The Provision, standing, and Company have already resolved; only you can see the eligible card names.' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'The Agent is placed, but neither the board nor Journey effect has resolved yet.' : game.match.pendingChoice.kind === 'elven-favor' ? 'The two private cards are identified only to you; the unchosen card enters the public Fate discard.' : game.match.pendingChoice.kind === 'secret-bargain-fate' ? 'The cycled identity remains private; its old instance enters the public discard before a replacement is drawn.' : game.match.pendingChoice.kind === 'secret-bargain-recall' ? 'Choose one of your other occupied spaces. The recalled Agent becomes available again before the private draw.' : 'The board space has resolved.'} Resolve this choice before the turn advances.</p>
        {#if game.match.pendingChoice.kind === 'chronicle-messenger-moth'}
          <p>The new Scout is already in place and cannot be recalled here. Recall one earlier Scout to draw privately, or leave every other Scout where it is.</p>
        {:else if game.match.pendingChoice.kind === 'chronicle-elven-foresight'}
          <p>Only the acting player sees these card identities. Choose their exact top-to-bottom order before the Agent turn continues.</p>
        {/if}
      </div>
      <div class="choice-actions">
        {#if game.match.pendingChoice.kind === 'critical-defense'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('deploy-defender')}>Deploy defending Company</button>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-defender')}>Decline defense</button>
        {:else if game.match.pendingChoice.kind === 'chronicle-paths-cost'}
          {@const pluralCost = `${game.match.pendingChoice.costAmount} ${game.match.pendingChoice.costResource}${game.match.pendingChoice.costResource === 'Provision' && game.match.pendingChoice.costAmount !== 1 ? 's' : ''}`}
          {#if game.match.pendingChoice.options.includes('pay-space-cost')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-space-cost')}>Pay {pluralCost}</button>
          {/if}
          {#each game.match.pendingChoice.postIds as postId}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`recall-paths:${postId}`)}>Recall {OBSERVATION_POSTS.find((post) => post.id === postId)?.name} · ignore {pluralCost}</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'chronicle-muster-fate'}
          {#if game.match.pendingChoice.options.includes('pay-master-fate')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-master-fate')}>Pay 2 Gold · draw 1 Fate</button>
          {/if}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-master-fate')}>Keep the Gold</button>
        {:else if game.match.pendingChoice.kind === 'chronicle-card-choice'}
          {#each game.match.pendingChoice.cardInstanceIds as cardId}
            {@const card = [...(localMatch?.hand ?? []), ...(localMatch?.discardPile ?? [])].find((candidate) => candidate.id === cardId)}
            {@const discarding = game.match.pendingChoice.definitionId === 'ranger-north' || game.match.pendingChoice.definitionId === 'palantir-glimpse'}
            {@const prefix = discarding ? 'discard-card:' : 'trash-card:'}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`${prefix}${cardId}`)}>{discarding ? 'Discard' : 'Trash'} {card ? cardName(card.definitionId) : 'private card'}</button>
          {/each}
          {#if game.match.pendingChoice.options.includes('decline-trash')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-trash')}>Keep every card</button>
          {/if}
        {:else if game.match.pendingChoice.kind === 'chronicle-payment'}
          {#if game.match.pendingChoice.options.includes('pay-chronicle-cost')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-chronicle-cost')}>{game.match.pendingChoice.definitionId === 'dwarven-smith' ? 'Pay 1 Gold · gain 1 Mithril' : game.match.pendingChoice.definitionId === 'uruk-hai-captain' ? 'Pay 1 Gold · recruit 3 Companies' : game.match.pendingChoice.definitionId === 'palantir-glimpse' ? 'Pay 1 Mithril · draw 2 · discard 1' : 'Pay 2 Gold · gain Dwarven standing'}</button>
          {/if}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-chronicle-cost')}>Keep the {game.match.pendingChoice.definitionId === 'palantir-glimpse' ? 'Mithril' : 'Gold'}</button>
        {:else if game.match.pendingChoice.kind === 'chronicle-muster-scout'}
          {#each game.match.pendingChoice.postIds as postId}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`recall-scout:${postId}`)}>Recall {OBSERVATION_POSTS.find((post) => post.id === postId)?.name} · +1 sword</button>
          {/each}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-scout-recall')}>Leave Scouts in place</button>
        {:else if game.match.pendingChoice.kind === 'chronicle-messenger-moth'}
          {#each game.match.pendingChoice.postIds as postId}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`recall-moth:${postId}`)}>Recall {OBSERVATION_POSTS.find((post) => post.id === postId)?.name} · draw 1 card</button>
          {/each}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-moth-recall')}>Leave other Scouts in place</button>
        {:else if game.match.pendingChoice.kind === 'chronicle-standing-loss'}
          {#each game.match.pendingChoice.options as option}
            {@const faction = option.slice('lose-standing-'.length)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>Lose 1 {faction} standing</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'chronicle-standing-gain'}
          {#each game.match.pendingChoice.options as option}
            {@const faction = option.slice('standing-'.length)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid || busy} onclick={() => onResolveChoice(option)}>Gain 1 {faction} standing</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'chronicle-elven-foresight'}
          {#each game.match.pendingChoice.options as option, index}
            {@const ids = option.slice('order-draw:'.length).split('|')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>
              {game.match.pendingChoice.actorUid === localUid
                ? `Top → ${ids.map((id) => cardName(localMatch?.drawPile.find((card) => card.id === id)?.definitionId ?? '')).join(' → ')}`
                : `Private order ${index + 1}`}
            </button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'battle-deployment'}
          {#each game.match.pendingChoice.options as option}
            {@const amount = option.slice('deploy:'.length)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>Deploy {amount}</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'fangorn-moot'}
          {#if game.match.pendingChoice.options.includes('take-ent-draught')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('take-ent-draught')}>Take Ent-draught, recruit 1, gain 1 Provision</button>
          {/if}
          {#if game.match.pendingChoice.options.includes('gain-provision-breach-dam')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('gain-provision-breach-dam')}>Gain 1 Provision and breach the Dam</button>
          {/if}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('gain-provision-leave-dam')}>Gain 1 Provision and leave the Dam</button>
        {:else if game.match.pendingChoice.kind === 'deep-fangorn'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('gain-4-mithril')}>Gain 4 Mithril</button>
          {#if game.match.pendingChoice.options.includes('summon-2-ents')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('summon-2-ents')}>Summon 2 Ents</button>
          {/if}
        {:else if game.match.pendingChoice.kind === 'entwash'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('gain-2-mithril')}>Gain 2 Mithril</button>
          {#if game.match.pendingChoice.options.includes('summon-1-ent')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('summon-1-ent')}>Summon 1 Ent</button>
          {/if}
        {:else if game.match.pendingChoice.kind === 'osgiliath'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-0-mithril')}>Pay no Mithril · gain 2 Gold</button>
          {#if game.match.pendingChoice.options.includes('pay-1-mithril')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-1-mithril')}>Pay 1 Mithril · gain 4 Gold</button>
          {/if}
        {:else if game.match.pendingChoice.kind === 'great-forge'}
          {#each game.match.pendingChoice.options as option}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>Gain {option.slice('standing-'.length)} standing</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'battle-standing'}
          {#each game.match.pendingChoice.options as option}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>Gain {option.slice('standing-'.length)} standing</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'muster-free-peoples'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-2-gold')}>Pay 2 Gold</button>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline')}>Keep the Gold</button>
        {:else if game.match.pendingChoice.kind === 'ranger-mustering-trash'}
          {#each game.match.pendingChoice.cardInstanceIds as cardId}
            {@const card = [...(localMatch?.hand ?? []), ...(localMatch?.discardPile ?? [])].find((candidate) => candidate.id === cardId)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`trash-card:${cardId}`)}>Trash {card ? cardName(card.definitionId) : 'private card'}</button>
          {/each}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-trash')}>Keep all cards</button>
        {:else if game.match.pendingChoice.kind === 'plot-discard'}
          {#each game.match.pendingChoice.cardInstanceIds as cardId}
            {@const card = localMatch?.hand.find((candidate) => candidate.id === cardId)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`discard:${cardId}`)}>Discard {card ? cardName(card.definitionId) : 'private card'}</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'gifts-tokens'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('gain-2-gold')}>Gain 2 Gold</button>
          {#if game.match.pendingChoice.options.includes('pay-2-gold')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-2-gold')}>Pay 2 Gold · gain 1 Mithril and 1 Provision</button>
          {/if}
        {:else if game.match.pendingChoice.kind === 'tidings-afar'}
          {#each game.match.pendingChoice.cardInstanceIds as cardId}
            {@const card = localMatch?.hand.find((candidate) => candidate.id === cardId)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`top-deck:${cardId}`)}>Put {card ? cardName(card.definitionId) : 'private card'} on top</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'long-memory'}
          {#each game.match.pendingChoice.cardInstanceIds as cardId}
            {@const instance = game.match.chronicleRow.find((candidate) => candidate.id === cardId)}
            {@const chronicle = CHRONICLE_CARD_DEFINITIONS.find((candidate) => candidate.id === instance?.definitionId)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`chronicle:${cardId}`)}>Cycle {chronicle?.name ?? 'Chronicle card'} · {chronicle?.cost ?? '?'} Influence</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'divided-counsel-opponent'}
          {#each game.match.pendingChoice.options as option}
            {@const opponentUid = option.slice('opponent:'.length)}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(option)}>Choose {game.players.find((player) => player.uid === opponentUid)?.displayName}</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'divided-counsel-response'}
          {#if game.match.pendingChoice.options.includes('lose-1-gold')}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('lose-1-gold')}>Lose 1 Gold</button>
          {/if}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('reveal-hand')}>Reveal hand to Fate player</button>
        {:else if game.match.pendingChoice.kind === 'divided-counsel-review'}
          <ul data-testid="revealed-hand">
            {#each game.match.pendingChoice.cardInstanceIds as cardId}
              {@const card = game.match.players[game.match.pendingChoice.targetUid].hand.find((candidate) => candidate.id === cardId)}
              <li>{game.match.pendingChoice.actorUid === localUid && card ? cardName(card.definitionId) : 'Private card'}</li>
            {/each}
          </ul>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('finish-review')}>Finish reviewing hand</button>
        {:else if game.match.pendingChoice.kind === 'seek-allies'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('trash-self')}>Trash Seek Allies</button>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('keep-card')}>Keep Seek Allies</button>
        {:else if game.match.pendingChoice.kind === 'secret-bargain-fate'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('cycle-fate')}>Cycle 1 Fate</button>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('keep-fate')}>Keep Fate</button>
        {:else if game.match.pendingChoice.kind === 'secret-bargain-recall'}
          {#each game.match.pendingChoice.spaceIds as spaceId}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`recall:${spaceId}`)}>Recall {BOARD_LAYOUT.find((space) => space.id === spaceId)?.name} Agent</button>
          {/each}
        {:else if game.match.pendingChoice.kind === 'gather-intelligence'}
          {#each game.match.pendingChoice.postIds as postId}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`recall:${postId}`)}>Recall {OBSERVATION_POSTS.find((post) => post.id === postId)?.name} Scout and draw 1</button>
          {/each}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline-intelligence')}>Leave Scouts in place</button>
        {:else}
          {#each game.match.pendingChoice.drawnFateIds as fateId, index}
            <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice(`keep:${fateId}`)}>Keep Fate {index + 1}</button>
          {/each}
        {/if}
      </div>
    </section>
  {/if}

  {#if game.match?.turnMode === 'reveal'}
    {@const revealPlayer = game.match.players[currentUid!]}
    <section class="reveal-panel" data-testid="reveal-panel" aria-labelledby="reveal-title">
      <div>
        <p class="eyebrow">Public Muster row</p>
        <h2 id="reveal-title">{game.players.find((player) => player.uid === currentUid)?.displayName} Reveals</h2>
        <div class="muster-row">
          {#each revealPlayer.muster as card}
            {@const muster = MUSTER_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)?.muster}
            {@const chronicle = CHRONICLE_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)}
            <article><strong>{cardName(card.definitionId)}</strong><span>{chronicle?.musterText ?? `${muster?.influence ?? 0} Influence · ${muster?.swords ?? 0} swords`}</span></article>
          {/each}
        </div>
        <p class="reveal-total"><strong>{revealPlayer.revealInfluence} Influence</strong> remaining · {revealPlayer.revealedSwords} {revealPlayer.revealedSwords === 1 ? 'sword' : 'swords'}</p>
      </div>
      <div class="reserve">
        <button class="finish-reveal" type="button" disabled={currentUid !== localUid || Boolean(game.match.pendingChoice)} onclick={onFinishReveal}>Finish Reveal</button>
      </div>
    </section>
  {/if}

  {#if game.match}
    <section class="market" data-testid="chronicle-market" aria-labelledby="market-title">
      <div>
        <p class="eyebrow">Shared deck-builder market</p>
        <h2 id="market-title">Chronicle Row</h2>
        <p class="market-count">Five face-up cards · deck {game.match.chronicleDeck.length}</p>
      </div>
      <div class="chronicle-row" data-testid="chronicle-row" aria-label="Chronicle Row">
        {#each game.match.chronicleRow as instance}
          {@const card = CHRONICLE_CARD_DEFINITIONS.find((definition) => definition.id === instance.definitionId)!}
          <button
            type="button"
            data-card-instance-id={instance.id}
            disabled={game.match.turnMode !== 'reveal' || currentUid !== localUid || Boolean(game.match.pendingChoice) || (currentMatchPlayer?.revealInfluence ?? 0) < card.cost}
            onclick={() => onAcquire(card.id, instance.id)}
          >
            <strong>{card.name} · {card.cost} Influence</strong>
            <span>Agent: {card.placementIcons.join(' · ')} · {card.journeyText}</span>
            <span>Muster: {card.musterText ?? `${card.muster.influence} Influence · ${card.muster.swords} swords`}</span>
          </button>
        {/each}
      </div>
      <div class="reserve" aria-label="Reserve market">
        <p class="eyebrow">Reserve</p>
        {#each RESERVE_CARD_DEFINITIONS as card}
          <button
            type="button"
            disabled={game.match.turnMode !== 'reveal' || currentUid !== localUid || Boolean(game.match.pendingChoice) || (currentMatchPlayer?.revealInfluence ?? 0) < card.cost || game.match.reserveSupply[card.id] < 1}
            onclick={() => onAcquire(card.id)}
          >
            <strong>{card.name} · {card.cost} Influence</strong>
            <span>{game.match.reserveSupply[card.id]} remain{card.onAcquireRenown ? ` · gain ${card.onAcquireRenown} Renown` : ''}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if game.match?.turnMode !== 'endgame'}
  <section class="decision" aria-labelledby="decision-title">
    <div>
      <p class="eyebrow">Your hand</p>
      <h2 id="decision-title">
        {#if game.match?.turnMode === 'reveal'}Resolve Muster and acquisitions above.{:else if game.match?.turnMode === 'battle'}Resolve Combat Fate in the Battle area.{:else if currentUid === localUid}Choose a card, then a legal space.{:else}Waiting for the active player.{/if}
      </h2>
      {#if selectedCardId && !selectedIsImplemented}
        <p role="status">{selectedName} is part of the final deck, but its Agent feature is not active in this tracer.</p>
      {:else if selectedCardId}
        <p role="status">{selectedName} can send an Agent to the highlighted board destinations.</p>
      {/if}
      {#if currentUid === localUid && game.match?.turnMode === 'agent' && !game.match.pendingChoice}
        <button class="reveal-button" type="button" onclick={onReveal}>Reveal remaining hand</button>
      {/if}
    </div>
    <div class="hand" data-testid="private-hand">
      {#each localMatch?.hand ?? [] as card}
        {@const cardDefinition = AGENT_CARD_DEFINITIONS.find((definition) => definition.id === card.definitionId)}
        {@const implemented = Boolean(cardDefinition)}
        <button
          type="button"
          class:selected={card.id === selectedCardId}
          disabled={currentUid !== localUid || game.match?.turnMode !== 'agent' || Boolean(game.match?.pendingChoice)}
          aria-pressed={card.id === selectedCardId}
          onclick={() => onSelectCard(card.id)}
        >
          <strong>{cardName(card.definitionId)}</strong>
          <span>{cardDefinition ? `Agent: ${cardDefinition.placementIcons.join(' · ')}` : 'Agent feature arrives in a later tracer'}</span>
        </button>
      {/each}
    </div>
  </section>
  {/if}

  <section class="history" aria-labelledby="history-title">
    <h2 id="history-title">Chronicle</h2>
    <ol data-testid="activity-log">
      {#each game.match?.activity ?? [] as item}<li>{item}</li>{/each}
    </ol>
  </section>
</section>

<style>
  .table { width: min(100%, 100rem); margin: 0 auto; }
  .table-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; margin-bottom: 1rem; }
  .table-header h1 { margin: 0; font: 700 clamp(2.6rem, 7vw, 5.5rem)/.9 'Cormorant Garamond', serif; }
  .table-header p { max-width: 44rem; }
  .eyebrow { margin: 0 0 .35rem; color: #d6b66f; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .alliances { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem; }
  .endgame-area { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; margin: 0 0 1rem; padding: 1.1rem; color: #29291f; background: #efe3c4; border: 3px solid #d6b66f; border-radius: .7rem; }
  .endgame-area h2, .endgame-area p { margin: 0; }
  .endgame-area .eyebrow { margin-bottom: .35rem; color: #6d452d; }
  .endgame-area.final { grid-template-columns: minmax(15rem, .8fr) minmax(20rem, 1.2fr); }
  .rematch-panel, .match-history { margin: 0 0 1rem; padding: 1.1rem; color: #29291f; background: #efe3c4; border-radius: .7rem; }
  .rematch-panel { display: grid; grid-template-columns: minmax(16rem, 1fr) minmax(14rem, .75fr) auto; gap: 1rem; align-items: center; border: 3px solid #d6b66f; }
  .rematch-panel h2, .rematch-panel p, .match-history h2, .match-history p { margin: 0; }
  .rematch-panel .eyebrow, .match-history .eyebrow { margin-bottom: .35rem; color: #6d452d; }
  .rematch-panel ul, .match-history ol { display: grid; gap: .4rem; margin: 0; padding: 0; list-style: none; }
  .rematch-panel li { display: flex; justify-content: space-between; gap: 1rem; padding: .45rem .6rem; background: #dfd2b6; border-radius: .4rem; }
  .rematch-panel button { min-height: 48px; padding: .6rem .8rem; color: #fff; background: #6d452d; border: 0; border-radius: .4rem; font-weight: 700; cursor: pointer; }
  .match-history li { display: grid; gap: .25rem; padding: .7rem; background: #dfd2b6; border-radius: .4rem; }
  .match-history li span:last-child { font-size: .9rem; }
  .final-standings { display: grid; gap: .4rem; margin: 0; padding: 0; list-style: none; }
  .final-standings li { display: grid; grid-template-columns: minmax(9rem, .55fr) 1fr; gap: .5rem; padding: .55rem; background: #dfd2b6; border-radius: .4rem; }
  .alliances div { padding: .55rem .7rem; color: #29291f; background: #d8dfc7; border-radius: .5rem; }
  .alliances dt { font-size: .76rem; }
  .alliances dd { margin: .1rem 0 0; font-weight: 700; }
  .game-grid { display: grid; grid-template-columns: 15rem 1fr; gap: 1rem; }
  .players { display: grid; align-content: start; gap: .6rem; }
  .players article { padding: .8rem; color: #28291f; background: #e8dcc0; border: 2px solid transparent; border-radius: .6rem; }
  .players article.current { border-color: #c98a45; }
  .players article.local { box-shadow: inset 0 0 0 2px #6d8265; }
  .players article > span, .players small { display: block; color: #5d6258; }
  .players dl { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; margin: .7rem 0; }
  .players dl div { padding: .3rem; background: #f7eed8; border-radius: .3rem; }
  .players dt { font-size: .72rem; }
  .players dd { margin: 0; font-weight: 700; }
  .board-wrap { position: relative; min-width: 0; overflow: hidden; border: 1px solid #7f765e; border-radius: .8rem; }
  .board-art { position: absolute; inset: 0; background: linear-gradient(rgb(19 35 27 / 80%), rgb(19 35 27 / 88%)), var(--board-art) center/cover; }
  .board { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .65rem; padding: .8rem; }
  .region { min-width: 0; padding: .55rem; background: rgb(244 235 210 / 90%); border-radius: .55rem; }
  .region h2 { margin: 0 0 .4rem; color: #5c3f2c; font: 700 1.15rem 'Cormorant Garamond', serif; }
  .spaces { display: grid; gap: .35rem; }
  .spaces button { min-height: 54px; padding: .45rem; color: #34342a; background: #d8ccb0; border: 2px solid transparent; border-radius: .4rem; text-align: left; }
  .spaces button.implemented { background: #e9c982; border-color: #76532e; cursor: pointer; }
  .spaces button.implemented:enabled:hover, .spaces button.implemented:enabled:focus-visible { outline: 3px solid #f6efda; background: #f5d994; }
  .spaces button.occupied { color: #fff; background: #49624d; border-color: #d6b66f; }
  .spaces button:disabled { opacity: .63; cursor: not-allowed; }
  .spaces strong, .spaces span { display: block; }
  .spaces span { margin-top: .15rem; font-size: .74rem; }
  .decision, .history, .battle-area { margin-top: 1rem; padding: 1rem; color: #28291f; background: #f3e8ce; border-radius: .7rem; }
  .battle-area { display: grid; grid-template-columns: minmax(14rem, 1fr) 2fr auto; gap: 1rem; align-items: center; border: 3px solid #a84d38; background: #f0d3ad; }
  .battle-area h2, .battle-area p { margin: .2rem 0; }
  .battle-forces { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45rem; }
  .battle-forces article { display: grid; padding: .55rem; background: #f8e7ca; border-radius: .35rem; }
  .battle-forces span { font-size: .78rem; }
  .battle-actions { display: grid; gap: .4rem; }
  .critical-control { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin: .7rem 0 0; }
  .critical-control div { padding: .55rem .7rem; color: #29291f; background: #e2d6ba; border-radius: .4rem; }
  .critical-control dt { font-size: .76rem; }
  .critical-control dd { margin: .1rem 0 0; font-weight: 700; }
  .pending-choice { position: fixed; z-index: 10; left: 50%; bottom: 1rem; display: flex; width: min(calc(100% - 2rem), 60rem); justify-content: space-between; gap: 1rem; align-items: center; margin-top: 1rem; padding: 1rem; color: #28291f; background: #f2d9a6; border: 3px solid #c98a45; border-radius: .7rem; box-shadow: 0 1rem 3rem rgb(0 0 0 / 55%); transform: translateX(-50%); }
  .pending-choice h2, .pending-choice p { margin: .2rem 0; }
  .choice-actions { display: flex; gap: .5rem; }
  .scout-network { margin-top: 1rem; padding: 1rem; color: #28291f; background: #d8dfc7; border-radius: .7rem; }
  .scout-network h2 { margin: .1rem 0 .6rem; font: 700 1.8rem 'Cormorant Garamond', serif; }
  .posts { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4rem; }
  .posts button { min-height: 4.2rem; padding: .55rem; color: #29291f; background: #eef0db; border: 2px solid #73806b; border-radius: .4rem; text-align: left; }
  .posts button:disabled { opacity: .65; }
  .posts button.scouted { color: #fff; background: #49624d; }
  .posts button.recalling { outline: 4px solid #c98a45; }
  .posts strong, .posts span { display: block; }
  .posts span { margin-top: .25rem; font-size: .72rem; }
  .reveal-panel { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-top: 1rem; padding: 1rem; color: #28291f; background: #efe3c4; border: 3px solid #6d8265; border-radius: .7rem; }
  .reveal-panel h2, .reveal-panel p { margin: .2rem 0 .6rem; }
  .muster-row { display: flex; gap: .45rem; overflow-x: auto; }
  .muster-row article { min-width: 9rem; padding: .65rem; background: #dfd1b2; border: 1px solid #a58c61; border-radius: .4rem; }
  .muster-row strong, .muster-row span, .reserve strong, .reserve span { display: block; }
  .muster-row span, .reserve span { margin-top: .35rem; font-size: .8rem; }
  .reveal-total { padding-top: .5rem; }
  .reserve { display: grid; gap: .45rem; }
  .market { display: grid; grid-template-columns: minmax(10rem, .65fr) minmax(0, 3fr) minmax(10rem, .8fr); gap: .8rem; margin-top: 1rem; padding: 1rem; color: #28291f; background: #e8d8b6; border: 2px solid #8a6d43; border-radius: .7rem; }
  .market h2, .market p { margin: .15rem 0 .45rem; }
  .chronicle-row { display: grid; grid-template-columns: repeat(5, minmax(8rem, 1fr)); gap: .45rem; overflow-x: auto; }
  .market-count { font-size: .85rem; font-weight: 700; }
  .market button, .reserve button, .reveal-button, .choice-actions button { min-height: 48px; padding: .6rem; color: #fff; background: #6d452d; border: 0; border-radius: .4rem; font-weight: 700; cursor: pointer; }
  .market button strong, .market button span { display: block; }
  .market button span { margin-top: .3rem; font-size: .72rem; }
  .market button:disabled, .reserve button:disabled, .choice-actions button:disabled { cursor: not-allowed; opacity: .5; }
  .reserve .finish-reveal { background: #3f6049; }
  .reveal-button { margin-top: .6rem; background: #3f6049; }
  .decision h2, .history h2 { margin: .1rem 0 .6rem; font: 700 1.8rem 'Cormorant Garamond', serif; }
  .decision .eyebrow { color: #6d452d; }
  .hand { display: grid; grid-template-columns: repeat(5, minmax(8rem, 1fr)); gap: .55rem; overflow-x: auto; padding: .2rem; }
  .hand button { min-height: 8rem; padding: .7rem; color: #29291f; background: #dfd1b2; border: 2px solid #a58c61; border-radius: .5rem; text-align: left; cursor: pointer; }
  .hand button.selected { outline: 4px solid #49624d; background: #f0d99f; }
  .hand button:disabled { cursor: not-allowed; opacity: .7; }
  .hand strong, .hand span { display: block; }
  .hand span { margin-top: .5rem; font-size: .82rem; }
  .history ol { margin-bottom: 0; }
  @media (max-width: 850px) {
    .table-header { display: block; }
    .game-grid { grid-template-columns: 1fr; }
    .players { grid-template-columns: repeat(3, minmax(9rem, 1fr)); overflow-x: auto; }
    .board { grid-template-columns: 1fr 1fr; }
    .battle-area { grid-template-columns: 1fr; }
    .critical-control { grid-template-columns: 1fr; }
  }
  @media (max-width: 520px) {
    .endgame-area, .endgame-area.final, .rematch-panel { grid-template-columns: minmax(0, 1fr); }
    .endgame-area button { width: 100%; }
    .final-standings li { grid-template-columns: minmax(0, 1fr); }
    .board { grid-template-columns: 1fr; max-height: 34rem; overflow-y: auto; }
    .hand { grid-template-columns: repeat(5, 9rem); }
    .reveal-panel { grid-template-columns: 1fr; }
    .market { grid-template-columns: 1fr; }
    .chronicle-row { grid-template-columns: repeat(5, minmax(11rem, 1fr)); }
    .reveal-panel > div { min-width: 0; }
    .muster-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow-x: visible; }
    .muster-row article { min-width: 0; overflow-wrap: anywhere; }
    .reserve button { width: 100%; min-width: 0; overflow-wrap: anywhere; }
    .posts { grid-template-columns: 1fr; max-height: 19rem; overflow-y: auto; }
    .pending-choice { align-items: stretch; flex-direction: column; }
    .choice-actions { display: grid; grid-template-columns: 1fr 1fr; }
  }
</style>
