# Test Perplexity AI Excel Design Generation
# This script tests if Perplexity AI now properly handles Excel data for design generation

Write-Host "🧪 Testing Perplexity AI Excel Design Generation" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. Perplexity AI properly processes Excel data" -ForegroundColor White
Write-Host "   2. Design generation returns designOptions and colorCombinations" -ForegroundColor White
Write-Host "   3. Excel data is used instead of generic prompts" -ForegroundColor White
Write-Host "   4. Console logs show Excel data processing" -ForegroundColor White

Write-Host "`n🧪 Test 1: Design Generation with Excel Data..." -ForegroundColor Yellow

try {
    # Test with Excel data
    $excelData = @{
        fileName = "project-data.xlsx"
        fileSize = 15360
        fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        description = "E-commerce product catalog with inventory management, customer orders, and sales analytics"
        requirements = @("Product listing", "Inventory tracking", "Order management", "Sales dashboard")
        features = @("Search and filter", "Shopping cart", "User authentication", "Admin panel")
        rawData = @(
            @{ Title = "Product Name"; Type = "Text"; Priority = "High" },
            @{ Title = "Price"; Type = "Number"; Priority = "High" },
            @{ Title = "Stock"; Type = "Number"; Priority = "Medium" },
            @{ Title = "Category"; Type = "Text"; Priority = "Medium" }
        )
        projectName = "E-commerce Platform"
    }

    $designBody = @{
        prompt = "Modern web application"
        excelData = $excelData
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing design generation with Excel data..." -ForegroundColor Cyan
    Write-Host "   - Excel Description: $($excelData.description)" -ForegroundColor White
    Write-Host "   - Project Name: $($excelData.projectName)" -ForegroundColor White
    Write-Host "   - Requirements: $($excelData.requirements.Count)" -ForegroundColor White
    Write-Host "   - Features: $($excelData.features.Count)" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation with Excel Data: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Summary:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        Write-Host "   - Data Analysis Available: $($result.data.dataAnalysis -ne $null)" -ForegroundColor White
        
        if ($result.data.designOptions.Count -gt 0) {
            Write-Host "   - First Design: $($result.data.designOptions[0].name)" -ForegroundColor White
            Write-Host "   - First Design Description: $($result.data.designOptions[0].description)" -ForegroundColor White
        }
        
        if ($result.data.colorCombinations.Count -gt 0) {
            Write-Host "   - First Color Scheme: $($result.data.colorCombinations[0].name)" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ Design Generation with Excel Data: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 Test 2: Design Generation with Prompt Only..." -ForegroundColor Yellow

try {
    # Test with prompt only (no Excel data)
    $designBody = @{
        prompt = "Create a modern portfolio website for a photographer"
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing design generation with prompt only..." -ForegroundColor Cyan
    Write-Host "   - Prompt: Create a modern portfolio website for a photographer" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation with Prompt: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Summary:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        Write-Host "   - Data Analysis Available: $($result.data.dataAnalysis -ne $null)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Design Generation with Prompt: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   🎨 [DESIGN API] Starting design generation process..." -ForegroundColor Green
Write-Host "   📊 [DESIGN API] Using real Excel data for design generation" -ForegroundColor Green
Write-Host "   🔍 [PERPLEXITY] Parsing document..." -ForegroundColor Green
Write-Host "   ✅ [PERPLEXITY] Direct JSON parse successful" -ForegroundColor Green
Write-Host "   ✅ [DESIGN API] AI processing successful" -ForegroundColor Green

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload an Excel file" -ForegroundColor White
Write-Host "   3. Generate design options" -ForegroundColor White
Write-Host "   4. Check console for Excel data processing" -ForegroundColor White
Write-Host "   5. Verify designs are based on Excel content" -ForegroundColor White

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ Perplexity AI processes Excel data correctly" -ForegroundColor Green
Write-Host "   ✅ Design generation returns designOptions and colorCombinations" -ForegroundColor Green
Write-Host "   ✅ Excel description is used in design prompts" -ForegroundColor Green
Write-Host "   ✅ Console shows Excel data processing steps" -ForegroundColor Green

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If Excel data not processed: Check Perplexity AI parseDocument method" -ForegroundColor Gray
Write-Host "   - If no design options: Check JSON parsing in Perplexity AI" -ForegroundColor Gray
Write-Host "   - If generic designs: Check Excel data structure in design API" -ForegroundColor Gray

Write-Host "`n📱 UI Flow Test:" -ForegroundColor Cyan
Write-Host "   Step 1: Upload Excel file" -ForegroundColor White
Write-Host "   Step 2: Generate designs (should use Excel data)" -ForegroundColor White
Write-Host "   Step 3: Select design (should work with Excel-based designs)" -ForegroundColor White
Write-Host "   Step 4: Code generation (should work with Excel data)" -ForegroundColor White
