# Integrated tracer-bullet implementation plan

> **Status: approved on 2026-08-02.** Implementation proceeds through coherent tracer commits and mandatory green gates.

## Objective

Replace the disconnected prototype screens with one production game that grows through integrated tracer-bullet features. Each tracer bullet must finish a real player capability from lobby gesture, through Firebase and deterministic rules, to the final board UI seen by the actor and other players.

The destination remains a responsive, installable implementation of *The War for Middle-earth* for three or four human players, followed by Rivals for one- and two-player games. A playable alpha must support an entire ordinary match from room creation to winner and rematch.

## Recommended reset

Keep the repository, rules documents, artwork, Nix environment, CI, GitHub Pages configuration, Firebase project, and repository secrets. Do not merge the existing gameplay branch.

After approval:

1. Close the current draft implementation PR as an unsuccessful prototype, preserving its history.
2. Create a fresh implementation branch from `main`.
3. Port only the Firebase initialization, emulator configuration, useful repository mechanics, security-rule tests, and deployment-secret wiring.
4. Do not port the demonstration routes, miniature per-feature state models, arbitrary `turn/action` reducer, or their E2E tests.
5. Keep README and the PR description explicit that the new preview is under construction until a complete match passes.

This reset is a delivery operation, not a tracer bullet and not evidence of gameplay progress.

## What qualifies as a tracer bullet

A tracer bullet is one finished player-facing capability in the eventual production game. It is not a rules library, manifest batch, component gallery, route demonstration, or button attached to placeholder state.

Every tracer bullet must:

- start at the real root lobby in a new browser context;
- continue into the same canonical game and final board component;
- introduce only the data and rules needed by that capability;
- express player intent as a versioned event using stable IDs;
- validate and resolve the event in the canonical deterministic reducer;
- update the actor and at least one observer through the Firebase stream;
- survive reload and replay from the immutable event history;
- expose pending choices and illegal actions accessibly;
- work at phone and desktop sizes;
- be driven in E2E by actual clicks, taps, or keyboard gestures;
- produce a semantic validation and screenshot after every gesture; and
- update the capability status only after the PR preview is manually exercised.

There is one production game route and one canonical state machine. Board, hand, market, Battle, faction tracks, player areas, choices, history, and scoring are parts of that game—not separate feature routes.

## Just-in-time game data

There is no up-front manifest or engine phase.

Data grows with player capabilities:

- A board space is added to the gameplay manifest only in the tracer bullet that makes every one of its costs, requirements, choices, and effects executable.
- A card definition is added only when players can place, Reveal, acquire, play, or otherwise use every field required by its current timing windows.
- A Commander identity may be offered before its powers are implemented when the construction ledger clearly says that the current roster is power-free. Each persistent or Ring power then arrives as its own tracer with reducer, UI, and E2E coverage. No power text is displayed as active before it works.
- A Fate, Battle, War Effort, or Rival definition is added with the feature that first makes it usable.
- Shared types and effect vocabulary are introduced from concrete examples in the current tracer, then generalized only when the next real feature proves generalization necessary.
- `reviewed: true` means the definition is executable, invariant-tested, integrated into the game UI, and traced through E2E. Names and copy counts alone never qualify.

The visual board may show the final geography from the first board tracer so that layout work is not discarded. A space whose rules have not been implemented is clearly marked unavailable in the construction preview and is absent from legal-action selectors. It never produces a placeholder result.

Every slice updates a coverage table mapping implemented rules paragraphs and catalog entries to reducer tests and E2E journeys. Unimplemented content remains explicit rather than represented by inert data.

## Canonical path grown by the tracers

The first tracer introduces only the smallest state and event path it needs. Later tracers extend the same path:

```text
root lobby
  -> live room
  -> seeded match
  -> final board and seat-safe player areas
  -> current player decision
  -> versioned intent event
  -> canonical reducer
  -> seat-safe views for every client
```

The reducer eventually projects the full phase sequence, but phases are added only when a tracer reaches them:

```text
lobby -> round start -> player turns -> Battle -> Riches -> Recall
      -> next round or Endgame -> finished -> rematch
```

No tracer may simulate reaching a phase with a query parameter or an “advance phase” control.

## Tracer sequence

### Tracer 1 — First real Agent turn

**Player capability:** Players create and join a real room, start a deterministic match, see the production board and their own hand, and resolve one genuine Agent placement whose complete result appears for every client.

This tracer introduces only:

- room, seat, readiness, seed, and match-start events;
- the minimum Commander identity roster required by the chosen player count, initially with the roster explicitly identified as power-free;
- the shared starting-card definitions needed for the deterministic opening hand;
- the first fully executable board-space family used by the journey;
- Agents, the resources, faction standing, Companies, and other pieces directly affected by that family;
- enough Battle-area state only if the selected final board effect actually deploys to the active Battle; and
- the exact event and reducer behavior for the chosen placement and its ordered choices.

