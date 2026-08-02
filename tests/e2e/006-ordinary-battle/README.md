# Test: Three-player ordinary Battle

Three isolated humans start in the real lobby, enter three final board spaces, deploy legal forces, Reveal swords, reload inside the Combat Fate window, pass in order, and observe ranked rewards and cleanup.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters her name

![Phone: Mara enters her name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters her name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The lobby receives the name through its labeled input

---

## Mara chooses a private Battle room

![Phone: Mara chooses a private Battle room](./screenshots/001-host-code-phone.png)

![Desktop: Mara chooses a private Battle room](./screenshots/001-host-code-desktop.png)

**Verifications:**

- [x] The five-character invitation is visible

---

## Mara creates the live room

![Phone: Mara creates the live room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the live room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The host sees the requested live room
- [x] Every connected browser replays 1 accepted events with no diagnostics

---

## Rin enters a name

![Phone: Rin enters a name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] The isolated browser receives the player name

---

## Rin enters the invitation

![Phone: Rin enters the invitation](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the invitation](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The invitation is entered through the real control

---

## Rin joins the room

![Phone: Rin joins the room](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins the room](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 2 seats
- [x] Every connected browser replays 2 accepted events with no diagnostics

---

## Pip enters a name

![Phone: Pip enters a name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] The isolated browser receives the player name

---

## Pip enters the invitation

![Phone: Pip enters the invitation](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the invitation](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The invitation is entered through the real control

---

## Pip joins the room

![Phone: Pip joins the room](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins the room](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Every connected browser sees 3 seats
- [x] Every connected browser replays 3 accepted events with no diagnostics

---

## Mara chooses Aragorn

![Phone: Mara chooses Aragorn](./screenshots/009-seat-1-commander-phone.png)

![Desktop: Mara chooses Aragorn](./screenshots/009-seat-1-commander-desktop.png)

**Verifications:**

- [x] The unique identity is selected publicly
- [x] Every connected browser replays 4 accepted events with no diagnostics

---

## Mara readies

![Phone: Mara readies](./screenshots/010-seat-1-ready-phone.png)

![Desktop: Mara readies](./screenshots/010-seat-1-ready-desktop.png)

**Verifications:**

- [x] All observers see the ready state
- [x] Every connected browser replays 5 accepted events with no diagnostics

---

## Rin chooses Galadriel

![Phone: Rin chooses Galadriel](./screenshots/011-seat-2-commander-phone.png)

![Desktop: Rin chooses Galadriel](./screenshots/011-seat-2-commander-desktop.png)

**Verifications:**

- [x] The unique identity is selected publicly
- [x] Every connected browser replays 6 accepted events with no diagnostics

---

## Rin readies

![Phone: Rin readies](./screenshots/012-seat-2-ready-phone.png)

![Desktop: Rin readies](./screenshots/012-seat-2-ready-desktop.png)

**Verifications:**

- [x] All observers see the ready state
- [x] Every connected browser replays 7 accepted events with no diagnostics

---

## Pip chooses Gandalf

![Phone: Pip chooses Gandalf](./screenshots/013-seat-3-commander-phone.png)

![Desktop: Pip chooses Gandalf](./screenshots/013-seat-3-commander-desktop.png)

**Verifications:**

- [x] The unique identity is selected publicly
- [x] Every connected browser replays 8 accepted events with no diagnostics

---

## Pip readies

![Phone: Pip readies](./screenshots/014-seat-3-ready-phone.png)

![Desktop: Pip readies](./screenshots/014-seat-3-ready-desktop.png)

**Verifications:**

- [x] All observers see the ready state
- [x] Every connected browser replays 9 accepted events with no diagnostics

---

## Mara chooses the published Battle seed

![Phone: Mara chooses the published Battle seed](./screenshots/015-battle-seed-phone.png)

![Desktop: Mara chooses the published Battle seed](./screenshots/015-battle-seed-desktop.png)

**Verifications:**

- [x] The deterministic setup seed is visible

---

## Mara starts the match

![Phone: Mara starts the match](./screenshots/016-start-match-phone.png)

![Desktop: Mara starts the match](./screenshots/016-start-match-desktop.png)

**Verifications:**

- [x] Every human sees Crossing of the Isen as the active Battle
- [x] The production board exposes Minas Tirith as the fifteenth executable destination
- [x] Every connected browser replays 10 accepted events with no diagnostics

---

## Mara chooses Armed Escort for Hall of Fire

![Phone: Mara chooses Armed Escort for Hall of Fire](./screenshots/017-choose-hall-escort-phone.png)

![Desktop: Mara chooses Armed Escort for Hall of Fire](./screenshots/017-choose-hall-escort-desktop.png)

**Verifications:**

- [x] The real Council icon enables Hall of Fire

---

## Mara draws Fate at Hall of Fire

![Phone: Mara draws Fate at Hall of Fire](./screenshots/018-draw-combat-fate-phone.png)

![Desktop: Mara draws Fate at Hall of Fire](./screenshots/018-draw-combat-fate-desktop.png)

**Verifications:**

- [x] Every observer sees one private Fate card without its identity
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Rin chooses a card for Battle

![Phone: Rin chooses a card for Battle](./screenshots/019-choose-battle-card-1-phone.png)

![Desktop: Rin chooses a card for Battle](./screenshots/019-choose-battle-card-1-desktop.png)

**Verifications:**

- [x] The real card gesture enables hidden-paths

---

## Rin enters hidden-paths

![Phone: Rin enters hidden-paths](./screenshots/020-enter-battle-space-1-phone.png)

![Desktop: Rin enters hidden-paths](./screenshots/020-enter-battle-space-1-desktop.png)

**Verifications:**

- [x] The chosen Agent is publicly visible at the Battle destination
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Rin deploys the maximum legal force

![Phone: Rin deploys the maximum legal force](./screenshots/021-deploy-companies-1-phone.png)

![Desktop: Rin deploys the maximum legal force](./screenshots/021-deploy-companies-1-desktop.png)

**Verifications:**

- [x] Every observer sees this participant’s Companies in the active Battle
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Pip chooses a card for Battle

![Phone: Pip chooses a card for Battle](./screenshots/022-choose-battle-card-2-phone.png)

![Desktop: Pip chooses a card for Battle](./screenshots/022-choose-battle-card-2-desktop.png)

**Verifications:**

- [x] The real card gesture enables ranger-mustering

---

## Pip enters ranger-mustering

![Phone: Pip enters ranger-mustering](./screenshots/023-enter-battle-space-2-phone.png)

![Desktop: Pip enters ranger-mustering](./screenshots/023-enter-battle-space-2-desktop.png)

**Verifications:**

- [x] The chosen Agent is publicly visible at the Battle destination
- [x] Every connected browser replays 14 accepted events with no diagnostics

---

## Pip declines the Ranger trash

![Phone: Pip declines the Ranger trash](./screenshots/024-keep-ranger-cards-2-phone.png)

![Desktop: Pip declines the Ranger trash](./screenshots/024-keep-ranger-cards-2-desktop.png)

**Verifications:**

- [x] The ordered Battle deployment follows the Ranger choice
- [x] Every connected browser replays 15 accepted events with no diagnostics

---

## Pip deploys the maximum legal force

![Phone: Pip deploys the maximum legal force](./screenshots/025-deploy-companies-2-phone.png)

![Desktop: Pip deploys the maximum legal force](./screenshots/025-deploy-companies-2-desktop.png)

**Verifications:**

- [x] Every observer sees this participant’s Companies in the active Battle
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Mara chooses a card for Battle

![Phone: Mara chooses a card for Battle](./screenshots/026-choose-battle-card-3-phone.png)

![Desktop: Mara chooses a card for Battle](./screenshots/026-choose-battle-card-3-desktop.png)

**Verifications:**

- [x] The real card gesture enables minas-tirith

---

## Mara enters minas-tirith

![Phone: Mara enters minas-tirith](./screenshots/027-enter-battle-space-3-phone.png)

![Desktop: Mara enters minas-tirith](./screenshots/027-enter-battle-space-3-desktop.png)

**Verifications:**

- [x] The chosen Agent is publicly visible at the Battle destination
- [x] Every connected browser replays 17 accepted events with no diagnostics

---

## Mara resolves Reconnaissance first

![Phone: Mara resolves Reconnaissance first](./screenshots/028-place-battle-scout-3-phone.png)

![Desktop: Mara resolves Reconnaissance first](./screenshots/028-place-battle-scout-3-desktop.png)

**Verifications:**

- [x] The ordered Battle deployment follows Scout placement
- [x] Every connected browser replays 18 accepted events with no diagnostics

---

## Mara deploys the maximum legal force

![Phone: Mara deploys the maximum legal force](./screenshots/029-deploy-companies-3-phone.png)

![Desktop: Mara deploys the maximum legal force](./screenshots/029-deploy-companies-3-desktop.png)

**Verifications:**

- [x] Every observer sees this participant’s Companies in the active Battle
- [x] Every connected browser replays 19 accepted events with no diagnostics

---

## Rin Reveals Battle swords

![Phone: Rin Reveals Battle swords](./screenshots/030-reveal-1-phone.png)

![Desktop: Rin Reveals Battle swords](./screenshots/030-reveal-1-desktop.png)

**Verifications:**

- [x] All observers see the public Muster row and sword total
- [x] Every connected browser replays 20 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/031-finish-reveal-1-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/031-finish-reveal-1-desktop.png)

**Verifications:**

- [x] The next participating human receives the turn
- [x] Every connected browser replays 21 accepted events with no diagnostics

---

## Pip Reveals Battle swords

![Phone: Pip Reveals Battle swords](./screenshots/032-reveal-2-phone.png)

![Desktop: Pip Reveals Battle swords](./screenshots/032-reveal-2-desktop.png)

**Verifications:**

- [x] All observers see the public Muster row and sword total
- [x] Every connected browser replays 22 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/033-finish-reveal-2-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/033-finish-reveal-2-desktop.png)

**Verifications:**

- [x] The next participating human receives the turn
- [x] Every connected browser replays 23 accepted events with no diagnostics

---

## Mara Reveals Battle swords

![Phone: Mara Reveals Battle swords](./screenshots/034-reveal-3-phone.png)

![Desktop: Mara Reveals Battle swords](./screenshots/034-reveal-3-desktop.png)

**Verifications:**

- [x] All observers see the public Muster row and sword total
- [x] Every connected browser replays 24 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/035-finish-reveal-3-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/035-finish-reveal-3-desktop.png)

**Verifications:**

- [x] The Combat Fate window opens after all three Reveals
- [x] Every connected browser replays 25 accepted events with no diagnostics

---

## Mara reloads during Combat Fate

![Phone: Mara reloads during Combat Fate](./screenshots/036-reload-fate-window-phone.png)

![Desktop: Mara reloads during Combat Fate](./screenshots/036-reload-fate-window-desktop.png)

**Verifications:**

- [x] Replay restores the same authorized pass decision and all three forces
- [x] Every connected browser replays 25 accepted events with no diagnostics

---

## Mara plays Sudden Charge

![Phone: Mara plays Sudden Charge](./screenshots/037-play-sudden-charge-phone.png)

![Desktop: Mara plays Sudden Charge](./screenshots/037-play-sudden-charge-desktop.png)

**Verifications:**

- [x] Every observer sees exactly three added Strength and the public Fate discard
- [x] The same participant may play another Combat Fate or pass
- [x] Every connected browser replays 26 accepted events with no diagnostics

---

## Mara passes Combat Fate

![Phone: Mara passes Combat Fate](./screenshots/038-pass-fate-1-phone.png)

![Desktop: Mara passes Combat Fate](./screenshots/038-pass-fate-1-desktop.png)

**Verifications:**

- [x] Pass authority advances clockwise to the next participant
- [x] Every connected browser replays 27 accepted events with no diagnostics

---

## Rin passes Combat Fate

![Phone: Rin passes Combat Fate](./screenshots/039-pass-fate-2-phone.png)

![Desktop: Rin passes Combat Fate](./screenshots/039-pass-fate-2-desktop.png)

**Verifications:**

- [x] Pass authority advances clockwise to the next participant
- [x] Every connected browser replays 28 accepted events with no diagnostics

---

## Pip passes Combat Fate

![Phone: Pip passes Combat Fate](./screenshots/040-pass-fate-3-phone.png)

![Desktop: Pip passes Combat Fate](./screenshots/040-pass-fate-3-desktop.png)

**Verifications:**

- [x] The third consecutive pass resolves rewards, cleanup, and Recall
- [x] Every connected browser replays 29 accepted events with no diagnostics

---
