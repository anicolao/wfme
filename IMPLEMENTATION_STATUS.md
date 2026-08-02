# Integrated implementation status

This is the construction ledger for the one canonical game at the repository root. A capability is counted only when its visible controls, Firebase event, deterministic reducer, illegal paths, replay behavior, phone/desktop browser journey, and screenshots all pass.

## Current release boundary

| Capability | Complete | Evidence |
| --- | ---: | --- |
| Root lobby and live room | 1 / 1 | `002-dwarven-caravans` creates and joins with three isolated Firebase identities |
| Seeded match and private opening hands | 1 / 1 | Reducer conservation tests and the three-seat browser journey |
| Board destinations | 1 / 22 | Dwarven Caravans; the other 21 are structural geography and disabled |
| Starting card instances | 10 / 10 | Exact deterministic deck composition and conservation |
| Starting cards with executable Agent boxes | 1 / 7 definitions | Diplomatic Mission |
| Commander identities | 8 / 8 | Unique lobby identities, explicitly power-free |
| Commander powers | 0 / 16 | No power text is presented as active |
| Chronicle, Reserve, Fate, Battle, War Effort, and Rival content | 0 | Introduced only with the tracer that makes each item executable |
| Complete ordinary rounds | 0 | Reveal, Battle, Riches, and Recall are not yet available |
| Complete matches | 0 | Endgame and rematch are not yet available |

## Implemented rules coverage

| Rules/catalog concept | Reducer or rule proof | Browser proof |
| --- | --- | --- |
| Three- or four-seat room, unique identities, readiness, host start | `src/lib/game/reducer.test.ts` and Firestore rules tests | `tests/e2e/002-dwarven-caravans` gestures 001–014 |
| Seed is independent of anonymous Firebase UIDs | deterministic replay/deck test | starting board and five-card private-hand validation |
| Exact ten-card opening deck split 5/5 with unique instances | card conservation test | each seat shows exactly five private cards |
| Diplomatic Mission placement icon legality | legal-space selector and illegal placement tests | gesture 015 enables only Dwarven Caravans |
| Dwarven Caravans occupancy and +1 Dwarven/+1 Provision | resolution and no-partial-mutation tests | gesture 016 validates all three clients |
| Immutable event replay after reload | repository ordering tests | gesture 017 reloads the acting browser |
| Append-only authenticated event storage | Firestore emulator rule suite | the entire room journey uses the emulators/live backend |

## Next accepted tracer

Tracer 2 adds the next coherent ordinary Agent-space family with only the card/effect vocabulary required by that family. This ledger must change in the same commit as its passing reducer and browser evidence.
