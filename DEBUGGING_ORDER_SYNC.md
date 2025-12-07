# Debugging Order Sync Issues

## Recent Improvements

I've improved the webhook handler and error logging to help diagnose why orders aren't syncing to Lightspeed. Here's what changed:

### 1. Enhanced Logging
- **Detailed request logging**: All incoming webhook requests now log full headers, body structure, and diagnostic information
- **Better error messages**: Errors now include full stack traces, error details, and context
- **Processing tracking**: Each order processing step is logged with timing information

### 2. More Flexible Authentication
- **Development mode**: Webhooks are allowed through in development mode even without authentication headers
- **Better error messages**: Authentication failures now include diagnostic information
- **Warning for missing secrets**: Clear warnings when webhook secrets aren't configured

### 3. Improved Error Handling
- **Validation errors**: Webhook payload validation errors now return detailed information about what was expected vs received
- **Failed order tracking**: The webhook response now includes which orders failed and why
- **Partial success handling**: Returns HTTP 207 (Multi-Status) when some orders succeed and others fail

### 4. Diagnostic Endpoints
- **GET /webhooks/clover/orders**: Returns configuration status and endpoint information
- **POST /webhooks/clover/orders/test/:orderId**: Manual test endpoint (development only) to test order processing

## How to Debug Order Sync Issues

### Step 1: Check Railway Logs

1. Go to your Railway deployment logs
2. Look for these log messages:

**Good signs:**
- `"Received webhook request"` - Webhook is being received
- `"Processing Clover order event"` - Order events are being processed
- `"Order successfully forwarded to Lightspeed"` - Orders are syncing

**Warning signs:**
- `"No authentication headers present"` - Webhook might be blocked
- `"Invalid webhook payload structure"` - Webhook format might be wrong
- `"Failed to process order"` - Order processing is failing
- `"Order has no items"` - Order is invalid or incomplete
- `"Clover API error"` - Can't fetch order from Clover
- `"Lightspeed API error"` - Can't create sale in Lightspeed

### Step 2: Test Webhook Endpoint

Visit: `https://your-railway-url.up.railway.app/webhooks/clover/orders`

This should return configuration information showing:
- Whether Clover credentials are configured
- Whether Lightspeed credentials are configured
- Whether webhook secrets are configured

### Step 3: Check Configuration

Verify these environment variables are set in Railway:

**Required:**
- `CLOVER_MERCHANT_ID`
- `CLOVER_ACCESS_TOKEN` (or OAuth tokens)
- `LIGHTSPEED_SHOP_ID`
- `LIGHTSPEED_DOMAIN` (for X-Series) OR `LIGHTSPEED_ACCOUNT_ID` (for R-Series)
- `LIGHTSPEED_PERSONAL_TOKEN` (or OAuth tokens)

**Optional but recommended:**
- `CLOVER_WEBHOOK_SECRET` - For webhook authentication
- `LIGHTSPEED_EMPLOYEE_ID` - To associate sales with employees
- `LIGHTSPEED_REGISTER_ID` - To associate sales with registers

### Step 4: Test Manual Order Processing

If you have a specific order ID that didn't sync, you can test it manually:

```bash
# Set ENABLE_MANUAL_TEST_ENDPOINT=true in Railway environment variables first
curl -X POST https://your-railway-url.up.railway.app/webhooks/clover/orders/test/YOUR_ORDER_ID
```

This will attempt to process the order and return detailed error information.

### Step 5: Verify Webhook Configuration in Clover

1. Go to Clover Developer Dashboard
2. Navigate to your app's webhook configuration
3. Verify the webhook URL is set to: `https://your-railway-url.up.railway.app/webhooks/clover/orders`
4. Check that webhook events are subscribed to:
   - `ORDER_CREATED`
   - `ORDER_UPDATED`
   - Or similar order-related events

### Step 6: Check Common Issues

#### Issue: Webhooks Not Being Received

**Symptoms:**
- No `"Received webhook request"` logs in Railway
- No webhook events showing up

