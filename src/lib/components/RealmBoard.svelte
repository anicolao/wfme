<script lang="ts">
  import { assets } from '$app/paths';
  import {
    AGENT_CARD_DEFINITIONS,
    BOARD_LAYOUT,
    BOARD_SPACE_DEFINITIONS,
    COMMANDERS,
    cardName,
    type BoardRegion
  } from '$lib/game/manifest';
  import { currentPlayerUid, legalAgentSpaces, type GameState } from '$lib/game/reducer';

  export let game: GameState;
  export let localUid: string;
  export let selectedCardId = '';
  export let onSelectCard: (cardId: string) => void;
  export let onPlaceAgent: (spaceId: string) => void;

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
      <p class="eyebrow">Round {game.match?.round ?? 1} · Agent turns</p>
      <h1 id="table-title">The living board</h1>
      <p>
        {game.players.find((player) => player.uid === currentUid)?.displayName ?? 'A player'}
        chooses the next road.
      </p>
    </div>
    <dl class="ledger" aria-label="Construction capability ledger">
      <div><dt>Playable spaces</dt><dd>2 / 22</dd></div>
      <div><dt>Agent-ready cards</dt><dd>1 / 7</dd></div>
      <div><dt>Commander powers</dt><dd>0 / 16</dd></div>
    </dl>
  </header>

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
            <div><dt>Shadow</dt><dd>{matchPlayer?.standing.shadow ?? 0}</dd></div>
          </dl>
          {#if player.uid === localUid}<small>Your seat · private hand below</small>{/if}
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
                {@const occupantUid = game.match?.boardAgents[space.id]?.uid}
                {@const occupant = game.players.find((player) => player.uid === occupantUid)?.displayName ?? null}
                <button
                  type="button"
                  class:implemented
                  class:occupied={Boolean(occupant)}
                  disabled={!legal.includes(space.id)}
                  aria-label={`${space.name}${occupant ? `, occupied by ${occupant}` : implemented ? ', implemented' : ', unavailable in current tracer'}`}
                  data-testid={`space-${space.id}`}
                  onclick={() => void onPlaceAgent(space.id)}
                >
                  <strong>{space.name}</strong>
                  {#if occupant}
                    <span>Agent · {occupant}</span>
                  {:else if implemented}
                    <span>{definition?.effect.kind === 'dwarven-caravans' ? 'Dwarven · +1 standing · +1 Provision' : 'Shadow · +1 standing · +2 Gold'}</span>
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

  <section class="decision" aria-labelledby="decision-title">
    <div>
      <p class="eyebrow">Your hand</p>
      <h2 id="decision-title">
        {#if currentUid === localUid}Choose a card, then a legal space.{:else}Waiting for the active player.{/if}
      </h2>
      {#if selectedCardId && !selectedIsImplemented}
        <p role="status">{selectedName} is part of the final deck, but its Agent feature is not active in this tracer.</p>
      {:else if selectedCardId}
        <p role="status">{selectedName} can send an Agent to the highlighted faction destinations.</p>
      {/if}
    </div>
    <div class="hand" data-testid="private-hand">
      {#each localMatch?.hand ?? [] as card}
        {@const implemented = AGENT_CARD_DEFINITIONS.some((definition) => definition.id === card.definitionId)}
        <button
          type="button"
          class:selected={card.id === selectedCardId}
          disabled={currentUid !== localUid}
          aria-pressed={card.id === selectedCardId}
          onclick={() => onSelectCard(card.id)}
        >
          <strong>{cardName(card.definitionId)}</strong>
          <span>{implemented ? 'Agent: Shadow · Dwarven · Elven · Wild' : 'Agent feature arrives in a later tracer'}</span>
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
  }
</style>
