import Replicate from 'replicate';
import { AIProcessingResult } from '@/types';

export class ReplicateAIService {
  private replicate: Replicate;

  constructor(apiKey: string) {
    this.replicate = new Replicate({
      auth: apiKey,
    });
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    console.log('🎨 [REPLICATE AI] Starting image generation...');
    console.log('📝 [REPLICATE AI] Prompt:', prompt.substring(0, 100) + '...');
    
    try {
      // Use a working image generation model
      const output = await this.replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            width: 1024,
            height: 768,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            num_outputs: 1
          }
        }
      );

      console.log('✅ [REPLICATE AI] Image generated successfully');
      console.log('🖼️ [REPLICATE AI] Output type:', typeof output);
      
      // Handle different output formats
      let imageUrl: string;
      if (Array.isArray(output)) {
        imageUrl = output[0] as string;
      } else {
        imageUrl = output as string;
      }

      return {
        success: true,
        layoutData: {
          image: imageUrl,
          prompt: prompt,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ [REPLICATE AI] Image generation failed:', error);
      return {
        success: false,
        error: `Replicate image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Alternative method using different models
  async generateImageWithModel(prompt: string, model: string = "stability-ai/stable-diffusion"): Promise<AIProcessingResult> {
    console.log('🎨 [REPLICATE AI] Starting image generation with model:', model);
    console.log('📝 [REPLICATE AI] Prompt:', prompt.substring(0, 100) + '...');
    
    try {
      const output = await this.replicate.run(
        model,
        {
          input: {
            prompt: prompt,
            width: 1024,
            height: 768,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            num_outputs: 1
          }
        }
      );

      console.log('✅ [REPLICATE AI] Image generated successfully with model:', model);
      
      let imageUrl: string;
      if (Array.isArray(output)) {
        imageUrl = output[0] as string;
      } else {
        imageUrl = output as string;
      }

      return {
        success: true,
        layoutData: {
          image: imageUrl,
          prompt: prompt,
          model: model,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ [REPLICATE AI] Image generation failed with model:', model, error);
      return {
        success: false,
        error: `Replicate image generation failed with model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
