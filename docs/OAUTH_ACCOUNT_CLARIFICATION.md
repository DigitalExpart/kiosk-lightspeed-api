# 🔑 Clover Account Types - Which One to Use?

## Two Different Accounts

### 1. Developer Account
- **Purpose**: Create and manage apps in the Developer Dashboard
- **Where**: https://dev.clover.com/
- **Used for**: Creating apps, getting App ID/Secret, configuring permissions
- **Status**: ✅ You already used this to create your app

### 2. Merchant Account (Business Account)
- **Purpose**: Your actual Clover business/POS account
- **Used for**: Authorizing apps to access your business data
- **Status**: ✅ You should use this to authorize the app

## OAuth Authorization Flow

When you authorize an app via OAuth:

1. ✅ You log in with your **Merchant Account** credentials (business account)
2. ✅ You grant permission for the app to access your merchant data
3. ✅ The app gets tokens that allow it to read orders, etc.

## Why This Matters

- The **developer account** creates the app and defines what permissions it needs
- The **merchant account** authorizes the app to access its specific data
- Both accounts can be the same if you're the business owner who also created the app

## What to Do

If you logged in with your Clover merchant/business credentials, you're doing it right! Continue with the authorization.

