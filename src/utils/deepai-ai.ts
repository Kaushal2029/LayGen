import { AIProcessingResult, LayoutData, UploadedDocument } from '@/types';

export class DeepAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    console.log('📄 [DEEPAI] Starting document parsing...');
    console.log('📄 [DEEPAI] Document type:', document.type);
    
    try {
      const response = await fetch('https://api.deepai.org/api/text-generator', {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: `Analyze this ${document.type} document and extract structured data for web application development. Document content: ${document.content}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [DEEPAI] Document parsed successfully');
      
      // Parse the response and create structured data
      const parsedData = this.parseAIResponse(data.output || '');
      
      return {
        success: true,
        layoutData: parsedData,
        confidence: 0.8
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('❌ [DEEPAI] Document parsing failed:', error);
      return {
        success: false,
        error: error.message || 'DeepAI document parsing failed',
        confidence: 0
      };
    }
  }

  async generateCode(layoutData: LayoutData, framework: 'html' | 'react' = 'html'): Promise<AIProcessingResult> {
    console.log('💻 [DEEPAI] Starting code generation...');
    console.log('💻 [DEEPAI] Framework:', framework);
    
    try {
      const selectedColors = (layoutData as any).selectedColors || {}; // eslint-disable-line @typescript-eslint/no-explicit-any
      const description = (layoutData as any).dataAnalysis?.description || 'A modern web application'; // eslint-disable-line @typescript-eslint/no-explicit-any
      
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

      const response = await fetch('https://api.deepai.org/api/text-generator', {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [DEEPAI] Code generated successfully');
      
      // Parse the JSON response
      const codeData = JSON.parse(data.output || '{}');
      
      return {
        success: true,
        layoutData: codeData,
        confidence: 0.8
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('❌ [DEEPAI] Code generation failed:', error);
      return {
        success: false,
        error: error.message || 'DeepAI code generation failed',
        confidence: 0
      };
    }
  }

  private parseAIResponse(response: string): any { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch {
      // If not JSON, create a basic structure
      return {
        dataAnalysis: {
          projectName: 'Generated Project',
          description: response.substring(0, 200) + '...',
          appType: 'Web Application',
          dataType: 'Mixed Content'
        },
        layout: {
          theme: 'modern',
          colors: {
            primary: '#3B82F6',
            secondary: '#6B7280',
            background: '#FFFFFF',
            text: '#111827'
          }
        }
      };
    }
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    console.log('🎨 [DEEPAI] Starting image generation...');
    console.log('📝 [DEEPAI] Prompt:', prompt.substring(0, 100) + '...');
    
    try {
      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: prompt,
          width: '1024',
          height: '768',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [DEEPAI] Image generated successfully');
      console.log('🖼️ [DEEPAI] Response:', data);
      
      if (data.output_url) {
        return {
          success: true,
          layoutData: { image: data.output_url } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          confidence: 0.8
        };
      } else {
        throw new Error('DeepAI returned an unexpected response format');
      }

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('❌ [DEEPAI] DeepAI image generation failed:', error);
      return {
        success: false,
        error: `DeepAI image generation failed: ${error.message || error}`,
        confidence: 0
      };
    }
  }
}
