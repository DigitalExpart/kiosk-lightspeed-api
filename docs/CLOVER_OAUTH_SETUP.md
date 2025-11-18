# Clover OAuth Setup Guide

If private tokens aren't working, you may need to use OAuth authentication instead.

## Why OAuth?
- More reliable for production use
- Automatic token refresh
- Better security
- Standard authentication method

## Setup Steps

### 1. Create Clover App
1. Go to: https://www.clover.com/developers (or check Clover support for developer portal URL)
2. Sign in with your Clover account
3. Create a new app
4. Note your **App ID** and **App Secret**

### 2. Get Authorization Code
Visit this URL (replace YOUR_APP_ID):
```
https://www.clover.com/oauth/authorize?client_id=YOUR_APP_ID&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
```

### 3. Exchange Code for Token
Use the authorization code to get an access token via API call.

## Alternative: Contact Clover Support

If the developer portal is not accessible, contact Clover support:
- Email: support@clover.com
- Phone: Check your Clover dashboard
- Request: "I need API access for merchant ID 179188390993 to integrate with Lightspeed"

## Current Status

- ✅ Merchant ID configured: 179188390993
- ✅ Token created: 138509a1-8832-06de-f6ec-5f15784d489c
- ❌ Token authentication failing (401 Unauthorized)
- ⚠️ May need OAuth flow or Clover support assistance

