# PowerShell script to exchange Clover authorization code for tokens
# Usage: .\get-tokens.ps1 YOUR_AUTHORIZATION_CODE

param(
    [Parameter(Mandatory=$true)]
    [string]$Code
)

$clientId = "8GSC7031S26JY"
$clientSecret = "3de21706-142e-2abc-ab53-4e41e79bd0aa"
$redirectUri = "http://localhost:4000/oauth/callback"
$tokenUrl = "https://api.clover.com/oauth/token"

Write-Host "`n🔄 Exchanging authorization code for tokens...`n" -ForegroundColor Cyan

$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    code = $Code
    redirect_uri = $redirectUri
}

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "✅ Successfully obtained tokens!`n" -ForegroundColor Green
    Write-Host "📝 Add these to your .env file:`n" -ForegroundColor Yellow
    Write-Host "CLOVER_ACCESS_TOKEN=$($response.access_token)" -ForegroundColor White
    if ($response.refresh_token) {
        Write-Host "CLOVER_REFRESH_TOKEN=$($response.refresh_token)" -ForegroundColor White
    }
    Write-Host "`nExpires in: $($response.expires_in) seconds`n" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ Error exchanging code:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

