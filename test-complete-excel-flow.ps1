# Complete Excel Data Flow Test
# This script tests the entire flow from Excel upload to design generation

Write-Host "🔄 Complete Excel Data Flow Test" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "`n📋 This test will verify:" -ForegroundColor Cyan
Write-Host "   1. Excel data is properly parsed and stored" -ForegroundColor White
Write-Host "   2. Excel data is passed to design generation API" -ForegroundColor White
Write-Host "   3. Perplexity AI uses Excel data instead of generic prompt" -ForegroundColor White
Write-Host "   4. Console logs show the complete data flow" -ForegroundColor White

Write-Host "`n🧪 Test 1: Direct API Test with Excel Data..." -ForegroundColor Yellow

try {
    $excelData = @{
        description = "E-commerce Platform with product catalog, shopping cart, user authentication, order management, and payment processing"
        requirements = @(
            "User registration and login system",
            "Product catalog with search and filtering",
            "Shopping cart functionality",
            "Order management and tracking",
            "Payment gateway integration",
            "Admin dashboard for inventory management",
            "Email notifications for orders"
        )
        features = @(
            "Responsive design for mobile and desktop",
            "Real-time inventory updates",
            "Advanced search with filters",
            "Secure payment processing",
            "Order tracking system",
            "User profile management"
        )
        rawData = @(
            @("Product ID", "Name", "Category", "Price", "Stock", "Description"),
            @("P001", "Wireless Headphones", "Electronics", "99.99", "50", "High-quality wireless headphones"),
            @("P002", "Laptop Stand", "Accessories", "29.99", "25", "Adjustable laptop stand"),
            @("P003", "Mechanical Keyboard", "Electronics", "149.99", "30", "RGB mechanical keyboard")
        )
        fileName = "ecommerce-products.xlsx"
        fileSize = 3072
        projectName = "E-commerce Platform"
    }

    $designBody = @{
        prompt = "Modern web application"  # This should be overridden
        dataAnalysis = @{
            suggestedAppType = "Web Application"
            description = "Generic web application"
        }
        excelData = $excelData
    } | ConvertTo-Json -Depth 4

    Write-Host "📤 Sending design generation request..." -ForegroundColor Cyan
    Write-Host "   - Excel Description: $($excelData.description)" -ForegroundColor White
    Write-Host "   - Requirements: $($excelData.requirements.Count)" -ForegroundColor White
    Write-Host "   - Features: $($excelData.features.Count)" -ForegroundColor White
    Write-Host "   - Raw Data Rows: $($excelData.rawData.Count)" -ForegroundColor White

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Results:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        
        Write-Host "`n🎨 Generated Design Options:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $result.data.designOptions.Count); $i++) {
            $design = $result.data.designOptions[$i]
            Write-Host "   $($i + 1). $($design.name): $($design.description)" -ForegroundColor Gray
        }
        
        Write-Host "`n🎨 Generated Color Schemes:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $result.data.colorCombinations.Count); $i++) {
            $color = $result.data.colorCombinations[$i]
            Write-Host "   $($i + 1). $($color.name): $($color.colors.primary), $($color.colors.secondary)" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n❌ Design Generation: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Expected Console Output (check your server console):" -ForegroundColor Cyan
Write-Host "   📊 [MAIN PAGE] Excel data stored: { hasDescription: true, description: 'E-commerce Platform...', ... }" -ForegroundColor Green
Write-Host "   🎨 [MAIN PAGE] Excel data available for design generation: true" -ForegroundColor Green
Write-Host "   📊 [DESIGN API] Using real Excel data for design generation" -ForegroundColor Green
Write-Host "   📋 [DESIGN API] Excel data details: { description: 'E-commerce Platform...', ... }" -ForegroundColor Green
Write-Host "   📄 [DESIGN API] Document type: xlsx" -ForegroundColor Green
Write-Host "   💻 [PERPLEXITY] Project Details: { description: 'E-commerce Platform...', ... }" -ForegroundColor Green

Write-Host "`n❌ If you see these instead (WRONG):" -ForegroundColor Red
Write-Host "   📝 [DESIGN API] Using prompt-only design generation" -ForegroundColor Red
Write-Host "   💻 [PERPLEXITY] Project Details: { description: 'Modern web application', ... }" -ForegroundColor Red

Write-Host "`n🌐 Web Interface Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload an Excel file with product data" -ForegroundColor White
Write-Host "   3. Check browser console for [MAIN PAGE] logs" -ForegroundColor White
Write-Host "   4. Click 'Generate Design Options'" -ForegroundColor White
Write-Host "   5. Check server console for [DESIGN API] and [PERPLEXITY] logs" -ForegroundColor White

Write-Host "`n🎯 Success Indicators:" -ForegroundColor Green
Write-Host "   ✅ Console shows 'Using real Excel data for design generation'" -ForegroundColor Green
Write-Host "   ✅ Perplexity AI receives Excel description, not generic prompt" -ForegroundColor Green
Write-Host "   ✅ Generated designs are specific to your Excel data" -ForegroundColor Green
Write-Host "   ✅ Design options reflect your actual requirements" -ForegroundColor Green

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If Excel data is null: Check file upload and parsing" -ForegroundColor Gray
Write-Host "   - If using prompt-only: Check excelData parameter passing" -ForegroundColor Gray
Write-Host "   - If generic designs: Check Perplexity AI prompt generation" -ForegroundColor Gray
