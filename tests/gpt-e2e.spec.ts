import { test } from '../fixtures'
import {
  applyAutomationZoom,
  completePhotostripFlow,
  stabilizePage,
} from '../utils/steps'

const PHONE = process.env.PHONE ?? '085335073597'
const VOUCHER = process.env.VOUCHER ?? '#0909'

test.describe('GPT E2E Tests', () => {
  test('complete photostrip flow automation', async ({ page, app }) => {
    test.setTimeout(0)
    await applyAutomationZoom(app)

    // Stabilize before starting
    await stabilizePage(page)

    const title = await page.title()
    console.log(`✓ App opened: ${title}`)

    // Run complete photostrip flow
    await completePhotostripFlow(page, {
      app,
      phone: PHONE,
      voucher: VOUCHER,
      retakeTimes: 'all'
    })

    console.log('✓ GPT E2E test completed successfully')
  })

  test('complete flow with multiple retakes', async ({ page, app }) => {
    test.setTimeout(0)
    await applyAutomationZoom(app)

    await stabilizePage(page)

    const title = await page.title()
    console.log(`✓ App opened: ${title}`)

    // Run flow with retakes
    await completePhotostripFlow(page, {
      app,
      phone: PHONE,
      voucher: VOUCHER,
      retakeTimes: 'all'
    })

    console.log('✓ Flow with retakes completed')
  })
})

// // =======================
// // BEFORE ALL
// // =======================

// test.beforeAll(async () => {
//   electronApp = await electron.launch({
//     executablePath:
//       "C:\\Users\\offic\\AppData\\Local\\Programs\\photostrip-webcam\\Photostrip by Potokita - Webcam.exe",
//   });

//   window = await electronApp.firstWindow();

//   //   await stabilizePage(window, 3000);
// });

// // =======================
// // AFTER ALL
// // =======================

// test.afterAll(async () => {
//   if (electronApp) {
//     await electronApp.close();
//   }
// });

// // =======================
// // TEST CASE
// // =======================

// test("Test Retake Session and Select Photos", async () => {
//   test.setTimeout(0);

//   const title = await window.title();

//   console.log(`Berhasil membuka aplikasi dengan judul: ${title}`);

//   //   await stabilizePage(window, 3000);

//   // =======================
//   // START PAGE
//   // =======================

//   await clickAndWait(window, window.getByRole("link").nth(1), 2500);

//   // =======================
//   // TUTORIAL
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Next" }),
//     2500,
//   );

//   // =======================
//   // LOGIN / VOUCHER
//   // =======================

//   await window.getByPlaceholder("Enter your phone number").fill("085335073597");

//   await slowAction(window, 1500);

//   await window.getByPlaceholder("Voucher code").fill("#0909");

//   await slowAction(window, 1500);

//   await clickAndWait(window, window.getByText("Payment DetailsMetode"), 2000);

//   // =======================
//   // PAYMENT
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Pakai" }),
//     2500,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Lanjut Foto" }),
//     4000,
//   );

//   // tunggu processing selesai
//   await window.getByText("Memproses sesi kamu...").waitFor({
//     state: "hidden",
//     timeout: 120000,
//   });

//   await stabilizePage(window, 4000);

//   // =======================
//   // SELECT CAMERA PAGE
//   // =======================

//   await window.goto(
//     "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/select-camera",
//   );

//   await stabilizePage(window, 5000);

//   // =======================
//   // CAMERA
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Camera" }),
//     3000,
//   );

//   await clickAndWait(window, window.getByRole("img").first(), 3000);

//   // =======================
//   // TAKE PHOTOS
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Take Photos" }),
//     1000,
//   );

//   await window.getByText("Memproses sesi kamu...").waitFor({
//     state: "hidden",
//     timeout: 120000,
//   });

//   await stabilizePage(window, 5000);

//   // =======================
//   // WAIT VIDEO READY
//   // =======================

//   await expect(window.locator("video")).toBeVisible({
//     timeout: 60000,
//   });

//   await window.waitForFunction(() => {
//     const video = document.querySelector("video") as HTMLVideoElement;

//     return video && video.readyState >= 3;
//   });

//   await slowAction(window, 5000);

//   // =======================
//   // TAKE SHOTS
//   // =======================

//   for (let i = 0; i < 4; i++) {
//     console.log(`Taking Shot ${i + 1}`);

//     const nextButton = window.getByRole("button", {
//       name: "NEXT (7)",
//     });

//     await expect(nextButton).toBeVisible({
//       timeout: 60000,
//     });

//     await nextButton.click({
//       timeout: 60000,
//     });

//     // Delay besar agar render video stabil
//     // Pastikan video tetap ready
//     await expect(window.locator("video")).toBeVisible({
//       timeout: 3000,
//     });

//     await window.waitForFunction(() => {
//       const video = document.querySelector("video") as HTMLVideoElement;

//       return video && video.readyState >= 3;
//     });
//   }

//   // =======================
//   // CLOSE RETAKE GUIDE
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "Tutup panduan retake session",
//     }),
//     2000,
//   );

//   // =======================
//   // RETAKE
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "RETAKE" }).first(),
//     0,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "RETAKE" }).nth(1),
//     0,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "RETAKE" }).nth(2),
//     0,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "RETAKE" }).nth(3),
//     0,
//   );

//   // =======================
//   // NEXT
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "NEXT",
//       exact: true,
//     }),
//     5000,
//   );

//   // =======================
//   // CLOSE SELECT GUIDE
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "Tutup panduan pilih foto",
//     }),
//     1000,
//   );

//   // =======================
//   // SELECT PHOTOS
//   // =======================

//   for (let i = 1; i <= 6; i++) {
//     await clickAndWait(
//       window,
//       window.getByRole("button", {
//         name: "Shot ${i} #",
//       }),
//       1000,
//     );
//   }

//   // =======================
//   // CANVAS
//   // =======================

//   await window.locator("canvas").click({
//     position: {
//       x: 430,
//       y: 589,
//     },
//   });

//   await slowAction(window, 3000);

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "Shot 3 #3 • used 1x",
//     }),
//     3000,
//   );

//   // =======================
//   // FILTER
//   // =======================

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Next" }),
//     4000,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "Black & White Black & White",
//     }),
//     4000,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", {
//       name: "Mirror Off",
//     }),
//     3000,
//   );

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "Next" }),
//     5000,
//   );

//   // =======================
//   // UPSELL PAGE
//   // =======================

//   await window.goto(
//     "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/upsell-with-filter",
//   );

//   await stabilizePage(window, 5000);

//   await clickAndWait(
//     window,
//     window.getByRole("button", { name: "No, thank you" }),
//     5000,
//   );

//   // =======================
//   // FINAL VALIDATION
//   // =======================

//   await expect(window.locator("video")).toBeVisible({
//     timeout: 60000,
//   });

//   await slowAction(window, 15000);

//   await expect(window.locator("div").nth(5)).toBeVisible({
//     timeout: 60000,
//   });

//   await slowAction(window, 10000);

//   await window.pause();
// });
