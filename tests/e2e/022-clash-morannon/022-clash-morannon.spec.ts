import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Clash at the Morannon resolves the final Battle rewards before Recall', async ({ browser, page }, testInfo) => {
  test.setTimeout(450_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'lore-23', { phone: 'MORAP', desktop: 'MORAD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  const occupied = new Set<string>();

  const chooseBattlePlacement = async (actor: PlotSeat): Promise<{ card: Locator; destinationId: string; destinationName: string }> => {
    const families = [
      { card: /^(The Open Road|Muster the Host|Reconnaissance|Bree-land Guide)/, spaces: [['edoras', 'Edoras'], ['entwash', 'Entwash']] },
      { card: /^(Armed Escort|Muster the Host|Reconnaissance|Rider of Rohan|Bree-land Guide|Captain of Gondor)/, spaces: [['minas-tirith', 'Minas Tirith'], ['osgiliath', 'Osgiliath']] },
      { card: /^(Diplomatic Mission|Seek Allies)/, spaces: [['hidden-paths', 'Hidden Paths'], ['ranger-mustering', 'Ranger Mustering']] }
    ] as const;
    for (const family of families) {
      const card = actor.page.getByTestId('private-hand').getByRole('button', { name: family.card }).first();
      if (await card.count()) {
        const destination = family.spaces.find(([id]) => !occupied.has(id));
        if (destination) return { card, destinationId: destination[0], destinationName: destination[1] };
      }
    }
    throw new Error(`${actor.name} has no real card for an unused, affordable Battle destination`);
  };

  const finishOrderedPlacementChoices = async (actor: PlotSeat, prefix: string) => {
    for (let guard = 0; guard < 5; guard += 1) {
      if (await actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' }).isVisible().catch(() => false)) return;
      if (await actor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
        const post = actor.page.locator('[data-testid^="post-"]:not([disabled])').first();
        await steps.gesture(actor.page, `${prefix}-place-scout`, `${actor.name} places the card's required Scout`, async () => {
          await post.click(); accepted.value += 1;
        }, [
          { spec: 'A finite Scout becomes public before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-keep-seek`, `${actor.name} keeps Seek Allies`, async () => {
          await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted.value += 1;
        }, [
          { spec: 'The ordered Journey choice completes before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: 'Gain 2 Mithril' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-take-mithril`, `${actor.name} takes Entwash Mithril`, async () => {
          await actor.page.getByRole('button', { name: 'Gain 2 Mithril' }).click(); accepted.value += 1;
        }, [
          { spec: 'The Roads effect resolves before the next ordered continuation', check: async () => await expect.poll(async () =>
            Number(await actor.page.getByTestId('pending-choice').isVisible().catch(() => false)) +
            Number(await actor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false))
          ).toBeGreaterThan(0) },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: /Pay no Mithril/ }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-cross-osgiliath`, `${actor.name} crosses Osgiliath without Mithril`, async () => {
          await actor.page.getByRole('button', { name: /Pay no Mithril/ }).click(); accepted.value += 1;
        }, [
          { spec: 'The Stronghold effect resolves before the next ordered continuation', check: async () => await expect.poll(async () =>
            Number(await actor.page.getByTestId('pending-choice').isVisible().catch(() => false)) +
            Number(await actor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false))
          ).toBeGreaterThan(0) },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: 'Keep all cards' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-keep-cards`, `${actor.name} keeps every card at Ranger Mustering`, async () => {
          await actor.page.getByRole('button', { name: 'Keep all cards' }).click(); accepted.value += 1;
        }, [
          { spec: 'The optional trash resolves before the next ordered continuation', check: async () => await expect.poll(async () =>
            Number(await actor.page.getByTestId('pending-choice').isVisible().catch(() => false)) +
            Number(await actor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false))
          ).toBeGreaterThan(0) },
          converged(accepted.value + 1)
        ]);
      } else throw new Error(`Unexpected ordered placement continuation for ${actor.name}`);
    }
    throw new Error(`Battle deployment did not open for ${actor.name}`);
  };

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );

  try {
    const loreActor = await currentSeat();
    const loreCard = loreActor.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
    await steps.gesture(loreActor.page, 'choose-hall-of-fire', `${loreActor.name} chooses a real Council card`, async () => {
      await loreCard.click();
    }, [
      { spec: 'Hall of Fire is enabled by the printed Council icon', check: async () => await expect(loreActor.page.getByTestId('space-hall-fire')).toBeEnabled() }
    ]);
    await steps.gesture(loreActor.page, 'draw-endgame-fate', `${loreActor.name} draws private Fate at Hall of Fire`, async () => {
      await loreActor.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees only the public Fate count before the Endgame timing window', check: async () => {
        for (const observer of seats) await expect(row(observer, loreActor.name).getByText('Fate', { exact: true }).locator('..')).toContainText('1');
      } },
      converged(accepted.value + 1)
    ]);
    if (await loreActor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
      await steps.gesture(loreActor.page, 'place-hall-scout', `${loreActor.name} completes the card's Scout placement`, async () => {
        await loreActor.page.locator('[data-testid^="post-"]:enabled').first().click(); accepted.value += 1;
      }, [
        { spec: 'The ordered card effect finishes before the next human acts', check: async () => await expect(loreActor.page.getByText('Choose an empty post for the Scout.')).toHaveCount(0) },
        converged(accepted.value + 1)
      ]);
    }
    for (let round = 1; round <= 15; round += 1) {
      for (let turn = 0; turn < 3; turn += 1) {
        const actor = await currentSeat();
        await steps.gesture(actor.page, `round-${round}-reveal-${turn + 1}`, `${actor.name} Reveals in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        }, [
          { spec: 'The acting human exposes a real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
          converged(accepted.value + 1)
        ]);
        await steps.gesture(actor.page, `round-${round}-finish-${turn + 1}`, `${actor.name} finishes Reveal in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
        }, [
          { spec: turn < 2 ? 'Reveal authority advances clockwise' : round < 15 ? `The unopposed Battle closes and round ${round + 1} opens` : 'Clash at the Morannon opens as the sixteenth reviewed Battle', check: async () => {
            if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            else if (round < 15) await expect(page.getByText(new RegExp(`Round ${round + 1} · Agent turns`, 'i'))).toBeVisible();
            else for (const observer of seats) {
              await expect(observer.page.getByTestId('active-battle')).toContainText('Clash at the Morannon');
              await expect(observer.page.getByTestId('active-battle')).toContainText('First: 2 Renown + 1 standing with any faction');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Second: 1 Renown + recruit 2');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Third: 1 Renown');
            }
          } },
          converged(accepted.value + 1)
        ]);
      }
    }

    const participants: PlotSeat[] = [];
    for (let index = 0; index < 2; index += 1) {
      const actor = await currentSeat();
      participants.push(actor);
      const placement = await chooseBattlePlacement(actor);
      await steps.gesture(actor.page, `morannon-${index + 1}-choose-card`, `${actor.name} chooses a real Battle card`, async () => {
        await placement.card.click();
      }, [
        { spec: `${placement.destinationName} is enabled by the printed placement icon`, check: async () => await expect(actor.page.getByTestId(`space-${placement.destinationId}`)).toBeEnabled() }
      ]);
      await steps.gesture(actor.page, `morannon-${index + 1}-enter`, `${actor.name} enters the Clash through ${placement.destinationName}`, async () => {
        await actor.page.getByTestId(`space-${placement.destinationId}`).click(); accepted.value += 1;
        occupied.add(placement.destinationId);
      }, [
        { spec: 'Every observer sees the genuine Agent occupation and ordered continuation', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${placement.destinationId}`)).toContainText(actor.name);
          await expect.poll(async () =>
            Number(await actor.page.getByTestId('pending-choice').isVisible().catch(() => false)) +
            Number(await actor.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false))
          ).toBeGreaterThan(0);
        } },
        converged(accepted.value + 1)
      ]);
      await finishOrderedPlacementChoices(actor, `morannon-${index + 1}`);
      const amount = index === 0 ? 2 : 1;
      await steps.gesture(actor.page, `morannon-${index + 1}-deploy`, `${actor.name} deploys ${amount} ${amount === 1 ? 'Company' : 'Companies'}`, async () => {
        await actor.page.getByRole('button', { name: `Deploy ${amount}`, exact: true }).click(); accepted.value += 1;
      }, [
        { spec: 'Every observer sees the finite Battle force', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: actor.name })).toContainText(`${amount} Companies`);
        } },
        converged(accepted.value + 1)
      ]);
    }

    for (let turn = 0; turn < 3; turn += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `morannon-reveal-${turn + 1}`, `${actor.name} Reveals for the Morannon`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The real Muster row and swords become public', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `morannon-finish-${turn + 1}`, `${actor.name} finishes the Morannon Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: turn < 2 ? 'Reveal authority advances' : 'The two deployed humans enter Combat Fate', check: async () => {
          if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else for (const participant of participants) await expect(participant.page.getByText('Round 16 · Combat Fate')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }

    const force = (name: string) => page.getByTestId('active-battle').locator('article').filter({ hasText: name });
    const strength = async (name: string) => Number((await force(name).locator('b').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    const firstStrength = await strength(participants[0].name);
    const secondStrength = await strength(participants[1].name);
    expect(firstStrength, 'the deterministic journey must have a sole winner').not.toBe(secondStrength);
    const winner = firstStrength > secondStrength ? participants[0] : participants[1];
    const runner = firstStrength < secondStrength ? participants[0] : participants[1];
    const winnerRenownBefore = await count(seats[0], winner.name, 'Renown');
    const winnerStandingBefore = await count(seats[0], winner.name, 'Dwarven');
    const runnerRenownBefore = await count(seats[0], runner.name, 'Renown');
    const runnerGarrisonBefore = await count(seats[0], runner.name, 'Garrison');
    const runnerSupplyBefore = await count(seats[0], runner.name, 'Supply');

    for (let pass = 0; pass < 2; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `morannon-pass-${pass + 1}`, `${actor.name} passes Combat Fate`, async () => {
        await actor.page.getByTestId('pass-battle').click(); accepted.value += 1;
      }, [
        { spec: pass === 0 ? 'Combat authority passes to the other participant' : 'Both ranked rewards resolve and the winner standing choice blocks Recall', check: async () => {
          if (pass === 0) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else {
            for (const observer of seats) {
              await expect(observer.page.getByRole('heading', { name: 'Which faction gains standing?' })).toBeVisible();
              await expect(row(observer, winner.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(winnerRenownBefore + 2));
              await expect(row(observer, runner.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(runnerRenownBefore + 1));
              await expect(row(observer, runner.name).getByText('Garrison', { exact: true }).locator('..')).toContainText(String(runnerGarrisonBefore + Math.min(2, runnerSupplyBefore)));
            }
          }
        } },
        converged(accepted.value + 1)
      ]);
    }

    await steps.gesture(winner.page, 'reload-morannon-standing', `${winner.name} reloads the final Battle standing reward`, async () => {
      await reloadGameClient(winner.page);
    }, [
      { spec: 'The exact winner and four faction options replay before Recall', check: async () => {
        await expect(winner.page.getByRole('heading', { name: 'Which faction gains standing?' })).toBeVisible();
        await expect(winner.page.getByRole('button', { name: 'Gain dwarven standing' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== winner)) await expect(observer.page.getByRole('button', { name: 'Gain dwarven standing' })).toBeDisabled();
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(winner.page, 'choose-morannon-standing', `${winner.name} chooses Dwarven standing`, async () => {
      await winner.page.getByRole('button', { name: 'Gain dwarven standing' }).click(); accepted.value += 1;
    }, [
      { spec: 'Exactly one Dwarven standing resolves publicly for the Battle winner', check: async () => {
        for (const observer of seats) await expect(row(observer, winner.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText(String(winnerStandingBefore + 1));
      } },
      { spec: 'The complete sixteen-card Battle sequence opens Endgame only after its last ordered reward', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByText('Round 16 · Endgame')).toBeVisible();
          await expect(observer.page.getByTestId('endgame-window')).toContainText('Battle deck exhausted');
          await expect(observer.page.getByText('16 / 16')).toBeVisible();
        }
      } },
      converged(accepted.value + 1)
    ]);

    expect(loreActor.name, 'the Hall of Fire actor must win the deterministic Morannon journey').toBe(winner.name);
    const loreMithrilBefore = await count(seats[0], loreActor.name, 'Mithril');
    const loreRenownBefore = await count(seats[0], loreActor.name, 'Renown');
    await steps.gesture(loreActor.page, 'play-lore-beyond-price', `${loreActor.name} plays Lore Beyond Price`, async () => {
      await loreActor.page.getByRole('button', { name: /Play Lore Beyond Price/ }).click(); accepted.value += 1;
    }, [
      { spec: 'The Endgame Fate pays exactly four earned Mithril for one Renown and retains authority', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, loreActor.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(loreMithrilBefore - 4));
          await expect(row(observer, loreActor.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(loreRenownBefore + 1));
          await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        }
        await expect(loreActor.page.getByTestId('pass-endgame')).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    for (let pass = 0; pass < 3; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `endgame-pass-${pass + 1}`, `${actor.name} passes Endgame`, async () => {
        await actor.page.getByTestId('pass-endgame').click(); accepted.value += 1;
      }, [
        { spec: pass < 2 ? 'Endgame authority advances clockwise after a real human pass' : 'Three consecutive passes apply final scoring in every client', check: async () => {
          if (pass < 2) {
            await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            for (const observer of seats) await expect(observer.page.getByTestId('endgame-window')).toBeVisible();
          } else {
            for (const observer of seats) {
              await expect(observer.page.getByTestId('final-result')).toContainText('Battle deck exhausted');
              await expect(observer.page.getByTestId('final-result')).toContainText(winner.name);
              await expect(observer.page.getByTestId('final-result').getByRole('listitem')).toHaveCount(3);
              await expect(observer.page.locator('footer')).toContainText('Final result recorded');
            }
          }
        } },
        converged(accepted.value + 1)
      ]);
    }

    await steps.gesture(winner.page, 'reload-final-result', `${winner.name} reloads the finished match`, async () => {
      await reloadGameClient(winner.page);
    }, [
      { spec: 'The immutable room history reproduces the same winner and complete tiebreak ledger', check: async () => {
        await expect(winner.page.getByRole('heading', { name: 'Victory in Middle-earth' })).toBeVisible();
        await expect(winner.page.getByTestId('final-result')).toContainText(winner.name);
        await expect(winner.page.getByTestId('final-result')).toContainText('Renown');
        await expect(winner.page.getByTestId('final-result')).toContainText('Mithril');
        await expect(winner.page.getByTestId('final-result')).toContainText('Gold');
        await expect(winner.page.getByTestId('final-result')).toContainText('Provisions');
        await expect(winner.page.getByTestId('final-result')).toContainText('standing');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs('Clash at the Morannon through final scoring', 'Three isolated humans exhaust fifteen Battles through ordinary Reveal turns, deploy two finite forces through real cards and board destinations, resolve Combat ranking, receive the exact first-rank and second-rank rewards, reload persisted winner authority, enter Endgame only after the final ordered choice, pass clockwise with real gestures, agree on the deterministic winner and full tiebreak ledger, and reload the finished match from its immutable event history.');
  } finally {
    await table.close();
  }
});
