import { test, expect } from '../fixtures'
import {
  applyAutomationZoom,
  completePhotostripFlow,
  waitForTextVisible,
} from '../utils/steps'

const PHONE = process.env.PHONE ?? '085335073597'
const VOUCHER = process.env.VOUCHER ?? '#0909'
const RETAKE_TIMES = process.env.RETAKE_TIMES ? parseInt(process.env.RETAKE_TIMES, 10) : 'all'

test.describe('Photostrip E2E Tests', () => {
  test('complete photostrip flow with retake, photo selection, filter, and completion', async ({ page, app }) => {
    test.setTimeout(0)
    await applyAutomationZoom(app)

    const title = await page.title()
    console.log(`✓ App opened: ${title}`)

    // Execute complete flow
    await completePhotostripFlow(page, {
      app,
      phone: PHONE,
      voucher: VOUCHER,
      retakeTimes: RETAKE_TIMES
    })

    // Final verification
    await waitForTextVisible(page, /Here's your|Selesai|Complete/, 120000)
    console.log('✓ Test completed successfully')
  })

  test('photostrip flow without retake', async ({ page, app }) => {
    test.setTimeout(0)
    await applyAutomationZoom(app)

    await completePhotostripFlow(page, {
      app,
      phone: PHONE,
      voucher: VOUCHER,
      retakeTimes: 0
    })

    await waitForTextVisible(page, /Here's your|Selesai|Complete/, 120000)
    console.log('✓ Flow without retake completed')
  })
})
