"use client";

import { useState } from 'react';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestDownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestDownload = async () => {
    setIsDownloading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('🧪 [TEST PAGE] Testing download...');
      
      const response = await fetch('/api/test-download');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if it's a ZIP file
      const contentType = response.headers.get('content-type');
      console.log('📁 [TEST PAGE] Content-Type:', contentType);
      
      if (contentType === 'application/zip') {
        // Create download link with proper ZIP handling
        const blob = await response.blob();
        console.log('📦 [TEST PAGE] Blob type:', blob.type);
        console.log('📦 [TEST PAGE] Blob size:', blob.size, 'bytes');
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-download.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setResult('success');
        console.log('✅ [TEST PAGE] Download successful!');
      } else {
        throw new Error(`Expected ZIP file, got: ${contentType}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setResult('error');
      console.error('❌ [TEST PAGE] Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Download Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the ZIP file download functionality
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <button
              onClick={handleTestDownload}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 mx-auto transition-colors"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Testing Download...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Test Download</span>
                </>
              )}
            </button>
          </div>
        </div>

        {result === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                Download Successful!
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300 mt-2">
              The test ZIP file has been downloaded. Check your downloads folder and extract the ZIP to verify the files.
            </p>
          </div>
        )}

        {result === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Download Failed
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            What this test does:
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Creates a test ZIP file with HTML, CSS, JS, and README files</li>
            <li>• Tests the ZIP file generation using JSZip library</li>
            <li>• Verifies proper Content-Type headers (application/zip)</li>
            <li>• Tests the download functionality in the browser</li>
            <li>• Checks if the file can be downloaded and extracted</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
