import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Palantír Glimpse pays for a private draw and draws Fate during Muster', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-palantir-glimpse-23', { phone: 'PALAP', desktop: 'PALAD' });
  const { seats, accepted, converged, currentSeat } = table;
  let gestureNumber = 0;
  let mustered = false;
  let mithrilReady = false;
  let played = false;

  const palantir = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Palantír Glimpse/ }).first();
  const playerValue = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await observer.page.locator('aside.players article').filter({ hasText: player.name }).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const reveal = async (actor: PlotSeat, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      ...extra,
      converged(accepted.value + 1)
    ]);
  };
  const finishReveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };
  const chooseCard = async (actor: PlotSeat, name: RegExp, id: string, description: string, destinationId: string) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId('private-hand').getByRole('button', { name }).first().click();
    }, [
      { spec: 'The selected card’s printed icon enables the intended destination', check: async () => await expect(actor.page.getByTestId(destinationId)).toBeEnabled() }
    ]);
  };
  const placeAgent = async (actor: PlotSeat, destinationId: string, id: string, description: string, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId(destinationId).click(); accepted.value += 1;
    }, [...extra, converged(accepted.value + 1)]);
  };
  const resolveEdorasContinuation = async (actor: PlotSeat) => {
    for (let guard = 0; guard < 4; guard += 1) {
      const scoutHeading = actor.page.getByRole('heading', { name: /Choose (an empty post|the Scout’s new post) for the Scout\./ });
      const deployment = actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' });
      const keepAllies = actor.page.getByRole('button', { name: 'Keep Seek Allies' });
      if (await scoutHeading.count() > 0 && await scoutHeading.isVisible()) {
        const post = actor.page.locator('[data-testid^="post-"]:enabled').first();
        const postName = await post.getByRole('strong').textContent();
        gestureNumber += 1;
        await steps.gesture(actor.page, `place-edoras-scout-${gestureNumber}`, `${actor.name} places the card’s Scout at ${postName}`, async () => {
          await post.click(); accepted.value += 1;
        }, [
          { spec: 'The finite Scout resolves before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await keepAllies.count() > 0 && await keepAllies.isVisible()) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `keep-edoras-card-${gestureNumber}`, `${actor.name} keeps Seek Allies`, async () => {
          await keepAllies.click(); accepted.value += 1;
        }, [
          { spec: 'The optional card effect resolves before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await deployment.count() > 0 && await deployment.isVisible()) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `finish-edoras-deployment-${gestureNumber}`, `${actor.name} leaves Companies in garrison`, async () => {
          await actor.page.getByRole('button', { name: 'Deploy 0' }).click(); accepted.value += 1;
        }, [
          { spec: 'The complete Edoras Agent turn closes after its real deployment choice', check: async () => await expect(actor.page.getByTestId('pending-choice')).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        return;
      } else return;
    }
  };

  try {
    const roadActor = await currentSeat();
    await chooseCard(roadActor, /^The Open Road/, 'select-open-road', `${roadActor.name} selects The Open Road`, 'space-take-war-effort');
    await placeAgent(roadActor, 'space-take-war-effort', 'play-open-road', `${roadActor.name} takes up a War Effort`, [
      { spec: 'The ordinary Roads turn grants the printed two-Gold fallback', check: async () => await expect(roadActor.page.getByTestId('activity-log')).toContainText(`${roadActor.name} sends an Agent to Take Up a War Effort`) }
    ]);

    const buyer = await currentSeat();
    await chooseCard(buyer, /^Diplomatic Mission/, 'select-dwarven-mission', `${buyer.name} selects Diplomatic Mission`, 'space-dwarven-caravans');
    await placeAgent(buyer, 'space-dwarven-caravans', 'play-dwarven-mission', `${buyer.name} visits Dwarven Caravans`, [
      { spec: 'The future Palantír owner gains ordinary Dwarven standing and Provision', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Dwarven Caravans`) }
    ]);

    const shadowActor = await currentSeat();
    await chooseCard(shadowActor, /^Diplomatic Mission/, 'select-shadow-mission', `${shadowActor.name} selects Diplomatic Mission`, 'space-tribute-shadow');
    await placeAgent(shadowActor, 'space-tribute-shadow', 'play-shadow-mission', `${shadowActor.name} visits Tribute to the Shadow`, [
      { spec: 'The ordinary Shadow turn resolves before the first player acts again', check: async () => await expect(shadowActor.page.getByTestId('activity-log')).toContainText(`${shadowActor.name} sends an Agent to Tribute to the Shadow`) }
    ]);

    await chooseCard(roadActor, /^Armed Escort/, 'select-armed-escort', `${roadActor.name} selects Armed Escort`, 'space-muster-free-peoples');
    await placeAgent(roadActor, 'space-muster-free-peoples', 'play-armed-escort', `${roadActor.name} musters the Free Peoples`, [
      { spec: 'The Council destination recruits before its optional payment', check: async () => await expect(roadActor.page.getByRole('heading', { name: 'Pay 2 Gold to gain 1 Provision?' })).toBeVisible() }
    ]);
    gestureNumber += 1;
    await steps.gesture(roadActor.page, `pay-council-${gestureNumber}`, `${roadActor.name} pays the Council`, async () => {
      await roadActor.page.getByRole('button', { name: 'Pay 2 Gold' }).click(); accepted.value += 1;
    }, [
      { spec: 'The paid Council choice closes and passes authority to the buyer', check: async () => await expect(roadActor.page.getByTestId('pending-choice')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);

    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 49');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('54 / 54');
    }
    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Palantír Glimpse/ }).first();
    await expect(offered).toBeEnabled();
    gestureNumber += 1;
    await steps.gesture(buyer.page, `acquire-palantir-${gestureNumber}`, `${buyer.name} acquires Palantír Glimpse`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact four-Influence physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Palantír Glimpse`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 48');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 150 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasPalantir = actor === buyer && await palantir(buyer).count() > 0 && await palantir(buyer).isVisible();
      if (buyerHasPalantir && !mustered) {
        const fateBefore = await playerValue(seats[0], buyer, 'Fate');
        await reveal(buyer, [{
          spec: 'Palantír Glimpse contributes 2 Influence and privately draws exactly one Fate',
          check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Palantír Glimpse', { exact: true }).locator('..');
            await expect(article).toContainText('2 Influence · draw 1 Fate');
            for (const observer of seats) {
              await expect(observer.page.locator('aside.players article').filter({ hasText: buyer.name }).getByText('Fate', { exact: true }).locator('..')).toContainText(String(fateBefore + 1));
            }
          }
        }]);
        mustered = true;
        await finishReveal(buyer);
        continue;
      }
      if (buyerHasPalantir && mustered && !mithrilReady) {
        const handButtons = buyer.page.getByTestId('private-hand').getByRole('button');
        let edorasCard: Locator | null = null;
        let edorasName = '';
        for (let index = 0; index < await handButtons.count(); index += 1) {
          const candidate = handButtons.nth(index);
          const text = await candidate.textContent() ?? '';
          if (!text.startsWith('Palantír Glimpse') && /Agent:.*(Roads|Stronghold)/.test(text)) {
            edorasCard = candidate;
            edorasName = text.split('Agent:')[0].trim();
            break;
          }
        }
        if (!edorasCard) {
          await reveal(buyer);
          await finishReveal(buyer);
          continue;
        }
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-edoras-card-${gestureNumber}`, `${buyer.name} selects ${edorasName} to secure Mithril`, async () => {
          await edorasCard!.click();
        }, [
          { spec: 'The selected ordinary card enables the Battle space at Edoras', check: async () => await expect(buyer.page.getByTestId('space-edoras')).toBeEnabled() }
        ]);
        const mithrilBefore = await playerValue(seats[0], buyer, 'Mithril');
        await placeAgent(buyer, 'space-edoras', 'gain-palantir-mithril', `${buyer.name} sends an Agent to Edoras`, [
          { spec: 'Edoras gains at least one public Mithril without changing the Palantír card', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Mithril'), { timeout: 2_000 }).toBeGreaterThan(mithrilBefore);
              await expect(observer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Edoras`);
            }
          } }
        ]);
        await resolveEdorasContinuation(buyer);
        mithrilReady = true;
        continue;
      }
      if (buyerHasPalantir && mustered && mithrilReady) {
        await chooseCard(buyer, /^Palantír Glimpse/, 'select-palantir', `${buyer.name} selects Palantír Glimpse`, 'space-tribute-shadow');
        const mithrilBefore = await playerValue(seats[0], buyer, 'Mithril');
        await placeAgent(buyer, 'space-tribute-shadow', 'play-palantir', `${buyer.name} looks through the Palantír at Tribute to the Shadow`, [
          { spec: 'The connected Scout offers its ordered intelligence choice before the destination and Palantír resolve', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Recall a Scout to gather intelligence?' })).toBeVisible() }
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `decline-palantir-intelligence-${gestureNumber}`, `${buyer.name} leaves the connected Scout in place`, async () => {
          await buyer.page.getByRole('button', { name: 'Leave Scouts in place' }).click(); accepted.value += 1;
        }, [
          { spec: 'The destination then resolves and offers the affordable one-Mithril conversion', check: async () => await expect(buyer.page.getByRole('button', { name: 'Pay 1 Mithril · draw 2 · discard 1' })).toBeEnabled() },
          { spec: 'Observers see the ordered decision but cannot pay for another player', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Pay 1 Mithril · draw 2 · discard 1' })).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);
        const handBeforePay = await playerValue(seats[0], buyer, 'Hand');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `pay-palantir-${gestureNumber}`, `${buyer.name} pays one Mithril for the glimpse`, async () => {
          await buyer.page.getByRole('button', { name: 'Pay 1 Mithril · draw 2 · discard 1' }).click(); accepted.value += 1;
        }, [
          { spec: 'The owner privately draws exactly two cards and must discard one', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Which card will you discard after the glimpse?' })).toBeVisible();
            await expect.poll(() => playerValue(seats[0], buyer, 'Hand'), { timeout: 2_000 }).toBe(handBeforePay + 2);
            await expect.poll(() => playerValue(seats[0], buyer, 'Mithril'), { timeout: 2_000 }).toBe(mithrilBefore - 1);
            await expect(buyer.page.getByRole('button', { name: /^Discard / }).first()).toBeEnabled();
          } },
          { spec: 'Other humans see only disabled private-card choices', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Discard private card' }).first()).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);
        const discardBefore = await playerValue(seats[0], buyer, 'Discard');
        const discardButton = buyer.page.getByRole('button', { name: /^Discard / }).first();
        const discardedName = (await discardButton.textContent())?.replace(/^Discard /, '') ?? 'private card';
        gestureNumber += 1;
        await steps.gesture(buyer.page, `discard-palantir-${gestureNumber}`, `${buyer.name} discards ${discardedName}`, async () => {
          await discardButton.click(); accepted.value += 1;
        }, [
          { spec: 'Exactly one chosen private card enters discard and the Agent turn advances', check: async () => {
            await expect.poll(() => playerValue(seats[0], buyer, 'Hand'), { timeout: 2_000 }).toBe(handBeforePay + 1);
            await expect.poll(() => playerValue(seats[0], buyer, 'Discard'), { timeout: 2_000 }).toBe(discardBefore + 1);
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} discards one private card to complete Palantír Glimpse`);
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ mustered, mithrilReady, played }).toEqual({ mustered: true, mithrilReady: true, played: true });
    await steps.gesture(buyer.page, 'reload-palantir-glimpse', `${buyer.name} reloads the Palantír outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the Muster Fate draw, paid Journey, discard, destination, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} privately draws 1 Fate with 1 Palantír Glimpse`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} pays 1 Mithril and privately draws up to 2 cards with Palantír Glimpse`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} discards one private card to complete Palantír Glimpse`);
        await expect(buyer.page.getByTestId('space-tribute-shadow')).toContainText(`Agent · ${buyer.name}`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Palantír Glimpse private draw and Muster Fate',
      'Three isolated humans acquire and Reveal Palantír Glimpse, prove its private Fate draw, earn Mithril through ordinary board play, later use the same physical card through its Shadow icon, pay the optional conversion, draw two private cards, mandate exactly one owner-authorized discard, and reload the conserved shared result.'
    );
  } finally {
    await table.close();
  }
});
