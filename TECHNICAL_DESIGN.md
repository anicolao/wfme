# Technical design

## Architecture

The application separates deterministic game truth from transport and presentation:

```text
Svelte views and accessible controls
            ↓ intents
application commands and selectors
            ↓ append
event repository → Firestore immutable stream
            ↓ ordered replay
pure reducer + versioned manifests + seeded PRNG
            ↓
full state → seat-safe view models → Svelte views
```

No Svelte component decides game legality. No Firestore snapshot is itself game state. The complete projection must be reproducible in a headless Vitest process from an ordered event array.

## Environment reproducibility

The repository's environment boundary is Nix, not the developer's ambient Node, Bun, browser, or shell installation. `flake.nix` declares the system tools and `flake.lock` pins their Nix inputs. `bun.lock` pins the JavaScript package graph inside that shell. CI and Git hooks use `nix develop --command`; local interactive work may enter `nix develop` once and run the same Bun commands from inside it.

## Repository layout

```text
src/
  lib/
    game/          manifests, types, PRNG, legality, reducer, selectors
    events/        schemas, ordering, diagnostics, repository
    components/    semantic board, cards, player areas, dialogs
    accessibility/ focus, announcements, reduced-motion helpers
  routes/          shell and room URL handling
tests/
  e2e/             numbered browser scenarios and generated walkthroughs
  rules/           Firestore Security Rules tests
static/            installable metadata and original static assets
```

PR1 contains only the shell and the first `game` constants. Later slices should preserve this boundary rather than expanding one route component into the rules engine.

## Deterministic state

### Stable IDs

Definitions use IDs such as `space/minas-tirith`, `card/chronicle/rider-of-rohan`, and `commander/aragorn`. Physical instances append stable suffixes, for example `p2-start-armed-escort-1` or `chronicle-rider-of-rohan-2`.

State references IDs, integer resource counts, explicit seat indices, and enums. Display names, translated prose, image paths, and CSS classes never enter persisted events.

### Card zones

Each deck card instance exists in exactly one zone:

```text
personal draw deck
personal hand
Journey play area
Muster row
personal discard
trash
Chronicle draw deck
Chronicle row
Reserve stack
```

Fate, Battle, Objective, and War Effort cards have separate typed zone invariants. Every accepted event must preserve total counts and uniqueness.

### Pieces and resources

Each Agent is on its Commander, beside the board as locked, or at one board destination. Each Company is in supply, garrison, or Battle. Each Scout is in supply or at one observation post. Banners, faction markers, Ents, permanent tokens, and public resources have similarly exhaustive locations.

## Command validation

The UI asks selectors for legal commands and explanations. The reducer validates again during replay. A command payload includes every genuine choice needed to resolve atomically, such as board/Journey ordering, optional payment, Scout recall, and exact deployed Company IDs.

Invalid events add a deterministic diagnostic and leave game state byte-for-byte unchanged. A valid event never partially applies. Concurrent valid-looking events are ordered canonically; only the first still legal event applies.

## Hidden information and trust

Hands, Fate cards, deck order, and unrevealed choices are hidden in the normal interface but readable from the trusted-client Firestore stream. The lobby and README must disclose that boundary. Security Rules cannot make a client-held shuffle seed secret.

Seat-safe selectors expose:

- the local player's exact hand and Fate cards;
- opponent hand/Fate counts only;
- public board, resources, faction standing, garrisons, supplies, and discard piles;
- public action history without hidden payload fields.

If adversarial secrecy becomes a product requirement, migrate shuffle, draw, and action validation to an authoritative service. Do not imply that obfuscating JSON is security.

## Firestore model

The canonical path is:

```text
games/{gameId}/events/{eventId}
```

Security Rules allow authenticated reads and create-only writes where `actorUid` equals the authenticated UID and the envelope shape is valid. Update, delete, collection writes elsewhere, and actor impersonation are denied. Rules do not attempt to validate board legality.

Clients subscribe, normalize unresolved server timestamps, order events deterministically, and replay from the last locally cached prefix. Event IDs make retries idempotent. Cache keys include game ID, schema version, reducer version, and manifest versions.

## Responsive interaction model

The tabletop is too information-dense to shrink uniformly. Layout changes by available width:

- **Phone portrait:** current decision and hand form the primary column; the board is a pan/zoom region with a “fit legal spaces” command; opponents and logs collapse into named disclosures.
- **Phone landscape:** board and decision tray split horizontally, respecting safe areas.
- **Tablet:** board dominates with a persistent hand tray and compact opponent rail.
- **Desktop:** board, market, and player rail are simultaneously visible; the decision tray stays near the active card.

Board navigation has a semantic list/grid equivalent. Selecting a card filters and announces legal destinations. Every placement, deployment, Scout, and purchase interaction works by click/touch and keyboard without drag being required.

Minimum active target size is 44×44 CSS pixels. Focus returns to the initiating control after dialogs. Phase, turn, connection, combat, and error changes use restrained live-region announcements. Reduced motion removes flights and zoom transitions without delaying state.

## Rendering

Raster artwork is decorative. The board overlay, observation connections, tokens, text, icons, costs, and legal-target states are HTML/SVG driven from semantic manifests. This allows responsive relayout, localization, high contrast, and automated assertions independent of pixels.

Animations consume reducer traces and never mutate canonical state. Reconnecting skips historical animation and renders the current projection immediately.

## Deployment

Static output is built with a configurable base path:

- production: `/wfme`;
- pull-request preview: `/wfme/pr{number}`;
- local and E2E: empty base.

Production configuration contains only public Firebase web settings. Service credentials, private keys, CLI tokens, and production data never enter the repository or browser bundle.

## Performance budgets

- Shell interactive within 2 seconds on a mid-range mobile connection after static assets are cached.
- Initial JavaScript under 250 KB compressed before Firebase, tracked in CI when the rules layer begins.
- Current-state replay under 50 ms for a normal ten-round match on desktop and under 150 ms on target mobile hardware.
- Board artwork uses responsive image variants; no multi-megabyte concept PNG should be downloaded on phone without an explicit high-resolution request.

## Compatibility and migrations

Schema, reducer, PRNG, and every manifest are independently versioned. Replay stops with an explicit incompatible diagnostic if any referenced version is unavailable. Never silently reinterpret an old match with current card data.

Before changing accepted event meaning, add a fixture from the prior version and choose one policy: retain the old reducer, migrate the complete stream explicitly, or declare the match read-only with an understandable explanation.
