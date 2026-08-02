# Test: Three-player ordinary Battle

Three isolated humans start in the real lobby, resolve an ordinary Battle with Combat Fate, establish Minas Tirith control, then defend it at Pelennor, play Hold the Line and Hidden Archers from private Fate, and pair matching White Tree Standards.

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

## Rin chooses a Siege card

![Phone: Rin chooses a Siege card](./screenshots/041-siege-card-1-phone.png)

![Desktop: Rin chooses a Siege card](./screenshots/041-siege-card-1-desktop.png)

**Verifications:**

- [x] hidden-paths is enabled by the selected real card

---

## Rin enters hidden-paths for the Siege

![Phone: Rin enters hidden-paths for the Siege](./screenshots/042-siege-space-1-phone.png)

![Desktop: Rin enters hidden-paths for the Siege](./screenshots/042-siege-space-1-desktop.png)

**Verifications:**

- [x] All clients see the Siege occupation
- [x] Every connected browser replays 30 accepted events with no diagnostics

---

## Rin keeps Seek Allies

![Phone: Rin keeps Seek Allies](./screenshots/043-siege-seek-1-phone.png)

![Desktop: Rin keeps Seek Allies](./screenshots/043-siege-seek-1-desktop.png)

**Verifications:**

- [x] Deployment follows the Journey choice
- [x] Every connected browser replays 31 accepted events with no diagnostics

---

## Rin deploys to the Siege

![Phone: Rin deploys to the Siege](./screenshots/044-siege-deploy-1-phone.png)

![Desktop: Rin deploys to the Siege](./screenshots/044-siege-deploy-1-desktop.png)

**Verifications:**

- [x] The public Siege force is nonzero
- [x] Every connected browser replays 32 accepted events with no diagnostics

---

## Pip chooses a Siege card

![Phone: Pip chooses a Siege card](./screenshots/045-siege-card-2-phone.png)

![Desktop: Pip chooses a Siege card](./screenshots/045-siege-card-2-desktop.png)

**Verifications:**

- [x] minas-tirith is enabled by the selected real card

---

## Pip enters minas-tirith for the Siege

![Phone: Pip enters minas-tirith for the Siege](./screenshots/046-siege-space-2-phone.png)

![Desktop: Pip enters minas-tirith for the Siege](./screenshots/046-siege-space-2-desktop.png)

**Verifications:**

- [x] All clients see the Siege occupation
- [x] Every connected browser replays 33 accepted events with no diagnostics

---

## Pip deploys to the Siege

![Phone: Pip deploys to the Siege](./screenshots/047-siege-deploy-2-phone.png)

![Desktop: Pip deploys to the Siege](./screenshots/047-siege-deploy-2-desktop.png)

**Verifications:**

- [x] The public Siege force is nonzero
- [x] Every connected browser replays 34 accepted events with no diagnostics

---

## Mara chooses a Siege card

![Phone: Mara chooses a Siege card](./screenshots/048-siege-card-3-phone.png)

![Desktop: Mara chooses a Siege card](./screenshots/048-siege-card-3-desktop.png)

**Verifications:**

- [x] ranger-mustering is enabled by the selected real card

---

## Mara enters ranger-mustering for the Siege

![Phone: Mara enters ranger-mustering for the Siege](./screenshots/049-siege-space-3-phone.png)

![Desktop: Mara enters ranger-mustering for the Siege](./screenshots/049-siege-space-3-desktop.png)

**Verifications:**

- [x] All clients see the Siege occupation
- [x] Every connected browser replays 35 accepted events with no diagnostics

---

## Mara keeps the Ranger cards

![Phone: Mara keeps the Ranger cards](./screenshots/050-siege-ranger-3-phone.png)

![Desktop: Mara keeps the Ranger cards](./screenshots/050-siege-ranger-3-desktop.png)

**Verifications:**

