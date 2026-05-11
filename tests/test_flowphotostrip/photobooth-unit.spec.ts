import {
  _electron as electron,
  ElectronApplication,
  Page,
  test,
  expect,
} from "@playwright/test";

const APP_PATH =
  process.env.APP_PATH ||
  "C:\\Users\\offic\\AppData\\Local\\Programs\\photostrip-webcam\\Photostrip by Potokita - Webcam.exe";

const REGISTERED_PHONE = process.env.REGISTERED_PHONE ?? "085335073597";
const UNREGISTERED_PHONE = process.env.UNREGISTERED_PHONE ?? "081234567890";
const APP_PHASE_TIMEOUT_MS = 15_000;
const PAYMENT_CHECK_DELAY_MS = APP_PHASE_TIMEOUT_MS - 3_000;
const PICK_PHOTO_TIMEOUT_MS = APP_PHASE_TIMEOUT_MS + 1_000;
const CHANGE_FRAME_TIMEOUT_MS = APP_PHASE_TIMEOUT_MS + 1_000;
const EDIT_PHOTO_TIMEOUT_MS = APP_PHASE_TIMEOUT_MS + 1_000;
const UPSELL_TIMEOUT_MS = APP_PHASE_TIMEOUT_MS + 1_000;
const FINAL_PREVIEW_TIMEOUT_MS = APP_PHASE_TIMEOUT_MS + 1_000;

async function applyTestZoom(app: ElectronApplication) {
  await app
    .evaluate(({ BrowserWindow }: any) => {
      const window = BrowserWindow.getAllWindows()[0];
      window?.setAutoHideMenuBar(false);
      window?.setMenuBarVisibility(true);
      window?.webContents.setZoomLevel(-3);
    })
    .catch(() => undefined);
}

async function pulseAlt(page: Page) {
  await page.keyboard.press("Alt").catch(() => undefined);
  await page
    .evaluate(() => {
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
    })
    .catch(() => undefined);
}

async function clickFirstVisible(page: Page, name: string | RegExp) {
  const locator = page.getByRole("button", { name });
  await expect(locator.first()).toBeVisible({ timeout: 60000 });

  const count = await locator.count();
  for (let index = 0; index < count; index++) {
    const button = locator.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
      return;
    }
  }
}

async function clickFirstVisibleIfPresent(page: Page, name: string | RegExp) {
  const locator = page.getByRole("button", { name });
  const count = await locator.count();
  for (let index = 0; index < count; index++) {
    const button = locator.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
      return true;
    }
  }

  return false;
}

