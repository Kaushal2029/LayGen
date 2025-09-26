import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  console.log('🎨 [DESIGN API] Starting design generation process...');
  const startTime = Date.now();
  
  try {
    console.log('📥 [DESIGN API] Extracting request data...');
    const { prompt, dataAnalysis, excelData, uploadedFile } = await request.json();
    
    console.log('📋 [DESIGN API] Request data:', {
      hasPrompt: !!prompt,
      hasDataAnalysis: !!dataAnalysis,
      hasExcelData: !!excelData,
      hasUploadedFile: !!uploadedFile,
      promptLength: prompt?.length || 0
    });
    
    if (!prompt && !dataAnalysis && !excelData) {
      console.log('❌ [DESIGN API] No prompt, data analysis, or Excel data provided');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Prompt, data analysis, or Excel data is required'
      }, { status: 400 });
    }

    console.log('🤖 [DESIGN API] Creating AI service for design generation...');
    const aiService = createAIService();
    console.log('✅ [DESIGN API] AI service created successfully');

    // Determine the design prompt from available data
    let designPrompt = prompt;
    let documentToProcess = null;

    // If we have real Excel data, use it
    if (excelData && excelData.description) {
      console.log('📊 [DESIGN API] Using real Excel data for design generation');
      designPrompt = excelData.description;
      
      // Create a proper document structure from Excel data
      documentToProcess = {
        id: 'excel-design-doc',
        name: excelData.fileName || 'data.xlsx',
        type: 'xlsx' as const,
        size: excelData.fileSize || 1024,
        content: JSON.stringify({
          type: 'excel_data',
          fileName: excelData.fileName || 'data.xlsx',
          fileSize: excelData.fileSize || 1024,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          description: excelData.description,
          requirements: excelData.requirements || [],
          features: excelData.features || [],
          rawData: excelData.rawData || [],
          projectName: excelData.projectName || 'Design Requirements'
        }),
        uploadedAt: new Date()
      };
      
      console.log('📋 [DESIGN API] Excel data details:', {
        description: designPrompt?.substring(0, 100) + '...',
        requirementsCount: excelData.requirements?.length || 0,
        featuresCount: excelData.features?.length || 0,
        rawDataRows: excelData.rawData?.length || 0
      });
    } 
    // If we have data analysis, use it
    else if (dataAnalysis && dataAnalysis.description) {
      console.log('📊 [DESIGN API] Using data analysis for design generation');
      designPrompt = dataAnalysis.description;
      
      // Create a document from data analysis
      documentToProcess = {
        id: 'analysis-design-doc',
        name: 'analysis-data.txt',
        type: 'text' as const,
        size: designPrompt.length,
        content: JSON.stringify({
          type: 'analysis_data',
          description: designPrompt,
          suggestedAppType: dataAnalysis.suggestedAppType || 'Web Application',
          projectName: dataAnalysis.projectName || 'Design Requirements'
        }),
        uploadedAt: new Date()
      };
    }
    // Fallback to prompt only
    else {
      console.log('📝 [DESIGN API] Using prompt-only design generation');
      designPrompt = prompt || 'Create a modern web application';
      
      // Create a simple document from prompt
      documentToProcess = {
        id: 'prompt-design-doc',
        name: 'design-requirements.txt',
        type: 'text' as const,
        size: designPrompt.length,
        content: JSON.stringify({
          type: 'prompt_data',
          description: designPrompt,
          projectName: 'Design Requirements'
        }),
        uploadedAt: new Date()
      };
    }

    // Process with AI to generate design options using Perplexity AI first
    console.log('🧠 [DESIGN API] Processing with Perplexity AI service...');
    console.log('📄 [DESIGN API] Document type:', documentToProcess.type);
    console.log('📄 [DESIGN API] Document name:', documentToProcess.name);
    console.log('📄 [DESIGN API] Document size:', documentToProcess.size);
    
    let result = await aiService.parseDocument(documentToProcess);

    // If Perplexity AI fails, try layout generation as fallback
    if (!result.success) {
      console.log('⚠️ [DESIGN API] Perplexity AI failed, trying layout generation fallback...');
      const layoutData = {
        suggestedAppType: dataAnalysis?.suggestedAppType || 'Web Application',
        description: designPrompt,
        recommendedFeatures: ['Modern UI', 'Responsive Design', 'Interactive Elements'],
        targetAudience: 'General users',
        designSuggestions: 'Clean, modern design with intuitive navigation'
      };
      
      result = await aiService.generateLayoutVariations(layoutData);
    }

    if (!result.success) {
      console.log('❌ [DESIGN API] All AI processing failed:', result.error);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    console.log('✅ [DESIGN API] AI processing successful');
    
    // Extract design options from the result
    const designData = result.layoutData as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let designOptions = designData.designOptions || [];
    let colorCombinations = designData.colorCombinations || [];

    // If no design options from AI, create fallback designs
    if (designOptions.length === 0) {
      console.log('🆘 [DESIGN API] No design options from AI, creating fallback designs...');
      designOptions = [
        {
          id: 'modern-dashboard',
          name: 'Modern Dashboard',
          description: 'Clean, modern dashboard with cards and analytics',
          preview: 'dashboard-preview',
          components: [
            { name: 'Header', type: 'header', description: 'Navigation header', properties: {}, layout: { x: 0, y: 0, width: 12, height: 1 } },
            { name: 'Sidebar', type: 'sidebar', description: 'Navigation sidebar', properties: {}, layout: { x: 0, y: 1, width: 3, height: 8 } },
            { name: 'Main Content', type: 'main', description: 'Main content area', properties: {}, layout: { x: 3, y: 1, width: 9, height: 8 } }
          ],
          layout: { type: 'grid', theme: 'modern', colors: { primary: '#3B82F6', secondary: '#10B981' } }
        },
        {
          id: 'ecommerce-layout',
          name: 'E-commerce Layout',
          description: 'Product-focused layout with shopping features',
          preview: 'ecommerce-preview',
          components: [
            { name: 'Header', type: 'header', description: 'Store header with cart', properties: {}, layout: { x: 0, y: 0, width: 12, height: 1 } },
            { name: 'Product Grid', type: 'grid', description: 'Product showcase grid', properties: {}, layout: { x: 0, y: 1, width: 12, height: 6 } },
            { name: 'Footer', type: 'footer', description: 'Store footer', properties: {}, layout: { x: 0, y: 7, width: 12, height: 2 } }
          ],
          layout: { type: 'grid', theme: 'ecommerce', colors: { primary: '#FF6B6B', secondary: '#4ECDC4' } }
        },
        {
          id: 'portfolio-layout',
          name: 'Portfolio Layout',
          description: 'Creative portfolio with project showcase',
          preview: 'portfolio-preview',
          components: [
            { name: 'Hero Section', type: 'hero', description: 'Portfolio hero section', properties: {}, layout: { x: 0, y: 0, width: 12, height: 3 } },
            { name: 'Projects Grid', type: 'grid', description: 'Project showcase', properties: {}, layout: { x: 0, y: 3, width: 12, height: 4 } },
            { name: 'Contact', type: 'contact', description: 'Contact information', properties: {}, layout: { x: 0, y: 7, width: 12, height: 2 } }
          ],
          layout: { type: 'grid', theme: 'portfolio', colors: { primary: '#9B59B6', secondary: '#E74C3C' } }
        }
      ];
    }

    // If no color combinations from AI, create fallback colors
    if (colorCombinations.length === 0) {
      console.log('🆘 [DESIGN API] No color combinations from AI, creating fallback colors...');
      colorCombinations = [
        {
          name: 'Ocean Blue',
          colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
          preview: 'ocean-blue'
        },
        {
          name: 'Sunset Orange',
          colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', background: '#FFFFFF', text: '#2D3748' },
          preview: 'sunset-orange'
        },
        {
          name: 'Forest Green',
          colors: { primary: '#10B981', secondary: '#3B82F6', accent: '#F59E0B', background: '#F9FAFB', text: '#1F2937' },
          preview: 'forest-green'
        },
        {
          name: 'Purple Dream',
          colors: { primary: '#9B59B6', secondary: '#E74C3C', accent: '#F39C12', background: '#FFFFFF', text: '#2D3748' },
          preview: 'purple-dream'
        }
      ];
    }

    console.log('📊 [DESIGN API] Generated data:', {
      designOptionsCount: designOptions.length,
      colorCombinationsCount: colorCombinations.length
    });

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ [DESIGN API] Total processing time: ${processingTime}ms`);

    return NextResponse.json<ApiResponse<{
      designOptions: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
      colorCombinations: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
      dataAnalysis: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }>>({
      success: true,
      data: {
        designOptions,
        colorCombinations,
        dataAnalysis: dataAnalysis || designData.dataAnalysis
      },
      message: 'Design options generated successfully'
    });

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ [DESIGN API] Design generation failed:', error);
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message || 'Failed to generate design options',
      message: `Design generation failed after ${processingTime}ms`
    }, { status: 500 });
  }
}