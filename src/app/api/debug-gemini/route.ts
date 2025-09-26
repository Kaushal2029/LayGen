import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    console.log('Debug: Testing Gemini with prompt:', prompt);
    
    const aiService = createAIService();
    
    // Create a simple test document
    const testDocument = {
      id: 'debug-doc',
      name: 'debug.txt',
      type: 'txt' as const,
      size: 100,
      content: prompt || 'Generate a simple JSON object with a "message" field',
      uploadedAt: new Date()
    };

    console.log('Debug: Calling parseDocument...');
    const result = await aiService.parseDocument(testDocument);
    
    console.log('Debug: AI result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      result,
      prompt
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
