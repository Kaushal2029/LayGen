import { GoogleGenerativeAI } from '@google/generative-ai';
import { LayoutData, AIProcessingResult, UploadedDocument } from '@/types';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

      const systemMessage = 'You are a design system expert. Analyze documents and extract structured design requirements. Always return valid JSON.';
      const fullPrompt = `${systemMessage}\n\n${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Clean the response to extract JSON from markdown if present
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.includes('```json')) {
        const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      } else if (jsonContent.includes('```')) {
        const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      }

      // Try to find JSON object in the response
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }

      // Clean up common JSON issues
      jsonContent = jsonContent
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
        .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, (match: string, value: string, ending: string) => {
          // Only quote if it's not already a number, boolean, or quoted
          const trimmedValue = value.trim();
          if (!/^[\d\-\.]+$/.test(trimmedValue) && !/^(true|false|null)$/.test(trimmedValue) && !trimmedValue.startsWith('"')) {
            return `: "${trimmedValue}"${ending}`;
          }
          return match;
        })
        .replace(/"\s*:\s*"([^"]*)"\s*"/g, '": "$1"') // Fix double-quoted values
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log('Cleaned JSON content:', jsonContent.substring(0, 500) + '...');

      let parsedData;
      try {
        parsedData = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('❌ [GEMINI] JSON parse error:', parseError);
        console.error('Problematic JSON:', jsonContent);
        
        // Try to fix common issues and parse again
        try {
          // More aggressive cleaning
          jsonContent = jsonContent
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Ensure all keys are quoted
            .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, (match: string, value: string, ending: string) => {
              // Only quote if it's not already a number, boolean, or quoted
              const trimmedValue = value.trim();
              if (!/^[\d\-\.]+$/.test(trimmedValue) && !/^(true|false|null)$/.test(trimmedValue) && !trimmedValue.startsWith('"')) {
                return `: "${trimmedValue}"${ending}`;
              }
              return match;
            })
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Re-quote keys after comma removal
            .replace(/:\s*"([^"]*)"\s*([,}])/g, ': "$1"$2') // Ensure proper spacing around quoted values
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          console.log('Retry with cleaned JSON:', jsonContent.substring(0, 500) + '...');
          parsedData = JSON.parse(jsonContent);
        } catch (secondError) {
          console.error('Second JSON parse error:', secondError);
          console.error('Problematic JSON at position 374:', jsonContent.substring(350, 400));
          
          // Final attempt: Try to extract just the essential parts
          try {
            // Try to extract designOptions with better regex
            const designOptionsMatch = jsonContent.match(/"designOptions"\s*:\s*\[([\s\S]*?)\](?=\s*[,}])/);
            if (designOptionsMatch) {
              let designOptionsContent = designOptionsMatch[1];
              
              // Clean the extracted content
              designOptionsContent = designOptionsContent
                .replace(/\/\/.*$/gm, '') // Remove comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
                .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes
                .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, (match: string, value: string, ending: string) => {
                  const trimmedValue = value.trim();
                  if (!/^[\d\-\.]+$/.test(trimmedValue) && !/^(true|false|null)$/.test(trimmedValue) && !trimmedValue.startsWith('"')) {
                    return `: "${trimmedValue}"${ending}`;
                  }
                  return match;
                })
                .replace(/\s+/g, ' ')
                .trim();
              
              const designOptionsJson = `{"designOptions": [${designOptionsContent}]}`;
              console.log('Extracting designOptions only:', designOptionsJson.substring(0, 200) + '...');
              parsedData = JSON.parse(designOptionsJson);
            } else {
              throw new Error('Could not extract designOptions from malformed JSON');
            }
          } catch (finalError) {
            console.error('Final JSON parse error:', finalError);
            // Return a minimal valid response instead of throwing
            parsedData = {
              designOptions: [
                {
                  id: 'fallback-1',
                  name: 'Modern Design',
                  description: 'Clean and modern interface',
                  preview: 'Responsive layout with modern components',
                  components: [
                    {
                      name: 'Header',
                      type: 'header',
                      description: 'Top navigation',
                      properties: { title: 'App' },
                      layout: { x: 0, y: 0, width: 1200, height: 80 }
                    }
                  ],
                  layout: {
                    type: 'dashboard',
                    theme: 'light',
                    colors: {
                      primary: '#3B82F6',
                      secondary: '#6B7280',
                      background: '#FFFFFF',
                      text: '#111827'
                    }
                  }
                }
              ]
            };
            console.log('Using fallback design due to JSON parsing failure');
          }
        }
      }
      
      // Check if this is a design options request (has designOptions array)
      if (parsedData.designOptions && Array.isArray(parsedData.designOptions)) {
        // Return the data as-is for design options
        return {
          success: true,
          layoutData: parsedData,
          confidence: 0.85,
          suggestions: [
            'Consider adding hover states for interactive elements',
            'Ensure proper contrast ratios for accessibility',
            'Add responsive breakpoints for mobile devices'
          ]
        };
      }
      
      // Otherwise, convert to standard layout data
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

      const systemMessage = 'You are a UI/UX designer. Generate creative layout variations while maintaining functionality and usability. Always return valid JSON arrays.';
      const fullPrompt = `${systemMessage}\n\n${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Clean the response to extract JSON from markdown if present
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.includes('```json')) {
        const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      } else if (jsonContent.includes('```')) {
        const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      }

      // Try to find JSON array in the response
      const jsonStart = jsonContent.indexOf('[');
      const jsonEnd = jsonContent.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }

      const variations = JSON.parse(jsonContent);
      
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
      console.log('Generating image with Gemini with prompt:', prompt.substring(0, 100) + '...');
      
      // Note: Gemini doesn't have image generation like DALL-E
      // We'll return a placeholder response indicating this limitation
      return {
        success: false,
        error: 'Image generation is not available with Gemini. Please use OpenAI for image generation.',
        confidence: 0
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
        confidence: 0
      };
    }
  }

  async generateCode(layoutData: LayoutData, framework: 'html' | 'react' = 'html'): Promise<AIProcessingResult> {
    const maxRetries = 5; // Increased retries
    const retryDelay = 3000; // Increased delay to 3 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [GEMINI] Code generation attempt ${attempt}/${maxRetries}`);
        console.log(`⏰ [GEMINI] Attempt started at: ${new Date().toISOString()}`);
        
        // Extract project info from layout data
        const selectedColors = (layoutData as any).selectedColors || {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        const description = (layoutData as any).dataAnalysis?.description || 'A modern web application'; // eslint-disable-line @typescript-eslint/no-explicit-any
        
        const prompt = `Create a complete web application based on this description: "${description}"

Use these colors: ${JSON.stringify(selectedColors)}
Framework: ${framework}

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

        const systemMessage = `You are an expert full-stack developer. Create COMPLETE, PRODUCTION-READY web applications.

CRITICAL REQUIREMENTS:
- Generate FULLY FUNCTIONAL applications with complete code
- HTML: Complete HTML5 structure with semantic elements, meta tags, accessibility
- CSS: Complete stylesheets with responsive design, modern features, animations
- JavaScript: Complete functionality with ES6+, event handling, validation
- README: Complete documentation with setup, usage, and features

CODE STRUCTURE:
- HTML: <!DOCTYPE html>, proper head section, semantic body structure
- CSS: Reset/normalize, variables, responsive breakpoints, component styles
- JavaScript: Modern syntax, error handling, complete functionality
- All code must be production-ready and fully functional

You MUST return ONLY valid JSON in this exact format:
{
  "html": "complete HTML content",
  "css": "complete CSS content", 
  "javascript": "complete JavaScript content",
  "readme": "complete README content"
}`;
        const fullPrompt = `${systemMessage}\n\n${prompt}`;

        console.log(`📝 [GEMINI] Sending prompt to Gemini API (attempt ${attempt})...`);
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
          throw new Error('No response from Gemini');
        }

        console.log(`📥 [GEMINI] Received response from Gemini (${content.length} characters)`);

        // Extract JSON from response
        let jsonContent = content.trim();
        console.log(`🔍 [GEMINI] Raw response content (first 500 chars):`, jsonContent.substring(0, 500));
        
        // Remove markdown code blocks if present
        if (jsonContent.includes('```json')) {
          const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1].trim();
            console.log(`📝 [GEMINI] Extracted JSON from markdown block`);
          }
        } else if (jsonContent.includes('```')) {
          const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1].trim();
            console.log(`📝 [GEMINI] Extracted content from code block`);
          }
        }

        // Find JSON object boundaries
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
          console.log(`📝 [GEMINI] Extracted JSON object (${jsonContent.length} chars)`);
        }

        console.log(`🔍 [GEMINI] Final JSON content (first 200 chars):`, jsonContent.substring(0, 200));

        // Parse the JSON
        let codeData;
        try {
          codeData = JSON.parse(jsonContent);
          console.log(`✅ [GEMINI] JSON parsed successfully`);
        } catch (parseError) {
          console.error(`❌ [GEMINI] JSON parse error:`, parseError);
          console.log(`🔍 [GEMINI] Problematic JSON content:`, jsonContent);
          
          // Try to extract individual fields using regex as fallback
          console.log(`🔄 [GEMINI] Attempting regex extraction as fallback...`);
          const htmlMatch = jsonContent.match(/"html"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          const cssMatch = jsonContent.match(/"css"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          const jsMatch = jsonContent.match(/"javascript"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          const readmeMatch = jsonContent.match(/"readme"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          
          if (htmlMatch || cssMatch || jsMatch || readmeMatch) {
            console.log(`✅ [GEMINI] Regex extraction successful`);
            codeData = {
              html: htmlMatch ? htmlMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
              css: cssMatch ? cssMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
              javascript: jsMatch ? jsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
              readme: readmeMatch ? readmeMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : ''
            };
          } else {
            throw parseError;
          }
        }

        // Basic validation - just check if we have content
        const htmlLength = codeData.html?.length || 0;
        const cssLength = codeData.css?.length || 0;
        const jsLength = codeData.javascript?.length || 0;
        const readmeLength = codeData.readme?.length || 0;
        
        console.log(`📊 [GEMINI] Content validation:`, {
          htmlLength,
          cssLength,
          jsLength,
          readmeLength
        });
        
        // Only check for completely empty content - no length requirements
        if (htmlLength === 0 || cssLength === 0 || jsLength === 0) {
          throw new Error('Generated content is empty - missing HTML, CSS, or JavaScript');
        }

        console.log('✅ [GEMINI] Code generation successful on attempt', attempt);
        console.log('🎉 [GEMINI] AI-generated code received successfully!');
        console.log('📊 [GEMINI] Generated code structure:', Object.keys(codeData));
        console.log('📊 [GEMINI] Content lengths:', {
          html: codeData.html?.length || 0,
          css: codeData.css?.length || 0,
          javascript: codeData.javascript?.length || 0,
          readme: codeData.readme?.length || 0
        });
        
        return {
          success: true,
          layoutData: {
            html: codeData.html,
            css: codeData.css,
            javascript: codeData.javascript,
            readme: codeData.readme
          } as unknown as LayoutData,
          confidence: 0.9,
          suggestions: [
            'Add proper error handling',
            'Implement loading states',
            'Add data validation',
            'Consider performance optimizations'
          ]
        };

      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(`❌ [GEMINI] Code generation attempt ${attempt} failed:`, error);
        console.error(`🔍 [GEMINI] Error details:`, {
          message: error.message,
          code: error.code,
          status: error.status,
          attempt: attempt,
          maxRetries: maxRetries
        });
        
        // Check if it's a retryable error
        const isRetryableError = error.message?.includes('503') || 
                                error.message?.includes('overloaded') || 
                                error.message?.includes('Service Unavailable') ||
                                error.message?.includes('429') ||
                                error.message?.includes('rate limit') ||
                                error.message?.includes('quota') ||
                                error.message?.includes('timeout');
        
        if (isRetryableError && attempt < maxRetries) {
          const delay = retryDelay * attempt; // Exponential backoff
          console.log(`⏳ [GEMINI] Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          console.log(`🔄 [GEMINI] Retry reason: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's the last attempt, return error (no fallback)
        if (attempt === maxRetries) {
          console.error('❌ [GEMINI] All code generation attempts failed');
          console.log('🔍 [GEMINI] Final error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            attempts: maxRetries
          });
          
          return {
            success: false,
            error: `AI code generation failed after ${maxRetries} attempts: ${error.message || 'Unknown error'}`,
            confidence: 0
          };
        }
      }
    }
    
    // This should never be reached, but just in case
    return {
      success: false,
      error: 'Code generation failed unexpectedly',
      confidence: 0
    };
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
        aiModel: 'gemini-1.5-flash',
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
