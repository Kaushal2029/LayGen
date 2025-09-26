import * as XLSX from 'xlsx';

export interface ExcelData {
  description: string;
  requirements: string[];
  features: string[];
  rawData: unknown[][];
}

export function parseExcelFile(file: File): Promise<ExcelData> {
  console.log('📊 [EXCEL PARSER] Starting Excel file parsing...');
  console.log('📁 [EXCEL PARSER] File details:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('📖 [EXCEL PARSER] File read successfully, processing data...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        console.log('🔍 [EXCEL PARSER] Parsing Excel workbook...');
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        console.log('📋 [EXCEL PARSER] Using sheet:', firstSheetName);
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        console.log('📊 [EXCEL PARSER] Raw data rows:', jsonData.length);
        
        // Extract description and requirements
        console.log('🧠 [EXCEL PARSER] Extracting project information...');
        const { description, requirements, features } = extractProjectInfo(jsonData);
        
        console.log('✅ [EXCEL PARSER] Excel parsing completed successfully');
        console.log('📋 [EXCEL PARSER] Extracted data:', {
          description: description?.substring(0, 100) + '...',
          requirementsCount: requirements.length,
          featuresCount: features.length
        });
        
        resolve({
          description,
          requirements,
          features,
          rawData: jsonData
        });
      } catch (error) {
        console.error('❌ [EXCEL PARSER] Error parsing Excel file:', error);
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    
    reader.onerror = () => {
      console.error('❌ [EXCEL PARSER] File reader error');
      reject(new Error('Failed to read Excel file'));
    };
    
    console.log('📖 [EXCEL PARSER] Reading file as ArrayBuffer...');
    reader.readAsArrayBuffer(file);
  });
}

function extractProjectInfo(data: unknown[][]): { description: string; requirements: string[]; features: string[] } {
  let description = '';
  const requirements: string[] = [];
  const features: string[] = [];
  
  // First, try to identify if first row contains headers
  const firstRow = data[0] || [];
  const isFirstRowHeaders = firstRow.some(cell => {
    const cellStr = String(cell || '').toLowerCase().trim();
    return cellStr.includes('title') || cellStr.includes('description') || 
           cellStr.includes('type') || cellStr.includes('name') ||
           cellStr.includes('requirement') || cellStr.includes('feature');
  });
  
  console.log('🔍 [EXCEL PARSER] Excel data analysis:', {
    totalRows: data.length,
    firstRowHeaders: isFirstRowHeaders,
    firstRow: firstRow.map(cell => String(cell || ''))
  });
  
  // Extract all meaningful content, skipping header row if detected
  const startRow = isFirstRowHeaders ? 1 : 0;
  const allContent: string[] = [];
  
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // Collect all non-empty cells from this row
    for (let j = 0; j < row.length; j++) {
      const cellValue = String(row[j] || '').trim();
      if (cellValue && cellValue.length > 0) {
        allContent.push(cellValue);
      }
    }
  }
  
  console.log('Extracted content:', allContent.slice(0, 10)); // Log first 10 items
  
  // Look for specific patterns in the data
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').toLowerCase().trim();
    
    // Look for description fields
    if (firstCell.includes('description') || firstCell.includes('project description') || firstCell.includes('overview')) {
      description = String(row[1] || row[2] || '').trim();
    }
    
    // Look for requirements
    if (firstCell.includes('requirement') || firstCell.includes('specification')) {
      for (let j = 1; j < row.length; j++) {
        const req = String(row[j] || '').trim();
        if (req && req !== '') {
          requirements.push(req);
        }
      }
    }
    
    // Look for features
    if (firstCell.includes('feature') || firstCell.includes('functionality')) {
      for (let j = 1; j < row.length; j++) {
        const feature = String(row[j] || '').trim();
        if (feature && feature !== '') {
          features.push(feature);
        }
      }
    }
  }
  
  // If no specific description found, create one from the actual data content
  if (!description) {
    // Use the first few meaningful data rows (skip headers)
    const dataRows = isFirstRowHeaders ? data.slice(1, 4) : data.slice(0, 3);
    const meaningfulContent = dataRows
      .flat()
      .map(cell => String(cell || '').trim())
      .filter(cell => cell.length > 0 && !cell.toLowerCase().includes('title') && !cell.toLowerCase().includes('description'))
      .slice(0, 5);
    
    if (meaningfulContent.length > 0) {
      description = meaningfulContent.join(', ');
    } else {
      description = 'Modern web application';
    }
  }
  
  // If no specific requirements found, use the actual data as requirements
  if (requirements.length === 0) {
    const dataContent = allContent
      .filter(content => content.length > 3 && !content.toLowerCase().includes('title'))
      .slice(0, 10);
    requirements.push(...dataContent);
  }
  
  // If no specific features found, infer from data
  if (features.length === 0) {
    features.push('Data management', 'User interface', 'Search functionality', 'Data visualization');
  }
  
  console.log('📊 [EXCEL PARSER] Final extraction:', { description, requirements: requirements.slice(0, 5), features });
  
  return { description, requirements, features };
}

export function generatePromptFromExcelData(excelData: ExcelData): string {
  console.log('📝 [EXCEL PARSER] Generating prompt from Excel data...');
  
  // Use only the description from Excel data, no hardcoded additions
  let prompt = '';
  
  if (excelData.description) {
    prompt = excelData.description;
    console.log('📋 [EXCEL PARSER] Using description for prompt');
  } else if (excelData.requirements.length > 0) {
    // Use the actual data as the description
    prompt = excelData.requirements.slice(0, 5).join(', ');
    console.log('📋 [EXCEL PARSER] Using requirements for prompt');
  } else {
    prompt = 'Create a modern web application';
    console.log('📋 [EXCEL PARSER] Using default prompt');
  }
  
  // Return only the description, no additional suggestions
  console.log('✅ [EXCEL PARSER] Generated prompt:', prompt.substring(0, 100) + '...');
  
  return prompt;
}
