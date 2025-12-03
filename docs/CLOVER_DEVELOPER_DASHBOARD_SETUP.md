# Clover Developer Dashboard Setup Guide

Now that you have developer account access, follow these steps to create your app and set up OAuth.

## Step 1: Access Developer Dashboard

1. Go to: **https://dev.clover.com/** (or https://www.clover.com/developers)
2. Sign in with your Clover account
3. You should see the **Developer Dashboard**

## Step 2: Create a New App

1. Click **"Create App"** or **"New App"** button
2. Fill in the app details:
   - **App Name**: `Lightspeed Bridge` (or any name you prefer)
   - **Description**: `Integration bridge between Clover and Lightspeed Retail`
   - **App Type**: Select **"Server-side"** or **"Web App"**
   - **Redirect URI**: `http://localhost:4000/oauth/callback` (for development)
     - For production, use your actual webhook URL: `https://your-domain.com/oauth/callback`

3. Click **"Create"** or **"Save"**

## Step 3: Get Your App Credentials

After creating the app, you'll see:
- **App ID** (also called Client ID) - Copy this!
- **App Secret** (also called Client Secret) - Copy this! ⚠️ Keep this secret!

Save these in a safe place. You'll need them for your `.env` file.

## Step 4: Configure OAuth Permissions

1. In your app settings, find **"Permissions"** or **"Scopes"**
2. Enable the following permissions:
   - ✅ **Orders: Read** (to fetch order details)
   - ✅ **Webhooks: Manage** (to receive webhook events)
   - ✅ **Merchant: Read** (to access merchant information)

## Step 5: Configure Webhooks (Important!)

1. In your app settings, find **"Webhooks"** section
2. Click **"Add Webhook"** or **"Configure Webhooks"**
3. Enter your webhook URL:
   - Development: `http://your-ngrok-url.ngrok.io/clover/orders`
   - Production: `https://your-domain.com/clover/orders`
4. Select events to subscribe to:
   - ✅ **ORDER_CREATED** (when a new order is created)
   - ✅ **ORDER_UPDATED** (when an order is updated)
   - ✅ **ORDER_PAID** (when an order is paid)
5. Save the webhook configuration
6. **Copy the Webhook Secret** - You'll need this for signature verification!

## Step 6: Authorize Your App

Before you can use the app, you need to authorize it for your merchant account:

1. In the Developer Dashboard, find your app
2. Look for **"Authorize"** or **"Install"** button
3. Or visit this URL (replace `YOUR_APP_ID`):
   ```
   https://www.clover.com/oauth/authorize?client_id=YOUR_APP_ID&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
   ```
4. You'll be redirected to Clover to authorize the app
5. After authorization, you'll be redirected back with an authorization code

## Step 7: Exchange Authorization Code for Access Token

Use the script we'll create (`scripts/setup-clover-oauth.ts`) to:
1. Exchange the authorization code for an access token
2. Get a refresh token
3. Save tokens to your `.env` file

## Step 8: Update Your .env File

Add these variables to your `.env`:

```env
# Clover OAuth (from Developer Dashboard)
CLOVER_APP_ID=your_app_id_here
CLOVER_APP_SECRET=your_app_secret_here
CLOVER_ACCESS_TOKEN=your_oauth_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here

# Clover Merchant
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1

# Clover Webhook
CLOVER_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 9: Test the Connection

Run the test script:
```bash
npm run test:clover
```

If successful, you should see order data instead of 401 errors!

## Troubleshooting

### Can't find "Create App" button?
- Make sure you're signed in to the Developer Dashboard
- Check if you need to accept terms of service
- Contact Clover support if you don't see developer options

### Authorization fails?
- Check that your redirect URI matches exactly (including http/https, port, path)
- Make sure the app is saved before trying to authorize

### Webhooks not working?
- Verify the webhook URL is accessible (use ngrok for local testing)
- Check that webhook secret is correctly configured
- Ensure events are subscribed in app settings

### Still getting 401 errors?
- Verify OAuth tokens are being used (not private tokens)
- Check token expiration - refresh tokens may be needed
- Ensure app has correct permissions enabled

## Next Steps

After completing this setup:
1. ✅ Run `npm run setup:clover-oauth` to get initial tokens
2. ✅ Test connection: `npm run test:clover`
3. ✅ Configure webhooks in your app
4. ✅ Test webhook delivery
5. ✅ Start processing orders!

## Need Help?

If you encounter issues:
1. Check Clover Developer Documentation: https://docs.clover.com/
2. Contact Clover Developer Support
3. Review the troubleshooting section above

