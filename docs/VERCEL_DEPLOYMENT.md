# ⚡ Vercel Deployment Guide

Deploy your Clover ↔ Lightspeed bridge to Vercel for free serverless hosting.

---

## ✅ Why Vercel?

- **Free tier**: Generous free tier for serverless functions
- **Automatic HTTPS**: SSL certificates included
- **Easy setup**: Connect GitHub, deploy automatically
- **Global CDN**: Fast response times worldwide
- **Automatic deployments**: Deploys on every git push
- **Serverless**: Scales automatically, pay only for what you use

---

## 📋 Prerequisites

- [x] Your code is ready (you already have this!)
- [ ] A GitHub account (free - create at github.com if you don't have one)
- [ ] Your code pushed to GitHub
- [ ] A Vercel account (free - sign up at vercel.com)

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

### Step 2: Sign Up for Vercel

1. Go to **https://vercel.com/**
2. Click **"Sign Up"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Vercel to access your GitHub repos

---

### Step 3: Deploy Your App

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Import your `clover-lightspeed-bridge` repository
3. Vercel will automatically:
   - Detect it's a Node.js project
   - Detect the `vercel.json` configuration
   - Start building
   - Deploy your app

**Configuration Settings:**
- **Framework Preset**: Other (or leave as auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: Leave empty (Vercel handles it)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

---

### Step 4: Configure Environment Variables

1. In your project settings, go to **"Settings"** → **"Environment Variables"**
2. Add all your environment variables:

```
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ACCESS_TOKEN=your_access_token
CLOVER_REFRESH_TOKEN=your_refresh_token
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_WEBHOOK_SECRET=your_webhook_secret
LIGHTSPEED_DOMAIN=your_domain.retail.lightspeed.app
LIGHTSPEED_SHOP_ID=your_shop_id
LIGHTSPEED_PERSONAL_TOKEN=your_lightspeed_token
NODE_ENV=production
```

3. Make sure to select **"Production"**, **"Preview"**, and **"Development"** environments
4. Click **"Save"** for each variable
5. Vercel will automatically redeploy with new variables

---

### Step 5: Get Your Public URL

1. After deployment, Vercel automatically gives you a URL like:
   - `clover-lightspeed-bridge.vercel.app`
   - Or a custom domain if you set one up

2. **Copy this URL** - you'll need it!

**To add a custom domain:**
- Go to **"Settings"** → **"Domains"**
- Add your custom domain
- Follow DNS configuration instructions

---

### Step 6: Update Clover App Settings

Now update your Clover app to use the Vercel URL:

#### Update OAuth Redirect URI:

1. Go to **Clover Developer Dashboard**: https://dev.clover.com/
2. Open your **"Lightspeed Bridge"** app
3. Click **"App Settings"**
4. Click the **pencil icon** ✏️ next to **"REST Configuration"**
5. Update **"Site URL"** to:
   ```
   https://your-app-name.vercel.app/oauth/callback
   ```
   (Replace with your actual Vercel URL)
6. Click **"Save"**

#### Update Webhook URL:

1. Still in your app settings, click the **pencil icon** ✏️ next to **"Webhooks"**
2. Add webhook URL:
   ```
   https://your-app-name.vercel.app/webhooks/clover/orders
   ```
   (Replace with your actual Vercel URL)
3. Select events:
   - ✅ `ORDER_CREATED`
   - ✅ `ORDER_UPDATED`
   - ✅ `ORDER_PAID`
4. **Copy the Webhook Secret**
5. Add the webhook secret to Vercel environment variables as `CLOVER_WEBHOOK_SECRET`
6. Click **"Save"**

---

### Step 7: Test Your Deployment

1. Visit your Vercel URL in a browser:
   ```
   https://your-app-name.vercel.app/health
   ```
2. You should see a JSON response with health status
3. Check Vercel logs for any errors:
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - View **"Logs"** or **"Function Logs"**

---

### Step 8: Re-authorize OAuth (If Redirect URI Changed)

Since you changed the redirect URI, you may need to:

1. Visit the authorization URL with the new redirect:
   ```
   https://www.clover.com/oauth/authorize?client_id=YOUR_APP_ID&response_type=code&redirect_uri=https://your-app-name.vercel.app/oauth/callback
   ```
2. Authorize the app
3. Copy the authorization code from the redirect URL
4. Exchange it for new tokens
5. Update tokens in Vercel environment variables

---

## 🔍 Monitoring & Logs

### View Logs in Vercel:

1. Click on your project in Vercel dashboard
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View **"Function Logs"** to see what's happening
5. Or use **"Logs"** tab for real-time logs

### Health Checks:

Your app includes a `/health` endpoint that Vercel can monitor:
- Visit: `https://your-app-name.vercel.app/health`
- Should return JSON with health status

---

## 🔄 Updating Your App

Whenever you push changes to GitHub:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Vercel automatically**:
   - Detects the push
   - Builds your app
   - Deploys the update
   - Creates a preview deployment for pull requests

---

## 💰 Pricing

### Free Tier:
- ✅ 100GB bandwidth per month
- ✅ 100 serverless function executions per day
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN

### If You Need More:
- **Pro Plan**: $20/month - More bandwidth and function executions
- **Enterprise**: Custom pricing for high-scale usage

**Your app will likely stay on the free tier!** 🎉

---

## ⚠️ Important Notes

### Serverless Function Limits:
- **Execution Time**: 10 seconds (Hobby), 60 seconds (Pro)
- **Memory**: 1024 MB (Hobby), up to 3008 MB (Pro)
- **Cold Starts**: First request after inactivity may be slower (~1-2 seconds)

### For Long-Running Processes:
- The worker component (`src/worker.ts`) for SQS queue processing may not work well on Vercel
- Consider using AWS Lambda or a separate service for queue workers
- The main webhook handler should work fine

---

## 🆘 Troubleshooting

### App won't start?
- Check logs in Vercel dashboard
- Verify all environment variables are set correctly
- Make sure `NODE_ENV=production` is set

### Webhooks not working?
- Verify webhook URL is correct in Clover settings
- Check Vercel function logs for incoming requests
- Ensure `CLOVER_WEBHOOK_SECRET` is set correctly
- Check that the function isn't timing out (10s limit on free tier)

### 401 errors?
- Verify OAuth tokens are correct in Vercel environment variables
- Check if tokens expired (need to re-authorize)
- Ensure tokens are set for the correct environment (Production)

### Function timeout?
- Free tier has 10-second execution limit
- If processing takes longer, consider:
  - Using the queue service (AWS SQS)
  - Upgrading to Pro plan (60-second limit)
  - Optimizing your code

### Cold start delays?
- First request after inactivity may be slower
- This is normal for serverless functions
- Subsequent requests will be fast

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] App deployed on Vercel
- [ ] All environment variables added
- [ ] Got public URL from Vercel
- [ ] Updated Clover OAuth redirect URI
- [ ] Updated Clover webhook URL
- [ ] Added webhook secret to Vercel
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

Your integration is now running on Vercel! 🚀

---

## 📚 Additional Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Support: https://vercel.com/support

---

## 🔄 Migration from Other Platforms

If you're migrating from Railway or another platform:

1. Update your Clover webhook URL to the new Vercel URL
2. Update your Clover OAuth redirect URI
3. Copy all environment variables to Vercel
4. Test thoroughly before removing the old deployment
