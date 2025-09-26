# Test Console Logging for Perplexity AI Code Generation
# This script will show detailed console output during code generation

Write-Host "🔍 Testing Perplexity AI Console Logging" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`nThis will show detailed console output during code generation..." -ForegroundColor Yellow
Write-Host "Watch your server console for detailed Perplexity AI logs!" -ForegroundColor Cyan

Write-Host "`n🚀 Starting Code Generation Test..." -ForegroundColor Yellow

try {
    $body = @{
        layoutData = @{
            dataAnalysis = @{
                description = "A modern e-commerce website with shopping cart, product catalog, and user dashboard"
                suggestedAppType = "E-commerce Platform"
                projectName = "Console Test App"
            }
            selectedColors = @{
                primary = "#3B82F6"
                secondary = "#10B981"
                accent = "#F59E0B"
            }
        }
        framework = "html"
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Sending request to Perplexity AI..." -ForegroundColor Cyan
    
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $body -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Code Generation: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Code Summary:" -ForegroundColor Cyan
        Write-Host "   - HTML Length: $($result.data.html.Length)" -ForegroundColor White
        Write-Host "   - CSS Length: $($result.data.css.Length)" -ForegroundColor White
        Write-Host "   - JS Length: $($result.data.javascript.Length)" -ForegroundColor White
        Write-Host "   - README Length: $($result.data.readme.Length)" -ForegroundColor White
        Write-Host "   - AI Generated: $($result.isAIGenerated)" -ForegroundColor White
        
        Write-Host "`n🎉 Check your server console for detailed Perplexity AI logs!" -ForegroundColor Yellow
        Write-Host "   Look for messages starting with [PERPLEXITY] and [CODE API]" -ForegroundColor Gray
    } else {
        Write-Host "`n❌ Code Generation: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Console Logging Features:" -ForegroundColor Cyan
Write-Host "   ✅ Perplexity AI service detection" -ForegroundColor Green
Write-Host "   ✅ Request details and parameters" -ForegroundColor Green
Write-Host "   ✅ Response processing steps" -ForegroundColor Green
Write-Host "   ✅ JSON parsing attempts" -ForegroundColor Green
Write-Host "   ✅ Fallback mechanism logging" -ForegroundColor Green
Write-Host "   ✅ Final results summary" -ForegroundColor Green
Write-Host "   ✅ Error handling details" -ForegroundColor Green

Write-Host "`n🔍 To see the logs, check your server console where you ran 'npm run dev'" -ForegroundColor Yellow
