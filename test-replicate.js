// Simple test script for Replicate AI integration
// Run with: node test-replicate.js

const testReplicate = async () => {
  console.log('🧪 Testing Replicate AI Integration...');
  
  const testPrompt = 'A modern web dashboard with clean design, blue and white colors, cards and charts';
  
  try {
    const response = await fetch('http://localhost:3000/api/test-replicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: testPrompt }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test successful!');
      console.log('📊 Processing time:', data.data.processingTime, 'ms');
      console.log('🖼️ Image URL:', data.data.image);
      console.log('📝 Prompt used:', data.data.prompt);
    } else {
      console.log('❌ Test failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testReplicate();
} else {
  // Browser environment
  console.log('Run this script in Node.js or use the test page at /test-replicate');
}
