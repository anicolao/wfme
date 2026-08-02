# Test: Three-player ordinary Agent destinations tracer

Three isolated human browser sessions create and join a Firebase room, resolve ordinary actions, Reveal, acquire, Recall, reshuffle, use the acquired card, cross a faction threshold, and make an optional self-trash choice with convergence and replay.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The entered name is visible and the create action remains available

---

## Mara chooses a private invitation code

![Phone: Mara chooses a private invitation code](./screenshots/001-host-room-code-phone.png)

![Desktop: Mara chooses a private invitation code](./screenshots/001-host-room-code-desktop.png)

**Verifications:**

- [x] The five-character code is entered through the real lobby control

---

## Mara creates the shared room

![Phone: Mara creates the shared room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the shared room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The requested invitation code is displayed
- [x] All connected seats converge on 1 public player
- [x] Every connected replay has accepted exactly 1 events with no diagnostics

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] Rin's name is visible

---

## Rin enters the room code

![Phone: Rin enters the room code](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the room code](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The exact host invitation code is entered

---

## Rin joins from an independent browser

![Phone: Rin joins from an independent browser](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins from an independent browser](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Rin receives a real seat in the room
- [x] All connected seats converge on 2 public players
- [x] Every connected replay has accepted exactly 2 events with no diagnostics

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] Pip's name is visible

---

## Pip enters the room code

![Phone: Pip enters the room code](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the room code](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The exact host invitation code is entered

---

## Pip joins from an independent browser

![Phone: Pip joins from an independent browser](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins from an independent browser](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Pip receives a real seat in the room
- [x] All connected seats converge on 3 public players
- [x] Every connected replay has accepted exactly 3 events with no diagnostics

---

## Mara claims Aragorn

![Phone: Mara claims Aragorn](./screenshots/009-seat-1-commander-phone.png)

![Desktop: Mara claims Aragorn](./screenshots/009-seat-1-commander-desktop.png)

**Verifications:**

- [x] Aragorn is selected for Mara
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 4 events with no diagnostics

---

## Mara readies their seat

![Phone: Mara readies their seat](./screenshots/010-seat-1-ready-phone.png)

![Desktop: Mara readies their seat](./screenshots/010-seat-1-ready-desktop.png)

**Verifications:**

- [x] Mara's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 5 events with no diagnostics

---

## Rin claims Galadriel

![Phone: Rin claims Galadriel](./screenshots/011-seat-2-commander-phone.png)

![Desktop: Rin claims Galadriel](./screenshots/011-seat-2-commander-desktop.png)

**Verifications:**

- [x] Galadriel is selected for Rin
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 6 events with no diagnostics

---

## Rin readies their seat

![Phone: Rin readies their seat](./screenshots/012-seat-2-ready-phone.png)

![Desktop: Rin readies their seat](./screenshots/012-seat-2-ready-desktop.png)

**Verifications:**

- [x] Rin's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 7 events with no diagnostics

---

## Pip claims Gandalf

![Phone: Pip claims Gandalf](./screenshots/013-seat-3-commander-phone.png)

![Desktop: Pip claims Gandalf](./screenshots/013-seat-3-commander-desktop.png)

**Verifications:**

- [x] Gandalf is selected for Pip
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 8 events with no diagnostics

---

## Pip readies their seat

![Phone: Pip readies their seat](./screenshots/014-seat-3-ready-phone.png)

![Desktop: Pip readies their seat](./screenshots/014-seat-3-ready-desktop.png)

**Verifications:**

- [x] Pip's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 9 events with no diagnostics

---

## The host starts the deterministic match

![Phone: The host starts the deterministic match](./screenshots/015-start-seeded-match-phone.png)

![Desktop: The host starts the deterministic match](./screenshots/015-start-seeded-match-desktop.png)

**Verifications:**

- [x] All three browsers transition to the production board
- [x] All 22 final board destinations are structurally present
- [x] Exactly four complete destinations are advertised as playable
- [x] Each seat exposes exactly its own five-card hand
- [x] Every connected replay has accepted exactly 10 events with no diagnostics

---

## Mara chooses The Open Road

![Phone: Mara chooses The Open Road](./screenshots/016-play-open-road-phone.png)

![Desktop: Mara chooses The Open Road](./screenshots/016-play-open-road-desktop.png)

**Verifications:**

- [x] The Open Road is selected through the private hand
- [x] Take Up a War Effort is the sole legal Roads destination

---

## Mara takes up the road in the base game

![Phone: Mara takes up the road in the base game](./screenshots/017-take-war-effort-phone.png)

![Desktop: Mara takes up the road in the base game](./screenshots/017-take-war-effort-desktop.png)

**Verifications:**

- [x] Every client sees the named Agent occupying the Roads space
- [x] The public reward is exactly two Gold while War Efforts are disabled
- [x] The actor privately draws Armed Escort and still has five cards
- [x] Every connected replay has accepted exactly 11 events with no diagnostics

---

## Pip chooses Diplomatic Mission

![Phone: Pip chooses Diplomatic Mission](./screenshots/018-play-diplomatic-mission-phone.png)

![Desktop: Pip chooses Diplomatic Mission](./screenshots/018-play-diplomatic-mission-desktop.png)

**Verifications:**

- [x] Diplomatic Mission is visibly selected
- [x] Both matching, unoccupied faction destinations become legal

---

## Pip sends an Agent to Dwarven Caravans

![Phone: Pip sends an Agent to Dwarven Caravans](./screenshots/019-place-dwarven-agent-phone.png)

![Desktop: Pip sends an Agent to Dwarven Caravans](./screenshots/019-place-dwarven-agent-desktop.png)

**Verifications:**

- [x] Every player sees the same named Agent occupation
- [x] The acting seat gains exactly one Provision and one Dwarven standing
- [x] The Chronicle narrates the resolved shared action
- [x] The turn advances to another human

---

## Pip reloads and the immutable history replays

![Phone: Pip reloads and the immutable history replays](./screenshots/020-reload-replay-phone.png)

![Desktop: Pip reloads and the immutable history replays](./screenshots/020-reload-replay-desktop.png)

**Verifications:**

- [x] The anonymous seat reconnects directly to the board
- [x] The committed Agent and rewards survive reload

---

## Rin chooses Diplomatic Mission

![Phone: Rin chooses Diplomatic Mission](./screenshots/021-play-shadow-mission-phone.png)

![Desktop: Rin chooses Diplomatic Mission](./screenshots/021-play-shadow-mission-desktop.png)

**Verifications:**

- [x] Diplomatic Mission is selected through the private hand
- [x] The occupied Dwarven space is unavailable and Tribute is the sole legal destination

---

## Rin pays Tribute to the Shadow

![Phone: Rin pays Tribute to the Shadow](./screenshots/022-tribute-shadow-phone.png)

![Desktop: Rin pays Tribute to the Shadow](./screenshots/022-tribute-shadow-desktop.png)

**Verifications:**

- [x] Every client sees the named Agent occupying Tribute to the Shadow
- [x] The acting seat gains exactly two Gold and one Shadow standing
- [x] All replays accept the twelfth event without diagnostics
- [x] The next human receives the turn

---

## Rin reloads the completed Shadow tribute

![Phone: Rin reloads the completed Shadow tribute](./screenshots/023-reload-shadow-phone.png)

![Desktop: Rin reloads the completed Shadow tribute](./screenshots/023-reload-shadow-desktop.png)

**Verifications:**

- [x] The Shadow occupation survives immutable replay
- [x] Shadow rewards remain exact after reload

---

## Mara chooses the drawn Armed Escort

![Phone: Mara chooses the drawn Armed Escort](./screenshots/024-play-armed-escort-phone.png)

![Desktop: Mara chooses the drawn Armed Escort](./screenshots/024-play-armed-escort-desktop.png)

**Verifications:**

- [x] The genuinely drawn Armed Escort is selected from the private hand
- [x] Muster the Free Peoples is the sole legal Council destination

---

## Mara musters the Free Peoples

![Phone: Mara musters the Free Peoples](./screenshots/025-muster-free-peoples-phone.png)

![Desktop: Mara musters the Free Peoples](./screenshots/025-muster-free-peoples-desktop.png)

**Verifications:**

- [x] Every client sees the named Agent occupying the Council space
- [x] Armed Escort and the space recruit exactly three Companies before the choice
- [x] All clients see the ordered payment choice but only the actor may resolve it
- [x] The turn remains with the actor until the choice is resolved
- [x] Every connected replay has accepted exactly 14 events with no diagnostics

---

## Mara pays the optional Muster cost

![Phone: Mara pays the optional Muster cost](./screenshots/026-pay-muster-gold-phone.png)

![Desktop: Mara pays the optional Muster cost](./screenshots/026-pay-muster-gold-desktop.png)

**Verifications:**

- [x] The ordered choice closes for every client
- [x] Exactly two Gold become one Provision
- [x] The completed choice advances to another human
- [x] Every connected replay has accepted exactly 15 events with no diagnostics

---

## Mara reloads the completed Council action

![Phone: Mara reloads the completed Council action](./screenshots/027-reload-muster-phone.png)

![Desktop: Mara reloads the completed Council action](./screenshots/027-reload-muster-desktop.png)

**Verifications:**

- [x] The Council occupation and resolved payment survive replay
- [x] Every connected replay has accepted exactly 15 events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/028-reveal-first-hand-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/028-reveal-first-hand-desktop.png)

**Verifications:**

- [x] Every client sees the same four-card public Muster row
- [x] Muster totals are exactly four Influence and one sword
- [x] The reviewed Muster the Host Reserve batch is affordable and unavailable content is absent
- [x] Every connected replay has accepted exactly 16 events with no diagnostics

---

## Pip acquires Muster the Host

![Phone: Pip acquires Muster the Host](./screenshots/029-acquire-muster-host-phone.png)

![Desktop: Pip acquires Muster the Host](./screenshots/029-acquire-muster-host-desktop.png)

**Verifications:**

- [x] The shared Reserve count falls from eight to seven
- [x] Exactly two Influence remains
- [x] The acquired private instance enters the actor discard pile
- [x] Every connected replay has accepted exactly 17 events with no diagnostics

---

## Pip finishes the Reveal turn

![Phone: Pip finishes the Reveal turn](./screenshots/030-finish-first-reveal-phone.png)

![Desktop: Pip finishes the Reveal turn](./screenshots/030-finish-first-reveal-desktop.png)

**Verifications:**

- [x] The public Muster row closes after cards move to discard
- [x] The public seat reports Reveal complete
- [x] The next unrevealed human gets the Agent-or-Reveal decision
- [x] Every connected replay has accepted exactly 18 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/031-round-1-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/031-round-1-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 19 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/032-round-1-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/032-round-1-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 20 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/033-round-1-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/033-round-1-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 21 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/034-round-1-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/034-round-1-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 22 events with no diagnostics

---

## Recall opens round 2

![Phone: Recall opens round 2](./screenshots/035-round-2-recall-phone.png)

![Desktop: Recall opens round 2](./screenshots/035-round-2-recall-desktop.png)

**Verifications:**

- [x] All Agents return and every seat redraws five cards
- [x] First player rotates to the next seat

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/036-round-2-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/036-round-2-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 23 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/037-round-2-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/037-round-2-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 24 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/038-round-2-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/038-round-2-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 25 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/039-round-2-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/039-round-2-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 26 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/040-round-2-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/040-round-2-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 27 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/041-round-2-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/041-round-2-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 28 events with no diagnostics

---

## The deterministic reshuffle opens round 3

![Phone: The deterministic reshuffle opens round 3](./screenshots/042-round-3-reshuffle-phone.png)

![Desktop: The deterministic reshuffle opens round 3](./screenshots/042-round-3-reshuffle-desktop.png)

**Verifications:**

- [x] Round 3 begins from real Recall with five-card hands

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/043-round-3-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/043-round-3-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 29 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/044-round-3-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/044-round-3-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 30 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/045-round-3-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/045-round-3-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 31 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/046-round-3-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/046-round-3-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 32 events with no diagnostics

---

## Pip plays the acquired Muster the Host

![Phone: Pip plays the acquired Muster the Host](./screenshots/047-play-acquired-muster-host-phone.png)

![Desktop: Pip plays the acquired Muster the Host](./screenshots/047-play-acquired-muster-host-desktop.png)

**Verifications:**

- [x] The card acquired two rounds earlier was genuinely drawn after reshuffle
- [x] Its complete Stronghold and Roads placement icons make the available Roads space legal

---

## Pip uses the acquired card on the board

![Phone: Pip uses the acquired card on the board](./screenshots/048-use-acquired-muster-host-phone.png)

![Desktop: Pip uses the acquired card on the board](./screenshots/048-use-acquired-muster-host-desktop.png)

**Verifications:**

- [x] The acquired card recruits one Company before the board reward
- [x] Every client sees the new occupation and base-game Gold reward
- [x] Every connected replay has accepted exactly 33 events with no diagnostics

---

## Pip reloads after using the acquired card

![Phone: Pip reloads after using the acquired card](./screenshots/049-reload-acquired-card-phone.png)

![Desktop: Pip reloads after using the acquired card](./screenshots/049-reload-acquired-card-desktop.png)

**Verifications:**

- [x] Acquisition, reshuffle, draw, Journey effect, and occupation replay identically
- [x] Every connected replay has accepted exactly 33 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/050-round-3-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/050-round-3-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 34 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/051-round-3-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/051-round-3-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 35 events with no diagnostics

---

## Recall opens round 4 with accumulated standing

![Phone: Recall opens round 4 with accumulated standing](./screenshots/052-round-4-recall-phone.png)

![Desktop: Recall opens round 4 with accumulated standing](./screenshots/052-round-4-recall-desktop.png)

**Verifications:**

- [x] The first-player marker rotates and prior standing persists

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/053-round-4-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/053-round-4-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 36 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/054-round-4-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/054-round-4-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 37 events with no diagnostics

---

## Pip chooses a reshuffled Diplomatic Mission

![Phone: Pip chooses a reshuffled Diplomatic Mission](./screenshots/055-play-second-diplomatic-mission-phone.png)

![Desktop: Pip chooses a reshuffled Diplomatic Mission](./screenshots/055-play-second-diplomatic-mission-desktop.png)

**Verifications:**

- [x] The reshuffled faction card is visibly selected
- [x] Recalled Dwarven Caravans is legal again

---

## Pip earns Dwarven respect

![Phone: Pip earns Dwarven respect](./screenshots/056-earn-dwarven-respect-phone.png)

![Desktop: Pip earns Dwarven respect](./screenshots/056-earn-dwarven-respect-desktop.png)

**Verifications:**

- [x] Crossing to standing two awards exactly one Renown
- [x] Every client sees the second-round Dwarven occupation
- [x] Every connected replay has accepted exactly 38 events with no diagnostics

---

## Pip reloads the standing threshold

![Phone: Pip reloads the standing threshold](./screenshots/057-reload-dwarven-respect-phone.png)

![Desktop: Pip reloads the standing threshold](./screenshots/057-reload-dwarven-respect-desktop.png)

**Verifications:**

- [x] Standing, Renown, Provision, and occupation replay exactly
- [x] Every connected replay has accepted exactly 38 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/058-round-4-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/058-round-4-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 39 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/059-round-4-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/059-round-4-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 40 events with no diagnostics

---

## Pip chooses Seek Allies

![Phone: Pip chooses Seek Allies](./screenshots/060-play-seek-allies-phone.png)

![Desktop: Pip chooses Seek Allies](./screenshots/060-play-seek-allies-desktop.png)

**Verifications:**

- [x] Seek Allies is selected from the genuine round-4 hand
- [x] The remaining Shadow faction destination is legal

---

## Pip seeks allies in the Shadow

![Phone: Pip seeks allies in the Shadow](./screenshots/061-seek-shadow-allies-phone.png)

![Desktop: Pip seeks allies in the Shadow](./screenshots/061-seek-shadow-allies-desktop.png)

**Verifications:**

- [x] The board reward resolves before the Journey choice
- [x] Every client sees the blocking self-trash choice
- [x] Only the actor can trash the card
- [x] Every connected replay has accepted exactly 41 events with no diagnostics

---

## Pip trashes Seek Allies

![Phone: Pip trashes Seek Allies](./screenshots/062-trash-seek-allies-phone.png)

![Desktop: Pip trashes Seek Allies](./screenshots/062-trash-seek-allies-desktop.png)

**Verifications:**

- [x] The pending choice closes everywhere
- [x] Exactly one card moves permanently to Trash
- [x] The Chronicle records the irreversible choice
- [x] Every connected replay has accepted exactly 42 events with no diagnostics

---

## Pip reloads the trashed card

![Phone: Pip reloads the trashed card](./screenshots/063-reload-seek-trash-phone.png)

![Desktop: Pip reloads the trashed card](./screenshots/063-reload-seek-trash-desktop.png)

**Verifications:**

- [x] Trash, Shadow reward, and occupation replay exactly
- [x] Every connected replay has accepted exactly 42 events with no diagnostics

---
