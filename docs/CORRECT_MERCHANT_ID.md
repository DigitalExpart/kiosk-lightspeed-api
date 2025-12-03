# ✅ Correct Clover Merchant Configuration

## Your NUTRICENTRO Merchant Details

### ✅ Correct Merchant UUID (merchantId)
```
QQ50HVC3HQZE1
```

### ❌ DO NOT USE: MID (Numeric Merchant ID)
```
179188390993  ← This is the MID, NOT the merchantId!
```

---

## 📝 Update Your .env File

Make sure your `.env` file has this:

```env
# Clover Merchant UUID (13-character alphanumeric)
CLOVER_MERCHANT_ID=QQ50HVC3HQZE1
```

## ✅ How We Found It

From your Clover Dashboard URL:
```
https://www.clover.com/orders/m/QQ50HVC3HQZE1/orders/...
                              └─────────────┘
                              Your merchantId
```

## 🎯 Why This Matters

The Clover REST API requires the **merchantId** (UUID), not the MID:

- ✅ **merchantId**: `QQ50HVC3HQZE1` - 13-character alphanumeric UUID
- ❌ **MID**: `179188390993` - Numeric identifier (won't work with API)

This was the root cause of your 401 Unauthorized errors!

## 🚀 Next Steps

1. **Update `.env`** with the correct merchantId: `QQ50HVC3HQZE1`
2. **Restart your application**
3. **Test the connection**: `npm run test:clover`
4. Your API calls should now work! 🎉

---

**Reference**: [Clover Documentation - Locating Merchant ID](https://docs.clover.com/dev/docs/locating-merchant-id-1)

