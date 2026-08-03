# Test: Three-player Agent, deck-building, and Scout tracer

Three isolated human browser sessions create and join a Firebase room, resolve ordinary actions, Reveal, acquire, Recall, reshuffle, use an acquired card, cross faction thresholds, trash cards, use both Scout timings, publicly claim a faction Alliance, earn Mithril, complete the paid Mirror action, execute a fully ordered Secret Bargain, fund the first delayed third-Agent Captain, complete all eight faction destinations, take persistent Ent-draught at Fangorn Moot, and return later to breach the Dam.

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
- [x] All twenty-two complete destinations are advertised as playable
- [x] Each seat exposes exactly its own five-card hand
- [x] Every connected replay has accepted exactly 10 events with no diagnostics

---

## Mara chooses The Open Road

![Phone: Mara chooses The Open Road](./screenshots/016-play-open-road-phone.png)

![Desktop: Mara chooses The Open Road](./screenshots/016-play-open-road-desktop.png)

**Verifications:**

- [x] The Open Road is selected through the private hand
- [x] The Roads card enables all three complete opening Roads destinations

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
- [x] All five affordable, unoccupied reviewed faction destinations become legal

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
- [x] The occupied Dwarven space is unavailable while four affordable faction destinations remain legal

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
- [x] Both reviewed free Council destinations are legal

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

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/064-round-4-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/064-round-4-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 43 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/065-round-4-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/065-round-4-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 44 events with no diagnostics

---

## Recall opens round 5 with the observation network ready

![Phone: Recall opens round 5 with the observation network ready](./screenshots/066-round-5-observation-network-phone.png)

![Desktop: Recall opens round 5 with the observation network ready](./screenshots/066-round-5-observation-network-desktop.png)

**Verifications:**

- [x] The first-player marker rotates to the next actor
- [x] All nine named observation posts and their board connections are present

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/067-round-5-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/067-round-5-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 45 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/068-round-5-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/068-round-5-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 46 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/069-round-5-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/069-round-5-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 47 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/070-round-5-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/070-round-5-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 48 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/071-round-5-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/071-round-5-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 49 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/072-round-5-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/072-round-5-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 50 events with no diagnostics

---

## Recall opens round 6 from the second half of each deck

![Phone: Recall opens round 6 from the second half of each deck](./screenshots/073-round-6-second-deck-half-phone.png)

![Desktop: Recall opens round 6 from the second half of each deck](./screenshots/073-round-6-second-deck-half-desktop.png)

**Verifications:**

- [x] Round 6 begins with five real cards for every human

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/074-round-6-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/074-round-6-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 51 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/075-round-6-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/075-round-6-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 52 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/076-round-6-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/076-round-6-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 53 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/077-round-6-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/077-round-6-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 54 events with no diagnostics

---

## The Scout actor receives the turn with Reconnaissance

![Phone: The Scout actor receives the turn with Reconnaissance](./screenshots/078-round-6-scout-hand-phone.png)

![Desktop: The Scout actor receives the turn with Reconnaissance](./screenshots/078-round-6-scout-hand-desktop.png)

**Verifications:**

- [x] Reconnaissance was genuinely drawn from the deterministic deck
- [x] The acting human has the Agent-or-Reveal decision

---

## Pip chooses Reconnaissance

![Phone: Pip chooses Reconnaissance](./screenshots/079-play-reconnaissance-phone.png)

![Desktop: Pip chooses Reconnaissance](./screenshots/079-play-reconnaissance-desktop.png)

**Verifications:**

- [x] Reconnaissance is visibly selected from the genuine round-6 hand
- [x] Its Stronghold and Roads icons make the available Roads destination legal

---

## Pip reconnoitres the War Effort road

![Phone: Pip reconnoitres the War Effort road](./screenshots/080-reconnoitre-war-effort-phone.png)

![Desktop: Pip reconnoitres the War Effort road](./screenshots/080-reconnoitre-war-effort-desktop.png)

**Verifications:**

- [x] The board reward resolves before Scout placement
- [x] Every client sees the blocking nine-post Scout choice
- [x] Only the acting human can choose a post
- [x] The turn cannot advance until the Scout is placed
- [x] Every connected replay has accepted exactly 55 events with no diagnostics

---

## Pip places a Scout on the Old South Road

![Phone: Pip places a Scout on the Old South Road](./screenshots/081-place-old-south-road-scout-phone.png)

![Desktop: Pip places a Scout on the Old South Road](./screenshots/081-place-old-south-road-scout-desktop.png)

**Verifications:**

- [x] Every client sees the named Scout on the selected observation post
- [x] Exactly one Scout leaves the actor supply
- [x] The Scout choice closes and returns the only unrevealed human to their normal decision
- [x] The Chronicle names the persistent Scout post
- [x] Every connected replay has accepted exactly 56 events with no diagnostics

---

## Pip reloads the observation network

![Phone: Pip reloads the observation network](./screenshots/082-reload-scout-post-phone.png)

![Desktop: Pip reloads the observation network](./screenshots/082-reload-scout-post-desktop.png)

**Verifications:**

- [x] Scout, Agent, and board reward replay identically
- [x] Every connected replay has accepted exactly 56 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/083-round-6-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/083-round-6-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 57 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/084-round-6-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/084-round-6-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 58 events with no diagnostics

---

## Recall opens round 7 while the Scout remains on the road

![Phone: Recall opens round 7 while the Scout remains on the road](./screenshots/085-round-7-persistent-scout-phone.png)

![Desktop: Recall opens round 7 while the Scout remains on the road](./screenshots/085-round-7-persistent-scout-desktop.png)

**Verifications:**

- [x] Agents return but the observation network persists across rounds
- [x] The first-player marker rotates to the next human

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/086-round-7-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/086-round-7-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 59 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/087-round-7-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/087-round-7-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 60 events with no diagnostics

---

## Pip chooses a Roads card beside their persistent Scout

![Phone: Pip chooses a Roads card beside their persistent Scout](./screenshots/088-choose-connected-road-card-phone.png)

![Desktop: Pip chooses a Roads card beside their persistent Scout](./screenshots/088-choose-connected-road-card-desktop.png)

**Verifications:**

- [x] A genuine Roads card is selected from the round-7 hand
- [x] The recalled Roads space is legal through its normal icon

---

## Pip places an Agent beside the Old South Road Scout

![Phone: Pip places an Agent beside the Old South Road Scout](./screenshots/089-open-intelligence-window-phone.png)

![Desktop: Pip places an Agent beside the Old South Road Scout](./screenshots/089-open-intelligence-window-desktop.png)

**Verifications:**

- [x] The Agent is visibly placed before the connected Scout decision
- [x] Neither the board draw nor Gold reward resolves before intelligence
- [x] Every client sees the blocking Gather Intelligence timing window
- [x] Only the acting human may recall the connected Scout
- [x] Every connected replay has accepted exactly 61 events with no diagnostics

---

## Pip recalls the Scout to gather intelligence

![Phone: Pip recalls the Scout to gather intelligence](./screenshots/090-gather-road-intelligence-phone.png)

![Desktop: Pip recalls the Scout to gather intelligence](./screenshots/090-gather-road-intelligence-desktop.png)

**Verifications:**

- [x] The Scout returns to supply and its post becomes empty everywhere
- [x] The intelligence draw resolves before the board draw for six cards total
- [x] The Chronicle preserves the ordered Scout and board resolutions
- [x] The blocking choice closes after all effects complete
- [x] Every connected replay has accepted exactly 62 events with no diagnostics

