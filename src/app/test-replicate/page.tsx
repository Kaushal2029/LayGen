"use client";

import { useState } from 'react';
import { Sparkles, Loader2, Download } from 'lucide-react';
import NextImage from 'next/image';

export default function TestReplicatePage() {
  const [prompt, setPrompt] = useState('A modern web dashboard with clean design, blue and white colors, cards and charts');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 [TEST PAGE] Starting Replicate test...');
      const response = await fetch('/api/test-replicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('🧪 [TEST PAGE] Response received:', data);

      if (data.success) {
        setResult(data.data);
        console.log('✅ [TEST PAGE] Test successful!');
      } else {
        setError(data.error);
        console.log('❌ [TEST PAGE] Test failed:', data.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [TEST PAGE] Test error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result?.image) {
      const link = document.createElement('a');
      link.href = result.image;
      link.download = `replicate-test-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Replicate AI Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test image generation with Replicate AI
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Describe the image you want to generate..."
              />
            </div>
            
            <button
              onClick={handleTest}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Generated Image
              </h3>
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <NextImage
                  src={result.image}
                  alt="Generated image"
                  width={800}
                  height={600}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  onError={() => {
                    console.error('❌ [TEST PAGE] Image failed to load');
                  }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Prompt:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{result.prompt}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Processing Time:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{result.processingTime}ms</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Generated At:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(result.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <p className="text-green-600 dark:text-green-400 mt-1">✅ Success</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            Setup Instructions
          </h3>
          <div className="text-blue-700 dark:text-blue-300 space-y-2">
            <p>1. Make sure you have added <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">REPLICATE_API_TOKEN</code> to your <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env.local</code> file</p>
            <p>2. Get your API token from: <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">https://replicate.com/account/api-tokens</a></p>
            <p>3. Restart your development server after adding the token</p>
          </div>
        </div>
      </div>
    </div>
  );
}
