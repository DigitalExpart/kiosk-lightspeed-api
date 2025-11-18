# Lightspeed X-Series Configuration

## Overview
You are using **Lightspeed X-Series**, which uses **domain-based URLs** instead of Account IDs.

## Configuration

### Domain Format
Your domain is: `nutricentro.retail.lightspeed.app`

### Environment Variable
Add to your `.env` file:
```
LIGHTSPEED_DOMAIN=nutricentro.retail.lightspeed.app
```

**Note**: Do NOT set `LIGHTSPEED_ACCOUNT_ID` - that's only for R-Series.

## API Base URL
X-Series uses:
```
https://nutricentro.retail.lightspeed.app/API
```

Instead of R-Series format:
```
https://api.lightspeedapp.com/API/Account/{ACCOUNT_ID}
```

## Testing
Test your connection:
```bash
npm run test:lightspeed
```

## Differences from R-Series

| Feature | X-Series | R-Series |
|---------|----------|----------|
| Configuration | `LIGHTSPEED_DOMAIN` | `LIGHTSPEED_ACCOUNT_ID` |
| Base URL | `https://{domain}/API` | `https://api.lightspeedapp.com/API/Account/{id}` |
| Account ID | Not used | Required |

## Current Status
✅ X-Series support implemented
✅ Domain configured: `nutricentro.retail.lightspeed.app`
✅ API connection tested and working

