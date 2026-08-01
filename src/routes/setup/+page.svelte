<script lang="ts">
  import { onMount } from 'svelte';
  import { createSeededSetup, privatePlayerSetup, publicSetup, type SeededSetup } from '$lib/setup/setup';

  let seed = 'middle-earth-001';
  let setup: SeededSetup | null = null;
  let selectedUid = 'aragorn-seat';
  let hydrated = false;

  onMount(() => {
    hydrated = true;
    const value = new URLSearchParams(location.search).get('seed');
    if (value) { seed = value; generate(); }
  });

  function generate() {
    setup = createSeededSetup(seed.trim() || 'middle-earth-001', ['aragorn-seat', 'galadriel-seat']);
  }
</script>

<svelte:head><title>Seeded setup — The War for Middle-earth</title></svelte:head>

<main class="setup-shell">
  <section class="setup-card" aria-labelledby="setup-title">
    <p class="eyebrow">Manifest gate · seeded replay</p>
    <h1 id="setup-title">Prepare the first journey.</h1>
    <p class="lede">One seed fixes player order, decks, Chronicle, Fate, and Battle. Public setup never includes another seat's hand.</p>
    <form class="seed-form" on:submit|preventDefault={generate}>
      <label for="seed">Match seed</label>
      <input id="seed" bind:value={seed} disabled={!hydrated} />
      <button type="submit" class="generate-link" disabled={!hydrated}>Generate setup</button>
    </form>

    {#if setup}
      {@const publicView = publicSetup(setup)}
      {@const privateView = privatePlayerSetup(setup, selectedUid)}
      <div class="setup-meta" aria-label="Setup summary">
        <div><span>Seed</span><strong data-testid="setup-seed">{publicView.seed}</strong></div>
        <div><span>Manifest</span><strong>{publicView.manifestVersion}</strong></div>
        <div><span>First player</span><strong>{publicView.firstPlayerUid}</strong></div>
      </div>
      <section aria-labelledby="public-title">
        <h2 id="public-title">Public table</h2>
        <p class="caption">Chronicle Row · {publicView.chronicleRow.length} cards · Battle deck {publicView.battleDeckCount} cards</p>
        <div class="row" data-testid="chronicle-row">
          {#each publicView.chronicleRow as card}<span>{card}</span>{/each}
        </div>
      </section>
      <section aria-labelledby="private-title">
        <h2 id="private-title">Private seat view</h2>
        <div class="seat-tabs" role="tablist" aria-label="Private seats">
          {#each setup.players as player}
            <button type="button" role="tab" aria-selected={selectedUid === player.uid} on:click={() => (selectedUid = player.uid)}>{player.uid}</button>
          {/each}
        </div>
        <p class="caption">Only the selected seat sees its hand. The public projection contains no hand or deck order.</p>
        <div class="hand" data-testid="private-hand">{#each privateView?.hand ?? [] as card}<span>{card}</span>{/each}</div>
      </section>
    {/if}
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; min-width: 320px; color: #f6efda; background: #17251f; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
  .setup-shell { min-height: 100vh; padding: clamp(1rem, 5vw, 5rem); background: radial-gradient(circle at 15% 5%, #3f5c45, transparent 35rem), #17251f; }
  .setup-card { width: min(100%, 68rem); margin: 5vh auto; padding: clamp(1.25rem, 5vw, 4rem); color: #20261f; background: #f6efda; border: 1px solid #d7c394; border-radius: 1.2rem; }
  .eyebrow { color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
  h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; } h1 { margin: 0 0 1rem; font-size: clamp(3rem, 8vw, 6rem); line-height: .85; } h2 { margin-top: 2rem; font-size: 2.4rem; }
  .lede { max-width: 42rem; font-size: 1.2rem; line-height: 1.5; }
  label { display: block; margin: .4rem 0; font-weight: 700; } input { width: 100%; min-height: 48px; padding: .7rem; border: 2px solid #a8a189; border-radius: .45rem; font: inherit; } button, .generate-link { min-height: 48px; padding: .7rem 1rem; color: #f6efda; background: #6d452d; border: 0; border-radius: .45rem; font: 700 1rem inherit; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; } button:hover, button:focus-visible, .generate-link:hover, .generate-link:focus-visible { background: #4e3021; }
  .seed-form { display: flex; align-items: end; gap: .8rem; margin-top: 2rem; } .seed-form label { flex: 1; } .seed-form .generate-link { flex: 0 0 auto; }
  .setup-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: .7rem; margin-top: 2rem; } .setup-meta div { padding: 1rem; background: #e7ddc5; border-radius: .5rem; } .setup-meta span, .caption { color: #5a6258; font-size: .9rem; } .setup-meta strong { display: block; margin-top: .25rem; overflow-wrap: anywhere; }
  .row, .hand { display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; } .row span, .hand span { min-height: 5rem; padding: .7rem; background: #e7ddc5; border: 1px solid #c8b993; border-radius: .4rem; font-size: .9rem; }
  .seat-tabs { display: flex; flex-wrap: wrap; gap: .5rem; } .seat-tabs button { color: #20261f; background: #e7ddc5; } .seat-tabs button[aria-selected='true'] { color: #f6efda; background: #365444; }
  @media (max-width: 620px) { .seed-form { display: block; } .seed-form .generate-link { width: 100%; margin-top: .7rem; } .setup-meta { grid-template-columns: 1fr; } .row, .hand { grid-template-columns: repeat(2, 1fr); } }
</style>
