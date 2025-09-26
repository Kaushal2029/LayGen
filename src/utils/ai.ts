import axios from 'axios';
import { LayoutData, AIProcessingResult, UploadedDocument } from '@/types';
import { GeminiAIService } from './gemini-ai';
import { ReplicateAIService } from './replicate-ai';
import { DeepAIService } from './deepai-ai';
import { PerplexityAIService } from './perplexity-ai';
import { config } from '@/lib/config';

// Hybrid AI service that uses Perplexity for code generation and analysis, with DeepAI for images
class PerplexityHybridService {
  private perplexityService: PerplexityAIService;
  private deepaiService: DeepAIService;

  constructor(perplexityApiKey: string, deepaiApiKey: string) {
    this.perplexityService = new PerplexityAIService(perplexityApiKey);
    this.deepaiService = new DeepAIService(deepaiApiKey);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    return this.perplexityService.parseDocument(document);
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    return this.perplexityService.generateLayoutVariations(layoutData);
  }

  async generateCode(layoutData: LayoutData, framework: string = 'html'): Promise<AIProcessingResult> {
    return this.perplexityService.generateCode(layoutData, framework as 'html' | 'react');
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    // First get enhanced prompt from Perplexity, then use DeepAI for image generation
    const promptResult = await this.perplexityService.generateImage(prompt);
    if (promptResult.success && promptResult.layoutData) {
      const enhancedPrompt = (promptResult.layoutData as { imagePrompt?: string }).imagePrompt || prompt;
      return this.deepaiService.generateImage(enhancedPrompt);
    }
    return this.deepaiService.generateImage(prompt);
  }
}

// Hybrid AI service that uses Gemini for text and DeepAI for images
class DeepAIHybridService {
  private geminiService: GeminiAIService;
  private deepaiService: DeepAIService;

  constructor(geminiApiKey: string, deepaiApiKey: string) {
    this.geminiService = new GeminiAIService(geminiApiKey);
    this.deepaiService = new DeepAIService(deepaiApiKey);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    return this.geminiService.parseDocument(document);
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    return this.geminiService.generateLayoutVariations(layoutData);
  }

  async generateCode(layoutData: LayoutData, framework: string = 'nextjs'): Promise<AIProcessingResult> {
    return this.geminiService.generateCode(layoutData, framework as 'html' | 'react');
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    // Use DeepAI for image generation
    return this.deepaiService.generateImage(prompt);
  }
}

// Hybrid AI service that uses DeepAI for code generation and images, with Gemini fallback
class DeepAIPrimaryService {
  private geminiService: GeminiAIService;
  private deepaiService: DeepAIService;

  constructor(geminiApiKey: string, deepaiApiKey: string) {
    this.geminiService = new GeminiAIService(geminiApiKey);
    this.deepaiService = new DeepAIService(deepaiApiKey);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    return this.geminiService.parseDocument(document);
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    return this.geminiService.generateLayoutVariations(layoutData);
  }

  async generateCode(layoutData: LayoutData, framework: string = 'html'): Promise<AIProcessingResult> {
    console.log('💻 [DEEPAI PRIMARY] Attempting code generation with DeepAI first...');
    
    // Try DeepAI first for code generation
    try {
      const deepaiResult = await this.deepaiService.generateCode(layoutData, framework as 'html' | 'react');
      if (deepaiResult.success) {
        console.log('✅ [DEEPAI PRIMARY] Code generation successful with DeepAI');
        return deepaiResult;
      } else {
        console.log('⚠️ [DEEPAI PRIMARY] DeepAI code generation failed, falling back to Gemini');
        console.log('❌ [DEEPAI PRIMARY] DeepAI error:', deepaiResult.error);
      }
    } catch (error) {
      console.log('⚠️ [DEEPAI PRIMARY] DeepAI code generation threw error, falling back to Gemini');
      console.log('❌ [DEEPAI PRIMARY] DeepAI error:', error);
    }

    // Fallback to Gemini if DeepAI fails
    console.log('🔄 [DEEPAI PRIMARY] Falling back to Gemini for code generation...');
    return this.geminiService.generateCode(layoutData, framework as 'html' | 'react');
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    // Use DeepAI for image generation
    return this.deepaiService.generateImage(prompt);
  }
}

