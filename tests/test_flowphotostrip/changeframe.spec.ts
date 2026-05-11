import type { ElectronApplication, Locator, Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  stepHome,
  stepProcedure,
  stepPackageSelection,
  stepBeforePayment,
  stepSelectCamera,
  stepWaitForPhotos,
  stepPickPhotosIfPresent,
  stepSelectFilterIfPresent,
  stepDeclineUpsell,
  stepWaitForCompletion,
  applyAutomationZoom,
  logMemory,
  resetMemoryBaseline,
  stabilizePage,
  stepSelectFrame,
  isElementVisible,
} from "../../utils/steps";

const PHONE = process.env.PHONE ?? "085335073597";
const VOUCHER = process.env.VOUCHER ?? "#0909";

async function runZoomedStep<T>(
  app: ElectronApplication,
  step: () => Promise<T>,
) {
  await applyAutomationZoom(app);
  return step();
}

async function setSingleMode(page: Page, app: ElectronApplication) {
  await applyAutomationZoom(app);
  await page
    .waitForURL(/#\/(home|settings|select-mode)/, { timeout: 120000 })
    .catch(() => undefined);
  await page.evaluate(() => {
    window.location.hash = "#/settings";
  });
  await stabilizePage(page);

  const modeSelect = page.locator('select[name="modeSelection"]');
  if (!(await modeSelect.isVisible().catch(() => false))) {
    await expect(page.locator('input[type="password"]').first()).toBeVisible({
      timeout: 60000,
    });
    await page.locator('input[type="password"]').first().fill("0000");
    await page
      .getByRole("button", { name: /Submit/i })
      .first()
      .evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
  }

  await expect(modeSelect).toBeVisible({ timeout: 60000 });
  await modeSelect.selectOption("single");
  await page
    .getByRole("button", { name: "Save Settings" })
    .first()
    .evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
  await page.waitForTimeout(1000);
  await applyAutomationZoom(app);

  await page.evaluate(() => {
    window.location.hash = "#/home";
  });
  await stabilizePage(page);
  await applyAutomationZoom(app);
}

async function firstVisible(locator: Locator, timeout = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const count = await locator.count();
    for (let index = 0; index < count; index++) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
    await locator.page().waitForTimeout(200);
  }

  return locator.first();
}

async function tapGuideIfPresent(page: Page, timeout = 1000) {
  const closeGuideButton = page.getByRole("button", {
    name: /Tutup panduan|Close .*guide|Close guide/i,
  });

  if (await isElementVisible(closeGuideButton, timeout)) {
    const target = await firstVisible(closeGuideButton, timeout);
    await target.click({ force: true }).catch(async () => {
      await target.evaluate((element) => {
        (element as HTMLElement).click();
      });
    });
    await page.waitForTimeout(300);
    return;
  }

  const guide = page
    .locator('[role="dialog"], [class*="guide" i], [class*="panduan" i]')
    .filter({ hasText: /panduan|guide/i });

  if (await isElementVisible(guide, timeout)) {
    const target = await firstVisible(guide, timeout);
    await target.click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(300);
  }
}

async function clickAfterGuide(locator: Locator, timeout = 60000) {
  await tapGuideIfPresent(locator.page());
  const target = await firstVisible(locator, timeout);
  await target.click({ force: true }).catch(async () => {
    await target.evaluate((element) => {
      (element as HTMLElement).click();
    });
  });
}

async function clickVisibleByIndex(
  locator: Locator,
  visibleIndex: number,
  timeout = 60000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const count = await locator.count();
    let currentVisibleIndex = 0;

    for (let index = 0; index < count; index++) {
      const candidate = locator.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      if (currentVisibleIndex === visibleIndex) {
        await candidate.scrollIntoViewIfNeeded();
        await candidate.click({ force: true }).catch(async () => {
          await candidate.evaluate((element) => {
            (element as HTMLElement).click();
          });
        });
        return;
      }

      currentVisibleIndex++;
    }

    await locator.page().waitForTimeout(200);
  }

  throw new Error(`Visible frame index ${visibleIndex} was not found`);
}

async function selectFrameCard(page: Page, frameIndex: number) {
  const frameCards = page.locator("img.cursor-pointer");
  const frameCount = await frameCards.count();

  if (frameCount === 0) {
    throw new Error("No selectable frame images found on change frame page");
  }

  await tapGuideIfPresent(page);
  await clickVisibleByIndex(frameCards, frameIndex);
  await page.waitForTimeout(500);
}

export async function stepSelectChangeFrame(page: Page) {
  await tapGuideIfPresent(page, 3000);

  let changeFrameButton = page.getByRole("button", { name: "Change Frame" });
  if (!(await isElementVisible(changeFrameButton, 2000))) {
    const nextButton = page.getByRole("button", { name: /^(NEXT|Next)$/ });
    if (await isElementVisible(nextButton, 2000)) {
      await clickAfterGuide(nextButton);
      await stabilizePage(page, 1000);
      await tapGuideIfPresent(page, 3000);
    }
  }

  changeFrameButton = page.getByRole("button", { name: "Change Frame" });
  if (await isElementVisible(changeFrameButton)) {
    await clickAfterGuide(changeFrameButton);
  }

  await tapGuideIfPresent(page, 3000);
  await selectFrameCard(page, 2);
  await clickAfterGuide(page.getByRole("button", { name: "Change Frame" }));
  await stabilizePage(page, 1000);
}


test("change frame", async ({ page, app }) => {
  test.setTimeout(0);

  resetMemoryBaseline();
  await logMemory(app, page, "baseline (before test)");
  await setSingleMode(page, app);

  const title = await page.title();
  console.log(`✓ App opened: ${title}`);

  // Home Awal
  await runZoomedStep(app, () => stepHome(page));
  console.log("[nw3] home → procedure");

  // Procedure / Tata Cara
  await runZoomedStep(app, () => stepProcedure(page, PHONE, VOUCHER));
  console.log("[nw3] procedure → package selection");

  // Package Selection
  await runZoomedStep(app, () => stepPackageSelection(page));
  console.log("[nw3] package selection → before payment");

  // Before Payment (phone + voucher)
  await runZoomedStep(app, () => stepBeforePayment(page, PHONE, VOUCHER));
  console.log("[nw3] before payment → select camera");

  // Select Camera
  await runZoomedStep(app, () => stepSelectCamera(page));
  console.log("[nw3] camera selected → taking photos");

  // Select Frame
  await stepSelectFrame(page);
  console.log("[nw3] selected frame");

  // Take Photos (automatic countdown)
  await runZoomedStep(app, () => stepWaitForPhotos(page));
  console.log("[nw3] photos taken");

  //Change Frame
  await stepSelectChangeFrame(page);
  console.log("[nw3] frame changed");

  // Pick Photos
  await runZoomedStep(app, () => stepPickPhotosIfPresent(page));
  console.log("[nw3] pick photos done");

  // Select Filter ───────────────────────────────────────────────────
  await runZoomedStep(app, () => stepSelectFilterIfPresent(page));
  console.log("[nw3] filter selection done");

  // Decline Upsell
  await runZoomedStep(app, () => stepDeclineUpsell(page));
  console.log("[nw3] upsell declined");

  // Wait for Completion
  await runZoomedStep(app, () => stepWaitForCompletion(page));
  console.log("[nw3] session complete");

  await logMemory(app, page, "after test");
  console.log("✓ NW3 test completed successfully");
});
