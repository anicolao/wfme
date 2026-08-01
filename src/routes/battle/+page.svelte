<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { deployRecruit, initialBattleState, resolveBattle, revealSwords, type BattleState } from '$lib/battle/resolution';
  let state: BattleState = initialBattleState();
  let message = 'Deploy recruits or reveal swords before resolving.';
  onMount(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('recruit') === '1') state = deployRecruit(state, 'aragorn');
    if (params.get('sword') === '1') state = revealSwords(state, 'galadriel');
    if (params.get('resolve') === '1') state = resolveBattle(state);
    if (state.resolved) message = 'Battle resolved; ranked rewards are locked.';
    else if ((state.swords.galadriel ?? 0) > 0) message = 'Galadriel reveals 1 sword.';
    else if ((state.recruits.aragorn ?? 0) > 0) message = 'Aragorn deploys 1 recruit.';
  });
  function act(action: 'recruit' | 'sword' | 'resolve') {
    if (action === 'recruit') { state = deployRecruit(state, 'aragorn'); message = 'Aragorn deploys 1 recruit.'; }
    if (action === 'sword') { state = revealSwords(state, 'galadriel'); message = 'Galadriel reveals 1 sword.'; }
    if (action === 'resolve') { state = resolveBattle(state); message = 'Battle resolved; ranked rewards are locked.'; }
  }
</script>
<svelte:head><title>Battle — The War for Middle-earth</title></svelte:head>
<main class="battle-shell"><section class="battle-card" aria-labelledby="battle-title">
  <p class="eyebrow">Deployment · Strength · Rewards</p><h1 id="battle-title">{state.title}</h1><p class="lede">Current-turn recruits and revealed swords determine Strength. Combat Fate breaks ties before ranked rewards are assigned.</p>
  <div class="controls"><a href={`${base}/battle/?recruit=1`} data-sveltekit-reload>Deploy Aragorn recruit</a><a href={`${base}/battle/?recruit=1&sword=1`} data-sveltekit-reload>Reveal Galadriel sword</a><a class="resolve" href={`${base}/battle/?recruit=1&sword=1&resolve=1`} data-sveltekit-reload>Resolve Battle</a></div>
  <section aria-label="Battle standings"><h2>Strength</h2>{#each Object.keys(state.baseStrength) as uid}<p class="fighter"><strong>{uid}</strong><span>{state.baseStrength[uid]} base + {state.recruits[uid] ?? 0} recruits + {state.swords[uid] ?? 0} swords = {state.baseStrength[uid] + (state.recruits[uid] ?? 0) + (state.swords[uid] ?? 0)}</span></p>{/each}</section>
  {#if state.resolved}<section aria-label="Ranked rewards"><h2>Ranked rewards</h2>{#each state.ranks as rank, index}<p data-testid={`rank-${index + 1}`}><strong>#{index + 1} {rank.uid}</strong> · {rank.strength} Strength · {rank.reward}</p>{/each}</section>{/if}
  <p class="message" role="status">{message}</p>
</section></main>
<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;min-width:320px;color:#f6efda;background:#17251f;font-family:'Atkinson Hyperlegible',system-ui,sans-serif}.battle-shell{min-height:100vh;padding:clamp(1rem,5vw,5rem);background:radial-gradient(circle at 85% 10%,#3f5c45,transparent 35rem),#17251f}.battle-card{width:min(100%,72rem);margin:5vh auto;padding:clamp(1.25rem,5vw,4rem);color:#20261f;background:#f6efda;border:1px solid #d7c394;border-radius:1.2rem}.eyebrow{color:#6d452d;font-weight:700;letter-spacing:.13em;text-transform:uppercase}h1,h2{font-family:'Cormorant Garamond',Georgia,serif}h1{margin:0 0 1rem;font-size:clamp(3rem,8vw,6rem);line-height:.85}h2{margin-top:2rem;font-size:2.4rem}.lede{max-width:42rem;font-size:1.2rem;line-height:1.5}.controls{display:flex;flex-wrap:wrap;gap:.7rem}.controls a{display:inline-flex;min-height:52px;align-items:center;padding:.7rem 1rem;color:#f6efda;background:#6d452d;border-radius:.4rem;font:700 1rem inherit;text-decoration:none}.controls .resolve{background:#365444}.fighter{display:flex;justify-content:space-between;gap:1rem;padding:.8rem;background:#e7ddc5;border-radius:.4rem}.message{margin-top:2rem;padding-top:1rem;border-top:1px solid #d6ccb3;font-weight:700}@media(max-width:620px){.fighter{display:block}.fighter span{display:block;margin-top:.3rem}}
</style>
