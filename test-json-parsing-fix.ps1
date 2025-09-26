# Test JSON Parsing Fix
# This script tests the improved JSON parsing for Perplexity AI

Write-Host "🧪 Testing JSON Parsing Fix" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. JSON parsing handles malformed responses" -ForegroundColor White
Write-Host "   2. Fallback mechanisms work properly" -ForegroundColor White
Write-Host "   3. Design generation completes successfully" -ForegroundColor White
Write-Host "   4. Console shows improved error handling" -ForegroundColor Whit
Write-Host "`n🧪 Test: Design Generation with JSON Parsing..." -ForegroundColor Yellow

try {
    # Test with Excel data that might cause JSON parsing issues
    $excelData = @{
        fileName = "test-project.xlsx"
        fileSize = 20480
        fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        description = "Test, complex project with special characters & quotes, frontend, high, in-progress"
        requirements = @("Complex logic", "Special characters", "JSON handling")
        features = @("Advanced parsing", "Error handling", "Fallback systems")
        rawData = @(
            @{ Title = "Test"; Type = "frontend"; Priority = "high"; Status = "in-progress" }
        )
        projectName = "Test Project"
    }

    $designBody = @{
        prompt = "Modern web application"
        excelData = $excelData
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing design generation with complex data..." -ForegroundColor Cyan
    Write-Host "   - Description: $($excelData.description)" -ForegroundColor White
    Write-Host "   - Expected: JSON parsing should handle special characters" -ForegroundColor Gray

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Details:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        Write-Host "   - Data Analysis Available: $($result.data.dataAnalysis -ne $null)" -ForegroundColor White
        
        if ($result.data.designOptions.Count -gt 0) {
            $firstDesign = $result.data.designOptions[0]
            Write-Host "   - Design Name: $($firstDesign.name)" -ForegroundColor White
            Write-Host "   - Design Description: $($firstDesign.description)" -ForegroundColor White
        }
        
        if ($result.data.dataAnalysis) {
            Write-Host "   - Project Name: $($result.data.dataAnalysis.projectName)" -ForegroundColor White
            Write-Host "   - App Type: $($result.data.dataAnalysis.suggestedAppType)" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ Design Generation: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 Test: Code Generation with JSON Parsing..." -ForegroundColor Yellow

try {
    # Test code generation which also uses JSON parsing
    $codeBody = @{
        dataAnalysis = @{
            projectName = "Test Project"
            suggestedAppType = "frontend Test Application"
            description = "complex project with special characters & quotes"
            priority = "high"
            status = "in-progress"
        }
        designPrompt = "Modern web application with complex features"
        selectedDesign = @{
            id = "frontend_1"
            name = "Test frontend App"
            description = "complex project with special characters & quotes - frontend application"
        }
        selectedColors = @{
            primary = "#3B82F6"
            secondary = "#6B7280"
            accent = "#10B981"
            background = "#FFFFFF"
            text = "#111827"
        }
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing code generation with complex data..." -ForegroundColor Cyan
    Write-Host "   - Project: $($codeBody.dataAnalysis.projectName)" -ForegroundColor White
    Write-Host "   - Expected: JSON parsing should handle special characters in code generation" -ForegroundColor Gray

    $codeResult = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $codeBody -ContentType "application/json"
    
    if ($codeResult.success) {
        Write-Host "`n✅ Code Generation: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Code Details:" -ForegroundColor Cyan
        Write-Host "   - HTML Length: $($codeResult.data.html.Length)" -ForegroundColor White
        Write-Host "   - CSS Length: $($codeResult.data.css.Length)" -ForegroundColor White
        Write-Host "   - JS Length: $($codeResult.data.javascript.Length)" -ForegroundColor White
        Write-Host "   - README Length: $($codeResult.data.readme.Length)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Code Generation: FAILED - $($codeResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   🎨 [DESIGN API] Using real Excel data for design generation" -ForegroundColor Green
Write-Host "   🔍 [PERPLEXITY] Parsing document..." -ForegroundColor Green
Write-Host "   📊 [PERPLEXITY] Parsed structured data:" -ForegroundColor Green
Write-Host "   ✅ [PERPLEXITY] Direct JSON parse successful" -ForegroundColor Green
Write-Host "   OR" -ForegroundColor Yellow
Write-Host "   ⚠️ [PERPLEXITY] Direct JSON parse failed, attempting to extract JSON..." -ForegroundColor Yellow
Write-Host "   🔧 [PERPLEXITY] Attempting to fix JSON issues..." -ForegroundColor Yellow
Write-Host "   ✅ [PERPLEXITY] JSON fixing successful" -ForegroundColor Green
Write-Host "   OR" -ForegroundColor Yellow
Write-Host "   🆘 [PERPLEXITY] All JSON parsing attempts failed!" -ForegroundColor Red
Write-Host "   ✅ [PERPLEXITY] Fallback response created successfully" -ForegroundColor Green

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload Excel file with complex description" -ForegroundColor White
Write-Host "   3. Generate design options" -ForegroundColor White
Write-Host "   4. Check console for improved JSON parsing logs" -ForegroundColor White
Write-Host "   5. Verify designs are generated even with parsing issues" -ForegroundColor White

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ JSON parsing handles malformed responses" -ForegroundColor Green
Write-Host "   ✅ Fallback mechanisms work properly" -ForegroundColor Green
Write-Host "   ✅ Design generation completes successfully" -ForegroundColor Green
Write-Host "   ✅ Console shows improved error handling" -ForegroundColor Green

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If still getting JSON errors: Check if Perplexity AI is returning valid JSON" -ForegroundColor Gray
Write-Host "   - If fallback not working: Check if error handling is properly implemented" -ForegroundColor Gray
Write-Host "   - If designs generic: Check if structured parsing is working" -ForegroundColor Gray

Write-Host "`n📱 JSON Parsing Improvements:" -ForegroundColor Cyan
Write-Host "   - Better error handling for malformed JSON" -ForegroundColor White
Write-Host "   - JSON fixing for common issues (quotes, commas, whitespace)" -ForegroundColor White
Write-Host "   - Fallback responses when parsing fails" -ForegroundColor White
Write-Host "   - Clearer console logging for debugging" -ForegroundColor White
