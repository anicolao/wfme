<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { initializeFirebase } from '$lib/firebase';
  import { createEvent, type GameEventType } from '$lib/game/events';
  import { COMMANDERS } from '$lib/game/manifest';
  import {
    createGameRepository,
    gameRoomExists,
    normalizeRoomCode,
    randomRoomCode,
    waitForGameRoom
  } from '$lib/game/repository';
  import { currentPlayerUid, EMPTY_GAME, reduceGame, type GameState } from '$lib/game/reducer';
  import RealmBoard from './RealmBoard.svelte';

  let backendStatus: 'connecting' | 'ready' | 'syncing' | 'error' = 'connecting';
  let message = 'Connect to the realm, then create or join a room.';
  let displayName = '';
  let roomCodeInput = '';
  let roomCode = '';
  let seed = 'road-2';
  let activeUid = '';
  let game: GameState = structuredClone(EMPTY_GAME);
  let selectedCardId = '';
  let busy = false;
  let db: Awaited<ReturnType<typeof initializeFirebase>>['db'] | null = null;
  let repository: ReturnType<typeof createGameRepository> | null = null;
  let unsubscribe: (() => void) | null = null;

  $: localPlayer = game.players.find((player) => player.uid === activeUid) ?? null;
  $: currentUid = currentPlayerUid(game);
  $: allReady = game.players.length >= 3 && game.players.every((player) => player.ready);

  function attach(code: string) {
    if (!db || !activeUid) throw new Error('Firebase is not ready');
    unsubscribe?.();
    repository = createGameRepository(db, code, activeUid);
    unsubscribe = repository.subscribe(
      (events) => {
        game = reduceGame(events);
        backendStatus = 'ready';
        if (selectedCardId && !game.match?.players[activeUid]?.hand.some((card) => card.id === selectedCardId)) {
          selectedCardId = '';
        }
      },
      (error) => {
        backendStatus = 'error';
        message = `Room synchronization failed: ${error.message}`;
      }
    );
  }

  async function append(type: GameEventType, payload: Record<string, unknown>) {
    if (!repository) throw new Error('No room repository is attached');
    await repository.append(
      createEvent(type, activeUid, repository.nextSequence(), payload)
    );
  }

  async function createRoom() {
    if (!db || !displayName.trim()) {
      message = 'Enter a display name before creating a room.';
      return;
    }
    busy = true;
    backendStatus = 'syncing';
    try {
      const preferredCode = normalizeRoomCode(roomCodeInput);
      if (roomCodeInput.trim() && preferredCode.length !== 5) {
        backendStatus = 'ready';
        message = 'A private room code must contain exactly five letters or numbers.';
        return;
      }
      let code = preferredCode || randomRoomCode();
      if (preferredCode && await gameRoomExists(db, code)) {
        backendStatus = 'ready';
        message = 'That private room code is already in use.';
        return;
      }
      while (!preferredCode && await gameRoomExists(db, code)) code = randomRoomCode();
      roomCode = code;
      attach(code);
      await append('game/created', { roomCode: code, displayName: displayName.trim() });
      localStorage.setItem(`wfme:v2:${code}:${activeUid}:name`, displayName.trim());
      replaceState(`?room=${code}`, {});
      message = 'Room created. Invite two or three more players with this code.';
    } catch (error) {
      backendStatus = 'error';
      message = error instanceof Error ? error.message : 'Could not create the room.';
    } finally {
      busy = false;
    }
  }

  async function joinRoom() {
    const code = normalizeRoomCode(roomCodeInput);
    if (!db || !displayName.trim() || code.length !== 5) {
      message = 'Enter a display name and a five-character room code.';
      return;
    }
    busy = true;
    backendStatus = 'syncing';
    message = 'Finding the room…';
    try {
      if (!(await waitForGameRoom(db, code))) {
        backendStatus = 'ready';
        message = 'That room does not exist.';
        return;
      }
      roomCode = code;
      attach(code);
      await append('player/joined', { displayName: displayName.trim() });
      localStorage.setItem(`wfme:v2:${code}:${activeUid}:name`, displayName.trim());
      replaceState(`?room=${code}`, {});
      message = 'Joined. Choose a Commander identity and ready up.';
    } catch (error) {
      backendStatus = 'error';
      message = error instanceof Error ? error.message : 'Could not join the room.';
    } finally {
      busy = false;
    }
  }

  async function chooseCommander(commanderId: string) {
    busy = true;
    try {
      await append('player/commander-selected', { commanderId });
      message = 'Commander identity selected. Powers are not active in Tracer 1.';
    } finally {
      busy = false;
    }
  }

  async function toggleReady() {
    if (!localPlayer?.commander) return;
    busy = true;
    try {
      await append('player/ready', { ready: !localPlayer.ready });
    } finally {
      busy = false;
    }
  }

  async function startMatch() {
    busy = true;
    try {
      await append('match/started', { seed: seed.trim() });
      message = 'The seeded match has begun on the production board.';
    } finally {
      busy = false;
    }
  }

  async function placeAgent(spaceId: string, infiltrationPostId?: string) {
    if (!selectedCardId) return;
    busy = true;
    try {
      await append('agent/placed', { cardInstanceId: selectedCardId, spaceId, ...(infiltrationPostId ? { infiltrationPostId } : {}) });
      selectedCardId = '';
      message = 'Agent placement committed to the shared Chronicle.';
    } catch (error) {
      backendStatus = 'error';
      message = `Agent placement failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      busy = false;
    }
  }

  async function resolveChoice(choice: string) {
    busy = true;
    try {
      await append('choice/resolved', { choice });
      message = 'Council choice committed to the shared Chronicle.';
    } catch (error) {
      backendStatus = 'error';
      message = `Choice failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      busy = false;
    }
  }

  async function revealTurn() {
    busy = true;
    try {
      selectedCardId = '';
      await append('turn/revealed', {});
      message = 'Your remaining hand is face up for Muster and acquisition.';
    } finally {
      busy = false;
    }
  }

  async function acquireCard(definitionId: string, cardInstanceId?: string) {
    busy = true;
    try {
      await append('card/acquired', { definitionId, ...(cardInstanceId ? { cardInstanceId } : {}) });
      message = 'The acquired card enters your discard pile.';
    } finally {
      busy = false;
    }
  }

  async function finishReveal() {
    busy = true;
    try {
      await append('reveal/finished', {});
      message = 'Reveal complete. Journey and Muster cards enter the discard pile.';
    } finally {
      busy = false;
    }
  }

  async function placeScout(postId: string, recallPostId?: string) {
    busy = true;
    try {
      await append('scout/placed', { postId, ...(recallPostId ? { recallPostId } : {}) });
      message = 'Scout placement committed to the observation network.';
    } finally {
      busy = false;
    }
  }

  async function passBattle() {
    busy = true;
    try {
      await append('battle/passed', {});
      message = 'Battle decision committed to the shared Chronicle.';
    } finally {
      busy = false;
    }
  }

  async function passEndgame() {
    busy = true;
    try {
      await append('endgame/passed', {});
      message = 'Endgame pass committed to the shared Chronicle.';
    } finally {
      busy = false;
    }
  }

  async function playFate(cardInstanceId: string) {
    busy = true;
    try {
      await append('fate/played', { cardInstanceId });
      message = 'Combat Fate resolved in the shared Battle.';
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    roomCodeInput = normalizeRoomCode(new URLSearchParams(location.search).get('room') ?? '');
    void initializeFirebase()
      .then((services) => {
        db = services.db;
        activeUid = services.auth.currentUser?.uid ?? '';
        backendStatus = 'ready';
        if (roomCodeInput) {
          const savedName = localStorage.getItem(`wfme:v2:${roomCodeInput}:${activeUid}:name`);
          if (savedName) {
            displayName = savedName;
            roomCode = roomCodeInput;
            attach(roomCodeInput);
            message = 'Replaying the immutable room history…';
          }
        }
      })
      .catch((error) => {
        backendStatus = 'error';
        message = `Firebase unavailable: ${error instanceof Error ? error.message : String(error)}`;
      });
    return () => unsubscribe?.();
  });
