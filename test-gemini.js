// Simple test script to verify Gemini integration
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  try {
    console.log('Testing Gemini AI integration...');
    
    // Check if API key is provided
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY not found in environment variables');
      console.log('Please set your Gemini API key:');
      console.log('export GEMINI_API_KEY=your_api_key_here');
      return;
    }
    
    console.log('✅ GEMINI_API_KEY found');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('✅ Gemini client initialized');
    
    // Test simple generation
    const prompt = 'Say "Hello from Gemini! Integration test successful."';
    console.log('Testing with prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini response:', text);
    console.log('🎉 Gemini integration test successful!');
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
