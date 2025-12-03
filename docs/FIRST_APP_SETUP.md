# 🚀 First Clover App Setup - Quick Start

You're now on the Clover Developer Dashboard! Let's create your first app.

## Step 1: Create Your App (You're Here!)

1. **Click the green "Create new app" button** on the Developer Dashboard
2. **Choose "Private app"** (with the padlock icon)
   - ✅ This is for your own business integration
   - ✅ You'll get API access and webhooks
   - ❌ Don't choose "Payment app" (that's for processing payments)
3. Fill in the app details:
   - **App Name**: `Lightspeed Bridge` (or any name you prefer)
   - **Description**: `Integration bridge between Clover and Lightspeed Retail to sync orders in real-time`
   - **Redirect URI**: `http://localhost:4000/oauth/callback`
     - ⚠️ Make sure this matches exactly (including http/https, port, path)
     - For production, you'll update this later to your actual domain

4. On the "Select devices" screen:
   - ✅ Keep **"Web"** checked (already selected)
   - ❌ Don't select any Clover devices (Station, Mini, Mobile, Flex)
   - Your integration runs on a web server, not on Clover devices
5. Click **"Next"** to continue

## Step 2: Get Your Credentials

After creating the app, you'll immediately see:
- ✅ **App ID** (also called Client ID) - **Copy this now!**
- ✅ **App Secret** (also called Client Secret) - **Copy this now!** ⚠️ Keep this secret!

💡 **Tip**: Save these in a text file temporarily. You'll need them in the next steps.

## Step 3: Configure Permissions

1. Navigate to your app's settings (usually in the app detail page)
2. Find **"Permissions"** or **"Scopes"** section
3. Enable these permissions:
   - ✅ **Orders: Read** (to fetch order details)
   - ✅ **Webhooks: Manage** (to receive webhook events)
   - ✅ **Merchant: Read** (to access merchant information)

4. Save the permissions

## Step 4: Set Up OAuth Tokens

Now run the OAuth setup script to get your access tokens:

```bash
npm run setup:clover-oauth
```

The script will:
1. Ask for your **App ID** and **App Secret** (paste the ones you copied)
2. Generate an authorization URL
3. Open it in your browser to authorize the app
4. Exchange the authorization code for tokens
5. Save everything to your `.env` file automatically

## Step 5: Configure Webhooks

⚠️ **Important**: You'll need a public URL for webhooks. For development, use ngrok:

### A. Start Your Server (in one terminal)
```bash
npm run dev
```

### B. Expose with ngrok (in another terminal)
```bash
# Download ngrok from: https://ngrok.com/download
# Then run:
ngrok http 4000
```

You'll get a URL like: `https://abc123.ngrok.io`

### C. Configure Webhook in Clover App Settings

1. In your app settings, find the **"Webhooks"** section
2. Click **"Add Webhook"** or **"Configure Webhooks"**
3. Enter your webhook URL:
   ```
   https://YOUR-NGROK-URL.ngrok.io/webhooks/clover/orders
   ```
   (Replace `YOUR-NGROK-URL` with your actual ngrok URL)
4. Select events to subscribe to:
   - ✅ `ORDER_CREATED` (when a new order is created)
   - ✅ `ORDER_UPDATED` (when an order is updated)
   - ✅ `ORDER_PAID` (when an order is paid)
5. Save the webhook configuration
6. **Copy the Webhook Secret** - You'll need this for signature verification!

## Step 6: Update Your .env File

Your `.env` file should include:

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

⚠️ **Note**: If you ran `npm run setup:clover-oauth`, the App ID, App Secret, and tokens should already be in your `.env` file. You just need to add:
- `CLOVER_MERCHANT_ID` (if not already there)
- `CLOVER_WEBHOOK_SECRET` (from Step 5)

## Step 7: Test Your Connection

Run the test script to verify everything is working:

```bash
npm run test:clover
```

✅ If successful, you'll see order data instead of 401 errors!

## 🎯 What You Should Have Now

After completing these steps, you should have:
- ✅ A Clover app created in Developer Dashboard
- ✅ App ID and App Secret saved in `.env`
- ✅ OAuth access token and refresh token saved in `.env`
- ✅ Webhook configured with a public URL
- ✅ Webhook secret saved in `.env`
- ✅ Test connection passing

## 🆘 Troubleshooting

### Can't see "Create new app" button?
- Make sure you're on the "My Apps" page
- Check if you need to accept terms of service
- Refresh the page

### Authorization fails?
- Check that your redirect URI matches exactly: `http://localhost:4000/oauth/callback`
- Make sure the app is saved before trying to authorize

### Still getting 401 errors?
- Verify all credentials are in `.env` file
- Check that app has correct permissions enabled
- Run `npm run test:clover` to see detailed error messages

### Webhooks not working?
- Verify ngrok is running and URL is accessible
- Check that webhook secret matches in app settings and `.env`
- Ensure events are subscribed in app settings

## 📚 Next Steps

Once your Clover app is set up:
1. Test the Lightspeed connection: `npm run test:lightspeed`
2. Test end-to-end: Create an order in Clover and watch it sync to Lightspeed
3. Monitor logs for any errors

See `docs/NEXT_STEPS_ACTION_PLAN.md` for the complete integration guide.

