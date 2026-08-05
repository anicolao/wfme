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

/**
 * Keeps the executable proof, zero-pixel screenshot, and reviewer-facing
 * walkthrough inseparable. A gesture is not complete until every semantic
 * check passes and its resulting UI is captured.
 */
export class TestStepHelper {
  private steps: DocumentedStep[] = [];

  constructor(private readonly testInfo: TestInfo) {}

  async observe(page: Page, id: string, description: string, verifications: Verification[]) {
    for (const verification of verifications) await verification.check();
    const index = String(this.steps.length).padStart(3, '0');
    const safeId = id.replaceAll('_', '-');
    await expect(page).toHaveScreenshot(`${index}-${safeId}-${this.testInfo.project.name}`, { timeout: 2_000 });
    this.steps.push({ id: `${index}-${safeId}`, description, specs: verifications.map(({ spec }) => spec) });
  }

  async gesture(
    page: Page,
    id: string,
    description: string,
    perform: () => Promise<void>,
    verifications: Verification[]
  ) {
    await perform();
    await this.observe(page, id, description, verifications);
  }

  generateDocs(title: string, purpose: string) {
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
    writeFileSync(join(dirname(this.testInfo.file), 'README.md'), `${lines.join('\n').trimEnd()}\n`);
  }
}
