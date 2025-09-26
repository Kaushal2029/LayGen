'use client';

import { useState } from 'react';
import { Loader2, Code, CheckCircle, XCircle } from 'lucide-react';

export default function TestPerplexityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: {
      html?: string;
      css?: string;
      javascript?: string;
      readme?: string;
      imagePrompt?: string;
      [key: string]: unknown;
    };
    error?: string;
    confidence?: number;
    suggestions?: string[];
  } | null>(null);
  const [testType, setTestType] = useState('code');
  const [testData, setTestData] = useState({
    prompt: 'Modern web application dashboard',
    description: 'A modern e-commerce website',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981'
  });

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      let data;
      
      switch (testType) {
        case 'code':
          data = {
            dataAnalysis: { description: testData.description },
            selectedColors: { 
              primary: testData.primaryColor, 
              secondary: testData.secondaryColor 
            }
          };
          break;
        case 'image':
          data = { prompt: testData.prompt };
          break;
        case 'analysis':
          data = {
            type: 'text',
            name: 'test.txt',
            content: testData.description
          };
          break;
        case 'layout':
          data = {
            suggestedAppType: 'E-commerce',
            description: testData.description
          };
          break;
        default:
          data = {};
      }

      console.log('📤 [TEST PAGE] Sending request:', { testType, data });
      
      const response = await fetch('/api/test-perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, data }),
      });

      const responseData = await response.json();
      setResult(responseData);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCode = async () => {
    if (!result?.data) return;

    try {
      console.log('📥 [TEST PAGE] Starting download...');
      
      const response = await fetch('/api/export/code/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: result.data }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `perplexity-generated-${Date.now()}.zip`;
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Perplexity AI Test
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Test Perplexity AI for code generation, image prompts, analysis, and layout generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Code className="w-5 h-5" />
                Test Configuration
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Configure and run Perplexity AI tests
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="testType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type
                </label>
                <select
                  id="testType"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="code">
                    Code Generation
                  </option>
                  <option value="image">
                    Image Prompt
                  </option>
                  <option value="analysis">
                    Document Analysis
                  </option>
                  <option value="layout">
                    Layout Generation
                  </option>
                </select>
              </div>

              {testType === 'code' && (
                <>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={testData.description}
                      onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                      placeholder="Describe the web application you want to generate..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <input
                        id="primaryColor"
                        type="color"
                        value={testData.primaryColor}
                        onChange={(e) => setTestData({ ...testData, primaryColor: e.target.value })}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Secondary Color
                      </label>
                      <input
                        id="secondaryColor"
                        type="color"
                        value={testData.secondaryColor}
                        onChange={(e) => setTestData({ ...testData, secondaryColor: e.target.value })}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {testType === 'image' && (
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={testData.prompt}
                    onChange={(e) => setTestData({ ...testData, prompt: e.target.value })}
                    placeholder="Describe the image you want to generate..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              )}

              {(testType === 'analysis' || testType === 'layout') && (
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={testData.description}
                    onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                    placeholder="Enter content for analysis or layout generation..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              )}

              <button 
                onClick={handleTest} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Perplexity AI...
                  </>
                ) : (
                  'Run Test'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                {result ? (
                  result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <Code className="w-5 h-5" />
                )}
                Test Results
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {result ? (
                  result.success ? 'Test completed successfully' : 'Test failed'
                ) : (
                  'Run a test to see results here'
                )}
              </p>
            </div>
            <div>
              {result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                    {result.confidence && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Confidence: {(result.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {result.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}

                  {result.data && (
                    <div className="space-y-4">
                      {testType === 'code' && result.data.html && (
                        <div>
                          <h4 className="font-semibold mb-2">Generated HTML Preview:</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto">
                            <pre className="text-xs whitespace-pre-wrap">
                              {result.data.html.substring(0, 500)}
                              {result.data.html.length > 500 && '...'}
                            </pre>
                          </div>
                        </div>
                      )}

                      {testType === 'image' && result.data.imagePrompt && (
                        <div>
                          <h4 className="font-semibold mb-2">Enhanced Image Prompt:</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <p className="text-sm">{result.data.imagePrompt}</p>
                          </div>
                        </div>
                      )}

                      {testType === 'analysis' && (
                        <div>
                          <h4 className="font-semibold mb-2">Analysis Results:</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {testType === 'layout' && (
                        <div>
                          <h4 className="font-semibold mb-2">Layout Variations:</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {testType === 'code' && result.data.html && (
                        <button 
                          onClick={downloadCode} 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Download Generated Code
                        </button>
                      )}
                    </div>
                  )}

                  {result.suggestions && result.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!result && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet. Run a test to see the output here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
