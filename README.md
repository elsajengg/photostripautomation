# Photostrip Test Automation

This is a comprehensive test automation suite for the Photostrip Webcam application using Playwright with Electron support.

## Project Structure

```
├── fixtures.ts                 # Custom Playwright fixtures (app setup)
├── playwright.config.ts        # Playwright configuration
├── utils/
│   └── steps.ts               # Reusable test step functions
├── tests/
│   ├── nw-test.spec.ts        # Main end-to-end tests
│   ├── end-booth.spec.ts      # End booth scenario tests
│   ├── gpt-e2e.spec.ts        # GPT E2E tests
│   ├── settings.spec.ts       # Settings tests
│   ├── codegen.spec.ts        # Code generation tests
│   └── test_*/                # Additional test categories
└── package.json               # Dependencies and test scripts
```

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Photostrip application installed

### Installation

```bash
npm install
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run all tests in headed mode (see browser)
npm run test:all-headed

# Run specific test file
npm run test:nw          # NW tests
npm run test:end-booth   # End booth tests
npm run test:gpt         # GPT tests

# Run tests in debug mode
npm run test:debug

# Run tests against specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### With Environment Variables

```bash
# Custom phone number
PHONE=085123456789 npm run test:nw

# Custom voucher
VOUCHER=#1234 npm run test:nw

# Multiple retakes
RETAKE_TIMES=3 npm run test:nw

# Combine multiple
PHONE=085123456789 VOUCHER=#1234 RETAKE_TIMES=2 npm run test:nw
```

## Test Structure

### Fixtures (fixtures.ts)

The test fixtures handle:
- Launching the Electron app
- Managing app lifecycle (launch/close)
- Providing the page/window object to tests

### Step Functions (utils/steps.ts)

Common reusable test steps include:

- **Basic Interactions**
  - `clickButton()` - Click with visibility check
  - `clickFirstVisibleButton()` - Click first matching button
  - `waitForTextVisible()` - Wait for text to appear
  - `waitForTextHidden()` - Wait for text to disappear
  - `stabilizePage()` - Prepare page for interactions

- **Photostrip Flow Steps**
  - `stepHome()` - Home page entry
  - `stepProcedure()` - Phone & voucher entry
  - `stepPackageSelection()` - Package selection
  - `stepBeforePayment()` - Apply voucher and proceed
  - `stepSelectCamera()` - Camera selection
  - `stepWaitForPhotos()` - Take photos (5 shots)
  - `stepPickPhotosIfPresent()` - Photo selection
  - `stepSelectFilterIfPresent()` - Filter selection
  - `stepDeclineUpsell()` - Decline additional offers
  - `stepWaitForCompletion()` - Wait for completion

- **Complete Flow**
  - `completePhotostripFlow()` - Run entire flow with options

### Example Test

```typescript
import { test } from '../fixtures'
import { completePhotostripFlow } from '../utils/steps'

test('complete photostrip flow', async ({ page }) => {
  test.setTimeout(0)  // No timeout

  await completePhotostripFlow(page, {
    phone: '085335073597',
    voucher: '#0909',
    retakeTimes: 0
  })

  console.log('✓ Test completed')
})
```

## Configuration

### Playwright Config (playwright.config.ts)

- **Test Directory**: `./tests`
- **Reporters**: HTML report
- **Retries**: 2 on CI, 0 locally
- **Timeout**: No timeout by default
- **Trace**: Collected on first retry
- **Browsers**: Chromium, Firefox, WebKit

### Environment Variables

See `.env.example` for available options:
- `APP_PATH` - Path to Electron app
- `PHONE` - Phone number for tests
- `VOUCHER` - Voucher code
- `RETAKE_TIMES` - Number of retakes

## Viewing Reports

After tests run, view the HTML report:

```bash
npm run report
```

This opens an interactive report in your browser showing:
- Test results
- Screenshots
- Video recordings (if enabled)
- Traces for failed tests

## Best Practices

1. **Use steps functions** - Don't write inline interactions, use step functions
2. **Set timeout to 0** - For E2E tests, disable timeout: `test.setTimeout(0)`
3. **Add console logs** - Help track progress through test steps
4. **Use environment variables** - Keep tests configurable
5. **Stabilize before actions** - Use `stabilizePage()` when needed
6. **Check visibility** - Always verify elements are visible before interacting

## Troubleshooting

### Tests timeout
- Check if the app is running
- Verify the app path in `fixtures.ts`
- Increase timeout values in step functions

### Elements not found
- Use `--headed` mode to see what's happening
- Check selectors match actual UI
- Use `--debug` mode to step through tests

### App crashes
- Check application logs
- Ensure voucher is valid (should result in free session)
- Try running without parallel tests: `workers: 1`

## Contributing

When adding new tests:
1. Create new step functions in `utils/steps.ts`
2. Reuse existing helpers
3. Add console logs for debugging
4. Update this README with new steps
5. Test with different browsers

## CI/CD Integration

To run in CI pipeline:
```bash
CI=true npm test
```

This will:
- Enable `forbidOnly` (fail if test.only found)
- Retry failed tests twice
- Use single worker (no parallel)
- Generate HTML report

## License

ISC
