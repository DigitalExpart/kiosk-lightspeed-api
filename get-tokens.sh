#!/bin/bash
# Bash script to exchange Clover authorization code for tokens
# Usage: ./get-tokens.sh YOUR_AUTHORIZATION_CODE

if [ -z "$1" ]; then
    echo ""
    echo "❌ Please provide authorization code:"
    echo "   ./get-tokens.sh YOUR_AUTHORIZATION_CODE"
    echo ""
    exit 1
fi

CODE=$1
CLIENT_ID="8GSC7031S26JY"
CLIENT_SECRET="3de21706-142e-2abc-ab53-4e41e79bd0aa"
REDIRECT_URI="http://localhost:4000/oauth/callback"
TOKEN_URL="https://api.clover.com/oauth/token"

echo ""
echo "🔄 Exchanging authorization code for tokens..."
echo ""

response=$(curl -s -X POST "$TOKEN_URL" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "code=$CODE" \
  -d "redirect_uri=$REDIRECT_URI")

# Check if response contains access_token
if echo "$response" | grep -q "access_token"; then
    echo "✅ Successfully obtained tokens!"
    echo ""
    echo "📝 Add these to your .env file:"
    echo ""
    
    # Extract access_token
    access_token=$(echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "CLOVER_ACCESS_TOKEN=$access_token"
    
    # Extract refresh_token if present
    refresh_token=$(echo "$response" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$refresh_token" ]; then
        echo "CLOVER_REFRESH_TOKEN=$refresh_token"
    fi
    
    # Extract expires_in
    expires_in=$(echo "$response" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
    echo ""
    echo "Expires in: $expires_in seconds"
    echo ""
else
    echo "❌ Error exchanging code:"
    echo "$response"
    echo ""
fi

