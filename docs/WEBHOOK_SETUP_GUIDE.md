# Clover Webhook Setup Guide

## Will E-commerce API Work?

### ✅ Yes, IF webhook payload contains full order data

The E-commerce API webhook will work for your needs if:
- Webhook payload includes order details (items, prices, quantities)
- Webhook payload includes customer information
- Webhook payload includes discounts and taxes

**We'll verify this in Step 3 (Testing)**

---

## Step-by-Step Webhook Setup

### Step 1: Deploy Your Service (or Use ngrok for Testing)

#### Option A: Use ngrok (Quick Testing)
```bash
# Install ngrok if you haven't
# Download from: https://ngrok.com/

# Start your server
npm run dev

# In another terminal, expose your local server
ngrok http 4000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Deploy to Cloud (Production)
- Deploy to AWS, Heroku, DigitalOcean, etc.
- Ensure HTTPS is enabled
- Get your public URL

**Your webhook URL will be:**
```
https://your-server-url/webhooks/clover/orders
```

---

### Step 2: Configure Webhook in Clover Dashboard

1. **Log into Clover Dashboard**
   - Go to: https://www.clover.com/
   - Sign in with your merchant account

2. **Navigate to Webhooks**
   - Click **Settings** (gear icon)
   - Go to **Business operations**
   - Click **Webhooks** (or **API Webhooks**)

3. **Create New Webhook**
   - Click **Add Webhook** or **Create Webhook**
   - Enter webhook URL: `https://your-server-url/webhooks/clover/orders`
   - Select events to subscribe:
     - ✅ **ORDER_CREATED**
     - ✅ **ORDER_UPDATED**
     - ✅ **ORDER** (if available)

4. **Set Webhook Secret** (Important!)
   - Generate a secret key (random string)
   - Save it - you'll need it for `.env`
   - Example: `clover_webhook_secret_abc123xyz`

5. **Save Webhook**
   - Click **Save** or **Create**
   - Webhook should show as "Active"

---

### Step 3: Configure Webhook Secret in Your App

Add to your `.env` file:
```env
CLOVER_WEBHOOK_SECRET=your_webhook_secret_here
```

Or if using a different variable name:
```env
WEBHOOK_SIGNATURE_SECRET=your_webhook_secret_here
```

---

### Step 4: Test the Webhook

#### 4.1: Start Your Server
```bash
npm run dev
```

#### 4.2: Create Test Order in Clover
1. Go to Clover POS or dashboard
2. Create a test order with:
   - At least 1 item
   - A customer (optional)
   - Complete the order

#### 4.3: Check Server Logs
You should see:
```
Processing Clover order event
Webhook contains full order data, processing from payload
Order validated, mapping to Lightspeed format
Creating sale in Lightspeed
Order successfully forwarded to Lightspeed
```

#### 4.4: Verify in Lightspeed
- Check Lightspeed dashboard
- Order should appear as a new sale
- Verify all items, prices, and customer info are correct

---

### Step 5: Verify Webhook Payload Structure

If webhook is received but order doesn't process, check the payload:

1. **Check Server Logs**
   - Look for webhook payload in logs
   - Verify it contains order data

2. **Inspect Payload**
   - The code will log the payload structure
   - Check if it has: `lineItems`, `total`, `items`, etc.

3. **If Payload Missing Data**
   - Contact Clover support
   - Ask: "Do E-commerce API webhooks include full order data in payload?"
   - May need REST API access as fallback

---

## Troubleshooting

### Webhook Not Received
- ✅ Check webhook URL is correct
- ✅ Verify server is running and accessible
- ✅ Check firewall/security settings
- ✅ Verify HTTPS is enabled (required)

### 401 Unauthorized
- ✅ Check `CLOVER_WEBHOOK_SECRET` matches Clover dashboard
- ✅ Verify webhook signature validation

### Order Not Processing
- ✅ Check server logs for errors
- ✅ Verify webhook payload contains order data
- ✅ Check Lightspeed connection
- ✅ Verify Lightspeed credentials

### Webhook Received But No Order Data
- ⚠️ This means webhook only has order ID
- ⚠️ Need REST API access to fetch order
- ⚠️ Contact Clover support

---

## Quick Reference

### Webhook Endpoint
```
POST https://your-server-url/webhooks/clover/orders
```

### Required Headers (from Clover)
```
Content-Type: application/json
X-Clover-Signature: <signature>
```

### Environment Variables
```env
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
CLOVER_ACCESS_TOKEN=e6d45143-3edc-1646-455e-653418ecec51
CLOVER_WEBHOOK_SECRET=your_secret_here
LIGHTSPEED_DOMAIN=nutricentro.retail.lightspeed.app
LIGHTSPEED_PERSONAL_TOKEN=your_token
LIGHTSPEED_SHOP_ID=06f24f8b-21fd-11ef-f4ca-922477100487
```

---

## Next Steps After Setup

1. ✅ Webhook configured
2. ✅ Test order created
3. ✅ Order appears in Lightspeed
4. ✅ Monitor for any errors
5. ✅ Deploy to production when ready

---

## Need Help?

If webhook doesn't work:
1. Check server logs
2. Verify webhook URL is accessible
3. Test with ngrok first (easier debugging)
4. Contact Clover support if payload missing data

