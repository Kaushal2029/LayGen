'use client';

import { useState } from 'react';
import { Code, Download, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function TestAICodePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);

  const [selectedTest, setSelectedTest] = useState('ecommerce');
  
  const testScenarios = {
    ecommerce: {
      dataAnalysis: {
        projectName: 'E-Commerce Store',
        description: 'A complete e-commerce store with product catalog, shopping cart, user authentication, and payment processing'
      },
      selectedColors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827'
      },
      projectName: 'E-Commerce Store'
    },
    dashboard: {
      dataAnalysis: {
        projectName: 'Analytics Dashboard',
        description: 'A comprehensive analytics dashboard with charts, data visualization, real-time updates, and user management'
      },
      selectedColors: {
        primary: '#10B981',
        secondary: '#6B7280',
        background: '#F9FAFB',
        text: '#111827'
      },
      projectName: 'Analytics Dashboard'
    },
    portfolio: {
      dataAnalysis: {
        projectName: 'Portfolio Website',
        description: 'A modern portfolio website with project showcase, contact form, blog section, and responsive design'
      },
      selectedColors: {
        primary: '#8B5CF6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827'
      },
      projectName: 'Portfolio Website'
    },
    game: {
      dataAnalysis: {
        projectName: 'Rock Paper Scissors Game',
        description: 'An interactive rock paper scissors game with score tracking, animations, and multiple game modes'
      },
      selectedColors: {
        primary: '#F59E0B',
        secondary: '#6B7280',
        background: '#FEF3C7',
        text: '#111827'
      },
      projectName: 'Rock Paper Scissors Game'
    }
  };

  const testData = testScenarios[selectedTest as keyof typeof testScenarios];

  const handleTestAIGeneration = async () => {
    console.log('🧪 [TEST PAGE] Starting AI code generation test...');
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-ai-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutData: testData,
          framework: 'html'
        }),
      });

      console.log('📥 [TEST PAGE] Response received:', response.status);
      const data = await response.json();
      console.log('📊 [TEST PAGE] Response data:', data);

      if (data.success) {
        setResult(data);
        console.log('✅ [TEST PAGE] AI code generation successful!');
        console.log('📊 [TEST PAGE] Generated code keys:', Object.keys(data.data || {}));
      } else {
        setError(data.error || 'AI code generation failed');
        console.log('❌ [TEST PAGE] AI code generation failed:', data.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [TEST PAGE] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCode = async () => {
    if (!result?.data) return;

    try {
      console.log('📥 [TEST PAGE] Starting download...');
      console.log('📊 [TEST PAGE] Data being sent:', {
        hasHtml: !!result.data.html,
        hasCss: !!result.data.css,
        hasJavascript: !!result.data.javascript,
        hasReadme: !!result.data.readme,
        dataKeys: Object.keys(result.data)
      });
      
      const response = await fetch('/api/export/code/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: result.data }),
      });
      
      console.log('📡 [TEST PAGE] Response status:', response.status);
      console.log('📡 [TEST PAGE] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [TEST PAGE] Response error:', errorText);
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 [TEST PAGE] Blob size:', blob.size, 'bytes');
      console.log('📦 [TEST PAGE] Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-test-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [TEST PAGE] Download completed successfully');
    } catch (error) {
      console.error('❌ [TEST PAGE] Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI Code Generation Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Test the AI code generation with different application scenarios
          </p>
          
          {/* Test Scenario Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Test Scenario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(testScenarios).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTest(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTest === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {scenario.dataAnalysis.projectName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {scenario.dataAnalysis.description}
                    </p>
                    <div className="flex space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scenario.selectedColors.primary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scenario.selectedColors.secondary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scenario.selectedColors.background }}
                      ></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Test Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Project Data</h3>
               <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                 <p><strong>Name:</strong> {testData.dataAnalysis.projectName}</p>
                 <p><strong>Description:</strong> {testData.dataAnalysis.description}</p>
                 <p><strong>Type:</strong> Fully AI-Generated Dynamic App</p>
                 <p><strong>Scenario:</strong> {selectedTest.charAt(0).toUpperCase() + selectedTest.slice(1)}</p>
               </div>
             </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Color Scheme</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(testData.selectedColors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: value }}
                      ></div>
                      <span className="text-xs">{key}: {value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleTestAIGeneration}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Testing AI Generation...
              </>
            ) : (
              <>
                <Code className="w-5 h-5 mr-2" />
                Test AI Code Generation
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Success!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  AI code generation completed successfully
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Files</h4>
               <div className="space-y-1 text-sm">
                 {result.data?.html && <p>✅ index.html</p>}
                 {result.data?.css && <p>✅ styles.css</p>}
                 {result.data?.javascript && <p>✅ script.js</p>}
                 {result.data?.readme && <p>✅ README.txt</p>}
               </div>
              </div>
             <div>
               <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">AI Status</h4>
               <div className="space-y-1 text-sm">
                 <p>🤖 AI Generated: {result.isAIGenerated ? 'Yes' : 'No'}</p>
                 <p>📊 Success: {result.success ? 'Yes' : 'No'}</p>
                 {!result.isAIGenerated && (
                   <p className="text-orange-600 dark:text-orange-400">⚠️ Fallback code used</p>
                 )}
               </div>
             </div>
            </div>

            {result.data && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadCode}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Generated Code
                </button>
                
                {!result.isAIGenerated && (
                  <button
                    onClick={handleTestAIGeneration}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Retry AI Generation
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {result?.data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generated Code Preview
            </h3>
            
            <div className="space-y-4">
              {result.data.html && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">index.html</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                    <pre className="whitespace-pre-wrap">
                      {result.data.html.substring(0, 1000)}
                      {result.data.html.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}

              {result.data.css && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">styles.css</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                    <pre className="whitespace-pre-wrap">
                      {result.data.css.substring(0, 1000)}
                      {result.data.css.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}

              {result.data.javascript && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">script.js</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                    <pre className="whitespace-pre-wrap">
                      {result.data.javascript.substring(0, 1000)}
                      {result.data.javascript.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}

              {result.data.readme && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">README.txt</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                    <pre className="whitespace-pre-wrap">
                      {result.data.readme.substring(0, 1000)}
                      {result.data.readme.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  // Create a new window with the generated code
                  const htmlContent = result.data.html || '';
                  const cssContent = result.data.css || '';
                  const jsContent = result.data.javascript || '';
                  
                  // Create a complete HTML document
                  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated App Preview</title>
    <style>${cssContent}</style>
</head>
<body>
    ${htmlContent}
    <script>${jsContent}</script>
</body>
</html>`;
                  
                  // Open in new window
                  const newWindow = window.open('', '_blank', 'width=1200,height=800');
                  if (newWindow) {
                    newWindow.document.write(fullHTML);
                    newWindow.document.close();
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Code className="w-4 h-4 mr-2" />
                Open Live Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
