<script lang="ts">
  import { assets } from '$app/paths';
  import {
    AGENT_CARD_DEFINITIONS,
    BOARD_LAYOUT,
    BOARD_SPACE_DEFINITIONS,
    COMMANDERS,
    MUSTER_CARD_DEFINITIONS,
    OBSERVATION_POSTS,
    RESERVE_CARD_DEFINITIONS,
    cardName,
    type BoardRegion
  } from '$lib/game/manifest';
  import { currentPlayerUid, legalAgentSpaces, type GameState } from '$lib/game/reducer';

  export let game: GameState;
  export let localUid: string;
  export let selectedCardId = '';
  export let onSelectCard: (cardId: string) => void;
  export let onPlaceAgent: (spaceId: string, infiltrationPostId?: string) => void;
  export let onResolveChoice: (choice: string) => void;
  export let onReveal: () => void;
  export let onAcquire: (definitionId: string) => void;
  export let onFinishReveal: () => void;
  export let onPlaceScout: (postId: string, recallPostId?: string) => void;
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
  $: legal = selectedCardId ? legalAgentSpaces(game, localUid, selectedCardId) : [];
  $: selectedDefinitionId = localMatch?.hand.find((card) => card.id === selectedCardId)?.definitionId;
  $: selectedIsImplemented = AGENT_CARD_DEFINITIONS.some((card) => card.id === selectedDefinitionId);
  $: selectedName = selectedDefinitionId ? cardName(selectedDefinitionId) : '';

</script>