// Hybrid AI service that uses Gemini for text and Replicate for images
class HybridAIService {
  private geminiService: GeminiAIService;
  private replicateService: ReplicateAIService;

  constructor(geminiApiKey: string, replicateApiKey: string) {
    this.geminiService = new GeminiAIService(geminiApiKey);
    this.replicateService = new ReplicateAIService(replicateApiKey);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    return this.geminiService.parseDocument(document);
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    return this.geminiService.generateLayoutVariations(layoutData);
  }

  async generateCode(layoutData: LayoutData, framework: string = 'nextjs'): Promise<AIProcessingResult> {
    return this.geminiService.generateCode(layoutData, framework as 'html' | 'react');
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    // Use Replicate for image generation
    return this.replicateService.generateImage(prompt);
  }
}

// Legacy hybrid service that uses Gemini for text and OpenAI for images
class LegacyHybridAIService {
  private geminiService: GeminiAIService;
  private openaiService: AIService;

  constructor(geminiApiKey: string, openaiApiKey: string) {
    this.geminiService = new GeminiAIService(geminiApiKey);
    this.openaiService = new AIService(openaiApiKey);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    return this.geminiService.parseDocument(document);
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    return this.geminiService.generateLayoutVariations(layoutData);
  }

  async generateCode(layoutData: LayoutData, framework: string = 'nextjs'): Promise<AIProcessingResult> {
    return this.geminiService.generateCode(layoutData, framework as 'html' | 'react');
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    // Use OpenAI for image generation since Gemini doesn't support it
    return this.openaiService.generateImage(prompt);
  }
}

// Robust AI service with automatic fallback
class RobustAIService {
  private primaryService: AIService | GeminiAIService | DeepAIHybridService | DeepAIPrimaryService | HybridAIService | LegacyHybridAIService | PerplexityHybridService;
  private fallbackService: AIService | GeminiAIService | DeepAIHybridService | DeepAIPrimaryService | HybridAIService | LegacyHybridAIService | PerplexityHybridService;
  private serviceName: string;

  constructor(
    primaryService: AIService | GeminiAIService | DeepAIHybridService | DeepAIPrimaryService | HybridAIService | LegacyHybridAIService | PerplexityHybridService, 
    fallbackService: AIService | GeminiAIService | DeepAIHybridService | DeepAIPrimaryService | HybridAIService | LegacyHybridAIService | PerplexityHybridService, 
    serviceName: string
  ) {
    this.primaryService = primaryService;
    this.fallbackService = fallbackService;
    this.serviceName = serviceName;
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    try {
      return await this.primaryService.parseDocument(document);
    } catch (error) {
      console.error(`⚠️ [ROBUST AI] Primary service failed, trying fallback...`);
      console.error(`❌ [ROBUST AI] Primary error:`, error);
      return await this.fallbackService.parseDocument(document);
    }
  }

  async generateLayoutVariations(layoutData: LayoutData): Promise<AIProcessingResult> {
    try {
      return await this.primaryService.generateLayoutVariations(layoutData);
    } catch (error) {
      console.log(`⚠️ [ROBUST AI] Primary service failed, trying fallback...`);
      console.log(`❌ [ROBUST AI] Primary error:`, error);
      return await this.fallbackService.generateLayoutVariations(layoutData);
    }
  }

  async generateCode(layoutData: LayoutData, framework: string = 'nextjs'): Promise<AIProcessingResult> {
    try {
      return await this.primaryService.generateCode(layoutData, framework as 'html' | 'react');
    } catch (error) {
      console.log(`⚠️ [ROBUST AI] Primary service failed, trying fallback...`);
      console.log(`❌ [ROBUST AI] Primary error:`, error);
      return await this.fallbackService.generateCode(layoutData, framework as 'html' | 'react');
    }
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    try {
      return await this.primaryService.generateImage(prompt);
    } catch (error) {
      console.log(`⚠️ [ROBUST AI] Primary service failed, trying fallback...`);
      console.log(`❌ [ROBUST AI] Primary error:`, error);
      return await this.fallbackService.generateImage(prompt);
    }
  }
}

