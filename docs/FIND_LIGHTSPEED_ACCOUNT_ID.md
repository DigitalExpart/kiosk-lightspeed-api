# How to Find Your Lightspeed Account ID

Based on Lightspeed support guidance, here are the methods to find your Account ID:

## Method 1: From Dashboard URL (Easiest)

1. **Log into Lightspeed Retail Dashboard**
2. **Navigate to any account-level page**, such as:
   - Settings → Account
   - Setup → Outlets
   - Reports → Sales
3. **Look at the URL bar** - the Account ID will be in the URL
4. **URL Format**: 
   ```
   https://...lightspeedapp.com/.../Account/{ACCOUNT_ID}/...
   ```
   The Account ID is the part between `/Account/` and the next `/`

## Method 2: From Outlets Page

1. Go to **Setup → Outlets and register**
2. Select any outlet
3. Check the URL - Account ID will be visible there

## Method 3: From Customer/Sales Page

1. Go to **Customers** or **Sales** section
2. View any customer or sale
3. Check the URL bar for the Account ID

## Method 4: Contact Lightspeed Support

If you can't find it in the URL:
- Contact Lightspeed support
- Request: "I need my Account ID for API integration"
- They can confirm after identity verification

## What We Need

**Account ID** (not Customer ID or Outlet ID)
- Used in API calls: `https://api.lightspeedapp.com/API/Account/{ACCOUNT_ID}/...`
- Different from Shop ID (which you already have: `06f24f8b-21fd-11ef-f4ca-922477100487`)

## Once You Have It

Add to your `.env` file:
```
LIGHTSPEED_ACCOUNT_ID=your_account_id_here
```

Then test:
```bash
npm run test:lightspeed
```

