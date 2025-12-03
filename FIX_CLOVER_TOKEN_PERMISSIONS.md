# 🔧 Fix Clover Token Permissions (URGENT)

## ❌ Current Problem

Your Clover API token has **NO Orders Read permission** at all. The API is returning:
```
403 Forbidden - "Invalid permissions for expandable fields"
```

This means the token cannot read orders in any form (not even basic data).

## ✅ How to Fix (5 minutes)

### Step 1: Go to Clover Dashboard
1. Log in to: https://www.clover.com/dashboard
2. Or for sandbox: https://sandbox.dev.clover.com/dashboard

### Step 2: Find Your API Token
1. Click **Settings** (gear icon) or **Account & Setup**
2. Click **API Tokens** or **Integrations**
3. Find your token: `ab12c417-756a-aa4c-40d1-77ccf1815279`
   - Token name might be "Lightspeed Bridge" or similar

### Step 3: Enable Orders Read Permission
1. Click on the token to **edit** it
2. Look for **Permissions** section
3. Find **"Orders"** permission
4. Check/enable: **☑ Read**
5. **IMPORTANT**: Click **"Save"** button!

### Step 4: Wait & Test
1. Wait **2-5 minutes** for permissions to activate
2. Test by creating a new order in Clover
3. Check Railway logs - should now work!

## 🎯 Required Minimum Permissions

For basic order sync, enable:
- ☑ **Orders → Read** (REQUIRED)

For full order details with modifiers/discounts, also enable:
- ☑ **Inventory → Read** (for item details)
- ☑ **Customers → Read** (for customer info)

## 🔍 If You Can't Find the Token

The token might be from an **app** instead of a direct API token. In that case:

1. Go to **Developer Dashboard**: https://www.clover.com/developer-home/overview
2. Find your app: "Lightspeed Bridge" or similar
3. Click **Settings**
4. Go to **Permissions & API Tokens**
5. Enable: **Orders → Read**
6. Click **Save**

## 📱 Alternative: Generate a NEW Token

If you can't find the existing token, create a new one:

1. Go to Clover Dashboard → **API Tokens**
2. Click **Create New Token**
3. Name it: "Lightspeed Bridge v2"
4. Select permissions:
   - ☑ **Orders → Read** (required)
   - ☑ **Inventory → Read** (recommended)
   - ☑ **Customers → Read** (optional)
5. Click **Create** and **copy the new token**
6. Update Railway environment variable:
   - Variable: `CLOVER_ACCESS_TOKEN`
   - Value: `<your new token>`

## ⚠️ Important Notes

### Token Types
- ✅ Use: **"REST API Token"** or **"Private Token"**
- ❌ Don't use: **"Ecommerce API Token"** (different API)

### Merchant ID
Make sure you're editing tokens for the correct merchant:
- Current merchant ID: `PWXW7AC7WJ0A1`
- This appears to be a **sandbox merchant** (starts with 'P')

### Sandbox vs Production
- You're using **Clover Sandbox** (development environment)
- Make sure you're logged into the **sandbox** dashboard, not production
- Sandbox URL: https://sandbox.dev.clover.com/dashboard
- Production URL: https://www.clover.com/dashboard

## 🧪 Test After Fixing

Once you've enabled the permission:

1. **Wait 5 minutes** for activation
2. **Create a test order** in Clover POS or Dashboard
3. **Check Railway logs** - should see:
   ```
   INFO: Fetching order from Clover API
   INFO: Order processed successfully
   ```

## 💡 Still Not Working?

If you still get 403 after enabling permissions:

### Option 1: Contact Clover Support
Email: support@clover.com

```
Subject: API Token Permission Issue - 403 on Orders Read

Hello,

I have a Clover API token that's returning 403 Forbidden even after enabling Orders Read permission.

Details:
- Merchant ID: PWXW7AC7WJ0A1
- Token: ab12c417-756a-aa4c-40d1-77ccf1815279  
- Environment: Sandbox
- Permission enabled: Orders → Read (saved)
- Error: 403 Forbidden on /v3/merchants/{merchantId}/orders/{orderId}

Can you verify the token is correctly configured and has the necessary permissions activated?

Thank you!
```

### Option 2: Use OAuth Instead
OAuth tokens have more granular control and are more reliable for production:
- See: `docs/CLOVER_OAUTH_SETUP.md`
- The codebase already supports OAuth
- Just set: `CLOVER_APP_ID`, `CLOVER_APP_SECRET`, `CLOVER_REFRESH_TOKEN`

## 📊 Current Status

```
Token: ab12c417-756a-aa4c-40d1-77ccf1815279
Merchant: PWXW7AC7WJ0A1 (Sandbox)
Permission: ❌ Orders Read - MISSING
Status: ❌ Not Working
Action: Enable Orders Read permission in Clover Dashboard
```

After fixing:
```
Permission: ✅ Orders Read - ENABLED
Status: ✅ Working
```

