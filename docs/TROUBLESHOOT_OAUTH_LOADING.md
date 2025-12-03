# 🔧 Troubleshooting: Clover OAuth Page Keeps Loading

If the Clover authorization page keeps loading and doesn't go through, try these solutions:

## 🚨 Quick Fixes

### Fix 1: Check the Redirect URI

Make sure your redirect URI in the Clover app settings **exactly matches** what's in the authorization URL:

**In Clover Developer Dashboard:**
- Go to App Settings → REST Configuration
- Site URL should be: `http://localhost:4000/oauth/callback`

**In Authorization URL:**
- Should include: `redirect_uri=http://localhost:4000/oauth/callback`

**They must match EXACTLY!**

### Fix 2: Try a Different Browser

1. Close the current browser tab
2. Open a **different browser** (Chrome, Firefox, Edge)
3. Try the authorization URL again

### Fix 3: Clear Browser Cache

1. Clear your browser cache and cookies
2. Try the authorization URL again
3. Or use **Incognito/Private mode**

### Fix 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for any error messages
4. Check **Network** tab for failed requests

### Fix 5: Try the Authorization URL Again

Close the tab and visit this exact URL:

```
https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
```

### Fix 6: Check if You're Already Logged In

1. Open a new tab
2. Go to: https://www.clover.com/
3. Check if you're already logged in
4. If logged in to wrong account, log out and try again

### Fix 7: Verify App Permissions

In Clover Developer Dashboard:
1. Go to App Settings → Requested Permissions
2. Make sure these are enabled:
   - ✅ Orders: Read
   - ✅ Webhooks: Manage
   - ✅ Merchant: Read

---

## 🔄 Alternative: Use Different Redirect URI

If localhost keeps causing issues, try using a temporary public URL:

### Option A: Use ngrok (Temporary)

1. **Install ngrok**: https://ngrok.com/download
2. **Start your server** (in one terminal):
   ```bash
   npm run dev
   ```
3. **Start ngrok** (in another terminal):
   ```bash
   ngrok http 4000
   ```
4. **Copy the HTTPS URL** (like `https://abc123.ngrok.io`)
5. **Update Clover App Settings**:
   - REST Configuration → Site URL: `https://abc123.ngrok.io/oauth/callback`
6. **Use new authorization URL**:
   ```
   https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=https://abc123.ngrok.io/oauth/callback
   ```

### Option B: Use a Test Domain

Update redirect URI to use a placeholder that will work:
- Try: `https://httpbin.org/anything/oauth/callback`

---

## 🐛 Debug Steps

### Step 1: Check Network Connection

Make sure you can access:
- https://www.clover.com/
- https://dev.clover.com/

### Step 2: Check App Status

1. Go to Clover Developer Dashboard
2. Check if your app shows as **"Draft"** or has any warnings
3. Make sure app is saved

### Step 3: Try Incognito Mode

1. Open browser in **Incognito/Private mode**
2. Visit authorization URL
3. Log in fresh

### Step 4: Check for Popup Blockers

- Disable popup blockers
- Allow Clover.com in browser settings

---

## 🔍 What to Check

### In Browser:
- ✅ Browser console (F12) for errors
- ✅ Network tab for failed requests
- ✅ Cookies/cache cleared

### In Clover Dashboard:
- ✅ App ID is correct: `8GSC7031S26JY`
- ✅ Redirect URI matches exactly
- ✅ App permissions are set
- ✅ App is saved/active

---

## 💡 Alternative Approach

If authorization keeps failing, you might need to:

1. **Contact Clover Support**
   - Email: support@clover.com
   - Explain: "OAuth authorization page keeps loading, can't complete authorization"
   - Provide: App ID: `8GSC7031S26JY`

2. **Try Creating a New App**
   - Sometimes a fresh app works better
   - Follow the same setup steps

3. **Use Private Token** (Temporary)
   - While troubleshooting OAuth, you can use a private token
   - Less ideal but works for testing

---

## ✅ What Should Happen

When authorization works correctly:

1. ✅ Page loads authorization screen
2. ✅ Shows "Authorize Lightspeed Bridge" message
3. ✅ Click "Authorize" or "Allow"
4. ✅ Redirects to: `http://localhost:4000/oauth/callback?code=...`
5. ✅ Even if page shows error, code is in the URL

---

## 🆘 Still Stuck?

If nothing works:

1. **Screenshot the page** - What exactly do you see?
2. **Check browser console** - Any error messages?
3. **Try different browser** - Does it work in Firefox/Edge?
4. **Check network** - Can you access other Clover pages?

Let me know what you see and I can help more specifically!

