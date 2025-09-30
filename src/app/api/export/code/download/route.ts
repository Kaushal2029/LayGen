import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { CodeFileType } from '@/types';

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

// Helper function to parse React components from a single content string
function parseReactComponents(componentsContent: string): Record<string, string> {
  const componentFiles: Record<string, string> = {};
  
  try {
    // Try to split by common component patterns
    const componentPatterns = [
      // Pattern 1: Components separated by "// Component:" or "// Component Name:"
      /\/\/\s*Component:\s*([^\n]+)\n([\s\S]*?)(?=\/\/\s*Component:|$)/g,
      // Pattern 2: Components separated by "export const" or "export function"
      /export\s+(const|function)\s+([A-Z][a-zA-Z0-9]*)/g,
      // Pattern 3: Components separated by "const ComponentName ="
      /const\s+([A-Z][a-zA-Z0-9]*)\s*=/g
    ];
    
    for (const pattern of componentPatterns) {
      const matches = [...componentsContent.matchAll(pattern)];
      if (matches.length > 1) {
        // Found multiple components, try to extract them
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const componentName = match[1] || match[2] || `Component${i + 1}`;
          const startIndex = match.index || 0;
          const endIndex = i < matches.length - 1 ? (matches[i + 1].index || componentsContent.length) : componentsContent.length;
          
          const componentContent = componentsContent.slice(startIndex, endIndex).trim();
          if (componentContent.length > 50) { // Only include substantial components
            const fileName = `${componentName}.jsx`;
            componentFiles[fileName] = componentContent;
          }
        }
        break; // Found components with this pattern, stop trying others
      }
    }
    
    // If no components were found with patterns, try to split by file markers
    if (Object.keys(componentFiles).length === 0) {
      const fileMarkers = [
        '// File:',
        '// Component:',
        '// =====',
        '---',
        '```'
      ];
      
      for (const marker of fileMarkers) {
        const parts = componentsContent.split(marker);
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i++) {
            const part = parts[i].trim();
            if (part.length > 50) {
              const fileName = `Component${i}.jsx`;
              componentFiles[fileName] = part;
            }
          }
          break;
        }
      }
    }
    
    // If still no components found, create a single file
    if (Object.keys(componentFiles).length === 0) {
      componentFiles['Components.jsx'] = componentsContent;
    }
    
    console.log(`📦 [COMPONENT PARSER] Extracted ${Object.keys(componentFiles).length} components`);
    return componentFiles;
    
  } catch (error) {
    console.warn('⚠️ [COMPONENT PARSER] Failed to parse components, creating single file:', error);
    return { 'Components.jsx': componentsContent };
  }
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
    const codeGenerationOptions = body.codeGenerationOptions || {
      selectedFileTypes: ['html', 'css', 'javascript', 'readme'],
      framework: 'html',
      includeDependencies: true,
      includeDocumentation: true,
      includeDocker: false
    };
    
    if (!codeData) {
      console.log('❌ [DOWNLOAD API] No data provided in request body');
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    console.log('📋 [DOWNLOAD API] Code generation options:', codeGenerationOptions);

    console.log('📋 [DOWNLOAD API] Code data received successfully');
    console.log('📊 [DOWNLOAD API] Available code sections:', Object.keys(codeData));
    console.log('🔍 [DOWNLOAD API] Code data details:', {
      hasHtml: !!codeData.html,
      hasCss: !!codeData.css,
      hasJavascript: !!codeData.javascript,
      hasReadme: !!codeData.readme,
      hasReact: !!codeData.react,
      hasReactComponents: !!codeData['react-components'],
      hasReactSetup: !!codeData['react-setup'],
      hasPackageJson: !!codeData['package.json'],
      htmlLength: codeData.html?.length || 0,
      cssLength: codeData.css?.length || 0,
      jsLength: codeData.javascript?.length || 0,
      readmeLength: codeData.readme?.length || 0,
      reactLength: codeData.react?.length || 0,
      reactComponentsLength: codeData['react-components']?.length || 0,
      reactSetupLength: codeData['react-setup']?.length || 0,
      packageJsonLength: codeData['package.json']?.length || 0
    });
    
    // Create files for the ZIP based on selected file types
    console.log('📁 [DOWNLOAD API] Creating file structure for ZIP...');
    console.log('📋 [DOWNLOAD API] Selected file types:', codeGenerationOptions.selectedFileTypes);
    const files: { [key: string]: string } = {};
    
    // Helper function to check if a file type should be included
    const shouldIncludeFile = (fileType: string) => {
      return codeGenerationOptions.selectedFileTypes.includes(fileType as CodeFileType);
    };
    
    // Add HTML file with proper validation and formatting
    if (shouldIncludeFile('html') && codeData.html) {
      const htmlContent = validateAndFixHTML(codeData.html);
      files['index.html'] = htmlContent;
      console.log('✅ [DOWNLOAD API] Added index.html with proper structure');
    }
    
    // Add CSS file with fallback
    if (shouldIncludeFile('css')) {
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
    }
    
    // Add JavaScript file with fallback
    if (shouldIncludeFile('javascript')) {
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
    }
    
    // Add TypeScript file if selected
    if (shouldIncludeFile('typescript') && codeData.typescript) {
      files['script.ts'] = codeData.typescript;
      console.log('✅ [DOWNLOAD API] Added script.ts');
    }
    
    // Add React files if selected
    if (shouldIncludeFile('react')) {
      if (codeData.react) {
        files['App.jsx'] = codeData.react;
        console.log('✅ [DOWNLOAD API] Added App.jsx');
      }
      if (codeData.reactIndex) {
        files['index.js'] = codeData.reactIndex;
        console.log('✅ [DOWNLOAD API] Added index.js');
      }
    }
    
    // Add React components if they exist (regardless of selection)
    if (codeData['react-components'] || codeData.react) {
      // Parse the react-components content to create multiple component files
      const componentsContent = codeData['react-components'] || codeData.react;
      try {
        // Try to extract individual components from the content
        const componentFiles = parseReactComponents(componentsContent as string);
        Object.entries(componentFiles).forEach(([filename, content]) => {
          files[`src/components/${filename}`] = content as string;
          console.log(`✅ [DOWNLOAD API] Added React component: ${filename}`);
        });
      } catch {
        // If parsing fails, create a single components file
        files['src/components/Components.jsx'] = componentsContent as string;
        console.log('✅ [DOWNLOAD API] Added Components.jsx (single file)');
      }
    }
    
    // Add React setup guide if it exists (regardless of selection)
    if (codeData['react-setup'] || codeData.readme) {
      files['SETUP.md'] = codeData['react-setup'] || codeData.readme;
      console.log('✅ [DOWNLOAD API] Added SETUP.md');
    }
    
    // Add HTML, CSS, JS files for React if they exist (regardless of selection)
    if (codeData.html) {
      const htmlContent = validateAndFixHTML(codeData.html);
      files['index.html'] = htmlContent;
      console.log('✅ [DOWNLOAD API] Added index.html for React project');
    }
    
    if (codeData.css) {
      files['styles.css'] = codeData.css;
      console.log('✅ [DOWNLOAD API] Added styles.css for React project');
    }
    
    if (codeData.javascript) {
      files['script.js'] = codeData.javascript;
      console.log('✅ [DOWNLOAD API] Added script.js for React project');
    }
    
    if (codeData['package.json']) {
      files['package.json'] = codeData['package.json'];
      console.log('✅ [DOWNLOAD API] Added package.json for React project');
    }
    
    // Add Vue files if selected
    if (shouldIncludeFile('vue')) {
      if (codeData.vue) {
        files['App.vue'] = codeData.vue;
        console.log('✅ [DOWNLOAD API] Added App.vue');
      }
    }
    
    // Add Svelte files if selected
    if (shouldIncludeFile('svelte')) {
      if (codeData.svelte) {
        files['App.svelte'] = codeData.svelte;
        console.log('✅ [DOWNLOAD API] Added App.svelte');
      }
    }
    
    // Add README file
    if (shouldIncludeFile('readme') && codeData.readme) {
      files['README.md'] = codeData.readme;
      console.log('✅ [DOWNLOAD API] Added README.md');
    }
    
    // Add package.json if selected and includeDependencies is true
    if (shouldIncludeFile('package.json') && codeGenerationOptions.includeDependencies) {
      const packageJson = {
        name: 'generated-app',
        version: '1.0.0',
        description: 'Generated web application',
        main: 'index.html',
        scripts: {
          start: codeGenerationOptions.framework === 'html' ? 'python -m http.server 8000' : 'npm run dev',
          serve: 'npx serve .',
          dev: codeGenerationOptions.framework === 'react' ? 'vite' : 'npm start'
        },
        dependencies: codeGenerationOptions.framework === 'react' ? {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'tailwindcss': '^3.3.0',
          'bootstrap': '^5.3.0'
        } : codeGenerationOptions.framework === 'vue' ? {
          'vue': '^3.0.0',
          'tailwindcss': '^3.3.0',
          'bootstrap': '^5.3.0'
        } : codeGenerationOptions.framework === 'svelte' ? {
          'svelte': '^4.0.0',
          'tailwindcss': '^3.3.0',
          'bootstrap': '^5.3.0'
        } : {
          'tailwindcss': '^3.3.0',
          'bootstrap': '^5.3.0'
        },
        devDependencies: {
          'autoprefixer': '^10.4.0',
          'postcss': '^8.4.0'
        }
      };
      
      files['package.json'] = JSON.stringify(packageJson, null, 2);
      console.log('✅ [DOWNLOAD API] Added package.json');
    }
    
    // Add .gitignore if selected
    if (shouldIncludeFile('gitignore')) {
      files['.gitignore'] = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log`;
      console.log('✅ [DOWNLOAD API] Added .gitignore');
    }
    
    // Add Docker files if selected
    if (shouldIncludeFile('dockerfile') && codeGenerationOptions.includeDocker) {
      files['Dockerfile'] = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;
      console.log('✅ [DOWNLOAD API] Added Dockerfile');
    }
    
    if (shouldIncludeFile('docker-compose') && codeGenerationOptions.includeDocker) {
      files['docker-compose.yml'] = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules`;
      console.log('✅ [DOWNLOAD API] Added docker-compose.yml');
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
