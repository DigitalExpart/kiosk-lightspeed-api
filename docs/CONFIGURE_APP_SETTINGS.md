# ⚙️ Configure Clover App Settings - Step by Step

You're now on the App Settings page! Let's configure everything you need.

## 📋 Your Current Credentials

- **App ID**: `8GSC7031S26JY`
- **App Secret**: `3de21706-142e-2abc-ab53-4e41e79bd0aa`

Copy these to your `.env` file first! ⬇️

---

## Step 1: Save Credentials to .env

First, let's add your App ID and App Secret to your `.env` file:

```env
# Clover OAuth (from Developer Dashboard)
CLOVER_APP_ID=8GSC7031S26JY
CLOVER_APP_SECRET=3de21706-142e-2abc-ab53-4e41e79bd0aa

# Clover Merchant
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
```

---

## Step 2: Configure Requested Permissions

1. **Click the pencil icon** ✏️ next to "Requested Permissions"
2. You'll see a list of available permissions
3. **Check these boxes**:
   - ✅ **ORDERS** → Enable "Read" permission
   - ✅ **WEBHOOKS** → Enable "Manage" permission  
   - ✅ **MERCHANTS** → Enable "Read" permission
4. Click **"Save"** or **"Apply"**

💡 These permissions allow your app to:
- Read order data from Clover
- Receive webhook events
- Access merchant information

---

## Step 3: Configure REST Configuration (OAuth Redirect URI)

1. **Click the pencil icon** ✏️ next to "REST Configuration"
2. Look for **"Redirect URI"** or **"OAuth Redirect URI"** field
3. Enter:
   ```
   http://localhost:4000/oauth/callback
   ```
   ⚠️ Make sure it matches exactly (including `http://` not `https://`)
4. Click **"Save"** or **"Apply"**

💡 This is where Clover will redirect after you authorize the app.

---

## Step 4: Configure Webhooks (Do This Later)

⚠️ **Important**: You need a public URL for webhooks. We'll set this up after you have ngrok or your server running.

For now, you can skip this step. We'll come back to it.

**When you're ready**, you'll:
1. Click the pencil icon ✏️ next to "Webhooks"
2. Add your webhook URL (like `https://your-ngrok-url.ngrok.io/webhooks/clover/orders`)
3. Select events: `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_PAID`
4. Copy the webhook secret

---

## Step 5: Get OAuth Tokens

Now that your app is configured, let's get your OAuth access tokens:

1. Open a terminal in your project folder
2. Run:
   ```bash
   npm run setup:clover-oauth
   ```
3. The script will ask for your App ID and App Secret (or read from `.env`)
4. It will generate an authorization URL
5. Open that URL in your browser
6. Authorize the app
7. The script will automatically save tokens to your `.env` file

---

## Step 6: Test Your Connection

After getting tokens, test everything:

```bash
npm run test:clover
```

✅ If successful, you'll see order data!

---

## 📝 Complete .env File

Your `.env` file should eventually have:

```env
# Clover OAuth (from Developer Dashboard)
CLOVER_APP_ID=8GSC7031S26JY
CLOVER_APP_SECRET=3de21706-142e-2abc-ab53-4e41e79bd0aa
CLOVER_ACCESS_TOKEN=your_oauth_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here

# Clover Merchant
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1

# Clover Webhook (set this up later)
CLOVER_WEBHOOK_SECRET=your_webhook_secret_here

# Lightspeed (already configured)
LIGHTSPEED_DOMAIN=nutricentro.retail.lightspeed.app
LIGHTSPEED_SHOP_ID=06f24f8b-21fd-11ef-f4ca-922477100487
LIGHTSPEED_PERSONAL_TOKEN=your_lightspeed_token_here
```

---

## 🎯 Next Steps Summary

1. ✅ **Save App ID & Secret to `.env`** ← Do this now!
2. ✅ **Configure Permissions** (Orders Read, Webhooks Manage, Merchant Read)
3. ✅ **Configure REST Redirect URI** (`http://localhost:4000/oauth/callback`)
4. ✅ **Run OAuth setup script** (`npm run setup:clover-oauth`)
5. ⏳ **Configure Webhooks** (later, after you have ngrok/public URL)
6. ✅ **Test connection** (`npm run test:clover`)

---

## 🆘 Troubleshooting

### Can't find permissions?
- Look for "Requested Permissions" or "Scopes"
- Some apps might call it "API Permissions"

### Redirect URI field not found?
- Check if it's under "OAuth Settings" or "Authentication"
- Some apps have it in a different section

### Still seeing errors?
- Make sure you've saved all settings
- Refresh the page and check again
- Verify App ID and Secret are correct

