# How to Get Clover Access Token

## Option 1: Clover Merchant Dashboard
1. Go to: https://www.clover.com/
2. Sign in with your merchant account
3. Navigate to: **Settings** → **Developer** → **API Access**
4. Generate or copy your API token

## Option 2: Clover POS Device
1. On your Clover device, go to **Settings**
2. Look for **Developer** or **API** section
3. Generate access token

## Option 3: Contact Clover Support
- Email: support@clover.com
- Phone: Check your Clover account for support number
- Ask for: "API access token for merchant ID 179188390993"

## Option 4: Clover Developer Portal (Alternative URLs)
Try these URLs if dev.clover.com doesn't work:
- https://developer.clover.com/
- https://docs.clover.com/
- https://www.clover.com/developers

## Once You Have the Token
1. Add it to your `.env` file:
   ```
   CLOVER_ACCESS_TOKEN=your_token_here
   ```

2. Test the connection:
   ```bash
   npm run test:clover
   ```

