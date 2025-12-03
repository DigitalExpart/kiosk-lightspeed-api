# 📝 Clover App Draft Status & OAuth

## Your App Status: Draft

Your "Lightspeed Bridge" app shows **"Draft"** status. This might be why OAuth authorization is loading.

---

## ✅ Good News: Draft Apps Can Usually Use OAuth

For **private apps** (like yours), OAuth authorization typically works even in Draft status. However, there can be restrictions.

---

## 🔍 What to Try

### Option 1: Try Authorizing in Sandbox Mode

Since you're in **Sandbox Environment**, make sure:

1. **You're logged into the Sandbox environment** when authorizing
2. **Use sandbox authorization URL** if available
3. Try this URL (sandbox-specific):
   ```
   https://sandbox.dev.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=http://localhost:4000/oauth/callback
   ```

### Option 2: Check App Settings for "Test" or "Development" Mode

Some apps need to be enabled for testing:

1. Go to your app → **App Settings**
2. Look for **"Test Mode"** or **"Development Mode"** toggle
3. Enable it if available
4. Save settings

### Option 3: Try the Direct Authorization Link

In your Clover Developer Dashboard:

1. Click on your "Lightspeed Bridge" app
2. Look for an **"Authorize"** or **"Install"** button
3. Click it directly from the dashboard
4. This might work better than the manual URL

### Option 4: Verify All Required Fields Are Set

Make sure your app has all required information:

- ✅ App Name: Set
- ✅ Description: Set
- ✅ Redirect URI: `http://localhost:4000/oauth/callback`
- ✅ Permissions: Orders Read, Webhooks Manage, Merchant Read
- ✅ REST Configuration: Site URL configured

---

## ⚠️ If Draft Status Is the Problem

### For Private Apps:

Clover typically allows OAuth for private apps in Draft status. However, if authorization keeps failing:

### Option A: Contact Clover Support

Email Clover Developer Support:
- **Subject**: "OAuth authorization not working for Draft private app"
- **Message**: 
  ```
  I have a private app in Draft status (App ID: 8GSC7031S26JY, Name: Lightspeed Bridge).
  The OAuth authorization page keeps loading and won't complete.
  Can Draft status private apps use OAuth, or do I need to publish?
  
  Merchant ID: QQ50HVC3HQZE1
  ```

### Option B: Check if There's a "Request Approval" or "Submit" Button

Some developer dashboards require you to:
1. Fill out all required fields
2. Click "Request Approval" or "Submit for Review"
3. Even for private apps, sometimes this activates them

Look for any **"Submit"**, **"Request Approval"**, or **"Publish"** buttons in your app settings.

---

## 🔄 Alternative: Use Private Token Temporarily

While troubleshooting OAuth, you can use your existing private token for testing:

Your `.env` file shows you have:
```
CLOVER_ACCESS_TOKEN=02679544-ea68-4224-200b-baf959b36090
```

This might work for basic API calls while we figure out OAuth.

---

## 🎯 Recommended Next Steps

1. **First, try the direct authorization from dashboard** (Option 3 above)
2. **Check browser console** (F12) for any error messages
3. **Try sandbox-specific URL** if available
4. **If still stuck**, contact Clover support about Draft status and OAuth

---

## 📧 Clover Support Contacts

- **Developer Support**: Check Clover Developer Dashboard for support link
- **Email**: developer-support@clover.com or support@clover.com
- **Include**: App ID `8GSC7031S26JY`, Merchant ID `QQ50HVC3HQZE1`

---

## 💡 Quick Test

Try clicking the three dots menu (⋮) next to your app in the dashboard:
- See if there's an **"Authorize"**, **"Test"**, or **"Enable"** option

This might bypass the manual OAuth flow and work better!

