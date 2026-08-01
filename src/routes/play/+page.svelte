<script lang="ts">
  import { onMount } from 'svelte';
  import { assets } from '$app/paths';
  import {
    COMMANDERS,
    createEvent,
    initialRoomState,
    normalizeRoomCode,
    randomRoomCode,
    reduceRoomEvents,
    type RoomEvent,
    type RoomState
  } from '$lib/rooms/replay';

  let displayName = '';
  let roomCodeInput = '';
  let roomCode = '';
  let activeUid = '';
  let activeState: RoomState | null = null;
  let events: RoomEvent[] = [];
  let message = 'Create a room or join one with a five-letter code.';
  let activePlayer: RoomState['players'][number] | null = null;
  let channel: BroadcastChannel | null = null;
  let clientSeq = 0;

  $: activePlayer = activeState?.players.find((player) => player.uid === activeUid) ?? null;

  function storageKey(code: string) {
    return `wfme-room-${code}`;
  }

  function readEvents(code: string): RoomEvent[] {
    try {
      return JSON.parse(localStorage.getItem(storageKey(code)) ?? '[]') as RoomEvent[];
    } catch {
      return [];
    }
  }

  function publish(event: RoomEvent) {
    events = [...events, event];
    localStorage.setItem(storageKey(roomCode), JSON.stringify(events));
    channel?.postMessage(event);
    activeState = reduceRoomEvents(initialRoomState(roomCode, events[0]?.actorUid ?? activeUid), events);
  }

  function enterRoom(code: string, uid: string, name: string, create = false) {
    roomCode = normalizeRoomCode(code);
    activeUid = uid;
    events = readEvents(roomCode);
    activeState = reduceRoomEvents(initialRoomState(roomCode, events[0]?.actorUid ?? uid), events);
    clientSeq = events.filter((event) => event.actorUid === uid).length;
    channel?.close();
    channel = new BroadcastChannel(`wfme-room-${roomCode}`);
    channel.onmessage = (incoming) => {
      const event = incoming.data as RoomEvent;
      if (!events.some((candidate) => candidate.id === event.id)) {
        events = [...events, event];
        localStorage.setItem(storageKey(roomCode), JSON.stringify(events));
        activeState = reduceRoomEvents(initialRoomState(roomCode, events[0]?.actorUid ?? activeUid), events);
      }
    };
    if (create) publish(createEvent('game/created', uid, ++clientSeq, { roomCode }));
    if (!activeState.players.some((player) => player.uid === uid)) {
      publish(createEvent('player/joined', uid, ++clientSeq, { uid, displayName: name }));
    }
    message = create ? 'Room created. Share the code with your fellowship.' : 'You joined the room.';
  }

  function createRoom() {
    const name = displayName.trim();
    if (!name) {
      message = 'Enter a display name before creating a room.';
      return;
    }
    enterRoom(randomRoomCode(), `player-${crypto.randomUUID()}`, name, true);
  }

  function joinRoom() {
    const name = displayName.trim();
    const code = normalizeRoomCode(roomCodeInput);
    if (!name || code.length !== 5) {
      message = 'Enter a display name and a five-letter room code.';
      return;
    }
    enterRoom(code, `player-${crypto.randomUUID()}`, name);
  }

  function selectCommander(commander: string) {
    if (!activePlayer || !roomCode) return;
    publish(createEvent('player/commander-selected', activeUid, ++clientSeq, { commander }));
    message = 'Commander selected. Ready when your plan is set.';
  }

  function toggleReady() {
    if (!activePlayer?.commander) {
      message = 'Choose a Commander before readying up.';
      return;
    }
    publish(createEvent('player/ready', activeUid, ++clientSeq, { ready: !activePlayer.ready }));
    message = activePlayer.ready ? 'Readiness withdrawn.' : 'Readiness confirmed.';
  }

  onMount(() => () => channel?.close());
</script>

<svelte:head>
  <title>Fellowship room — The War for Middle-earth</title>
  <meta name="description" content="Create or join a War for Middle-earth room." />
</svelte:head>

