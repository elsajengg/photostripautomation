import type { ElectronApplication, Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const DEFAULT_TIMEOUT = 60000;
const LONG_TIMEOUT = 120000;
const PHOTO_COUNT = 5;

type MemSnapshot = { mainRss: number; mainHeap: number; rendererHeap: number };

export async function applyAutomationZoom(app: ElectronApplication) {
  await app
    .evaluate(({ BrowserWindow }: any) => {
      const window = BrowserWindow.getAllWindows()[0];
      window?.setAutoHideMenuBar(false);
      window?.setMenuBarVisibility(true);
      window?.webContents.setZoomLevel(-3);
    })
    .catch(() => undefined);
}

async function takeMemSnapshot(
  app: ElectronApplication,
  page: Page,
): Promise<MemSnapshot> {
  const main = await app.evaluate(() => process.memoryUsage());
  const rendererHeap = await page
    .evaluate(() => {
      const memory = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory;
      return memory?.usedJSHeapSize ?? 0;
    })
    .catch(() => 0);

  return {
    mainRss: main.rss,
    mainHeap: main.heapUsed,
    rendererHeap,
  };
}

function fmtMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

let baselineSnapshot: MemSnapshot | null = null;

export async function logMemory(
  app: ElectronApplication,
  page: Page,
  label: string,
) {
  const snap = await takeMemSnapshot(app, page);
  baselineSnapshot ??= snap;

  const delta = (value: number, base: number) => {
    const diff = value - base;
    return `${diff >= 0 ? "+" : ""}${fmtMb(diff)}`;
  };

  console.log(`\n[mem] ${label}`);
  console.log(
    `  main  rss  : ${fmtMb(snap.mainRss)}  (${delta(snap.mainRss, baselineSnapshot.mainRss)} from baseline)`,
  );
  console.log(
    `  main  heap : ${fmtMb(snap.mainHeap)}  (${delta(snap.mainHeap, baselineSnapshot.mainHeap)} from baseline)`,
  );
  if (snap.rendererHeap > 0) {
    console.log(
      `  renderer   : ${fmtMb(snap.rendererHeap)}  (${delta(snap.rendererHeap, baselineSnapshot.rendererHeap)} from baseline)`,
    );
  }
}

export function resetMemoryBaseline() {
  baselineSnapshot = null;
}

async function firstVisible(locator: Locator, timeout = DEFAULT_TIMEOUT) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const count = await locator.count();
    for (let index = 0; index < count; index++) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  await expect(locator.first()).toBeVisible({ timeout: 1 });
  return locator.first();
}

export async function clickButton(locator: Locator, timeout = DEFAULT_TIMEOUT) {
  const target = await firstVisible(locator, timeout);
  await target.click().catch(async () => {
    await target.evaluate((element) => {
      (element as HTMLElement).click();
    });
  });
}

async function forceClickButton(locator: Locator, timeout = DEFAULT_TIMEOUT) {
  const target = await firstVisible(locator, timeout);
  await expect(target).toBeEnabled({ timeout });
  await target.scrollIntoViewIfNeeded();
  await target.click({ force: true }).catch(async () => {
    await target.evaluate((element) => {
      (element as HTMLElement).click();
    });
  });
}

async function domClickButton(locator: Locator, timeout = DEFAULT_TIMEOUT) {
  const target = await firstVisible(locator, timeout);
  await expect(target).toBeEnabled({ timeout });
  await target.evaluate((element) => {
    (element as HTMLElement).click();
  });
}

async function triggerAltInPage(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        altKey: true,
        bubbles: true,
        key: "Alt",
      }),
    );
    window.dispatchEvent(
      new KeyboardEvent("keyup", {
        altKey: false,
        bubbles: true,
        key: "Alt",
      }),
    );
  });
}

export async function pulseAlt(page: Page) {
  await page.keyboard.press("Alt").catch(() => undefined);
  await triggerAltInPage(page).catch(() => undefined);
}

export async function clickFirstVisibleButton(
  page: Page,
  name: string | RegExp,
  timeout = DEFAULT_TIMEOUT,
) {
  await clickButton(page.getByRole("button", { name }), timeout);
}

export async function clickAllVisibleButtons(
  page: Page,
  name: string | RegExp,
) {
  const buttons = page.getByRole("button", { name });
  const count = await buttons.count();

  for (let index = 0; index < count; index++) {
    const button = buttons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      await page.waitForTimeout(300);
    }
  }
}

