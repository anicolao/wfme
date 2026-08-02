# Test: Scout infiltration through an occupied destination

Three isolated humans start from the real lobby. One places a Scout, another blocks a connected destination, and the Scout owner later recalls it to place a second Agent without replacing the blocker.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The host name is entered through the real lobby control

---

## Mara chooses an infiltration room code

![Phone: Mara chooses an infiltration room code](./screenshots/001-host-room-code-phone.png)

![Desktop: Mara chooses an infiltration room code](./screenshots/001-host-room-code-desktop.png)

**Verifications:**

- [x] The exact five-character invitation is visible

---

## Mara creates the shared room

![Phone: Mara creates the shared room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the shared room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The live room opens with one public seat

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] Rin's name is visible

---

## Rin enters the invitation

![Phone: Rin enters the invitation](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the invitation](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The shared invitation is entered exactly

---

## Rin joins from an isolated browser

![Phone: Rin joins from an isolated browser](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins from an isolated browser](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 2 public seats

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] Pip's name is visible

---

## Pip enters the invitation

![Phone: Pip enters the invitation](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the invitation](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The shared invitation is entered exactly

---

## Pip joins from an isolated browser

![Phone: Pip joins from an isolated browser](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins from an isolated browser](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 3 public seats

---

## Mara claims Aragorn

![Phone: Mara claims Aragorn](./screenshots/009-seat-1-commander-phone.png)

![Desktop: Mara claims Aragorn](./screenshots/009-seat-1-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected

---

## Mara readies their seat

![Phone: Mara readies their seat](./screenshots/010-seat-1-ready-phone.png)

![Desktop: Mara readies their seat](./screenshots/010-seat-1-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready

---

## Rin claims Galadriel

![Phone: Rin claims Galadriel](./screenshots/011-seat-2-commander-phone.png)

![Desktop: Rin claims Galadriel](./screenshots/011-seat-2-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected

---

## Rin readies their seat

![Phone: Rin readies their seat](./screenshots/012-seat-2-ready-phone.png)

![Desktop: Rin readies their seat](./screenshots/012-seat-2-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready

---

## Pip claims Gandalf

![Phone: Pip claims Gandalf](./screenshots/013-seat-3-commander-phone.png)

![Desktop: Pip claims Gandalf](./screenshots/013-seat-3-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected

---

## Pip readies their seat

![Phone: Pip readies their seat](./screenshots/014-seat-3-ready-phone.png)

![Desktop: Pip readies their seat](./screenshots/014-seat-3-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready

---

## Mara chooses the published infiltration seed

![Phone: Mara chooses the published infiltration seed](./screenshots/015-choose-infiltration-seed-phone.png)

![Desktop: Mara chooses the published infiltration seed](./screenshots/015-choose-infiltration-seed-desktop.png)

**Verifications:**

- [x] The deterministic seed is entered through the host setup

---

## Mara starts the deterministic match

![Phone: Mara starts the deterministic match](./screenshots/016-start-match-phone.png)

![Desktop: Mara starts the deterministic match](./screenshots/016-start-match-desktop.png)

**Verifications:**

- [x] All three humans reach the canonical production board
- [x] Pip is the published first actor with a private Reconnaissance card
- [x] All three immutable replays accept exactly 10 events with no diagnostics

---

## Pip chooses Reconnaissance

![Phone: Pip chooses Reconnaissance](./screenshots/017-choose-reconnaissance-phone.png)

![Desktop: Pip chooses Reconnaissance](./screenshots/017-choose-reconnaissance-desktop.png)

**Verifications:**

- [x] Take Up a War Effort is legal through the Roads icon

---

## Pip sends the Reconnaissance Agent to the road

![Phone: Pip sends the Reconnaissance Agent to the road](./screenshots/018-place-recon-agent-phone.png)

![Desktop: Pip sends the Reconnaissance Agent to the road](./screenshots/018-place-recon-agent-desktop.png)

**Verifications:**

- [x] The Roads reward resolves and the blocking Scout-placement choice opens
- [x] All three immutable replays accept exactly 11 events with no diagnostics

---

## Pip places a Scout at Redhorn Pass

![Phone: Pip places a Scout at Redhorn Pass](./screenshots/019-place-redhorn-scout-phone.png)

![Desktop: Pip places a Scout at Redhorn Pass](./screenshots/019-place-redhorn-scout-desktop.png)

**Verifications:**

- [x] Every human sees Pip at Redhorn Pass and two Scouts in supply
- [x] All three immutable replays accept exactly 12 events with no diagnostics

---

## Mara chooses Diplomatic Mission

![Phone: Mara chooses Diplomatic Mission](./screenshots/020-choose-blocking-mission-phone.png)

![Desktop: Mara chooses Diplomatic Mission](./screenshots/020-choose-blocking-mission-desktop.png)

**Verifications:**

- [x] Dwarven Caravans is a normal legal faction destination

---

## Mara blocks Dwarven Caravans

![Phone: Mara blocks Dwarven Caravans](./screenshots/021-block-dwarven-caravans-phone.png)

![Desktop: Mara blocks Dwarven Caravans](./screenshots/021-block-dwarven-caravans-desktop.png)

**Verifications:**

- [x] Every human sees Mara occupying the connected destination
- [x] All three immutable replays accept exactly 13 events with no diagnostics

---

## Rin Reveals rather than taking an Agent turn

![Phone: Rin Reveals rather than taking an Agent turn](./screenshots/022-third-reveals-phone.png)

![Desktop: Rin Reveals rather than taking an Agent turn](./screenshots/022-third-reveals-desktop.png)

**Verifications:**

- [x] Rin’s actual hand becomes a public Muster row
- [x] All three immutable replays accept exactly 14 events with no diagnostics

---

## Rin finishes the Reveal turn

![Phone: Rin finishes the Reveal turn](./screenshots/023-third-finishes-phone.png)

![Desktop: Rin finishes the Reveal turn](./screenshots/023-third-finishes-desktop.png)

**Verifications:**

- [x] The turn returns to Pip with the blocker still present
- [x] All three immutable replays accept exactly 15 events with no diagnostics

---

## Pip chooses a matching Diplomatic Mission

![Phone: Pip chooses a matching Diplomatic Mission](./screenshots/024-choose-infiltrating-mission-phone.png)

![Desktop: Pip chooses a matching Diplomatic Mission](./screenshots/024-choose-infiltrating-mission-desktop.png)

**Verifications:**

- [x] The occupied Dwarven space becomes legal only because Redhorn Pass is connected

---

## Pip chooses the occupied Dwarven destination

![Phone: Pip chooses the occupied Dwarven destination](./screenshots/025-choose-occupied-destination-phone.png)

![Desktop: Pip chooses the occupied Dwarven destination](./screenshots/025-choose-occupied-destination-desktop.png)

**Verifications:**

- [x] The UI asks which connected Scout to recall before committing
- [x] No immutable event or reward occurs before the recall is confirmed

---

## Pip recalls Redhorn Pass to infiltrate

![Phone: Pip recalls Redhorn Pass to infiltrate](./screenshots/026-recall-to-infiltrate-phone.png)

![Desktop: Pip recalls Redhorn Pass to infiltrate](./screenshots/026-recall-to-infiltrate-desktop.png)

**Verifications:**

- [x] Both named Agents share Dwarven Caravans on every board
- [x] Redhorn Pass empties and Pip’s Scout returns to supply
- [x] Pip receives the full Dwarven space effect after the infiltration cost
- [x] The Chronicle records Scout recall before the Agent resolution
- [x] All three immutable replays accept exactly 16 events with no diagnostics

---

## Pip reloads the infiltrated board

![Phone: Pip reloads the infiltrated board](./screenshots/027-reload-infiltration-phone.png)

![Desktop: Pip reloads the infiltrated board](./screenshots/027-reload-infiltration-desktop.png)

**Verifications:**

- [x] Both Agents, recalled Scout, and rewards replay identically
- [x] All three immutable replays accept exactly 16 events with no diagnostics

---
