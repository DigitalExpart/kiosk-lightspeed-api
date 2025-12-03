$code = "0056471f-74d5-c1c6-563f-fe61b4347e53"
$clientId = "8GSC7031S26JY"
$clientSecret = "3de21706-142e-2abc-ab53-4e41e79bd0aa"
$redirectUri = "http://localhost:4000/oauth/callback"

Write-Host "`n🔄 Exchanging authorization code for tokens...`n" -ForegroundColor Cyan
Write-Host "Trying production endpoint first...`n" -ForegroundColor Yellow

$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    code = $code
    redirect_uri = $redirectUri
}

# Try production endpoint first
$tokenUrl = "https://api.clover.com/oauth/token"

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "✅ Successfully obtained tokens!`n" -ForegroundColor Green
    Write-Host "📝 Add these to your .env file:`n" -ForegroundColor Yellow
    Write-Host "CLOVER_ACCESS_TOKEN=$($response.access_token)" -ForegroundColor White
    if ($response.refresh_token) {
        Write-Host "CLOVER_REFRESH_TOKEN=$($response.refresh_token)" -ForegroundColor White
    }
    Write-Host "`nExpires in: $($response.expires_in) seconds`n" -ForegroundColor Gray
    
    # Also note the merchant ID from the URL
    Write-Host "📋 Note: Your merchant_id from the redirect URL is: PWXW7AC7WJ0A1" -ForegroundColor Cyan
    Write-Host "   You may want to update CLOVER_MERCHANT_ID in your .env file`n" -ForegroundColor Cyan
    
    exit 0
} catch {
    $errorDetails = $_.Exception
    
    Write-Host "❌ Production endpoint failed:" -ForegroundColor Red
    Write-Host "   $($errorDetails.Message)" -ForegroundColor Red
    
    # Try to get response body
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "`nResponse body:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor White
        } catch {
            Write-Host "   (Could not read response body)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nTrying sandbox endpoint...`n" -ForegroundColor Yellow
    
    # Try sandbox endpoint
    $tokenUrl = "https://sandbox.dev.clover.com/oauth/token"
    
    try {
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "✅ Successfully obtained tokens from sandbox!`n" -ForegroundColor Green
        Write-Host "📝 Add these to your .env file:`n" -ForegroundColor Yellow
        Write-Host "CLOVER_ACCESS_TOKEN=$($response.access_token)" -ForegroundColor White
        if ($response.refresh_token) {
            Write-Host "CLOVER_REFRESH_TOKEN=$($response.refresh_token)" -ForegroundColor White
        }
        Write-Host "`nExpires in: $($response.expires_in) seconds`n" -ForegroundColor Gray
        
        Write-Host "📋 Note: Your merchant_id from the redirect URL is: PWXW7AC7WJ0A1" -ForegroundColor Cyan
        Write-Host "   You may want to update CLOVER_MERCHANT_ID in your .env file`n" -ForegroundColor Cyan
        
        exit 0
    } catch {
        Write-Host "❌ Sandbox endpoint also failed:" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $reader.Close()
                Write-Host "`nResponse body:" -ForegroundColor Yellow
                Write-Host $responseBody -ForegroundColor White
            } catch {
                Write-Host "   (Could not read response body)" -ForegroundColor Gray
            }
        }
        
        Write-Host "`n⚠️  Possible issues:" -ForegroundColor Yellow
        Write-Host "   1. Authorization code may have expired (try getting a new one)" -ForegroundColor White
        Write-Host "   2. Redirect URI might not match exactly" -ForegroundColor White
        Write-Host "   3. Check if you're using sandbox vs production endpoints" -ForegroundColor White
        Write-Host "`n💡 Try getting a fresh authorization code and exchanging immediately!`n" -ForegroundColor Cyan
    }
}
