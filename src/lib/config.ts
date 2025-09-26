// Configuration for Laygen application

export const config = {
  // API Keys (set these in your environment variables)
  
  ai: {
    provider: 'gemini' as const,
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-1.5-flash',
    fallbackProvider: 'openai' as const,
    fallbackApiKey: process.env.OPENAI_API_KEY || '',
    fallbackModel: 'gpt-3.5-turbo'
  },
  
  // Replicate AI for image generation
  replicate: {
    apiKey: process.env.REPLICATE_API_TOKEN || '',
    defaultModel: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46e38a211633768e4ea5badbff3d474b0a0b3a1866d9',
    imageGeneration: {
      width: 1024,
      height: 768,
      numInferenceSteps: 20,
      guidanceScale: 7.5,
      numOutputs: 1
    }
  },
  
  // DeepAI for image generation
  deepai: {
    apiKey: process.env.DEEPAI_API_KEY || '',
    imageGeneration: {
      width: 1024,
      height: 768
    }
  },
  
  // Perplexity AI for code generation and analysis
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    models: {
      codeGeneration: 'sonar-pro',
      analysis: 'sonar-pro',
      imagePrompt: 'sonar-pro'
    },
    settings: {
      maxTokens: 4000,
      temperature: 0.2
    }
  },
  
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'Laygen',
    description: 'From Requirements to Ready UI — Instantly'
  },
  
  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: ['.txt', '.md', '.pdf', '.doc', '.docx']
  },
  
  
  // Code generation settings
  codeGeneration: {
    defaultFramework: 'nextjs' as const,
    includeTypeScript: true,
    includeTailwindCSS: true,
    includeResponsiveDesign: true
  }
};

// Validation functions
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.ai.apiKey) {
    errors.push('GEMINI_API_KEY is required');
  }
  
  if (config.ai.fallbackProvider === 'openai' && !config.ai.fallbackApiKey) {
    errors.push('OPENAI_API_KEY is required as fallback');
  }
  
  if (!config.replicate.apiKey) {
    errors.push('REPLICATE_API_TOKEN is required for image generation');
  }
  
  if (!config.deepai.apiKey) {
    errors.push('DEEPAI_API_KEY is required for image generation');
  }
  
  if (!config.perplexity.apiKey) {
    errors.push('PERPLEXITY_API_KEY is required for Perplexity AI services');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to get environment variable with fallback
export function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

// Development mode check
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
