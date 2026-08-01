<script lang="ts">
  import '@fontsource/atkinson-hyperlegible/400.css';
  import '@fontsource/atkinson-hyperlegible/700.css';
  import '@fontsource/cormorant-garamond/700.css';
  import { assets } from '$app/paths';
  import {
    BOARD_DESTINATIONS,
    CHRONICLE_CARDS,
    FACTIONS,
    GAME_TITLE,
    OBSERVATION_POSTS,
    PLAYER_RANGE,
    ROUND_PHASES,
    TARGET_RENOWN
  } from '$lib/game/design';

  const buildHash = (import.meta.env.VITE_GIT_HASH ?? 'local').slice(0, 7);
  const boardPreview = `${assets}/board-layout-preview.jpg`;
</script>

<svelte:head>
  <title>{GAME_TITLE} — Web prototype</title>
  <meta
    name="description"
    content="A responsive digital strategy game of counsel, journeys, and dominion."
  />
</svelte:head>

<header class="site-header">
  <a class="wordmark" href="#top" aria-label="The War for Middle-earth, back to top">
    <span aria-hidden="true">W</span>
    <strong>WFME</strong>
  </a>
  <nav aria-label="Project documents">
    <a href="https://github.com/anicolao/wfme/blob/main/RULES.md">Rules</a>
    <a href="https://github.com/anicolao/wfme/blob/main/IMPLEMENTATION_PLAN.md">Plan</a>
    <a href="https://github.com/anicolao/wfme">GitHub</a>
  </nav>
</header>

