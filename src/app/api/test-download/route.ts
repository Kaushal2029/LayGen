import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function GET() {
  console.log('🧪 [TEST DOWNLOAD] Testing download functionality...');
  
  try {
    // Create a test ZIP file
    const zip = new JSZip();
    
    // Add test files
    zip.file('test.html', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Test Download</h1>
    <p>This is a test file to verify ZIP download functionality.</p>
    <script src="script.js"></script>
</body>
</html>
    `);
    
    zip.file('styles.css', `
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    line-height: 1.6;
}
    `);
    
    zip.file('script.js', `
console.log('Test download working!');
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully');
});
    `);
    
    zip.file('README.md', `
# Test Download

This is a test ZIP file to verify the download functionality.

## Files included:
- test.html - Main HTML file
- styles.css - CSS styles
- script.js - JavaScript functionality
- README.md - This file

## How to test:
1. Download this ZIP file
2. Extract it
3. Open test.html in your browser
4. Check the console for messages
    `);
    
    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    console.log('✅ [TEST DOWNLOAD] Test ZIP created successfully, size:', zipBuffer.length, 'bytes');
    
    // Return the ZIP file
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="test-download.zip"',
        'Content-Length': zipBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('❌ [TEST DOWNLOAD] Test failed:', error);
    return NextResponse.json({
      success: false,
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