**Solutions:**
1. Verify webhook URL is correct and publicly accessible
2. Check Clover webhook configuration
3. Check if webhook secret is blocking requests (check authentication logs)

#### Issue: Webhook Authentication Failing

**Symptoms:**
- Logs show `"Invalid x-clover-auth header"` or `"Invalid Clover HMAC signature"`
- Webhook requests returning 401

**Solutions:**
1. Verify `CLOVER_WEBHOOK_SECRET` matches the secret configured in Clover
2. In development, webhooks can work without authentication (check logs)
3. Check that the webhook secret is correctly set in both Clover and Railway

#### Issue: Orders Not Processing

**Symptoms:**
- Webhooks received but `"Failed to process order"` errors
- `"Order has no items"` warnings
- `"Order total is zero or negative"` warnings

**Solutions:**
1. Check if orders have items and positive totals in Clover
2. Verify order data structure matches what the code expects
3. Check if order is already processed (duplicate detection)

#### Issue: Lightspeed API Errors

**Symptoms:**
- `"Lightspeed API error"` in logs
- Orders processed but not appearing in Lightspeed

**Solutions:**
1. Verify Lightspeed credentials are correct
2. Check `LIGHTSPEED_SHOP_ID` matches your Lightspeed shop
3. Verify Lightspeed API permissions allow creating sales
4. Check Lightspeed API logs for specific error messages

#### Issue: Clover API Errors

**Symptoms:**
- `"Clover API error"` in logs
- `"Order not found in Clover"` errors
- 403 permission errors

**Solutions:**
1. Verify Clover token has "Orders Read" permission
2. Check if token is expired (if using OAuth, it should auto-refresh)
3. Verify `CLOVER_MERCHANT_ID` is correct
4. For E-commerce API: Webhooks should include full order data, API fetch may not work

## Railway-Specific Troubleshooting

### Issue: Getting "Not Found" (404) on Railway

If you see Railway's "Not Found" page when accessing your endpoints:

1. **Check if the service is running:**
   - Go to Railway dashboard → Your service → Logs
   - Look for: `"Clover-Lightspeed bridge listening"` message
   - If you see errors during startup, the service may have crashed

2. **Verify the service is bound correctly:**
   - The service should bind to `0.0.0.0` (recent fix)
   - Check logs for: `"host": "0.0.0.0"` in the listening message

3. **Test the root endpoint:**
   - Visit: `https://your-railway-url.up.railway.app/`
   - Should return JSON with service info
   - If this fails, the service isn't running or accessible

4. **Test the health endpoint:**
   - Visit: `https://your-railway-url.up.railway.app/health`
   - Should return service health status

5. **Check Railway configuration:**
   - In Railway dashboard → Settings → Environment Variables
   - Verify `PORT` is set (Railway may auto-set this, but check if it's correct)
   - The service expects `PORT` environment variable or defaults to 4000

6. **Common Railway issues:**
   - **Service not deployed:** Make sure code is pushed to connected Git repo
   - **Build failed:** Check Railway build logs for TypeScript compilation errors
   - **Service crashed:** Check Railway logs for startup errors
   - **Wrong port:** Railway may set `PORT` automatically - service should use `process.env.PORT`

## Next Steps

1. **Deploy these changes** to Railway (includes binding fix for Railway)
2. **Check Railway logs** after deployment - should see service listening message
3. **Test root endpoint** (`/`) to verify service is accessible
4. **Test health endpoint** (`/health`) to verify configuration
5. **Test webhook endpoint** (`/webhooks/clover/orders`) with GET request
6. **Create a test order** in Clover and watch the logs
7. **Review the detailed error messages** to identify the specific issue
8. **Use the diagnostic endpoints** to verify configuration

## Still Having Issues?

If orders still aren't syncing after checking the above:

1. Share the relevant log entries from Railway (with any sensitive data redacted)
2. Include the webhook payload structure (from logs)
3. Share any specific error messages
4. Include the response from `/webhooks/clover/orders` GET endpoint

This will help identify the specific issue preventing orders from syncing.

