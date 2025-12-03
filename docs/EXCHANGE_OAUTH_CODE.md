# 🔑 Exchange OAuth Authorization Code for Tokens

After you authorize the app and get the authorization code from the redirect URL, use one of these methods to exchange it for tokens.

## Method 1: Use the Setup Script (Recommended)

If you have the authorization code:

1. Stop any running OAuth script (Ctrl+C)
2. Run:
   ```bash
   npm run setup:clover-oauth
   ```
3. When prompted:
   - **App ID**: Press Enter (or paste `8GSC7031S26JY`)
   - **App Secret**: Press Enter (or paste `3de21706-142e-2abc-ab53-4e41e79bd0aa`)
   - **Redirect URI**: Press Enter (accept default: `http://localhost:4000/oauth/callback`)
   - **Authorization code**: Paste your code from the redirect URL

The script will automatically exchange the code and save tokens to `.env`.

## Method 2: Use curl Command

Replace `YOUR_AUTHORIZATION_CODE_HERE` with the actual code from the redirect URL:

```bash
curl -X POST https://www.clover.com/oauth/token \
  -d "client_id=8GSC7031S26JY" \
  -d "client_secret=3de21706-142e-2abc-ab53-4e41e79bd0aa" \
  -d "code=YOUR_AUTHORIZATION_CODE_HERE" \
  -d "redirect_uri=http://localhost:4000/oauth/callback"
```

This will return JSON like:
```json
{
  "access_token": "your_access_token_here",
  "refresh_token": "your_refresh_token_here",
  "expires_in": 86400
}
```

Then manually add to your `.env` file.

## Method 3: Create a Quick Exchange Script

Save this as `exchange-token.js` in your project root:

```javascript
const axios = require('axios');

async function exchangeCode() {
  const code = process.argv[2]; // Get code from command line
  
  if (!code) {
    console.error('Please provide authorization code: node exchange-token.js YOUR_CODE');
    process.exit(1);
  }

  try {
    const response = await axios.post('https://www.clover.com/oauth/token', {
      client_id: '8GSC7031S26JY',
      client_secret: '3de21706-142e-2abc-ab53-4e41e79bd0aa',
      code: code,
      redirect_uri: 'http://localhost:4000/oauth/callback'
    });

    console.log('\n✅ Success! Tokens received:\n');
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
    console.log('Expires In:', response.data.expires_in, 'seconds\n');
    
    console.log('Add these to your .env file:');
    console.log(`CLOVER_ACCESS_TOKEN=${response.data.access_token}`);
    console.log(`CLOVER_REFRESH_TOKEN=${response.data.refresh_token}`);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

exchangeCode();
```

Run it with:
```bash
node exchange-token.js YOUR_AUTHORIZATION_CODE
```

## Your App Credentials (for reference)

- **App ID**: `8GSC7031S26JY`
- **App Secret**: `3de21706-142e-2abc-ab53-4e41e79bd0aa`
- **Redirect URI**: `http://localhost:4000/oauth/callback`

## What to Do Next

1. ✅ Visit the authorization URL (you already did this)
2. ⏳ Authorize the app in your browser
3. ⏳ Copy the `code` from the redirect URL
4. ⏳ Exchange the code for tokens (use one of the methods above)
5. ✅ Test the connection: `npm run test:clover`

