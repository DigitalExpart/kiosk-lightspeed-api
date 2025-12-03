# Clover REST API Token Issue

## Current Status
- **Token**: `4cd8616c-169a-8e7d-7174-b4018efc3bbc`
- **Type**: REST API ✅ (confirmed in dashboard)
- **Status**: Active/Enabled ✅ (confirmed)
- **Permissions**: Orders Read enabled ✅ (confirmed)
- **API Response**: 401 Unauthorized ❌

## Problem
Despite correct dashboard configuration, all API calls return 401 Unauthorized.

## Possible Causes

### 1. Token Activation Delay
- Tokens may need 5-30 minutes to fully activate
- **Solution**: Wait and retry

### 2. Account-Level API Access
- REST API access may not be enabled at account level
- Dashboard shows token, but account doesn't have API access
- **Solution**: Contact Clover support to enable REST API access

### 3. IP Restrictions
- Token might have IP whitelisting enabled
- **Solution**: Check token settings for IP restrictions

### 4. Token Scope/Environment
- Token might be for sandbox, not production
- **Solution**: Verify token environment

## What We've Tried
- ✅ Bearer token authentication
- ✅ Query parameter authentication
- ✅ Multiple API endpoints (v3/merchants, v3/orders)
- ✅ Different base URLs
- ✅ Verified token configuration in dashboard

## Next Steps

### Immediate
1. Wait 10-15 minutes for token activation
2. Test again: `npm run test:clover`

### If Still Failing
Contact Clover Support with:
```
Subject: REST API Token 401 Error - Account-Level Access Issue

I have a REST API token configured correctly:
- Token: 4cd8616c-169a-8e7d-7174-b4018efc3bbc
- Merchant ID: 179188390993
- Token Type: REST API (confirmed in dashboard)
- Status: Active (confirmed)
- Permissions: Orders Read enabled (confirmed)

However, all API calls return 401 Unauthorized.

I've verified:
- Token is REST API type (not E-commerce)
- Token is active/enabled
- Orders Read permission is enabled
- Tried multiple authentication methods

This suggests the issue is at the account level, not the token level.
Can you verify that REST API access is enabled for merchant account 179188390993?

Thank you!
```

## Alternative: Use E-commerce API Webhooks
If REST API access cannot be enabled, we can use:
- E-commerce API webhooks (already configured)
- Process orders from webhook payloads
- No API fetch needed

