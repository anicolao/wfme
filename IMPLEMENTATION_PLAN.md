# Responsive web implementation plan

## Objective

Deliver *The War for Middle-earth* as an installable, responsive browser game for one to four players. Build it as a sequence of playable vertical slices: every slice begins with a real browser action, crosses the production UI and deterministic rules projection, and ends in a user-visible result covered by automated tests.

The sibling Jaipur and RoboRally projects establish the working model: static SvelteKit, immutable multiplayer events, seeded replay, pure rules, Firebase emulators, Vitest, Playwright, retained preview deployments, and explicit phone/desktop acceptance criteria. This plan adapts that model to a longer, partially hidden-information strategy game.

## PR1 scope

PR1 establishes only the delivery contract:

- static SvelteKit 5 and strict TypeScript;
- Nix flake and locked inputs for the repeatable system toolchain, with Bun package lock for JavaScript dependencies;
- an accessible responsive landing/game-shell composition;
- installable web-app metadata;
- deterministic design constants derived from the rules documents;
- Vitest coverage for the constants;
- Playwright browser proof at phone and desktop widths;
- CI for checks, unit tests, E2E, and production build;
- the architecture and E2E strategy documents.

PR1 does not pretend to implement multiplayer or game rules. The next slice must connect the first visible interaction to the actual event and reducer architecture.

## Non-negotiable change contract

After PR1, every gameplay change must contain:

1. one smallest coherent player-facing capability;
2. stable IDs and manifest changes required by that capability;
3. event-schema and deterministic reducer behavior;
4. pure legality, conservation, and replay tests;
5. accessible UI for every new state and pending choice;
6. a Playwright tracer proving the actor and at least one observer converge;
7. phone and desktop layout proof, with tablet/landscape coverage for milestone scenarios;
8. documentation changes for rules, protocol, security, or invariants.

Do not land a disconnected rules library, UI backed only by mocks, or multiplayer code without a browser path. Refactors preserve the complete E2E suite. Observable changes require semantic assertion updates and reviewed screenshot changes.

The repository verification contract is:

```sh
nix develop --command bun install --frozen-lockfile
nix develop --command bun run verify:change
```

`verify:change` runs Svelte checks, unit tests, Playwright, production build, and whitespace checks. Firebase Rules tests join the contract in slice 2.

## Fixed technical decisions

- Nix flakes with a checked-in `flake.lock` provide the reproducible system toolchain; Bun inside that shell owns JavaScript dependency installation through `bun.lock`.
- SvelteKit 5, TypeScript, Vite, Bun, and `@sveltejs/adapter-static`.
- Firebase anonymous Authentication and Cloud Firestore once rooms arrive.
- One canonical append-only event stream at `games/{gameId}/events/{eventId}`.
- A pure, deterministic reducer projects the complete game from versioned manifests, a committed seed, and ordered events.
- Persisted payloads use stable IDs, never card titles or localized display text.
- Both clients may read the trusted-client stream; selectors prevent the ordinary UI from exposing opponent hands, Fate cards, deck order, and unrevealed choices.
- Security Rules provide authentication, attribution, append-only history, and path isolation—not server-authoritative move validation.
- Rules-critical meaning is represented in semantic data and accessible labels, never only in raster art, position, or color.
- GitHub Pages hosts production and retained pull-request previews.

## Source-data gates

Implementation uses reviewed manifests rather than prose parsing.

| Manifest | Gate |
| --- | --- |
| Board | All 22 destinations, costs, requirements, effects, categories, critical-location tags, and nine observation-post connections match `RULES.md` and `BOARD_LAYOUT.md`. |
| Starting deck | Ten stable card instances per player match `CARD_CATALOG.md`. |
| Chronicle | 27 definitions and two stable instances each; every icon and Journey/Muster effect reviewed. |
| Fate | Thirty stable instances with timing, targets, costs, and duration. |
| Battles | Sixteen definitions, age, Standard, critical-location icon, and ranked rewards. |
| Commanders | Eight persistent and Ring abilities with exact timing windows. |
| Rivals | Four profiles and twenty-two action cards with deterministic choice rules. |

Each manifest has `manifestVersion`, provenance, review state, and an invariant test for counts and unique IDs. A match records every referenced version and refuses incompatible replay instead of substituting current data.

## State machine

The reducer projects one phase:

```text
lobby
  -> round-start
  -> player-turns
       -> agent-turn
       -> reveal-started / reveal-acquisitions / reveal-complete
  -> combat-fate-window
  -> battle-rewards
  -> riches
  -> recall
  -> next-round or endgame-fate-window
  -> finished
```

`player-turns` maintains a clockwise active seat while skipping players who have Revealed. A pending choice records its ID, authorized actor, source, legal options, and deterministic default if one exists. Automatic consequences advance until the next genuine player decision.

## Initial event vocabulary

Events record player intent, not redundant results:

| Event | Purpose |
| --- | --- |
| `game/created` | Establish room, host, protocol versions, options, and game ID. |
| `player/joined` | Claim a seat and Commander. |
| `player/ready` | Confirm readiness for the current configuration. |
| `match/started` | Commit setup seed, player order, manifests, and modules. |
| `agent/placed` | Identify Agent, played card, destination, Scout use, ordered choices, and deployment. |
| `reveal/started` | Commit the remaining hand to its Muster boxes. |
| `reveal/card-acquired` | Purchase one identified row or Reserve card with the projected Influence pool. |
| `reveal/completed` | End acquisitions and lock projected Battle Strength. |
| `fate/played` | Play one identified Plot, Combat, or Endgame Fate card with targets and choices. |
| `battle/passed` | Pass in the current Combat Fate window. |
| `effect/chosen` | Answer one reducer-projected finite choice. |
| `game/rematched` | Start a new match epoch with the same room members. |

