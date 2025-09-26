import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    // Initialize AI service
    console.log('Creating AI service for image generation...');
    const aiService = createAIService();
    console.log('AI service created successfully for image generation');
    
    // Generate image
    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
    const result = await aiService.generateImage(prompt);
    console.log('Image generation result:', result.success ? 'Success' : 'Failed');

    if (!result.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<any>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
      success: true,
      data: result.layoutData,
      message: 'Image generated successfully'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