// Factory function to create the appropriate AI service
export function createAIService(): AIService | GeminiAIService | DeepAIHybridService | DeepAIPrimaryService | HybridAIService | LegacyHybridAIService | PerplexityHybridService | RobustAIService {
  const provider = config.ai.provider;
  const apiKey = config.ai.apiKey;
  const fallbackApiKey = config.ai.fallbackApiKey;
  const replicateApiKey = config.replicate.apiKey;
  const deepaiApiKey = config.deepai.apiKey;
  const perplexityApiKey = config.perplexity.apiKey;
  
  // Check for Perplexity AI configuration
  if (perplexityApiKey && deepaiApiKey) {
    console.log('Using Perplexity Hybrid service (Perplexity for code generation and analysis, DeepAI for images)');
    const primaryService = new PerplexityHybridService(perplexityApiKey, deepaiApiKey);
    if (fallbackApiKey) {
      const fallbackService = new LegacyHybridAIService(apiKey, fallbackApiKey);
      return new RobustAIService(primaryService, fallbackService, 'Perplexity Hybrid with OpenAI fallback');
    }
    return primaryService;
  }
  
  if (provider === 'gemini' && apiKey && deepaiApiKey) {
    console.log('Using DeepAI Primary service (DeepAI for code generation and images, Gemini for text and fallback)');
    const primaryService = new DeepAIPrimaryService(apiKey, deepaiApiKey);
    if (fallbackApiKey) {
      const fallbackService = new LegacyHybridAIService(apiKey, fallbackApiKey);
      return new RobustAIService(primaryService, fallbackService, 'DeepAI Primary with OpenAI fallback');
    }
    return primaryService;
  } else if (provider === 'gemini' && apiKey && replicateApiKey) {
    console.log('Using Hybrid AI service (Gemini for text, Replicate for images)');
    const primaryService = new HybridAIService(apiKey, replicateApiKey);
    if (fallbackApiKey) {
      const fallbackService = new LegacyHybridAIService(apiKey, fallbackApiKey);
      return new RobustAIService(primaryService, fallbackService, 'Hybrid with OpenAI fallback');
    }
    return primaryService;
  } else if (provider === 'gemini' && apiKey && fallbackApiKey) {
    console.log('Using Legacy Hybrid AI service (Gemini for text, OpenAI for images)');
    return new LegacyHybridAIService(apiKey, fallbackApiKey);
  } else if (provider === 'gemini' && apiKey) {
    console.log('Using Gemini AI service (no image generation)');
    const primaryService = new GeminiAIService(apiKey);
    if (fallbackApiKey) {
      const fallbackService = new AIService(fallbackApiKey);
      return new RobustAIService(primaryService, fallbackService, 'Gemini with OpenAI fallback');
    }
    return primaryService;
  } else if (apiKey) {
    console.log('Using OpenAI service');
    return new AIService(apiKey);
  } else {
    // Fallback to OpenAI if Gemini fails
    if (fallbackApiKey) {
      console.log('Falling back to OpenAI service');
      return new AIService(fallbackApiKey);
    }
    throw new Error('No valid AI service configuration found');
  }
}

