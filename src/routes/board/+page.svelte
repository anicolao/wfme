<script lang="ts">
  import { DESTINATIONS, legalDestinations, placeAgent, PLACEMENT_CARDS, type PlacementState } from '$lib/board/placement';

  let selectedCardId = PLACEMENT_CARDS[0].id;
  let state: PlacementState = { resources: { gold: 1, mithril: 0, provisions: 1 }, standing: { shadow: 0, dwarven: 0, elven: 0, wild: 0 }, occupied: ['minas-tirith'], scouts: [] };
  let placed = '';
  $: selectedCard = PLACEMENT_CARDS.find((card) => card.id === selectedCardId) ?? PLACEMENT_CARDS[0];
  $: legal = legalDestinations(selectedCard, state);

  function chooseDestination(id: string) {
    const destination = DESTINATIONS.find((candidate) => candidate.id === id);
    if (!destination || !legal.some((candidate) => candidate.id === id)) return;
    state = placeAgent(selectedCard, destination, state);
    placed = destination.name;
  }
</script>

<svelte:head><title>Agent placement — The War for Middle-earth</title></svelte:head>
<main class="board-shell">
  <section class="board-card" aria-labelledby="board-title">
    <p class="eyebrow">Agent turn · legal destinations</p>
    <h1 id="board-title">Choose a road.</h1>
    <p class="lede">Every card icon, cost, standing requirement, and occupied space is checked before an Agent moves.</p>
    <div class="resources" aria-label="Resources"><span>Gold <strong>{state.resources.gold}</strong></span><span>Provisions <strong>{state.resources.provisions}</strong></span><span>Occupied <strong>{state.occupied.length}</strong></span></div>
    <section aria-labelledby="cards-title"><h2 id="cards-title">Card in hand</h2><div class="cards">{#each PLACEMENT_CARDS as card}<label class:selected={selectedCard.id === card.id}><input type="radio" name="placement-card" aria-label={card.name} value={card.id} bind:group={selectedCardId} /><strong>{card.name}</strong><small>{card.icons.join(' · ')}</small></label>{/each}</div></section>
    <section aria-labelledby="destinations-title"><h2 id="destinations-title">Legal destinations</h2><div class="destinations">{#each DESTINATIONS as destination}<button type="button" disabled={!legal.some((candidate) => candidate.id === destination.id)} onclick={() => chooseDestination(destination.id)}>{destination.name}<small>{destination.icons.join(' · ')} · cost {destination.cost}</small></button>{/each}</div></section>
    <p class="message" role="status" data-testid="placement-message">{placed ? `Agent placed at ${placed}.` : `${legal.length} destinations are legal for ${selectedCard.name}.`}</p>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; } :global(body) { margin: 0; min-width: 320px; color: #f6efda; background: #17251f; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; } .board-shell { min-height: 100vh; padding: clamp(1rem, 5vw, 5rem); background: radial-gradient(circle at 85% 10%, #3f5c45, transparent 35rem), #17251f; } .board-card { width: min(100%, 72rem); margin: 5vh auto; padding: clamp(1.25rem, 5vw, 4rem); color: #20261f; background: #f6efda; border: 1px solid #d7c394; border-radius: 1.2rem; } .eyebrow { color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; } h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; } h1 { margin: 0 0 1rem; font-size: clamp(3rem, 8vw, 6rem); line-height: .85; } h2 { margin-top: 2rem; font-size: 2.4rem; } .lede { max-width: 42rem; font-size: 1.2rem; line-height: 1.5; } .resources { display: flex; flex-wrap: wrap; gap: .6rem; margin: 2rem 0; } .resources span { padding: .7rem 1rem; background: #e7ddc5; border-radius: .4rem; } .cards, .destinations { display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem; } .cards label { min-height: 52px; padding: .7rem; background: #e7ddc5; border: 2px solid transparent; border-radius: .4rem; cursor: pointer; } .cards label:hover, .cards label:focus-within, .cards label.selected { border-color: #6d452d; background: #d7c394; } .cards input { position: absolute; opacity: 0; } .destinations button { min-height: 52px; padding: .7rem; color: #20261f; background: #e7ddc5; border: 2px solid transparent; border-radius: .4rem; font: 700 1rem inherit; text-align: left; cursor: pointer; } .destinations button:hover, .destinations button:focus-visible { border-color: #6d452d; background: #d7c394; } .destinations button:disabled { cursor: not-allowed; opacity: .45; } small { display: block; margin-top: .2rem; color: #5a6258; font-weight: 400; } .message { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #d6ccb3; font-weight: 700; } @media (max-width: 700px) { .cards, .destinations { grid-template-columns: repeat(2, 1fr); } }
</style>
