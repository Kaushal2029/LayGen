import { NextRequest, NextResponse } from 'next/server';
import { DeepAIService } from '@/utils/deepai-ai';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST DEEPAI CODE] Testing DeepAI code generation...');
  const startTime = Date.now();
  
  try {
    const { layoutData, testScenario } = await request.json();
    
    console.log('📋 [TEST DEEPAI CODE] Test scenario:', testScenario);
    console.log('📋 [TEST DEEPAI CODE] Layout data keys:', Object.keys(layoutData || {}));
    
    // Check if DeepAI API key is available
    if (!config.deepai.apiKey) {
      console.log('❌ [TEST DEEPAI CODE] DeepAI API key not configured');
      return NextResponse.json({
        success: false,
        message: 'DeepAI API key not configured',
        error: 'DEEPAI_API_KEY is required for this test',
        isDeepAIGenerated: false
      }, { status: 400 });
    }
    
    console.log('🤖 [TEST DEEPAI CODE] Creating DeepAI service...');
    const deepaiService = new DeepAIService(config.deepai.apiKey);
    
    console.log('🧠 [TEST DEEPAI CODE] Calling DeepAI generateCode...');
    const result = await deepaiService.generateCode(layoutData, 'html');
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ [TEST DEEPAI CODE] Processing time: ${processingTime}ms`);
    
    console.log('📊 [TEST DEEPAI CODE] DeepAI result:', {
      success: result.success,
      hasLayoutData: !!result.layoutData,
      error: result.error,
      confidence: result.confidence
    });
    
    if (result.success) {
      console.log('✅ [TEST DEEPAI CODE] DeepAI code generation successful!');
      
      // Validate the generated code structure
      const codeData = result.layoutData as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const validation = {
        hasHtml: !!codeData.html,
        hasCss: !!codeData.css,
        hasJavascript: !!codeData.javascript,
        hasReadme: !!codeData.readme,
        htmlLength: codeData.html?.length || 0,
        cssLength: codeData.css?.length || 0,
        jsLength: codeData.javascript?.length || 0,
        readmeLength: codeData.readme?.length || 0
      };
      
      console.log('📊 [TEST DEEPAI CODE] Code validation:', validation);
      
      // Check if the code is usable
      const isUsable = validation.hasHtml && validation.hasCss && 
                      validation.htmlLength > 100 && validation.cssLength > 50;
      
      return NextResponse.json({
        success: true,
        message: 'DeepAI code generation successful',
        data: codeData,
        isDeepAIGenerated: true,
        validation,
        isUsable,
        processingTime,
        testScenario,
        aiProvider: 'DeepAI'
      });
    } else {
      console.log('❌ [TEST DEEPAI CODE] DeepAI code generation failed:', result.error);
      
      return NextResponse.json({
        success: false,
        message: 'DeepAI code generation failed',
        error: result.error,
        isDeepAIGenerated: false,
        processingTime,
        testScenario,
        aiProvider: 'DeepAI'
      }, { status: 500 });
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [TEST DEEPAI CODE] Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'DeepAI test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      isDeepAIGenerated: false,
      processingTime,
      aiProvider: 'DeepAI'
    }, { status: 500 });
  }
}
