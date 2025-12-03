# Clover API Permissions Fix - 403 Error on Expanded Fields

## Problem

After fixing the token authentication issue, the application was successfully authenticating but failing with:

```
ERROR: Clover API error
  status: 403
  errorData: {
    "message": "Invalid permissions for expandable fields."
  }
```

## Root Cause

The code was requesting expanded order data from Clover API:
```
GET /orders/{orderId}?expand=lineItems,lineItems.modifierGroups,lineItems.modifications,lineItems.discounts,discounts
```

Your Clover access token **doesn't have permission** to access these expanded fields. This is common with:
- Private tokens (limited scope)
- Tokens created without full "Orders Read" permissions
- Tokens that need specific expandable field permissions

## Solution

Added a **graceful fallback mechanism** in `CloverService.fetchOrder()`:

### Flow:
1. **First attempt**: Try to fetch order WITH expanded fields (full data)
2. **If 403 error**: Catch permission error and retry WITHOUT expand parameter
3. **Log warning**: Notify that we're using basic data
4. **Continue processing**: Use whatever data we can get

### Code Changes:

```typescript
async fetchOrder(orderId: string): Promise<CloverOrder> {
  let order: any;
  let hasExpandedData = true;

  try {
    // Try fetching with expanded fields first
    const response = await withRetry(async () => {
      return await this.client.get(`/orders/${orderId}`, {
        params: {
          expand: "lineItems,lineItems.modifierGroups,lineItems.modifications,lineItems.discounts,discounts",
        },
      });
    }, { maxAttempts: 3, initialDelayMs: 1000 });
    
    order = response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    // If 403 permission error, try without expand
    if (axiosError.response?.status === 403) {
      logger.warn({ orderId }, "Token lacks permission for expanded fields, fetching basic order data");
      
      const basicResponse = await withRetry(async () => {
        return await this.client.get(`/orders/${orderId}`);
      }, { maxAttempts: 3, initialDelayMs: 1000 });
      
      order = basicResponse.data;
      hasExpandedData = false;
    } else {
      throw error;
    }
  }

  // Warn if using limited data
  if (!hasExpandedData) {
    logger.warn({ orderId, hasLineItems: !!order.lineItems }, 
      "Using basic order data - line items and details may be incomplete");
  }
  
  // ... continue processing with available data
}
```

## Benefits

✅ **Resilient**: Works with both full and limited token permissions  
✅ **Graceful degradation**: Uses best available data  
✅ **Clear logging**: Warns when using limited data  
✅ **No breaking changes**: Existing fully-permissioned tokens still get full data  

## What Data Is Affected?

With **basic order data** (403 fallback), you may have:
- ❌ **Limited line item details** (modifiers, modifications may be missing)
- ❌ **Incomplete discount information**
- ✅ **Basic order info** (ID, total, customer)
- ✅ **Order status and timestamps**

## Recommendations for Production

For **full order synchronization**, you should:

### Option 1: Request Expanded Permissions (Recommended)
1. Go to Clover Developer Dashboard
2. Edit your app/token permissions
3. Enable these permissions:
   - ✅ Orders Read (Full)
   - ✅ Read line items
   - ✅ Read modifiers
   - ✅ Read discounts
4. Generate a new token with expanded permissions

### Option 2: Use OAuth (Most Flexible)
- OAuth tokens have more granular permission control
- See `docs/CLOVER_OAUTH_SETUP.md` for setup instructions
- Already supported by the codebase

### Option 3: Use Webhook Payload (Alternative)
- If you're using Clover E-commerce API webhooks
- The order data may be included in the webhook payload
- No additional API call needed
- Falls back to API fetch if payload is incomplete

## Testing

To test if your token has expanded permissions:

```bash
# Test locally
npm run test:clover

# Check logs in Railway
# Should see either:
#   - Successful order fetch (full permissions)
#   - Warning about basic data (limited permissions)
```

## Current Status

- ✅ **Deployed**: Commit `bc41728` pushed to GitHub
- ✅ **Railway**: Auto-deploying with fix
- ⚠️ **Permissions**: Currently using fallback mode (basic data)
- 📝 **Next Step**: Request expanded permissions for full order sync

## Impact on Lightspeed Sync

The order will still sync to Lightspeed, but:
- Line items may have simplified data
- Modifiers/customizations might not be captured
- Discounts may be incomplete

**For production use**, upgrading token permissions is **highly recommended**.

## Logs You'll See

### With Full Permissions:
```
INFO: Fetching order from Clover API
INFO: Order processed successfully
```

### With Limited Permissions (Current):
```
INFO: Fetching order from Clover API
WARN: Token lacks permission for expanded fields, fetching basic order data
WARN: Using basic order data - line items and details may be incomplete
INFO: Order processed successfully
```

