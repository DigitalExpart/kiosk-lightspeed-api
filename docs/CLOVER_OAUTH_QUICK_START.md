# Clover OAuth Quick Start Guide

Now that you have developer account access, here's how to set up OAuth for your Clover integration.

## ✅ What's Been Done

1. ✅ **OAuth Token Manager** - Created `CloverTokenManager` to handle OAuth tokens and automatic refresh
2. ✅ **Service Integration** - Updated `CloverService` to use OAuth tokens with automatic 401 handling
3. ✅ **Setup Script** - Created `npm run setup:clover-oauth` to guide you through the OAuth flow
4. ✅ **Documentation** - Created comprehensive setup guides

## 🚀 Next Steps

### Step 1: Create Your App in Developer Dashboard

**For Europe (EU):**
1. Go to **https://www.eu.clover.com/developer-home/create-account**
2. Create a developer account if you don't have one
3. Access the Developer Dashboard

**For US/Canada:**
1. Go to **https://dev.clover.com/**

Once in the Developer Dashboard:
2. Sign in with your Clover account
3. Click **"Create App"** or **"New App"**
4. Fill in:
   - **App Name**: `Lightspeed Bridge`
   - **Description**: `Integration bridge between Clover and Lightspeed Retail`
   - **Redirect URI**: `http://localhost:4000/oauth/callback` (for development)
5. **Save your App ID and App Secret** - You'll need these!

### Step 2: Configure App Permissions

In your app settings, enable:
- ✅ **Orders: Read**
- ✅ **Webhooks: Manage**
- ✅ **Merchant: Read**

### Step 3: Set Up OAuth Tokens

Run the setup script:

```bash
npm run setup:clover-oauth
```

The script will:
1. Ask for your App ID and App Secret (or use from `.env`)
2. Generate an authorization URL
3. Guide you to authorize the app
4. Exchange the authorization code for tokens
5. Save everything to your `.env` file

### Step 4: Configure Webhooks

1. In your app settings, go to **"Webhooks"**
2. Add your webhook URL:
   - Development: `http://your-ngrok-url.ngrok.io/clover/orders`
   - Production: `https://your-domain.com/clover/orders`
3. Subscribe to events:
   - ✅ `ORDER_CREATED`
   - ✅ `ORDER_UPDATED`
   - ✅ `ORDER_PAID`
4. **Copy the Webhook Secret** and add to `.env`:
   ```
   CLOVER_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 5: Test the Connection

```bash
npm run test:clover
```

You should now see successful API calls instead of 401 errors! 🎉

## 📋 Your .env File Should Include

```env
# Clover OAuth
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ACCESS_TOKEN=your_oauth_access_token
CLOVER_REFRESH_TOKEN=your_oauth_refresh_token

# Clover Merchant
# IMPORTANT: Use the Clover Merchant UUID (13-digit alphanumeric), NOT the MID
# Your merchantId (found in dashboard URL): QQ50HVC3HQZE1
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1

# Clover Webhook
CLOVER_WEBHOOK_SECRET=your_webhook_secret
```

## 🔍 Troubleshooting

### Still getting 401 errors?
- **Check Merchant ID**: Ensure you're using the Clover Merchant UUID (13-digit alphanumeric), NOT the MID
  - Find your UUID: https://docs.clover.com/dev/docs/locating-merchant-id-1
  - The MID (like 179188390993) will NOT work - you need the UUID
- Verify OAuth tokens are in `.env` (not direct tokens)
- Check that app has correct permissions enabled
- Try running `npm run test:clover` to see detailed error messages

### Can't find "Create App" button?
- Make sure you're signed in to Developer Dashboard
- Check if you need to accept terms of service
- Contact Clover support if developer options aren't visible

### Webhooks not working?
- Verify webhook URL is accessible (use ngrok for local testing)
- Check that webhook secret matches in app settings and `.env`
- Ensure events are subscribed in app settings

## 📚 More Help

- **Detailed Setup**: See `docs/CLOVER_DEVELOPER_DASHBOARD_SETUP.md`
- **Webhook Guide**: See `docs/WEBHOOK_SETUP_GUIDE.md`
- **Troubleshooting**: See `docs/CLOVER_TOKEN_TROUBLESHOOTING.md`

## 🎯 What This Solves

✅ **Full REST API Access** - OAuth tokens have full functionality (unlike private tokens)
✅ **Automatic Token Refresh** - Tokens refresh automatically before expiration
✅ **401 Error Handling** - Automatically refreshes token and retries on 401 errors
✅ **Webhook Configuration** - Proper webhook setup through Developer Dashboard
✅ **Production Ready** - Secure, long-term authentication solution

Good luck! 🚀


