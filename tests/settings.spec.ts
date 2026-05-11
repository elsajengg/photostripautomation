import {
  _electron as electron,
  ElectronApplication,
  Page,
  test,
  expect,
} from '@playwright/test'

type ModeSelection = 'single' | 'multi'

const APP_PATH =
  process.env.APP_PATH ||
  'C:\\Users\\offic\\AppData\\Local\\Programs\\photostrip-webcam\\Photostrip by Potokita - Webcam.exe'

async function launchApp() {
  const app = await electron.launch({
    executablePath: APP_PATH,
    env: { ...process.env },
  })
  const page = await app.firstWindow()
  await page.waitForURL(/#\/(home|settings|select-mode)/, {
    timeout: 120000,
  })
  return { app, page }
}

async function closeApp(app: ElectronApplication) {
  await app.close().catch(() => undefined)
}

async function openSettings(page: Page) {
  if (!page.url().includes('#/settings')) {
    await page.locator('a[href$="#/settings"]').first().click()
  }

  const modeSelect = page.locator('select[name="modeSelection"]')
  if (await modeSelect.isVisible().catch(() => false)) {
    return
  }

  const pinInput = page.locator('input[type="password"]').first()
  await expect(pinInput).toBeVisible({ timeout: 60000 })
  await pinInput.fill('0000')
  await page.getByRole('button', { name: /Submit/i }).click()

  await expect(modeSelect).toBeVisible({ timeout: 60000 })
}

async function saveModeSelection(page: Page, mode: ModeSelection) {
  await openSettings(page)
  await page.locator('select[name="modeSelection"]').selectOption(mode)
  await page.getByRole('button', { name: 'Save Settings' }).click()

  const successMsg = page.getByText('Settings saved.')
  if ((await successMsg.count()) > 0) {
    await successMsg.waitFor({ state: 'hidden', timeout: 60000 })
  }
}

async function goToHome(page: Page) {
  await page.evaluate(() => {
    window.location.hash = '#/'
  })
  await page.waitForTimeout(1500)
}

async function clickMainHomeEntry(page: Page) {
  const mainEntry = page.locator('a:not([href$="#/settings"])').first()
  if ((await mainEntry.count()) > 0 && (await mainEntry.isVisible())) {
    await mainEntry.click()
    return
  }

  await page.mouse.click(640, 360)
}

async function restartAfterSaving(mode: ModeSelection) {
  const firstRun = await launchApp()
  await saveModeSelection(firstRun.page, mode)
  await closeApp(firstRun.app)

  const secondRun = await launchApp()
  await goToHome(secondRun.page)
  return secondRun
}

test.describe('Settings Tests', () => {
  test('dual mode settings test', async () => {
    test.setTimeout(0)

    const { app, page } = await launchApp()
    try {
      await saveModeSelection(page, 'multi')
      console.log('Settings dual mode test completed')
    } finally {
      await closeApp(app)
    }
  })

  test('single mode opens only the photostrip entry point', async () => {
    test.setTimeout(0)

    const { app, page } = await restartAfterSaving('single')
    try {
      await expect(page.locator('a[href$="#/procedure"]').first()).toBeVisible({
        timeout: 60000,
      })
      await expect(page.getByText(/photobooth/i)).toHaveCount(0)
      await expect(page.getByText(/flipbook/i)).toHaveCount(0)
    } finally {
      await closeApp(app)
    }
  })

  test('multi mode opens photobooth and flipbook selection after clicking the home page', async () => {
    test.setTimeout(0)

    const { app, page } = await restartAfterSaving('multi')
    try {
      await clickMainHomeEntry(page)

      await expect(page.getByText(/photobooth/i).first()).toBeVisible({
        timeout: 60000,
      })
      await expect(page.getByText(/flipbook/i).first()).toBeVisible({
        timeout: 60000,
      })
    } finally {
      await closeApp(app)
    }
  })
})
