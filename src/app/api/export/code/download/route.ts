import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

// Helper function to create a basic HTML template
function createBasicHTMLTemplate(content: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    ${content || '<h1>Welcome to Your Generated App</h1><p>This is a placeholder. Please check the generated content.</p>'}
  </main>
  <script src="script.js"></script>
</body>
</html>`;
}

// Helper function to validate and fix HTML content
function validateAndFixHTML(htmlContent: string): string {
  // If content is empty or too short, create a basic template
  if (!htmlContent || htmlContent.trim().length < 50) {
    console.log('⚠️ [HTML VALIDATOR] HTML content too short, creating basic template');
    return createBasicHTMLTemplate(htmlContent);
  }
  
  let fixedHTML = htmlContent;
  
  // Ensure HTML has proper DOCTYPE
  if (!fixedHTML.includes('<!DOCTYPE html>')) {
    fixedHTML = '<!DOCTYPE html>\n' + fixedHTML;
  }
  
  // Ensure proper HTML structure
  if (!fixedHTML.includes('<html')) {
    fixedHTML = fixedHTML.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html lang="en">') + '\n</html>';
  }
  
  // Ensure head section exists
  if (!fixedHTML.includes('<head>')) {
    const htmlStartIndex = fixedHTML.indexOf('<html');
    if (htmlStartIndex !== -1) {
      const htmlEndIndex = fixedHTML.indexOf('>', htmlStartIndex);
      if (htmlEndIndex !== -1) {
        fixedHTML = fixedHTML.slice(0, htmlEndIndex + 1) + 
          '\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated App</title>\n</head>' + 
          fixedHTML.slice(htmlEndIndex + 1);
      }
    }
  }
  
  // Ensure body section exists
  if (!fixedHTML.includes('<body>')) {
    const headEndIndex = fixedHTML.indexOf('</head>');
    if (headEndIndex !== -1) {
      fixedHTML = fixedHTML.slice(0, headEndIndex + 7) + '\n<body>\n' + 
        fixedHTML.slice(headEndIndex + 7) + '\n</body>';
    }
  }
  
  // Ensure CSS file is linked
  if (!fixedHTML.includes('styles.css') && !fixedHTML.includes('<style')) {
    const headEndIndex = fixedHTML.indexOf('</head>');
    if (headEndIndex !== -1) {
      fixedHTML = fixedHTML.slice(0, headEndIndex) + 
        '\n  <link rel="stylesheet" href="styles.css">' + 
        fixedHTML.slice(headEndIndex);
    }
  }
  
  // Ensure JavaScript file is linked
  if (!fixedHTML.includes('script.js') && !fixedHTML.includes('<script')) {
    const bodyEndIndex = fixedHTML.indexOf('</body>');
    if (bodyEndIndex !== -1) {
      fixedHTML = fixedHTML.slice(0, bodyEndIndex) + 
        '\n  <script src="script.js"></script>' + 
        fixedHTML.slice(bodyEndIndex);
    }
  }
  
  // Validate that we have a complete HTML structure
  if (!fixedHTML.includes('</html>')) {
    fixedHTML += '\n</html>';
  }
  
  console.log('✅ [HTML VALIDATOR] HTML content validated and fixed');
  return fixedHTML;
}

// Create proper ZIP file using JSZip
async function createZipFile(files: { [key: string]: string }): Promise<Buffer> {
  const zip = new JSZip();
  
  // Add each file to the ZIP
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });
  
  // Generate the ZIP file as a buffer
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return zipBuffer;
}

export async function POST(request: NextRequest) {
  console.log('📥 [DOWNLOAD API] Starting download process via POST...');
  const startTime = Date.now();
  
  try {
    console.log('🔍 [DOWNLOAD API] Extracting code data from request body...');
    const body = await request.json();
    const codeData = body.data;
    
    if (!codeData) {
      console.log('❌ [DOWNLOAD API] No data provided in request body');
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    console.log('📋 [DOWNLOAD API] Code data received successfully');
    console.log('📊 [DOWNLOAD API] Available code sections:', Object.keys(codeData));
    console.log('🔍 [DOWNLOAD API] Code data details:', {
      hasHtml: !!codeData.html,
      hasCss: !!codeData.css,
      hasJavascript: !!codeData.javascript,
      hasReadme: !!codeData.readme,
      htmlLength: codeData.html?.length || 0,
      cssLength: codeData.css?.length || 0,
      jsLength: codeData.javascript?.length || 0,
      readmeLength: codeData.readme?.length || 0
    });
    
    // Create files for the ZIP
    console.log('📁 [DOWNLOAD API] Creating file structure for ZIP...');
    const files: { [key: string]: string } = {};
    
    // Add HTML file with proper validation and formatting
    if (codeData.html) {
      const htmlContent = validateAndFixHTML(codeData.html);
      files['index.html'] = htmlContent;
      console.log('✅ [DOWNLOAD API] Added index.html with proper structure');
    }
    
    // Add CSS file with fallback
    if (codeData.css) {
      files['styles.css'] = codeData.css;
      console.log('✅ [DOWNLOAD API] Added styles.css');
    } else {
      // Add basic CSS fallback
      files['styles.css'] = `/* Basic CSS Reset and Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

h1, h2, h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

p {
  margin-bottom: 1rem;
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  main {
    padding: 1rem;
    margin: 0;
  }
}`;
      console.log('✅ [DOWNLOAD API] Added fallback styles.css');
    }
    
    // Add JavaScript file with fallback
    if (codeData.javascript) {
      files['script.js'] = codeData.javascript;
      console.log('✅ [DOWNLOAD API] Added script.js');
    } else {
      // Add basic JavaScript fallback
      files['script.js'] = `// Basic JavaScript functionality
console.log('Generated app loaded successfully!');

// Add some basic interactivity
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, app ready!');
  
  // Add click handlers for any buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', e.target.textContent);
    });
  });
  
  // Add hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.opacity = '0.8';
    });
    element.addEventListener('mouseleave', function() {
      this.style.opacity = '1';
    });
  });
});`;
      console.log('✅ [DOWNLOAD API] Added fallback script.js');
    }
    
    // Add README file
    if (codeData.readme) {
      files['README.txt'] = codeData.readme;
      console.log('✅ [DOWNLOAD API] Added README.txt');
    }
    
    // Only add package.json if we don't have a custom README
    if (!codeData.readme) {
      files['package.json'] = JSON.stringify({
        name: 'generated-app',
        version: '1.0.0',
        description: 'Generated web application',
        main: 'index.html',
        scripts: {
          start: 'python -m http.server 8000',
          serve: 'npx serve .'
        },
        dependencies: {}
      }, null, 2);
      console.log('✅ [DOWNLOAD API] Added package.json');
    }
    
    console.log('📦 [DOWNLOAD API] Creating ZIP file...');
    console.log('📁 [DOWNLOAD API] Files to include in ZIP:', Object.keys(files));
    console.log('📊 [DOWNLOAD API] File sizes:', Object.entries(files).map(([name, content]) => `${name}: ${content.length} chars`));
    
    const zipData = await createZipFile(files);
    const processingTime = Date.now() - startTime;
    
    console.log('✅ [DOWNLOAD API] ZIP created successfully');
    console.log('📦 [DOWNLOAD API] ZIP size:', zipData.length, 'bytes');
    console.log('⏱️ [DOWNLOAD API] Processing time:', processingTime, 'ms');
    
    console.log('✅ [DOWNLOAD API] ZIP file created successfully');
    console.log('📊 [DOWNLOAD API] ZIP size:', zipData.length, 'bytes');
    console.log('⏱️ [DOWNLOAD API] Total processing time:', processingTime + 'ms');
    
    // Return the ZIP file
    return new NextResponse(zipData as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="generated-app.zip"',
        'Content-Length': zipData.length.toString(),
      },
    });
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const processingTime = Date.now() - startTime;
    console.error('❌ [DOWNLOAD API] Download error after', processingTime + 'ms:', error);
    return NextResponse.json({ 
      error: 'Failed to create download file',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 [DOWNLOAD API] Starting download process...');
  const startTime = Date.now();
  
  try {
    console.log('🔍 [DOWNLOAD API] Extracting code data from URL parameters...');
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      console.log('❌ [DOWNLOAD API] No data provided in URL');
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    console.log('📋 [DOWNLOAD API] Parsing code data...');
    
    let codeData;
    try {
      // Try to decode the URI component
      const decodedData = decodeURIComponent(dataParam);
      codeData = JSON.parse(decodedData);
    } catch (decodeError) {
      console.log('⚠️ [DOWNLOAD API] URI decode failed, trying alternative approach...');
      try {
        // Try parsing the raw data if it's already JSON
        codeData = JSON.parse(dataParam);
      } catch (parseError) {
        console.error('❌ [DOWNLOAD API] Both URI decode and direct parse failed');
        console.error('Decode error:', decodeError);
        console.error('Parse error:', parseError);
        return NextResponse.json({ 
          error: 'Failed to parse code data. The data may be too large or malformed.' 
        }, { status: 400 });
      }
    }
    
    console.log('📦 [DOWNLOAD API] Code data parsed successfully');
    console.log('📊 [DOWNLOAD API] Available code sections:', Object.keys(codeData));
    
    // Create files for the ZIP
    console.log('📁 [DOWNLOAD API] Creating file structure for ZIP...');
    const files: { [key: string]: string } = {};
    
    // Add HTML file with proper validation and formatting
    if (codeData.html?.index) {
      const htmlContent = validateAndFixHTML(codeData.html.index);
      files['index.html'] = htmlContent;
      console.log('✅ [DOWNLOAD API] Added index.html with proper structure');
    }

    // Add CSS file with fallback
    if (codeData.css?.main) {
      files['styles.css'] = codeData.css.main;
      console.log('✅ [DOWNLOAD API] Added styles.css');
    } else {
      // Add basic CSS fallback
      files['styles.css'] = `/* Basic CSS Reset and Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

h1, h2, h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

p {
  margin-bottom: 1rem;
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  main {
    padding: 1rem;
    margin: 0;
  }
}`;
      console.log('✅ [DOWNLOAD API] Added fallback styles.css');
    }
    if (codeData.css?.variables) {
      files['variables.css'] = codeData.css.variables;
      console.log('✅ [DOWNLOAD API] Added variables.css');
    }

    // Add JavaScript file with fallback
    if (codeData.javascript?.main) {
      files['script.js'] = codeData.javascript.main;
      console.log('✅ [DOWNLOAD API] Added script.js');
    } else {
      // Add basic JavaScript fallback
      files['script.js'] = `// Basic JavaScript functionality
console.log('Generated app loaded successfully!');

// Add some basic interactivity
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, app ready!');
  
  // Add click handlers for any buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', e.target.textContent);
    });
  });
  
  // Add hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.opacity = '0.8';
    });
    element.addEventListener('mouseleave', function() {
      this.style.opacity = '1';
    });
  });
});`;
      console.log('✅ [DOWNLOAD API] Added fallback script.js');
    }
    if (codeData.javascript?.data) {
      files['data.js'] = codeData.javascript.data;
      console.log('✅ [DOWNLOAD API] Added data.js');
    }

    // Add package.json
    const projectName = codeData.html?.title || 'laygen-generated-app';
    console.log('📦 [DOWNLOAD API] Project name:', projectName);
    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `${projectName} application generated by Laygen AI`,
      main: 'index.html',
      scripts: {
        start: 'python -m http.server 8000',
        'start-node': 'npx http-server -p 8000',
        'open': 'open index.html'
      },
      keywords: ['html', 'css', 'javascript', 'web-app'],
      author: 'Laygen AI',
      license: 'MIT'
    }, null, 2);
    console.log('✅ [DOWNLOAD API] Added package.json');

    // Add README
    const features = codeData.features || ['Dynamic functionality', 'Responsive design'];
    files['README.md'] = `# ${projectName}

Generated by Laygen AI - From Requirements to Ready UI

## Features

${features.map((feature: string) => `- ${feature}`).join('\n')}

## Getting Started

### Quick Start (Recommended)
Simply open \`index.html\` in your web browser! No installation required.

### Local Development Server
If you want to run it on a local server:

#### Option 1: Python
\`\`\`bash
python -m http.server 8000
\`\`\`

#### Option 2: Node.js
\`\`\`bash
npx http-server -p 8000
\`\`\`

#### Option 3: Live Server (VS Code Extension)
Right-click on \`index.html\` and select "Open with Live Server"

## Usage

1. Open \`index.html\` in your web browser
2. Start using your application immediately!
3. All functionality is built-in and ready to use

## Generated Files

- \`index.html\` - Main application file (open this in your browser)
- \`styles.css\` - All CSS styles
- \`script.js\` - JavaScript functionality
- \`data.js\` - Sample data (if applicable)
- \`variables.css\` - CSS custom properties
- \`package.json\` - Project configuration

${codeData.instructions || ''}

---
Generated by Laygen AI - Transform your requirements into ready UI instantly!
`;

    // Create ZIP file
    console.log('🗜️ [DOWNLOAD API] Creating ZIP file with', Object.keys(files).length, 'files...');
    const zipData = await createZipFile(files);
    console.log('✅ [DOWNLOAD API] ZIP file created successfully, size:', zipData.length, 'bytes');
    
    const processingTime = Date.now() - startTime;
    const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    console.log('✅ [DOWNLOAD API] Download completed successfully in', processingTime, 'ms');
    console.log('📁 [DOWNLOAD API] Download file:', fileName);
    
    // Return ZIP file
    return new NextResponse(zipData as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipData.length.toString(),
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [DOWNLOAD API] Download error after', processingTime, 'ms:', error);
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 });
  }
}
