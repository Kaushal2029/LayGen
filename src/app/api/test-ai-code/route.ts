import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST AI CODE] Testing AI code generation...');
  
  try {
    const { layoutData } = await request.json();
    
    console.log('🤖 [TEST AI CODE] Creating AI service...');
    const aiService = createAIService();
    
    console.log('🧠 [TEST AI CODE] Calling generateCode...');
    const result = await aiService.generateCode(layoutData, 'html');
    
    console.log('📊 [TEST AI CODE] Result:', {
      success: result.success,
      hasLayoutData: !!result.layoutData,
      error: result.error
    });
    
    if (result.success) {
      console.log('✅ [TEST AI CODE] AI code generation successful!');
      console.log('📊 [TEST AI CODE] Generated code keys:', Object.keys(result.layoutData || {}));
      
      return NextResponse.json({
        success: true,
        message: 'AI code generation successful',
        data: result.layoutData,
        isAIGenerated: true
      });
    } else {
      console.log('❌ [TEST AI CODE] AI code generation failed:', result.error);
      
      return NextResponse.json({
        success: false,
        message: 'AI code generation failed',
        error: result.error,
        isAIGenerated: false
      });
    }
    
  } catch (error) {
    console.error('❌ [TEST AI CODE] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      isAIGenerated: false
    }, { status: 500 });
  }
}
