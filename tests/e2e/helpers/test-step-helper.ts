import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export class TestStepHelper {
  private index = 0;

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
    private readonly scenario: string,
    private readonly actor: string
  ) {}

  async gesture(name: string, action: () => Promise<void>, validation: () => Promise<void>) {
    await action();
    await validation();
    const filename = `${this.actor}-${String(this.index++).padStart(3, '0')}-${name}-${this.testInfo.project.name}.png`;
    const directory = path.resolve('tests/e2e', this.scenario, 'screenshots');
    await mkdir(directory, { recursive: true });
    await this.page.screenshot({ path: path.join(directory, filename), fullPage: true });
    await expect(this.page.locator('body')).toBeVisible();
  }
}
