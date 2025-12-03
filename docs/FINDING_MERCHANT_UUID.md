# Finding Your Clover Merchant UUID

## 🎯 Quick Answer

**The easiest way**: Just look at your Clover Dashboard URL!

Example: `http://www.clover.com/orders/m/QQ50HVC3HQZE1/orders/`

The merchantId is: **QQ50HVC3HQZE1**

✅ **Your NUTRICENTRO merchantId**: `QQ50HVC3HQZE1`

---

## ⚠️ IMPORTANT: MID vs UUID

You have **two different merchant identifiers** in Clover:

1. **MID (Merchant ID)** - Example: `179188390993`
   - This is a numeric value
   - This is what you see in your dashboard
   - ❌ **This does NOT work with the REST API**

2. **Merchant UUID** - Example: `ABC12DEF34567`
   - This is a 13-digit alphanumeric value
   - ✅ **This is what you need for API requests**

## 🔍 How to Find Your Merchant UUID

### Option 1: Merchant Dashboard URL (Easiest!)

1. Log in to your Clover Merchant Dashboard: https://www.clover.com/dashboard
2. Look at the URL in your browser's address bar
3. The URL will look like: `http://www.clover.com/home/m/88TJMM2T52WQ2/items`
4. **The merchantId is in the URL**: `88TJMM2T52WQ2` in this example

### Option 2: User Settings Page

1. Log in to your Clover Dashboard: https://www.clover.com/dashboard
2. Go to **Settings** → **About Your Business** section
3. Click **Merchants**
4. The **merchantId** displays below the merchant's name in the Merchant column
5. It's the 13-alphanumeric identifier (not the numeric MID)

### Option 3: On Your Clover Device

If you have a physical Clover device:
1. Go to **Diagnostics** → **Additional Details**
2. Look for **Clover ID**
3. This is your merchantId

### Option 4: API Call (If You Already Have OAuth Access)

Once you have OAuth tokens working, you can verify your merchantId via API:

```bash
curl https://api.clover.com/v3/merchants \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

This will return your merchant information including the UUID.

## 📝 Updating Your Configuration

Once you have your **Merchant UUID**, update your `.env` file:

```env
# Use the UUID, NOT the MID!
CLOVER_MERCHANT_ID=ABC12DEF34567  # <-- Your 13-digit alphanumeric UUID
```

## ✅ Verification

You'll know you have the right value when:
- It's **exactly 13 characters** long
- It contains **both letters AND numbers** (alphanumeric)
- It matches what you see in your Dashboard URL
- Example format: `88TJMM2T52WQ2`
- Your API calls start working! 🎉

## ❌ Common Mistakes

- ❌ Using the MID: `179188390993` (numeric only - this is NOT the merchantId)
- ✅ Using the merchantId (UUID): `88TJMM2T52WQ2` (13-character alphanumeric)

**Important**: The MID and merchantId are two different identifiers. The Clover REST API requires the **merchantId**, not the MID.

The MID is what you see everywhere in your dashboard, but the REST API requires the UUID. This is a common source of confusion!

## 🆘 Still Having Issues?

If you've updated to the UUID and still get 401 errors:
1. Double-check your OAuth tokens are correctly configured
2. Verify your app has the necessary permissions
3. Ensure you're using the token in the Authorization header: `Bearer YOUR_TOKEN`
4. Contact Clover support with both your MID and UUID for verification

## References

- [Clover: Locating Your Merchant ID](https://docs.clover.com/dev/docs/locating-merchant-id-1)
- [Clover REST API Documentation](https://docs.clover.com/reference)

