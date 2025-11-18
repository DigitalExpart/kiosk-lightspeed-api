# How to Find Your Lightspeed Account ID

## Method 1: Lightspeed Dashboard
1. Log in to your Lightspeed Retail account
2. Go to **Settings** → **Account** or **Company Settings**
3. Look for **Account ID** or **Company ID**
4. It's usually a numeric value or UUID

## Method 2: API Response
If you can make API calls, the Account ID is often in the response headers or account information.

## Method 3: Lightspeed Support
Contact Lightspeed support and ask for your Account ID.

## Add to .env
Once you have it, add to your `.env` file:
```
LIGHTSPEED_ACCOUNT_ID=your_account_id_here
```

## Test
After adding, test the connection:
```bash
npm run test:lightspeed
```

