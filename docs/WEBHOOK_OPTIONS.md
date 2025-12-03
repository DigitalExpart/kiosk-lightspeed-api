# Setting Up Clover Webhooks for REST API

## ⚠️ Important: REST API Webhooks Require an App

Unlike E-commerce API, REST API webhooks need to be configured through a Clover App in the Developer Dashboard.

---

## 🚀 Quick Setup (Choose One Path)

### Path A: Simple Testing (Manual Fetch - No Webhooks Needed)

If webhooks are too complex right now, you can start with manual order fetching:

**Skip webhooks for now and use polling instead:**

```bash
# Your bridge can periodically check for new orders
# We can add a simple polling mechanism
```

**Pros:**
- ✅ Works immediately
- ✅ No webhook setup needed
- ✅ Good for testing

**Cons:**
- ❌ Not real-time (checks every X minutes)
- ❌ Less efficient

---

### Path B: Full Webhook Setup (Real-time Orders)

For real-time order processing, set up webhooks properly:

#### Step 1: Create App in Developer Dashboard

1. Go to: **https://dev.clover.com/**
2. Sign in with your Clover account
3. Click **"Create App"** or **"New App"**

#### Step 2: Configure App

Fill in the app details:
- **App Name**: `Lightspeed Bridge`
- **Website**: `https://your-website.com` (can be dummy for now)
- **Description**: `Integration bridge between Clover and Lightspeed Retail`
- **Package Name**: `com.yourcompany.lightspeedbridge`

#### Step 3: Set Permissions

Enable these permissions:
- ✅ **Orders: Read**
- ✅ **Webhooks: Manage**
- ✅ **Merchant: Read**

#### Step 4: Configure Webhooks

In your app settings:

1. **Find "Webhooks" section**
2. **Add Webhook URL**:
   ```
   https://your-ngrok-url.ngrok.io/webhooks/clover/orders
   ```
3. **Subscribe to Events**:
   - ✅ `ORDER_CREATED`
   - ✅ `ORDER_UPDATED`  
   - ✅ `ORDER_PAID`

4. **Copy Webhook Secret** (Signing Secret)
   - Save this for your `.env` file

#### Step 5: Install App to Your Merchant

1. In Developer Dashboard, find your app
2. Click **"Install to test merchant"** or **"Install"**
3. Select merchant: **NUTRICENTRO** (`QQ50HVC3HQZE1`)
4. Approve permissions

#### Step 6: Update .env

Add the webhook secret:
```env
CLOVER_WEBHOOK_SECRET=your_webhook_signing_secret_here
```

---

## 🤔 Which Path Should You Choose?

### Choose Path A (Polling) if:
- You want to test the integration **quickly**
- Webhooks seem too complicated right now
- You're okay with orders syncing every few minutes instead of instantly

### Choose Path B (Webhooks) if:
- You need **real-time** order processing
- You want the full production-ready solution
- You're willing to spend 20-30 minutes setting up

---

## 📞 My Recommendation

**Start with Path A (Polling) first!**

Reasons:
1. ✅ You can test the full integration **right now**
2. ✅ Verify everything works end-to-end
3. ✅ Add webhooks later when you're ready
4. ✅ Less complexity to start

Then upgrade to Path B (Webhooks) once everything else works.

---

## 🚀 Ready to Proceed?

**Tell me which path you prefer:**

- **"Path A"** → I'll help you set up polling (quick!)
- **"Path B"** → I'll guide you through the Developer Dashboard setup

Let me know!

