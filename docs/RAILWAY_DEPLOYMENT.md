# 🚂 Railway Deployment Guide - Step by Step

The easiest way to deploy your Clover ↔ Lightspeed bridge to run 24/7.

---

## ✅ Why Railway?

- **Free tier**: 500 hours/month (plenty for one app)
- **Automatic HTTPS**: No SSL certificate setup needed
- **Easy setup**: Connect GitHub, add env vars, deploy!
- **Always-on**: Runs continuously, even when your laptop is off
- **Simple dashboard**: Manage everything in one place

---

## 📋 Prerequisites

- [x] Your code is ready (you already have this!)
- [ ] A GitHub account (free - create at github.com if you don't have one)
- [ ] Your code pushed to GitHub (or you can deploy from folder)

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a repo on GitHub.com, then:
git remote add origin https://github.com/yourusername/clover-lightspeed-bridge.git
git branch -M main
git push -u origin main
```

**Note**: Make sure your `.env` file is in `.gitignore` (don't commit secrets!)

---

### Step 2: Sign Up for Railway

1. Go to **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Railway to access your GitHub repos

---

### Step 3: Deploy Your App

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `clover-lightspeed-bridge` repository
4. Railway will automatically:
   - Detect it's a Node.js project
   - Start building
   - Deploy your app

---

### Step 4: Configure Environment Variables

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Add all your environment variables:

```
CLOVER_APP_ID=8GSC7031S26JY
CLOVER_APP_SECRET=3de21706-142e-2abc-ab53-4e41e79bd0aa
CLOVER_ACCESS_TOKEN=your_access_token_here
CLOVER_REFRESH_TOKEN=your_refresh_token_here
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
CLOVER_WEBHOOK_SECRET=your_webhook_secret_here
LIGHTSPEED_DOMAIN=nutricentro.retail.lightspeed.app
LIGHTSPEED_SHOP_ID=06f24f8b-21fd-11ef-f4ca-922477100487
LIGHTSPEED_PERSONAL_TOKEN=your_lightspeed_token_here
NODE_ENV=production
PORT=4000
```

4. Click **"Add"** for each variable
5. Railway will automatically restart your app with new variables

---

### Step 5: Get Your Public URL

1. In Railway, go to **"Settings"** tab
2. Scroll down to **"Domains"**
3. Railway automatically gives you a domain like: `clover-lightspeed-bridge-production.up.railway.app`
4. **Copy this URL** - you'll need it!

**Or create a custom domain:**
- Click **"Generate Domain"** for a nicer URL
- Or add your own custom domain

---

### Step 6: Update Clover App Settings

Now update your Clover app to use the public URL:

#### Update OAuth Redirect URI:

1. Go to **Clover Developer Dashboard**: https://dev.clover.com/
2. Open your **"Lightspeed Bridge"** app
3. Click **"App Settings"**
4. Click the **pencil icon** ✏️ next to **"REST Configuration"**
5. Update **"Site URL"** to:
   ```
   https://your-app-name.up.railway.app/oauth/callback
   ```
   (Replace with your actual Railway URL)
6. Click **"Save"**

#### Update Webhook URL:

1. Still in your app settings, click the **pencil icon** ✏️ next to **"Webhooks"**
2. Add webhook URL:
   ```
   https://your-app-name.up.railway.app/webhooks/clover/orders
   ```
   (Replace with your actual Railway URL)
3. Select events:
   - ✅ `ORDER_CREATED`
   - ✅ `ORDER_UPDATED`
   - ✅ `ORDER_PAID`
4. **Copy the Webhook Secret**
5. Add the webhook secret to Railway environment variables as `CLOVER_WEBHOOK_SECRET`
6. Click **"Save"**

---

### Step 7: Test Your Deployment

1. Visit your Railway URL in a browser:
   ```
   https://your-app-name.up.railway.app/health
   ```
2. You should see a JSON response with health status
3. Check Railway logs for any errors

---

### Step 8: Re-authorize OAuth (If Redirect URI Changed)

Since you changed the redirect URI, you may need to:

1. Visit the authorization URL with the new redirect:
   ```
   https://www.clover.com/oauth/authorize?client_id=8GSC7031S26JY&response_type=code&redirect_uri=https://your-app-name.up.railway.app/oauth/callback
   ```
2. Authorize the app
3. Copy the authorization code from the redirect URL
4. Exchange it for new tokens
5. Update tokens in Railway environment variables

---

## 🔍 Monitoring & Logs

### View Logs in Railway:

1. Click on your service in Railway
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View **"Logs"** to see what's happening

### Health Checks:

Railway automatically monitors your app's health using the `/health` endpoint (already built into your app!)

---

## 🔄 Updating Your App

Whenever you push changes to GitHub:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Railway automatically**:
   - Detects the push
   - Builds your app
   - Deploys the update
   - Zero downtime!

---

## 💰 Pricing

### Free Tier:
- ✅ 500 hours of usage per month
- ✅ $5 credit per month
- ✅ Perfect for one app like this

### If You Need More:
- **Hobby Plan**: $5/month - unlimited usage
- **Pro Plan**: $20/month - more resources

**Your app will likely stay on the free tier!** 🎉

---

## 🆘 Troubleshooting

### App won't start?
- Check logs in Railway dashboard
- Verify all environment variables are set correctly
- Make sure `PORT=4000` is set (Railway sets this automatically)

### Webhooks not working?
- Verify webhook URL is correct in Clover settings
- Check Railway logs for incoming requests
- Ensure `CLOVER_WEBHOOK_SECRET` is set correctly

### 401 errors?
- Verify OAuth tokens are correct in Railway environment variables
- Check if tokens expired (need to re-authorize)

### Can't connect to Railway?
- Make sure Railway has access to your GitHub repo
- Check if repo is private (Railway can access private repos too)

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] App deployed on Railway
- [ ] All environment variables added
- [ ] Got public URL from Railway
- [ ] Updated Clover OAuth redirect URI
- [ ] Updated Clover webhook URL
- [ ] Added webhook secret to Railway
- [ ] Tested health endpoint
- [ ] Verified logs are working

---

## 🎯 Next Steps

After deployment:

1. ✅ Test webhook delivery from Clover
2. ✅ Create a test order in Clover
3. ✅ Verify it appears in Lightspeed
4. ✅ Monitor logs for any issues
5. ✅ Set up alerts (optional)

Your integration is now running 24/7! 🚀

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Support: support@railway.app