The board is the production semantic HTML/SVG board, not a temporary form. Other final locations may appear geographically but remain explicitly unavailable until their own complete rules arrive.

**Acceptance journey:** At least three independent browser contexts create and join a room, select only fully supported Commanders, ready, start, select a real card, select a legal location on the board, resolve all resulting choices, converge on resources and pieces, reload, and converge again.

### Tracer 2 — Complete ordinary Agent placement

**Player capability:** Players can take every non-Battle ordinary Agent action supported by the base board economy.

Add board spaces in coherent rule families, not as an advance batch. Each family lands with its effects and UI:

1. faction access, standing movement, threshold rewards, favors, and Alliance ownership;
2. Council economy, Council seat, Secret Bargain, and Captain of the Host;
3. resource and card-draw spaces whose dependencies are already executable; and
4. optional payments, ordered effects, trash choices, Agent recall, and third-Agent timing.

Add card definitions only as their Journey and Muster boxes become supported by these actions. Commander powers may be added one at a time as separate tracers when their trigger becomes real. Fate cards may be represented as private physical instances when a space draws them, but a card is not declared playable or reviewed until its own Fate tracer implements its effect.

**Acceptance journeys:** Starting from the lobby, actors use actual hand cards on each implemented space family. Observers see occupancy, public payments, faction changes, recruitment, and choices without seeing private draws. Illegal costs, requirements, and occupied destinations remain disabled with a reason.

### Tracer 3 — Scouts and contested board access

**Player capability:** Players place Scouts, gather intelligence, infiltrate occupied spaces, and use Scout placement icons on the real observation network.

This tracer adds:

- the nine observation posts and their reviewed connections;
- Scout supplies and occupancy conservation;
- the card definitions that place or consume Scouts;
- Scout-specific legal-destination derivation and ordered recall choices; and
- final board overlays, touch targets, keyboard equivalents, and announcements for the network.

**Acceptance journey:** A player places a Scout, another Agent blocks a connected space, the player later recalls the Scout to infiltrate through a legal card, and every client converges after reload. A second path gathers intelligence without infiltration.

### Tracer 4 — Reveal and deck-building

**Player capability:** A player ends Agent play, Reveals the actual remaining hand, resolves Muster effects, and changes their deck by acquiring cards from the real market.

Only now add:

- complete Muster boxes for starting cards already in play;
- Reserve cards;
- Chronicle definitions in executable batches, with each batch's placement icons, Journey effects, Muster effects, costs, immediate effects, and choices implemented together;
- Chronicle deck, Row, refill, Influence, discard, draw, reshuffle, and trash zones; and
- Council Reveal bonuses and Commander abilities whose real trigger is now available.

The first batch must be large enough to operate the market correctly; later Chronicle batches are separate integrated content tracers, not names-only manifest commits.

**Acceptance journey:** Players take their real Agent turns, Reveal, resolve ordered Muster choices, make multiple legal purchases, trigger an acquisition effect, refill the Row, and later draw an acquired card after a genuine reshuffle. Card-instance conservation is asserted throughout.

### Tracer 5 — Turn rotation and an ordinary Battle

**Player capability:** All players complete their turns, pass through a real Combat Fate window, receive ranked Battle rewards, and finish an ordinary round.

This tracer adds only the Battle content used by executable play:

- active Battle setup and contested-location state;
- Battle board spaces and deployment rules;
- garrison, supply, current-turn recruits, Strength, swords, and pass order;
- Battle cards in executable batches with exact ranked rewards;
- Combat Fate cards in executable batches with their complete effects and targets;
- Standards, critical-location control, ties, cleanup, and Battle history; and
- Commander abilities triggered by deployment, Strength, Combat Fate, or Battle resolution.

**Acceptance journey:** From a real lobby and ordinary Agent/Reveal turns, at least three players deploy, Reveal swords, play or pass Combat Fate through the UI, resolve ties and ranked rewards, and agree on control and cleanup. Reload during the Fate window must restore the same authorized decision.

### Tracer 6 — Ents, Dam, Riches, and Recall

**Player capability:** Players use the complete Ent and Riches subsystem and advance from one finished round into the next.

Add the Fangorn, Deep Fangorn, Entwash, and Edoras definitions only here if their effects were not already executable. Add Ent-draught, summon legality, protected critical Battles, Dam breach, reward doubling, Riches accumulation, Recall, first-player rotation, redraw, and related Commander abilities.

**Acceptance journey:** A real match demonstrates a protected illegal summon, obtains Ent-draught, breaches the Dam through a legal effect, completes a legal doubled reward, accumulates Riches, recalls all pieces, and opens the next round with the correct player and hands.

