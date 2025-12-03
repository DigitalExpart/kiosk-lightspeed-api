# Railway Deployment Fix - Token Authentication Issue

## Problem Summary

The application was deployed to Railway but failing with error:
```
Error: No Clover access token or refresh token available
```

## Root Cause

The issue was in `CloverTokenManager` class. When **both** `CLOVER_ACCESS_TOKEN` and `CLOVER_APP_ID` environment variables were present (which is your Railway configuration), the code had a logic flaw:

```typescript
// OLD CODE (buggy)
async getAccessToken(): Promise<string> {
  // This condition failed when appId was set!
  if (this.accessToken && !this.appId) {
    return this.accessToken;
  }
  // ... fell through to OAuth mode without refresh token
}
```

The condition `!this.appId` would be `false` because `CLOVER_APP_ID` was set, so the code would skip the direct token and try OAuth mode, but you don't have `CLOVER_REFRESH_TOKEN` configured.

## Solution

Added a new `isDirectTokenMode` flag to explicitly track which mode is active:

```typescript
// NEW CODE (fixed)
constructor(env: Env) {
  if (env.CLOVER_ACCESS_TOKEN && !env.CLOVER_REFRESH_TOKEN) {
    // Direct token mode (no refresh token available)
    this.isDirectTokenMode = true;
    // ...
  } else if (env.CLOVER_APP_ID && env.CLOVER_APP_SECRET && env.CLOVER_REFRESH_TOKEN) {
    // OAuth mode
    this.isDirectTokenMode = false;
    // ...
  }
}

async getAccessToken(): Promise<string> {
  // Now clearly checks the mode flag
  if (this.isDirectTokenMode) {
    if (!this.accessToken) {
      throw new Error("No Clover access token available");
    }
    return this.accessToken;
  }
  // ... OAuth refresh logic
}
```

## Additional Fixes

While fixing the main issue, also resolved **linting errors** that were preventing CI from passing:

1. **src/index.ts**: Changed `import("http").createServer` to proper `import type { Server }`
2. **src/routes/webhooks.ts**: Changed `import` to `import type` for CloverService (type-only import)
3. **src/middleware/rate-limiter.ts**: Prefixed unused parameters with `_` (`req` → `_req`)
4. **src/services/clover.service.ts**: Removed unused error variable in catch block
5. **src/services/order-processor.service.ts**: Removed unused destructured variables

## Verification

✅ **Linting**: `npm run lint` - Passes with 0 errors
✅ **Build**: `npm run build` - Compiles successfully  
✅ **Tests**: `npm test` - All 14 tests pass

## Deployment Status

- **Commit**: `075cad8` - "Fix linting errors and token manager direct mode detection"
- **Pushed**: Successfully to `main` branch
- **Railway**: Will automatically redeploy with the fix
- **CI**: Will now pass all checks (lint, build, test)

## Your Railway Configuration (Already Correct)

Your environment variables in Railway are correctly configured:
- ✅ `CLOVER_ACCESS_TOKEN`: ab12c417-756a-aa4c-40d1-77ccf1815279
- ✅ `CLOVER_APP_ID`: 8GSC7031S26JY
- ✅ `CLOVER_APP_SECRET`: 3de21706-142e-2abc-ab53-4e41e79bd0aa
- ✅ `CLOVER_MERCHANT_ID`: PWXW7AC7WJ0A1
- ✅ `LIGHTSPEED_DOMAIN`: nutricentro.retail.lightspeed.app
- ✅ `LIGHTSPEED_PERSONAL_TOKEN`: (configured)
- ✅ `LIGHTSPEED_SHOP_ID`: 06f24f8b-21fd-11ef-f4ca-922477100487

The issue was **not** with the configuration, but with how the code handled this specific combination of environment variables.

## Next Steps

1. **Wait for Railway redeploy** (automatic after git push)
2. **Check Railway logs** - Should now see:
   ```
   INFO: Using direct CLOVER_ACCESS_TOKEN for Clover API authentication
   INFO: Clover-Lightspeed bridge listening
   ```
3. **Test webhook** - Send a test order from Clover to verify full integration works

## Testing the Fix Locally

If you want to test locally before Railway deployment completes:

```bash
# Run with your .env file
npm run build
npm start

# Should see:
# INFO: Using direct CLOVER_ACCESS_TOKEN for Clover API authentication
# INFO: Clover-Lightspeed bridge listening
```

