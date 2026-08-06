# Test: Keeper of Oaths through two Alliances

Three isolated humans play ordinary rounds while one Commander draws Keeper of Oaths privately, earns Dwarven and Shadow standing through real faction cards and destinations, claims both public Alliances, reaches Battle-deck exhaustion, plays the Endgame Fate by click for exactly one Renown, passes clockwise, and reloads the deterministic final result.

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

## Rin chooses Armed Escort

![Phone: Rin chooses Armed Escort](./screenshots/017-choose-hall-card-phone.png)

![Desktop: Rin chooses Armed Escort](./screenshots/017-choose-hall-card-desktop.png)

**Verifications:**

- [x] The printed Council icon enables Hall of Fire

---

## Rin draws private Fate at Hall of Fire

![Phone: Rin draws private Fate at Hall of Fire](./screenshots/018-draw-keeper-phone.png)

![Desktop: Rin draws private Fate at Hall of Fire](./screenshots/018-draw-keeper-desktop.png)

**Verifications:**

- [x] The Fate draw pauses at Galadriel’s once-per-round Foresight without drawing early
- [x] Only Galadriel can identify and choose either exact Fate option
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Rin resolves Foresight and takes Keeper of Oaths

![Phone: Rin resolves Foresight and takes Keeper of Oaths](./screenshots/019-choose-keeper-foresight-phone.png)

![Desktop: Rin resolves Foresight and takes Keeper of Oaths](./screenshots/019-choose-keeper-foresight-desktop.png)

**Verifications:**

- [x] Exactly 1 private Fate card enters the acting hand
- [x] The unchosen exact Fate card goes to the deck bottom without entering the public discard
- [x] The private Commander choice closes before the interrupted effect continues
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/020-reveal-1-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/020-reveal-1-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/021-finish-2-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/021-finish-2-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 14 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/022-reveal-3-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/022-reveal-3-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 15 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/023-finish-4-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/023-finish-4-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/024-reveal-5-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/024-reveal-5-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 17 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/025-finish-6-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/025-finish-6-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 18 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/026-reveal-7-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/026-reveal-7-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 19 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/027-finish-8-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/027-finish-8-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 20 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/028-reveal-9-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/028-reveal-9-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 21 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/029-finish-10-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/029-finish-10-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 22 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/030-choose-faction-11-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/030-choose-faction-11-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Dwarven Caravans

![Phone: Rin visits Dwarven Caravans](./screenshots/031-earn-standing-12-phone.png)

![Desktop: Rin visits Dwarven Caravans](./screenshots/031-earn-standing-12-desktop.png)

**Verifications:**

- [x] Exactly one Dwarven standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 23 accepted events with no diagnostics

---

## Rin keeps Seek Allies

![Phone: Rin keeps Seek Allies](./screenshots/032-keep-seek-13-phone.png)

![Desktop: Rin keeps Seek Allies](./screenshots/032-keep-seek-13-desktop.png)

**Verifications:**

- [x] The optional Journey choice completes before authority advances
- [x] Every connected browser replays 24 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/033-choose-faction-14-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/033-choose-faction-14-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Tribute to the Shadow

![Phone: Rin visits Tribute to the Shadow](./screenshots/034-earn-standing-15-phone.png)

![Desktop: Rin visits Tribute to the Shadow](./screenshots/034-earn-standing-15-desktop.png)

**Verifications:**

- [x] Exactly one Shadow standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 25 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/035-reveal-16-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/035-reveal-16-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 26 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/036-finish-17-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/036-finish-17-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 27 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/037-reveal-18-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/037-reveal-18-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 28 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/038-finish-19-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/038-finish-19-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 29 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/039-reveal-20-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/039-reveal-20-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 30 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/040-finish-21-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/040-finish-21-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 31 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/041-reveal-22-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/041-reveal-22-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 32 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/042-finish-23-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/042-finish-23-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 33 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/043-choose-faction-24-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/043-choose-faction-24-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Dwarven Caravans

![Phone: Rin visits Dwarven Caravans](./screenshots/044-earn-standing-25-phone.png)

![Desktop: Rin visits Dwarven Caravans](./screenshots/044-earn-standing-25-desktop.png)

**Verifications:**

- [x] Exactly one Dwarven standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 34 accepted events with no diagnostics

---

## Rin keeps Seek Allies

![Phone: Rin keeps Seek Allies](./screenshots/045-keep-seek-26-phone.png)

![Desktop: Rin keeps Seek Allies](./screenshots/045-keep-seek-26-desktop.png)

