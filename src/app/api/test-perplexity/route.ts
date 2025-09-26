import { NextRequest, NextResponse } from 'next/server';
import { PerplexityAIService } from '@/utils/perplexity-ai';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST PERPLEXITY] Testing Perplexity AI...');
  
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error('❌ [TEST PERPLEXITY] JSON parsing error:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }
    
    const { testType, data } = requestBody;
    
    console.log('📥 [TEST PERPLEXITY] Request body:', {
      testType,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : []
    });
    
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    console.log('🔑 [TEST PERPLEXITY] API Key check:', {
      exists: !!perplexityApiKey,
      length: perplexityApiKey?.length || 0,
      startsWith: perplexityApiKey?.substring(0, 10) + '...' || 'N/A'
    });
    
    if (!perplexityApiKey) {
      return NextResponse.json({
        success: false,
        error: 'PERPLEXITY_API_KEY not configured'
      }, { status: 400 });
    }
    
    const perplexityService = new PerplexityAIService(perplexityApiKey);
    
    let result;
    
    switch (testType) {
      case 'code':
        console.log('🧪 [TEST PERPLEXITY] Testing code generation...');
        result = await perplexityService.generateCode(data, 'html');
        break;
        
      case 'image':
        console.log('🧪 [TEST PERPLEXITY] Testing image prompt generation...');
        result = await perplexityService.generateImage(data.prompt || 'Modern web application dashboard');
        break;
        
      case 'analysis':
        console.log('🧪 [TEST PERPLEXITY] Testing document analysis...');
        result = await perplexityService.parseDocument(data);
        break;
        
      case 'layout':
        console.log('🧪 [TEST PERPLEXITY] Testing layout generation...');
        result = await perplexityService.generateLayoutVariations(data);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Use: code, image, analysis, or layout'
        }, { status: 400 });
    }
    
    console.log('📊 [TEST PERPLEXITY] Result:', {
      success: result.success,
      hasLayoutData: !!result.layoutData,
      error: result.error
    });
    
    return NextResponse.json({
      success: result.success,
      message: `Perplexity AI ${testType} test ${result.success ? 'successful' : 'failed'}`,
      data: result.layoutData,
      error: result.error,
      confidence: result.confidence,
      suggestions: result.suggestions
    });
    
  } catch (error) {
    console.error('❌ [TEST PERPLEXITY] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Perplexity AI test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Perplexity AI Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        testType: 'code|image|analysis|layout',
        data: 'Test data based on testType'
      }
    },
    examples: {
      code: {
        testType: 'code',
        data: {
          dataAnalysis: { description: 'A modern e-commerce website' },
          selectedColors: { primary: '#3B82F6', secondary: '#10B981' }
        }
      },
      image: {
        testType: 'image',
        data: { prompt: 'Modern web application dashboard' }
      },
      analysis: {
        testType: 'analysis',
        data: {
          type: 'txt',
          name: 'test.txt',
          content: 'Sample document content for analysis'
        }
      },
      layout: {
        testType: 'layout',
        data: {
          suggestedAppType: 'E-commerce',
          description: 'Online store for selling products'
        }
      }
    }
  });
}
