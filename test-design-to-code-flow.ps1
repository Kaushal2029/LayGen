# Test Design Selection to Code Generation Flow
# This script tests the complete flow from design selection to code generation

Write-Host "🎯 Testing Design Selection to Code Generation Flow" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. Design selection triggers automatic code generation" -ForegroundColor White
Write-Host "   2. Manual code generation button works as fallback" -ForegroundColor White
Write-Host "   3. Console logs show the complete flow" -ForegroundColor White
Write-Host "   4. Code generation API is called with proper data" -ForegroundColor White

Write-Host "`n🧪 Test 1: Direct Code Generation API Test..." -ForegroundColor Yellow

try {
    $codeBody = @{
        layoutData = @{
            dataAnalysis = @{
                description = "E-commerce Platform with product catalog, shopping cart, and user dashboard"
                suggestedAppType = "E-commerce Platform"
                projectName = "Test E-commerce App"
            }
            selectedColors = @{
                primary = "#3B82F6"
                secondary = "#10B981"
                accent = "#F59E0B"
            }
        }
        framework = "html"
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing code generation API directly..." -ForegroundColor Cyan
    Write-Host "   - Description: $($codeBody.layoutData.dataAnalysis.description)" -ForegroundColor White
    Write-Host "   - Colors: $($codeBody.layoutData.selectedColors.primary), $($codeBody.layoutData.selectedColors.secondary)" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $codeBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Code Generation API: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Code Summary:" -ForegroundColor Cyan
        Write-Host "   - HTML Length: $($result.data.html.Length)" -ForegroundColor White
        Write-Host "   - CSS Length: $($result.data.css.Length)" -ForegroundColor White
        Write-Host "   - JS Length: $($result.data.javascript.Length)" -ForegroundColor White
        Write-Host "   - AI Generated: $($result.isAIGenerated)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Code Generation API: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Code Generation API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Web Interface Test Instructions:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload an Excel file or use the test data" -ForegroundColor White
Write-Host "   3. Generate design options" -ForegroundColor White
Write-Host "   4. Select a design (this should trigger automatic code generation)" -ForegroundColor White
Write-Host "   5. If automatic generation doesn't work, click 'Generate Code Now' button" -ForegroundColor White

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   🎯 [MAIN PAGE] Design selected: { id: '...', name: '...', ... }" -ForegroundColor Green
Write-Host "   ✅ [MAIN PAGE] Design ID and colors set successfully: { designId: '...', colors: {...} }" -ForegroundColor Green
Write-Host "   🎯 [MAIN PAGE] Moved to step 5 (Code Generation)" -ForegroundColor Green
Write-Host "   🚀 [MAIN PAGE] Auto-triggering code generation in 2 seconds..." -ForegroundColor Green
Write-Host "   ⏰ [MAIN PAGE] Timeout reached, calling handleGenerateCode..." -ForegroundColor Green
Write-Host "   💻 [MAIN PAGE] Code generation requested" -ForegroundColor Green
Write-Host "   🌐 [MAIN PAGE] Making API call to /api/export/code" -ForegroundColor Green
Write-Host "   🚀 [CODE API] Perplexity AI is PRIMARY service - Enhanced code generation!" -ForegroundColor Green

Write-Host "`n❌ If you see these (WRONG):" -ForegroundColor Red
Write-Host "   ❌ [MAIN PAGE] Missing required data for code generation" -ForegroundColor Red
Write-Host "   ❌ [MAIN PAGE] No colors found in design layout" -ForegroundColor Red

Write-Host "`n🔧 Troubleshooting Steps:" -ForegroundColor Yellow
Write-Host "   1. Check if design selection is working (console logs)" -ForegroundColor Gray
Write-Host "   2. Check if colors are being set properly" -ForegroundColor Gray
Write-Host "   3. Check if dataAnalysis is available" -ForegroundColor Gray
Write-Host "   4. Use the manual 'Generate Code Now' button as fallback" -ForegroundColor Gray
Write-Host "   5. Check server console for API call logs" -ForegroundColor Gray

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ Design selection shows in console logs" -ForegroundColor Green
Write-Host "   ✅ Automatic code generation triggers after 2 seconds" -ForegroundColor Green
Write-Host "   ✅ Manual 'Generate Code Now' button appears in step 5" -ForegroundColor Green
Write-Host "   ✅ Code generation API is called successfully" -ForegroundColor Green
Write-Host "   ✅ Generated code is displayed in step 6" -ForegroundColor Green

Write-Host "`n📱 UI Flow:" -ForegroundColor Cyan
Write-Host "   Step 4: Design Selection → Click on a design" -ForegroundColor White
Write-Host "   Step 5: Code Generation → Automatic trigger OR manual button" -ForegroundColor White
Write-Host "   Step 6: Download → Generated code ready for download" -ForegroundColor White
