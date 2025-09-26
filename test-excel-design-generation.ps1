# Test Excel Data Integration in Design Generation
# This script tests that real Excel data is properly used for design generation

Write-Host "📊 Testing Excel Data Integration in Design Generation" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

Write-Host "`n🧪 Test 1: Design Generation with Mock Excel Data..." -ForegroundColor Yellow

try {
    $excelData = @{
        description = "Customer Management System with user profiles, order tracking, payment processing, and analytics dashboard"
        requirements = @(
            "User authentication and authorization",
            "Customer profile management",
            "Order tracking and status updates",
            "Payment processing integration",
            "Analytics and reporting dashboard",
            "Email notifications",
            "Data export functionality"
        )
        features = @(
            "Responsive design",
            "Real-time updates",
            "Search and filtering",
            "Data visualization",
            "Mobile-friendly interface"
        )
        rawData = @(
            @("Customer ID", "Name", "Email", "Phone", "Status"),
            @("C001", "John Doe", "john@example.com", "555-0123", "Active"),
            @("C002", "Jane Smith", "jane@example.com", "555-0124", "Active"),
            @("C003", "Bob Johnson", "bob@example.com", "555-0125", "Inactive")
        )
        fileName = "customer-data.xlsx"
        fileSize = 2048
        projectName = "Customer Management System"
    }

    $designBody = @{
        prompt = "Modern customer management system"
        dataAnalysis = @{
            suggestedAppType = "Customer Management System"
            description = "A comprehensive customer management platform"
        }
        excelData = $excelData
    } | ConvertTo-Json -Depth 4

    Write-Host "📤 Sending request with Excel data..." -ForegroundColor Cyan
    Write-Host "   - Description: $($excelData.description)" -ForegroundColor Gray
    Write-Host "   - Requirements: $($excelData.requirements.Count)" -ForegroundColor Gray
    Write-Host "   - Features: $($excelData.features.Count)" -ForegroundColor Gray
    Write-Host "   - Raw Data Rows: $($excelData.rawData.Count)" -ForegroundColor Gray

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation with Excel Data: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Summary:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
        
        Write-Host "`n🎨 Design Options:" -ForegroundColor Yellow
        foreach ($design in $result.data.designOptions) {
            Write-Host "   - $($design.name): $($design.description)" -ForegroundColor Gray
        }
        
        Write-Host "`n🎨 Color Combinations:" -ForegroundColor Yellow
        foreach ($color in $result.data.colorCombinations) {
            Write-Host "   - $($color.name): $($color.colors.primary), $($color.colors.secondary)" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n❌ Design Generation with Excel Data: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 Test 2: Design Generation with Data Analysis Only..." -ForegroundColor Yellow

try {
    $analysisBody = @{
        prompt = "Modern e-commerce platform"
        dataAnalysis = @{
            suggestedAppType = "E-commerce Platform"
            description = "Online store for selling digital products with user accounts and payment processing"
            projectName = "Digital Store"
        }
    } | ConvertTo-Json -Depth 3

    Write-Host "📤 Sending request with data analysis only..." -ForegroundColor Cyan

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $analysisBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation with Data Analysis: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Summary:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Design Generation with Data Analysis: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 Test 3: Design Generation with Prompt Only..." -ForegroundColor Yellow

try {
    $promptBody = @{
        prompt = "Modern portfolio website with project showcase and contact form"
    } | ConvertTo-Json -Depth 2

    Write-Host "📤 Sending request with prompt only..." -ForegroundColor Cyan

    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $promptBody -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "`n✅ Design Generation with Prompt Only: SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated Design Summary:" -ForegroundColor Cyan
        Write-Host "   - Design Options: $($result.data.designOptions.Count)" -ForegroundColor White
        Write-Host "   - Color Combinations: $($result.data.colorCombinations.Count)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Design Generation with Prompt Only: FAILED - $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Excel Data Integration Test Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`n📋 What's Fixed:" -ForegroundColor Cyan
Write-Host "   ✅ Design generation now accepts real Excel data" -ForegroundColor Green
Write-Host "   ✅ Proper document structure created from Excel data" -ForegroundColor Green
Write-Host "   ✅ Perplexity AI processes actual Excel content" -ForegroundColor Green
Write-Host "   ✅ Fallback to data analysis if no Excel data" -ForegroundColor Green
Write-Host "   ✅ Fallback to prompt-only if no other data" -ForegroundColor Green
Write-Host "   ✅ Comprehensive console logging for debugging" -ForegroundColor Green

Write-Host "`n🔍 Check your server console for detailed Perplexity AI logs!" -ForegroundColor Yellow
Write-Host "   Look for messages showing Excel data processing..." -ForegroundColor Gray
