import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

const TARGETS = ['Whispered Rumor', 'Goblin Informer'] as const;
type TargetName = (typeof TARGETS)[number];

test('Whispered Rumor and Goblin Informer execute both Scout-linked boxes', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-scout-rumors-25', { phone: 'RUMRP', desktop: 'RUMRD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  const acquired = new Set<TargetName>();
  let rumorPlacements = 0;
  let goblinJourney = false;
  let rumorMuster = false;
  let goblinMuster = false;
  let awaitingRumorReveal = false;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const targetButton = (seat: PlotSeat, name: TargetName) => seat.page.getByTestId('private-hand').getByRole('button', {
    name: new RegExp(`^${name}`)
  }).first();
  const visible = async (locator: Locator) => locator.isVisible().catch(() => false);
  const firstEnabled = async (locator: Locator) => {
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isEnabled()) return candidate;
    }
    return null;
  };
  const cheapestEnabled = async (locator: Locator) => {
    const candidates: Array<{ locator: Locator; cost: number }> = [];
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isEnabled()) continue;
      const text = await candidate.textContent() ?? '';
      candidates.push({ locator: candidate, cost: Number(text.match(/· (\d+) Influence/)?.[1] ?? '99') });
    }
    return candidates.sort((left, right) => left.cost - right.cost)[0]?.locator ?? null;
  };
  const reveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      converged(accepted.value + 1)
    ]);
  };
  const declineInformer = async (actor: PlotSeat) => {
    if (!await visible(actor.page.getByRole('heading', { name: 'Recall a Scout with Goblin Informer?' }))) return;
    gestureNumber += 1;
    await steps.gesture(actor.page, `decline-${gestureNumber}`, `${actor.name} leaves Scouts in place for an earlier Goblin Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Leave Scouts in place' }).click(); accepted.value += 1;
    }, [
      { spec: 'The optional Muster recall closes without moving a Scout or adding a sword', check: async () => await expect(actor.page.getByRole('heading', { name: 'Recall a Scout with Goblin Informer?' })).toHaveCount(0) },
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

  const placeRumor = async (buyer: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-rumor-${gestureNumber}`, `${buyer.name} selects Whispered Rumor`, async () => {
      await targetButton(buyer, 'Whispered Rumor').click();
    }, [
      { spec: 'Its final Elven and Council icons enable matching destinations', check: async () => await expect(buyer.page.getByTestId('space-hidden-counsel')).toBeEnabled() }
    ]);
    gestureNumber += 1;
    await steps.gesture(buyer.page, `play-rumor-${gestureNumber}`, `${buyer.name} plays Whispered Rumor at Hidden Counsel`, async () => {
      await buyer.page.getByTestId('space-hidden-counsel').click(); accepted.value += 1;
    }, [
      { spec: 'The Elven destination resolves before the exact Journey Scout placement', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible() },
      converged(accepted.value + 1)
    ]);
    const preferred = buyer.page.getByTestId('post-old-south-road');
    const post = await preferred.isEnabled() ? preferred : buyer.page.locator('[data-testid^="post-"]:enabled').first();
    const postId = await post.getAttribute('data-testid');
    gestureNumber += 1;
    await steps.gesture(buyer.page, `place-rumor-scout-${gestureNumber}`, `${buyer.name} places Whispered Rumor's Scout`, async () => {
      await post.click(); accepted.value += 1;
    }, [
      { spec: 'Every browser sees the same finite Scout on the chosen observation post', check: async () => {
        expect(postId).toBeTruthy();
        for (const observer of seats) await expect(observer.page.getByTestId(postId!)).toContainText(`Scout · ${buyer.name}`);
      } },
      converged(accepted.value + 1)
    ]);
    rumorPlacements += 1;
  };

  const playGoblin = async (buyer: PlotSeat) => {
    const goldBefore = await count(buyer, buyer.name, 'Gold');
    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-goblin-${gestureNumber}`, `${buyer.name} selects Goblin Informer`, async () => {
      await targetButton(buyer, 'Goblin Informer').click();
    }, [
      { spec: 'Its final Shadow icon enables Tribute to the Shadow', check: async () => await expect(buyer.page.getByTestId('space-tribute-shadow')).toBeEnabled() }
    ]);
    gestureNumber += 1;
    await steps.gesture(buyer.page, `play-goblin-${gestureNumber}`, `${buyer.name} plays Goblin Informer at Tribute to the Shadow`, async () => {
      await buyer.page.getByTestId('space-tribute-shadow').click(); accepted.value += 1;
    }, [
      { spec: 'Goblin Informer adds exactly one Gold on top of Tribute’s two Gold', check: async () => {
        await expect(row(buyer, buyer.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore + 3));
      } },
      converged(accepted.value + 1)
    ]);
    goblinJourney = true;
  };

  const gatherBeforeRumor = async (buyer: PlotSeat) => {
    const road = buyer.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first();
    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-road-${gestureNumber}`, `${buyer.name} selects The Open Road while keeping Whispered Rumor`, async () => {
      await road.click();
    }, [
      { spec: 'The connected Take Up a War Effort destination becomes actionable', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
    ]);
    gestureNumber += 1;
    await steps.gesture(buyer.page, `place-road-${gestureNumber}`, `${buyer.name} sends the Agent beside the Rumor's Scout`, async () => {
      await buyer.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'Gather Intelligence interrupts before the board and Journey effects', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Recall a Scout to gather intelligence?' })).toBeVisible() },
      converged(accepted.value + 1)
    ]);
    const recall = buyer.page.getByRole('button', { name: /Recall Old South Road Scout and draw 1/ });
    gestureNumber += 1;
    await steps.gesture(buyer.page, `gather-${gestureNumber}`, `${buyer.name} recalls the Scout to gather intelligence`, async () => {
      await recall.click(); accepted.value += 1;
    }, [
      { spec: 'The Scout returns to supply, the private draw resolves, and the Agent turn advances', check: async () => {
        await expect(buyer.page.getByTestId('post-old-south-road')).not.toContainText(`Scout · ${buyer.name}`);
      } },
      converged(accepted.value + 1)
    ]);
    awaitingRumorReveal = true;
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 33');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('38 / 54');
    }

    for (let guard = 0; guard < 220 && !(rumorMuster && goblinMuster && goblinJourney && rumorPlacements >= 2); guard += 1) {
      const actor = await currentSeat();
      if (actor === buyer) {
        if (awaitingRumorReveal) {
          await reveal(buyer);
          const rumor = buyer.page.getByTestId('reveal-panel').getByText('Whispered Rumor', { exact: true }).locator('..');
          await expect(rumor).toContainText('2 Influence if you recalled a Scout this round');
          const articles = buyer.page.getByTestId('reveal-panel').locator('.muster-row article');
          let expectedInfluence = 0;
          for (let index = 0; index < await articles.count(); index += 1) {
            const text = await articles.nth(index).textContent() ?? '';
            expectedInfluence += Number(text.match(/(\d+) Influence/)?.[1] ?? '0');
          }
          await expect(buyer.page.getByTestId('reveal-panel').getByText(/Influence.*sword/).last()).toContainText(`${expectedInfluence} Influence`);
          rumorMuster = true;
          awaitingRumorReveal = false;
          await finishReveal(buyer);
          continue;
        }

        const hasRumor = await visible(targetButton(buyer, 'Whispered Rumor'));
        const hasGoblin = await visible(targetButton(buyer, 'Goblin Informer'));
        const hasScout = (await buyer.page.getByTestId('scout-network').getByText(`Scout · ${buyer.name}`).count()) > 0;
        const hasRoad = await visible(buyer.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first());

        if (!goblinJourney && hasGoblin) { await playGoblin(buyer); continue; }
        if (rumorPlacements === 0 && hasRumor) { await placeRumor(buyer); continue; }
        if (!rumorMuster && hasRumor && hasScout && hasRoad) { await gatherBeforeRumor(buyer); continue; }
        if (rumorMuster && rumorPlacements < 2 && hasRumor) { await placeRumor(buyer); continue; }
        if (rumorMuster && !goblinMuster && hasGoblin && hasScout) {
          await reveal(buyer);
          await expect(buyer.page.getByRole('heading', { name: 'Recall a Scout with Goblin Informer?' })).toBeVisible();
          for (const observer of seats.filter((seat) => seat !== buyer)) {
            await expect(observer.page.getByRole('button', { name: /Recall .* · \+1 sword/ }).first()).toBeDisabled();
          }
          const total = buyer.page.getByTestId('reveal-panel').getByText(/Influence.*sword/).last();
          const beforeText = await total.textContent() ?? '';
          const swordsBefore = Number(beforeText.match(/· (\d+) sword/)?.[1] ?? '-1');
          gestureNumber += 1;
          await steps.gesture(buyer.page, `goblin-recall-${gestureNumber}`, `${buyer.name} recalls a Scout with Goblin Informer`, async () => {
            await buyer.page.getByRole('button', { name: /Recall .* · \+1 sword/ }).first().click(); accepted.value += 1;
          }, [
            { spec: 'Goblin Informer adds exactly one public sword and returns the Scout to supply', check: async () => await expect(total).toContainText(`${swordsBefore + 1} swords`) },
            converged(accepted.value + 1)
          ]);
          goblinMuster = true;
          await finishReveal(buyer);
          continue;
        }
      }

      await reveal(actor);
      await declineInformer(actor);
      if (actor === buyer && acquired.size < TARGETS.length) {
        for (let purchase = 0; purchase < 12; purchase += 1) {
          let card: Locator | null = null;
          let target: TargetName | undefined;
          for (const name of TARGETS) {
            if (acquired.has(name)) continue;
            const candidate = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: new RegExp(`^${name}`) }));
            if (candidate) { card = candidate; target = name; break; }
          }
          card ??= await cheapestEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button'));
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          gestureNumber += 1;
          await steps.gesture(buyer.page, `acquire-${gestureNumber}`, `${buyer.name} acquires ${name}`, async () => {
            await card!.click(); accepted.value += 1;
            if (target) acquired.add(target);
          }, [
            { spec: target ? `${target} enters the real discard pile as an exact physical card` : 'An affordable card cycles the public market toward the remaining definition', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires ${name}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      await finishReveal(actor);
    }

    expect([...acquired].sort()).toEqual([...TARGETS].sort());
    expect({ rumorPlacements, goblinJourney, rumorMuster, goblinMuster }).toEqual({
      rumorPlacements: 2, goblinJourney: true, rumorMuster: true, goblinMuster: true
    });
    await steps.gesture(buyer.page, 'reload-scout-rumors', `${buyer.name} reloads the Scout-rumor outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves both Journey effects, both Scout recalls, the extra sword, and conditional Rumor Influence', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText('with Goblin Informer for 1 additional sword');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Chronicle Scout rumors',
      'Three isolated humans acquire Whispered Rumor and Goblin Informer. The owner plays both exact Journey boxes, places a finite Scout, recalls it through real Gather Intelligence before Rumor Reveals for two Influence, replays Rumor to restore the Scout, Reveals Goblin, proves observer authority, takes the optional additional sword, and reloads the deterministic shared outcome.'
    );
  } finally {
    await table.close();
  }
});
