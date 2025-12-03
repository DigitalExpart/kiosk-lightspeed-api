# Clover Developer Dashboard Setup - EU Region

## 🌍 Important: EU vs US Developer Portals

Clover has **separate developer portals** for different regions:

### **Europe (EU)**
- **Developer Portal**: https://www.eu.clover.com/developer-home/create-account
- **Merchant Dashboard**: https://www.eu.clover.com/
- **API Base URL**: `https://api.eu.clover.com/v3`

### **United States / Canada**
- **Developer Portal**: https://dev.clover.com/
- **Merchant Dashboard**: https://www.clover.com/
- **API Base URL**: `https://api.clover.com/v3`

⚠️ **You must use the portal for your region!**

---

## 🚀 Setup Steps for EU Region

### Step 1: Create Developer Account

1. Go to: **https://www.eu.clover.com/developer-home/create-account**
2. Sign in with your Clover merchant account credentials
3. Accept the developer terms and conditions
4. You'll be redirected to the Developer Dashboard

### Step 2: Create Your App

1. In the Developer Dashboard, click **"Create App"**
2. Fill in the app details:
   - **App Name**: `Lightspeed Bridge`
   - **Website**: `https://your-website.com` (any URL)
   - **Description**: `Real-time order integration between Clover and Lightspeed Retail`
   - **Package Name**: `com.yourcompany.lightspeedbridge`

3. Click **"Save"** or **"Create App"**

### Step 3: Configure App Permissions

1. In your app settings, go to **"Permissions"** tab
2. Enable these permissions:
   - ✅ **Orders: Read**
   - ✅ **Merchant: Read**
3. Click **"Save"**

### Step 4: Configure Webhooks

1. In your app settings, go to **"Webhooks"** tab
2. Click **"Add Webhook"** or **"Configure Webhooks"**
3. **Enter your webhook URL**:
   ```
   https://your-ngrok-url.ngrok.io/webhooks/clover/orders
   ```
   
4. **Select events to subscribe to**:
   - ✅ `ORDER_CREATED`
   - ✅ `ORDER_UPDATED`
   - ✅ `ORDER_PAID`

5. **Copy the Webhook Signing Secret**
   - This will be shown after configuration
   - You'll need this for your `.env` file

### Step 5: Install App to Your Merchant

1. In the Developer Dashboard, find your app
2. Click **"Install"** or **"Test on Merchant"**
3. Select merchant: **NUTRICENTRO** (`QQ50HVC3HQZE1`)
4. Review and approve the permissions
5. Click **"Install"**

### Step 6: Configure Your Application

Update your `.env` file:

```env
# Clover Configuration (EU Region)
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
CLOVER_ACCESS_TOKEN=02679544-ea68-4224-200b-baf959b36090
CLOVER_WEBHOOK_SECRET=your_webhook_signing_secret_here

# If using OAuth (optional)
CLOVER_APP_ID=your_app_id_here
CLOVER_APP_SECRET=your_app_secret_here
```

### Step 7: Test Webhooks

1. Make sure your server is running: `npm run dev`
2. Make sure ngrok is running and URL matches webhook config
3. Create a test order in Clover
4. Watch your server logs for incoming webhook
5. Verify order appears in Lightspeed

---

## 🔧 EU-Specific Configuration

If you need to update your API base URL for EU region:

The code should automatically use the correct region, but if you need to specify:

```typescript
// For EU merchants, the API base URL is:
https://api.eu.clover.com/v3/merchants/{merchantId}
```

Check if your code needs any region-specific configuration.

---

## 📋 Your ngrok Webhook URL

Current webhook URL (from your ngrok):
```
https://b4304c84276d.ngrok-free.app/webhooks/clover/orders
```

⚠️ **Note**: This URL changes every time you restart ngrok (free plan). For production, you'll need:
- Paid ngrok plan with fixed domain, OR
- Deploy to a permanent server (AWS, Heroku, DigitalOcean, etc.)

---

## ✅ Verification Checklist

Before testing webhooks:
- [ ] Developer account created on EU portal
- [ ] App created with correct name and permissions
- [ ] Webhook URL configured with ngrok URL
- [ ] Webhook events subscribed (ORDER_CREATED, ORDER_UPDATED, ORDER_PAID)
- [ ] Webhook signing secret copied to `.env`
- [ ] App installed to merchant NUTRICENTRO
- [ ] Server running (`npm run dev`)
- [ ] ngrok running and URL matches webhook config

---

## 🆘 Troubleshooting

### Can't access Developer Portal
- Make sure you're using the EU portal: https://www.eu.clover.com/developer-home/create-account
- Use the same credentials as your merchant dashboard

### Webhooks not arriving
- Verify ngrok URL is correct and accessible
- Check webhook signing secret matches in `.env`
- Look for errors in Clover Developer Dashboard webhook logs
- Verify events are subscribed (ORDER_CREATED, etc.)

### 401 Errors on webhooks
- Check `CLOVER_WEBHOOK_SECRET` in `.env` matches the signing secret from Developer Dashboard
- Verify webhook signature validation is working

---

## 📚 Resources

- **EU Developer Portal**: https://www.eu.clover.com/developer-home/create-account
- **EU Merchant Dashboard**: https://www.eu.clover.com/
- **Clover Documentation**: https://docs.clover.com/
- **Webhook Guide**: `docs/WEBHOOK_SETUP_GUIDE.md`

---

## 🎯 Next Steps

Once webhooks are configured:
1. Test with a real order in Clover
2. Monitor server logs for webhook delivery
3. Verify order syncs to Lightspeed automatically
4. Deploy to production when ready

Good luck! 🚀

