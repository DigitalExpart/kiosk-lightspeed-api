# Setup Checklist

## ✅ Completed
- [x] Project structure and code implementation
- [x] Clover Merchant ID configured: `179188390993`
- [x] Clover API token created: `138509a1-8832-06de-f6ec-5f15784d489c`
- [x] Lightspeed Personal Token configured
- [x] Lightspeed Shop ID configured: `06f24f8b-21fd-11ef-f4ca-922477100487`
- [x] Testing infrastructure set up
- [x] CI/CD pipeline configured
- [x] Docker support added

## ⚠️ In Progress
- [ ] Clover API token authentication (401 error - needs Clover support)
- [ ] Lightspeed Account ID (needs to be added to .env)

## 📋 Remaining Steps

### 1. Resolve Clover Token Issue
- [ ] Contact Clover support about 401 Unauthorized
- [ ] Verify token is for "REST API" not "Ecommerce API"
- [ ] Confirm token is activated/enabled
- [ ] Test connection: `npm run test:clover`

### 2. Complete Lightspeed Configuration
- [ ] Get Lightspeed Account ID from dashboard
- [ ] Add to `.env`: `LIGHTSPEED_ACCOUNT_ID=your_account_id`
- [ ] Test connection: `npm run test:lightspeed`

### 3. Webhook Configuration
- [ ] Deploy service to public URL (or use ngrok for testing)
- [ ] Configure Clover webhook to point to your server
- [ ] Set webhook secret in `.env`
- [ ] Test webhook with sample order

### 4. Final Testing
- [ ] Create test order in Clover
- [ ] Verify order appears in Lightspeed
- [ ] Check logs for any errors
- [ ] Monitor for duplicate orders

## Quick Commands

```bash
# Test Clover connection
npm run test:clover

# Test Lightspeed connection
npm run test:lightspeed

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## Support Contacts

### Clover Support
- Email: support@clover.com
- Issue: API token returning 401 Unauthorized
- Merchant ID: 179188390993

### Lightspeed Support
- Check Lightspeed dashboard for support contact
- Issue: Need Account ID or API access