<main id="top">
  <section class="hero" aria-labelledby="game-title">
    <div class="hero-copy">
      <p class="eyebrow">A strategy game of counsel, journeys, and dominion</p>
      <h1 id="game-title">{GAME_TITLE}</h1>
      <p class="lede">
        Send Agents across a contested realm, build a Chronicle of allies and deeds, and decide
        when the age's next great Battle is worth your armies.
      </p>
      <p class="status" role="status"><span></span>Implementation foundation · PR1</p>
      <div class="facts" aria-label="Game summary">
        <div><strong>{PLAYER_RANGE.minimum}–{PLAYER_RANGE.maximum}</strong><span>players</span></div>
        <div><strong>45 min</strong><span>per player</span></div>
        <div><strong>{TARGET_RENOWN}</strong><span>Renown to end</span></div>
      </div>
    </div>

    <figure class="board-preview">
      <img src={boardPreview} alt="Illustrated board layout concept" />
      <figcaption>Concept layout; final rules overlays remain semantic and responsive.</figcaption>
    </figure>
  </section>

  <section class="game-shape" aria-labelledby="shape-title">
    <div>
      <p class="section-label">The round</p>
      <h2 id="shape-title">Every card is a road or a reckoning.</h2>
      <p>
        Play a card to place an Agent now, or preserve its Muster effect for Influence and Battle
        Strength when you Reveal.
      </p>
    </div>
    <ol class="phases" aria-label="Round phases">
      {#each ROUND_PHASES as phase, index}
        <li><span>{String(index + 1).padStart(2, '0')}</span>{phase}</li>
      {/each}
    </ol>
  </section>

  <section class="factions" aria-labelledby="factions-title">
    <p class="section-label">Four powers</p>
    <h2 id="factions-title">Influence changes what the board permits.</h2>
    <div class="faction-grid">
      {#each FACTIONS as faction}
        <article style={`--accent: ${faction.accent}`}>
          <span aria-hidden="true"></span>
          <h3>{faction.name}</h3>
        </article>
      {/each}
    </div>
  </section>

  <section class="foundation" aria-labelledby="foundation-title">
    <div>
      <p class="section-label">Implementation foundation</p>
      <h2 id="foundation-title">The board is data. The browser is the table.</h2>
    </div>
    <div class="metrics">
      <p><strong>{BOARD_DESTINATIONS}</strong> destinations</p>
      <p><strong>{OBSERVATION_POSTS}</strong> Scout posts</p>
      <p><strong>{CHRONICLE_CARDS}</strong> Chronicle cards</p>
    </div>
    <p class="foundation-copy">
      PR1 establishes responsive composition, installable metadata, deterministic constants, and
      browser-level testing. Immutable multiplayer events and the pure rules reducer arrive as the
      next vertical slice.
    </p>
  </section>
</main>

<footer>
  <p>Unofficial, non-commercial fan-design prototype · GPLv3</p>
  <p data-testid="build-marker">Build {buildHash}</p>
</footer>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    color-scheme: light;
    scroll-behavior: smooth;
    background: #17251f;
  }

  :global(body) {
    margin: 0;
    min-width: 320px;
    color: #20261f;
    background:
      radial-gradient(circle at 10% 8%, rgb(255 250 229 / 76%), transparent 28rem),
      #ece3cc;
    font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
  }

  :global(a) {
    color: inherit;
  }

  .site-header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    padding: env(safe-area-inset-top) clamp(1rem, 4vw, 4rem) 0;
    color: #f6efda;
    background: #17251f;
    border-bottom: 1px solid #596856;
  }

  .wordmark,
  nav a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .wordmark {
    gap: 0.65rem;
    letter-spacing: 0.16em;
  }

  .wordmark span {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    color: #17251f;
    background: #d7c394;
    border-radius: 50%;
    font: 700 1.45rem 'Cormorant Garamond', serif;
  }

  nav {
    display: flex;
    gap: clamp(0.3rem, 2vw, 1.5rem);
  }

  nav a {
    padding: 0 0.65rem;
    text-underline-offset: 0.3rem;
  }

  nav a:hover,
  nav a:focus-visible {
    text-decoration: underline;
  }

  main {
    overflow: hidden;
  }

  .hero {
    display: grid;
    min-height: min(760px, calc(100vh - 72px));
    grid-template-columns: minmax(18rem, 0.82fr) minmax(28rem, 1.18fr);
    align-items: center;
    gap: clamp(2rem, 5vw, 6rem);
    padding: clamp(3rem, 7vw, 7rem) clamp(1rem, 5vw, 5.5rem);
  }

  .hero-copy {
    max-width: 42rem;
  }

  .eyebrow,
  .section-label {
    margin: 0 0 0.75rem;
    color: #6d452d;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  p {
    margin-top: 0;
  }

  h1,
  h2,
  h3 {
    font-family: 'Cormorant Garamond', Georgia, serif;
  }

  h1 {
    max-width: 10ch;
    margin-bottom: 1.25rem;
    font-size: clamp(3.6rem, 7vw, 7.8rem);
    line-height: 0.82;
    letter-spacing: -0.045em;
  }

  h2 {
    max-width: 18ch;
    margin-bottom: 1rem;
    font-size: clamp(2.3rem, 4.5vw, 4.8rem);
    line-height: 0.95;
  }

  .lede {
    max-width: 40rem;
    font-size: clamp(1.1rem, 1.8vw, 1.35rem);
    line-height: 1.55;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin: 1.5rem 0;
    font-weight: 700;
  }

  .status span {
    width: 0.7rem;
    height: 0.7rem;
    background: #69864f;
    border: 2px solid #f8f0d8;
    border-radius: 50%;
    box-shadow: 0 0 0 1px #69864f;
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .facts div {
    min-width: 7.3rem;
    padding: 0.85rem 1rem;
    background: rgb(255 251 239 / 72%);
    border: 1px solid #b4a681;
    border-radius: 0.75rem;
  }

  .facts strong,
  .facts span {
    display: block;
  }

  .facts strong {
    font-size: 1.2rem;
  }

  .facts span {
    color: #5e6359;
    font-size: 0.9rem;
  }

  .board-preview {
    position: relative;
    margin: 0;
    transform: rotate(1.1deg);
  }

  .board-preview::before {
    position: absolute;
    z-index: -1;
    inset: 4% -3% -5% 2%;
    background: #19241d;
    border-radius: 1rem;
    box-shadow: 0 2rem 4rem rgb(30 28 19 / 28%);
    content: '';
  }

  .board-preview img {
    display: block;
    width: 100%;
    height: auto;
    border: clamp(0.4rem, 1vw, 0.8rem) solid #514530;
    border-radius: 0.65rem;
  }

  .board-preview figcaption {
    padding: 0.75rem 0.25rem 0;
    color: #4d5148;
    font-size: 0.9rem;
    transform: rotate(-1.1deg);
  }

  .game-shape,
  .factions,
  .foundation {
    padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 7vw, 7rem);
  }

  .game-shape {
    display: grid;
    grid-template-columns: minmax(16rem, 1fr) minmax(20rem, 0.9fr);
    gap: clamp(3rem, 10vw, 10rem);
    color: #f7f0dc;
    background: #24342c;
  }

  .game-shape p:not(.section-label) {
    max-width: 44rem;
    color: #ccd5c9;
    font-size: 1.12rem;
    line-height: 1.6;
  }

  .game-shape .section-label {
    color: #d8bd7c;
  }

  .phases {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid #647166;
  }

  .phases li {
    display: flex;
    min-height: 58px;
    align-items: center;
    gap: 1.2rem;
    border-bottom: 1px solid #647166;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .phases span {
    color: #d8bd7c;
    font-family: ui-monospace, monospace;
    font-size: 0.85rem;
  }

  .factions {
    background: #e4d9be;
  }

  .faction-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 2.5rem;
  }

  .faction-grid article {
    min-height: 13rem;
    padding: 1.25rem;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--accent), white 40%), var(--accent));
    border: 1px solid color-mix(in srgb, var(--accent), black 30%);
    border-radius: 0.8rem;
    box-shadow: inset 0 0 0 4px rgb(255 255 255 / 16%);
  }

  .faction-grid article span {
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    background: rgb(255 255 255 / 60%);
    border-radius: 50%;
  }

  .faction-grid h3 {
    max-width: 8ch;
    margin-top: 4rem;
    font-size: clamp(1.6rem, 2.7vw, 2.6rem);
    line-height: 0.95;
  }

  .foundation {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: clamp(2rem, 8vw, 8rem);
    background: #f5eedb;
  }

  .metrics {
    align-self: end;
    border-top: 1px solid #9e9276;
  }

  .metrics p {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin: 0;
    padding: 1rem 0;
    border-bottom: 1px solid #9e9276;
  }

  .metrics strong {
    font-size: 1.3rem;
  }

  .foundation-copy {
    max-width: 48rem;
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.65;
  }

  footer {
    display: flex;
    min-height: 88px;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem clamp(1rem, 5vw, 5rem) calc(1rem + env(safe-area-inset-bottom));
    color: #dce5da;
    background: #17251f;
  }

  footer p {
    margin: 0;
  }

  @media (max-width: 860px) {
    .site-header {
      min-height: 64px;
    }

    .wordmark strong {
      position: absolute;
      overflow: hidden;
      width: 1px;
      height: 1px;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    nav {
      gap: 0;
    }

    .hero,
    .game-shape,
    .foundation {
      grid-template-columns: 1fr;
    }

    .hero {
      gap: 3.5rem;
      padding-top: 4rem;
    }

    .board-preview {
      transform: none;
    }

    .board-preview figcaption {
      transform: none;
    }

    .faction-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .faction-grid article {
      min-height: 10rem;
    }

    .faction-grid h3 {
      margin-top: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: clamp(3.5rem, 18vw, 5rem);
    }

    .hero {
      min-height: 0;
    }

    .facts div {
      flex: 1 1 6rem;
      min-width: 0;
    }

    .faction-grid {
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
    }

    .faction-grid article {
      min-height: 8.5rem;
      padding: 0.9rem;
    }

    .faction-grid article span {
      width: 1.8rem;
      height: 1.8rem;
    }

    .faction-grid h3 {
      margin-top: 2rem;
      font-size: 1.45rem;
    }

    footer {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }
  }
</style>