**Verifications:**

- [x] The optional Journey choice completes before authority advances
- [x] Every connected browser replays 35 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/046-reveal-27-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/046-reveal-27-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 36 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/047-finish-28-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/047-finish-28-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 37 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/048-reveal-29-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/048-reveal-29-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 38 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/049-finish-30-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/049-finish-30-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 39 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/050-choose-faction-31-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/050-choose-faction-31-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Tribute to the Shadow

![Phone: Rin visits Tribute to the Shadow](./screenshots/051-earn-standing-32-phone.png)

![Desktop: Rin visits Tribute to the Shadow](./screenshots/051-earn-standing-32-desktop.png)

**Verifications:**

- [x] Exactly one Shadow standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 40 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/052-reveal-33-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/052-reveal-33-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 41 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/053-finish-34-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/053-finish-34-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 42 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/054-reveal-35-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/054-reveal-35-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 43 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/055-finish-36-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/055-finish-36-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 44 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/056-reveal-37-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/056-reveal-37-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 45 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/057-finish-38-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/057-finish-38-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 46 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/058-choose-faction-39-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/058-choose-faction-39-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Dwarven Caravans

![Phone: Rin visits Dwarven Caravans](./screenshots/059-earn-standing-40-phone.png)

![Desktop: Rin visits Dwarven Caravans](./screenshots/059-earn-standing-40-desktop.png)

**Verifications:**

- [x] Exactly one Dwarven standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 47 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/060-choose-faction-41-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/060-choose-faction-41-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Tribute to the Shadow

![Phone: Rin visits Tribute to the Shadow](./screenshots/061-earn-standing-42-phone.png)

![Desktop: Rin visits Tribute to the Shadow](./screenshots/061-earn-standing-42-desktop.png)

**Verifications:**

- [x] Exactly one Shadow standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 48 accepted events with no diagnostics

---

## Rin keeps Seek Allies

![Phone: Rin keeps Seek Allies](./screenshots/062-keep-seek-43-phone.png)

![Desktop: Rin keeps Seek Allies](./screenshots/062-keep-seek-43-desktop.png)

**Verifications:**

- [x] The optional Journey choice completes before authority advances
- [x] Every connected browser replays 49 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/063-reveal-44-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/063-reveal-44-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 50 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/064-finish-45-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/064-finish-45-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 51 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/065-reveal-46-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/065-reveal-46-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 52 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/066-finish-47-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/066-finish-47-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 53 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/067-reveal-48-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/067-reveal-48-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 54 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/068-finish-49-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/068-finish-49-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 55 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/069-reveal-50-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/069-reveal-50-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 56 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/070-finish-51-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/070-finish-51-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 57 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/071-choose-faction-52-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/071-choose-faction-52-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Dwarven Caravans

![Phone: Rin visits Dwarven Caravans](./screenshots/072-earn-standing-53-phone.png)

![Desktop: Rin visits Dwarven Caravans](./screenshots/072-earn-standing-53-desktop.png)

**Verifications:**

- [x] Exactly one Dwarven standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 58 accepted events with no diagnostics

---

## Rin keeps Seek Allies

![Phone: Rin keeps Seek Allies](./screenshots/073-keep-seek-54-phone.png)

![Desktop: Rin keeps Seek Allies](./screenshots/073-keep-seek-54-desktop.png)

**Verifications:**

- [x] The optional Journey choice completes before authority advances
- [x] Every connected browser replays 59 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/074-reveal-55-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/074-reveal-55-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 60 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/075-finish-56-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/075-finish-56-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 61 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/076-reveal-57-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/076-reveal-57-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 62 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/077-finish-58-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/077-finish-58-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 63 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/078-reveal-59-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/078-reveal-59-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 64 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/079-finish-60-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/079-finish-60-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 65 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/080-reveal-61-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/080-reveal-61-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 66 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/081-finish-62-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/081-finish-62-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 67 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/082-reveal-63-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/082-reveal-63-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 68 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/083-finish-64-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/083-finish-64-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 69 accepted events with no diagnostics

---

## Rin chooses a real faction card

![Phone: Rin chooses a real faction card](./screenshots/084-choose-faction-65-phone.png)

![Desktop: Rin chooses a real faction card](./screenshots/084-choose-faction-65-desktop.png)

**Verifications:**

- [x] At least one unfinished Alliance destination is enabled by the printed icon

---

## Rin visits Tribute to the Shadow

