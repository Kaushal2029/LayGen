import { NextResponse } from 'next/server';
import { PerplexityAIService } from '@/utils/perplexity-ai';

export async function GET() {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'PERPLEXITY_API_KEY not found in environment variables'
      }, { status: 400 });
    }

    console.log('🔑 [TEST] Testing Perplexity API key...');
    console.log('🔑 [TEST] API Key:', apiKey.substring(0, 10) + '...');
    console.log('🔑 [TEST] API Key length:', apiKey.length);
    console.log('🔑 [TEST] API Key starts with pplx-:', apiKey.startsWith('pplx-'));

    // Create service instance
    const service = new PerplexityAIService(apiKey);
    
    // Test with a simple document
    const testDocument = {
      id: 'test-doc',
      name: 'test.txt',
      type: 'txt' as const,
      size: 100,
      content: 'This is a test document for API validation.',
      uploadedAt: new Date()
    };

    console.log('🚀 [TEST] Sending test request to Perplexity AI...');
    const result = await service.parseDocument(testDocument);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Perplexity API key is working correctly',
        data: {
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10),
          result: result.layoutData
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: {
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10)
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [TEST] Perplexity API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        hasApiKey: !!process.env.PERPLEXITY_API_KEY,
        apiKeyLength: process.env.PERPLEXITY_API_KEY?.length || 0,
        apiKeyPrefix: process.env.PERPLEXITY_API_KEY?.substring(0, 10) || 'N/A'
      }
    }, { status: 500 });
  }
}
