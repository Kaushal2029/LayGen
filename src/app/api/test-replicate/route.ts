import { NextRequest, NextResponse } from 'next/server';
import { ReplicateAIService } from '@/utils/replicate-ai';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST REPLICATE] Starting Replicate AI test...');
  const startTime = Date.now();
  
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      console.log('❌ [TEST REPLICATE] No prompt provided');
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    console.log('📝 [TEST REPLICATE] Test prompt:', prompt);
    console.log('🔑 [TEST REPLICATE] Replicate API key available:', !!config.replicate.apiKey);
    
    if (!config.replicate.apiKey) {
      console.log('❌ [TEST REPLICATE] Replicate API key not configured');
      return NextResponse.json({
        success: false,
        error: 'REPLICATE_API_TOKEN is not configured. Please add it to your .env.local file.'
      }, { status: 500 });
    }

    console.log('🤖 [TEST REPLICATE] Creating Replicate AI service...');
    const replicateService = new ReplicateAIService(config.replicate.apiKey);
    
    console.log('🎨 [TEST REPLICATE] Generating image...');
    const result = await replicateService.generateImage(prompt);
    
    const processingTime = Date.now() - startTime;
    console.log('✅ [TEST REPLICATE] Test completed in', processingTime, 'ms');
    console.log('📊 [TEST REPLICATE] Result success:', result.success);
    
    if (result.success) {
      console.log('🖼️ [TEST REPLICATE] Image URL:', result.layoutData?.image);
      return NextResponse.json({
        success: true,
        data: {
          image: result.layoutData?.image,
          prompt: prompt,
          processingTime: processingTime,
          generatedAt: result.layoutData?.generatedAt
        },
        message: 'Image generated successfully!'
      });
    } else {
      console.log('❌ [TEST REPLICATE] Image generation failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        processingTime: processingTime
      }, { status: 500 });
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [TEST REPLICATE] Test failed after', processingTime, 'ms:', error);
    return NextResponse.json({
      success: false,
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      processingTime: processingTime
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Replicate AI Test Endpoint',
    usage: 'POST with { "prompt": "your image description" }',
    example: {
      prompt: "A modern web dashboard with clean design, blue and white colors, cards and charts"
    }
  });
}
