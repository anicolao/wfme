# Test: Divided Counsel Plot Fate tracer

Three isolated human browsers draw private Divided Counsel, take ordinary Agent actions, choose a funded opponent, let that opponent reveal by click out of turn, enforce the hand identity boundary, reload the private review, and prove the interrupted Agent turn resumes. Reducer tests separately execute the lose-Gold branch.

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

## Pip selects Armed Escort

![Phone: Pip selects Armed Escort](./screenshots/017-select-hall-card-phone.png)

![Desktop: Pip selects Armed Escort](./screenshots/017-select-hall-card-desktop.png)

**Verifications:**

- [x] The Council icon enables Hall of Fire through the actual card control

---

## Pip enters Hall of Fire

![Phone: Pip enters Hall of Fire](./screenshots/018-enter-hall-phone.png)

![Desktop: Pip enters Hall of Fire](./screenshots/018-enter-hall-desktop.png)

**Verifications:**

- [x] Every observer sees one private Fate card and the public Hall occupation
- [x] No observer learns the private Fate identity
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Mara selects Diplomatic Mission

![Phone: Mara selects Diplomatic Mission](./screenshots/019-target-select-mission-phone.png)

![Desktop: Mara selects Diplomatic Mission](./screenshots/019-target-select-mission-desktop.png)

**Verifications:**

- [x] The real faction card enables Tribute to the Shadow

---

## Mara takes Tribute to the Shadow

![Phone: Mara takes Tribute to the Shadow](./screenshots/020-target-takes-tribute-phone.png)

![Desktop: Mara takes Tribute to the Shadow](./screenshots/020-target-takes-tribute-desktop.png)

**Verifications:**

- [x] Every observer sees the target gain 2 Gold and occupy Tribute
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Rin selects Armed Escort

![Phone: Rin selects Armed Escort](./screenshots/021-third-select-escort-phone.png)

![Desktop: Rin selects Armed Escort](./screenshots/021-third-select-escort-desktop.png)

**Verifications:**

- [x] The Council icon enables Muster the Free Peoples

---

## Rin Musters the Free Peoples

![Phone: Rin Musters the Free Peoples](./screenshots/022-third-musters-phone.png)

![Desktop: Rin Musters the Free Peoples](./screenshots/022-third-musters-desktop.png)

**Verifications:**

- [x] The public board shows the Agent and recruited Companies before the optional payment
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Pip plays Divided Counsel

![Phone: Pip plays Divided Counsel](./screenshots/023-play-divided-counsel-phone.png)

![Desktop: Pip plays Divided Counsel](./screenshots/023-play-divided-counsel-desktop.png)

**Verifications:**

- [x] The Fate card becomes public and asks its owner to choose one real opponent
- [x] Every connected browser replays 14 accepted events with no diagnostics

---

## Pip chooses Mara

![Phone: Pip chooses Mara](./screenshots/024-choose-opponent-phone.png)

![Desktop: Pip chooses Mara](./screenshots/024-choose-opponent-desktop.png)

**Verifications:**

- [x] The chosen opponent receives both legal responses out of turn
- [x] No other browser can answer for the chosen opponent
- [x] Every connected browser replays 15 accepted events with no diagnostics

---

## Mara reveals their hand to Pip

![Phone: Mara reveals their hand to Pip](./screenshots/025-reveal-hand-phone.png)

![Desktop: Mara reveals their hand to Pip](./screenshots/025-reveal-hand-desktop.png)

**Verifications:**

- [x] The Fate holder sees every exact card in the revealed hand
- [x] Every other browser sees only the correct number of opaque cards
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Pip reloads while reviewing the hand

![Phone: Pip reloads while reviewing the hand](./screenshots/026-reload-private-review-phone.png)

![Desktop: Pip reloads while reviewing the hand](./screenshots/026-reload-private-review-desktop.png)

**Verifications:**

- [x] The private reveal authority and exact identities survive immutable replay
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Pip finishes reviewing the hand

![Phone: Pip finishes reviewing the hand](./screenshots/027-finish-review-phone.png)

![Desktop: Pip finishes reviewing the hand](./screenshots/027-finish-review-desktop.png)

**Verifications:**

- [x] The private reveal closes without changing the opponent’s Gold
- [x] The Fate holder resumes the interrupted Agent turn
- [x] Every connected browser replays 17 accepted events with no diagnostics

---

## Pip selects The Open Road after Plot resolution

![Phone: Pip selects The Open Road after Plot resolution](./screenshots/028-select-resumed-card-phone.png)

![Desktop: Pip selects The Open Road after Plot resolution](./screenshots/028-select-resumed-card-desktop.png)

**Verifications:**

- [x] The resumed Agent turn enables a real Roads destination

---

## Pip continues to Take Up a War Effort

![Phone: Pip continues to Take Up a War Effort](./screenshots/029-continue-agent-turn-phone.png)

![Desktop: Pip continues to Take Up a War Effort](./screenshots/029-continue-agent-turn-desktop.png)

**Verifications:**

- [x] The same turn spends the remaining Agent and resolves its board reward
- [x] Every connected browser replays 18 accepted events with no diagnostics

---
