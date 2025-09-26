# Test Prompt-Based Titles in Design Generation
# This script tests if design titles are using parsed Excel data

Write-Host "🧪 Testing Prompt-Based Titles in Design Generation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. Design titles use parsed Excel data" -ForegroundColor White
Write-Host "   2. Design descriptions are based on Excel content" -ForegroundColor White
Write-Host "   3. Console shows structured parsing" -ForegroundColor White
Write-Host "   4. Designs are specific to the project" -ForegroundColor White

Write-Host "`n🧪 Test: Excel Data with Structured Description..." -ForegroundColor Yellow

try {
    # Test with structured Excel data
    $excelData = @{
        fileName = "game-project.xlsx"
        fileSize = 15360
        fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        description = "Game, develop rock, paper & scissor game, frontend, high, to-do"
        requirements = @("Game logic", "User interface", "Score tracking")
        features = @("Interactive gameplay", "Responsive design", "Animations")
        rawData = @(
            @{ Title = "Game"; Type = "frontend"; Priority = "high"; Status = "to-do" }
        )
        projectName = "Rock Paper Scissors Game"
    }

    $designBody = @{
        prompt = "Modern web application"
        excelData = $excelData
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Testing design generation with Excel data..." -ForegroundColor Cyan
    Write-Host "   - Excel Description: $($excelData.description)" -ForegroundColor White
    Write-Host "   - Expected Design Title: 'Game frontend App'" -ForegroundColor Gray
    Write-Host "   - Expected Description: 'develop rock, paper & scissor game - frontend application'" -ForegroundColor Gray

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Details:" -ForegroundColor Cyan
        
        if ($result.data.designOptions.Count -gt 0) {
            $firstDesign = $result.data.designOptions[0]
            Write-Host "   - Design ID: $($firstDesign.id)" -ForegroundColor White
            Write-Host "   - Design Name: $($firstDesign.name)" -ForegroundColor White
            Write-Host "   - Design Description: $($firstDesign.description)" -ForegroundColor White
            Write-Host "   - Design Preview: $($firstDesign.preview)" -ForegroundColor White
            
            # Check if it's using parsed data
            if ($firstDesign.name -like "*Game*" -and $firstDesign.name -like "*frontend*") {
                Write-Host "   ✅ Design name uses parsed title and type!" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Design name is generic, not using parsed data" -ForegroundColor Red
            }
            
            if ($firstDesign.description -like "*rock*paper*scissor*") {
                Write-Host "   ✅ Design description uses parsed description!" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Design description is generic, not using parsed data" -ForegroundColor Red
            }
        }
        
        if ($result.data.dataAnalysis) {
            Write-Host "   - Project Name: $($result.data.dataAnalysis.projectName)" -ForegroundColor White
            Write-Host "   - App Type: $($result.data.dataAnalysis.suggestedAppType)" -ForegroundColor White
            Write-Host "   - Description: $($result.data.dataAnalysis.description)" -ForegroundColor White
            Write-Host "   - Priority: $($result.data.dataAnalysis.priority)" -ForegroundColor White
            Write-Host "   - Status: $($result.data.dataAnalysis.status)" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ Design Generation: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   🎨 [DESIGN API] Using real Excel data for design generation" -ForegroundColor Green
Write-Host "   🔍 [PERPLEXITY] Parsing document..." -ForegroundColor Green
Write-Host "   📊 [PERPLEXITY] Parsed structured data:" -ForegroundColor Green
Write-Host "     - title: Game" -ForegroundColor Green
Write-Host "     - description: develop rock, paper & scissor game" -ForegroundColor Green
Write-Host "     - type: frontend" -ForegroundColor Green
Write-Host "     - priority: high" -ForegroundColor Green
Write-Host "     - status: to-do" -ForegroundColor Green
Write-Host "   ✅ [PERPLEXITY] Direct JSON parse successful" -ForegroundColor Green

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload Excel file with description: 'Game, develop rock, paper & scissor game, frontend, high, to-do'" -ForegroundColor White
Write-Host "   3. Generate design options" -ForegroundColor White
Write-Host "   4. Check if design shows 'Game frontend App' instead of 'Modern Dashboard'" -ForegroundColor White
Write-Host "   5. Check console for structured parsing logs" -ForegroundColor White

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ Design name: 'Game frontend App' (not 'Modern Dashboard')" -ForegroundColor Green
Write-Host "   ✅ Design description: 'develop rock, paper & scissor game - frontend application'" -ForegroundColor Green
Write-Host "   ✅ Console shows parsed structured data" -ForegroundColor Green
Write-Host "   ✅ Designs are specific to the Excel project" -ForegroundColor Green

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If still showing 'Modern Dashboard': Check if structured parsing is enabled" -ForegroundColor Gray
Write-Host "   - If no console logs: Check if Excel data is being passed correctly" -ForegroundColor Gray
Write-Host "   - If generic designs: Check if Perplexity AI is using parsed data" -ForegroundColor Gray