<main class="room-shell">
  <a class="back-link" href={`${assets}/`}>← Return to the campaign</a>
  <section class="room-card" aria-labelledby="room-title">
    <p class="eyebrow">Identity · rooms · replay</p>
    <h1 id="room-title">Gather your fellowship.</h1>
    <p class="lede">A room is an append-only story. Every name, Commander, and readiness choice is replayable.</p>

    {#if !activeState}
      <form class="room-form" on:submit|preventDefault={createRoom}>
        <label for="display-name">Display name</label>
        <input id="display-name" bind:value={displayName} autocomplete="nickname" placeholder="Mara of Dale" />
        <div class="form-actions">
          <button type="submit">Create a room</button>
          <span aria-hidden="true">or</span>
          <div class="join-fields">
            <label for="room-code">Room code</label>
            <input id="room-code" bind:value={roomCodeInput} maxlength="5" autocomplete="off" placeholder="RIVEN" />
            <button type="button" class="secondary" on:click={joinRoom}>Join room</button>
          </div>
        </div>
      </form>
    {:else}
      <div class="room-meta" aria-label="Room details">
        <div><span>Room code</span><strong data-testid="room-code">{roomCode}</strong></div>
        <div><span>Events replayed</span><strong data-testid="event-count">{activeState.eventCount}</strong></div>
        <div><span>Seats</span><strong>{activeState.players.length}/4</strong></div>
      </div>

      <section class="players" aria-labelledby="players-title">
        <h2 id="players-title">Fellowship</h2>
        {#each activeState.players as player}
          <article class:you={player.uid === activeUid} class="player-row">
            <div><strong>{player.displayName}</strong><span>Seat {player.seat}{player.uid === activeUid ? ' · You' : ''}</span></div>
            <span class:ready={player.ready} class="player-status">{player.ready ? 'Ready' : player.commander ?? 'Choosing'}</span>
          </article>
        {/each}
      </section>

      {#if activePlayer}
        <section class="commander-picker" aria-labelledby="commander-title">
          <h2 id="commander-title">Choose your Commander</h2>
          <div class="commander-grid">
            {#each COMMANDERS as commander}
              <button
                type="button"
                class:selected={activePlayer.commander === commander.id}
                aria-pressed={activePlayer.commander === commander.id}
                on:click={() => selectCommander(commander.id)}
              >
                <strong>{commander.name}</strong><span>{commander.epithet}</span>
              </button>
            {/each}
          </div>
          <button class="ready-button" type="button" on:click={toggleReady} disabled={!activePlayer.commander}>
            {activePlayer.ready ? 'Withdraw readiness' : 'I am ready'}
          </button>
        </section>
      {/if}
    {/if}

    <p class="message" role="status" data-testid="room-message">{message}</p>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; min-width: 320px; color: #f6efda; background: #17251f; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
  .room-shell { min-height: 100vh; padding: clamp(1rem, 4vw, 4rem); background: radial-gradient(circle at 85% 8%, #3f5c45, transparent 35rem), #17251f; }
  .back-link { display: inline-flex; min-height: 44px; align-items: center; color: #d7c394; }
  .room-card { width: min(100%, 62rem); margin: clamp(2rem, 8vh, 7rem) auto; padding: clamp(1.25rem, 5vw, 4rem); background: #f6efda; color: #20261f; border: 1px solid #d7c394; border-radius: 1.2rem; box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 25%); }
  .eyebrow { color: #6d452d; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
  h1, h2 { font-family: 'Cormorant Garamond', Georgia, serif; }
  h1 { margin: 0 0 1rem; font-size: clamp(3rem, 8vw, 6rem); line-height: .85; }
  h2 { margin: 0 0 1rem; font-size: clamp(1.8rem, 4vw, 2.8rem); }
  .lede { max-width: 42rem; font-size: 1.2rem; line-height: 1.5; }
  .room-form, .commander-picker, .players { margin-top: 2rem; }
  label { display: block; margin: .4rem 0; font-weight: 700; }
  input { width: 100%; min-height: 48px; padding: .65rem .8rem; border: 2px solid #a8a189; border-radius: .45rem; font: inherit; }
  .form-actions, .join-fields { display: flex; align-items: end; gap: .8rem; }
  .form-actions { margin-top: 1rem; flex-wrap: wrap; }
  .join-fields { flex: 1 1 18rem; flex-wrap: wrap; }
  .join-fields label { flex-basis: 100%; }
  button { min-height: 48px; padding: .7rem 1rem; color: #f6efda; background: #6d452d; border: 0; border-radius: .45rem; font: 700 1rem inherit; cursor: pointer; }
  button:hover, button:focus-visible { background: #4e3021; }
  button.secondary { background: #365444; }
  button:disabled { cursor: not-allowed; opacity: .5; }
  .room-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: .7rem; margin: 2rem 0; }
  .room-meta div { padding: 1rem; background: #e7ddc5; border-radius: .5rem; }
  .room-meta span, .player-row span, .commander-grid span { display: block; color: #5a6258; font-size: .9rem; }
  .room-meta strong { display: block; margin-top: .25rem; font-size: 1.4rem; letter-spacing: .08em; }
  .player-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .8rem 1rem; border-bottom: 1px solid #d6ccb3; }
  .player-row.you { background: #e7ddc5; border-radius: .4rem; }
  .player-status { padding: .3rem .55rem; border-radius: 1rem; background: #d6ccb3; }
  .player-status.ready { color: #f6efda; background: #365444; }
  .commander-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .7rem; }
  .commander-grid button { display: block; text-align: left; color: #20261f; background: #e7ddc5; border: 2px solid transparent; }
  .commander-grid button.selected { border-color: #6d452d; background: #d7c394; }
  .commander-grid button span { margin-top: .2rem; }
  .ready-button { width: 100%; margin-top: 1rem; background: #365444; }
  .message { margin: 2rem 0 0; padding-top: 1rem; border-top: 1px solid #d6ccb3; font-weight: 700; }
  @media (max-width: 620px) { .room-meta { grid-template-columns: 1fr; } .form-actions { align-items: stretch; } .form-actions > button { flex: 1 1 100%; } .form-actions > span { width: 100%; text-align: center; } .commander-grid { grid-template-columns: 1fr; } }
</style>
