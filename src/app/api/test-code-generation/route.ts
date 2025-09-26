import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST CODE API] Starting code generation test...');
  const startTime = Date.now();
  
  try {
    // Create test layout data
    const testLayoutData = {
      dataAnalysis: {
        projectName: 'Test Application',
        description: 'A comprehensive web application for testing AI code generation capabilities'
      },
      selectedColors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827'
      },
      projectName: 'Test Application'
    };

    console.log('📋 [TEST CODE API] Test data:', testLayoutData);

    // Initialize AI service
    console.log('🤖 [TEST CODE API] Creating AI service...');
    const aiService = createAIService();
    console.log('✅ [TEST CODE API] AI service created');

    // Generate code
    console.log('🧠 [TEST CODE API] Generating code...');
    const result = await aiService.generateCode(testLayoutData, 'html');

    if (!result.success) {
      console.log('❌ [TEST CODE API] Code generation failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        isAIGenerated: false
      }, { status: 500 });
    }

    // Extract code data
    const codeData = result.layoutData as any;
    const htmlLength = codeData.html?.length || 0;
    const cssLength = codeData.css?.length || 0;
    const jsLength = codeData.javascript?.length || 0;
    const readmeLength = codeData.readme?.length || 0;

    console.log('📊 [TEST CODE API] Generated code analysis:', {
      htmlLength,
      cssLength,
      jsLength,
      readmeLength,
      totalLength: htmlLength + cssLength + jsLength + readmeLength,
      hasValidContent: htmlLength > 100 && cssLength > 50 && jsLength > 50
    });

    const processingTime = Date.now() - startTime;
    console.log('✅ [TEST CODE API] Test completed in', processingTime, 'ms');

    return NextResponse.json({
      success: true,
      data: codeData,
      isAIGenerated: true,
      analysis: {
        htmlLength,
        cssLength,
        jsLength,
        readmeLength,
        totalLength: htmlLength + cssLength + jsLength + readmeLength,
        hasValidContent: htmlLength > 100 && cssLength > 50 && jsLength > 50,
        processingTime
      },
      message: 'Code generation test completed successfully'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [TEST CODE API] Test failed after', processingTime, 'ms:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isAIGenerated: false,
      processingTime
    }, { status: 500 });
  }
}
