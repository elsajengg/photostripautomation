import { test as base, expect } from '@playwright/test'
import { _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { applyAutomationZoom } from './utils/steps'

// Test-scoped fixtures
type TestFixtures = {
  page: Page
}

// Worker-scoped fixtures
type WorkerFixtures = {
  app: ElectronApplication
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  /**
   * Worker-scoped: the Electron app launches once and stays alive for all tests
   */
  app: [
    async ({}, use) => {
      const appPath =
        process.env.APP_PATH ||
        'C:\\Users\\offic\\AppData\\Local\\Programs\\photostrip-webcam\\Photostrip by Potokita - Webcam.exe'

      const electronApp = await electron.launch({
        executablePath: appPath,
        env: { ...process.env }
      })
      await applyAutomationZoom(electronApp)

      await use(electronApp)
      await electronApp.close()
    },
    { scope: 'worker' }
  ],

  /**
   * Test-scoped: get the first window for each test
   */
  page: async ({ app }, use) => {
    const window = await app.firstWindow()
    await applyAutomationZoom(app)
    await use(window)
  }
})

export { expect }
