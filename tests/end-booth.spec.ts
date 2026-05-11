import {
  _electron as electron,
  ElectronApplication,
  Page,
  test,
  expect,
} from "@playwright/test";
import { applyAutomationZoom } from "../utils/steps";

let electronApp: ElectronApplication;
let window: Page;

async function clickButton(
  locator: ReturnType<Page["getByRole"]>,
  timeout = 60000,
) {
  await expect(locator).toBeVisible({ timeout });
  await locator.click();
}

async function clickFirstVisibleButton(
  page: Page,
  name: string,
  timeout = 60000,
) {
  const button = page.getByRole("button", { name });
  await expect(button).toBeVisible({ timeout });
  await button.first().click();
}

async function waitForProcessingHidden(page: Page) {
  await page.getByText(/Memproses sesi kamu\.{3}/i).waitFor({
    state: "hidden",
    timeout: 120000,
  });
}

async function clickAllShotButtons(page: Page) {
  const shots = page.getByRole("button", { name: /Shot \d+ #/ });
  const count = await shots.count();
  for (let i = 1; i <= count; i++) {
    if (i < count) {
      await shots.nth(i).click();
    } else {
      await shots.first().click();
    }
  }
}

async function clickRetakeTimes(page: Page, times: number) {
  const retakeButtons = page.getByRole("button", { name: "RETAKE" });
  const count = Math.min(await retakeButtons.count(), times);
  for (let i = count - 1; i >= 0; i--) {
    const button = retakeButtons.nth(i);
    if (await button.isVisible()) {
      await button.click();
      await page.waitForTimeout(500);
    }
  }
}

// test.beforeAll berjalan SATU KALI sebelum semua pengujian dimulai
test.beforeAll(async () => {
  electronApp = await electron.launch({
    executablePath:
      "C:\\Users\\offic\\AppData\\Local\\Programs\\photostrip-webcam\\Photostrip by Potokita - Webcam.exe",
  });
  await applyAutomationZoom(electronApp);
  window = await electronApp.firstWindow();
  await applyAutomationZoom(electronApp);
});

// test.afterAll berjalan SATU KALI setelah semua pengujian selesai (atau jika terjadi error)
test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

test("End-to-end photostrip flow with voucher, retake, zoom, filter, and final wait", async () => {
  test.setTimeout(0);

  const title = await window.title();
  console.log(`Berhasil membuka aplikasi dengan judul: ${title}`);
  await applyAutomationZoom(electronApp);

  // Klik bebas pada gambar / halaman awal
  await clickButton(window.getByRole("link").nth(1));

  // Masuk ke halaman tutorial / data
  await clickButton(window.getByRole("button", { name: "Next" }));
  await window.getByPlaceholder("Enter your phone number").fill("085335073597");
  await window.getByPlaceholder("Voucher code").fill("#0909");
  await clickButton(window.getByText("Payment DetailsMetode"));

  // Apply voucher dan lanjut foto
  await clickButton(window.getByRole("button", { name: "Pakai" }));
  await clickButton(window.getByRole("button", { name: "Lanjut Foto" }));
  await waitForProcessingHidden(window);

  // Masuk ke halaman camera
  await window.goto(
    "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/select-camera",
  );

  await clickButton(window.getByRole("button", { name: "Camera" }));
  await clickButton(window.getByRole("button", { name: "Take Photos" }));

  // Tunggu button NEXT(5) dan ambil foto
  await window.waitForTimeout(1000);
  for (let shot = 0; shot < 5; shot++) {
    const nextButton = window.getByRole("button", { name: "NEXT (5)" });
    await expect(nextButton).toBeVisible({ timeout: 90000 });
    await nextButton.click({ timeout: 2000 });
    await window.waitForTimeout(1000);
  }

  await window
    .getByRole("button", { name: "Tutup panduan retake session" })
    .click();

  // Lakukan retake 5 kali
  await clickRetakeTimes(window, 5);

  // Klik NEXT setelah retake
  await clickButton(window.getByRole("button", { name: "NEXT", exact: true }));

  // Tutup panduan pilih foto jika muncul
  const closePhotoGuide = window.getByRole("button", {
    name: "Tutup panduan pilih foto",
  });
  if (await closePhotoGuide.count()) {
    await closePhotoGuide.first().click();
  }

  // Klik semua foto yang tersedia
  await clickAllShotButtons(window);

  await clickButton(window.getByRole("button", { name: "Next" }));

  //   // Pilih satu foto di sebelah kiri dan zoom +4
  //   const leftPhoto = window.getByRole("button", { name: /Shot \d+ #/ }).first();
  //   await leftPhoto.click();

  //   const plusButton = window.getByRole("button", { name: "+" }).first();
  //   for (let i = 0; i < 4; i++) {
  //     await plusButton.click();
  //     await window.waitForTimeout(300);
  //   }

  // Pilih filter sepia vintage
  await clickButton(window.getByRole("button", { name: /sepia vintage/i }));
  await clickButton(window.getByRole("button", { name: "Next" }));

  // Pilih no additional frame jika muncul
  const noFrameButton = window.getByRole("button", {
    name: /No, thank you/i,
  });

  await expect(noFrameButton).toBeVisible({ timeout: 2000 });
  await noFrameButton.click();

  // Tunggu sampai teks akhir muncul
  await window.getByText(/Here's your/i).waitFor({
    state: "visible",
    timeout: 120000,
  });

  // Pastikan halaman selesai dan hasil muncul
  await expect(window.getByText(/Here's your/i)).toBeVisible({ timeout: 120000 });
});

