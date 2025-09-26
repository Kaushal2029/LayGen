import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 [TEST MODELS] Testing Perplexity AI model availability...');
  
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityApiKey) {
    return NextResponse.json({
      success: false,
      error: 'PERPLEXITY_API_KEY not configured'
    }, { status: 400 });
  }

  // List of common model names to test
  const modelsToTest = [
    'llama-3.1-haiku',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-medium-128k-online',
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-opus',
    'mistral-7b-instruct',
    'sonar-medium-online',
    'sonar-small-online',
    'sonar-large-online'
  ];

  const results = [];

  for (const model of modelsToTest) {
    try {
      console.log(`🧪 [TEST MODELS] Testing model: ${model}`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 10
        })
      });

      const responseData = await response.json();
      
      if (response.ok) {
        console.log(`✅ [TEST MODELS] Model ${model} works!`);
        results.push({
          model,
          status: 'success',
          response: responseData
        });
      } else {
        console.log(`❌ [TEST MODELS] Model ${model} failed:`, responseData);
        results.push({
          model,
          status: 'error',
          error: responseData.error?.message || 'Unknown error'
        });
      }
    } catch (error) {
      console.log(`❌ [TEST MODELS] Model ${model} error:`, error);
      results.push({
        model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Model testing completed',
    results
  });
}
