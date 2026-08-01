<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { initializeFirebase } from '$lib/firebase';
  import { createRoomRepository, roomExists } from '$lib/rooms/repository';
  import { COMMANDERS, createEvent, initialRoomState, normalizeRoomCode, randomRoomCode, reduceRoomEvents, type RoomEvent, type RoomState } from '$lib/rooms/replay';

  let displayName = '';
  let roomCodeInput = '';
  let roomCode = '';
  let activeUid = '';
  let activeState: RoomState | null = null;
  let activePlayer: RoomState['players'][number] | null = null;
  let message = 'Create a room or join one with a five-character code.';
  let backendStatus: 'connecting' | 'ready' | 'error' = 'connecting';
  let db: Awaited<ReturnType<typeof initializeFirebase>>['db'] | null = null;
  let repository: ReturnType<typeof createRoomRepository> | null = null;
  let unsubscribe: (() => void) | null = null;

  $: activePlayer = activeState?.players.find((player) => player.uid === activeUid) ?? null;

  function subscribe(code: string) {
    if (!db) throw new Error('Firebase is not ready');
    unsubscribe?.();
    repository = createRoomRepository(db, code, activeUid);
    unsubscribe = repository.subscribe((events) => {
      const hostUid = events.find((event) => event.type === 'game/created')?.actorUid ?? activeUid;
      activeState = reduceRoomEvents(initialRoomState(code, hostUid), events);
      backendStatus = 'ready';
    }, (error) => { backendStatus = 'error'; message = `Room sync failed: ${error.message}`; });
  }

  async function append(type: RoomEvent['type'], payload: RoomEvent['payload']) {
    if (!repository) return;
    await repository.append(createEvent(type, activeUid, repository.nextSequence(), payload));
  }

  async function createRoom() {
    if (!db || !displayName.trim()) { message = 'Enter a display name before creating a room.'; return; }
    backendStatus = 'connecting';
    let code = randomRoomCode();
    while (await roomExists(db, code)) code = randomRoomCode();
    roomCode = code;
    subscribe(code);
    await append('game/created', { roomCode: code });
    await append('player/joined', { uid: activeUid, displayName: displayName.trim() });
    replaceState(`?room=${code}`, {});
    message = 'Room created. Share the code with another player.';
  }

  async function joinRoom() {
    const code = normalizeRoomCode(roomCodeInput);
    if (!db || !displayName.trim() || code.length !== 5) { message = 'Enter a display name and a five-character room code.'; return; }
    backendStatus = 'connecting';
    if (!(await roomExists(db, code))) { backendStatus = 'ready'; message = 'That room does not exist yet.'; return; }
    roomCode = code;
    subscribe(code);
    await append('player/joined', { uid: activeUid, displayName: displayName.trim() });
    replaceState(`?room=${code}`, {});
    message = 'Joined. Choose a Commander and ready up.';
  }

  async function selectCommander(commander: string) { await append('player/commander-selected', { commander }); }
  async function toggleReady() { if (activePlayer?.commander) await append('player/ready', { ready: !activePlayer.ready }); }
  async function startGame() { await append('game/started', {}); }
  async function takeAction(action: string) { await append('turn/action', { action }); }

  onMount(() => {
    roomCodeInput = normalizeRoomCode(new URLSearchParams(location.search).get('room') ?? '');
    void initializeFirebase().then((services) => { db = services.db; activeUid = services.auth.currentUser?.uid ?? ''; backendStatus = 'ready'; }).catch((error) => { backendStatus = 'error'; message = `Firebase unavailable: ${error instanceof Error ? error.message : String(error)}`; });
    return () => unsubscribe?.();
  });
</script>

<svelte:head><title>Play — The War for Middle-earth</title><meta name="description" content="Create or join a live War for Middle-earth game." /></svelte:head>