![Phone: Rin visits Tribute to the Shadow](./screenshots/085-earn-standing-66-phone.png)

![Desktop: Rin visits Tribute to the Shadow](./screenshots/085-earn-standing-66-desktop.png)

**Verifications:**

- [x] Exactly one Shadow standing resolves publicly
- [x] Standing four visibly awards the corresponding Alliance
- [x] Every connected browser replays 70 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/086-reveal-67-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/086-reveal-67-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 71 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/087-finish-68-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/087-finish-68-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 72 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/088-reveal-69-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/088-reveal-69-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 73 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/089-finish-70-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/089-finish-70-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 74 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/090-reveal-71-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/090-reveal-71-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 75 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/091-finish-72-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/091-finish-72-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 76 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/092-reveal-73-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/092-reveal-73-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 77 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/093-finish-74-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/093-finish-74-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 78 accepted events with no diagnostics

---

## Rin Reveals the remaining hand

![Phone: Rin Reveals the remaining hand](./screenshots/094-reveal-75-phone.png)

![Desktop: Rin Reveals the remaining hand](./screenshots/094-reveal-75-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 79 accepted events with no diagnostics

---

## Rin finishes Reveal

![Phone: Rin finishes Reveal](./screenshots/095-finish-76-phone.png)

![Desktop: Rin finishes Reveal](./screenshots/095-finish-76-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 80 accepted events with no diagnostics

---

## Pip Reveals the remaining hand

![Phone: Pip Reveals the remaining hand](./screenshots/096-reveal-77-phone.png)

![Desktop: Pip Reveals the remaining hand](./screenshots/096-reveal-77-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 81 accepted events with no diagnostics

---

## Pip finishes Reveal

![Phone: Pip finishes Reveal](./screenshots/097-finish-78-phone.png)

![Desktop: Pip finishes Reveal](./screenshots/097-finish-78-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 82 accepted events with no diagnostics

---

## Mara Reveals the remaining hand

![Phone: Mara Reveals the remaining hand](./screenshots/098-reveal-79-phone.png)

![Desktop: Mara Reveals the remaining hand](./screenshots/098-reveal-79-desktop.png)

**Verifications:**

- [x] The acting human exposes a real Muster row
- [x] Every connected browser replays 83 accepted events with no diagnostics

---

## Mara finishes Reveal

![Phone: Mara finishes Reveal](./screenshots/099-finish-80-phone.png)

![Desktop: Mara finishes Reveal](./screenshots/099-finish-80-desktop.png)

**Verifications:**

- [x] Reveal authority advances or the unopposed Battle closes
- [x] Every connected browser replays 84 accepted events with no diagnostics

---

## Rin plays Keeper of Oaths

![Phone: Rin plays Keeper of Oaths](./screenshots/100-play-keeper-oaths-phone.png)

![Desktop: Rin plays Keeper of Oaths](./screenshots/100-play-keeper-oaths-desktop.png)

**Verifications:**

- [x] Two publicly held Alliances grant exactly one Renown and retain Endgame authority
- [x] Every connected browser replays 85 accepted events with no diagnostics

---

## Rin passes Endgame

![Phone: Rin passes Endgame](./screenshots/101-final-pass-1-phone.png)

![Desktop: Rin passes Endgame](./screenshots/101-final-pass-1-desktop.png)

**Verifications:**

- [x] Endgame authority advances after the real pass
- [x] Every connected browser replays 86 accepted events with no diagnostics

---

## Pip passes Endgame

![Phone: Pip passes Endgame](./screenshots/102-final-pass-2-phone.png)

![Desktop: Pip passes Endgame](./screenshots/102-final-pass-2-desktop.png)

**Verifications:**

- [x] Endgame authority advances after the real pass
- [x] Every connected browser replays 87 accepted events with no diagnostics

---

## Mara passes Endgame

![Phone: Mara passes Endgame](./screenshots/103-final-pass-3-phone.png)

![Desktop: Mara passes Endgame](./screenshots/103-final-pass-3-desktop.png)

**Verifications:**

- [x] Three consecutive passes record final scoring
- [x] Every connected browser replays 88 accepted events with no diagnostics

---

## Rin reloads the finished match

![Phone: Rin reloads the finished match](./screenshots/104-reload-keeper-result-phone.png)

![Desktop: Rin reloads the finished match](./screenshots/104-reload-keeper-result-desktop.png)

**Verifications:**

- [x] Immutable replay reproduces the Alliance-backed victory
- [x] Every connected browser replays 88 accepted events with no diagnostics

---
