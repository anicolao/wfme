# Test: Galadriel — Foresight

Three isolated humans select Galadriel, draw through Hall of Fire, prove that only she can identify and choose one of the top two physical Fate cards, reload the pending choice, put the unchosen card on the exact deck bottom without discarding it, and later draw Fate again in the same round without repeating the once-per-round power.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The real lobby accepts the host name

---

## Mara enters the Plot Fate room code

![Phone: Mara enters the Plot Fate room code](./screenshots/001-host-code-phone.png)

![Desktop: Mara enters the Plot Fate room code](./screenshots/001-host-code-desktop.png)

**Verifications:**

- [x] The exact invitation is visible

---

## Mara creates the Firebase room

![Phone: Mara creates the Firebase room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the Firebase room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The requested room opens
- [x] Every connected browser replays 1 accepted events with no diagnostics

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] The isolated browser retains the name

---

## Rin enters the invitation

![Phone: Rin enters the invitation](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the invitation](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The isolated browser uses the shared invitation

---

## Rin joins the room

![Phone: Rin joins the room](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins the room](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Every connected lobby sees the joined seat
- [x] Every connected browser replays 2 accepted events with no diagnostics

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] The isolated browser retains the name

---

## Pip enters the invitation

![Phone: Pip enters the invitation](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the invitation](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The isolated browser uses the shared invitation

---

## Pip joins the room

![Phone: Pip joins the room](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins the room](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Every connected lobby sees the joined seat
- [x] Every connected browser replays 3 accepted events with no diagnostics

---

## Mara selects Aragorn

![Phone: Mara selects Aragorn](./screenshots/009-commander-1-phone.png)

![Desktop: Mara selects Aragorn](./screenshots/009-commander-1-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 4 accepted events with no diagnostics

---

## Mara readies

![Phone: Mara readies](./screenshots/010-ready-1-phone.png)

![Desktop: Mara readies](./screenshots/010-ready-1-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 5 accepted events with no diagnostics

---

## Rin selects Galadriel

![Phone: Rin selects Galadriel](./screenshots/011-commander-2-phone.png)

![Desktop: Rin selects Galadriel](./screenshots/011-commander-2-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 6 accepted events with no diagnostics

---

## Rin readies

![Phone: Rin readies](./screenshots/012-ready-2-phone.png)

![Desktop: Rin readies](./screenshots/012-ready-2-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 7 accepted events with no diagnostics

---

## Pip selects Gandalf

![Phone: Pip selects Gandalf](./screenshots/013-commander-3-phone.png)

![Desktop: Pip selects Gandalf](./screenshots/013-commander-3-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 8 accepted events with no diagnostics

---

## Pip readies

![Phone: Pip readies](./screenshots/014-ready-3-phone.png)

![Desktop: Pip readies](./screenshots/014-ready-3-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 9 accepted events with no diagnostics

---

## Mara enters the published Plot Fate seed

![Phone: Mara enters the published Plot Fate seed](./screenshots/015-plot-seed-phone.png)

![Desktop: Mara enters the published Plot Fate seed](./screenshots/015-plot-seed-desktop.png)

**Verifications:**

- [x] The deterministic seed is visible

---

## Mara starts the Plot Fate match

![Phone: Mara starts the Plot Fate match](./screenshots/016-start-match-phone.png)

![Desktop: Mara starts the Plot Fate match](./screenshots/016-start-match-desktop.png)

**Verifications:**

- [x] Every human reaches the complete production board
- [x] Every connected browser replays 10 accepted events with no diagnostics

---

## Rin selects Armed Escort

![Phone: Rin selects Armed Escort](./screenshots/017-select-escort-phone.png)

![Desktop: Rin selects Armed Escort](./screenshots/017-select-escort-desktop.png)

**Verifications:**

- [x] The physical Council card enables Hall of Fire

---

## Rin enters the Hall of Fire

![Phone: Rin enters the Hall of Fire](./screenshots/018-enter-hall-phone.png)

![Desktop: Rin enters the Hall of Fire](./screenshots/018-enter-hall-desktop.png)

**Verifications:**

- [x] The Fate draw stops at Galadriel’s private once-per-round Foresight decision
- [x] Observers see two opaque disabled options and neither private identity
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Rin reloads the private Foresight choice

![Phone: Rin reloads the private Foresight choice](./screenshots/019-reload-foresight-phone.png)

![Desktop: Rin reloads the private Foresight choice](./screenshots/019-reload-foresight-desktop.png)

**Verifications:**

- [x] Replay restores the same two exact private options before any Fate enters hand
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Rin takes Keeper of Oaths

![Phone: Rin takes Keeper of Oaths](./screenshots/020-take-keeper-phone.png)

![Desktop: Rin takes Keeper of Oaths](./screenshots/020-take-keeper-desktop.png)

**Verifications:**

- [x] Exactly one private Fate enters Galadriel’s hand and the unchosen card is bottom-decked, not discarded
- [x] The private choice closes and ordinary turn authority advances
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Mara Reveals

![Phone: Mara Reveals](./screenshots/021-reveal-1-phone.png)

![Desktop: Mara Reveals](./screenshots/021-reveal-1-desktop.png)

**Verifications:**

- [x] The public Muster row belongs to the acting human
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/022-finish-reveal-1-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/022-finish-reveal-1-desktop.png)

**Verifications:**

- [x] Authority advances through the ordinary shared turn order
- [x] Every connected browser replays 14 accepted events with no diagnostics

---

## Pip Reveals

![Phone: Pip Reveals](./screenshots/023-reveal-2-phone.png)

![Desktop: Pip Reveals](./screenshots/023-reveal-2-desktop.png)

**Verifications:**

- [x] The public Muster row belongs to the acting human
- [x] Every connected browser replays 15 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/024-finish-reveal-2-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/024-finish-reveal-2-desktop.png)

**Verifications:**

- [x] Authority advances through the ordinary shared turn order
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Rin selects Diplomatic Mission

![Phone: Rin selects Diplomatic Mission](./screenshots/025-select-mission-phone.png)

![Desktop: Rin selects Diplomatic Mission](./screenshots/025-select-mission-desktop.png)

**Verifications:**

- [x] The physical Elven card enables Hidden Counsel

---

## Rin enters Hidden Counsel

![Phone: Rin enters Hidden Counsel](./screenshots/026-enter-hidden-counsel-phone.png)

![Desktop: Rin enters Hidden Counsel](./screenshots/026-enter-hidden-counsel-desktop.png)

**Verifications:**

- [x] The second Fate draw in the same round resolves normally without another Commander choice
- [x] Every connected browser replays 17 accepted events with no diagnostics

---

## Rin reloads after the ordinary second draw

![Phone: Rin reloads after the ordinary second draw](./screenshots/027-reload-used-foresight-phone.png)

![Desktop: Rin reloads after the ordinary second draw](./screenshots/027-reload-used-foresight-desktop.png)

**Verifications:**

- [x] Replay preserves two Fate cards, one Foresight trigger, and no unresolved choice
- [x] Every connected browser replays 17 accepted events with no diagnostics

---
