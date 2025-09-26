import { NextRequest, NextResponse } from 'next/server';
import { createAIService, parseDocumentContent, validateDocument } from '@/utils/ai';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file
    const validation = validateDocument(file);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Parse document content
    const content = await parseDocumentContent(file);
    
    // Initialize AI service
    console.log('Creating AI service...');
    const aiService = createAIService();
    console.log('AI service created successfully');
    
    // Process document with AI
    const result = await aiService.parseDocument({
      id: `doc-${Date.now()}`,
      name: file.name,
      type: (file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'xlsx' | 'xls') || 'txt',
      size: file.size,
      content,
      uploadedAt: new Date()
    });

    if (!result.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<any>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
      success: true,
      data: result.layoutData,
      message: 'Document parsed successfully'
    });

  } catch (error) {
    console.error('AI parse error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
