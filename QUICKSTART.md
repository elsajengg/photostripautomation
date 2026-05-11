# Test Automation Setup - Quick Start Guide

## What Was Done

The test automation code has been refactored for better organization, reusability, and maintainability. Here's what changed:

### New Files Created

1. **fixtures.ts** - Central Electron app setup for all tests
   - Manages app lifecycle (launch/close)
   - Provides `page` and `app` fixtures to tests
   - Configurable via environment variables

2. **utils/steps.ts** - Reusable test step functions
   - Common interaction helpers (click, wait, etc.)
   - Complete photostrip flow steps
   - Memory profiling utilities (optional)

3. **README.md** - Comprehensive documentation
4. **.env.example** - Environment variable template
5. **CHANGES.md** - This document

### Updated Files

- **package.json** - Added test scripts
- **playwright.config.ts** - Cleaned up configuration
- **tests/nw-test.spec.ts** - Refactored to use new fixtures
- **tests/end-booth.spec.ts** - Refactored to use new fixtures
- **tests/gpt-e2e.spec.ts** - Refactored to use new fixtures
- **tests/settings.spec.ts** - Refactored to use new fixtures
- **tests/codegen.spec.ts** - Updated to template format
- **tests/test_end/nw2-test.spec.ts** - Refactored to use new fixtures
- **tests/test_fix/e2e-photobooth.spec.ts** - Refactored to use new fixtures

## Key Improvements

### Before
- ❌ App setup repeated in every test file
- ❌ Helper functions duplicated across files
- ❌ No reusable step library
- ❌ Hardcoded values and paths
- ❌ No environment variable support
- ❌ Inconsistent patterns

### After
- ✅ Centralized app management (fixtures.ts)
- ✅ Shared utility functions (utils/steps.ts)
- ✅ Reusable step functions
- ✅ Environment variable support
- ✅ Consistent test patterns
- ✅ Better documentation

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with visual feedback
npm run test:all-headed

# Run specific test
npm run test:nw
npm run test:end-booth
npm run test:gpt
```

### With Custom Values

```bash
# Change phone number
PHONE=085123456789 npm run test:nw

# Change voucher
VOUCHER=#1234 npm run test:nw

# Add retakes
RETAKE_TIMES=3 npm run test:nw

# Combine all
PHONE=085123456789 VOUCHER=#1234 RETAKE_TIMES=2 npm run test:nw
```

### Debug Mode

```bash
# Step through test with browser open
npm run test:debug

# Run in headed mode (see what's happening)
npm run test:headed

# Run against specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

## Architecture

```
fixtures.ts (App Setup)
    ↓
test files (nw-test.spec.ts, etc.)
    ↓
utils/steps.ts (Reusable Steps)
    ↓
Browser Interactions
```

### Fixtures (fixtures.ts)

Manages Electron app lifecycle:
- Launches app once per worker
- Provides page object to tests
- Handles cleanup

### Step Functions (utils/steps.ts)

Reusable building blocks:

**Basic Helpers**
- `clickButton()` - Click with visibility check
- `waitForTextVisible()` - Wait for text to appear
- `stabilizePage()` - Prepare page for interaction

**Photostrip Flow Steps**
- `stepHome()` - Home page entry
- `stepProcedure()` - Phone & voucher entry
- `stepSelectCamera()` - Camera selection
- `stepWaitForPhotos()` - Take photos
- `stepPickPhotosIfPresent()` - Photo selection
- `stepSelectFilterIfPresent()` - Filter selection
- `stepDeclineUpsell()` - Decline offers
- `stepWaitForCompletion()` - Complete session

**Complete Flow**
- `completePhotostripFlow()` - Run entire flow

### Test Files

Each test file now:
1. Imports fixtures: `import { test } from '../fixtures'`
2. Imports steps: `import { completePhotostripFlow } from '../utils/steps'`
3. Uses fixtures: `async ({ page, app })`
4. Calls step functions instead of inline code

## Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_PATH` | Windows default install | App executable path |
| `PHONE` | 085335073597 | Phone number for tests |
| `VOUCHER` | #0909 | Voucher code for tests |
| `RETAKE_TIMES` | 0 | Number of retakes |

### Test Options

- **workers** - Number of parallel test workers
- **retries** - Retry failed tests (2 on CI, 0 locally)
- **timeout** - Test timeout (0 = no limit)
- **reporter** - HTML report generation

## Example Test

```typescript
import { test } from '../fixtures'
import { completePhotostripFlow } from '../utils/steps'

test('my test', async ({ page }) => {
  test.setTimeout(0)

  await completePhotostripFlow(page, {
    phone: '085335073597',
    voucher: '#0909',
    retakeTimes: 0
  })

  console.log('✓ Done')
})
```

## Adding New Tests

1. Create file in `tests/` directory
2. Import fixtures: `import { test } from '../fixtures'`
3. Import steps needed: `import { completePhotostripFlow } from '../utils/steps'`
4. Write test using step functions
5. Add to npm scripts in package.json if needed

```typescript
import { test } from '../fixtures'
import { clickButton, stepHome } from '../utils/steps'

test('my scenario', async ({ page }) => {
  test.setTimeout(0)

  await stepHome(page)
  // ... more steps
})
```

## Adding New Step Functions

1. Add function to `utils/steps.ts`
2. Export the function
3. Use in tests via `import { myStep } from '../utils/steps'`

```typescript
export async function myStep(page: Page, param: string) {
  // Implementation
}
```

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` to get all dependencies
- Check import paths are correct relative to file

### Tests timeout
- Check app is running
- Verify app path is correct
- Check selectors match current UI

### "Element not found"
- Run with `--headed` to see UI
- Use `--debug` to step through
- Check selector patterns in steps.ts

### App crashes during test
- Check application logs
- Verify voucher reduces total to 0 (free session)
- Try running serially: `workers: 1` in playwright.config.ts

## View Results

```bash
# Open HTML report
npm run report
```

Report shows:
- Test results (pass/fail)
- Screenshots
- Videos (if enabled)
- Traces for debugging

## Next Steps

1. Run a quick test: `npm run test:nw`
2. Check the report: `npm run report`
3. Add custom values: `PHONE=... npm run test:nw`
4. Write new tests using step functions
5. Extend step functions as needed

## Support

Refer to:
- **README.md** - Full documentation
- **fixtures.ts** - How app setup works
- **utils/steps.ts** - Available step functions
- **tests/*.spec.ts** - Example test patterns
