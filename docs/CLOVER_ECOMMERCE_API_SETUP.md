# Clover E-commerce API Setup

## Important Discovery

Your Clover account has **E-commerce API** access (not REST API). This is important because:

### E-commerce API Capabilities:
✅ **Payment Processing** - Tokenization, checkout
✅ **Webhooks** - Receive order events
✅ **Authentication** - Private token works for E-commerce endpoints

### E-commerce API Limitations:
❌ **Cannot fetch orders** - E-commerce API doesn't support GET /orders
❌ **Cannot query orders** - No order retrieval endpoints
❌ **Order management** - Not available via E-commerce API

## Solution: Use Webhooks

Since E-commerce API can't fetch orders, we'll use **Clover webhooks** to receive order data:

1. **Webhook sends order data** when orders are created/updated
2. **No need to fetch** - order data comes in the webhook payload
3. **Real-time processing** - orders processed immediately

## Current Implementation

The code already supports webhooks! When a webhook arrives:

1. Webhook contains order event (ORDER_CREATED, ORDER_UPDATED)
2. Order data is included in the webhook payload
3. Order is processed and sent to Lightspeed

## Next Steps

1. ✅ **E-commerce API token configured** - Working!
2. ⏳ **Configure Clover webhooks** - Point to your server
3. ⏳ **Test webhook delivery** - Create test order in Clover
4. ⏳ **Verify integration** - Check orders appear in Lightspeed

## Webhook Configuration

See `docs/WEBHOOK_SETUP.md` for detailed webhook setup instructions.

## Testing

Since we can't fetch orders via API, test with:
1. Create a test order in Clover
2. Webhook should be sent to your server
3. Order should appear in Lightspeed

## Note

If you need to fetch historical orders or query orders, you'll need:
- REST API access (requires account upgrade from Clover)
- OR use webhooks going forward (recommended approach)