- [x] Deployment follows the ordered Ranger choice
- [x] Every connected browser replays 36 accepted events with no diagnostics

---

## Mara deploys to the Siege

![Phone: Mara deploys to the Siege](./screenshots/051-siege-deploy-3-phone.png)

![Desktop: Mara deploys to the Siege](./screenshots/051-siege-deploy-3-desktop.png)

**Verifications:**

- [x] The public Siege force is nonzero
- [x] Every connected browser replays 37 accepted events with no diagnostics

---

## Rin Reveals for the Siege

![Phone: Rin Reveals for the Siege](./screenshots/052-siege-reveal-1-phone.png)

![Desktop: Rin Reveals for the Siege](./screenshots/052-siege-reveal-1-desktop.png)

**Verifications:**

- [x] The public Muster row is visible
- [x] Every connected browser replays 38 accepted events with no diagnostics

---

## Rin finishes the Siege Reveal

![Phone: Rin finishes the Siege Reveal](./screenshots/053-siege-finish-1-phone.png)

![Desktop: Rin finishes the Siege Reveal](./screenshots/053-siege-finish-1-desktop.png)

**Verifications:**

- [x] Turn authority advances
- [x] Every connected browser replays 39 accepted events with no diagnostics

---

## Pip Reveals for the Siege

![Phone: Pip Reveals for the Siege](./screenshots/054-siege-reveal-2-phone.png)

![Desktop: Pip Reveals for the Siege](./screenshots/054-siege-reveal-2-desktop.png)

**Verifications:**

- [x] The public Muster row is visible
- [x] Every connected browser replays 40 accepted events with no diagnostics

---

## Pip finishes the Siege Reveal

![Phone: Pip finishes the Siege Reveal](./screenshots/055-siege-finish-2-phone.png)

![Desktop: Pip finishes the Siege Reveal](./screenshots/055-siege-finish-2-desktop.png)

**Verifications:**

- [x] Turn authority advances
- [x] Every connected browser replays 41 accepted events with no diagnostics

---

## Mara chooses Armed Escort for the round-two Hall of Fire

![Phone: Mara chooses Armed Escort for the round-two Hall of Fire](./screenshots/056-choose-siege-hall-card-phone.png)

![Desktop: Mara chooses Armed Escort for the round-two Hall of Fire](./screenshots/056-choose-siege-hall-card-desktop.png)

**Verifications:**

- [x] The retained Council icon enables a legal second-round Hall visit

---

## Mara draws Hidden Archers before the Siege

![Phone: Mara draws Hidden Archers before the Siege](./screenshots/057-draw-hidden-archers-phone.png)

![Desktop: Mara draws Hidden Archers before the Siege](./screenshots/057-draw-hidden-archers-desktop.png)

**Verifications:**

- [x] Every observer sees the private Fate count without learning the card identity
- [x] Every connected browser replays 42 accepted events with no diagnostics

---

## Mara Reveals for the Siege

![Phone: Mara Reveals for the Siege](./screenshots/058-siege-reveal-3-phone.png)

![Desktop: Mara Reveals for the Siege](./screenshots/058-siege-reveal-3-desktop.png)

**Verifications:**

- [x] The public Muster row is visible
- [x] Every connected browser replays 43 accepted events with no diagnostics

---

## Mara finishes the Siege Reveal

![Phone: Mara finishes the Siege Reveal](./screenshots/059-siege-finish-3-phone.png)

![Desktop: Mara finishes the Siege Reveal](./screenshots/059-siege-finish-3-desktop.png)

**Verifications:**

- [x] The Siege Combat window opens
- [x] Every connected browser replays 44 accepted events with no diagnostics

---

## Rin passes in the Siege

![Phone: Rin passes in the Siege](./screenshots/060-siege-pass-1-phone.png)

![Desktop: Rin passes in the Siege](./screenshots/060-siege-pass-1-desktop.png)

**Verifications:**

