import { expect, type Page, type TestInfo } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type Verification = {
  spec: string;
  check: () => Promise<void>;
};

type DocumentedStep = {
  id: string;
  description: string;
  specs: string[];
};

type ScrollBoundary = 'top' | 'bottom';

/**
 * Keeps the executable proof, zero-pixel screenshot, and reviewer-facing
 * walkthrough inseparable. A gesture is not complete until every semantic
 * check passes and its resulting UI is captured.
 */
export class TestStepHelper {
  private steps: DocumentedStep[] = [];

  constructor(private readonly testInfo: TestInfo) {}

  async observe(page: Page, id: string, description: string, verifications: Verification[], scrollBoundary?: ScrollBoundary) {
    for (const verification of verifications) await verification.check();
    await expect(page.locator('main.game-shell')).toHaveAttribute('data-busy', 'false', {
      timeout: 2_000
    });
    const evidenceBoundary = scrollBoundary ?? (
      this.testInfo.project.name === 'phone' && (id.startsWith('acquire-') || id === 'buy-rider' || id === 'buy-eagle')
        ? 'bottom'
        : undefined
    );
    if (evidenceBoundary) {
      const target = await page.evaluate((boundary) => {
        const scrollingElement = document.scrollingElement ?? document.documentElement;
        const next = boundary === 'top' ? 0 : Math.max(0, scrollingElement.scrollHeight - innerHeight);
        scrollTo(0, next);
        return next;
      }, evidenceBoundary);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(target);
    }
    // A locator verification may scroll the document immediately before this
    // helper regains control. Chromium can report the final scroll position
    // before every overflow layer has repainted, producing a partially blank
    // capture even though the DOM and application state are settled. Cross two
    // paint boundaries so the screenshot records the final composited frame.
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
    const index = String(this.steps.length).padStart(3, '0');
    const safeId = id.replaceAll('_', '-');
    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Capturing and encoding a tall evidence frame is filesystem work, not
      // an application-state wait. Semantic assertions above retain the
      // strict two-second ceiling; the PNG write must be allowed to finish.
      timeout: 0
    });
    expect(screenshot).toMatchSnapshot(`${index}-${safeId}-${this.testInfo.project.name}`, { maxDiffPixels: 0 });
    this.steps.push({ id: `${index}-${safeId}`, description, specs: verifications.map(({ spec }) => spec) });
  }

  async gesture(
    page: Page,
    id: string,
    description: string,
    perform: () => Promise<void>,
    verifications: Verification[],
    scrollBoundary?: ScrollBoundary
  ) {
    await perform();
    await this.observe(page, id, description, verifications, scrollBoundary);
  }

  generateDocs(title: string, purpose: string, filename = 'README.md') {
    if (process.env.UPDATE_E2E_DOCS !== 'true') return;

    const lines = [
      `# Test: ${title}`,
      '',
      purpose,
      '',
      'Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.',
      ''
    ];
    for (const step of this.steps) {
      lines.push(
        `## ${step.description}`,
        '',
        `![Phone: ${step.description}](./screenshots/${step.id}-phone.png)`,
        '',
        `![Desktop: ${step.description}](./screenshots/${step.id}-desktop.png)`,
        '',
        '**Verifications:**',
        '',
        ...step.specs.map((spec) => `- [x] ${spec}`),
        '',
        '---',
        ''
      );
    }
    writeFileSync(join(dirname(this.testInfo.file), filename), `${lines.join('\n').trimEnd()}\n`);
  }
}
