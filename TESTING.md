# Test Mona's Bookmark Manager

Use Node.js 22.12 or newer.

```sh
npm ci
npm test
npm run build
```

The unit suite checks URL normalization and protocol restrictions, malformed storage recovery, slug collisions, and the exact URL/slug display format.

For browser checks, install Chromium and serve the production build:

```sh
npx playwright install chromium
npm run preview
```

In another terminal:

```sh
APP_URL=http://localhost:4321 npm run test:browser
```

The browser suite checks adding, reloading, copying, invalid URLs, clear confirmation, malformed storage, failed writes, disabled storage, and mobile layout. All test data stays in an isolated browser context. To save a real full-page screenshot after the checks pass:

```sh
APP_URL=http://localhost:4321 CAPTURE_PROOF=1 npm run test:browser
```

The screenshot is written to `submission/demo-proof.png`. On Windows PowerShell set the environment variables with `$env:APP_URL='http://localhost:4321'` and `$env:CAPTURE_PROOF='1'` before running the command.
