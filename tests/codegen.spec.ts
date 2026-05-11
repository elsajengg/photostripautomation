import { test } from '../fixtures'
import { stabilizePage } from '../utils/steps'

// This test file is a template for code-generated tests
// Uncomment and modify as needed

test.describe('Codegen Tests', () => {
  test('template test', async ({ page }) => {
    test.setTimeout(0)

    await stabilizePage(page)

    const title = await page.title()
    console.log(`✓ App opened: ${title}`)

    // Add your test steps here
    console.log('✓ Codegen test completed')
  })
})

/*
Example: Recording a test scenario

To generate a test, you can use:

  npx playwright codegen file:///path/to/app

Then copy the generated code into a test file and adjust as needed.

Pattern for generated tests:
1. Use fixtures from '../fixtures'
2. Use step functions from '../utils/steps'
3. Add console.log for debugging
4. Set test.setTimeout(0) for no timeout
*/
//   // Validasi sederhana: Cetak judul aplikasi ke terminal
//   test.setTimeout(0);
//   const title = await window.title();
//   console.log(`Berhasil membuka aplikasi dengan judul: ${title}`);

//   // --- HASIL REKAMAN YANG SUDAH DISESUAIKAN ---
//   // await window.locator("img").click(); //harusnya yg bener pake ini tapii gabisa
//   await window.getByRole("link").nth(1).click(); //kalo ini  berdaasarkan link yang ke 2 diklik
//   await window.getByRole("button", { name: "Next" }).click();
//   await window.getByPlaceholder("Enter your phone number").fill("085335073597");
//   await window.getByText("Payment DetailsMetode").click();
//   //   await window.getByRole("button", { name: "Pakai" }).click();

//   await window.getByPlaceholder("Voucher code").fill("#0909");
//   // JEDA DIMATIKAN: Agar skrip jalan otomatis dari awal sampai akhir tanpa berhenti

//   // JEDA DIMATIKAN: Agar skrip jalan otomatis dari awal sampai akhir tanpa berhenti
//   await window.getByText("Payment DetailsMetode").click();
//   await window.getByRole("button", { name: "Pakai" }).click();
//   await window.getByRole("button", { name: "Lanjut Foto" }).click();
//   await window.getByText("Memproses sesi kamu...").waitFor({ state: "hidden" }); //tunggu lodingnya hilang baru lanjut

//   await window.goto(
//     "file:///C:/Users/offic/AppData/Local/Programs/photostrip-webcam/resources/app.asar/out/renderer/index.html#/select-camera",
//   );
//   await window.getByRole("button", { name: "Camera" }).click();
//   await window.getByRole("button", { name: "Camera" }).click();
//   await window.getByRole("button", { name: "Take Photos" }).click();

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

//   await window
//     .getByRole("button", { name: "Tutup panduan retake session" })
//     .click();
//   await window.getByRole("button", { name: "RETAKE" }).first().click();
//   await window.getByRole("button", { name: "RETAKE" }).first().click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(1).click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(1).click();
//   await window.getByRole("button", { name: "RETAKE" }).nth(1).click();
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
//   await window.pause();
//   await expect(window.locator("video")).toBeVisible();

//   await expect(window.locator("div").nth(5)).toBeVisible({ timeout: 15000 });
//   // Tunggu beberapa detik untuk memastikan halaman result dimuat
//   await window.waitForTimeout(6000);
// });