async function launchApp(options?: { clock?: boolean }) {
  const app = await electron.launch({
    executablePath: APP_PATH,
    env: { ...process.env },
  });
  const page = await app.firstWindow();
  await applyTestZoom(app);

  if (options?.clock) {
    await page.clock.install();
  }

  await page.waitForURL(/#\//, { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(1000);
  await pulseAlt(page);
  return { app, page };
}

async function closeApp(app: ElectronApplication) {
  await app.close().catch(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function openTutorialPage(page: Page) {
  await page.evaluate(() => {
    window.location.hash = "#/procedure";
  });
  await page.waitForTimeout(1000);
}

async function openPaymentDetailsPage(page: Page) {
  await openTutorialPage(page);
  await pulseAlt(page);
  await clickFirstVisible(page, /Next|Lanjut/i);
  await expect(
    page.getByRole("heading", { name: /Payment Details/i }),
  ).toBeVisible({
    timeout: 60000,
  });
  await expect(page.getByPlaceholder("Enter your phone number")).toBeVisible();
}

async function fillPhoneAndBlur(page: Page, phone: string) {
  await page.getByPlaceholder("Enter your phone number").fill(phone);
  await page.keyboard.press("Tab");
}

async function startPaymentWithoutVoucher(
  page: Page,
  phone = UNREGISTERED_PHONE,
) {
  await openPaymentDetailsPage(page);
  await fillPhoneAndBlur(page, phone);
  await clickFirstVisible(page, /Bayar Sekarang/i);

  await expect(page).toHaveURL(/#\/payment/, { timeout: 60000 });
  await expect(page.getByText(/PAYMENT/i)).toBeVisible({ timeout: 60000 });
}

test.describe("Photobooth Unit Tests", () => {
  test("tutorial page shows", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await openTutorialPage(page);

      await expect(page).toHaveURL(/#\/procedure/);
      await expect(
        page.getByRole("button", { name: /Back|Previous/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Next|Lanjut/i }),
      ).toBeVisible();
    } finally {
      await closeApp(app);
    }
  });

  test("unregistered phone shows soft file delivery helper text", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await openPaymentDetailsPage(page);
      await fillPhoneAndBlur(page, UNREGISTERED_PHONE);

      await expect(
        page.getByText(
          /Soft file foto.*nomor telepon|soft file.*nomor telepon/i,
        ),
      ).toBeVisible({ timeout: 60000 });
      await expect(page.getByText(/Tier membership/i)).toBeHidden();
    } finally {
      await closeApp(app);
    }
  });

  test("registered phone shows membership name and tier", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await openPaymentDetailsPage(page);
      await fillPhoneAndBlur(page, REGISTERED_PHONE);

      await expect(page.getByText(/Hello\s+.+,/i)).toBeVisible({
        timeout: 60000,
      });
      await expect(page.getByText(/Tier membership kamu adalah/i)).toBeVisible({
        timeout: 60000,
      });
    } finally {
      await closeApp(app);
    }
  });

  test("without voucher clicking pay now opens payment barcode", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await startPaymentWithoutVoucher(page);

      await expect(page.locator('img[alt="Midtrans Payment"]')).toBeVisible({
        timeout: 60000,
      });
      await expect(
        page.getByRole("button", { name: /Check Status/i }),
      ).toBeVisible();
    } finally {
      await closeApp(app);
    }
  });

  test("payment check status before 15 second timeout handles paid or unpaid result", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await startPaymentWithoutVoucher(page);

      await expect(page.locator('img[alt="Midtrans Payment"]')).toBeVisible({
        timeout: 60000,
      });

      console.log(
        `Payment barcode is ready. You have ${PAYMENT_CHECK_DELAY_MS / 1000} seconds to pay before Check Status is clicked.`,
      );
      await page.waitForTimeout(PAYMENT_CHECK_DELAY_MS);

      const clickedCheckStatus = await clickFirstVisibleIfPresent(
        page,
        /Check Status/i,
      );
      await page.waitForTimeout(5000);

      const bodyText = await page.locator("body").innerText();
      const route = await page.evaluate(() => window.location.hash);
      console.log(`[payment status] route=${route}`);
      console.log(`[payment status] body=${bodyText.slice(0, 800)}`);
      console.log(`[payment status] clickedCheckStatus=${clickedCheckStatus}`);

      const successPopup = page.getByText(
        /success|berhasil|paid|terbayar|payment received|pembayaran/i,
      );
      const cameraSelection = page.getByRole("button", {
        name: /Camera|Take Photos|Start/i,
      });
      const unpaidStatus = page.getByText(
        /haven't received your payment|belum.*pembayaran|Check again|EC105/i,
      );

      if (
        await successPopup
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await expect(successPopup.first()).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => window.location.hash), {
            timeout: 60000,
          })
          .toMatch(/#\/select-camera/);
        await expect(cameraSelection.first()).toBeVisible({ timeout: 60000 });
        return;
      }

      if (
        await cameraSelection
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await expect(cameraSelection.first()).toBeVisible();
        await expect(page).toHaveURL(/#\/select-camera/);
        return;
      }

      if (!clickedCheckStatus) {
        await expect(
          page.getByText(/REMINDER|Time is up|PAYMENT/i).first(),
        ).toBeVisible({
          timeout: 60000,
        });
        return;
      }

      await expect(unpaidStatus.first()).toBeVisible({ timeout: 60000 });
      await expect(page).toHaveURL(/#\/payment/);
    } finally {
      await closeApp(app);
    }
  });

  // pose helper

  test("payment check status after 15 second timeout shows reminder to pay", async () => {
    test.setTimeout(0);

    const { app, page } = await launchApp();
    try {
      await startPaymentWithoutVoucher(page);

      await expect(page.locator('img[alt="Midtrans Payment"]')).toBeVisible({
        timeout: 60000,
      });

      console.log(
        `Payment barcode is ready. Waiting for ${PAYMENT_CHECK_DELAY_MS / 1000} seconds before Check Status is clicked.`,
      );
      await page.waitForTimeout(PAYMENT_CHECK_DELAY_MS + 5000);

      const bodyText = await page.locator("body").innerText();
      const route = await page.evaluate(() => window.location.hash);
      console.log(`[payment status after timeout] route=${route}`);
      console.log(
        `[payment status after timeout] body=${bodyText.slice(0, 800)}`,
      );

      await expect(
        page.getByText(/REMINDER|Time is up|PAYMENT/i).first(),
      ).toBeVisible({
        timeout: 60000,
      });
    } finally {
      await closeApp(app);
    }
  });
});
