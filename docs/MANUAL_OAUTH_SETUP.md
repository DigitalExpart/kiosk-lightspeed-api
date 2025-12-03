# 🔧 Manual OAuth Setup - Complete Guide

Complete the Clover OAuth setup manually without scripts.

## Your App Credentials
- **App ID**: `8GSC7031S26JY`
- **App Secret**: `3de21706-142e-2abc-ab53-4e41e79bd0aa`
- **Redirect URI**: `http://localhost:4000/oauth/callback`
- **Merchant ID**: `QQ50HVC3HQZE1`

---

## Step 1: Authorize the App

### 1.1. Visit the Authorization URL

Open this URL in your browser:
```
https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
```

### 1.2. Log In and Authorize

1. Log in with your Clover merchant account credentials
2. Click "Authorize" or "Allow" to grant access
3. You'll be redirected to: `http://localhost:4000/oauth/callback?code=AUTHORIZATION_CODE`

### 1.3. Get the Authorization Code

**Important**: Even if you see "Connection refused" or "This site can't be reached", **look at the URL in your browser's address bar**.

Copy everything after `code=` in the URL. For example:
- URL: `http://localhost:4000/oauth/callback?code=abc123xyz456`
- **Code**: `abc123xyz456`

---

## Step 2: Exchange Code for Tokens

Choose one of these methods to exchange your authorization code for access tokens:

### Method A: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
$body = @{
    client_id = "8GSC7031S26JY"
    client_secret = "3de21706-142e-2abc-ab53-4e41e79bd0aa"
    code = "YOUR_AUTHORIZATION_CODE_HERE"
    redirect_uri = "http://localhost:4000/oauth/callback"
}

$response = Invoke-RestMethod -Uri "https://api.clover.com/oauth/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

Write-Host "Access Token: $($response.access_token)"
Write-Host "Refresh Token: $($response.refresh_token)"
Write-Host "Expires In: $($response.expires_in) seconds"
```

**Replace `YOUR_AUTHORIZATION_CODE_HERE` with your actual code from Step 1.3**

### Method B: Using curl Command

Open your terminal (PowerShell, Command Prompt, or Git Bash) and run:

```bash
curl -X POST https://api.clover.com/oauth/token \
  -d "client_id=8GSC7031S26JY" \
  -d "client_secret=3de21706-142e-2abc-ab53-4e41e79bd0aa" \
  -d "code=YOUR_AUTHORIZATION_CODE_HERE" \
  -d "redirect_uri=http://localhost:4000/oauth/callback"
```

**Replace `YOUR_AUTHORIZATION_CODE_HERE` with your actual code from Step 1.3**

### Method C: Using a Browser Extension or Online Tool

You can also use tools like:
- **Postman** - Create a POST request
- **Insomnia** - Create a POST request
- **Online REST clients** - Like https://reqbin.com/

**Request Details:**
- **URL**: `https://api.clover.com/oauth/token`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Body** (form data):
  - `client_id`: `8GSC7031S26JY`
  - `client_secret`: `3de21706-142e-2abc-ab53-4e41e79bd0aa`
  - `code`: `YOUR_AUTHORIZATION_CODE_HERE`
  - `redirect_uri`: `http://localhost:4000/oauth/callback`

---

## Step 3: Get Your Tokens

After running one of the methods above, you'll receive a JSON response like this:

```json
{
  "access_token": "02679544-ea68-4224-200b-baf959b36090",
  "refresh_token": "refresh_token_here",
  "expires_in": 86400,
  "token_type": "bearer"
}
```

**Save these values:**
- `access_token` - Your OAuth access token
- `refresh_token` - Used to refresh your access token when it expires

---

## Step 4: Update Your .env File

Open your `.env` file and add/update these lines:

```env
# Clover OAuth (from Developer Dashboard)
CLOVER_APP_ID=8GSC7031S26JY
CLOVER_APP_SECRET=3de21706-142e-2abc-ab53-4e41e79bd0aa
CLOVER_ACCESS_TOKEN=your_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here

# Clover Merchant
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
```

**Replace:**
- `your_access_token_here` with the `access_token` from Step 3
- `your_refresh_token_here` with the `refresh_token` from Step 3

---

## Step 5: Test Your Connection

Run the test script to verify everything is working:

```bash
npm run test:clover
```

✅ **If successful**, you'll see order data from Clover!

❌ **If you get errors**, check:
- All tokens are correctly pasted in `.env`
- No extra spaces or quotes around the values
- The authorization code was fresh (they expire quickly)

---

## Troubleshooting

### "Invalid authorization code" error
- Authorization codes expire quickly (usually within a few minutes)
- Get a fresh code by repeating Step 1

### "Invalid redirect URI" error
- Make sure the redirect URI matches exactly: `http://localhost:4000/oauth/callback`
- Check your app settings in Developer Dashboard

### "Unauthorized" or "Invalid client" error
- Verify your App ID and App Secret are correct
- Check that you're using the right app credentials

### Connection refused after authorization
- **This is normal!** The callback URL points to localhost which isn't running
- Just copy the `code` from the URL before the error page loads

---

## Quick Reference

### Authorization URL
```
https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
```

### Token Exchange Endpoint
```
POST https://api.clover.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=8GSC7031S26JY
client_secret=3de21706-142e-2abc-ab53-4e41e79bd0aa
code=YOUR_CODE
redirect_uri=http://localhost:4000/oauth/callback
```

---

## What's Next?

After you have tokens in your `.env` file:
1. ✅ Test the connection: `npm run test:clover`
2. ⏳ Configure webhooks (we'll do this later)
3. ⏳ Start the server: `npm run dev`
4. ⏳ Test end-to-end integration

