# Test: Hall of Fire Fate and temporary Reveal tracer

Three isolated humans start a real Firebase match. One draws a private Fate at Hall of Fire, Reveals for exactly one extra Influence while the Agent remains, then proves after Recall and reload that Fate persists while the temporary bonus does not.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The host name is entered through the real lobby field

---

## Mara chooses a Hall of Fire invitation

![Phone: Mara chooses a Hall of Fire invitation](./screenshots/001-host-room-code-phone.png)

![Desktop: Mara chooses a Hall of Fire invitation](./screenshots/001-host-room-code-desktop.png)

**Verifications:**

- [x] The five-character invitation is visible

---

## Mara creates the shared room

![Phone: Mara creates the shared room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the shared room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The live room opens with the requested invitation
- [x] All three immutable replays accept exactly 1 events with no diagnostics

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] Rin's entered name is visible

---

## Rin enters the invitation

![Phone: Rin enters the invitation](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the invitation](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The exact shared invitation is entered

---

## Rin joins from an isolated browser

![Phone: Rin joins from an isolated browser](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins from an isolated browser](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 2 public seats
- [x] All three immutable replays accept exactly 2 events with no diagnostics

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] Pip's entered name is visible

---

## Pip enters the invitation

![Phone: Pip enters the invitation](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the invitation](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The exact shared invitation is entered

---

## Pip joins from an isolated browser

![Phone: Pip joins from an isolated browser](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins from an isolated browser](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 3 public seats
- [x] All three immutable replays accept exactly 3 events with no diagnostics

---

## Mara claims Aragorn

![Phone: Mara claims Aragorn](./screenshots/009-seat-1-commander-phone.png)

![Desktop: Mara claims Aragorn](./screenshots/009-seat-1-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected
- [x] All three immutable replays accept exactly 4 events with no diagnostics

---

## Mara readies their seat

![Phone: Mara readies their seat](./screenshots/010-seat-1-ready-phone.png)

![Desktop: Mara readies their seat](./screenshots/010-seat-1-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready
- [x] All three immutable replays accept exactly 5 events with no diagnostics

---

## Rin claims Galadriel

![Phone: Rin claims Galadriel](./screenshots/011-seat-2-commander-phone.png)

![Desktop: Rin claims Galadriel](./screenshots/011-seat-2-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected
- [x] All three immutable replays accept exactly 6 events with no diagnostics

---

## Rin readies their seat

![Phone: Rin readies their seat](./screenshots/012-seat-2-ready-phone.png)

![Desktop: Rin readies their seat](./screenshots/012-seat-2-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready
- [x] All three immutable replays accept exactly 7 events with no diagnostics

---

## Pip claims Gandalf

![Phone: Pip claims Gandalf](./screenshots/013-seat-3-commander-phone.png)

![Desktop: Pip claims Gandalf](./screenshots/013-seat-3-commander-desktop.png)

**Verifications:**

- [x] The unique power-free Commander is visibly selected
- [x] All three immutable replays accept exactly 8 events with no diagnostics

---

## Pip readies their seat

![Phone: Pip readies their seat](./screenshots/014-seat-3-ready-phone.png)

![Desktop: Pip readies their seat](./screenshots/014-seat-3-ready-desktop.png)

**Verifications:**

- [x] Every observer sees the seat as Ready
- [x] All three immutable replays accept exactly 9 events with no diagnostics

---

## Mara chooses the published Hall of Fire seed

![Phone: Mara chooses the published Hall of Fire seed](./screenshots/015-choose-hall-seed-phone.png)

![Desktop: Mara chooses the published Hall of Fire seed](./screenshots/015-choose-hall-seed-desktop.png)

**Verifications:**

- [x] The deterministic seed is entered through the host control

---

## Mara starts the deterministic match

![Phone: Mara starts the deterministic match](./screenshots/016-start-match-phone.png)

![Desktop: Mara starts the deterministic match](./screenshots/016-start-match-desktop.png)

**Verifications:**

- [x] All three humans reach the canonical production board
- [x] All three immutable replays accept exactly 10 events with no diagnostics

---

## Mara chooses The Open Road

![Phone: Mara chooses The Open Road](./screenshots/017-choose-open-road-phone.png)

![Desktop: Mara chooses The Open Road](./screenshots/017-choose-open-road-desktop.png)

**Verifications:**

- [x] The real Roads card enables Take Up a War Effort

---

## Mara travels the road to draw a Council card

![Phone: Mara travels the road to draw a Council card](./screenshots/018-draw-council-escort-phone.png)

![Desktop: Mara travels the road to draw a Council card](./screenshots/018-draw-council-escort-desktop.png)

**Verifications:**

- [x] The board draw adds Armed Escort to the private hand
- [x] All observers see the public Roads Agent and two Gold
- [x] All three immutable replays accept exactly 11 events with no diagnostics

---

## Pip Reveals rather than placing an Agent

![Phone: Pip Reveals rather than placing an Agent](./screenshots/019-first-other-reveal-phone.png)

![Desktop: Pip Reveals rather than placing an Agent](./screenshots/019-first-other-reveal-desktop.png)

**Verifications:**

- [x] Pip's actual hand becomes the public Muster row
- [x] All three immutable replays accept exactly 12 events with no diagnostics

---

## Pip finishes the Reveal

![Phone: Pip finishes the Reveal](./screenshots/020-first-other-finish-phone.png)

![Desktop: Pip finishes the Reveal](./screenshots/020-first-other-finish-desktop.png)

**Verifications:**

- [x] The public Muster row closes before play advances
- [x] All three immutable replays accept exactly 13 events with no diagnostics

---

## Rin Reveals rather than placing an Agent

![Phone: Rin Reveals rather than placing an Agent](./screenshots/021-second-other-reveal-phone.png)

![Desktop: Rin Reveals rather than placing an Agent](./screenshots/021-second-other-reveal-desktop.png)

**Verifications:**

- [x] Rin's actual hand becomes the public Muster row
- [x] All three immutable replays accept exactly 14 events with no diagnostics

---

## Rin finishes the Reveal

![Phone: Rin finishes the Reveal](./screenshots/022-second-other-finish-phone.png)

![Desktop: Rin finishes the Reveal](./screenshots/022-second-other-finish-desktop.png)

**Verifications:**

- [x] The public Muster row closes before play advances
- [x] All three immutable replays accept exactly 15 events with no diagnostics

---

## Mara chooses Armed Escort for Hall of Fire

![Phone: Mara chooses Armed Escort for Hall of Fire](./screenshots/023-choose-armed-escort-phone.png)

![Desktop: Mara chooses Armed Escort for Hall of Fire](./screenshots/023-choose-armed-escort-desktop.png)

**Verifications:**

- [x] Hall of Fire is a genuine legal Council destination
- [x] Both reviewed Council destinations are presented without enabling the paid seat

---

## Mara sends an Agent to Hall of Fire

![Phone: Mara sends an Agent to Hall of Fire](./screenshots/024-enter-hall-of-fire-phone.png)

![Desktop: Mara sends an Agent to Hall of Fire](./screenshots/024-enter-hall-of-fire-desktop.png)

**Verifications:**

- [x] Every board shows the named Hall of Fire Agent
- [x] One private Fate and Armed Escort recruitment resolve exactly once
- [x] The Chronicle states the conditional Reveal reward without exposing Fate identity
- [x] All three immutable replays accept exactly 16 events with no diagnostics

---

## Mara reloads the occupied Hall

![Phone: Mara reloads the occupied Hall](./screenshots/025-reload-hall-of-fire-phone.png)

![Desktop: Mara reloads the occupied Hall](./screenshots/025-reload-hall-of-fire-desktop.png)

**Verifications:**

- [x] Hall occupation, Fate count, and recruitment replay exactly
- [x] All three immutable replays accept exactly 16 events with no diagnostics

---

## Mara Reveals while the Hall Agent remains

![Phone: Mara Reveals while the Hall Agent remains](./screenshots/026-reveal-with-hall-fire-phone.png)

![Desktop: Mara Reveals while the Hall Agent remains](./screenshots/026-reveal-with-hall-fire-desktop.png)

**Verifications:**

- [x] The public total is exactly the card total plus one Hall Influence
- [x] All three immutable replays accept exactly 17 events with no diagnostics

---

## Mara finishes the Hall-supported Reveal

![Phone: Mara finishes the Hall-supported Reveal](./screenshots/027-finish-hall-reveal-phone.png)

![Desktop: Mara finishes the Hall-supported Reveal](./screenshots/027-finish-hall-reveal-desktop.png)

**Verifications:**

- [x] Recall opens round two and returns the Hall Agent
- [x] All three immutable replays accept exactly 18 events with no diagnostics

---

## Pip Reveals rather than placing an Agent

![Phone: Pip Reveals rather than placing an Agent](./screenshots/028-round-two-first-other-reveal-phone.png)

![Desktop: Pip Reveals rather than placing an Agent](./screenshots/028-round-two-first-other-reveal-desktop.png)

**Verifications:**

- [x] Pip's actual hand becomes the public Muster row
- [x] All three immutable replays accept exactly 19 events with no diagnostics

---

## Pip finishes the Reveal

![Phone: Pip finishes the Reveal](./screenshots/029-round-two-first-other-finish-phone.png)

![Desktop: Pip finishes the Reveal](./screenshots/029-round-two-first-other-finish-desktop.png)

**Verifications:**

- [x] The public Muster row closes before play advances
- [x] All three immutable replays accept exactly 20 events with no diagnostics

---

## Rin Reveals rather than placing an Agent

![Phone: Rin Reveals rather than placing an Agent](./screenshots/030-round-two-second-other-reveal-phone.png)

![Desktop: Rin Reveals rather than placing an Agent](./screenshots/030-round-two-second-other-reveal-desktop.png)

**Verifications:**

- [x] Rin's actual hand becomes the public Muster row
- [x] All three immutable replays accept exactly 21 events with no diagnostics

---

## Rin finishes the Reveal

![Phone: Rin finishes the Reveal](./screenshots/031-round-two-second-other-finish-phone.png)

![Desktop: Rin finishes the Reveal](./screenshots/031-round-two-second-other-finish-desktop.png)

**Verifications:**

- [x] The public Muster row closes before play advances
- [x] All three immutable replays accept exactly 22 events with no diagnostics

---

## Mara Reveals after the Hall Agent returned

![Phone: Mara Reveals after the Hall Agent returned](./screenshots/032-reveal-without-hall-fire-phone.png)

![Desktop: Mara Reveals after the Hall Agent returned](./screenshots/032-reveal-without-hall-fire-desktop.png)

**Verifications:**

- [x] The expired Hall bonus is absent from the exact card-only total
- [x] The private Fate instance remains conserved across Recall
- [x] All three immutable replays accept exactly 23 events with no diagnostics

---

## Mara finishes the Reveal without Hall support

![Phone: Mara finishes the Reveal without Hall support](./screenshots/033-finish-plain-reveal-phone.png)

![Desktop: Mara finishes the Reveal without Hall support](./screenshots/033-finish-plain-reveal-desktop.png)

**Verifications:**

- [x] All three humans enter round three with the Fate instance intact
- [x] All three immutable replays accept exactly 24 events with no diagnostics

---

## Mara reloads after the Hall bonus expires

![Phone: Mara reloads after the Hall bonus expires](./screenshots/034-reload-expired-hall-bonus-phone.png)

![Desktop: Mara reloads after the Hall bonus expires](./screenshots/034-reload-expired-hall-bonus-desktop.png)

**Verifications:**

- [x] The empty Hall, persistent Fate, and round-three replay remain exact
- [x] All three immutable replays accept exactly 24 events with no diagnostics

---