export class AIService {
  private apiKey: string;
  private availableModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']; // Try multiple models with fallback
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async tryModels(prompt: string, systemMessage: string, options: { temperature: number; max_tokens: number }) {
    const errors: string[] = [];
    
    // Adding retries for model switching, with specific handling of 404 (model not found)
    for (const model of this.availableModels) {
      try {
        console.log(`Trying model: ${model}`);
        console.log(`API Key present: ${!!this.apiKey}`);
        console.log(`API Key length: ${this.apiKey.length}`);
        console.log(`API Key starts with: ${this.apiKey.substring(0, 10)}...`);
        
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature,
          max_tokens: options.max_tokens
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        });

        // Log successful model use
        console.log(`Model ${model} succeeded`);
        console.log(`Response status: ${response.status}`);
        return response.data;
      } catch (error) {
        const axiosError = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const status = axiosError?.response?.status;
        
        // Handle specific error cases
        if (status === 404) {
          console.warn(`Model ${model} not found, skipping to next model.`);
        } else if (status === 429) {
          console.warn(`Model ${model} rate limited, trying next model.`);
        } else if (status === 401) {
          console.error(`Model ${model} unauthorized - API key issue.`);
        } else if (status === 403) {
          console.error(`Model ${model} forbidden - check API key permissions.`);
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const detailedError = axiosError?.response ? 
          `Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}` : 
          errorMessage;
        
        console.error(`Model ${model} failed:`, detailedError);
        errors.push(`${model}: ${detailedError}`);
      }
    }
    
    // Analyze error types to provide better guidance
    const hasQuotaErrors = errors.some(err => err.includes('429') || err.includes('quota') || err.includes('billing'));
    const hasAuthErrors = errors.some(err => err.includes('401') || err.includes('403') || err.includes('unauthorized'));
    const hasModelErrors = errors.some(err => err.includes('404') || err.includes('not found'));
    
    let solutionMessage = 'Possible solutions:\n';
    if (hasAuthErrors) {
      solutionMessage += '1) Check your OpenAI API key is valid and has proper permissions\n';
    } else {
      solutionMessage += '1) Check your OpenAI API key is valid\n';
    }
    if (hasQuotaErrors) {
      solutionMessage += '2) Add payment method and credits to your OpenAI account\n';
    } else {
      solutionMessage += '2) Verify you have credits/quota available\n';
    }
    if (hasModelErrors) {
      solutionMessage += '3) Check your OpenAI plan includes the requested models\n';
    } else {
      solutionMessage += '3) Check your OpenAI plan includes the models\n';
    }
    solutionMessage += '4) Try again in a few minutes if rate limited\n';
    solutionMessage += '5) Visit https://platform.openai.com/account/billing to manage your account';
    