---

## Pip reloads the completed intelligence action

![Phone: Pip reloads the completed intelligence action](./screenshots/091-reload-gathered-intelligence-phone.png)

![Desktop: Pip reloads the completed intelligence action](./screenshots/091-reload-gathered-intelligence-desktop.png)

**Verifications:**

- [x] Scout recall, both draws, Gold, and Agent occupation replay exactly
- [x] Every connected replay has accepted exactly 62 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/092-round-7-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/092-round-7-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 63 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/093-round-7-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/093-round-7-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 64 events with no diagnostics

---

## Pip chooses another Diplomatic Mission

![Phone: Pip chooses another Diplomatic Mission](./screenshots/094-choose-third-dwarven-mission-phone.png)

![Desktop: Pip chooses another Diplomatic Mission](./screenshots/094-choose-third-dwarven-mission-desktop.png)

**Verifications:**

- [x] The faction card was genuinely drawn through the intelligence and board draws
- [x] Dwarven Caravans is open for the actor’s second Agent

---

## Pip reaches Dwarven standing three

![Phone: Pip reaches Dwarven standing three](./screenshots/095-reach-dwarven-three-phone.png)

![Desktop: Pip reaches Dwarven standing three](./screenshots/095-reach-dwarven-three-desktop.png)

**Verifications:**

- [x] Standing rises to three without repeating the standing-two Renown
- [x] The Dwarven Alliance remains unclaimed below standing four
- [x] Every connected replay has accepted exactly 65 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/096-round-7-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/096-round-7-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 66 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/097-round-7-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/097-round-7-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 67 events with no diagnostics

---

## Recall opens round 8 with the Dwarven Alliance in reach

![Phone: Recall opens round 8 with the Dwarven Alliance in reach](./screenshots/098-round-8-alliance-opportunity-phone.png)

![Desktop: Recall opens round 8 with the Dwarven Alliance in reach](./screenshots/098-round-8-alliance-opportunity-desktop.png)

**Verifications:**

- [x] The first-player marker rotates to the standing leader
- [x] Standing three persists while the Alliance remains unclaimed

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/099-round-8-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/099-round-8-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 68 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/100-round-8-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/100-round-8-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 69 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/101-round-8-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/101-round-8-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 70 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/102-round-8-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/102-round-8-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 71 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/103-round-8-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/103-round-8-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 72 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/104-round-8-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/104-round-8-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 73 events with no diagnostics

---

## Recall opens round 9 from the second half of the deck

![Phone: Recall opens round 9 from the second half of the deck](./screenshots/105-round-9-second-deck-half-phone.png)

![Desktop: Recall opens round 9 from the second half of the deck](./screenshots/105-round-9-second-deck-half-desktop.png)

**Verifications:**

- [x] The faction card remains conserved in the undrawn half

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/106-round-9-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/106-round-9-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 74 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/107-round-9-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/107-round-9-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 75 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/108-round-9-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/108-round-9-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 76 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/109-round-9-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/109-round-9-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 77 events with no diagnostics

---

## The standing leader receives the conserved faction card

![Phone: The standing leader receives the conserved faction card](./screenshots/110-round-9-alliance-hand-phone.png)

![Desktop: The standing leader receives the conserved faction card](./screenshots/110-round-9-alliance-hand-desktop.png)

**Verifications:**

- [x] Diplomatic Mission is genuinely present in the private hand
- [x] The active decision belongs to the standing leader

---

## Pip chooses the Alliance-clinching mission

![Phone: Pip chooses the Alliance-clinching mission](./screenshots/111-choose-alliance-mission-phone.png)

![Desktop: Pip chooses the Alliance-clinching mission](./screenshots/111-choose-alliance-mission-desktop.png)

**Verifications:**

- [x] The deterministic round-9 hand contains its real faction access card

---

## Pip claims the Dwarven Alliance

![Phone: Pip claims the Dwarven Alliance](./screenshots/112-claim-dwarven-alliance-phone.png)

![Desktop: Pip claims the Dwarven Alliance](./screenshots/112-claim-dwarven-alliance-desktop.png)

**Verifications:**

- [x] Crossing standing four grants the two-Provision Dwarven favor
- [x] The Alliance is publicly named for every human
- [x] Standing and the Alliance token produce exactly two total Renown
- [x] Every connected replay has accepted exactly 78 events with no diagnostics

---

## Pip reloads the claimed Alliance

![Phone: Pip reloads the claimed Alliance](./screenshots/113-reload-dwarven-alliance-phone.png)

![Desktop: Pip reloads the claimed Alliance](./screenshots/113-reload-dwarven-alliance-desktop.png)

**Verifications:**

- [x] Standing, favor, Alliance owner, Renown, and Agent replay exactly
- [x] Every connected replay has accepted exactly 78 events with no diagnostics

---

## Pip chooses Armed Escort for the White Council

![Phone: Pip chooses Armed Escort for the White Council](./screenshots/114-choose-council-escort-phone.png)

![Desktop: Pip chooses Armed Escort for the White Council](./screenshots/114-choose-council-escort-desktop.png)

**Verifications:**

- [x] A genuine Council-icon card is selected
- [x] Eight Gold makes the five-Gold Council seat affordable

---

## Pip takes a seat on the White Council

![Phone: Pip takes a seat on the White Council](./screenshots/115-take-council-seat-phone.png)

