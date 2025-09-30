"use client";

import { useState } from "react";
import { Upload, FileText, Image, Code, Sparkles, Download, FileSpreadsheet, RefreshCw, Settings } from "lucide-react";
import DesignSelector from "@/components/DesignSelector";
import CodeGenerationSelector from "@/components/CodeGenerationSelector";
import { parseExcelFile, generatePromptFromExcelData } from "@/utils/excel-parser";
import { DesignOption, ColorCombination, ExcelData, CodeGenerationOptions } from "@/types";

export default function Home() {
  const [, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedCode, setGeneratedCode] = useState<{ 
    html?: string; 
    css?: string; 
    javascript?: string; 
    readme?: string; 
    react?: string;
    'react-components'?: string;
    'react-setup'?: string;
    'package.json'?: string;
    downloadUrl?: string 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorCombinations, setColorCombinations] = useState<Array<{
    name: string;
    colors: Record<string, string>;
    preview: string;
  }>>([]);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{
    fileType: string;
    fileName: string;
    content: string;
    progress: number;
  }>>([]);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

  const [dataAnalysis, setDataAnalysis] = useState<{
    dataType: string;
    columns: string[];
    recordCount: string;
    dataPatterns: string;
    suggestedAppType: string;
    description: string;
    projectName: string;
    titleColumn: string;
  } | null>(null);
  const [designOptions, setDesignOptions] = useState<Array<{
    id: string;
    name: string;
    description: string;
    preview: string;
    components: Array<{
      name: string;
      type: string;
      description: string;
      properties: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      layout: { x: number; y: number; width: number; height: number };
    }>;
    layout: {
      type: string;
      theme: string;
      colors: Record<string, string>;
    };
  }>>([]);
  const [isGeneratingDesigns, setIsGeneratingDesigns] = useState(false);
  const [designPrompt, setDesignPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Code generation options
  const [codeGenerationOptions, setCodeGenerationOptions] = useState<CodeGenerationOptions>({
    selectedFileTypes: ['html', 'css', 'javascript', 'readme'],
    framework: 'html',
    includeDependencies: true,
    includeDocumentation: true,
    includeDocker: false
  });

  // Reset code generation options to defaults
  const resetCodeGenerationOptions = () => {
    setCodeGenerationOptions({
      selectedFileTypes: ['html', 'css', 'javascript', 'readme'],
      framework: 'html',
      includeDependencies: true,
      includeDocumentation: true,
      includeDocker: false
    });
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setIsAnalyzing(true);
    setCurrentStep(2);
    setError(null);

    try {
      // Upload file and parse with AI
      const formData = new FormData();
      formData.append('file', file);

      const parseResponse = await fetch('/api/ai/parse', {
        method: 'POST',
        body: formData,
      });

      const parseResult = await parseResponse.json();

      if (!parseResult.success) {
        console.error('❌ [MAIN PAGE] Document parsing failed:', parseResult.error);
        
        // Check if it's an API key issue
        if (parseResult.error?.includes('401') || parseResult.error?.includes('Unauthorized')) {
          throw new Error('API authentication failed. Please check your API keys in .env.local file and restart the server.');
        }
        
        throw new Error(parseResult.error || 'Failed to parse document');
      }

      // Check if we have data analysis (Excel data)
      if (parseResult.data.dataAnalysis) {
        // Check if it's an Excel file and parse it for better description
        if (file.name.match(/\.(xlsx|xls)$/i)) {
          try {
            const excelData = await parseExcelFile(file);
            setExcelData(excelData); // Store Excel data for design generation
            console.log('📊 [MAIN PAGE] Excel data stored:', {
              hasDescription: !!excelData.description,
              description: excelData.description?.substring(0, 100) + '...',
              requirementsCount: excelData.requirements?.length || 0,
              featuresCount: excelData.features?.length || 0
            });
            
            // Generate comprehensive prompt from Excel data
            const prompt = generatePromptFromExcelData(excelData);
            setDesignPrompt(prompt);
            
            // Update dataAnalysis with the Excel description
            setDataAnalysis({
              ...parseResult.data.dataAnalysis,
              description: prompt
            });
          } catch (excelError) {
            console.warn('Excel parsing failed, using data analysis:', excelError);
            // Use data analysis description as fallback
            const fallbackPrompt = parseResult.data.dataAnalysis?.suggestedAppType || 'Modern web application';
            setDesignPrompt(fallbackPrompt);
            
            // Update dataAnalysis with fallback description
            setDataAnalysis({
              ...parseResult.data.dataAnalysis,
              description: fallbackPrompt
            });
          }
        } else {
          // For non-Excel files, use the data analysis description directly
          const prompt = parseResult.data.dataAnalysis?.suggestedAppType || 'Modern web application';
          setDesignPrompt(prompt);
          
          // Update dataAnalysis with the description
          setDataAnalysis({
            ...parseResult.data.dataAnalysis,
            description: prompt
          });
        }
        
        setCurrentStep(3); // Design generation step
      } else {
        // For regular documents, generate designs directly
        setCurrentStep(3);
      }
      
      setIsProcessing(false);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
      setIsProcessing(false);
      setCurrentStep(1);
      resetCodeGenerationOptions();
    }
  };

  const handleGenerateDesigns = async () => {
    if (!designPrompt.trim()) return;

    setIsGeneratingDesigns(true);
    setError(null);
    try {
      console.log('🎨 [MAIN PAGE] Generating designs with prompt:', designPrompt);
      console.log('📊 [MAIN PAGE] Excel data available for design generation:', !!excelData);
      console.log('📊 [MAIN PAGE] Excel data details:', excelData ? {
        hasDescription: !!excelData.description,
        description: excelData.description?.substring(0, 100) + '...',
        requirementsCount: excelData.requirements?.length || 0,
        featuresCount: excelData.features?.length || 0
      } : 'No Excel data');
      
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: designPrompt,
          dataAnalysis,
          selectedColors,
          excelData: excelData
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate designs');
      }

      console.log('Generated designs:', result.data);
      setDesignOptions(result.data.designOptions || []);
      setColorCombinations(result.data.colorCombinations || []);
      setDataAnalysis(result.data.dataAnalysis || dataAnalysis);
      setCurrentStep(4); // Move to design selection step
    } catch (error) {
      console.error('Error generating designs:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate designs');
    } finally {
      setIsGeneratingDesigns(false);
    }
  };

  const handleDesignSelect = (design: DesignOption) => {
    console.log('🎯 [MAIN PAGE] Design selected:', design);
    console.log('🎯 [MAIN PAGE] Design name:', design?.name);
    console.log('🎯 [MAIN PAGE] Design colors:', design?.layout?.colors);
    
    // Set design ID and colors immediately
    setSelectedDesignId(design?.id || null);
    const colors = design?.layout?.colors || {};
    setSelectedColors(colors);
    console.log('✅ [MAIN PAGE] Design ID and colors set successfully:', {
      designId: design?.id,
      colors: colors
    });
    
    setCurrentStep(5); // Move to code generation step
    console.log('🎯 [MAIN PAGE] Moved to step 5 (Code Generation)');
    
    // Automatically trigger code generation after design selection
    console.log('🚀 [MAIN PAGE] Auto-triggering code generation in 2 seconds...');
    console.log('📊 [MAIN PAGE] Pre-generation check:', {
      hasDataAnalysis: !!dataAnalysis,
      dataAnalysisDescription: dataAnalysis?.description,
      hasSelectedColors: Object.keys(colors).length > 0,
      hasSelectedDesign: !!design?.id,
      colors: colors,
      designPrompt: designPrompt
    });
    
    // Remove automatic code generation - let user configure options first
    console.log('✅ [MAIN PAGE] Design selection completed, ready for user to configure code generation options');
  };

  const handleColorSelect = (colors: Record<string, string>) => {
    console.log('Selected colors:', colors);
    setSelectedColors(colors);
  };


  const handleDesignsGenerated = (designs: DesignOption[], colors: ColorCombination[]) => {
    console.log('Designs generated in parent:', designs, colors);
    setDesignOptions(designs);
    setColorCombinations(colors);
    
    // Ensure dataAnalysis has description for code generation
    if (dataAnalysis && !dataAnalysis.description) {
      setDataAnalysis({
        ...dataAnalysis,
        description: dataAnalysis.suggestedAppType || 'Modern web application'
      });
    }
    
    setCurrentStep(4); // Move to design selection step
  };

  const handleGenerateCode = async (forceAI = false) => {
    console.log('💻 [MAIN PAGE] Code generation requested');
    console.log('💻 [MAIN PAGE] Force AI:', forceAI);
    console.log('💻 [MAIN PAGE] Data analysis available:', !!dataAnalysis);
    console.log('💻 [MAIN PAGE] Selected colors available:', !!selectedColors);
    
    // Create fallback dataAnalysis if missing
    let finalDataAnalysis = dataAnalysis;
    if (!dataAnalysis) {
      console.log('⚠️ [MAIN PAGE] Data analysis missing, creating fallback...');
      const fallbackDescription = designPrompt || 
        (excelData?.description) || 
        'Modern web application';
      
      finalDataAnalysis = {
        dataType: 'web_application',
        columns: [],
        recordCount: '0',
        dataPatterns: 'General web application patterns',
        suggestedAppType: 'Web Application',
        description: fallbackDescription,
        projectName: 'Generated App',
        titleColumn: 'title'
      };
      setDataAnalysis(finalDataAnalysis);
      console.log('✅ [MAIN PAGE] Fallback data analysis created:', {
        description: finalDataAnalysis.description,
        suggestedAppType: finalDataAnalysis.suggestedAppType,
        projectName: finalDataAnalysis.projectName
      });
    }
    
    if (!selectedColors) {
      console.log('❌ [MAIN PAGE] Missing selected colors for code generation');
      return;
    }

    console.log('💻 [MAIN PAGE] Starting code generation...');
    setIsGeneratingCode(true);
    setError(null);
    try {
      const apiEndpoint = forceAI ? '/api/test-ai-code' : '/api/export/code';
      console.log('🌐 [MAIN PAGE] Making API call to', apiEndpoint);
      console.log('📤 [MAIN PAGE] Request payload:', {
        hasDataAnalysis: !!finalDataAnalysis,
        hasSelectedColors: !!selectedColors,
        projectName: finalDataAnalysis?.projectName,
        framework: 'html',
        forceAI: forceAI
      });
      
      // Generate code directly with selected colors and data
      const codeResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          layoutData: { 
            dataAnalysis: finalDataAnalysis,
            selectedColors,
            projectName: finalDataAnalysis?.projectName || 'Generated Project'
          },
          framework: codeGenerationOptions.framework,
          codeGenerationOptions: codeGenerationOptions
        }),
      });

      console.log('📥 [MAIN PAGE] Code generation response received:', codeResponse.status);
      const codeResult = await codeResponse.json();
      console.log('📊 [MAIN PAGE] Code generation result:', codeResult.success ? 'Success' : 'Failed');
      console.log('📊 [MAIN PAGE] Full response:', codeResult);

      if (!codeResult.success) {
        console.log('❌ [MAIN PAGE] Code generation failed:', codeResult.error);
        throw new Error(codeResult.error || 'Failed to generate code');
      }

      // Handle generated code - store it and show download option
      console.log('✅ [MAIN PAGE] Code generation successful!');
      console.log('📊 [MAIN PAGE] Generated code data keys:', Object.keys(codeResult.data || {}));
      console.log('🤖 [MAIN PAGE] AI Generated:', codeResult.isAIGenerated || false);
      console.log('💾 [MAIN PAGE] Storing generated code...');
      setGeneratedCode(codeResult.data);
      setIsAIGenerated(codeResult.isAIGenerated || false);
      setCurrentStep(6);
      console.log('🎯 [MAIN PAGE] Moved to step 6 (Download)');
    } catch (error) {
      console.error('❌ [MAIN PAGE] Error generating code:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      console.log('🏁 [MAIN PAGE] Code generation process completed');
      setIsGeneratingCode(false);
    }
  };

  const handleStepByStepGeneration = async () => {
    console.log('🚀 [STEP-BY-STEP] Starting step-by-step code generation...');
    console.log('📋 [STEP-BY-STEP] Framework:', codeGenerationOptions.framework);
    console.log('📋 [STEP-BY-STEP] Selected file types:', codeGenerationOptions.selectedFileTypes);
    
    setIsGeneratingCode(true);
    setError(null);
    setGeneratedFiles([]);
    setCurrentStep(6); // Move to download step to show progress
    
    try {
      const response = await fetch('/api/generate-step-by-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutData: {
            dataAnalysis: dataAnalysis,
            selectedColors,
            projectName: dataAnalysis?.projectName || 'Generated Project'
          },
          framework: codeGenerationOptions.framework,
          codeGenerationOptions: codeGenerationOptions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start step-by-step generation');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      const generatedFiles: Array<{
        fileType: string;
        fileName: string;
        content: string;
        progress: number;
      }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'file') {
                console.log(`✅ [STEP-BY-STEP] Generated ${data.fileType}:`, data.fileName);
                const newFile = {
                  fileType: data.fileType,
                  fileName: data.fileName,
                  content: data.content,
                  progress: data.progress
                };
                generatedFiles.push(newFile);
                setGeneratedFiles([...generatedFiles]);
                
                // Update generatedCode immediately with the new file
                setGeneratedCode(prev => ({
                  ...prev,
                  [data.fileType]: data.content
                }));
              } else if (data.type === 'progress') {
                console.log(`🔄 [STEP-BY-STEP] Progress: ${data.message} (${data.progress}%)`);
                setCurrentStep(6); // Keep showing progress
              } else if (data.type === 'complete') {
                console.log('🎉 [STEP-BY-STEP] Generation completed!');
                console.log('📊 [STEP-BY-STEP] Final generatedFiles:', generatedFiles);
                console.log('📊 [STEP-BY-STEP] Final generatedCode keys:', Object.keys(generatedCode || {}));
                setIsAIGenerated(true);
              } else if (data.type === 'error') {
                console.error(`❌ [STEP-BY-STEP] Error in ${data.fileType}:`, data.error);
                setError(`Error generating ${data.fileType}: ${data.error}`);
              }
            } catch (parseError) {
              console.warn('⚠️ [STEP-BY-STEP] Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [STEP-BY-STEP] Error:', error);
      setError(error instanceof Error ? error.message : 'Step-by-step generation failed');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: "Upload Data", description: "Upload your Excel file with data" },
      { id: 2, title: "AI Analysis", description: "AI analyzes your data and creates design prompt" },
      { id: 3, title: "Generate Designs", description: "AI generates design images and color schemes" },
      { id: 4, title: "Select Design", description: "Choose your preferred design and colors" },
      { id: 5, title: "Generate Code", description: "Create complete HTML, CSS, JS files" },
      { id: 6, title: "Download", description: "Download your working application" }
    ];

    // Update descriptions based on data analysis
    if (dataAnalysis) {
      baseSteps[0].description = `Upload your Excel file with ${dataAnalysis.dataType?.toLowerCase() || 'data'}`;
      baseSteps[1].description = `AI analyzes your ${dataAnalysis.suggestedAppType?.toLowerCase() || 'data'} and creates image prompt`;
    }
    
    // Update based on design options
    if (designOptions.length > 0) {
      baseSteps[1].description += ` (${designOptions.length} design options available)`;
    }

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Laygen</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              From Requirements to Ready UI — Instantly
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transform Requirements
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Into Ready UI
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Upload your design requirements, let AI generate design options, choose your favorite, 
            and export production-ready code instantly.
          </p>
        </div>


        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'
                }`}>
                  {step.id === 1 && <Upload className="w-5 h-5" />}
                  {step.id === 2 && <Sparkles className="w-5 h-5" />}
                  {step.id === 3 && (
                    <>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                  {step.id === 4 && (
                    <>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                  {step.id === 5 && <Code className="w-5 h-5" />}
                  {step.id === 6 && <Download className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps.find(step => step.id === currentStep)?.description}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              ❌ {error}
            </p>
          </div>
        )}

        {/* Main Action Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Your Requirements
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Upload an Excel file with your data and requirements, or any document with design specifications
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <FileSpreadsheet className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Click to upload Excel file or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Excel files (.xlsx, .xls) for data-driven designs
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Also supports: PDF, DOC, DOCX, TXT, MD
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {isAnalyzing ? 'AI is Analyzing...' : 'Processing Complete!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {isAnalyzing 
                  ? 'Our AI is analyzing your data and creating design prompts'
                  : 'Analysis complete! Ready to generate designs.'
                }
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: isAnalyzing ? '60%' : '100%'}}></div>
              </div>
              {!isAnalyzing && (
                <div className="mt-6">
                  <button
                    onClick={handleGenerateDesigns}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-5 h-5 mr-2 inline" />
                    Generate Design Options
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Generate Design Options
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                AI will generate multiple design options and color schemes for your application
              </p>
              
              <div className="max-w-4xl mx-auto">
                <DesignSelector
                  onDesignSelect={handleDesignSelect}
                  onColorSelect={handleColorSelect}
                  onDesignsGenerated={handleDesignsGenerated}
                  initialDataAnalysis={dataAnalysis}
                  initialColors={selectedColors}
                  designOptions={designOptions}
                  colorCombinations={colorCombinations}
                  isLoading={isGeneratingDesigns}
                  error={error}
                  excelData={excelData}
                />
              </div>
              
              {/* Generate Button */}
              <div className="mt-8">
                <button
                  onClick={handleGenerateDesigns}
                  disabled={isGeneratingDesigns || !designPrompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isGeneratingDesigns ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin inline" />
                      Generating Designs...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 inline" />
                      Generate Design Options
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && designOptions.length > 0 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-2xl">✨</div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Design Options Generated!
              </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                Choose your preferred design and color scheme to continue.
              </p>
              
              <div className="max-w-6xl mx-auto">
                <DesignSelector
                  onDesignSelect={handleDesignSelect}
                  onColorSelect={handleColorSelect}
                  onDesignsGenerated={handleDesignsGenerated}
                  initialDataAnalysis={dataAnalysis}
                  initialColors={selectedColors}
                  designOptions={designOptions}
                  colorCombinations={colorCombinations}
                  isLoading={isGeneratingDesigns}
                  error={error}
                  excelData={excelData}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && !error && !isGeneratingCode && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ready to Generate Code
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Configure your code generation options below and click the button to generate your complete web application
                </p>
              </div>
              
              {/* Current Selection Summary */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
                <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Current Selection
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Design:</span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        {designOptions.find(d => d.id === selectedDesignId)?.name || 'None selected'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Framework:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                        {codeGenerationOptions.framework.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Files to generate:</span>
                      <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md text-sm font-medium">
                        {codeGenerationOptions.selectedFileTypes.length} file(s)
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Colors:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedColors && Object.keys(selectedColors).length > 0 ? (
                          Object.entries(selectedColors).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-1">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                                style={{ backgroundColor: value }}
                                title={`${key}: ${value}`}
                              ></div>
                              <span className="text-xs text-blue-700 dark:text-blue-300">{key}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-blue-700 dark:text-blue-300 text-sm">None selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Code Generation Options */}
              <div className="mb-8 p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                  Code Generation Options
                </h4>
                <CodeGenerationSelector
                  key={codeGenerationOptions.framework}
                  options={codeGenerationOptions}
                  onOptionsChange={setCodeGenerationOptions}
                  disabled={isGeneratingCode}
                />
              </div>
              
              {/* Generate Code Button */}
              <div className="text-center space-y-6">
                <button
                  onClick={() => {
                    if (codeGenerationOptions.framework === 'react') {
                      handleStepByStepGeneration();
                    } else {
                      handleGenerateCode();
                    }
                  }}
                  disabled={isGeneratingCode || codeGenerationOptions.selectedFileTypes.length === 0}
                  className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none text-lg font-semibold"
                >
                  {isGeneratingCode ? (
                    <>
                      <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                      <span>
                        {codeGenerationOptions.framework === 'react' ? 'Generating React Components...' : 'Generating Code...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Code className="w-6 h-6 mr-3" />
                      <span>
                        {codeGenerationOptions.framework === 'react' ? 'Generate React App' : 'Generate Code Now'}
                      </span>
                    </>
                  )}
                </button>
                
                {codeGenerationOptions.selectedFileTypes.length === 0 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-orange-600 dark:text-orange-400 font-medium flex items-center justify-center">
                      <span className="text-xl mr-2">⚠️</span>
                      Please select at least one file type to generate
                    </p>
                  </div>
                )}
                
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Ready to create your <strong>{codeGenerationOptions.framework.toUpperCase()}</strong> application</p>
                  <p>Generating <strong>{codeGenerationOptions.selectedFileTypes.length}</strong> file(s) with your selected design and colors</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && !error && isGeneratingCode && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl">
                <Code className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Generating {codeGenerationOptions.framework.toUpperCase()} Application...
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                AI is creating your complete web application with {codeGenerationOptions.selectedFileTypes.length} file(s)
              </p>
              
              {/* Progress Steps */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">Analyzing requirements...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">Generating {codeGenerationOptions.selectedFileTypes.includes('html') ? 'HTML' : 'code'} structure...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">Creating {codeGenerationOptions.selectedFileTypes.includes('css') ? 'CSS' : 'styling'}...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">Building {codeGenerationOptions.selectedFileTypes.includes('javascript') ? 'JavaScript' : 'functionality'}...</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 max-w-md mx-auto">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              
              {/* Loading Steps */}
             
            </div>
          )}

          {currentStep === 5 && error && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Code Generation Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {error}
              </p>
              
              {/* Error Details */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Don&apos;t worry! This can happen sometimes. Try the retry button below or start over with a fresh approach.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    console.log('🔄 [MAIN PAGE] Retry code generation requested');
                    setError(null);
                    handleGenerateCode(true);
                  }}
                  disabled={isGeneratingCode}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isGeneratingCode ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      <span>Retry Code Generation</span>
                    </>
                  )}
                </button>
                
                <div>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      resetCodeGenerationOptions();
                    }}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="text-center">
              {isGeneratingCode ? (
                // Step-by-step generation progress
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Generating {codeGenerationOptions.framework === 'react' ? 'React Components' : 'Code'}...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Creating your application files step by step
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${generatedFiles.length > 0 ? (generatedFiles.length / codeGenerationOptions.selectedFileTypes.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  
                  {/* Generated Files List */}
                  {generatedFiles.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generated Files</h4>
                      <div className="space-y-2">
                        {generatedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {file.fileName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                ({file.fileType})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round((file.content.length / 1000) * 10) / 10}KB
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Remaining Files */}
                  {generatedFiles.length < codeGenerationOptions.selectedFileTypes.length && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Generating {codeGenerationOptions.selectedFileTypes[generatedFiles.length]}...
                    </div>
                  )}
                </div>
              ) : generatedCode ? (
                // Download section
                <div>
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Your {codeGenerationOptions.framework === 'react' ? 'React' : 'Web'} Application is Ready!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    {codeGenerationOptions.framework === 'react' 
                      ? 'Download your complete React application with components, setup guide, and all necessary files.'
                      : 'Download your complete web application with HTML, CSS, and JavaScript files.'
                    }
                  </p>
              
              <div className="space-y-6">
                {/* File Structure Display */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generated Files</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {codeGenerationOptions.framework === 'react' ? (
                      <>
                        {(generatedCode?.['react-components'] || generatedCode?.react) && <div className="flex items-center text-green-600 dark:text-green-400">✅ React Components</div>}
                        {(generatedCode?.['react-setup'] || generatedCode?.readme) && <div className="flex items-center text-green-600 dark:text-green-400">✅ Setup Guide</div>}
                        {generatedCode?.html && <div className="flex items-center text-green-600 dark:text-green-400">✅ index.html</div>}
                        {generatedCode?.css && <div className="flex items-center text-green-600 dark:text-green-400">✅ styles.css</div>}
                        {generatedCode?.javascript && <div className="flex items-center text-green-600 dark:text-green-400">✅ script.js</div>}
                        {generatedCode?.['package.json'] && <div className="flex items-center text-green-600 dark:text-green-400">✅ package.json</div>}
                      </>
                    ) : (
                      <>
                        {generatedCode?.html && <div className="flex items-center text-green-600 dark:text-green-400">✅ index.html</div>}
                        {generatedCode?.css && <div className="flex items-center text-green-600 dark:text-green-400">✅ styles.css</div>}
                        {generatedCode?.javascript && <div className="flex items-center text-green-600 dark:text-green-400">✅ script.js</div>}
                        {generatedCode?.readme && <div className="flex items-center text-green-600 dark:text-green-400">✅ README.txt</div>}
                      </>
                    )}
                  </div>
                </div>

                {/* AI Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generation Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600 dark:text-gray-300 mr-2">🤖 AI Generated:</span>
                      <span className={isAIGenerated ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                        {isAIGenerated ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {!isAIGenerated && (
                      <div className="text-orange-600 dark:text-orange-400 text-xs">
                        ⚠️ Fallback code used - AI generation may have failed
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={async () => {
                      try {
                        console.log('📥 [MAIN PAGE] Starting download...');
                        console.log('📊 [MAIN PAGE] GeneratedCode object:', generatedCode);
                        console.log('📊 [MAIN PAGE] Data being sent:', {
                          hasHtml: !!generatedCode?.html,
                          hasCss: !!generatedCode?.css,
                          hasJavascript: !!generatedCode?.javascript,
                          hasReadme: !!generatedCode?.readme,
                          hasReact: !!generatedCode?.react,
                          hasReactComponents: !!generatedCode?.['react-components'],
                          hasReactSetup: !!generatedCode?.['react-setup'],
                          hasPackageJson: !!generatedCode?.['package.json'],
                          dataKeys: Object.keys(generatedCode || {}),
                          generatedFilesCount: generatedFiles.length
                        });
                        
                        const response = await fetch('/api/export/code/download', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ 
                            data: generatedCode,
                            codeGenerationOptions: codeGenerationOptions
                          }),
                        });
                        
                        console.log('📡 [MAIN PAGE] Response status:', response.status);
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('❌ [MAIN PAGE] Response error:', errorText);
                          throw new Error(`Download failed: ${response.status} - ${errorText}`);
                        }
                        
                        const blob = await response.blob();
                        console.log('📦 [MAIN PAGE] Blob size:', blob.size, 'bytes');
                        console.log('📦 [MAIN PAGE] Blob type:', blob.type);
                        
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `laygen-${codeGenerationOptions.framework === 'react' ? 'react' : 'web'}-app-${Date.now()}.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        
                        console.log('✅ [MAIN PAGE] Download completed successfully');
                      } catch (error) {
                        console.error('❌ [MAIN PAGE] Download failed:', error);
                        alert('Download failed. Please try again.');
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {codeGenerationOptions.framework === 'react' ? 'Download React App' : 'Download Application'}
                  </button>
                  
                  {!isAIGenerated && (
                  <button 
                    onClick={() => {
                        console.log('🔄 [MAIN PAGE] Retry AI generation requested');
                        handleGenerateCode(true);
                      }}
                      disabled={isGeneratingCode}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Retry AI Generation
                    </button>
                  )}
                </div>
                
                
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {codeGenerationOptions.framework === 'react' 
                    ? 'Complete React application with components, setup guide, and all necessary files'
                    : 'Complete web application with HTML, CSS, JavaScript, and documentation'
                  }
                </div>
              </div>

              {/* Code Preview Section */}
              <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Code Preview</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {codeGenerationOptions.framework === 'react' ? (
                    <>
                      {/* React Components Preview */}
                      {(generatedCode?.['react-components'] || generatedCode?.react) && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">React Components</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{(generatedCode?.['react-components'] || generatedCode?.react || '').substring(0, 1000)}{(generatedCode?.['react-components'] || generatedCode?.react || '').length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* React Setup Preview */}
                      {(generatedCode?.['react-setup'] || generatedCode?.readme) && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup Guide</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{(generatedCode?.['react-setup'] || generatedCode?.readme || '').substring(0, 1000)}{(generatedCode?.['react-setup'] || generatedCode?.readme || '').length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* HTML Preview */}
                      {generatedCode?.html && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">index.html</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.html.substring(0, 1000)}{generatedCode.html.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* CSS Preview */}
                      {generatedCode?.css && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">styles.css</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.css.substring(0, 1000)}{generatedCode.css.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* JavaScript Preview */}
                      {generatedCode?.javascript && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">script.js</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.javascript.substring(0, 1000)}{generatedCode.javascript.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* Package.json Preview */}
                      {generatedCode?.['package.json'] && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">package.json</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode['package.json'].substring(0, 1000)}{generatedCode['package.json'].length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* HTML Preview */}
                      {generatedCode?.html && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">index.html</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.html.substring(0, 1000)}{generatedCode.html.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* CSS Preview */}
                      {generatedCode?.css && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">styles.css</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.css.substring(0, 1000)}{generatedCode.css.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* JavaScript Preview */}
                      {generatedCode?.javascript && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">script.js</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.javascript.substring(0, 1000)}{generatedCode.javascript.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}

                      {/* README Preview */}
                      {generatedCode?.readme && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">README.txt</h5>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                            <pre className="whitespace-pre-wrap">{generatedCode.readme.substring(0, 1000)}{generatedCode.readme.length > 1000 && '...'}</pre>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Live Preview Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      // Create a new window with the generated code
                      const htmlContent = generatedCode.html || '';
                      const cssContent = generatedCode.css || '';
                      const jsContent = generatedCode.javascript || '';
                      
                      // Create a complete HTML document
                      const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App Preview</title>
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
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Code className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ready to Generate
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Click the button above to start generating your application
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
