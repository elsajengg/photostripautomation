import { test } from '../../fixtures'
import {
  applyAutomationZoom,
  completePhotostripFlow,
  stabilizePage,
} from '../../utils/steps'

const PHONE = process.env.PHONE ?? '085335073597'
const VOUCHER = process.env.VOUCHER ?? '#0909'

test.describe('Photobooth E2E Tests', () => {
  test('complete photobooth session with retake', async ({ page, app }) => {
    test.setTimeout(0)
    await applyAutomationZoom(app)

    await stabilizePage(page)

    const title = await page.title()
    console.log(`✓ App opened: ${title}`)

    await completePhotostripFlow(page, {
      app,
      phone: PHONE,
      voucher: VOUCHER,
      retakeTimes: 'all'
    })

    console.log('✓ Photobooth E2E test completed')
  });
 })
//   await window.getByPlaceholder("Voucher code").fill("#0909"); //fill kode
//   await window.getByText("Payment DetailsMetode").click(); //klik random halaman payment details

//   await window.getByRole("button", { name: "Pakai" }).click(); //klik tombol pakai
//   await window.getByRole("button", { name: "Lanjut Foto" }).click(); //klik tombol lanjut foto
//   await window.getByText("Memproses sesi kamu...").waitFor({ state: "hidden" }); //tunggu lodingnya hilang baru lanjut

//   //pindah ke halaman select camera
//   await window.goto(
//     "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/select-camera",
//   );

//   await window.getByRole("button", { name: "Camera" }).click(); //klik tombol camera
//   await window.getByRole("img").first().click();
//   await window.getByRole("button", { name: "Take Photos" }).click(); //klik tombol take photos
//   await window.getByText("Memproses sesi kamu...").waitFor({ state: "hidden" }); //tunggu lodingnya hilang baru lanjut

//   //take photos
//   await window
//     .getByRole("button", { name: "NEXT (7)" })
//     .click({ timeout: 60000 });
//   await window
//     .getByRole("button", { name: "NEXT (7)" })
//     .click({ timeout: 60000 });
//   await window
//     .getByRole("button", { name: "NEXT (7)" })
//     .click({ timeout: 60000 });
//   await window
//     .getByRole("button", { name: "NEXT (7)" })
//     .click({ timeout: 60000 });
//   await window
//     .getByRole("button", { name: "NEXT (7)" })
//     .click({ timeout: 60000 });
//   //   await window
//   //     .getByRole("button", { name: "NEXT (7)" })
//   //     .click({ timeout: 60000 });
//   //   await window
//   //     .getByRole("button", { name: "NEXT (7)" })
//   //     .click({ timeout: 60000 });

//   // Tutup panduan retake session
//   await window
//     .getByRole("button", { name: "Tutup panduan retake session" })
//     .click();

//   // Klik RETAKE untuk beberapa shot
//   await window.getByRole("button", { name: "RETAKE" }).first().click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(1).click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(2).click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(3).click();

//   // Klik NEXT
//   await window.getByRole("button", { name: "NEXT", exact: true }).click();

//   // Tutup panduan pilih foto
//   await window
//     .getByRole("button", { name: "Tutup panduan pilih foto" })
//     .click();

//   await window.getByRole("button", { name: "Shot 1 #" }).click();
//   await window.getByRole("button", { name: "Shot 2 #" }).click();
//   await window.getByRole("button", { name: "Shot 3 #" }).click();
//   await window.getByRole("button", { name: "Shot 4 #" }).click();
//   await window.getByRole("button", { name: "Shot 5 #" }).click();
//   await window.getByRole("button", { name: "Shot 6 #" }).click();
//   //   await window.getByRole("button", { name: "Shot 7 #" }).click();
//   //   await window.getByRole("button", { name: "Shot 8 #" }).click();
//   await window.getByRole("button", { name: "Next" }).click();
//   await window
//     .getByRole("button", { name: "Black & White Black & White" })
//     .click();
//   await window.getByRole("button", { name: "Mirror Off" }).click();
//   await window.getByRole("button", { name: "Next" }).click();
//   await window.goto(
//     "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/upsell-with-filter",
//   );
//   await window.getByRole("button", { name: "No, thank you" }).click();
//   await expect(window.locator("video")).toBeVisible();
//   await expect(window.locator("div").nth(5)).toBeVisible({ timeout: 15000 });
//   // Tunggu beberapa detik untuk memastikan halaman result dimuat
//   await window.waitForTimeout(6000);