<section class="table" aria-labelledby="table-title">
  <header class="table-header">
    <div>
      <p class="eyebrow">Round {game.match?.round ?? 1} · {game.match?.turnMode === 'reveal' ? 'Reveal turn' : 'Agent turns'}</p>
      <h1 id="table-title">The living board</h1>
      <p>
        {game.players.find((player) => player.uid === currentUid)?.displayName ?? 'A player'}
        chooses the next road.
      </p>
    </div>
    <dl class="ledger" aria-label="Construction capability ledger">
      <div><dt>Playable spaces</dt><dd>9 / 22</dd></div>
      <div><dt>Agent-ready cards</dt><dd>5 / 7</dd></div>
      <div><dt>Commander powers</dt><dd>0 / 16</dd></div>
    </dl>
  </header>

  <dl class="alliances" aria-label="Reviewed faction Alliances">
    <div data-testid="alliance-dwarven"><dt>Dwarven Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.dwarven)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="alliance-shadow"><dt>Shadow Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.shadow)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="alliance-elven"><dt>Elven Alliance</dt><dd>{game.players.find((player) => player.uid === game.match?.alliances.elven)?.displayName ?? 'Unclaimed'}</dd></div>
    <div data-testid="fate-discard"><dt>Fate discard</dt><dd>{game.match?.fateDiscard.length ?? 0} cards</dd></div>
  </dl>

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
            <div><dt>Garrison</dt><dd>{matchPlayer?.companies.garrison ?? 0}</dd></div>
            <div><dt>Supply</dt><dd>{matchPlayer?.companies.supply ?? 0}</dd></div>
            <div><dt>Renown</dt><dd>{matchPlayer?.renown ?? 0}</dd></div>
            <div><dt>Discard</dt><dd>{matchPlayer?.discardPile.length ?? 0}</dd></div>
            <div><dt>Trash</dt><dd>{matchPlayer?.trashPile.length ?? 0}</dd></div>
            <div><dt>Scouts</dt><dd>{matchPlayer?.scouts.supply ?? 0} supply</dd></div>
            <div><dt>Fate</dt><dd>{matchPlayer?.fateHand.length ?? 0}</dd></div>
            <div><dt>Council</dt><dd>{matchPlayer?.councilSeat ? 'Seated' : '—'}</dd></div>
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
                  {:else if implemented}
                    <span>
                      {definition?.effect.kind === 'dwarven-caravans'
                        ? 'Dwarven · +1 standing · +1 Provision'
                        : definition?.effect.kind === 'tribute-shadow'
                          ? 'Shadow · +1 standing · +2 Gold'
                          : definition?.effect.kind === 'hidden-counsel'
                            ? 'Elven · +1 standing · draw 1 Fate · gather Fate from opponents holding 4+'
                            : definition?.effect.kind === 'mirror-galadriel'
                              ? 'Pay 1 Mithril · Elven +1 · draw 1 card · place 1 Scout'
                              : definition?.effect.kind === 'secret-bargain'
                                ? 'Need Shadow 2 · pay 3 Gold · cycle Fate · recall another Agent · draw 1 card'
                          : definition?.effect.kind === 'take-war-effort'
                          ? 'Draw 1 card · +2 Gold'
                            : definition?.effect.kind === 'muster-free-peoples'
                              ? 'Recruit 2 · optionally pay 2 Gold for 1 Provision'
                              : definition?.effect.kind === 'hall-of-fire'
                                ? 'Draw 1 Fate · +1 Reveal Influence this round while your Agent remains'
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
      <h2 id="scout-title">{game.match?.pendingChoice?.kind === 'place-scout' ? (selectedScoutRecall ? 'Choose the Scout’s new post.' : 'Choose an empty post for the Scout.') : 'Scouts watch the roads.'}</h2>
    </div>
    <div class="posts">
      {#each OBSERVATION_POSTS as post}
        {@const scoutUid = game.match?.boardScouts[post.id]}
        {@const scoutName = game.players.find((player) => player.uid === scoutUid)?.displayName}
        {@const placing = game.match?.pendingChoice?.kind === 'place-scout' && game.match.pendingChoice.actorUid === localUid}
        {@const mustRecall = (localMatch?.scouts.supply ?? 0) < 1}
        {@const choosingRecall = placing && mustRecall && !selectedScoutRecall}
        <button
          type="button"
          class:scouted={Boolean(scoutUid)}
          class:recalling={selectedScoutRecall === post.id}
          disabled={!placing || (choosingRecall ? scoutUid !== localUid : Boolean(scoutUid) && post.id !== selectedScoutRecall)}
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

  {#if game.match?.pendingChoice && game.match.pendingChoice.kind !== 'place-scout'}
    <section class="pending-choice" data-testid="pending-choice" aria-labelledby="choice-title">
      <div>
        <p class="eyebrow">Ordered {game.match.pendingChoice.kind === 'muster-free-peoples' ? 'Council' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'Scout' : game.match.pendingChoice.kind === 'elven-favor' ? 'Elven favor' : game.match.pendingChoice.kind.startsWith('secret-bargain') ? 'Secret Bargain' : 'Journey'} choice</p>
        <h2 id="choice-title">{game.match.pendingChoice.kind === 'muster-free-peoples' ? 'Pay 2 Gold to gain 1 Provision?' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'Recall a Scout to gather intelligence?' : game.match.pendingChoice.kind === 'elven-favor' ? 'Keep one of the two Fate cards?' : game.match.pendingChoice.kind === 'secret-bargain-fate' ? 'Cycle one Fate card?' : game.match.pendingChoice.kind === 'secret-bargain-recall' ? 'Recall another Agent?' : 'Trash Seek Allies?'}</h2>
        <p>{game.match.pendingChoice.kind === 'muster-free-peoples' ? 'The Companies have already been recruited.' : game.match.pendingChoice.kind === 'gather-intelligence' ? 'The Agent is placed, but neither the board nor Journey effect has resolved yet.' : game.match.pendingChoice.kind === 'elven-favor' ? 'The two private cards are identified only to you; the unchosen card enters the public Fate discard.' : game.match.pendingChoice.kind === 'secret-bargain-fate' ? 'The cycled identity remains private; its old instance enters the public discard before a replacement is drawn.' : game.match.pendingChoice.kind === 'secret-bargain-recall' ? 'Choose one of your other occupied spaces. The recalled Agent becomes available again before the private draw.' : 'The board space has resolved.'} Resolve this choice before the turn advances.</p>
      </div>
      <div class="choice-actions">
        {#if game.match.pendingChoice.kind === 'muster-free-peoples'}
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('pay-2-gold')}>Pay 2 Gold</button>
          <button type="button" disabled={game.match.pendingChoice.actorUid !== localUid} onclick={() => onResolveChoice('decline')}>Keep the Gold</button>
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
            <article><strong>{cardName(card.definitionId)}</strong><span>{muster?.influence ?? 0} Influence · {muster?.swords ?? 0} swords</span></article>
          {/each}
        </div>
        <p class="reveal-total"><strong>{revealPlayer.revealInfluence} Influence</strong> remaining · {revealPlayer.revealedSwords} {revealPlayer.revealedSwords === 1 ? 'sword' : 'swords'}</p>
      </div>
      <div class="reserve" aria-label="Reserve market">
        {#each RESERVE_CARD_DEFINITIONS as card}
          <button
            type="button"
            disabled={currentUid !== localUid || revealPlayer.revealInfluence < card.cost || game.match.reserveSupply[card.id] < 1}
            onclick={() => onAcquire(card.id)}
          >
            <strong>{card.name} · {card.cost} Influence</strong>
            <span>{game.match.reserveSupply[card.id]} remain{card.onAcquireRenown ? ` · gain ${card.onAcquireRenown} Renown` : ''}</span>
          </button>
        {/each}
        <button class="finish-reveal" type="button" disabled={currentUid !== localUid} onclick={onFinishReveal}>Finish Reveal</button>
      </div>
    </section>
  {/if}

  <section class="decision" aria-labelledby="decision-title">
    <div>
      <p class="eyebrow">Your hand</p>
      <h2 id="decision-title">
        {#if game.match?.turnMode === 'reveal'}Resolve Muster and acquisitions above.{:else if currentUid === localUid}Choose a card, then a legal space.{:else}Waiting for the active player.{/if}
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
          disabled={currentUid !== localUid || Boolean(game.match?.pendingChoice)}
          aria-pressed={card.id === selectedCardId}
          onclick={() => onSelectCard(card.id)}
        >
          <strong>{cardName(card.definitionId)}</strong>
          <span>{cardDefinition ? `Agent: ${cardDefinition.placementIcons.join(' · ')}` : 'Agent feature arrives in a later tracer'}</span>
        </button>
      {/each}
    </div>
  </section>

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
  .ledger { display: flex; gap: .5rem; margin: 0; }
  .ledger div { min-width: 8rem; padding: .65rem; color: #29291f; background: #efe3c4; border-radius: .5rem; }
  .ledger dt { font-size: .78rem; }
  .ledger dd { margin: .15rem 0 0; font-weight: 700; }
  .alliances { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem; }
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
  .decision, .history { margin-top: 1rem; padding: 1rem; color: #28291f; background: #f3e8ce; border-radius: .7rem; }
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
  .reserve button, .reveal-button, .choice-actions button { min-height: 48px; padding: .6rem; color: #fff; background: #6d452d; border: 0; border-radius: .4rem; font-weight: 700; cursor: pointer; }
  .reserve button:disabled, .choice-actions button:disabled { cursor: not-allowed; opacity: .5; }
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
    .ledger { overflow-x: auto; margin-top: .8rem; }
    .game-grid { grid-template-columns: 1fr; }
    .players { grid-template-columns: repeat(3, minmax(9rem, 1fr)); overflow-x: auto; }
    .board { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 520px) {
    .board { grid-template-columns: 1fr; max-height: 34rem; overflow-y: auto; }
    .hand { grid-template-columns: repeat(5, 9rem); }
    .reveal-panel { grid-template-columns: 1fr; }
    .reveal-panel > div { min-width: 0; }
    .muster-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow-x: visible; }
    .muster-row article { min-width: 0; overflow-wrap: anywhere; }
    .reserve button { width: 100%; min-width: 0; overflow-wrap: anywhere; }
    .posts { grid-template-columns: 1fr; max-height: 19rem; overflow-y: auto; }
    .pending-choice { align-items: stretch; flex-direction: column; }
    .choice-actions { display: grid; grid-template-columns: 1fr 1fr; }
  }
</style>
