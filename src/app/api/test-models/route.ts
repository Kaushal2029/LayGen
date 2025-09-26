import { NextResponse } from 'next/server';
import axios from 'axios';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log('Testing OpenAI Models API...');
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    
    if (!apiKey) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'OpenAI API key not found. Please check your .env.local file.'
      }, { status: 500 });
    }

    // Test models endpoint
    console.log('Fetching available models...');
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Models response status:', response.status);
    console.log('Models response data:', response.data);

    const models = response.data.data || [];
    const availableModels = models
      .filter((model: any) => model.id.includes('gpt') || model.id.includes('dall-e')) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map((model: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: model.id,
        object: model.object,
        owned_by: model.owned_by,
        created: model.created
      }));

    return NextResponse.json<ApiResponse<{ models: any[]; total: number; status: number }>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
      success: true,
      data: {
        models: availableModels,
        total: availableModels.length,
        status: response.status
      },
      message: 'Models fetched successfully'
    });

  } catch (error) {
    console.error('Models API test failed:', error);
    const axiosError = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const errorMessage = axiosError.response ? 
      `Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}` : 
      (error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: `Models API test failed: ${errorMessage}`
    }, { status: 500 });
  }
}
