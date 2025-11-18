# Webhook Setup Guide

## Overview
This guide will help you configure Clover webhooks to send order events to your bridge service.

## Prerequisites
- ✅ Clover Merchant ID: `179188390993`
- ✅ Clover Access Token: (Once working)
- ✅ Server URL where your bridge is deployed

## Step 1: Deploy Your Bridge Service

Your bridge needs to be accessible via HTTPS from the internet. Options:

### Option A: Local Development (ngrok)
```bash
# Install ngrok
# Then expose your local server
ngrok http 4000

# Use the HTTPS URL provided by ngrok
# Example: https://abc123.ngrok.io
```

### Option B: Cloud Deployment
- Deploy to AWS, Heroku, DigitalOcean, etc.
- Ensure HTTPS is enabled
- Note your public URL

## Step 2: Configure Clover Webhook

### Webhook URL Format
```
https://your-server-url/webhooks/clover/orders
```

### Webhook Secret
1. Go to Clover Dashboard → Settings → Business operations → API tokens
2. Create or use existing webhook secret
3. Add to `.env` file:
   ```
   CLOVER_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Webhook Events to Subscribe
- `ORDER_CREATED`
- `ORDER_UPDATED`
- `ORDER`

## Step 3: Test Webhook

### Using cURL
```bash
curl -X POST https://your-server-url/webhooks/clover/orders \
  -H "Content-Type: application/json" \
  -H "x-clover-signature: your_signature" \
  -d '{
    "id": "test-event-id",
    "type": "ORDER_CREATED",
    "objectId": "test-order-id"
  }'
```

### Using Postman
1. Create POST request to your webhook URL
2. Add header: `x-clover-signature`
3. Send test payload

## Step 4: Verify Integration

1. Create a test order in Clover
2. Check your server logs for webhook receipt
3. Verify order appears in Lightspeed

## Troubleshooting

### Webhook not receiving events
- Verify webhook URL is accessible (test with curl)
- Check Clover dashboard for webhook delivery status
- Verify webhook secret matches

### 401 Unauthorized
- Check webhook signature validation
- Verify `CLOVER_WEBHOOK_SECRET` is correct

### Orders not appearing in Lightspeed
- Check server logs for errors
- Verify Lightspeed credentials
- Test Lightspeed connection separately

