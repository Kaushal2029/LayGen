# Debug Excel Data Flow in Design Generation
# This script will help debug why Excel data isn't being used

Write-Host "🔍 Debugging Excel Data Flow in Design Generation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📊 Test 1: Check if Excel data is being passed correctly..." -ForegroundColor Yellow

try {
    # Test with comprehensive Excel data
    $excelData = @{
        description = "Customer Management System with user profiles, order tracking, payment processing, and analytics dashboard"
        requirements = @(
            "User authentication and authorization",
            "Customer profile management", 
            "Order tracking and status updates",
            "Payment processing integration",
            "Analytics and reporting dashboard"
        )
        features = @(
            "Responsive design",
            "Real-time updates", 
            "Search and filtering",
            "Data visualization"
        )
        rawData = @(
            @("Customer ID", "Name", "Email", "Phone", "Status"),
            @("C001", "John Doe", "john@example.com", "555-0123", "Active"),
            @("C002", "Jane Smith", "jane@example.com", "555-0124", "Active")
        )
        fileName = "customer-data.xlsx"
        fileSize = 2048
        projectName = "Customer Management System"
    }

    $designBody = @{
        prompt = "Modern web application"  # This should be overridden by Excel data
        dataAnalysis = @{
            suggestedAppType = "Web Application"
            description = "Generic web application"
        }
        excelData = $excelData
    } | ConvertTo-Json -Depth 4

    Write-Host "📤 Sending request with Excel data..." -ForegroundColor Cyan
    Write-Host "   - Excel Description: $($excelData.description)" -ForegroundColor White
    Write-Host "   - Prompt (should be overridden): Modern web application" -ForegroundColor Gray
    Write-Host "   - Data Analysis Description: Generic web application" -ForegroundColor Gray

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Request Successful!" -ForegroundColor Green
        Write-Host "📊 Results:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        
        Write-Host "`n🔍 Check your server console for these logs:" -ForegroundColor Yellow
        Write-Host "   - [DESIGN API] Using real Excel data for design generation" -ForegroundColor Gray
        Write-Host "   - [DESIGN API] Excel data details: ..." -ForegroundColor Gray
        Write-Host "   - [PERPLEXITY] Project Details: ..." -ForegroundColor Gray
    } else {
        Write-Host "`n❌ Request Failed: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Expected Console Output:" -ForegroundColor Cyan
Write-Host "   ✅ [DESIGN API] Using real Excel data for design generation" -ForegroundColor Green
Write-Host "   ✅ [DESIGN API] Excel data details: { description: 'Customer Management System...', ... }" -ForegroundColor Green
Write-Host "   ✅ [DESIGN API] Document type: xlsx" -ForegroundColor Green
Write-Host "   ✅ [PERPLEXITY] Project Details: { description: 'Customer Management System...', ... }" -ForegroundColor Green

Write-Host "`n🔧 If you see 'Using prompt-only design generation' instead:" -ForegroundColor Yellow
Write-Host "   - Check that excelData is not null/undefined" -ForegroundColor Gray
Write-Host "   - Check that excelData.description exists" -ForegroundColor Gray
Write-Host "   - Check the server console for detailed logs" -ForegroundColor Gray

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload an Excel file" -ForegroundColor White
Write-Host "   3. Check the console for Excel data processing logs" -ForegroundColor White
Write-Host "   4. Click 'Generate Design Options'" -ForegroundColor White
Write-Host "   5. Look for [DESIGN SELECTOR] logs showing Excel data" -ForegroundColor White