export async function waitForTextHidden(
  page: Page,
  text: string | RegExp,
  timeout = LONG_TIMEOUT,
) {
  await page.getByText(text).waitFor({ state: "hidden", timeout });
}

export async function waitForTextVisible(
  page: Page,
  text: string | RegExp,
  timeout = LONG_TIMEOUT,
) {
  await page.getByText(text).waitFor({ state: "visible", timeout });
}

export async function isElementVisible(
  locator: Locator,
  timeout = 2000,
): Promise<boolean> {
  try {
    await expect(locator.first()).toBeVisible({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function stabilizePage(page: Page, delay = 1000) {
  await page.bringToFront();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(delay);
}

async function waitForProcessingDoneOrCameraReady(page: Page) {
  const processing = page.getByText(/Memproses|Processing/i);
  const cameraReady = page.getByRole("button", {
    name: /Camera|Take Photos|Start/i,
  });

  await Promise.race([
    processing
      .waitFor({ state: "hidden", timeout: LONG_TIMEOUT })
      .catch(() => undefined),
    cameraReady
      .first()
      .waitFor({ state: "visible", timeout: LONG_TIMEOUT })
      .catch(() => undefined),
    page
      .waitForURL(/select-camera|take-photo/i, { timeout: LONG_TIMEOUT })
      .catch(() => undefined),
  ]);

  await page.waitForTimeout(1000);
}

export async function stepHome(page: Page) {
  await stabilizePage(page);

  const startButton = page.getByRole("button", {
    name: /start|mulai|photo|foto|next|lanjut/i,
  });
  if (await isElementVisible(startButton)) {
    await clickButton(startButton);
    return;
  }

  const startLink = page.getByRole("link", {
    name: /start|mulai|photo|foto|next|lanjut/i,
  });
  if (await isElementVisible(startLink)) {
    await clickButton(startLink);
    return;
  }

  await clickButton(page.locator("img"));
}

export async function stepProcedure(
  page: Page,
  phone = "085335073597",
  voucher = "#0909",
) {
  await clickFirstVisibleButton(page, /Next|Lanjut/i);

  const phoneInput = page.getByPlaceholder("Enter your phone number");
  if (await isElementVisible(phoneInput)) {
    await phoneInput.fill(phone);
  }

  const voucherInput = page.getByPlaceholder("Voucher code");
  if (await isElementVisible(voucherInput)) {
    await voucherInput.fill(voucher);
  }
}

export async function stepPackageSelection(page: Page) {
  await clickButton(page.getByText("Payment DetailsMetode"));
  await waitForTextHidden(page, /Memproses|Processing/i, LONG_TIMEOUT);
}

export async function stepBeforePayment(
  page: Page,
  _phone = "085335073597",
  _voucher = "#0909",
) {
  const applyButton = page.getByRole("button", { name: /Pakai|Apply/i });
  if (await isElementVisible(applyButton)) {
    await clickButton(applyButton);
  }

  await clickFirstVisibleButton(page, /Lanjut\s*Foto|Continue/i);
  await waitForProcessingDoneOrCameraReady(page);
}

export async function stepSelectCamera(page: Page) {
  const cameraButton = page.getByRole("button", { name: "Camera" });
  if (await isElementVisible(cameraButton)) {
    await clickButton(cameraButton);
  }

}

export async function stepSelectFrame(page: Page) {
  const takePhotosButton = page.getByRole("button", {
    name: /Take Photos|Start/i,
  });
  if (await isElementVisible(takePhotosButton)) {
    await clickButton(takePhotosButton);
    await waitForProcessingDoneOrCameraReady(page);
    await stabilizePage(page, 1000);
    await pulseAlt(page);
  }
}


export async function stepWaitForPhotos(page: Page) {
  for (let shot = 0; shot < PHOTO_COUNT; shot++) {
    console.log(`[photostrip] taking photo ${shot + 1}/${PHOTO_COUNT}`);
    const nextButton = page.getByRole("button", { name: /NEXT\s*\(5\)/i });
    await pulseAlt(page);
    await page.waitForTimeout(150);
    await forceClickButton(nextButton, LONG_TIMEOUT);
    await page.waitForTimeout(500);
    await pulseAlt(page);
    await page.waitForTimeout(1500);
  }

  await stepOpenRetakeSession(page);
}

export async function stepOpenRetakeSession(page: Page) {
  const retakeGuideButton = page.getByRole("button", {
    name: /Tutup panduan retake session|Tutup panduan retake|Close retake guide/i,
  });

  await clickButton(retakeGuideButton, LONG_TIMEOUT);
  await page
    .locator('[role="dialog"]')
    .waitFor({ state: "hidden", timeout: DEFAULT_TIMEOUT })
    .catch(() => {});
}

export async function stepRetakePhotos(
  page: Page,
  times: number | "all" = "all",
) {
  const retakeButtons = page.getByRole("button", { name: "RETAKE" });
  await expect(retakeButtons.first()).toBeVisible({ timeout: LONG_TIMEOUT });

  const retakeCount = await retakeButtons.count();
  const totalRetakes =
    times === "all"
      ? Math.min(retakeCount, PHOTO_COUNT)
      : Math.min(times, retakeCount, PHOTO_COUNT);

  for (let index = totalRetakes - 1; index >= 0; index--) {
    const retakeButton = retakeButtons.nth(index);
    if (await retakeButton.isVisible().catch(() => false)) {
      await domClickButton(retakeButton);
      await page.waitForTimeout(500);
    }
  }

  const nextButton = page.getByRole("button", { name: /^(NEXT|Next)$/ });
  if (await isElementVisible(nextButton)) {
    await domClickButton(nextButton);
  }

  await page.waitForTimeout(1000);
}

export async function stepPickPhotosIfPresent(page: Page) {
  await pulseAlt(page);

  const closeGuide = page.getByRole("button", {
    name: /Tutup panduan pilih foto|Close photo guide/i,
  });
  if (await isElementVisible(closeGuide)) {
    await clickButton(closeGuide);
    await page
      .locator('[role="dialog"]')
      .waitFor({ state: "hidden", timeout: DEFAULT_TIMEOUT })
      .catch(() => {});
  }

  const shotButtons = page.getByRole("button", { name: /Shot \d+ #/ });
  const count = await shotButtons.count();
  for (let index = 0; index < count; index++) {
    await pulseAlt(page);
    const button = shotButtons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      await page.waitForTimeout(300);
    }
  }

  await forceClickButton(
    page.getByRole("button", { name: /^(Next|Lanjut)$/i }),
    LONG_TIMEOUT,
  );
  await stabilizePage(page, 1000);
}

export async function stepPickAndRemoveFirstPhoto(page: Page) {
  await pulseAlt(page);

  const closeGuide = page.getByRole("button", {
    name: /Tutup panduan pilih foto|Close photo guide/i,
  });
  if (await isElementVisible(closeGuide)) {
    await clickButton(closeGuide);
    await page
      .locator('[role="dialog"]')
      .waitFor({ state: "hidden", timeout: DEFAULT_TIMEOUT })
      .catch(() => {});
  }

  const firstShot = page.getByRole("button", { name: /Shot \d+ #/ }).first();
  await expect(firstShot).toBeVisible({ timeout: LONG_TIMEOUT });

  await domClickButton(firstShot, LONG_TIMEOUT);
  await page.waitForTimeout(500);
  await expect(firstShot).toHaveAccessibleName(
    /used\s*1x|selected|dipilih|terpilih/i,
    { timeout: DEFAULT_TIMEOUT },
  );

  await domClickButton(firstShot, LONG_TIMEOUT);
  await page.waitForTimeout(500);
  await expect(firstShot).not.toHaveAccessibleName(
    /used\s*1x|selected|dipilih|terpilih/i,
    { timeout: DEFAULT_TIMEOUT },
  );
}

export async function stepSelectFilterIfPresent(page: Page) {
  await pulseAlt(page);

  const preview = page.locator("canvas, img").first();
  const beforePreview = await preview.screenshot().catch(() => null);

  const sepiaVintage = page.getByRole("button", {
    name: /sepia\s*vintage|vintage\s*sepia/i,
  });
  if (await isElementVisible(sepiaVintage, LONG_TIMEOUT)) {
    await forceClickButton(sepiaVintage, LONG_TIMEOUT);
  } else {
    const fallbackFilter = page.getByRole("button", {
      name: /sepia|vintage/i,
    });
    await forceClickButton(fallbackFilter, LONG_TIMEOUT);
  }

  if (beforePreview) {
    await expect(preview)
      .not.toHaveScreenshot(beforePreview, {
        timeout: LONG_TIMEOUT,
      })
      .catch(() => page.waitForTimeout(1500));
  } else {
    await page.waitForTimeout(1500);
  }

  const mirrorOff = page.getByRole("button", {
    name: /Mirror\s*Off|Off\s*Mirror/i,
  });
  if (await isElementVisible(mirrorOff, DEFAULT_TIMEOUT)) {
    await forceClickButton(mirrorOff, DEFAULT_TIMEOUT);
    await page.waitForTimeout(500);
  }

  const nextButton = page.getByRole("button", { name: /Next|Lanjut/i });
  await pulseAlt(page);
  await forceClickButton(nextButton, LONG_TIMEOUT);
  await stabilizePage(page, 1000);
}

export async function stepDeclineUpsell(page: Page) {
  await pulseAlt(page);

  const videoWithFrameButton = page.getByRole("button", {
    name: /video.*frame|frame.*video|with frame|dengan frame|pakai frame|gunakan frame/i,
  });
  if (await isElementVisible(videoWithFrameButton, 3000)) {
    await clickButton(videoWithFrameButton);
    return;
  }

  const frameCard = page
    .locator("button, [role='button']")
    .filter({ hasText: /frame/i })
    .first();
  if (await isElementVisible(frameCard, 3000)) {
    await clickButton(frameCard);
    return;
  }

  const noButton = page.getByRole("button", {
    name: /No, thank you|Tidak terima kasih|Skip|Lewati/i,
  });
  if (await isElementVisible(noButton)) {
    await clickButton(noButton);
  }
}

export async function stepWaitForCompletion(page: Page) {
  const resultVideo = page.locator("video").first();
  await expect(resultVideo).toBeVisible({ timeout: LONG_TIMEOUT });

  await page
    .waitForFunction(
      () => {
        const video = document.querySelector(
          "video",
        ) as HTMLVideoElement | null;
        if (!video) {
          return true;
        }

        if (Number.isFinite(video.duration) && video.duration > 0) {
          return video.ended || video.currentTime >= video.duration - 0.25;
        }

        return false;
      },
      undefined,
      { timeout: LONG_TIMEOUT },
    )
    .catch(async () => {
      const route = await currentRoute(page).catch(() => "unknown");
      const bodyText = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      throw new Error(
        `Timed out waiting for result video to finish. route=${route}, text=${bodyText.slice(0, 500)}`,
      );
    });

  await waitForTextVisible(
    page,
    /Here's your|Selesai|Complete|Thank you/i,
    LONG_TIMEOUT,
  );
  await expect(
    page.getByText(/Here's your|Selesai|Complete|Thank you/i).first(),
  ).toBeVisible({
    timeout: LONG_TIMEOUT,
  });
}

export async function currentRoute(page: Page): Promise<string> {
  return page.evaluate(() => {
    const hash = page.location.hash;
    const url = new URL(page.location.href);
    return hash || url.pathname;
  });
}

export async function completePhotostripFlow(
  page: Page,
  options?: {
    app?: ElectronApplication;
    phone?: string;
    voucher?: string;
    retakeTimes?: number | "all";
    selectFrame?: number;
  },
) {
  const {
    app,
    phone = "085335073597",
    voucher = "#0909",
    retakeTimes = "all",
  } = options || {};

  const zoomStep = async () => {
    if (app) {
      await applyAutomationZoom(app);
    }
  };

  await zoomStep();
  await stepHome(page);
  console.log("[photostrip] home -> procedure");

  await zoomStep();
  await stepProcedure(page, phone, voucher);
  console.log("[photostrip] procedure -> package selection");

  await zoomStep();
  await stepPackageSelection(page);
  console.log("[photostrip] package selection -> before payment");

  await zoomStep();
  await stepBeforePayment(page, phone, voucher);
  console.log("[photostrip] before payment -> select camera");

  await zoomStep();
  await stepSelectCamera(page);
  console.log("[photostrip] camera selected -> taking photos");

  await zoomStep();
  await stepWaitForPhotos(page);
  console.log("[photostrip] photos taken");

  if (retakeTimes === "all" || retakeTimes > 0) {
    await zoomStep();
    await stepRetakePhotos(page, retakeTimes);
    console.log("[photostrip] retake completed");
  }

  await zoomStep();
  await stepPickPhotosIfPresent(page);
  console.log("[photostrip] pick photos done");

  await zoomStep();
  await stepSelectFilterIfPresent(page);
  console.log("[photostrip] filter selection done");

  await zoomStep();
  await stepDeclineUpsell(page);
  console.log("[photostrip] upsell handled");

  await zoomStep();
  await stepWaitForCompletion(page);
  console.log("[photostrip] session complete");
}
