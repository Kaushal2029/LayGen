import { NextRequest, NextResponse } from 'next/server';
import { PerplexityAIService } from '@/utils/perplexity-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [STEP-BY-STEP] Starting step-by-step code generation...');
    
    const { layoutData, framework = 'react', codeGenerationOptions } = await request.json();
    
    if (!layoutData) {
      return NextResponse.json({ error: 'No layout data provided' }, { status: 400 });
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      console.error('❌ [STEP-BY-STEP] PERPLEXITY_API_KEY not found in environment variables');
      return NextResponse.json({ 
        error: 'Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    console.log('🔑 [STEP-BY-STEP] Using Perplexity API key:', perplexityApiKey ? 'Present' : 'Missing');
    console.log('🔑 [STEP-BY-STEP] API key format check:', {
      startsWithPpl: perplexityApiKey?.startsWith('pplx-'),
      length: perplexityApiKey?.length
    });

    const aiService = new PerplexityAIService(perplexityApiKey);
    const selectedFileTypes = codeGenerationOptions?.selectedFileTypes || ['react', 'react-components', 'react-setup', 'package.json'];
    
    console.log('📋 [STEP-BY-STEP] Selected file types:', selectedFileTypes);
    console.log('📋 [STEP-BY-STEP] Framework:', framework);
    
    // Create a readable stream for real-time updates
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Starting code generation...',
            progress: 0,
            currentStep: 'Initializing'
          })}\n\n`));

          // Generate each file step by step
          for (let i = 0; i < selectedFileTypes.length; i++) {
            const fileType = selectedFileTypes[i];
            const progress = Math.round((i / selectedFileTypes.length) * 100);
            
            console.log(`🔄 [STEP-BY-STEP] Generating ${fileType} (${i + 1}/${selectedFileTypes.length})`);
            
            // Send progress update
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              message: `Generating ${fileType}...`,
              progress: progress,
              currentStep: `Creating ${fileType}`,
              fileType: fileType
            })}\n\n`));

            // Generate the specific file
            const specificLayoutData = {
              ...layoutData,
              codeGenerationOptions: {
                ...codeGenerationOptions,
                selectedFileTypes: [fileType] // Only generate this specific file type
              }
            };
            
            console.log(`🔍 [STEP-BY-STEP] Generating ${fileType} with specific layout data:`, {
              fileType,
              hasCodeGenerationOptions: !!specificLayoutData.codeGenerationOptions,
              selectedFileTypes: specificLayoutData.codeGenerationOptions?.selectedFileTypes
            });
            
            const result = await aiService.generateCode(specificLayoutData, framework as 'html' | 'react' | 'vue' | 'svelte');
            
            if (result.success && result.layoutData) {
              const codeData = result.layoutData as unknown as Record<string, string>;
              // Try multiple field name variations
              let fileContent = codeData[fileType] || 
                               codeData[fileType.replace('-', '_')] || 
                               codeData[fileType.replace('-', '')] ||
                               '';
              
              // Special handling for React components - if AI generated 'react' instead of 'react-components'
              if (!fileContent && fileType === 'react-components' && codeData['react']) {
                fileContent = codeData['react'];
                console.log(`🔄 [STEP-BY-STEP] Using 'react' field for 'react-components'`);
              }
              
              // Handle React components object structure
              if (fileType === 'react-components' && typeof fileContent === 'object' && fileContent !== null) {
                // Parse React components from object structure
                fileContent = parseReactComponentsFromObject(fileContent);
                console.log(`🔄 [STEP-BY-STEP] Parsed React components from object structure`);
              }
              
              // Special handling for React setup - if AI generated 'readme' instead of 'react-setup'
              if (!fileContent && fileType === 'react-setup' && codeData['readme']) {
                fileContent = codeData['readme'];
                console.log(`🔄 [STEP-BY-STEP] Using 'readme' field for 'react-setup'`);
              }
              
              console.log(`📊 [STEP-BY-STEP] Generated ${fileType}:`, {
                hasContent: !!fileContent,
                contentLength: typeof fileContent === 'string' ? fileContent.length : 0,
                contentPreview: typeof fileContent === 'string' 
                  ? fileContent.substring(0, 200) + (fileContent.length > 200 ? '...' : '')
                  : 'Not a string',
                availableKeys: Object.keys(codeData),
                fullCodeData: codeData
              });
              
              // Send file content - ensure it's a string
              const contentToSend = typeof fileContent === 'string' ? fileContent : String(fileContent || '');
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'file',
                fileType: fileType,
                content: contentToSend,
                fileName: getFileName(fileType),
                message: `${fileType} generated successfully`,
                progress: Math.round(((i + 1) / selectedFileTypes.length) * 100),
                currentStep: `Completed ${fileType}`
              })}\n\n`));
            } else {
              // Send error for this file
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                fileType: fileType,
                message: `Failed to generate ${fileType}`,
                error: result.error || 'Unknown error',
                progress: Math.round(((i + 1) / selectedFileTypes.length) * 100),
                currentStep: `Error in ${fileType}`
              })}\n\n`));
            }
          }

          // Send completion status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            message: 'All files generated successfully!',
            progress: 100,
            currentStep: 'Complete'
          })}\n\n`));

          controller.close();
        } catch (error) {
          console.error('❌ [STEP-BY-STEP] Error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'Code generation failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            progress: 0,
            currentStep: 'Error'
          })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ [STEP-BY-STEP] Error:', error);
    return NextResponse.json({ 
      error: 'Step-by-step generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to parse React components from object structure
function parseReactComponentsFromObject(componentsData: unknown): string {
  if (typeof componentsData === 'string') {
    return componentsData;
  }
  
  if (typeof componentsData === 'object' && componentsData !== null) {
    let result = '';
    
    // If it's an object with component files
    if (Array.isArray(componentsData)) {
      // Handle array of components
      componentsData.forEach((component, index) => {
        if (typeof component === 'string') {
          result += `// Component ${index + 1}\n${component}\n\n`;
        } else if (typeof component === 'object') {
          result += `// Component ${index + 1}\n${JSON.stringify(component, null, 2)}\n\n`;
        }
      });
    } else {
      // Handle object with component files
      Object.entries(componentsData).forEach(([filename, content]) => {
        result += `// File: ${filename}\n`;
        if (typeof content === 'string') {
          result += content;
        } else {
          result += JSON.stringify(content, null, 2);
        }
        result += '\n\n';
      });
    }
    
    return result.trim();
  }
  
  return String(componentsData || '');
}

function getFileName(fileType: string): string {
  const fileNames: { [key: string]: string } = {
    'html': 'index.html',
    'css': 'styles.css',
    'javascript': 'script.js',
    'react': 'App.jsx',
    'react-components': 'components/',
    'react-setup': 'SETUP.md',
    'vue': 'App.vue',
    'svelte': 'App.svelte',
    'typescript': 'script.ts',
    'readme': 'README.md',
    'package.json': 'package.json',
    'gitignore': '.gitignore',
    'dockerfile': 'Dockerfile',
    'docker-compose': 'docker-compose.yml'
  };
  
  return fileNames[fileType] || `${fileType}.js`;
}