</script>

<svelte:head>
  <title>Play — The War for Middle-earth</title>
  <meta name="description" content="Create or join a live War for Middle-earth construction match." />
</svelte:head>

<main class="game-shell">
  <div class="connection" data-testid="firebase-status" class:error={backendStatus === 'error'}>
    <span></span>
    {backendStatus === 'connecting' ? 'Connecting to Firebase…' : backendStatus === 'syncing' ? 'Synchronizing game…' : backendStatus === 'ready' ? 'Live Firebase ready' : 'Backend unavailable'}
  </div>

  {#if game.phase === 'playing' || game.phase === 'finished'}
    <RealmBoard
      {game}
      {busy}
      localUid={activeUid}
      {selectedCardId}
      onSelectCard={(cardId) => (selectedCardId = cardId)}
      onPlaceAgent={placeAgent}
      onResolveChoice={resolveChoice}
      onReveal={revealTurn}
      onAcquire={acquireCard}
      onFinishReveal={finishReveal}
      onPlaceScout={placeScout}
      onPassBattle={passBattle}
      onPassEndgame={passEndgame}
      onPlayFate={playFate}
    />
  {:else}
    <section class="lobby" aria-labelledby="lobby-title">
      <p class="eyebrow">Integrated construction game</p>
      <h1 id="lobby-title">Gather at the real table.</h1>
      <p class="lede">
        This preview grows one final capability at a time. Tracer 1 supports a real seeded room,
        production board, private decks, ordinary Agent actions, Reveal, acquisition, reshuffle, and Recall.
      </p>

      {#if !game.roomCode}
        <label for="display-name">Display name</label>
        <input id="display-name" bind:value={displayName} autocomplete="nickname" placeholder="Mara of Dale" />
        <div class="entry-actions">
          <button type="button" disabled={backendStatus !== 'ready' || busy} onclick={() => void createRoom()}>Create game</button>
          <div class="join">
            <label for="room-code">Room code <span>(optional when creating)</span></label>
            <input id="room-code" bind:value={roomCodeInput} maxlength="5" autocomplete="off" placeholder="RIVEN" />
            <button type="button" disabled={backendStatus !== 'ready' || busy} onclick={() => void joinRoom()}>Join game</button>
          </div>
        </div>
      {:else}
        <div class="room-meta">
          <div><span>Room code</span><strong data-testid="room-code">{game.roomCode}</strong></div>
          <div><span>Seats</span><strong>{game.players.length} / 4</strong></div>
          <div><span>Minimum</span><strong>3 players</strong></div>
        </div>

        <section aria-labelledby="players-title">
          <h2 id="players-title">Fellowship</h2>
          <div class="player-list">
            {#each game.players as player}
              <article class:local={player.uid === activeUid}>
                <strong>{player.displayName}</strong>
                <span>{COMMANDERS.find((commander) => commander.id === player.commander)?.name ?? 'Choosing Commander'}</span>
                <b>{player.ready ? 'Ready' : 'Not ready'}</b>
              </article>
            {/each}
          </div>
        </section>

        {#if localPlayer}
          <section aria-labelledby="commander-title">
            <div class="section-heading">
              <div><p class="eyebrow">Identity only</p><h2 id="commander-title">Choose your Commander</h2></div>
              <p>Commander powers are explicitly inactive in this tracer and will arrive as separate capabilities.</p>
            </div>
            <div class="commanders">
              {#each COMMANDERS as commander}
                {@const claimed = game.players.some((player) => player.uid !== activeUid && player.commander === commander.id)}
                <button
                  type="button"
                  class:selected={localPlayer.commander === commander.id}
                  disabled={claimed || busy}
                  aria-pressed={localPlayer.commander === commander.id}
                  onclick={() => void chooseCommander(commander.id)}
                >
                  <strong>{commander.name}</strong><span>{commander.epithet}</span>
                </button>
              {/each}
            </div>
            <button class="ready" type="button" disabled={!localPlayer.commander || busy} onclick={() => void toggleReady()}>
              {localPlayer.ready ? 'Withdraw readiness' : 'I am ready'}
            </button>
          </section>
        {/if}

        {#if game.hostUid === activeUid}
          <section class="start-panel" aria-labelledby="start-title">
            <div><h2 id="start-title">Commit the journey</h2><p>Three or four players must select unique identities and ready up.</p></div>
            <label for="match-seed">Match seed</label>
            <input id="match-seed" bind:value={seed} />
            <button type="button" disabled={!allReady || busy} onclick={() => void startMatch()}>Start seeded match</button>
          </section>
        {/if}
      {/if}

      <p class="message" role="status">{message}</p>
    </section>
  {/if}

  {#if game.phase === 'playing' || game.phase === 'finished'}
    <p class="message board-message" role="status">{message}</p>
  {/if}
  <footer>
    Room {roomCode || '—'} · {game.phase === 'finished' ? 'Final result recorded' : currentUid ? `Current actor ${game.players.find((player) => player.uid === currentUid)?.displayName}` : 'Lobby'} · Schema 2
    <span data-testid="replay-health" title={game.diagnostics.join(' | ')}> · {game.eventCount} accepted events · {game.diagnostics.length} replay diagnostics</span>
  </footer>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; min-width: 320px; color: #f7efd9; background: #14251d; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
  .game-shell { min-height: 100vh; padding: clamp(1rem, 4vw, 3rem); background: radial-gradient(circle at 85% 5%, #3f6248, transparent 35rem), #14251d; }
  .connection { display: flex; align-items: center; gap: .5rem; width: min(100%, 100rem); margin: 0 auto 1rem; font-weight: 700; }
  .connection span { width: .7rem; height: .7rem; background: #70c98b; border-radius: 50%; }
  .connection.error span { background: #e56e61; }
  .lobby { width: min(100%, 74rem); margin: 2vh auto; padding: clamp(1.2rem, 5vw, 4rem); color: #29291f; background: #f3e8ce; border-radius: 1rem; }
  .eyebrow { margin: 0 0 .4rem; color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
  h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; }
  h1 { max-width: 13ch; margin: 0; font-size: clamp(3rem, 9vw, 6.5rem); line-height: .86; }
  h2 { font-size: 2rem; }
  .lede { max-width: 48rem; font-size: 1.15rem; line-height: 1.5; }
  label { display: block; margin: .65rem 0 .3rem; font-weight: 700; }
  input { width: 100%; min-height: 50px; padding: .75rem; border: 2px solid #9d947e; border-radius: .45rem; font: inherit; }
  button { min-height: 50px; padding: .7rem 1rem; color: #fff; background: #6d452d; border: 0; border-radius: .45rem; font: 700 1rem inherit; cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .45; }
  .entry-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: end; margin-top: 1rem; }
  .entry-actions > button { width: 100%; }
  .join { display: grid; grid-template-columns: 1fr auto; gap: .5rem; }
  .join label { grid-column: 1 / -1; }
  .join button { background: #3f6049; }
  .room-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; margin: 2rem 0; }
  .room-meta div { padding: 1rem; background: #dfd2b6; border-radius: .5rem; }
  .room-meta span, .room-meta strong { display: block; }
  .room-meta span { color: #5d6258; }
  .player-list { display: grid; gap: .5rem; }
  .player-list article { display: grid; grid-template-columns: 1fr 1fr auto; gap: .7rem; padding: .8rem; background: #e2d6ba; border: 2px solid transparent; border-radius: .45rem; }
  .player-list article.local { border-color: #49624d; }
  .section-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: end; margin-top: 2rem; }
  .section-heading h2 { margin: 0; }
  .section-heading > p { max-width: 32rem; }
  .commanders { display: grid; grid-template-columns: repeat(4, 1fr); gap: .55rem; }
  .commanders button { display: flex; min-height: 5.2rem; flex-direction: column; text-align: left; background: #76553f; }
  .commanders button.selected { outline: 4px solid #3f6049; background: #49624d; }
  .commanders span { margin-top: .2rem; font-size: .8rem; font-weight: 400; }
  .ready { width: 100%; margin-top: .7rem; background: #3f6049; }
  .start-panel { display: grid; grid-template-columns: 1fr 1fr auto; gap: .7rem; align-items: end; margin-top: 1.5rem; padding: 1rem; background: #dfd2b6; border-radius: .6rem; }
  .start-panel h2, .start-panel p { margin: 0; }
  .message { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #c9bca0; font-weight: 700; }
  .board-message { width: min(100%, 100rem); margin-inline: auto; color: #f7efd9; border-color: #536c59; }
  footer { width: min(100%, 100rem); margin: 1.5rem auto 0; color: #b9c6b8; font-size: .82rem; }
  @media (max-width: 720px) {
    .entry-actions, .room-meta, .commanders, .start-panel { grid-template-columns: 1fr; }
    .join { grid-template-columns: 1fr; }
    .player-list article { grid-template-columns: 1fr auto; }
    .player-list article span { grid-column: 1 / -1; }
    .section-heading { display: block; }
  }
</style>
