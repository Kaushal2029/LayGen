import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST DEEPAI] Starting DeepAI test...');
  
  try {
    const { prompt } = await request.json();
    console.log('📝 [TEST DEEPAI] Prompt:', prompt);
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const aiService = createAIService();
    console.log('🤖 [TEST DEEPAI] AI Service created:', aiService.constructor.name);
    
    const startTime = Date.now();
    const result = await aiService.generateImage(prompt);
    const processingTime = Date.now() - startTime;
    
    console.log('⏱️ [TEST DEEPAI] Processing time:', processingTime + 'ms');
    console.log('✅ [TEST DEEPAI] Result:', result);
    
    return NextResponse.json({
      success: result.success,
      data: result.layoutData,
      error: result.error,
      processingTime,
      service: aiService.constructor.name
    });
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ [TEST DEEPAI] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'DeepAI test failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
