# Integrated implementation status

This is the construction ledger for the one canonical game at the repository root. A capability is counted only when its visible controls, Firebase event, deterministic reducer, illegal paths, replay behavior, phone/desktop browser journey, and screenshots all pass.

## Current release boundary

| Capability | Complete | Evidence |
| --- | ---: | --- |
| Root lobby and live room | 1 / 1 | `002-dwarven-caravans` creates and joins with three isolated Firebase identities |
| Seeded match and private opening hands | 1 / 1 | Reducer conservation tests and the three-seat browser journey |
| Board destinations | 7 / 22 | Hidden Counsel joins the two earlier faction spaces, Take Up a War Effort, and all three reviewed White Council spaces; the other 15 are disabled |
| Starting card instances | 10 / 10 | Exact deterministic deck composition and conservation |
| Starting cards with executable Agent boxes | 5 / 7 definitions | Diplomatic Mission, The Open Road, Armed Escort, Seek Allies, and Reconnaissance |
| Observation posts | 9 / 9 structure; placement, intelligence, and infiltration live | Exact named connections, finite Scout supply, multi-Agent occupation, both recall timings, authority, and replay |
| Starting cards with executable Muster boxes | 7 / 7 definitions | Public Reveal totals and card-instance conservation |
| Reserve cards | 1 / 2 definitions | Muster the Host cost, finite supply, discard destination, reshuffle, and later Agent use are executable |
| Commander identities | 8 / 8 | Unique lobby identities, explicitly power-free |
| Commander powers | 0 / 16 | No power text is presented as active |
| Fate physical instances | 30 / 30 | Deterministically shuffled deck, private hands, public discard, keep-one choice, deterministic transfer, conservation, and replay; individual Fate effects remain 0 / 30 |
| Chronicle, Battle, War Effort, and Rival content | 0 | Introduced only with the tracer that makes each item executable |
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
| Hidden Counsel and Elven standing family | private physical draw, standing-two respect, standing-four draw-two/keep-one favor, public discard, Alliance, deterministic transfers from opponents holding four Fate, ordered Seek Allies continuation, and 30-instance conservation | `005-hidden-counsel` gestures 017–019 validate real icon legality, synchronized occupation, public Elven/Fate counts, hidden identity, exact Chronicle result, and reload |
| Standing 2 respect and persistent Renown | multi-round threshold replay test | gestures 055–057 revisit Dwarven Caravans after Recall |
| Dwarven standing 4 favor, Alliance claim, strict-lead transfer | claim/tie/transfer and Renown ownership tests | gestures 094–113 reach standing three, conserve the faction card, claim publicly, and reload |
| Take Up a War Effort draw and disabled-module +2 Gold | card-zone conservation test | gestures 016–017 validate private draw and public reward |
| Armed Escort + Muster ordered recruitment and optional payment | pending-choice legality and conservation tests | gestures 024–027 validate actor, observers, and replay |
| Seek Allies optional self-trash and permanent Trash zone | choice authorization and keep/trash branch tests | gestures 060–063 validate ordering, privacy, convergence, and replay |
| Reconnaissance and persistent Scout placement | post legality, finite supply, authorization, and replay tests | gestures 079–082 validate the genuine draw, all nine connections, ordered placement, convergence, and reload |
| Scout Gather Intelligence timing | recall/decline branches, pre-effect ordering, draw, conservation, and replay tests | gestures 088–091 validate persistence, actor-only choice, two ordered draws, convergence, and reload |
| Scout infiltration into an occupied space | matching-icon legality, required connected recall, multi-Agent conservation, and illegal-intent tests | `003-scout-infiltration` gestures 024–027 validate the blocker, explicit recall, shared occupation, observer convergence, and reload |
| White Council first seat and repeat visit | affordability, mandatory five-Gold payment, permanent ownership, +2 Reveal Influence, repeat Mithril/Fate/recruitment, ordered Scout interruption, private Fate conservation, and replay tests | gestures 114–134 validate first seating, Council-backed Reveal, another Recall/reshuffle, real Roads funding, mandatory Scout placement, declined intelligence, repeat rewards, and reload across all clients |
| Hall of Fire temporary counsel | Council-icon legality, private Fate draw, conditional +1 Reveal Influence, Armed Escort ordering, Recall expiry, conservation, and replay tests | `004-hall-of-fire` gestures 018–035 validate a real board draw, two intervening humans, Hall placement, private Fate/public count, exact supported Reveal, Recall, exact unsupported Reveal, and reload |
| Public Reveal, exact Influence/swords, and turn skipping | Reveal legality and zone-conservation tests | gestures 028–034 show all three clients through the first Reveal sequence |
| Reserve acquisition and finite supply | affordability, supply, and illegal-acquisition tests | gesture 029 validates shared supply and private discard |
| Recall, first-player rotation, redraw, and deterministic reshuffle | two-round reducer replay and 11-instance conservation | gestures 035–049 reach round 3 and use the acquired card |
| Immutable event replay after reload | repository ordering tests | gestures 020 and 023 reload the acting browsers |
| Append-only authenticated event storage | Firestore emulator rule suite | the entire room journey uses the emulators/live backend |

## Next accepted tracer

Tracer 2 continues with Mirror of Galadriel, completing the ordinary Elven family through a genuine Mithril cost, private draw, and ordered Scout placement before Battle spaces are enabled.
