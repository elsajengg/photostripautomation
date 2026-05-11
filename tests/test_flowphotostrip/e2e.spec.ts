/**
 * NW3 Test: End-to-end photostrip flow with voucher, retake, zoom, filter, and final wait
 *
 * Prerequisites
 * -------------
 * 1. Build the app first: npm run build:unpack
 * 2. The test voucher must reduce the order total to Rp 0 (free session),
 *    otherwise the test will stop at the payment screen.
 *
 * Running
 * -------
 *   # Single run
 *   npm run test:nw3
 *
 *   # Override credentials via env
 *   PHONE=085335073597 VOUCHER=#0909 npm run test:nw3
 *
 *   # With retakes
 *   RETAKE_TIMES=5 npm run test:nw3
 */

import type { ElectronApplication, Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  stepHome,
  stepProcedure,
  stepPackageSelection,
  stepBeforePayment,
  stepSelectCamera,
  stepWaitForPhotos,
  stepRetakePhotos,
  stepPickAndRemoveFirstPhoto,
  stepPickPhotosIfPresent,
  stepSelectFilterIfPresent,
  stepDeclineUpsell,
  stepWaitForCompletion,
  applyAutomationZoom,
  logMemory,
  resetMemoryBaseline,
  stabilizePage,
  stepSelectFrame,
} from "../../utils/steps";

const PHONE = process.env.PHONE ?? "085335073597";
const VOUCHER = process.env.VOUCHER ?? "#0909";
const RETAKE_TIMES = parseInt(process.env.RETAKE_TIMES ?? "5", 10);

export async function applyZoomOut4x(app: ElectronApplication) {
  await applyAutomationZoom(app);
}

export async function runZoomedStep<T>(
  app: ElectronApplication,
  step: () => Promise<T>,
) {
  await applyZoomOut4x(app);
  return step();
}

export async function setSingleMode(page: Page, app: ElectronApplication) {
  await applyZoomOut4x(app);
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
  await applyZoomOut4x(app);

  await page.evaluate(() => {
    window.location.hash = "#/home";
  });
  await stabilizePage(page);
  await applyZoomOut4x(app);
}

test.describe("NW3 Photostrip Tests", () => {
  test("complete end-to-end photostrip flow with voucher, retake, filter, and completion", async ({
    page,
    app,
  }) => {
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
    await runZoomedStep(app, () => stepProcedure(page));
    console.log("[nw3] procedure → package selection");

    // Package Selection
    await runZoomedStep(app, () => stepPackageSelection(page));
    console.log("[nw3] package selection → before payment");

    // Before Payment (phone + voucher)
    await runZoomedStep(app, () => stepBeforePayment(page));
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

    // Retake all available photos 
    await runZoomedStep(app, () => stepRetakePhotos(page, RETAKE_TIMES));
    console.log(`[nw3] retake session completed for ${RETAKE_TIMES} photos`);

    // Pick Photos
    await runZoomedStep(app, () => stepPickPhotosIfPresent(page));
    console.log("[nw3] pick photos done");

    // Select Filter ───────────────────────────────────────────────────
    await runZoomedStep(app, () => stepSelectFilterIfPresent(page));
    console.log("[nw3] filter selection done");

    // ── 10. Decline Upsell ─────────────────────────────────────────────────
    await runZoomedStep(app, () => stepDeclineUpsell(page));
    console.log("[nw3] upsell declined");

    // ── 11. Wait for Completion ─────────────────────────────────────────────
    await runZoomedStep(app, () => stepWaitForCompletion(page));
    console.log("[nw3] session complete");

    await logMemory(app, page, "after test");
    console.log("✓ NW3 test completed successfully");
  });

  test("photostrip flow with minimal retakes", async ({ page, app }) => {
    test.setTimeout(0);

    await stabilizePage(page);
    await setSingleMode(page, app);

    const title = await page.title();
    console.log(`✓ App opened: ${title}`);

    // Quick flow with a full retake session
    await runZoomedStep(app, () => stepHome(page));
    await runZoomedStep(app, () => stepProcedure(page));
    await runZoomedStep(app, () => stepPackageSelection(page));
    await runZoomedStep(app, () => stepBeforePayment(page));
    await runZoomedStep(app, () => stepSelectCamera(page));
    await stepSelectFrame(page);
    await runZoomedStep(app, () => stepWaitForPhotos(page));

    await runZoomedStep(app, () => stepRetakePhotos(page, "all"));

    // Continue with photo selection
    await runZoomedStep(app, () => stepPickPhotosIfPresent(page));
    await runZoomedStep(app, () => stepSelectFilterIfPresent(page));
    await runZoomedStep(app, () => stepDeclineUpsell(page));
    await runZoomedStep(app, () => stepWaitForCompletion(page));

    console.log("✓ Minimal retake test completed");
  });

  test("pick photos removes selected photo when the same shot is clicked again", async ({
    page,
    app,
  }) => {
    test.setTimeout(0);

    await stabilizePage(page);
    await setSingleMode(page, app);

    await runZoomedStep(app, () => stepHome(page));
    await runZoomedStep(app, () => stepProcedure(page));
    await runZoomedStep(app, () => stepPackageSelection(page));
    await runZoomedStep(app, () => stepBeforePayment(page));
    await runZoomedStep(app, () => stepSelectCamera(page));
    await stepSelectFrame(page);
    await runZoomedStep(app, () => stepWaitForPhotos(page));
    await runZoomedStep(app, () => stepRetakePhotos(page, "all"));

    await runZoomedStep(app, () => stepPickAndRemoveFirstPhoto(page));

    console.log("Pick photos remove selected photo test completed");
  });
});
