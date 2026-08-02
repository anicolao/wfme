# Integrated implementation status

This is the construction ledger for the one canonical game at the repository root. A capability is counted only when its visible controls, Firebase event, deterministic reducer, illegal paths, replay behavior, phone/desktop browser journey, and screenshots all pass.

## Current release boundary

| Capability | Complete | Evidence |
| --- | ---: | --- |
| Root lobby and live room | 1 / 1 | `002-dwarven-caravans` creates and joins with three isolated Firebase identities |
| Seeded match and private opening hands | 1 / 1 | Reducer conservation tests and the three-seat browser journey |
| Board destinations | 16 / 22 | All eight faction destinations, five White Council destinations, Take Up a War Effort, Minas Tirith, and Edoras are executable; the other six are disabled |
| Starting card instances | 10 / 10 | Exact deterministic deck composition and conservation |
| Starting cards with executable Agent boxes | 5 / 7 definitions | Diplomatic Mission, The Open Road, Armed Escort, Seek Allies, and Reconnaissance |
| Observation posts | 9 / 9 structure; placement, intelligence, and infiltration live | Exact named connections, finite Scout supply, multi-Agent occupation, both recall timings, authority, and replay |
| Starting cards with executable Muster boxes | 7 / 7 definitions | Public Reveal totals and card-instance conservation |
| Reserve cards | 1 / 2 definitions | Muster the Host cost, finite supply, discard destination, reshuffle, and later Agent use are executable |
| Commander identities | 8 / 8 | Unique lobby identities, explicitly power-free |
| Commander powers | 0 / 16 | No power text is presented as active |
| Fate physical instances | 30 / 30; effects 10 / 30 | Deterministically shuffled deck, private hands, public discard, keep-one choice, deterministic transfer and cycle, conservation, and replay; both copies of Sudden Charge, Hold the Line, Hidden Archers, Reinforcements, and Desperate Valor are fully playable during Combat |
| Battle cards | 4 / 16 | Crossing of the Isen, Siege of Minas Tirith, Battle of the Pelennor Fields, and Battle of Helm's Deep have final setup, Standards, all ranked rewards, ownership/discard, and cleanup |
| Chronicle, War Effort, and Rival content | 0 | Introduced only with the tracer that makes each item executable |
| Round phases | Agent, Reveal, ordinary Battle, Riches, Recall | Combat passing, ranked resolution, Edoras Riches, and first-player rotation are live; the remaining Riches and Ent rules arrive in subsequent vertical slices |
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
| Mirror of Galadriel paid Scout action | one-Mithril legality/payment, Elven standing, private deck draw, finite mandatory Scout placement, ordered Seek Allies continuation, and replay | `002-dwarven-caravans` gestures 142–145 earn the cost through real Council play, select Elven access, pay, draw, place the Scout, and reload |
| Secret Bargain action economy | Shadow-two/other-Agent requirements, three-Gold payment, optional opaque Fate cycle, public Fate discard, specific other-Agent recall, mid-round draw/reshuffle, restored Agent, ordered authority, and replay | `002-dwarven-caravans` gestures 153–170 earn Shadow respect and funding, establish a real recall target, cycle Fate, recall that Agent, draw, and reload across three clients |
| Captain of the Host | global first-eight/later-six pricing, once-per-player ownership, third-Agent conservation, next-turn arrival, future Recall, legality, and replay | `002-dwarven-caravans` continues from the real Secret Bargain economy, funds the first Captain through repeated Roads visits, validates delayed arrival across three clients, and reloads |
| Remaining faction destinations | Pits of Isengard and Deep Roads enforce paid Mithril costs, standing, private Fate, finite recruitment, and Battle labeling; Hidden Paths draws privately; Ranger Mustering enforces Provision payment and an actor-only hand/discard trash choice | `002-dwarven-caravans` continues through real Roads/Council funding, visits all four destinations with matching cards, resolves ordered choices, validates all clients, and reloads |
| Minas Tirith and ordinary Battle | final Stronghold recruit/draw ordering; deployment of all current-round recruits plus at most two existing garrison Companies; unit-gated swords; first-player Combat pass order; three/four-player ranking and tie rules; finite rewards; winner ownership; no-winner discard; cleanup to supply; deterministic replay | `006-ordinary-battle` uses three isolated humans at three Battle destinations, resolves each ordered deployment, Reveals swords, reloads during Combat Fate, passes clockwise, validates ranked rewards and cleanup, and captures 37 phone/desktop frames |
| Sudden Charge Combat Fate | private two-copy identity, Combat-only authority, +3 temporary Strength, public discard, continued same-player action, pass-streak reset, replay, and hidden observer UI | `006-ordinary-battle` earns the card through Hall of Fire, reloads before play, validates the exact Strength delta on three clients, and then completes the same Battle through visible passes |
| Hold the Line Combat Fate | private two-copy identity, base +2 Strength, conditional +2 while controlling the active contested location, public discard, continued authority, replay, and hidden observer UI | `006-ordinary-battle` draws the card through a real round-three Hall of Fire visit, verifies observers cannot identify it, plays it as the Pelennor controller, and validates the exact +4 delta on every client |
| Hidden Archers Combat Fate | private two-copy identity, one Strength per persistent board Scout with a maximum of three, public discard, continued authority, replay, and hidden observer UI | `006-ordinary-battle` retains a real Scout from earlier play, draws the card through a round-two Hall of Fire visit, validates the private count on three clients, and proves the Scout-derived Strength delta breaks the Siege tie |
| Reinforcements Combat Fate | private two-copy identity, garrison-to-Battle Company movement, printed +2 Strength fallback when no Company can deploy, public discard, continued authority, and replay | `006-ordinary-battle` carries the Siege runner-up's private reward into Pelennor, deploys that player through real Agent play, moves the Company through the Combat UI, and validates the exact public garrison, force, and Strength changes on three clients; reducer replay covers both printed branches |
| Desperate Valor Combat Fate | private two-copy identity, return from Battle to supply, +5 temporary Strength, zero Strength when the last unit leaves, persistent Combat participation, public discard, and replay | `006-ordinary-battle` carries the Pelennor runner-up's reward into a real fourth round, deploys exactly one Company, returns it through the Fate UI, proves zero Strength without losing pass authority, and resolves Helm's Deep on three clients |
| Helm's Deep and Edoras control | final Horse Standard, critical-location display, exact ranked rewards, sole-winner control, cleanup, and replay | `006-ordinary-battle` opens the reviewed Battle after Pelennor, deploys two humans through distinct real destinations, Reveals all three seats, resolves Combat Fate and pass reset, then validates Edoras control and the exact Renown reward |
| Edoras and Riches | one-Mithril printed reward, one-Mithril controller tribute, empty-round accumulation, full-pool collection, reset, occupation, and replay | `006-ordinary-battle` leaves Edoras empty for four genuine rounds, wins its control at Helm's Deep, uses a real Roads card to visit it, and validates the six-Mithril total and reset on three clients |
| Siege and Minas Tirith control | contested-location display, sole-winner control, printed Renown, runner-up Fate/Gold, persistent controller identity, controller visit income, and deterministic replay | `006-ordinary-battle` continues into round two, deploys three humans through real spaces, resolves the Siege, and validates the same Minas Tirith controller on every client; reducer replay proves the controller's later +1 Gold visit trigger |
| Pelennor defense and Standard pairing | controller-authorized optional round-start defense from supply, exact Age III rewards, retained control, face-up matching, both cards turned face down, separate +1 Renown, and replay | `006-ordinary-battle` reloads the Minas Tirith controller while the defense choice is pending, deploys through the real control, Reveals all three humans, resolves the sole-participant Combat window, and validates paired White Tree Standards plus exact Renown on every client |
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

Tracer 5 continues with the remaining Combat Fate effects and Battle-card batches.