Faction movement, recruitment, resource changes, shuffles, market refill, ranked rewards, Standards, Riches, recall, and the end condition derive from replay. They are not separate events that could contradict their cause.

Every envelope includes `type`, `payload`, `actorUid`, `clientSeq`, `createdAt`, `schemaVersion`, and `reducerVersion`. IDs use `{actorUid}-{zero-padded clientSeq}` for retry idempotence. Canonical ordering uses server timestamp and document ID as a deterministic tie-break.

## Implementation sequence

### 1. Responsive shell, tests, and CI

**Status:** PR1.

- Build the static shell, local typography, board preview, project status, PWA manifest, and production base-path support.
- Add the Nix-first development shell, locked Nix inputs, Husky hooks, and CI commands that install and verify through `nix develop`.
- Add design-constant tests and phone/desktop Playwright coverage.
- Add CI and a production build artifact.

### 2. Identity, rooms, immutable replay

- Add Firebase anonymous identity and emulator configuration.
- Implement five-letter room codes, 1–4 human seats, display names, Commander selection, modules, and readiness.
- Add event repository, envelope validation, idempotent append, deterministic ordering, diagnostics, and IndexedDB/local replay cache.
- Add Firestore Rules tests for authenticated reads, own-UID creates, immutable events, and denial of unrelated paths.
- E2E `002-create-join-and-replay-room`: separate contexts create, join, reload, and converge.

### 3. Reviewed manifests and deterministic setup

- Implement all component manifests and a versioned PRNG.
- Derive player order, objectives, Battle stack, Chronicle Row, shuffled personal decks, starting hands, supplies, and Rivals from one seed.
- Enforce card, cube, Agent, Banner, Scout, and token conservation.
- Expose full-state test selectors and trustworthy per-seat views.
- E2E `003-seeded-setup-and-private-views`: exact public setup while opponent hands and Fate remain hidden in ordinary UI.

### 4. Agent placement and board blocking

- Derive legal destinations from hand icons, requirements, costs, occupancy, and Scout geometry.
- Resolve board/Journey order, optional conversions, faction standing, recruitment, and deployment atomically.
- Implement Scout placement, infiltration, intelligence draw, and Scout placement icon.
- E2E `004-agent-placement-and-scouts`: actor and observer see exact occupancy and resources; blocked/infiltrated paths remain accessible.

### 5. Reveal and deck-building

- Implement Reveal timing, Muster effects, Council Influence, purchases, Reserve cards, immediate acquisition effects, row refill, discard, reshuffle, and trash.
- Preserve exact card-instance conservation across all zones.
- E2E `005-reveal-acquire-and-reshuffle`: multiple acquisitions and a deterministic refill/reshuffle.

### 6. Factions and permanent upgrades

- Implement standing 2 Renown, standing 4 favors, Alliance transfer, Council seat, and Captain of the Host.
- Resolve simultaneous threshold changes in deterministic turn order.
- E2E `006-factions-council-and-captain`: Alliance changes hands and a third Agent becomes usable.

### 7. Deployment and ordinary Battle

- Implement battle-space deployment, current-turn recruits, garrison limit, Reveal swords, Strength, Combat Fate passes, ties, ranked rewards, Standards, control, and cleanup.
- E2E `007-battle-fate-rewards-and-control`: a complete ordinary battle with actor/observer convergence.

### 8. Ents and the Dam

- Add Ent-draught, Ent summoning, protected battles, Dam breach, reward doubling, and all exclusions.
- E2E `008-ents-dam-and-doubled-reward`: prove both an illegal protected summon and a legal post-breach doubled reward.

### 9. Complete round and Endgame

- Add Riches accumulation, Recall, first-player rotation, ten-round exhaustion, 10-Renown trigger, Endgame Fate, and tiebreaks.
- E2E `009-complete-match`: play a short seeded fixture through terminal scoring and rematch.

### 10. War Effort module

- Add public row, one-active limit, completion triggers, payments, and rewards.
- E2E `010-war-efforts`: accept, replace, complete, and decline contracts without hidden state drift.

### 11. Solo and two-player Rivals

- Implement Rival profiles, shared action deck, choice precedence, Captain rounds, escalation, rewards, and difficulty settings.
- E2E `011-rivals`: a solo game and two-player shared Rival reach deterministic terminal states.

### 12. Reconnect, conflicts, and compatibility

- Resume from cache and immutable stream after offline use.
- Reject duplicate, unauthorized, stale, and incompatible events without partial mutation.
- Display conflicts and protocol mismatch accessibly.
- E2E `012-reconnect-conflicts-and-versioning`: disconnect during a pending choice, reconnect, and replay the identical projection.

### 13. Responsive, accessible complete game

- Exercise a complete production game at phone portrait, phone landscape, tablet, and desktop viewports.
- Prove keyboard-only interaction, touch targets, focus restoration, reduced motion, text alternatives, zoom/pan, no horizontal overflow, and no hidden required hover.
- E2E `013-responsive-accessible-complete-game` becomes the release gate.

## Definition of playable alpha

The alpha is complete only when four ordinary browser clients can create a room, finish a seeded match with all core systems, reconnect from the immutable stream, and agree on the winner; the same build must complete solo play with Rivals. Every state must remain operable on a 393×852 phone and a 1280×960 desktop without rules knowledge hidden in imagery.
