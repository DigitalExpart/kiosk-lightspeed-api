# 🔧 Manual OAuth Setup Steps (If Script Has Issues)

If the OAuth setup script has issues with the redirect URI, you can manually complete the OAuth flow.

## Your App Credentials
- **App ID**: `8GSC7031S26JY`
- **App Secret**: `3de21706-142e-2abc-ab53-4e41e79bd0aa`
- **Redirect URI**: `http://localhost:4000/oauth/callback`

## Step 1: Create Authorization URL

Visit this URL in your browser (replace the redirect URI with the correct one):

```
https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
```

Or use this direct link:
```
https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Foauth%2Fcallback
```

## Step 2: Authorize the App

1. Log in with your Clover credentials
2. Click "Authorize" or "Allow"
3. You'll be redirected to: `http://localhost:4000/oauth/callback?code=AUTHORIZATION_CODE`

**Important**: The page might show "Connection refused" or "This site can't be reached" - that's OK! We just need the `code` parameter from the URL.

## Step 3: Get the Authorization Code

Look at the URL in your browser's address bar. It will look like:

```
http://localhost:4000/oauth/callback?code=ABC123XYZ789...
```

Copy everything after `code=` - that's your authorization code.

## Step 4: Exchange Code for Tokens

You can use a simple script or tool to exchange the code for tokens. The script at `scripts/setup-clover-oauth.ts` should handle this, or you can use curl:

```bash
curl -X POST https://www.clover.com/oauth/token \
  -d "client_id=8GSC7031S26JY" \
  -d "client_secret=3de21706-142e-2abc-ab53-4e41e79bd0aa" \
  -d "code=YOUR_AUTHORIZATION_CODE_HERE" \
  -d "redirect_uri=http://localhost:4000/oauth/callback"
```

This will return JSON with `access_token` and `refresh_token`.

## Step 5: Save to .env

Add these to your `.env` file:

```env
CLOVER_APP_ID=8GSC7031S26JY
CLOVER_APP_SECRET=3de21706-142e-2abc-ab53-4e41e79bd0aa
CLOVER_ACCESS_TOKEN=your_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
```

## Troubleshooting

### Page keeps loading after login
- Check the redirect URI in the URL - it must be exactly: `http://localhost:4000/oauth/callback`
- Make sure you've saved the REST Configuration in your Clover app settings

### "Connection refused" after authorization
- This is normal! The callback URL points to localhost, which isn't running yet
- Just copy the `code` parameter from the URL before the error page loads

### Invalid redirect URI error
- Make sure the redirect URI in the authorization URL matches exactly what's in your app settings
- Both should be: `http://localhost:4000/oauth/callback`