### Tracer 7 — Complete match, Fate timings, and rematch

**Player capability:** Human players finish a complete base match and agree on the winner.

Add remaining base content only with its usable timing window:

- Plot Fate cards during Agent and Reveal turns;
- remaining Combat Fate cards during Battle;
- Endgame Fate cards at final scoring;
- remaining Battle and Chronicle batches required for a production-length match;
- any remaining Commander identities and powers, each already covered by its own tracer;
- ten-round exhaustion, 10-Renown trigger, final scoring, and tiebreaks; and
- finished-game history and rematch epoch.

**Acceptance journey:** Three ordinary browser clients play a deterministic production match from room creation to winner using only visible controls. The journey reloads during a pending choice, confirms hidden-information boundaries, verifies the same result in every client, and starts a clean rematch.

This is the first point where README and the landing page may call the build a playable alpha.

### Tracer 8 — War Efforts

**Player capability:** The host enables the optional module and players accept, replace, complete, and decline public War Efforts during ordinary play.

Add the War Effort row and definitions in executable batches with their triggers, payments, rewards, replacement behavior, and affected board-space variants. The disabled-module game must remain unchanged.

### Tracer 9 — Solo and two-player Rivals

**Player capability:** One or two humans complete the same production game with deterministic Rivals.

Add one complete Rival profile and the action cards it needs first. Later profiles are separate content tracers. Rival actions use the same legality and reducer paths as human actions rather than a parallel rules engine.

### Tracer 10 — Durable production game

**Player capability:** Long matches remain operable across connectivity, devices, and accessibility needs.

Add offline cache recovery, duplicate/conflicting event handling, version compatibility, keyboard-only play, screen-reader decision flow, reduced motion, phone landscape, tablet, board pan/zoom, performance budgets, and installability. Each reliability feature receives a real mid-match browser journey rather than a standalone status page.

## Content completion rule

The growing game may contain fewer available cards, spaces, Commanders, Battles, or modules than the final catalog, but every available item must be final and fully executable. The exact completion ledger lives in `IMPLEMENTATION_STATUS.md`; production game screens identify unavailable powers without exposing internal construction counters. Neither surface implies that an inert or names-only entry is supported.

Before playable alpha, the ledger must cover:

- all 22 destinations and nine observation posts;
- all ten starting-card instances;
- all Reserve cards and 54 Chronicle instances;
- all 30 Fate instances;
- all 16 Battle cards;
- all eight Commanders; and
- every base-game phase, choice, invariant, and end condition.

War Efforts and Rivals remain explicitly optional later tracers.

## Testing contract

### Reducer and manifest tests

Every tracer adds tests for its exact legal and illegal commands, effect ordering, deterministic replay, conservation, hidden-information selectors, and incompatibility behavior. Tests cover concrete feature data before shared abstractions are generalized.

### Browser tests

- Begin at `/` and use separate browser contexts with separate anonymous Firebase identities.
- Use the Auth and Firestore emulators locally and in CI.
- Configure deterministic seeds through the same host control available in the construction preview.
- Never navigate directly to an internal feature route.
- Never call reducers, repositories, Firebase, `page.evaluate`, or storage APIs to manufacture game state.
- Never use forced clicks or bypass disabled controls.
- Reach later states by performing earlier user gestures through reusable E2E player helpers.
- After every gesture, validate the actor and affected observers, then capture a screenshot.
- Generate a concise scenario README that lets a reviewer understand the behavior from validations and screenshots.

The complete-match helper may follow a deterministic strategy for speed, but every decision is still made through a real visible control.

### Delivery gates

The Nix environment remains the only supported toolchain boundary. Every commit and push runs the full local hooks. Linux verification/deployment and the separate macOS E2E workflow remain mandatory and cannot be skipped.

After each push, work may begin on the next commit while CI runs, but the next push waits for the previous push's checks to pass. Every completed tracer receives a manual test on its retained GitHub Pages preview before its status changes.

## Definition of done for one tracer

A tracer is complete only when:

1. its player capability is reachable from the lobby in the canonical game;
2. every data definition introduced by it is fully executable;
3. the reducer independently rejects illegal intent;
4. actor and observer clients converge;
5. reload and replay reproduce the same projection;
6. private state remains seat-safe in the ordinary UI;
7. phone and desktop E2E gestures, validations, screenshots, and README pass;
8. all previous tracer journeys remain green; and
9. a human has exercised the deployed PR preview.

## Definition of playable alpha

The alpha is complete only when three or four ordinary browser clients can create a room, select from the complete base content, finish a seeded match through every base-game phase, reconnect during a pending choice, agree on the winner, and start a rematch. The same build must remain operable at 393×852 and 1280×960 without rules-critical information hidden solely in artwork, color, hover, or another player's client.
