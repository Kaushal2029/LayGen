"use client";

import { useState } from 'react';
import { useDesignSelector } from '@/hooks/useDesignSelector';
import { Sparkles, Palette, Layout, RefreshCw, Image } from 'lucide-react';
import NextImage from 'next/image';
import { DesignOption, ColorCombination, DataAnalysis, ExcelData } from '@/types';

interface DesignSelectorProps {
  onDesignSelect?: (design: DesignOption) => void;
  onColorSelect?: (colors: Record<string, string>) => void;
  onDesignsGenerated?: (designs: DesignOption[], colors: ColorCombination[]) => void;
  initialDataAnalysis?: DataAnalysis | null;
  initialColors?: Record<string, string>;
  designOptions?: DesignOption[];
  colorCombinations?: ColorCombination[];
  isLoading?: boolean;
  error?: string | null;
  excelData?: ExcelData | null;
}

export default function DesignSelector({
  onDesignSelect,
  onColorSelect,
  onDesignsGenerated,
  initialDataAnalysis,
  initialColors,
  designOptions = [],
  colorCombinations = [],
  isLoading = false,
  error = null,
  excelData
}: DesignSelectorProps) {
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    generateDesigns,
    selectColors
  } = useDesignSelector();

  const handleGenerateDesigns = async () => {
    setIsGenerating(true);
    try {
      // Use only the description from data analysis, not user input
      const description = initialDataAnalysis?.description || initialDataAnalysis?.suggestedAppType || 'Modern web application';
      console.log('🎨 [DESIGN SELECTOR] Generating designs with Excel data:', !!excelData);
      console.log('🎨 [DESIGN SELECTOR] Excel data details:', excelData ? {
        description: excelData.description?.substring(0, 100) + '...',
        requirementsCount: excelData.requirements?.length || 0,
        featuresCount: excelData.features?.length || 0
      } : 'No Excel data');
      
      const result = await generateDesigns(description, initialDataAnalysis || undefined, initialColors, excelData as unknown as Record<string, unknown> || undefined);
      // Notify parent component about the generated designs
      if (onDesignsGenerated && result?.designOptions?.length > 0) {
        onDesignsGenerated(result.designOptions, result.colorCombinations || []);
        console.log('Designs generated successfully:', result);
      }
    } catch (error) {
      console.error('Failed to generate designs:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDesignSelect = (designId: string) => {
    console.log('🎨 [DESIGN SELECTOR] Design selected:', designId);
    setSelectedDesignId(designId);
    
    // Find the design from the props instead of the hook
    const design = designOptions.find(d => d.id === designId);
    console.log('🎨 [DESIGN SELECTOR] Found design:', design ? 'Yes' : 'No');
    
    if (design && onDesignSelect) {
      console.log('🎨 [DESIGN SELECTOR] Calling onDesignSelect with design:', design.name);
      onDesignSelect(design);
    } else {
      console.log('❌ [DESIGN SELECTOR] No design found or onDesignSelect not provided');
    }
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColorName(colorName);
    const colors = selectColors(colorName);
    if (onColorSelect) {
      onColorSelect(colors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Design Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Generate design images and layouts based on your requirements
        </p>
      </div>

      {/* Description Display */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Design Requirements
        </label>
        <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <p className="text-gray-900 dark:text-white text-sm">
            {initialDataAnalysis?.description || initialDataAnalysis?.suggestedAppType || 'Modern web application'}
          </p>
        </div>
        <button
          onClick={handleGenerateDesigns}
          disabled={isGenerating || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {(isGenerating || isLoading) ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating Designs...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Designs</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Data Analysis Display */}
      {initialDataAnalysis && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Data Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">App Type:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{initialDataAnalysis.suggestedAppType}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Project:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{initialDataAnalysis.projectName}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Data Type:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{initialDataAnalysis.dataType}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Records:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{initialDataAnalysis.recordCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State for Design Generation */}
      {/* {(isGenerating || isLoading) && designOptions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Generating Design Options
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            AI is creating multiple design variations and generating images for your application...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This may take a moment as we generate high-quality design images...
          </div>
        </div>
      )} */}

      {/* Design Options */}
      {designOptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="w-5 h-5" aria-hidden="true" />
            <span>Design Options</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designOptions.map((design) => (
              <div
                key={design.id}
                onClick={() => handleDesignSelect(design.id)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
                  selectedDesignId === design.id
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Design Image */}
                {design.preview ? (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <NextImage
                      src={design.preview}
                      alt={`${design.name} preview`}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover"
                      onError={() => {
                        console.warn('Failed to load design image:', design.name);
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-32 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">Design Preview</div>
                    </div>
                  </div>
                )}
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {design.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {design.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div>Type: {design.layout?.type || 'Dashboard'}</div>
                  <div>Theme: {design.layout?.theme || 'Modern'}</div>
                  <div>Components: {design.components?.length || 0}</div>
                  {(design as DesignOption & { imagePrompt?: string }).imagePrompt && (
                    <div className="mt-2 text-xs text-gray-400 italic">
                      AI Generated Image
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Combinations */}
      {colorCombinations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Color Schemes</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorCombinations.map((combo) => (
              <div
                key={combo.name}
                onClick={() => handleColorSelect(combo.name)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedColorName === combo.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {combo.name}
                </h4>
                <div className="flex space-x-2 mb-2">
                  {Object.entries(combo.colors).map(([name, color]) => (
                    <div
                      key={name}
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color as string }}
                      title={`${name}: ${color}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {combo.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isGenerating && !isLoading && designOptions.length === 0 && colorCombinations.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Enter your design requirements above to generate suggestions</p>
        </div>
      )}
    </div>
  );
}
