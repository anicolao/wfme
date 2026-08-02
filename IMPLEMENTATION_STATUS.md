# Integrated implementation status

This is the construction ledger for the one canonical game at the repository root. A capability is counted only when its visible controls, Firebase event, deterministic reducer, illegal paths, replay behavior, phone/desktop browser journey, and screenshots all pass.

## Current release boundary

| Capability | Complete | Evidence |
| --- | ---: | --- |
| Root lobby and live room | 1 / 1 | `002-dwarven-caravans` creates and joins with three isolated Firebase identities |
| Seeded match and private opening hands | 1 / 1 | Reducer conservation tests and the three-seat browser journey |
| Board destinations | 4 / 22 | Two faction spaces, Take Up a War Effort, and Muster the Free Peoples; the other 18 are disabled |
| Starting card instances | 10 / 10 | Exact deterministic deck composition and conservation |
| Starting cards with executable Agent boxes | 3 / 7 definitions | Diplomatic Mission, The Open Road, and Armed Escort |
| Starting cards with executable Muster boxes | 7 / 7 definitions | Public Reveal totals and card-instance conservation |
| Reserve cards | 1 / 2 definitions | Muster the Host cost, finite supply, discard destination, reshuffle, and later Agent use are executable |
| Commander identities | 8 / 8 | Unique lobby identities, explicitly power-free |
| Commander powers | 0 / 16 | No power text is presented as active |
| Chronicle, Fate, Battle, War Effort, and Rival content | 0 | Introduced only with the tracer that makes each item executable |
| Round phases | Agent, Reveal, Recall | Battle and Riches arrive with their own complete subsystems |
| Complete matches | 0 | Endgame and rematch are not yet available |

## Implemented rules coverage

| Rules/catalog concept | Reducer or rule proof | Browser proof |
| --- | --- | --- |
| Three- or four-seat room, unique identities, readiness, host start | `src/lib/game/reducer.test.ts` and Firestore rules tests | `tests/e2e/002-dwarven-caravans` gestures 001–014 |
| Seed is independent of anonymous Firebase UIDs | deterministic replay/deck test | starting board and five-card private-hand validation |
| Exact ten-card opening deck split 5/5 with unique instances | card conservation test | each seat shows exactly five private cards |
| Diplomatic Mission placement icon legality | legal-space selector and illegal placement tests | gesture 018 enables only matching, unoccupied faction spaces |
| Dwarven Caravans occupancy and +1 Dwarven/+1 Provision | resolution and no-partial-mutation tests | gesture 019 validates all three clients |
| Tribute to the Shadow occupancy and +1 Shadow/+2 Gold | resolution and turn-advance test | gesture 022 validates all three clients |
| Standing 2 respect and persistent Renown | multi-round threshold replay test | gestures 055–057 revisit Dwarven Caravans after Recall |
| Take Up a War Effort draw and disabled-module +2 Gold | card-zone conservation test | gestures 016–017 validate private draw and public reward |
| Armed Escort + Muster ordered recruitment and optional payment | pending-choice legality and conservation tests | gestures 024–027 validate actor, observers, and replay |
| Public Reveal, exact Influence/swords, and turn skipping | Reveal legality and zone-conservation tests | gestures 028–034 show all three clients through the first Reveal sequence |
| Reserve acquisition and finite supply | affordability, supply, and illegal-acquisition tests | gesture 029 validates shared supply and private discard |
| Recall, first-player rotation, redraw, and deterministic reshuffle | two-round reducer replay and 11-instance conservation | gestures 035–049 reach round 3 and use the acquired card |
| Immutable event replay after reload | repository ordering tests | gestures 020 and 023 reload the acting browsers |
| Append-only authenticated event storage | Firestore emulator rule suite | the entire room journey uses the emulators/live backend |

## Next accepted tracer

Tracer 2 continues with the next coherent ordinary Agent-space family. Reveal and Recall now provide the genuine multi-round path needed to exercise costs, standing thresholds, and later-acquired cards without manufactured state.
