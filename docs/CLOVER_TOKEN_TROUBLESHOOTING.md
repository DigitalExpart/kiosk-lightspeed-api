# Clover Token Troubleshooting Guide

## Current Status
- **Merchant ID**: `179188390993` ✅
- **Token**: `4cd8616c-169a-8e7d-7174-b4018efc3bbc` ⚠️
- **Error**: 401 Unauthorized on all API endpoints

## Checklist: Verify in Clover Dashboard

### 1. Token Type
- [ ] Go to Clover Dashboard → Settings → API Tokens
- [ ] Find token: `4cd8616c-169a-8e7d-7174-b4018efc3bbc`
- [ ] Verify it shows **"REST API"** (NOT "Ecommerce API")
- [ ] If it says "Ecommerce API", create a new REST API token

### 2. Token Status
- [ ] Check if token shows as **"Active"** or **"Enabled"**
- [ ] Look for any toggle/switch to activate the token
- [ ] Verify token is not expired or revoked

### 3. Permissions
- [ ] Verify **Orders → Read** permission is checked
- [ ] Check that token has necessary permissions enabled
- [ ] Ensure you clicked **"Save"** after setting permissions

### 4. Merchant Account
- [ ] Verify merchant account is active
- [ ] Check if there are any account-level API restrictions
- [ ] Confirm merchant ID `179188390993` is correct

### 5. Token Activation Time
- [ ] Wait 5-10 minutes after creating token (may need activation time)
- [ ] Try clearing browser cache and refreshing dashboard
- [ ] Log out and log back into Clover dashboard

## What to Tell Clover Support

When contacting Clover support, provide:

```
Subject: API Token Authentication Issue - 401 Unauthorized

I'm trying to use the Clover REST API but getting 401 Unauthorized errors.

Details:
- Merchant ID: 179188390993
- Token: 4cd8616c-169a-8e7d-7174-b4018efc3bbc
- Token Type: REST API (I believe)
- Permissions: Orders Read enabled
- Error: 401 Unauthorized on all API endpoints

I've tried:
- Bearer token authentication
- Query parameter authentication
- Multiple API endpoints (v3/merchants, v3/orders)
- Clearing cache and regenerating token

Can you verify:
1. Is my API access enabled for this merchant account?
2. Is the token correctly configured and active?
3. Are there any account-level restrictions?
4. What is the correct authentication method for this token?

Thank you!
```

## Alternative: OAuth Flow

If private tokens continue to fail, consider using OAuth 2.0:
- More reliable for production
- Automatic token refresh
- Better security

See `docs/CLOVER_OAUTH_SETUP.md` for OAuth setup instructions.

## Testing

After making changes, test with:
```bash
npm run test:clover
```

