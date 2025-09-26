import { NextResponse } from 'next/server';
import { createAIService } from '@/utils/ai';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    console.log('Testing All AI Functionality...');
    
    const aiService = createAIService();
    const results: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Test 1: Document Parsing (Excel data)
    console.log('Test 1: Document Parsing...');
    try {
      const testDocument = {
        id: 'test-doc',
        name: 'test.xlsx',
        type: 'xlsx' as const,
        size: 1024,
        content: JSON.stringify({
          type: 'excel_data',
          fileName: 'test.xlsx',
          fileSize: 1024,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          note: 'Test Excel file'
        }),
        uploadedAt: new Date()
      };

      const parseResult = await aiService.parseDocument(testDocument);
      results.documentParsing = {
        success: parseResult.success,
        error: parseResult.error,
        hasDataAnalysis: !!(parseResult.layoutData as any)?.dataAnalysis // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      console.log('Document parsing result:', parseResult.success ? 'Success' : 'Failed');
    } catch (error) {
      results.documentParsing = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('Document parsing failed:', error);
    }

    // Test 2: Image Generation
    console.log('Test 2: Image Generation...');
    try {
      const imageResult = await aiService.generateImage('Simple web application dashboard with header, search bar, and data table');
      results.imageGeneration = {
        success: imageResult.success,
        error: imageResult.error,
        hasImageUrl: !!(imageResult.layoutData as any)?.imageUrl // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      console.log('Image generation result:', imageResult.success ? 'Success' : 'Failed');
    } catch (error) {
      results.imageGeneration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('Image generation failed:', error);
    }

    // Test 3: Code Generation
    console.log('Test 3: Code Generation...');
    try {
      const testLayoutData = {
        id: 'test-layout',
        name: 'Test Layout',
        frames: [],
        styles: {
          colors: [],
          typography: [],
          spacing: [],
          borderRadius: [],
          shadows: []
        },
        metadata: {
          version: '1.0.0',
          generatedAt: new Date(),
          aiModel: 'gpt-3.5-turbo',
          requirements: 'Test application',
          theme: 'light' as const
        }
      };

      const codeResult = await aiService.generateCode(testLayoutData, 'html');
      results.codeGeneration = {
        success: codeResult.success,
        error: codeResult.error,
        hasCode: !!(codeResult.layoutData as any)?.html // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      console.log('Code generation result:', codeResult.success ? 'Success' : 'Failed');
    } catch (error) {
      results.codeGeneration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('Code generation failed:', error);
    }

    // Calculate overall success
    const allTests = Object.values(results);
    const successCount = allTests.filter((test: any) => test.success).length; // eslint-disable-line @typescript-eslint/no-explicit-any
    const totalTests = allTests.length;
    const overallSuccess = successCount === totalTests;

    return NextResponse.json<ApiResponse<{
      overallSuccess: boolean;
      successCount: number;
      totalTests: number;
      results: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }>>({
      success: true,
      data: {
        overallSuccess,
        successCount,
        totalTests,
        results
      },
      message: `AI Testing Complete: ${successCount}/${totalTests} tests passed`
    });

  } catch (error) {
    console.error('All AI tests failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: `All AI tests failed: ${errorMessage}`
    }, { status: 500 });
  }
}
