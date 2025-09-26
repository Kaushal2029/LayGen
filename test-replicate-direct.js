// Direct test of Replicate API
const Replicate = require('replicate');

async function testReplicateDirect() {
  console.log('🧪 Testing Replicate API directly...');
  
  // Get token from environment
  const token = process.env.REPLICATE_API_TOKEN;
  

  try {
    const replicate = new Replicate({
      auth: token,
    });
    
    console.log('🤖 Replicate client created successfully');
    
    // Test with Stability AI Stable Diffusion model (latest version)
    const output = await replicate.run(
      "stability-ai/stable-diffusion",
      {
        input: {
          prompt: "A simple test image",
          width: 512,
          height: 512,
          num_inference_steps: 10,
          guidance_scale: 7.5,
          num_outputs: 1
        }
      }
    );
    
    console.log('✅ Success! Output:', output);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📊 Error details:', {
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data
    });
  }
}

testReplicateDirect();
