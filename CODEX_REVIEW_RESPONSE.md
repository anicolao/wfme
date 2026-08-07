# Response to `CODEX_REVIEW.md`

Resolved 2026-08-07 against the reviewed `705df111` baseline.

## Correctness and release-gate fixes

- **Canonical replay order — fixed.** Acknowledged Firestore events retain their
  server commit time through ordering, with event ID as the deterministic tie
  breaker. Pending `serverTimestamp` writes are omitted until acknowledged, and
  `reduceGame` consumes canonical caller order instead of re-sorting by the
  client clock. Unit coverage includes skewed client clocks and equal server
  commit times.
- **Four-player Renown — fixed.** Every participant in a four-human match starts
  at 1 Renown. The setup matrix now covers one-human/two-Rival, two-human/one-
  Rival, three-human, and four-human formats, including resources, Companies,
  Agents, Objectives, private-zone counts, module state, and seating.
- **Responsive-shell smoke — fixed.** Scenario `001` now asserts the current
  release copy and trusted-table disclosure. Its phone and desktop baselines
  were reviewed and pass on an ordinary non-update run.
- **Evidence mutation — fixed.** Ordinary E2E runs no longer write scenario
  walkthroughs. The explicit snapshot-update command opts into both screenshot
  and walkthrough regeneration.

## Privacy finding

The finding was correct; there is no adversarial-secrecy rebuttal. The lobby,
README, and implementation ledger now disclose that room codes are invitations
and that signed-in clients receive the shared event stream.

Presentation now receives `projectSeatView(state, uid)` rather than canonical
state directly. The projection removes the shuffle seed, all hidden deck orders,
opponent hands and Fate identities, and another seat's private decision IDs. It
retains public zones and counts, local hand/Fate, unordered local deck
composition needed for legality, and only cards explicitly revealed to the
local seat. Unit tests prove exact private instance IDs are absent and that the
canonical state is not mutated.

This is defense against accidental rendering leaks, not a claim that the event
transport is secret. Membership-scoped Firestore access, abuse controls, or a
server-authoritative secrecy model remain production architecture decisions.

## Accepted production-hardening work

The accessibility/device matrix, cached-prefix replay and reconnect/conflict
behavior, realistic history benchmarks, evidence-corpus reduction, and reducer/
board decomposition are valid findings. They are not rebutted or relabeled as
complete here. They are the next accepted tracer in `IMPLEMENTATION_STATUS.md`.

The scope distinction matters: the repository already calls this release a
**trusted-client playable alpha**, not production-hardened. Those findings block
a future production-ready claim, but they do not invalidate the implemented
rules-complete alpha boundary. No production-ready claim has been added.

## Verification

- `npm run check` — 0 errors, 0 warnings.
- `npm run test:unit` — 83 tests pass across 5 files.
- `001-responsive-shell` — phone and desktop pass, including the disclosure;
  an ordinary run leaves walkthrough source unchanged.
- `033-elven-foresight` — phone and desktop pass after focused baseline refresh;
  this exercises private deck inspection, redacted observers, exact local order,
  next-card draw, and reload.
- `061-rivals` — both supported Rival formats pass on phone and desktop.

The complete 61-scenario browser suite was not rerun in this response, so this
document does not claim that broader gate as fresh evidence.
