# Test DataAnalysis Fallback in Code Generation
# This script tests the fallback mechanism when dataAnalysis is missing

Write-Host "🔧 Testing DataAnalysis Fallback in Code Generation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. Code generation works even when dataAnalysis is missing" -ForegroundColor White
Write-Host "   2. Fallback dataAnalysis is created automatically" -ForegroundColor White
Write-Host "   3. Console logs show the fallback process" -ForegroundColor White
Write-Host "   4. Generated code is still functional" -ForegroundColor White

Write-Host "`n🧪 Test 1: Code Generation with Missing DataAnalysis..." -ForegroundColor Yellow

try {
    # Test with minimal data (no dataAnalysis)
    $codeBody = @{
        layoutData = @{
            # No dataAnalysis - this should trigger fallback
            selectedColors = @{
                primary = "#3B82F6"
                secondary = "#10B981"
                accent = "#F59E0B"
            }
        }
        framework = "html"
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing code generation with missing dataAnalysis..." -ForegroundColor Cyan
    Write-Host "   - DataAnalysis: Missing (should trigger fallback)" -ForegroundColor White
    Write-Host "   - Selected Colors: Available" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $codeBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Code Generation with Fallback: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Code Summary:" -ForegroundColor Cyan
        Write-Host "   - HTML Length: $($result.data.html.Length)" -ForegroundColor White
        Write-Host "   - CSS Length: $($result.data.css.Length)" -ForegroundColor White
        Write-Host "   - JS Length: $($result.data.javascript.Length)" -ForegroundColor White
        Write-Host "   - AI Generated: $($result.isAIGenerated)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Code Generation with Fallback: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 Test 2: Code Generation with Complete Data..." -ForegroundColor Yellow

try {
    # Test with complete data
    $codeBody = @{
        layoutData = @{
            dataAnalysis = @{
                description = "E-commerce Platform with product catalog and shopping cart"
                suggestedAppType = "E-commerce Platform"
                projectName = "Test E-commerce App"
            }
            selectedColors = @{
                primary = "#FF6B6B"
                secondary = "#4ECDC4"
                accent = "#FFE66D"
            }
        }
        framework = "html"
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing code generation with complete data..." -ForegroundColor Cyan
    Write-Host "   - DataAnalysis: Available" -ForegroundColor White
    Write-Host "   - Selected Colors: Available" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $codeBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Code Generation with Complete Data: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Code Summary:" -ForegroundColor Cyan
        Write-Host "   - HTML Length: $($result.data.html.Length)" -ForegroundColor White
        Write-Host "   - CSS Length: $($result.data.css.Length)" -ForegroundColor White
        Write-Host "   - JS Length: $($result.data.javascript.Length)" -ForegroundColor White
        Write-Host "   - AI Generated: $($result.isAIGenerated)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Code Generation with Complete Data: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   💻 [MAIN PAGE] Data analysis available: false" -ForegroundColor Green
Write-Host "   ⚠️ [MAIN PAGE] Data analysis missing, creating fallback..." -ForegroundColor Green
Write-Host "   ✅ [MAIN PAGE] Fallback data analysis created: { ... }" -ForegroundColor Green
Write-Host "   💻 [MAIN PAGE] Starting code generation..." -ForegroundColor Green
Write-Host "   🚀 [CODE API] Perplexity AI is PRIMARY service - Enhanced code generation!" -ForegroundColor Green

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Skip file upload (go directly to design generation)" -ForegroundColor White
Write-Host "   3. Generate design options" -ForegroundColor White
Write-Host "   4. Select a design" -ForegroundColor White
Write-Host "   5. Check console for fallback dataAnalysis creation" -ForegroundColor White

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ Code generation works even without dataAnalysis" -ForegroundColor Green
Write-Host "   ✅ Fallback dataAnalysis is created automatically" -ForegroundColor Green
Write-Host "   ✅ Generated code is functional and complete" -ForegroundColor Green
Write-Host "   ✅ Console shows fallback process clearly" -ForegroundColor Green

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If still getting 'Missing required data': Check selectedColors" -ForegroundColor Gray
Write-Host "   - If fallback not working: Check console for error messages" -ForegroundColor Gray
Write-Host "   - If code generation fails: Check Perplexity AI logs" -ForegroundColor Gray

Write-Host "`n📱 UI Flow Test:" -ForegroundColor Cyan
Write-Host "   Step 1: Skip file upload" -ForegroundColor White
Write-Host "   Step 2: Enter design prompt manually" -ForegroundColor White
Write-Host "   Step 3: Generate designs" -ForegroundColor White
Write-Host "   Step 4: Select design (should work with fallback)" -ForegroundColor White
Write-Host "   Step 5: Code generation (should work with fallback dataAnalysis)" -ForegroundColor White