![Desktop: Pip takes a seat on the White Council](./screenshots/115-take-council-seat-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and permanent Council ownership
- [x] The mandatory five Gold is paid before the seat effect
- [x] Armed Escort recruits one Company and a first visit draws no Fate
- [x] Every connected replay has accepted exactly 79 events with no diagnostics

---

## Pip Reveals with Council support

![Phone: Pip Reveals with Council support](./screenshots/116-reveal-with-council-seat-phone.png)

![Desktop: Pip Reveals with Council support](./screenshots/116-reveal-with-council-seat-desktop.png)

**Verifications:**

- [x] The public Influence total includes exactly the permanent +2 Council bonus
- [x] Every connected replay has accepted exactly 80 events with no diagnostics

---

## Pip finishes the Council-backed Reveal

![Phone: Pip finishes the Council-backed Reveal](./screenshots/117-finish-council-reveal-phone.png)

![Desktop: Pip finishes the Council-backed Reveal](./screenshots/117-finish-council-reveal-desktop.png)

**Verifications:**

- [x] Recall opens round 10 and the Council seat persists
- [x] Every connected replay has accepted exactly 81 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/118-round-10-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/118-round-10-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 82 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/119-round-10-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/119-round-10-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 83 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/120-round-10-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/120-round-10-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 84 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/121-round-10-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/121-round-10-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 85 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/122-round-10-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/122-round-10-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 86 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/123-round-10-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/123-round-10-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 87 events with no diagnostics

---

## Pip chooses a Roads card after reshuffling to fund another Council visit

![Phone: Pip chooses a Roads card after reshuffling to fund another Council visit](./screenshots/124-choose-council-funding-road-phone.png)

![Desktop: Pip chooses a Roads card after reshuffling to fund another Council visit](./screenshots/124-choose-council-funding-road-desktop.png)

**Verifications:**

- [x] The real round-11 hand supplies a Roads icon

---

## Pip raises the remaining Council Gold

![Phone: Pip raises the remaining Council Gold](./screenshots/125-fund-repeat-council-visit-phone.png)

![Desktop: Pip raises the remaining Council Gold](./screenshots/125-fund-repeat-council-visit-desktop.png)

**Verifications:**

- [x] The Roads reward raises Gold from three to five
- [x] Every connected replay has accepted exactly 88 events with no diagnostics

---

## Pip completes Reconnaissance at the Council Antechamber

![Phone: Pip completes Reconnaissance at the Council Antechamber](./screenshots/126-place-council-antechamber-scout-phone.png)

![Desktop: Pip completes Reconnaissance at the Council Antechamber](./screenshots/126-place-council-antechamber-scout-desktop.png)

**Verifications:**

- [x] Every client sees the named Scout beside the Council spaces
- [x] The mandatory Scout choice closes and the next human receives the turn
- [x] Every connected replay has accepted exactly 89 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/127-round-11-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/127-round-11-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 90 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/128-round-11-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/128-round-11-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 91 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/129-round-11-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/129-round-11-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 92 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/130-round-11-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/130-round-11-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 93 events with no diagnostics

---

## Pip chooses Armed Escort for a repeat Council visit

![Phone: Pip chooses Armed Escort for a repeat Council visit](./screenshots/131-choose-repeat-council-escort-phone.png)

![Desktop: Pip chooses Armed Escort for a repeat Council visit](./screenshots/131-choose-repeat-council-escort-desktop.png)

**Verifications:**

- [x] The second Agent has both a Council icon and the exact five Gold

---

## Pip returns to the White Council

![Phone: Pip returns to the White Council](./screenshots/132-repeat-council-visit-phone.png)

![Desktop: Pip returns to the White Council](./screenshots/132-repeat-council-visit-desktop.png)

**Verifications:**

- [x] The repeat visit pays all five Gold before connected Scout intelligence resolves
- [x] The Agent is placed while Council and Journey rewards remain paused
- [x] Every connected replay has accepted exactly 94 events with no diagnostics

---

## Pip leaves the Council Scout in place and resolves the visit

![Phone: Pip leaves the Council Scout in place and resolves the visit](./screenshots/133-decline-council-intelligence-phone.png)

![Desktop: Pip leaves the Council Scout in place and resolves the visit](./screenshots/133-decline-council-intelligence-desktop.png)

**Verifications:**

- [x] Declining intelligence resolves the repeat visit for two Mithril
- [x] One opaque Fate instance leaves the shared deck for the private hand
- [x] Armed Escort plus the repeat space recruit four Companies
- [x] The Chronicle describes the complete repeat effect without revealing Fate identity
- [x] Every connected replay has accepted exactly 95 events with no diagnostics

---

## Pip reloads the repeat Council visit

![Phone: Pip reloads the repeat Council visit](./screenshots/134-reload-repeat-council-phone.png)

![Desktop: Pip reloads the repeat Council visit](./screenshots/134-reload-repeat-council-desktop.png)

**Verifications:**

- [x] Council ownership, Fate count, resources, recruitment, and occupation replay exactly
- [x] Every connected replay has accepted exactly 95 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/135-round-11-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/135-round-11-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 96 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/136-round-11-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/136-round-11-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 97 events with no diagnostics

---

## Recall opens round 12 with earned Mithril

![Phone: Recall opens round 12 with earned Mithril](./screenshots/137-round-12-mirror-opportunity-phone.png)

![Desktop: Recall opens round 12 with earned Mithril](./screenshots/137-round-12-mirror-opportunity-desktop.png)

**Verifications:**

- [x] The Council reward persists into a fresh round with every Agent recalled

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/138-round-12-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/138-round-12-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 98 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/139-round-12-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/139-round-12-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 99 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/140-round-12-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/140-round-12-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 100 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/141-round-12-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/141-round-12-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 101 events with no diagnostics

---

## Pip chooses a real Elven-access card

![Phone: Pip chooses a real Elven-access card](./screenshots/142-choose-mirror-faction-card-phone.png)

![Desktop: Pip chooses a real Elven-access card](./screenshots/142-choose-mirror-faction-card-desktop.png)

**Verifications:**

- [x] Mirror of Galadriel is enabled only after the player earned Mithril
- [x] The board advertises the exact payment and ordered rewards

---

## Pip visits the Mirror of Galadriel

![Phone: Pip visits the Mirror of Galadriel](./screenshots/143-visit-mirror-galadriel-phone.png)

![Desktop: Pip visits the Mirror of Galadriel](./screenshots/143-visit-mirror-galadriel-desktop.png)

**Verifications:**

- [x] Every client sees the Elven Agent and paid Mithril
- [x] The private deck draw replaces the Journey card for five cards in hand
- [x] The mandatory Scout placement blocks turn advance for every client
- [x] Every connected replay has accepted exactly 102 events with no diagnostics

---

## Pip sends the Mirror Scout to the Last Homely House

![Phone: Pip sends the Mirror Scout to the Last Homely House](./screenshots/144-place-mirror-scout-phone.png)

![Desktop: Pip sends the Mirror Scout to the Last Homely House](./screenshots/144-place-mirror-scout-desktop.png)

**Verifications:**

- [x] All humans see the finite Scout at the chosen empty post
- [x] The Chronicle orders the board visit before the required Scout placement
- [x] Every connected replay has accepted exactly 103 events with no diagnostics

---

## Pip reloads the completed Mirror visit

![Phone: Pip reloads the completed Mirror visit](./screenshots/145-reload-mirror-galadriel-phone.png)

![Desktop: Pip reloads the completed Mirror visit](./screenshots/145-reload-mirror-galadriel-desktop.png)

**Verifications:**

- [x] Payment, Elven standing, draw count, Agent, and Scout replay exactly
- [x] Every connected replay has accepted exactly 103 events with no diagnostics

---

## Pip chooses a Roads card with the recalled Agent

![Phone: Pip chooses a Roads card with the recalled Agent](./screenshots/146-choose-bargain-funding-road-phone.png)

![Desktop: Pip chooses a Roads card with the recalled Agent](./screenshots/146-choose-bargain-funding-road-desktop.png)

**Verifications:**

- [x] The remaining Agent can reach the real funding space

---

## Pip takes up another War Effort

![Phone: Pip takes up another War Effort](./screenshots/147-fund-secret-bargain-phone.png)

![Desktop: Pip takes up another War Effort](./screenshots/147-fund-secret-bargain-desktop.png)

**Verifications:**

- [x] The base-game road pays exactly two public Gold
- [x] Every connected replay has accepted exactly 104 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/148-round-12-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/148-round-12-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 105 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/149-round-12-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/149-round-12-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 106 events with no diagnostics

---

## Recall opens round 13 with the bargain funding conserved

![Phone: Recall opens round 13 with the bargain funding conserved](./screenshots/150-round-13-bargain-opportunity-phone.png)

![Desktop: Recall opens round 13 with the bargain funding conserved](./screenshots/150-round-13-bargain-opportunity-desktop.png)

**Verifications:**

- [x] The first player rotates while the future bargain actor keeps two Gold and Shadow one

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/151-round-13-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/151-round-13-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 107 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/152-round-13-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/152-round-13-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 108 events with no diagnostics

---

## Pip chooses a faction card for Shadow respect

![Phone: Pip chooses a faction card for Shadow respect](./screenshots/153-choose-shadow-two-card-phone.png)

![Desktop: Pip chooses a faction card for Shadow respect](./screenshots/153-choose-shadow-two-card-desktop.png)

**Verifications:**

- [x] Tribute is legal but Secret Bargain remains locked below Shadow two

---

## Pip reaches Shadow standing two

![Phone: Pip reaches Shadow standing two](./screenshots/154-reach-shadow-two-phone.png)

![Desktop: Pip reaches Shadow standing two](./screenshots/154-reach-shadow-two-desktop.png)

**Verifications:**

- [x] Every human sees Shadow two, four Gold, and the standing-two Renown
- [x] Every connected replay has accepted exactly 109 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/155-round-13-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/155-round-13-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 110 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/156-round-13-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/156-round-13-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 111 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/157-round-13-seat-2-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/157-round-13-seat-2-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 112 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/158-round-13-seat-2-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/158-round-13-seat-2-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 113 events with no diagnostics

---

## Recall opens round 14 with the Council card in the next deck half

![Phone: Recall opens round 14 with the Council card in the next deck half](./screenshots/159-round-14-council-card-phone.png)

![Desktop: Recall opens round 14 with the Council card in the next deck half](./screenshots/159-round-14-council-card-desktop.png)

**Verifications:**

- [x] Shadow two and four Gold persist into the reviewed Council-card hand

---

## Pip chooses a Roads card to establish the recall target

![Phone: Pip chooses a Roads card to establish the recall target](./screenshots/160-place-pre-bargain-agent-card-phone.png)

![Desktop: Pip chooses a Roads card to establish the recall target](./screenshots/160-place-pre-bargain-agent-card-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled for the first Agent

---

## Pip places the Agent that Secret Bargain can recall

![Phone: Pip places the Agent that Secret Bargain can recall](./screenshots/161-place-pre-bargain-agent-phone.png)

![Desktop: Pip places the Agent that Secret Bargain can recall](./screenshots/161-place-pre-bargain-agent-desktop.png)

**Verifications:**

- [x] The recall target is public and funding rises to six Gold
- [x] Every connected replay has accepted exactly 114 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/162-round-14-seat-3-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/162-round-14-seat-3-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 115 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/163-round-14-seat-3-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/163-round-14-seat-3-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 116 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/164-round-14-seat-1-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/164-round-14-seat-1-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 117 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/165-round-14-seat-1-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/165-round-14-seat-1-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 118 events with no diagnostics

---

## Pip chooses Armed Escort for Secret Bargain

![Phone: Pip chooses Armed Escort for Secret Bargain](./screenshots/166-choose-secret-bargain-escort-phone.png)

![Desktop: Pip chooses Armed Escort for Secret Bargain](./screenshots/166-choose-secret-bargain-escort-desktop.png)

**Verifications:**

- [x] The Council destination is legal only with Shadow two, three Gold, and another Agent to recall
- [x] The exact requirement and ordered effects remain visible before commitment

---

## Pip enters the Secret Bargain

![Phone: Pip enters the Secret Bargain](./screenshots/167-enter-secret-bargain-phone.png)

![Desktop: Pip enters the Secret Bargain](./screenshots/167-enter-secret-bargain-desktop.png)

**Verifications:**

- [x] Three Gold is paid and the Secret Bargain Agent is public
- [x] The private Fate count remains one while only the actor can choose to cycle it
- [x] Every connected replay has accepted exactly 119 events with no diagnostics

---

## Pip cycles one private Fate

![Phone: Pip cycles one private Fate](./screenshots/168-cycle-bargain-fate-phone.png)

![Desktop: Pip cycles one private Fate](./screenshots/168-cycle-bargain-fate-desktop.png)

**Verifications:**

- [x] The public discard grows while the private hand count remains one
- [x] The ordered choice advances to the specific other Agent recall
- [x] Every connected replay has accepted exactly 120 events with no diagnostics

---

## Pip recalls the earlier Agent and draws

![Phone: Pip recalls the earlier Agent and draws](./screenshots/169-recall-bargain-agent-phone.png)

![Desktop: Pip recalls the earlier Agent and draws](./screenshots/169-recall-bargain-agent-desktop.png)

**Verifications:**

- [x] The recalled Agent leaves Tribute and is immediately available again
- [x] The private draw occurs after recall for four cards in hand
- [x] The Chronicle exposes timing without either Fate identity or the drawn card
- [x] Every connected replay has accepted exactly 121 events with no diagnostics

---

## Pip reloads the completed Secret Bargain

![Phone: Pip reloads the completed Secret Bargain](./screenshots/170-reload-secret-bargain-phone.png)

![Desktop: Pip reloads the completed Secret Bargain](./screenshots/170-reload-secret-bargain-desktop.png)

**Verifications:**

- [x] Payment, Fate cycle, recall, private draw, and reusable Agent replay exactly
- [x] Every connected replay has accepted exactly 121 events with no diagnostics

---

## Pip chooses a real Roads card for Captain funding

![Phone: Pip chooses a real Roads card for Captain funding](./screenshots/171-choose-captain-funding-0-phone.png)

![Desktop: Pip chooses a real Roads card for Captain funding](./screenshots/171-choose-captain-funding-0-desktop.png)

**Verifications:**

- [x] The base-game War Effort remains the legal funding destination

---

## Pip earns two Gold toward a Captain

![Phone: Pip earns two Gold toward a Captain](./screenshots/172-earn-captain-gold-0-phone.png)

![Desktop: Pip earns two Gold toward a Captain](./screenshots/172-earn-captain-gold-0-desktop.png)

**Verifications:**

- [x] The public treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 122 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/173-captain-funding-1-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/173-captain-funding-1-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 123 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/174-captain-funding-1-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/174-captain-funding-1-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 124 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/175-captain-funding-2-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/175-captain-funding-2-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 125 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/176-captain-funding-2-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/176-captain-funding-2-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 126 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/177-captain-funding-3-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/177-captain-funding-3-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 127 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/178-captain-funding-3-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/178-captain-funding-3-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 128 events with no diagnostics

---

## Pip chooses a real Roads card for Captain funding

![Phone: Pip chooses a real Roads card for Captain funding](./screenshots/179-choose-captain-funding-4-phone.png)

![Desktop: Pip chooses a real Roads card for Captain funding](./screenshots/179-choose-captain-funding-4-desktop.png)

**Verifications:**

- [x] The base-game War Effort remains the legal funding destination

---

## Pip earns two Gold toward a Captain

![Phone: Pip earns two Gold toward a Captain](./screenshots/180-earn-captain-gold-4-phone.png)

![Desktop: Pip earns two Gold toward a Captain](./screenshots/180-earn-captain-gold-4-desktop.png)

**Verifications:**

- [x] The public treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 129 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/181-captain-funding-5-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/181-captain-funding-5-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 130 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/182-captain-funding-5-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/182-captain-funding-5-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 131 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/183-captain-funding-6-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/183-captain-funding-6-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 132 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/184-captain-funding-6-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/184-captain-funding-6-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 133 events with no diagnostics

---

## Pip chooses a real Roads card for Captain funding

![Phone: Pip chooses a real Roads card for Captain funding](./screenshots/185-choose-captain-funding-7-phone.png)

![Desktop: Pip chooses a real Roads card for Captain funding](./screenshots/185-choose-captain-funding-7-desktop.png)

**Verifications:**

- [x] The base-game War Effort remains the legal funding destination

---

## Pip earns two Gold toward a Captain

![Phone: Pip earns two Gold toward a Captain](./screenshots/186-earn-captain-gold-7-phone.png)

![Desktop: Pip earns two Gold toward a Captain](./screenshots/186-earn-captain-gold-7-desktop.png)

**Verifications:**

- [x] The public treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 134 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/187-captain-funding-8-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/187-captain-funding-8-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 135 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/188-captain-funding-8-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/188-captain-funding-8-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 136 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/189-captain-funding-9-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/189-captain-funding-9-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 137 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/190-captain-funding-9-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/190-captain-funding-9-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 138 events with no diagnostics

---

## Pip chooses Armed Escort to appoint a Captain

![Phone: Pip chooses Armed Escort to appoint a Captain](./screenshots/191-choose-captain-escort-phone.png)

![Desktop: Pip chooses Armed Escort to appoint a Captain](./screenshots/191-choose-captain-escort-desktop.png)

**Verifications:**

- [x] Captain of the Host is legal after the real road economy reaches eight Gold
- [x] Both the first and later global prices and delayed timing are visible

---

## Pip pays the global first-Captain price

![Phone: Pip pays the global first-Captain price](./screenshots/192-appoint-first-captain-phone.png)

![Desktop: Pip pays the global first-Captain price](./screenshots/192-appoint-first-captain-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and exact eight-Gold payment
- [x] The connected Scout opens its normal pre-effect intelligence window before appointment
- [x] Every connected replay has accepted exactly 139 events with no diagnostics

---

## Pip leaves the connected Scout before appointing the Captain

![Phone: Pip leaves the connected Scout before appointing the Captain](./screenshots/193-decline-captain-intelligence-phone.png)

![Desktop: Pip leaves the connected Scout before appointing the Captain](./screenshots/193-decline-captain-intelligence-desktop.png)

**Verifications:**

- [x] The Captain effect resolves only after the ordered Scout window
- [x] Every connected replay has accepted exactly 140 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/194-captain-arrival-0-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/194-captain-arrival-0-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 141 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/195-captain-arrival-0-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/195-captain-arrival-0-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 142 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/196-captain-arrival-1-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/196-captain-arrival-1-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 143 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/197-captain-arrival-1-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/197-captain-arrival-1-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 144 events with no diagnostics

---

## Pip's Captain joins at the next turn

![Phone: Pip's Captain joins at the next turn](./screenshots/198-captain-arrives-next-turn-phone.png)

![Desktop: Pip's Captain joins at the next turn](./screenshots/198-captain-arrives-next-turn-desktop.png)

**Verifications:**

- [x] The active player now has the delayed third Agent available
- [x] The Chronicle records the next-turn arrival without granting a fourth Agent

---

## Pip reloads the appointed Captain

![Phone: Pip reloads the appointed Captain](./screenshots/199-reload-appointed-captain-phone.png)

![Desktop: Pip reloads the appointed Captain](./screenshots/199-reload-appointed-captain-desktop.png)

**Verifications:**

- [x] Captain ownership, third-Agent availability, payment, and occupation replay exactly
- [x] Every connected replay has accepted exactly 144 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/200-pits-isengard-funding-0-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/200-pits-isengard-funding-0-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 145 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/201-pits-isengard-funding-0-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/201-pits-isengard-funding-0-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 146 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/202-pits-isengard-funding-1-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/202-pits-isengard-funding-1-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 147 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/203-pits-isengard-funding-1-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/203-pits-isengard-funding-1-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 148 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/204-pits-isengard-funding-2-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/204-pits-isengard-funding-2-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 149 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/205-pits-isengard-funding-2-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/205-pits-isengard-funding-2-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 150 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/206-pits-isengard-choose-road-funding-3-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/206-pits-isengard-choose-road-funding-3-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/207-pits-isengard-earn-road-gold-3-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/207-pits-isengard-earn-road-gold-3-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 151 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/208-pits-isengard-funding-4-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/208-pits-isengard-funding-4-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 152 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/209-pits-isengard-funding-4-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/209-pits-isengard-funding-4-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 153 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/210-pits-isengard-funding-5-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/210-pits-isengard-funding-5-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 154 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/211-pits-isengard-funding-5-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/211-pits-isengard-funding-5-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 155 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/212-pits-isengard-choose-road-funding-6-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/212-pits-isengard-choose-road-funding-6-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/213-pits-isengard-earn-road-gold-6-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/213-pits-isengard-earn-road-gold-6-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 156 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/214-pits-isengard-funding-7-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/214-pits-isengard-funding-7-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 157 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/215-pits-isengard-funding-7-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/215-pits-isengard-funding-7-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 158 events with no diagnostics

---

## Pip chooses Armed Escort for Mithril funding

![Phone: Pip chooses Armed Escort for Mithril funding](./screenshots/216-pits-isengard-choose-council-funding-8-phone.png)

![Desktop: Pip chooses Armed Escort for Mithril funding](./screenshots/216-pits-isengard-choose-council-funding-8-desktop.png)

**Verifications:**

- [x] The established Council seat is legal with five Gold

---

## Pip pays for another Council audience

![Phone: Pip pays for another Council audience](./screenshots/217-pits-isengard-repeat-council-8-phone.png)

![Desktop: Pip pays for another Council audience](./screenshots/217-pits-isengard-repeat-council-8-desktop.png)

**Verifications:**

- [x] The five-Gold payment precedes the connected Scout window
- [x] Every connected replay has accepted exactly 159 events with no diagnostics

---

## Pip leaves the Council Scout to receive Mithril

![Phone: Pip leaves the Council Scout to receive Mithril](./screenshots/218-pits-isengard-decline-council-intelligence-8-phone.png)

![Desktop: Pip leaves the Council Scout to receive Mithril](./screenshots/218-pits-isengard-decline-council-intelligence-8-desktop.png)

**Verifications:**

- [x] The repeat Council reward adds exactly two Mithril after the ordered Scout window
- [x] Every connected replay has accepted exactly 160 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/219-pits-isengard-funding-9-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/219-pits-isengard-funding-9-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 161 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/220-pits-isengard-funding-9-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/220-pits-isengard-funding-9-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 162 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/221-pits-isengard-choose-road-funding-10-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/221-pits-isengard-choose-road-funding-10-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/222-pits-isengard-earn-road-gold-10-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/222-pits-isengard-earn-road-gold-10-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 163 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/223-pits-isengard-funding-11-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/223-pits-isengard-funding-11-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 164 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/224-pits-isengard-funding-11-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/224-pits-isengard-funding-11-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 165 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/225-pits-isengard-funding-12-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/225-pits-isengard-funding-12-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 166 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/226-pits-isengard-funding-12-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/226-pits-isengard-funding-12-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 167 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/227-pits-isengard-funding-13-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/227-pits-isengard-funding-13-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 168 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/228-pits-isengard-funding-13-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/228-pits-isengard-funding-13-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 169 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/229-pits-isengard-funding-14-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/229-pits-isengard-funding-14-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 170 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/230-pits-isengard-funding-14-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/230-pits-isengard-funding-14-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 171 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/231-pits-isengard-funding-15-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/231-pits-isengard-funding-15-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 172 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/232-pits-isengard-funding-15-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/232-pits-isengard-funding-15-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 173 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/233-pits-isengard-choose-road-funding-16-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/233-pits-isengard-choose-road-funding-16-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/234-pits-isengard-earn-road-gold-16-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/234-pits-isengard-earn-road-gold-16-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 174 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/235-pits-isengard-funding-17-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/235-pits-isengard-funding-17-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 175 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/236-pits-isengard-funding-17-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/236-pits-isengard-funding-17-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 176 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/237-pits-isengard-funding-18-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/237-pits-isengard-funding-18-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 177 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/238-pits-isengard-funding-18-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/238-pits-isengard-funding-18-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 178 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/239-pits-isengard-choose-road-funding-19-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/239-pits-isengard-choose-road-funding-19-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/240-pits-isengard-earn-road-gold-19-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/240-pits-isengard-earn-road-gold-19-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 179 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/241-pits-isengard-funding-20-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/241-pits-isengard-funding-20-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 180 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/242-pits-isengard-funding-20-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/242-pits-isengard-funding-20-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 181 events with no diagnostics

---

## Pip chooses Armed Escort for Mithril funding

![Phone: Pip chooses Armed Escort for Mithril funding](./screenshots/243-pits-isengard-choose-council-funding-21-phone.png)

![Desktop: Pip chooses Armed Escort for Mithril funding](./screenshots/243-pits-isengard-choose-council-funding-21-desktop.png)

**Verifications:**

- [x] The established Council seat is legal with five Gold

---

## Pip pays for another Council audience

![Phone: Pip pays for another Council audience](./screenshots/244-pits-isengard-repeat-council-21-phone.png)

![Desktop: Pip pays for another Council audience](./screenshots/244-pits-isengard-repeat-council-21-desktop.png)

**Verifications:**

- [x] The five-Gold payment precedes the connected Scout window
- [x] Every connected replay has accepted exactly 182 events with no diagnostics

---

## Pip leaves the Council Scout to receive Mithril

![Phone: Pip leaves the Council Scout to receive Mithril](./screenshots/245-pits-isengard-decline-council-intelligence-21-phone.png)

![Desktop: Pip leaves the Council Scout to receive Mithril](./screenshots/245-pits-isengard-decline-council-intelligence-21-desktop.png)

**Verifications:**

- [x] The repeat Council reward adds exactly two Mithril after the ordered Scout window
- [x] Every connected replay has accepted exactly 183 events with no diagnostics

---

## Pip chooses a faction mission for Pits of Isengard

![Phone: Pip chooses a faction mission for Pits of Isengard](./screenshots/246-choose-pits-isengard-mission-phone.png)

![Desktop: Pip chooses a faction mission for Pits of Isengard](./screenshots/246-choose-pits-isengard-mission-desktop.png)

**Verifications:**

- [x] Pits of Isengard is enabled only after its real Mithril funding is complete
- [x] The exact payment and rewards remain visible before commitment

---

## Pip enters Pits of Isengard

![Phone: Pip enters Pits of Isengard](./screenshots/247-visit-pits-isengard-phone.png)

![Desktop: Pip enters Pits of Isengard](./screenshots/247-visit-pits-isengard-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and exact 4-Mithril payment
- [x] Every connected replay has accepted exactly 184 events with no diagnostics

---

## Pits of Isengard resolves its complete reward

![Phone: Pits of Isengard resolves its complete reward](./screenshots/248-pits-isengard-resolved-phone.png)

![Desktop: Pits of Isengard resolves its complete reward](./screenshots/248-pits-isengard-resolved-desktop.png)

**Verifications:**

- [x] Shadow standing and private Fate each rise by one
- [x] Recruitment obeys the finite Company supply

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/249-deep-roads-funding-0-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/249-deep-roads-funding-0-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 185 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/250-deep-roads-funding-0-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/250-deep-roads-funding-0-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 186 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/251-deep-roads-choose-road-funding-1-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/251-deep-roads-choose-road-funding-1-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/252-deep-roads-earn-road-gold-1-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/252-deep-roads-earn-road-gold-1-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 187 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/253-deep-roads-funding-2-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/253-deep-roads-funding-2-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 188 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/254-deep-roads-funding-2-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/254-deep-roads-funding-2-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 189 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/255-deep-roads-funding-3-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/255-deep-roads-funding-3-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 190 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/256-deep-roads-funding-3-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/256-deep-roads-funding-3-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 191 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/257-deep-roads-funding-4-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/257-deep-roads-funding-4-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 192 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/258-deep-roads-funding-4-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/258-deep-roads-funding-4-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 193 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/259-deep-roads-funding-5-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/259-deep-roads-funding-5-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 194 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/260-deep-roads-funding-5-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/260-deep-roads-funding-5-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 195 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/261-deep-roads-funding-6-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/261-deep-roads-funding-6-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 196 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/262-deep-roads-funding-6-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/262-deep-roads-funding-6-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 197 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/263-deep-roads-choose-road-funding-7-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/263-deep-roads-choose-road-funding-7-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/264-deep-roads-earn-road-gold-7-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/264-deep-roads-earn-road-gold-7-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 198 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/265-deep-roads-funding-8-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/265-deep-roads-funding-8-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 199 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/266-deep-roads-funding-8-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/266-deep-roads-funding-8-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 200 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/267-deep-roads-funding-9-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/267-deep-roads-funding-9-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 201 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/268-deep-roads-funding-9-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/268-deep-roads-funding-9-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 202 events with no diagnostics

---

## Pip chooses Armed Escort for Mithril funding

![Phone: Pip chooses Armed Escort for Mithril funding](./screenshots/269-deep-roads-choose-council-funding-10-phone.png)

![Desktop: Pip chooses Armed Escort for Mithril funding](./screenshots/269-deep-roads-choose-council-funding-10-desktop.png)

**Verifications:**

- [x] The established Council seat is legal with five Gold

---

## Pip pays for another Council audience

![Phone: Pip pays for another Council audience](./screenshots/270-deep-roads-repeat-council-10-phone.png)

![Desktop: Pip pays for another Council audience](./screenshots/270-deep-roads-repeat-council-10-desktop.png)

**Verifications:**

- [x] The five-Gold payment precedes the connected Scout window
- [x] Every connected replay has accepted exactly 203 events with no diagnostics

---

## Pip leaves the Council Scout to receive Mithril

![Phone: Pip leaves the Council Scout to receive Mithril](./screenshots/271-deep-roads-decline-council-intelligence-10-phone.png)

![Desktop: Pip leaves the Council Scout to receive Mithril](./screenshots/271-deep-roads-decline-council-intelligence-10-desktop.png)

**Verifications:**

- [x] The repeat Council reward adds exactly two Mithril after the ordered Scout window
- [x] Every connected replay has accepted exactly 204 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/272-deep-roads-funding-11-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/272-deep-roads-funding-11-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 205 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/273-deep-roads-funding-11-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/273-deep-roads-funding-11-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 206 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/274-deep-roads-choose-road-funding-12-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/274-deep-roads-choose-road-funding-12-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/275-deep-roads-earn-road-gold-12-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/275-deep-roads-earn-road-gold-12-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 207 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/276-deep-roads-funding-13-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/276-deep-roads-funding-13-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 208 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/277-deep-roads-funding-13-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/277-deep-roads-funding-13-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 209 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/278-deep-roads-choose-road-funding-14-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/278-deep-roads-choose-road-funding-14-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/279-deep-roads-earn-road-gold-14-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/279-deep-roads-earn-road-gold-14-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 210 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/280-deep-roads-funding-15-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/280-deep-roads-funding-15-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 211 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/281-deep-roads-funding-15-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/281-deep-roads-funding-15-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 212 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/282-deep-roads-funding-16-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/282-deep-roads-funding-16-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 213 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/283-deep-roads-funding-16-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/283-deep-roads-funding-16-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 214 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/284-deep-roads-funding-17-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/284-deep-roads-funding-17-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 215 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/285-deep-roads-funding-17-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/285-deep-roads-funding-17-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 216 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/286-deep-roads-funding-18-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/286-deep-roads-funding-18-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 217 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/287-deep-roads-funding-18-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/287-deep-roads-funding-18-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 218 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/288-deep-roads-funding-19-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/288-deep-roads-funding-19-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 219 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/289-deep-roads-funding-19-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/289-deep-roads-funding-19-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 220 events with no diagnostics

---

## Pip chooses a Roads card for Council funding

![Phone: Pip chooses a Roads card for Council funding](./screenshots/290-deep-roads-choose-road-funding-20-phone.png)

![Desktop: Pip chooses a Roads card for Council funding](./screenshots/290-deep-roads-choose-road-funding-20-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is enabled by the selected real card

---

## Pip earns two Gold for the next Council audience

![Phone: Pip earns two Gold for the next Council audience](./screenshots/291-deep-roads-earn-road-gold-20-phone.png)

![Desktop: Pip earns two Gold for the next Council audience](./screenshots/291-deep-roads-earn-road-gold-20-desktop.png)

**Verifications:**

- [x] The treasury rises by exactly two Gold
- [x] Every connected replay has accepted exactly 221 events with no diagnostics

---

## Pip chooses Armed Escort for Mithril funding

![Phone: Pip chooses Armed Escort for Mithril funding](./screenshots/292-deep-roads-choose-council-funding-21-phone.png)

![Desktop: Pip chooses Armed Escort for Mithril funding](./screenshots/292-deep-roads-choose-council-funding-21-desktop.png)

**Verifications:**

- [x] The established Council seat is legal with five Gold

---

## Pip pays for another Council audience

![Phone: Pip pays for another Council audience](./screenshots/293-deep-roads-repeat-council-21-phone.png)

![Desktop: Pip pays for another Council audience](./screenshots/293-deep-roads-repeat-council-21-desktop.png)

**Verifications:**

- [x] The five-Gold payment precedes the connected Scout window
- [x] Every connected replay has accepted exactly 222 events with no diagnostics

---

## Pip leaves the Council Scout to receive Mithril

![Phone: Pip leaves the Council Scout to receive Mithril](./screenshots/294-deep-roads-decline-council-intelligence-21-phone.png)

![Desktop: Pip leaves the Council Scout to receive Mithril](./screenshots/294-deep-roads-decline-council-intelligence-21-desktop.png)

**Verifications:**

- [x] The repeat Council reward adds exactly two Mithril after the ordered Scout window
- [x] Every connected replay has accepted exactly 223 events with no diagnostics

---

## Pip chooses a faction mission for the Deep Roads

![Phone: Pip chooses a faction mission for the Deep Roads](./screenshots/295-choose-deep-roads-mission-phone.png)

![Desktop: Pip chooses a faction mission for the Deep Roads](./screenshots/295-choose-deep-roads-mission-desktop.png)

**Verifications:**

- [x] the Deep Roads is enabled only after its real Mithril funding is complete
- [x] The exact payment and rewards remain visible before commitment

---

## Pip enters the Deep Roads

![Phone: Pip enters the Deep Roads](./screenshots/296-visit-deep-roads-phone.png)

![Desktop: Pip enters the Deep Roads](./screenshots/296-visit-deep-roads-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and exact 5-Mithril payment
- [x] Every connected replay has accepted exactly 224 events with no diagnostics

---

## The Deep Roads resolves its complete Battle reward

![Phone: The Deep Roads resolves its complete Battle reward](./screenshots/297-deep-roads-resolved-phone.png)

![Desktop: The Deep Roads resolves its complete Battle reward](./screenshots/297-deep-roads-resolved-desktop.png)

**Verifications:**

- [x] Dwarven standing rises by one after the exact payment
- [x] Up to five Companies move from finite supply to garrison

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/298-hidden-paths-approach-0-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/298-hidden-paths-approach-0-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 225 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/299-hidden-paths-approach-0-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/299-hidden-paths-approach-0-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 226 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/300-hidden-paths-approach-1-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/300-hidden-paths-approach-1-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 227 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/301-hidden-paths-approach-1-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/301-hidden-paths-approach-1-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 228 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/302-hidden-paths-approach-2-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/302-hidden-paths-approach-2-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 229 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/303-hidden-paths-approach-2-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/303-hidden-paths-approach-2-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 230 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/304-hidden-paths-approach-3-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/304-hidden-paths-approach-3-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 231 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/305-hidden-paths-approach-3-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/305-hidden-paths-approach-3-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 232 events with no diagnostics

---

## Pip chooses a Wild-access mission for Hidden Paths

![Phone: Pip chooses a Wild-access mission for Hidden Paths](./screenshots/306-choose-hidden-paths-mission-phone.png)

![Desktop: Pip chooses a Wild-access mission for Hidden Paths](./screenshots/306-choose-hidden-paths-mission-desktop.png)

**Verifications:**

- [x] Hidden Paths is enabled by the selected real faction card

---

## Pip enters Hidden Paths

![Phone: Pip enters Hidden Paths](./screenshots/307-visit-hidden-paths-phone.png)

![Desktop: Pip enters Hidden Paths](./screenshots/307-visit-hidden-paths-desktop.png)

**Verifications:**

- [x] Every client sees the synchronized Agent occupation
- [x] Every connected replay has accepted exactly 233 events with no diagnostics

---

## Hidden Paths resolves its complete Battle reward

![Phone: Hidden Paths resolves its complete Battle reward](./screenshots/308-hidden-paths-resolved-phone.png)

![Desktop: Hidden Paths resolves its complete Battle reward](./screenshots/308-hidden-paths-resolved-desktop.png)

**Verifications:**

- [x] Wild standing rises by one and the private draw replaces the Journey card

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/309-ranger-mustering-approach-0-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/309-ranger-mustering-approach-0-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 234 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/310-ranger-mustering-approach-0-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/310-ranger-mustering-approach-0-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 235 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/311-ranger-mustering-approach-1-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/311-ranger-mustering-approach-1-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 236 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/312-ranger-mustering-approach-1-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/312-ranger-mustering-approach-1-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 237 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/313-ranger-mustering-approach-2-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/313-ranger-mustering-approach-2-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 238 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/314-ranger-mustering-approach-2-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/314-ranger-mustering-approach-2-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 239 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/315-ranger-mustering-approach-3-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/315-ranger-mustering-approach-3-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 240 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/316-ranger-mustering-approach-3-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/316-ranger-mustering-approach-3-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 241 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/317-ranger-mustering-approach-4-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/317-ranger-mustering-approach-4-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 242 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/318-ranger-mustering-approach-4-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/318-ranger-mustering-approach-4-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 243 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/319-ranger-mustering-approach-5-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/319-ranger-mustering-approach-5-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 244 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/320-ranger-mustering-approach-5-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/320-ranger-mustering-approach-5-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 245 events with no diagnostics

---

## Mara Reveals without buying

![Phone: Mara Reveals without buying](./screenshots/321-ranger-mustering-approach-6-mara-reveal-phone.png)

![Desktop: Mara Reveals without buying](./screenshots/321-ranger-mustering-approach-6-mara-reveal-desktop.png)

**Verifications:**

- [x] Mara's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 246 events with no diagnostics

---

## Mara finishes Reveal without an acquisition

![Phone: Mara finishes Reveal without an acquisition](./screenshots/322-ranger-mustering-approach-6-mara-finish-phone.png)

![Desktop: Mara finishes Reveal without an acquisition](./screenshots/322-ranger-mustering-approach-6-mara-finish-desktop.png)

**Verifications:**

- [x] Mara's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 247 events with no diagnostics

---

## Pip chooses a Wild-access mission for Ranger Mustering

![Phone: Pip chooses a Wild-access mission for Ranger Mustering](./screenshots/323-choose-ranger-mustering-mission-phone.png)

![Desktop: Pip chooses a Wild-access mission for Ranger Mustering](./screenshots/323-choose-ranger-mustering-mission-desktop.png)

**Verifications:**

- [x] Ranger Mustering is enabled by the selected real faction card

---

## Pip enters Ranger Mustering

![Phone: Pip enters Ranger Mustering](./screenshots/324-visit-ranger-mustering-phone.png)

![Desktop: Pip enters Ranger Mustering](./screenshots/324-visit-ranger-mustering-desktop.png)

**Verifications:**

- [x] Every client sees the synchronized Agent occupation
- [x] Every connected replay has accepted exactly 248 events with no diagnostics

---

## Ranger Mustering opens its private trash choice

![Phone: Ranger Mustering opens its private trash choice](./screenshots/325-ranger-mustering-choice-phone.png)

![Desktop: Ranger Mustering opens its private trash choice](./screenshots/325-ranger-mustering-choice-desktop.png)

**Verifications:**

- [x] One Provision is paid, Wild standing rises, and finite recruitment resolves before the choice
- [x] Only the actor sees named eligible cards and can trash one

---

## Pip trashes a real card at Ranger Mustering

![Phone: Pip trashes a real card at Ranger Mustering](./screenshots/326-trash-at-ranger-mustering-phone.png)

![Desktop: Pip trashes a real card at Ranger Mustering](./screenshots/326-trash-at-ranger-mustering-desktop.png)

**Verifications:**

- [x] The permanent Trash zone grows by exactly one card
- [x] Every connected replay has accepted exactly 249 events with no diagnostics

---

## Pip reloads all four completed faction destinations

![Phone: Pip reloads all four completed faction destinations](./screenshots/327-reload-faction-destinations-phone.png)

![Desktop: Pip reloads all four completed faction destinations](./screenshots/327-reload-faction-destinations-desktop.png)

**Verifications:**

- [x] Paid resources, faction standing, draws, recruitment, trash, and occupations replay exactly
- [x] Every connected replay has accepted exactly 249 events with no diagnostics

---

## Rin Reveals without buying

![Phone: Rin Reveals without buying](./screenshots/328-fangorn-draught-approach-0-rin-reveal-phone.png)

![Desktop: Rin Reveals without buying](./screenshots/328-fangorn-draught-approach-0-rin-reveal-desktop.png)

**Verifications:**

- [x] Rin's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 250 events with no diagnostics

---

## Rin finishes Reveal without an acquisition

![Phone: Rin finishes Reveal without an acquisition](./screenshots/329-fangorn-draught-approach-0-rin-finish-phone.png)

![Desktop: Rin finishes Reveal without an acquisition](./screenshots/329-fangorn-draught-approach-0-rin-finish-desktop.png)

**Verifications:**

- [x] Rin's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 251 events with no diagnostics

---

## Pip chooses Armed Escort Agent: Council for Fangorn Moot

![Phone: Pip chooses Armed Escort Agent: Council for Fangorn Moot](./screenshots/330-choose-fangorn-draught-phone.png)

![Desktop: Pip chooses Armed Escort Agent: Council for Fangorn Moot](./screenshots/330-choose-fangorn-draught-desktop.png)

**Verifications:**

- [x] Wild respect and the selected Stronghold icon make Fangorn Moot legal

---

## Pip convenes Fangorn Moot

![Phone: Pip convenes Fangorn Moot](./screenshots/331-visit-fangorn-draught-phone.png)

![Desktop: Pip convenes Fangorn Moot](./screenshots/331-visit-fangorn-draught-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and the ordered final Moot decision
- [x] Both complete branches are offered while the Dam is intact
- [x] Every connected replay has accepted exactly 252 events with no diagnostics

---

## Pip takes the persistent Ent-draught

![Phone: Pip takes the persistent Ent-draught](./screenshots/332-resolve-fangorn-draught-phone.png)

![Desktop: Pip takes the persistent Ent-draught](./screenshots/332-resolve-fangorn-draught-desktop.png)

**Verifications:**

- [x] Ent-draught, one Provision, and finite recruitment resolve publicly
- [x] Every connected replay has accepted exactly 253 events with no diagnostics

---

## Pip Reveals without buying

![Phone: Pip Reveals without buying](./screenshots/333-fangorn-breach-approach-0-pip-reveal-phone.png)

![Desktop: Pip Reveals without buying](./screenshots/333-fangorn-breach-approach-0-pip-reveal-desktop.png)

**Verifications:**

- [x] Pip's real remaining hand becomes the public Muster row
- [x] Every connected replay has accepted exactly 254 events with no diagnostics

---

## Pip finishes Reveal without an acquisition

![Phone: Pip finishes Reveal without an acquisition](./screenshots/334-fangorn-breach-approach-0-pip-finish-phone.png)

![Desktop: Pip finishes Reveal without an acquisition](./screenshots/334-fangorn-breach-approach-0-pip-finish-desktop.png)

**Verifications:**

- [x] Pip's cards leave Muster and remain conserved
- [x] Every connected replay has accepted exactly 255 events with no diagnostics

---

## Pip chooses Armed Escort Agent: Council for Fangorn Moot

![Phone: Pip chooses Armed Escort Agent: Council for Fangorn Moot](./screenshots/335-choose-fangorn-breach-phone.png)

![Desktop: Pip chooses Armed Escort Agent: Council for Fangorn Moot](./screenshots/335-choose-fangorn-breach-desktop.png)

**Verifications:**

- [x] Wild respect and the selected Stronghold icon make Fangorn Moot legal

---

## Pip convenes Fangorn Moot

![Phone: Pip convenes Fangorn Moot](./screenshots/336-visit-fangorn-breach-phone.png)

![Desktop: Pip convenes Fangorn Moot](./screenshots/336-visit-fangorn-breach-desktop.png)

**Verifications:**

- [x] Every client sees the Agent and the ordered final Moot decision
- [x] The persistent Ent-draught cannot be taken a second time
- [x] Every connected replay has accepted exactly 256 events with no diagnostics

---

## Pip breaches the Dam

![Phone: Pip breaches the Dam](./screenshots/337-resolve-fangorn-breach-phone.png)

![Desktop: Pip breaches the Dam](./screenshots/337-resolve-fangorn-breach-desktop.png)

**Verifications:**

- [x] One Provision is gained and every client sees the permanent breach
- [x] Every connected replay has accepted exactly 257 events with no diagnostics

---

## Pip reloads the completed Fangorn decisions

![Phone: Pip reloads the completed Fangorn decisions](./screenshots/338-reload-fangorn-moot-phone.png)

![Desktop: Pip reloads the completed Fangorn decisions](./screenshots/338-reload-fangorn-moot-desktop.png)

**Verifications:**

- [x] Ent-draught ownership and the breached Dam replay exactly
- [x] Every connected replay has accepted exactly 257 events with no diagnostics

---
