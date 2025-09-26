# Comprehensive Perplexity AI Integration Test Script
# This script tests the complete integration with Perplexity AI as primary service

Write-Host "🚀 Testing Perplexity AI Integration in Laygen" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Test 1: Design Generation (Perplexity AI + Fallback)
Write-Host "`n1. Testing Design Generation (Perplexity AI Priority)..." -ForegroundColor Yellow
try {
    $designBody = @{
        prompt = "Modern e-commerce website with product catalog, shopping cart, and user dashboard"
        dataAnalysis = @{
            suggestedAppType = "E-commerce Platform"
            description = "Online store for selling digital products"
        }
    } | ConvertTo-Json -Depth 3

    $designResult = Invoke-RestMethod -Uri "http://localhost:3000/api/design/generate" -Method POST -Body $designBody -ContentType "application/json"
    
    if ($designResult.success) {
        Write-Host "✅ Design Generation: SUCCESS" -ForegroundColor Green
        Write-Host "   - Design Options: $($designResult.data.designOptions.Count)" -ForegroundColor Cyan
        Write-Host "   - Color Combinations: $($designResult.data.colorCombinations.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Design Generation: FAILED - $($designResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Design Generation: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Code Generation (Perplexity AI + Fallback)
Write-Host "`n2. Testing Code Generation (Perplexity AI Priority)..." -ForegroundColor Yellow
try {
    $codeBody = @{
        layoutData = @{
            dataAnalysis = @{
                description = "A modern e-commerce website with shopping cart and product catalog"
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

    $codeResult = Invoke-RestMethod -Uri "http://localhost:3000/api/export/code" -Method POST -Body $codeBody -ContentType "application/json"
    
    if ($codeResult.success) {
        Write-Host "✅ Code Generation: SUCCESS" -ForegroundColor Green
        Write-Host "   - HTML Length: $($codeResult.data.html.Length)" -ForegroundColor Cyan
        Write-Host "   - CSS Length: $($codeResult.data.css.Length)" -ForegroundColor Cyan
        Write-Host "   - JS Length: $($codeResult.data.javascript.Length)" -ForegroundColor Cyan
        Write-Host "   - AI Generated: $($codeResult.isAIGenerated)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Code Generation: FAILED - $($codeResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Code Generation: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Image Generation (Perplexity AI + DeepAI)
Write-Host "`n3. Testing Image Generation (Perplexity AI + DeepAI)..." -ForegroundColor Yellow
try {
    $imageBody = @{
        prompt = "Modern e-commerce dashboard with product cards, shopping cart, and analytics charts"
    } | ConvertTo-Json -Depth 2

    $imageResult = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/generate-image" -Method POST -Body $imageBody -ContentType "application/json"
    
    if ($imageResult.success) {
        Write-Host "✅ Image Generation: SUCCESS" -ForegroundColor Green
        Write-Host "   - Enhanced Prompt: $($imageResult.data.imagePrompt.Substring(0, 100))..." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Image Generation: FAILED - $($imageResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Image Generation: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Document Analysis (Perplexity AI)
Write-Host "`n4. Testing Document Analysis (Perplexity AI)..." -ForegroundColor Yellow
try {
    $analysisBody = @{
        testType = "analysis"
        data = @{
            type = "text"
            name = "business-requirements.txt"
            content = "We need a customer management system with user profiles, order tracking, payment processing, and analytics dashboard."
        }
    } | ConvertTo-Json -Depth 3

    $analysisResult = Invoke-RestMethod -Uri "http://localhost:3000/api/test-perplexity" -Method POST -Body $analysisBody -ContentType "application/json"
    
    if ($analysisResult.success) {
        Write-Host "✅ Document Analysis: SUCCESS" -ForegroundColor Green
        Write-Host "   - App Type: $($analysisResult.layoutData.suggestedAppType)" -ForegroundColor Cyan
        Write-Host "   - Features: $($analysisResult.layoutData.recommendedFeatures.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Document Analysis: FAILED - $($analysisResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Document Analysis: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Layout Generation (Perplexity AI)
Write-Host "`n5. Testing Layout Generation (Perplexity AI)..." -ForegroundColor Yellow
try {
    $layoutBody = @{
        testType = "layout"
        data = @{
            suggestedAppType = "E-commerce Platform"
            description = "Online store for selling digital products with user accounts and payment processing"
        }
    } | ConvertTo-Json -Depth 3

    $layoutResult = Invoke-RestMethod -Uri "http://localhost:3000/api/test-perplexity" -Method POST -Body $layoutBody -ContentType "application/json"
    
    if ($layoutResult.success) {
        Write-Host "✅ Layout Generation: SUCCESS" -ForegroundColor Green
        Write-Host "   - Variations: $($layoutResult.layoutData.variations.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Layout Generation: FAILED - $($layoutResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Layout Generation: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Model Availability Check
Write-Host "`n6. Testing Model Availability..." -ForegroundColor Yellow
try {
    $modelResult = Invoke-RestMethod -Uri "http://localhost:3000/api/test-perplexity-models" -Method GET
    
    if ($modelResult.success) {
        Write-Host "✅ Model Check: SUCCESS" -ForegroundColor Green
        $workingModels = $modelResult.results | Where-Object { $_.status -eq "success" }
        Write-Host "   - Working Models: $($workingModels.Count)" -ForegroundColor Cyan
        foreach ($model in $workingModels) {
            Write-Host "     * $($model.model)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Model Check: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Model Check: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Perplexity AI Integration Test Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "- Perplexity AI is now the PRIMARY service for all AI operations" -ForegroundColor White
Write-Host "- Automatic fallback to other AI services if Perplexity fails" -ForegroundColor White
Write-Host "- Robust JSON parsing with fallback responses" -ForegroundColor White
Write-Host "- Complete design and code generation pipeline" -ForegroundColor White
Write-Host "- Image generation with enhanced prompts" -ForegroundColor White
Write-Host "`n🌐 Web Interface: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🧪 Test Interface: http://localhost:3000/test-perplexity" -ForegroundColor Yellow
