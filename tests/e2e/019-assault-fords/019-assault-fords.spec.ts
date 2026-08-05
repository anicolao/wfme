import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Assault on the Fords resolves exact first- and second-rank rewards before Recall', async ({ browser, page }, testInfo) => {
  test.setTimeout(390_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'assault-fords-0', { phone: 'FORDP', desktop: 'FORDD' });
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
          { spec: 'The Roads effect resolves before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: /Pay no Mithril/ }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-cross-osgiliath`, `${actor.name} crosses Osgiliath without Mithril`, async () => {
          await actor.page.getByRole('button', { name: /Pay no Mithril/ }).click(); accepted.value += 1;
        }, [
          { spec: 'The Stronghold effect resolves before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else if (await actor.page.getByRole('button', { name: 'Keep all cards' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `${prefix}-keep-cards`, `${actor.name} keeps every card at Ranger Mustering`, async () => {
          await actor.page.getByRole('button', { name: 'Keep all cards' }).click(); accepted.value += 1;
        }, [
          { spec: 'The optional trash resolves before Battle deployment', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
      } else throw new Error(`Unexpected ordered placement continuation for ${actor.name}`);
    }
    throw new Error(`Battle deployment did not open for ${actor.name}`);
  };

  try {
    for (let round = 1; round < 5; round += 1) {
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
          { spec: turn < 2 ? 'Reveal authority advances clockwise' : round < 4 ? `The unopposed Battle closes and round ${round + 1} opens` : 'Assault on the Fords opens as the fifth selected Battle', check: async () => {
            if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            else if (round < 4) await expect(page.getByText(new RegExp(`Round ${round + 1} · Agent turns`, 'i'))).toBeVisible();
            else for (const observer of seats) {
              await expect(observer.page.getByTestId('active-battle')).toContainText('Assault on the Fords');
              await expect(observer.page.getByTestId('active-battle')).toContainText('First: 1 Renown + 1 Wild standing');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Second: 1 standing with any faction');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Third: 2 Gold');
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
      await steps.gesture(actor.page, `assault-${index + 1}-choose-card`, `${actor.name} chooses a real Battle card`, async () => {
        await placement.card.click();
      }, [
        { spec: `${placement.destinationName} is enabled by the printed placement icon`, check: async () => await expect(actor.page.getByTestId(`space-${placement.destinationId}`)).toBeEnabled() }
      ]);
      await steps.gesture(actor.page, `assault-${index + 1}-enter`, `${actor.name} enters the Assault through ${placement.destinationName}`, async () => {
        await actor.page.getByTestId(`space-${placement.destinationId}`).click(); accepted.value += 1;
        occupied.add(placement.destinationId);
      }, [
        { spec: 'Every observer sees the genuine Agent occupation and ordered continuation', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${placement.destinationId}`)).toContainText(actor.name);
          await expect(actor.page.getByTestId('pending-choice')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
      await finishOrderedPlacementChoices(actor, `assault-${index + 1}`);
      const amount = index === 0 ? 2 : 1;
      await steps.gesture(actor.page, `assault-${index + 1}-deploy`, `${actor.name} deploys ${amount} ${amount === 1 ? 'Company' : 'Companies'}`, async () => {
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
      await steps.gesture(actor.page, `assault-reveal-${turn + 1}`, `${actor.name} Reveals for the Assault`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The real Muster row and swords become public', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `assault-finish-${turn + 1}`, `${actor.name} finishes the Assault Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: turn < 2 ? 'Reveal authority advances' : 'The two deployed humans enter Combat Fate', check: async () => {
          if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else for (const participant of participants) await expect(participant.page.getByText('Round 5 · Combat Fate')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }

    const force = async (name: string) => page.getByTestId('active-battle').locator('article').filter({ hasText: name });
    const strength = async (name: string) => Number((await (await force(name)).locator('b').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    const firstStrength = await strength(participants[0].name);
    const secondStrength = await strength(participants[1].name);
    const winner = firstStrength === secondStrength ? null : firstStrength > secondStrength ? participants[0] : participants[1];
    const rewardRecipients = firstStrength === secondStrength ? participants : [firstStrength < secondStrength ? participants[0] : participants[1]];
    const winnerRenownBefore = winner ? Number((await row(page === winner.page ? winner : seats[0], winner.name).getByText('Renown', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1') : -1;
    const winnerWildBefore = winner ? Number((await row(page === winner.page ? winner : seats[0], winner.name).getByText('Wild', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1') : -1;

    for (let pass = 0; pass < 2; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `assault-pass-${pass + 1}`, `${actor.name} passes Combat Fate`, async () => {
        await actor.page.getByTestId('pass-battle').click(); accepted.value += 1;
      }, [
        { spec: pass === 0 ? 'Combat authority passes to the other participant' : 'Ranked rewards resolve and the standing choice blocks Recall', check: async () => {
          if (pass === 0) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else {
            for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Which faction gains standing?' })).toBeVisible();
            if (winner) {
              for (const observer of seats) {
                await expect(row(observer, winner.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(winnerRenownBefore + 1));
                await expect(row(observer, winner.name).getByText('Wild', { exact: true }).locator('..')).toContainText(String(winnerWildBefore + 1));
              }
            }
          }
        } },
        converged(accepted.value + 1)
      ]);
    }

    let choiceActor: PlotSeat | undefined;
    for (const seat of seats) if (await seat.page.getByRole('button', { name: 'Gain dwarven standing' }).isEnabled()) choiceActor = seat;
    if (!choiceActor) throw new Error('No ranked human owns the Battle standing choice');
    await steps.gesture(choiceActor.page, 'reload-standing-choice', `${choiceActor.name} reloads the ordered standing reward`, async () => {
      await reloadGameClient(choiceActor!.page);
    }, [
      { spec: 'The exact recipient and four faction options replay before Recall', check: async () => {
        await expect(choiceActor!.page.getByRole('heading', { name: 'Which faction gains standing?' })).toBeVisible();
        await expect(choiceActor!.page.getByRole('button', { name: 'Gain dwarven standing' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== choiceActor)) await expect(observer.page.getByRole('button', { name: 'Gain dwarven standing' })).toBeDisabled();
      } },
      converged(accepted.value)
    ]);

    for (let index = 0; index < rewardRecipients.length; index += 1) {
      let recipient: PlotSeat | undefined;
      for (const seat of seats) if (await seat.page.getByRole('button', { name: 'Gain dwarven standing' }).isEnabled()) recipient = seat;
      if (!recipient) throw new Error(`Standing reward ${index + 1} has no authorized human`);
      const before = Number((await row(recipient, recipient.name).getByText('Dwarven', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
      await steps.gesture(recipient.page, `choose-standing-${index + 1}`, `${recipient.name} chooses Dwarven standing`, async () => {
        await recipient!.page.getByRole('button', { name: 'Gain dwarven standing' }).click(); accepted.value += 1;
      }, [
        { spec: 'Exactly one Dwarven standing resolves publicly for the ranked recipient', check: async () => {
          for (const observer of seats) await expect(row(observer, recipient!.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText(String(before + 1));
        } },
        { spec: index + 1 < rewardRecipients.length ? 'The next tied recipient receives ordered authority' : 'All ranked rewards finish before round six begins', check: async () => {
          if (index + 1 < rewardRecipients.length) for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Which faction gains standing?' })).toBeVisible();
          else for (const observer of seats) await expect(observer.page.getByText('Round 6 · Agent turns')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }

    steps.generateDocs('Assault on the Fords as a selected Age II Battle', 'Three isolated humans reveal through the first four selected Battles, deploy two finite forces through real cards and board destinations at Assault on the Fords, resolve Combat ranking, receive the exact first-rank Renown and Wild standing plus the ordered second-rank faction choice, reload that persisted authority, and finish Recall only after every ranked reward resolves.');
  } finally {
    await table.close();
  }
});
