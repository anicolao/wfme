<script lang="ts">
  import { onMount } from 'svelte';
  import { FACTION_NAMES, gainStanding, initialFactionState, claimCaptain, type FactionId } from '$lib/factions/standing';

  let state = initialFactionState();
  let message = 'Choose a faction to build standing.';
  const factions = Object.keys(FACTION_NAMES) as FactionId[];

  onMount(() => {
    const params = new URLSearchParams(location.search);
    const faction = params.get('faction') as FactionId | null;
    const level = Number(params.get('level') ?? 0);
    if (faction && factions.includes(faction)) {
      state = gainStanding(initialFactionState(), faction, Math.max(0, Math.min(level, 6)));
      message = `Standing gained with ${FACTION_NAMES[faction]}.`;
    }
    if (params.get('captain') === '1' && state.councilSeat) {
      state = claimCaptain(state);
      message = 'Captain of the Host unlocked.';
    }
  });

  function advance(faction: FactionId) {
    const before = state;
    state = gainStanding(state, faction);
    message = state.standing[faction] === 2 && before.standing[faction] < 2 ? `Council seat gained through ${FACTION_NAMES[faction]}.` : state.standing[faction] === 4 && before.standing[faction] < 4 ? `Alliance claimed with ${FACTION_NAMES[faction]}.` : `Standing gained with ${FACTION_NAMES[faction]}.`;
  }

  function takeCaptain() {
    state = claimCaptain(state);
    message = 'Captain of the Host unlocked.';
  }
</script>

<svelte:head><title>Factions and upgrades — The War for Middle-earth</title></svelte:head>
<main class="faction-shell"><section class="faction-card" aria-labelledby="faction-title">
  <p class="eyebrow">Standing · favors · permanent upgrades</p><h1 id="faction-title">Earn the realm’s trust.</h1><p class="lede">Standing 2 opens the Council seat. Standing 4 claims an Alliance and Renown; crossing thresholds is replayed in order.</p>
  <div class="faction-grid">{#each factions as faction}<article><h2>{FACTION_NAMES[faction]}</h2><p class="track" aria-label={`${FACTION_NAMES[faction]} standing`}><strong>{state.standing[faction]}</strong> / 6</p><a class="action-button" data-sveltekit-reload href={`/factions/?faction=${faction}&level=${state.standing[faction] + 1}`}>Gain 1 standing</a>{#if state.alliance === faction}<span class="badge">Alliance</span>{/if}</article>{/each}</div>
  <div class="upgrades"><p>Council seat: <strong>{state.councilSeat ? 'Unlocked' : 'Locked'}</strong></p><p>Captain of the Host: <strong>{state.captain ? 'Unlocked' : 'Locked'}</strong></p><p>Renown: <strong>{state.renown}</strong></p></div>
  {#if state.councilSeat && !state.captain}<a class="captain" data-sveltekit-reload href="/factions/?faction=elven&level=4&captain=1">Claim Captain of the Host</a>{:else}<span class="captain disabled">Claim Captain of the Host</span>{/if}
  <p class="message" role="status" data-testid="faction-message">{message}</p>
</section></main>
<style>
  :global(*) { box-sizing: border-box; } :global(body) { margin: 0; min-width: 320px; color: #f6efda; background: #17251f; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; } .faction-shell { min-height: 100vh; padding: clamp(1rem, 5vw, 5rem); background: radial-gradient(circle at 85% 10%, #3f5c45, transparent 35rem), #17251f; } .faction-card { width: min(100%, 72rem); margin: 5vh auto; padding: clamp(1.25rem, 5vw, 4rem); color: #20261f; background: #f6efda; border: 1px solid #d7c394; border-radius: 1.2rem; } .eyebrow { color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; } h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; } h1 { margin: 0 0 1rem; font-size: clamp(3rem, 8vw, 6rem); line-height: .85; } h2 { margin: 0; font-size: 1.8rem; } .lede { max-width: 42rem; font-size: 1.2rem; line-height: 1.5; } .faction-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; margin-top: 2rem; } article { padding: 1rem; background: #e7ddc5; border-radius: .5rem; } .action-button, .captain { display: inline-flex; min-height: 48px; align-items: center; padding: .7rem 1rem; color: #f6efda; background: #6d452d; border-radius: .4rem; font: 700 1rem inherit; text-decoration: none; } .action-button:hover, .action-button:focus-visible, .captain:hover, .captain:focus-visible { background: #4e3021; } .track { font-size: 1.5rem; } .badge { display: inline-block; margin-left: .5rem; padding: .25rem .5rem; color: #f6efda; background: #365444; border-radius: 1rem; } .upgrades { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem; } .captain { width: 100%; margin-top: 1rem; background: #365444; } .message { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #d6ccb3; font-weight: 700; } @media (max-width: 620px) { .faction-grid { grid-template-columns: 1fr; } }
</style>
