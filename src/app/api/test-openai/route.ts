import { NextResponse } from 'next/server';
import axios from 'axios';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log('Testing OpenAI API Key...');
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
    
    if (!apiKey) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'OpenAI API key not found. Please check your .env.local file.'
      }, { status: 500 });
    }

    // Test with a simple API call using axios
    console.log('Testing simple API call with axios...');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say "Hello, API test successful!"' }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const content = response.data.choices[0]?.message?.content;
    console.log('API test response status:', response.status);
    console.log('API test response data:', response.data);

    return NextResponse.json<ApiResponse<{ message: string; model: string; status: number }>>({
      success: true,
      data: {
        message: content || 'No response',
        model: 'gpt-3.5-turbo',
        status: response.status
      },
      message: 'OpenAI API test successful'
    });

  } catch (error) {
    console.error('OpenAI API test failed:', error);
    const axiosError = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const errorMessage = axiosError.response ? 
      `Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}` : 
      (error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: `OpenAI API test failed: ${errorMessage}`
    }, { status: 500 });
  }
}