- [x] Pass authority advances; playing Hidden Archers reset the consecutive-pass streak
- [x] Every connected browser replays 45 accepted events with no diagnostics

---

## Pip passes in the Siege

![Phone: Pip passes in the Siege](./screenshots/061-siege-pass-2-phone.png)

![Desktop: Pip passes in the Siege](./screenshots/061-siege-pass-2-desktop.png)

**Verifications:**

- [x] Pass authority advances; playing Hidden Archers reset the consecutive-pass streak
- [x] Every connected browser replays 46 accepted events with no diagnostics

---

## Mara plays Hidden Archers with 1 Scout on the board

![Phone: Mara plays Hidden Archers with 1 Scout on the board](./screenshots/062-play-hidden-archers-phone.png)

![Desktop: Mara plays Hidden Archers with 1 Scout on the board](./screenshots/062-play-hidden-archers-desktop.png)

**Verifications:**

- [x] Every observer sees one Strength per persistent Scout, capped by the printed maximum of three
- [x] Hidden Archers breaks the leading tie without ending the player’s Combat action
- [x] Every connected browser replays 47 accepted events with no diagnostics

---

## Mara passes in the Siege

![Phone: Mara passes in the Siege](./screenshots/063-siege-pass-3-phone.png)

![Desktop: Mara passes in the Siege](./screenshots/063-siege-pass-3-desktop.png)

**Verifications:**

- [x] Pass authority advances; playing Hidden Archers reset the consecutive-pass streak
- [x] Every connected browser replays 48 accepted events with no diagnostics

---

## Rin passes in the Siege

![Phone: Rin passes in the Siege](./screenshots/064-siege-pass-4-phone.png)

![Desktop: Rin passes in the Siege](./screenshots/064-siege-pass-4-desktop.png)

**Verifications:**

- [x] Pass authority advances; playing Hidden Archers reset the consecutive-pass streak
- [x] Every connected browser replays 49 accepted events with no diagnostics

---

## Pip passes in the Siege

![Phone: Pip passes in the Siege](./screenshots/065-siege-pass-5-phone.png)

![Desktop: Pip passes in the Siege](./screenshots/065-siege-pass-5-desktop.png)

**Verifications:**

- [x] The sole winner controls Minas Tirith
- [x] Every connected browser replays 50 accepted events with no diagnostics

---

## Mara reloads before the Pelennor defense choice

![Phone: Mara reloads before the Pelennor defense choice](./screenshots/066-reload-pelennor-decision-phone.png)

![Desktop: Mara reloads before the Pelennor defense choice](./screenshots/066-reload-pelennor-decision-desktop.png)

**Verifications:**

- [x] The contested Age III Battle and controller-only defense choice survive replay
- [x] Every connected browser replays 50 accepted events with no diagnostics

---

## Mara deploys from supply to defend Minas Tirith

![Phone: Mara deploys from supply to defend Minas Tirith](./screenshots/067-deploy-pelennor-defender-phone.png)

![Desktop: Mara deploys from supply to defend Minas Tirith](./screenshots/067-deploy-pelennor-defender-desktop.png)

**Verifications:**

- [x] Every observer sees exactly one defending Company before Agent turns
- [x] Every connected browser replays 51 accepted events with no diagnostics

---

## Pip Reveals without deploying at Pelennor

![Phone: Pip Reveals without deploying at Pelennor](./screenshots/068-pelennor-reveal-1-phone.png)

![Desktop: Pip Reveals without deploying at Pelennor](./screenshots/068-pelennor-reveal-1-desktop.png)

**Verifications:**

- [x] Every observer sees the current public Pelennor Muster row
- [x] Every connected browser replays 52 accepted events with no diagnostics

---

## Pip finishes the Pelennor Reveal

![Phone: Pip finishes the Pelennor Reveal](./screenshots/069-pelennor-finish-1-phone.png)

![Desktop: Pip finishes the Pelennor Reveal](./screenshots/069-pelennor-finish-1-desktop.png)

