# 📋 Extract Authorization Code from URL

## Your URL Contains the Code!

Look at your browser's address bar. The URL should look like:

```
localhost:4000/oauth/callback?merchant_id=PWXW7AC7WJ0A1&employee_id=VBCQ67BF01XCG&state=&client_id=8GSC7031S26JY&code=YOUR_AUTHORIZATION_CODE_HERE
```

## How to Get the Code

1. **Look at the URL in your browser's address bar**
2. **Find the part that says `&code=`**
3. **Copy everything after `code=`** - that's your authorization code!

**Important**: Copy the ENTIRE code value (it might be long)

---

## Example

If your URL is:
```
localhost:4000/oauth/callback?merchant_id=...&code=abc123xyz456
```

Then your code is: `abc123xyz456`

---

## Next Step

Once you have the code, we'll exchange it for tokens using PowerShell!