<main class="lobby-shell"><section class="lobby-card" aria-labelledby="lobby-title">
  <div class="connection" data-testid="firebase-status" class:error={backendStatus === 'error'}><span></span>{backendStatus === 'connecting' ? 'Connecting to the realm…' : backendStatus === 'ready' ? 'Live multiplayer ready' : 'Backend unavailable'}</div>
  <p class="eyebrow">Live room · 2–4 players</p><h1 id="lobby-title">Gather your fellowship.</h1>
  {#if !activeState}
    <p class="lede">Create a room, share its code, choose Commanders, and take alternating actions on a synchronized table.</p>
    <label for="display-name">Display name</label><input id="display-name" bind:value={displayName} autocomplete="nickname" placeholder="Mara of Dale" />
    <div class="lobby-actions"><button type="button" disabled={backendStatus !== 'ready'} onclick={() => void createRoom()}>Create game</button><div class="join"><label for="room-code">Room code</label><input id="room-code" bind:value={roomCodeInput} maxlength="5" autocomplete="off" placeholder="RIVEN" /><button type="button" class="secondary" disabled={backendStatus !== 'ready'} onclick={() => void joinRoom()}>Join game</button></div></div>
  {:else}
    <div class="room-meta"><div><span>Room code</span><strong data-testid="room-code">{roomCode}</strong></div><div><span>Round</span><strong>{activeState.round}</strong></div><div><span>Players</span><strong>{activeState.players.length}/4</strong></div></div>
    <section aria-labelledby="players-title"><h2 id="players-title">Players</h2>{#each activeState.players as player}<article class="player"><div><strong>{player.displayName}</strong><span>{player.commander ?? 'Choosing Commander'}</span></div><b>{player.ready ? 'Ready' : 'Not ready'}</b></article>{/each}</section>
    {#if activeState.phase !== 'playing' && activePlayer}
      <h2>Choose your Commander</h2><div class="commanders">{#each COMMANDERS as commander}<button type="button" class:selected={activePlayer.commander === commander.id} aria-pressed={activePlayer.commander === commander.id} onclick={() => void selectCommander(commander.id)}><strong>{commander.name}</strong><span>{commander.epithet}</span></button>{/each}</div>
      <button type="button" class="ready" disabled={!activePlayer.commander} onclick={() => void toggleReady()}>{activePlayer.ready ? 'Withdraw readiness' : 'I am ready'}</button>
      {#if activeState.phase === 'ready' && activeState.hostUid === activeUid}<button type="button" class="start" onclick={() => void startGame()}>Start game</button>{/if}
    {:else if activeState.phase === 'playing'}
      {@const current = activeState.players[activeState.turnIndex]}
      <section class="table" aria-labelledby="turn-title"><p class="eyebrow">Round {activeState.round}</p><h2 id="turn-title">{current?.displayName}'s turn</h2><p>Choose one action. The live event stream advances to the next player on every legal move.</p><div class="turn-actions"><button disabled={current?.uid !== activeUid} onclick={() => void takeAction('Travel to Edoras')}>Travel to Edoras</button><button disabled={current?.uid !== activeUid} onclick={() => void takeAction('Muster at Minas Tirith')}>Muster at Minas Tirith</button><button disabled={current?.uid !== activeUid} onclick={() => void takeAction('Seek counsel in Rivendell')}>Seek counsel</button></div><ol data-testid="action-log">{#each activeState.actionLog.slice(-8) as action}<li>{action}</li>{/each}</ol></section>
    {/if}
  {/if}
  <p class="message" role="status">{message}</p>
</section></main>

<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;min-width:320px;background:#17251f;color:#f6efda;font-family:'Atkinson Hyperlegible',system-ui,sans-serif}.lobby-shell{min-height:100vh;padding:clamp(1rem,5vw,4rem);background:radial-gradient(circle at 80% 5%,#45634b,transparent 34rem),#17251f}.lobby-card{width:min(100%,68rem);margin:0 auto;padding:clamp(1.25rem,5vw,4rem);color:#20261f;background:#f6efda;border-radius:1.2rem}.connection{display:flex;align-items:center;gap:.5rem;color:#365444;font-weight:700}.connection span{width:.7rem;height:.7rem;background:#3d8258;border-radius:50%}.connection.error{color:#8b3029}.connection.error span{background:#8b3029}.eyebrow{color:#6d452d;font-weight:700;letter-spacing:.13em;text-transform:uppercase}h1,h2{font-family:'Cormorant Garamond',Georgia,serif}h1{margin:.4rem 0;font-size:clamp(3rem,9vw,6.5rem);line-height:.85}.lede{max-width:42rem;font-size:1.2rem;line-height:1.5}label{display:block;margin:.6rem 0 .3rem;font-weight:700}input{width:100%;min-height:50px;padding:.8rem;border:2px solid #a8a189;border-radius:.45rem;font:inherit}button{min-height:50px;padding:.75rem 1rem;color:#fff;background:#6d452d;border:0;border-radius:.45rem;font:700 1rem inherit;cursor:pointer}button:disabled{cursor:not-allowed;opacity:.45}.lobby-actions{display:grid;grid-template-columns:1fr 2fr;align-items:end;gap:1rem;margin-top:1rem}.join{display:grid;grid-template-columns:1fr auto;gap:.5rem}.join label{grid-column:1/-1}.secondary{background:#365444}.room-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;margin:2rem 0}.room-meta div,.player,.table{padding:1rem;background:#e7ddc5;border-radius:.5rem}.room-meta span,.player span{display:block;color:#5a6258}.player{display:flex;justify-content:space-between;align-items:center;margin:.5rem 0}.commanders{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem}.commanders button{display:flex;flex-direction:column;text-align:left;background:#70533e}.commanders button.selected{outline:4px solid #365444}.ready,.start{width:100%;margin-top:.7rem}.start{background:#365444}.table{margin-top:2rem}.turn-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}.table ol{padding-left:1.4rem}.message{margin-top:2rem;padding-top:1rem;border-top:1px solid #cfc4aa;font-weight:700}@media(max-width:650px){.lobby-actions,.room-meta,.commanders,.turn-actions{grid-template-columns:1fr}.join{grid-template-columns:1fr}.player{align-items:flex-start}.lobby-card{padding:1.2rem}}
</style>
