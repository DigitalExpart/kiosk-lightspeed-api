# ⚡ Quick Guide: Exchange Authorization Code

## Step 1: Get the Authorization Code

After authorizing the app, you'll be redirected to:
```
http://localhost:4000/oauth/callback?code=YOUR_CODE_HERE
```

**Copy the entire code value** (everything after `code=`)

## Step 2: Exchange Code for Tokens

Run this command (replace `YOUR_CODE` with your actual code):

```bash
ts-node exchange-code.ts YOUR_CODE
```

Or if you prefer, run the full setup script again:

```bash
npm run setup:clover-oauth
```

When prompted:
- App ID: Press Enter (already in .env)
- App Secret: Press Enter (already in .env)  
- Redirect URI: Press Enter (accept default)
- **Authorization code**: Paste your code here

## Step 3: Add Tokens to .env

After running the script, it will show you the tokens. Add them to your `.env` file:

```env
CLOVER_ACCESS_TOKEN=your_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here
```

## Step 4: Test Connection

```bash
npm run test:clover
```

---

## Example

If your redirect URL is:
```
http://localhost:4000/oauth/callback?code=abc123xyz456
```

Then your code is: `abc123xyz456`

Run:
```bash
ts-node exchange-code.ts abc123xyz456
```