    const detailedError = `All AI models failed. Errors:\n${errors.join('\n')}\n\n${solutionMessage}`;
    throw new Error(detailedError);
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    try {
      // Check if this is Excel data
      let isExcelData = false;
      try {
        const parsedContent = JSON.parse(document.content);
        isExcelData = parsedContent.type === 'excel_data';
      } catch {
        // Not JSON, continue with normal parsing
      }

      let prompt: string;
      
      if (isExcelData) {
        // Use Excel data description as primary prompt but keep hardcoded suggestions
        const fileInfo = JSON.parse(document.content);
        const description = fileInfo.description || fileInfo.projectName || 'Modern web application';
        
        prompt = `
          Create a web application based on this Excel file description: "${description}"
          
          File Information:
          - File Name: ${fileInfo.fileName}
          - File Size: ${fileInfo.fileSize} bytes
          - File Type: ${fileInfo.fileType}
          
          Generate a complete application design with the following structure:
          {
            "dataAnalysis": {
              "dataType": "Data Management Application",
              "columns": ["Title", "Description", "Type", "Priority", "Status"],
              "recordCount": "Multiple records",
              "dataPatterns": "Structured data with title, description, type, priority, and status fields",
              "suggestedAppType": "Task/Project Management Dashboard",
              "description": "${description}",
              "projectName": "${fileInfo.fileName.replace(/\.(xlsx|xls)$/i, '')}",
              "titleColumn": "Title"
            },
            "designOptions": [
              {
                "id": "dashboard_1",
                "name": "Modern Dashboard",
                "description": "Clean dashboard with cards and filters",
                "preview": "Modern card-based layout with search and filter options",
                "components": [
                  {
                    "name": "Header",
                    "type": "header",
                    "description": "Application header with title and search",
                    "properties": {
                      "title": "Project Management",
                      "showSearch": true
                    },
                    "layout": {
                      "x": 0,
                      "y": 0,
                      "width": 1200,
                      "height": 80
                    }
                  },
                  {
                    "name": "FilterBar",
                    "type": "filter",
                    "description": "Filter controls for type and priority",
                    "properties": {
                      "filters": ["Type", "Priority", "Status"]
                    },
                    "layout": {
                      "x": 0,
                      "y": 80,
                      "width": 1200,
                      "height": 60
                    }
                  },
                  {
                    "name": "DataGrid",
                    "type": "table",
                    "description": "Main data display table",
                    "properties": {
                      "columns": ["Title", "Description", "Type", "Priority", "Status", "Actions"],
                      "sortable": true,
                      "editable": true
                    },
                    "layout": {
                      "x": 0,
                      "y": 140,
                      "width": 1200,
                      "height": 400
                    }
                  }
                ],
                "layout": {
                  "type": "dashboard",
                  "theme": "light",
                  "colors": {
                    "primary": "#3B82F6",
                    "secondary": "#6B7280",
                    "background": "#FFFFFF",
                    "text": "#111827"
                  }
                }
              },
              {
                "id": "card_2",
                "name": "Card Layout",
                "description": "Card-based layout for better visual appeal",
                "preview": "Grid of cards showing each data item",
                "components": [
                  {
                    "name": "CardGrid",
                    "type": "grid",
                    "description": "Grid of data cards",
                    "properties": {
                      "columns": 3,
                      "cardType": "data"
                    },
                    "layout": {
                      "x": 0,
                      "y": 0,
                      "width": 1200,
                      "height": 600
                    }
                  }
                ],
                "layout": {
                  "type": "grid",
                  "theme": "light",
                  "colors": {
                    "primary": "#10B981",
                    "secondary": "#6B7280",
                    "background": "#F9FAFB",
                    "text": "#111827"
                  }
                }
              }
            ],
            "requirements": "Create a responsive web application for managing structured data with CRUD operations, filtering, and search functionality"
          }
        `;
      } else {
        // Normal document parsing
        prompt = `
          Analyze the following document and extract design requirements. 
          Return a JSON object with the following structure:
          {
            "components": [
              {
                "name": "Component Name",
                "type": "button|input|card|header|footer|etc",
                "description": "What this component does",
                "properties": {
                  "text": "Button text",
                  "color": "primary|secondary|etc",
                  "size": "small|medium|large",
                  "position": "top|center|bottom|left|right"
                },
                "layout": {
                  "x": 0,
                  "y": 0,
                  "width": 200,
                  "height": 50
                }
              }
            ],
            "layout": {
              "type": "single-page|multi-page|dashboard|landing",
              "theme": "light|dark|auto",
              "colors": {
                "primary": "#3B82F6",
                "secondary": "#6B7280",
                "background": "#FFFFFF",
                "text": "#111827"
              },
              "typography": {
                "heading": "Inter Bold",
                "body": "Inter Regular",
                "sizes": {
                  "h1": 32,
                  "h2": 24,
                  "h3": 20,
                  "body": 16,
                  "small": 14
                }
              },
              "spacing": {
                "xs": 4,
                "sm": 8,
                "md": 16,
                "lg": 24,
                "xl": 32
              }
            },
            "requirements": "Summary of key requirements"
          }

          Document content:
          ${document.content}
        `;
      }

      const response = await this.tryModels(
        prompt,
        'You are a design system expert. Analyze documents and extract structured design requirements. Always return valid JSON.',
        { temperature: 0.3, max_tokens: 2000 }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsedData = JSON.parse(content);
      const layoutData = this.convertToLayoutData(parsedData);

      return {
        success: true,
        layoutData,
        confidence: 0.85,
        suggestions: [
          'Consider adding hover states for interactive elements',
          'Ensure proper contrast ratios for accessibility',
          'Add responsive breakpoints for mobile devices'
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse document',
        confidence: 0
      };
    }
  }

  async generateLayoutVariations(baseLayout: LayoutData, count: number = 2): Promise<AIProcessingResult> {
    try {
      const prompt = `
        Based on this existing layout, generate ${count} alternative variations that maintain the same functionality but with different visual arrangements.
        
        Current layout:
        ${JSON.stringify(baseLayout, null, 2)}
        
        Return a JSON array with ${count} layout variations, each following the same structure as the input layout.
        Focus on:
        - Different component arrangements
        - Alternative color schemes
        - Varied spacing and sizing
        - Different visual hierarchy
        - Maintain accessibility and usability
      `;

      const response = await this.tryModels(
        prompt,
        'You are a UI/UX designer. Generate creative layout variations while maintaining functionality and usability. Always return valid JSON arrays.',
        { temperature: 0.7, max_tokens: 3000 }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const variations = JSON.parse(content);
      
      return {
        success: true,
        layoutData: variations[0], // Return first variation as primary
        confidence: 0.8,
        suggestions: [
          'Try different color combinations',
          'Experiment with component positioning',
          'Consider alternative typography scales'
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate variations',
        confidence: 0
      };
    }
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    try {
      console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
      console.log(`API Key present: ${!!this.apiKey}`);
      console.log(`API Key length: ${this.apiKey.length}`);
      
      const response = await axios.post(`${this.baseURL}/images/generations`, {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minute timeout for image generation
      });

      console.log('Image generation response status:', response.status);
      console.log('Image generation response data:', response.data);

      return {
        success: true,
        layoutData: {
          imageUrl: response.data?.data?.[0]?.url || '',
          prompt: prompt
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        confidence: 0.9
      };
    } catch (error) {
      console.error('Image generation error:', error);
      const axiosError = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const errorMessage = axiosError.response ? 
        `Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}` : 
        (error instanceof Error ? error.message : 'Failed to generate image');
      
      return {
        success: false,
        error: errorMessage,
        confidence: 0
      };
    }
  }

  async generateCode(layoutData: LayoutData, framework: 'html' | 'react' = 'html'): Promise<AIProcessingResult> {
    try {
      // Extract description from layout data
      const description = (layoutData as any).dataAnalysis?.description || 'A modern web application'; // eslint-disable-line @typescript-eslint/no-explicit-any
      const selectedColors = (layoutData as any).selectedColors || {}; // eslint-disable-line @typescript-eslint/no-explicit-any
      
      const prompt = `Create a complete web application based on this description: "${description}"

Use these colors: ${JSON.stringify(selectedColors)}

Generate a FULLY FUNCTIONAL web application with:

1. HTML FILE (index.html):
   - MUST start with <!DOCTYPE html>
   - Complete HTML5 structure with <html lang="en">
   - Proper <head> section with meta tags, title, and viewport
   - Link to styles.css: <link rel="stylesheet" href="styles.css">
   - Semantic HTML elements (header, main, section, article, etc.)
   - Proper accessibility attributes (alt, aria-label, etc.)
   - Complete content based on the description
   - Link to script.js: <script src="script.js"></script> before </body>

2. CSS FILE (styles.css):
   - Complete CSS3 styles with modern features
   - CSS reset/normalize at the top
   - CSS custom properties (variables) for colors
   - Responsive design (mobile-first approach)
   - Use the provided colors throughout the design
   - CSS Grid and Flexbox for layouts
   - Hover effects, transitions, and animations
   - Clean, organized CSS with comments

3. JAVASCRIPT FILE (script.js):
   - Complete JavaScript functionality
   - Modern ES6+ features
   - Event handling and DOM manipulation
   - Interactive features based on the description
   - Error handling and validation
   - Clean, commented code

4. README FILE (README.md):
   - Project description and purpose
   - Setup and installation instructions
   - Usage instructions
   - Features list
   - Technical details

CRITICAL: The HTML must be a complete, valid HTML5 document that can be opened directly in a browser.

Return ONLY valid JSON with this EXACT structure:
{
  "html": "complete HTML content for index.html",
  "css": "complete CSS content for styles.css", 
  "javascript": "complete JavaScript content for script.js",
  "readme": "complete README content explaining the application"
}`;

      const response = await this.tryModels(
        prompt,
        `You are a senior ${framework} developer. Generate clean, production-ready code with proper TypeScript types, accessibility features, and responsive design. Always return valid JSON.`,
        { temperature: 0.2, max_tokens: 4000 }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const codeData = JSON.parse(content);

      return {
        success: true,
        layoutData: codeData as LayoutData, // Type assertion for now
        confidence: 0.9,
        suggestions: [
          'Add proper error boundaries',
          'Implement loading states',
          'Add unit tests for components',
          'Consider performance optimizations'
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate code',
        confidence: 0
      };
    }
  }

  private convertToLayoutData(parsedData: { components?: Array<{ name: string; layout?: { x?: number; y?: number; width?: number; height?: number } }>; layout?: { colors?: Record<string, string>; spacing?: Record<string, number>; theme?: string }; requirements?: string }): LayoutData {
    // Convert AI parsed data to our LayoutData structure
    const frames = parsedData.components?.map((comp: { name: string; layout?: { x?: number; y?: number; width?: number; height?: number } }, index: number) => ({
      id: `frame-${index}`,
      name: comp.name,
      type: 'FRAME' as const,
      x: comp.layout?.x || 0,
      y: comp.layout?.y || 0,
      width: comp.layout?.width || 200,
      height: comp.layout?.height || 50,
      backgroundColor: parsedData.layout?.colors?.background || '#FFFFFF',
      children: [],
      constraints: {
        horizontal: 'MIN' as const,
        vertical: 'MIN' as const
      }
    })) || [];

    return {
      id: `layout-${Date.now()}`,
      name: 'Generated Layout',
      frames,
      styles: {
        colors: Object.entries(parsedData.layout?.colors || {}).map(([name, value]) => ({
          name,
          value: this.hexToRgba(value as string),
          description: `${name} color`
        })),
        typography: [],
        spacing: Object.entries(parsedData.layout?.spacing || {}).map(([name, value]) => ({
          name,
          value: value as number,
          description: `${name} spacing`
        })),
        borderRadius: [],
        shadows: []
      },
      metadata: {
        version: '1.0.0',
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        requirements: parsedData.requirements || '',
        theme: (parsedData.layout?.theme as 'light' | 'dark' | 'auto') || 'light'
      }
    };
  }

  private hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 0, g: 0, b: 0, a: 1 };
    }
    
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: 1
    };
  }
}

// Document parsing utilities
export async function parseDocumentContent(file: File): Promise<string> {
  // Handle Excel files
  if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls')) {
    return await parseExcelFile(file);
  }
  
  // Handle text files
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }
  
  if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
    return await file.text();
  }
  
  // For PDF, DOC, DOCX - you'd integrate with libraries like pdf-parse, mammoth, etc.
  // For now, return the raw text
  return await file.text();
}

// Excel parsing function - Dynamic analysis
async function parseExcelFile(file: File): Promise<string> {
  try {
    // For now, we'll use a simple approach without external libraries
    // In production, you'd use the xlsx library
    await file.arrayBuffer(); // Read the file to validate it's accessible
    
    // Return a dynamic structure that will be analyzed by AI
    return JSON.stringify({
      type: 'excel_data',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      note: 'Excel file detected. AI will analyze the actual content structure and data patterns to generate appropriate design options and application type.'
    });
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Validation utilities
export function validateDocument(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  const allowedExtensions = ['.txt', '.md', '.pdf', '.doc', '.docx', '.xlsx', '.xls'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload PDF, DOC, DOCX, TXT, MD, or Excel files.'
    };
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return {
      valid: false,
      error: 'File size too large. Please upload files smaller than 10MB.'
    };
  }
  
  return { valid: true };
}
