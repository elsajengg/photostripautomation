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
  clickButton,
  isElementVisible,
  pulseAlt,
} from "../../utils/steps";

import { runZoomedStep, setSingleMode } from "../test_flowphotostrip/e2e.spec";

const RETAKE_TIMES = parseInt(process.env.RETAKE_TIMES ?? "5", 10);

export async function stepSelectChangeFrame(page: Page) {
  const changeFrameButton = page.getByRole("button", { name: "Change Frame" });
  if (await isElementVisible(changeFrameButton)) {
    await clickButton(changeFrameButton);
  }

  await stepSelectFrame(page);
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
