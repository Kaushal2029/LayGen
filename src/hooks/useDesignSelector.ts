import { useState, useCallback } from 'react';

interface DesignOption {
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
}

interface DataAnalysis {
  dataType: string;
  columns: string[];
  recordCount: string;
  dataPatterns: string;
  suggestedAppType: string;
  projectName: string;
  titleColumn: string;
}

interface ColorCombination {
  name: string;
  colors: Record<string, string>;
  preview: string;
}

export function useDesignSelector() {
  const [designOptions, setDesignOptions] = useState<DesignOption[]>([]);
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis | null>(null);
  const [colorCombinations, setColorCombinations] = useState<ColorCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDesigns = useCallback(async (prompt?: string, analysis?: DataAnalysis, colors?: Record<string, string>, excelData?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating designs with prompt:', prompt);
      console.log('Excel data available:', !!excelData);
      
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          dataAnalysis: analysis,
          selectedColors: colors,
          excelData: excelData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate design suggestions');
      }

      console.log('Design generation successful:', result.data);
      
      setDesignOptions(result.data.designOptions || []);
      setDataAnalysis(result.data.dataAnalysis || analysis);
      setColorCombinations(result.data.colorCombinations || []);

      return result.data;
    } catch (error) {
      console.error('Error generating designs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate design suggestions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectDesign = useCallback((designId: string) => {
    const selectedDesign = designOptions.find(design => design.id === designId);
    return selectedDesign;
  }, [designOptions]);

  const selectColors = useCallback((colorName: string) => {
    const selectedColors = colorCombinations.find(combo => combo.name === colorName);
    return selectedColors?.colors || {};
  }, [colorCombinations]);

  return {
    designOptions,
    dataAnalysis,
    colorCombinations,
    isLoading,
    error,
    generateDesigns,
    selectDesign,
    selectColors,
    setDesignOptions,
    setDataAnalysis,
    setColorCombinations,
    setError
  };
}
