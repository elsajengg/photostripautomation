import { test } from '../../fixtures'
import {
  applyAutomationZoom,
  completePhotostripFlow,
  stabilizePage,
} from '../../utils/steps'

const PHONE = process.env.PHONE ?? '085335073597'
const VOUCHER = process.env.VOUCHER ?? '#0909'

test.describe('NW2 Tests', () => {
  test('complete flow - alternative path', async ({ page, app }) => {
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

    console.log('✓ NW2 test completed')
  })
});
