# ☁️ Always-On Deployment Guide

Make your Clover ↔ Lightspeed bridge work 24/7, even when your laptop is off!

## ❌ The Problem with Localhost

- `http://localhost:4000` **only works when your laptop is on**
- Clover webhooks need a **public URL** that's always accessible
- OAuth redirects need a **public URL** for production

## ✅ Solution: Deploy to Cloud

Deploy your service to a cloud platform that runs 24/7.

---

## 🚀 Recommended Hosting Options

### Option 1: Railway (Easiest - Recommended for Beginners)

**Why**: Super simple, free tier, automatic HTTPS

1. **Sign up**: https://railway.app/
2. **Connect your GitHub repo** (or deploy from folder)
3. **Set environment variables** in Railway dashboard
4. **Deploy** - Railway automatically builds and runs your app
5. **Get your URL**: `https://your-app.railway.app`

**Free tier**: 500 hours/month (usually enough for one app)

**Update Clover settings:**
- OAuth Redirect URI: `https://your-app.railway.app/oauth/callback`
- Webhook URL: `https://your-app.railway.app/webhooks/clover/orders`

---

### Option 2: Render (Also Easy)

**Why**: Free tier, automatic HTTPS, easy setup

1. **Sign up**: https://render.com/
2. **Create a new "Web Service"**
3. **Connect your repo** or upload code
4. **Set environment variables**
5. **Deploy**

**Free tier**: Spins down after inactivity (wakes on request)

**Update Clover settings:**
- OAuth Redirect URI: `https://your-app.onrender.com/oauth/callback`
- Webhook URL: `https://your-app.onrender.com/webhooks/clover/orders`

---

### Option 3: Fly.io (Good Performance)

**Why**: Always-on free tier, good performance

1. **Sign up**: https://fly.io/
2. **Install flyctl CLI**
3. **Run**: `fly launch`
4. **Set secrets**: `fly secrets set CLOVER_APP_ID=...`

**Free tier**: 3 shared VMs, always-on

---

### Option 4: AWS/Google Cloud/Azure (Advanced)

**Why**: More control, better for production scale

- **AWS**: EC2, Elastic Beanstalk, or Lambda
- **Google Cloud**: Cloud Run or App Engine
- **Azure**: App Service

More complex setup but very reliable.

---

### Option 5: DigitalOcean App Platform

**Why**: Simple, reliable, good documentation

1. **Sign up**: https://www.digitalocean.com/
2. **Create App** from GitHub
3. **Configure environment variables**
4. **Deploy**

**Pricing**: Starts at $5/month

---

## 📋 Step-by-Step: Deploy to Railway (Recommended)

### Step 1: Prepare Your Code

Make sure your code is ready:
```bash
# Test locally first
npm run build
npm start
```

### Step 2: Create Railway Account

1. Go to https://railway.app/
2. Sign up with GitHub
3. Create a new project

### Step 3: Deploy Your App

**Option A: From GitHub**
1. Connect your GitHub repository
2. Railway auto-detects Node.js
3. Add environment variables
4. Deploy!

**Option B: From Local Folder**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

### Step 4: Set Environment Variables

In Railway dashboard, add all your `.env` variables:
- `CLOVER_APP_ID`
- `CLOVER_APP_SECRET`
- `CLOVER_ACCESS_TOKEN`
- `CLOVER_REFRESH_TOKEN`
- `CLOVER_MERCHANT_ID`
- `LIGHTSPEED_DOMAIN`
- `LIGHTSPEED_SHOP_ID`
- etc.

### Step 5: Get Your Public URL

Railway gives you a URL like: `https://your-app-name.up.railway.app`

### Step 6: Update Clover App Settings

#### Update OAuth Redirect URI:

1. Go to Clover Developer Dashboard
2. Open your app settings
3. Click **"REST Configuration"** (pencil icon)
4. Update **"Site URL"** to: `https://your-app.railway.app/oauth/callback`
5. Save

#### Update Webhook URL:

1. In your app settings, click **"Webhooks"** (pencil icon)
2. Add webhook URL: `https://your-app.railway.app/webhooks/clover/orders`
3. Select events: `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_PAID`
4. Copy the webhook secret
5. Add webhook secret to Railway environment variables as `CLOVER_WEBHOOK_SECRET`

### Step 7: Re-authorize OAuth (If Needed)

If you changed the redirect URI, you may need to:
1. Visit the new authorization URL
2. Get a new authorization code
3. Exchange for new tokens

---

## 🔄 Alternative: Use a Static Tunnel Service

If you want to keep running on your laptop but make it accessible:

### Cloudflare Tunnel (Free)

1. Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
2. Create tunnel: `cloudflared tunnel create my-tunnel`
3. Configure: Point to `localhost:4000`
4. Run: `cloudflared tunnel run my-tunnel`
5. Get URL: `https://your-tunnel.trycloudflare.com`

**Note**: Still requires your laptop to be on!

---

## 🐳 Using Docker on a VPS

If you have a VPS (like DigitalOcean Droplet):

### Step 1: Set Up VPS

1. Create a VPS (Ubuntu 22.04)
2. SSH into it
3. Install Docker: `curl -fsSL https://get.docker.com | sh`

### Step 2: Deploy

```bash
# Clone your repo
git clone your-repo-url
cd clover-lightspeed-bridge

# Create .env file
nano .env  # Add all your environment variables

# Build and run
docker-compose up -d

# Your app runs on: http://your-vps-ip:4000
```

### Step 3: Set Up Domain & HTTPS

Use Nginx + Let's Encrypt for HTTPS:
- Tutorial: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04

---

## 📝 Checklist for Production Deployment

- [ ] Deploy service to cloud platform
- [ ] Get public HTTPS URL
- [ ] Update Clover OAuth redirect URI to public URL
- [ ] Update Clover webhook URL to public URL
- [ ] Add all environment variables to cloud platform
- [ ] Test OAuth flow with new redirect URI
- [ ] Test webhook delivery
- [ ] Set up monitoring/logging
- [ ] Configure automatic restarts
- [ ] Set up backups for configuration

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git**
2. **Use platform secrets management** (Railway, Render, etc.)
3. **Enable HTTPS only** (most platforms do this automatically)
4. **Set up rate limiting** (already in your code)
5. **Monitor logs** for suspicious activity
6. **Rotate tokens periodically**

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Starts At | Always-On? |
|----------|-----------|----------------|------------|
| Railway | ✅ 500 hrs/month | $5/month | ✅ Yes |
| Render | ✅ (spins down) | $7/month | ⚠️ Sleeps |
| Fly.io | ✅ 3 VMs | Pay-as-you-go | ✅ Yes |
| DigitalOcean | ❌ | $5/month | ✅ Yes |
| AWS | ❌ | ~$10/month | ✅ Yes |

---

## 🆘 Quick Start Recommendation

**For beginners**: Use **Railway**
- Free tier available
- Easiest setup
- Automatic HTTPS
- Good documentation

**For always-on free**: Use **Fly.io**
- Always-on free tier
- Good performance
- Slightly more setup

---

## 📚 Next Steps

After deploying:

1. ✅ Test your deployment: `https://your-app.com/health`
2. ✅ Update Clover settings with new URLs
3. ✅ Re-authorize OAuth if redirect URI changed
4. ✅ Test webhook delivery
5. ✅ Monitor logs for any issues

Your integration will now work 24/7! 🎉