**Verifications:**

- [x] Turn authority advances to the next human
- [x] Every connected browser replays 53 accepted events with no diagnostics

---

## Mara chooses Armed Escort for Hall of Fire

![Phone: Mara chooses Armed Escort for Hall of Fire](./screenshots/070-choose-hold-hall-card-phone.png)

![Desktop: Mara chooses Armed Escort for Hall of Fire](./screenshots/070-choose-hold-hall-card-desktop.png)

**Verifications:**

- [x] The real Council icon enables Hall of Fire during the contested round

---

## Mara visits Hall of Fire to draw Hold the Line

![Phone: Mara visits Hall of Fire to draw Hold the Line](./screenshots/071-draw-hold-line-phone.png)

![Desktop: Mara visits Hall of Fire to draw Hold the Line](./screenshots/071-draw-hold-line-desktop.png)

**Verifications:**

- [x] Every observer sees one private Fate card and only its owner can later identify it
- [x] Every connected browser replays 54 accepted events with no diagnostics

---

## Rin Reveals without deploying at Pelennor

![Phone: Rin Reveals without deploying at Pelennor](./screenshots/072-pelennor-reveal-2-phone.png)

![Desktop: Rin Reveals without deploying at Pelennor](./screenshots/072-pelennor-reveal-2-desktop.png)

**Verifications:**

- [x] Every observer sees the current public Pelennor Muster row
- [x] Every connected browser replays 55 accepted events with no diagnostics

---

## Rin finishes the Pelennor Reveal

![Phone: Rin finishes the Pelennor Reveal](./screenshots/073-pelennor-finish-2-phone.png)

![Desktop: Rin finishes the Pelennor Reveal](./screenshots/073-pelennor-finish-2-desktop.png)

**Verifications:**

- [x] Turn authority advances to the next human
- [x] Every connected browser replays 56 accepted events with no diagnostics

---

## Mara Reveals without deploying at Pelennor

![Phone: Mara Reveals without deploying at Pelennor](./screenshots/074-pelennor-reveal-3-phone.png)

![Desktop: Mara Reveals without deploying at Pelennor](./screenshots/074-pelennor-reveal-3-desktop.png)

**Verifications:**

- [x] Every observer sees the current public Pelennor Muster row
- [x] Every connected browser replays 57 accepted events with no diagnostics

---

## Mara finishes the Pelennor Reveal

![Phone: Mara finishes the Pelennor Reveal](./screenshots/075-pelennor-finish-3-phone.png)

![Desktop: Mara finishes the Pelennor Reveal](./screenshots/075-pelennor-finish-3-desktop.png)

**Verifications:**

- [x] Only the deployed defender enters Combat
- [x] Every connected browser replays 58 accepted events with no diagnostics

---

## Mara plays Hold the Line while controlling Minas Tirith

![Phone: Mara plays Hold the Line while controlling Minas Tirith](./screenshots/076-play-hold-line-phone.png)

![Desktop: Mara plays Hold the Line while controlling Minas Tirith](./screenshots/076-play-hold-line-desktop.png)

**Verifications:**

- [x] Control of the contested location raises the printed two Strength bonus to four
- [x] The same defender retains Combat authority after playing the Fate card
- [x] Every connected browser replays 59 accepted events with no diagnostics

---

## Mara passes and wins Pelennor

![Phone: Mara passes and wins Pelennor](./screenshots/077-pelennor-pass-phone.png)

![Desktop: Mara passes and wins Pelennor](./screenshots/077-pelennor-pass-desktop.png)

**Verifications:**

- [x] The two White Tree Battle cards turn face down as one paired Standard
- [x] Printed Pelennor Renown and separate Standard-pair Renown total four
- [x] Cleanup opens round four with Minas Tirith still controlled by the winner
- [x] Every connected browser replays 60 accepted events with no diagnostics

---
