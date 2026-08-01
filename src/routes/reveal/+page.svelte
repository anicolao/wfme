<script lang="ts">
  import { acquire, type DeckZones } from '$lib/reveal/deck';

  const costs: Record<string, number> = { 'rider-rohan': 2, 'bree-guide': 2, 'dwarven-smith': 3, 'lady-golden-wood': 5 };
  let deck: DeckZones = { deck: ['starting-06', 'starting-07'], hand: ['starting-01', 'starting-02'], discard: [], trash: [], chronicleRow: ['rider-rohan', 'bree-guide', 'dwarven-smith'], chronicleDeck: ['lady-golden-wood'], influence: 3 };
  let acquired = '';
  let revealed = false;

  function buy(cardId: string) {
    deck = acquire(deck, cardId, costs[cardId] ?? 99, []);
    acquired = cardId;
  }
</script>

<svelte:head><title>Reveal and acquire — The War for Middle-earth</title></svelte:head>
<main class="reveal-shell"><section class="reveal-card" aria-labelledby="reveal-title">
  <p class="eyebrow">Reveal · Muster · Chronicle</p><h1 id="reveal-title">Turn knowledge into a deck.</h1><p class="lede">Spend Influence on one Chronicle card at a time. The row refills immediately and every card instance remains in exactly one zone.</p>
  <label class="reveal-button"><input type="checkbox" bind:checked={revealed} /> {revealed ? 'Reveal complete' : 'Reveal remaining hand'}</label>
  {#if revealed}<p class="revealed" role="status">Muster effects resolved. Influence available: <strong>{deck.influence}</strong>.</p>{/if}
  <section aria-labelledby="row-title"><h2 id="row-title">Chronicle Row</h2><div class="row">{#each deck.chronicleRow as card}<button type="button" disabled={deck.influence < (costs[card] ?? 99)} onclick={() => buy(card)}>{card}<small>cost {costs[card]}</small></button>{/each}</div></section>
  <div class="zones" aria-label="Card zones"><span>Deck <strong>{deck.deck.length}</strong></span><span>Hand <strong>{deck.hand.length}</strong></span><span>Discard <strong>{deck.discard.length}</strong></span><span>Trash <strong>{deck.trash.length}</strong></span><span>Influence <strong>{deck.influence}</strong></span></div>
  <p class="message" role="status" data-testid="acquire-message">{acquired ? `Acquired ${acquired}; the Row refilled.` : 'Choose an affordable Chronicle card.'}</p>
</section></main>
<style>
  :global(*) { box-sizing: border-box; } :global(body) { margin: 0; min-width: 320px; color: #f6efda; background: #17251f; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; } .reveal-shell { min-height: 100vh; padding: clamp(1rem, 5vw, 5rem); background: radial-gradient(circle at 10% 10%, #3f5c45, transparent 35rem), #17251f; } .reveal-card { width: min(100%, 72rem); margin: 5vh auto; padding: clamp(1.25rem, 5vw, 4rem); color: #20261f; background: #f6efda; border: 1px solid #d7c394; border-radius: 1.2rem; } .eyebrow { color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; } h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; } h1 { margin: 0 0 1rem; font-size: clamp(3rem, 8vw, 6rem); line-height: .85; } h2 { margin-top: 2rem; font-size: 2.4rem; } .lede { max-width: 42rem; font-size: 1.2rem; line-height: 1.5; } button { min-height: 52px; padding: .7rem 1rem; color: #f6efda; background: #6d452d; border: 0; border-radius: .4rem; font: 700 1rem inherit; cursor: pointer; } button:disabled { cursor: not-allowed; opacity: .45; } .reveal-button { display: inline-flex; min-height: 52px; align-items: center; margin-top: 1rem; padding: .7rem 1rem; color: #f6efda; background: #365444; border-radius: .4rem; font-weight: 700; cursor: pointer; } .reveal-button input { margin-right: .5rem; } .revealed { padding: .8rem; background: #d7c394; } .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; } .row button { min-height: 7rem; color: #20261f; background: #e7ddc5; text-align: left; } .row button:hover, .row button:focus-visible { background: #d7c394; } small { display: block; margin-top: .3rem; color: #5a6258; font-weight: 400; } .zones { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 2rem; } .zones span { padding: .7rem 1rem; background: #e7ddc5; border-radius: .4rem; } .message { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #d6ccb3; font-weight: 700; } @media (max-width: 620px) { .row { grid-template-columns: 1fr; } }
</style>
