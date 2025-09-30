'use client';

import React, { useState } from 'react';
import { CodeFileType, CodeGenerationOptions } from '@/types';
import { Check, FileText, Code, Palette, Settings, Package, BookOpen, Container } from 'lucide-react';

interface CodeGenerationSelectorProps {
  options: CodeGenerationOptions;
  onOptionsChange: (options: CodeGenerationOptions) => void;
  disabled?: boolean;
}

const fileTypeConfig: Record<CodeFileType, { 
  label: string; 
  description: string; 
  icon: React.ReactNode;
  category: 'core' | 'framework' | 'documentation' | 'devops';
  dependencies?: CodeFileType[];
}> = {
  html: {
    label: 'HTML',
    description: 'Main HTML structure',
    icon: <FileText className="w-4 h-4" />,
    category: 'core'
  },
  css: {
    label: 'CSS',
    description: 'Styling and layout',
    icon: <Palette className="w-4 h-4" />,
    category: 'core'
  },
  javascript: {
    label: 'JavaScript',
    description: 'Interactive functionality',
    icon: <Code className="w-4 h-4" />,
    category: 'core'
  },
  react: {
    label: 'React App',
    description: 'Main React component (App.jsx)',
    icon: <Code className="w-4 h-4" />,
    category: 'framework',
    dependencies: ['javascript', 'html']
  },
  'react-components': {
    label: 'React Components',
    description: 'Multiple React components with Tailwind CSS & Bootstrap styling',
    icon: <Code className="w-4 h-4" />,
    category: 'framework',
    dependencies: ['react']
  },
  'react-setup': {
    label: 'React Setup Guide',
    description: 'Complete setup instructions with Node.js and create-react-app',
    icon: <Settings className="w-4 h-4" />,
    category: 'documentation',
    dependencies: ['react']
  },
  vue: {
    label: 'Vue',
    description: 'Vue.js components',
    icon: <Code className="w-4 h-4" />,
    category: 'framework',
    dependencies: ['javascript', 'html']
  },
  svelte: {
    label: 'Svelte',
    description: 'Svelte components',
    icon: <Code className="w-4 h-4" />,
    category: 'framework',
    dependencies: ['javascript', 'html']
  },
  typescript: {
    label: 'TypeScript',
    description: 'Type-safe JavaScript',
    icon: <Code className="w-4 h-4" />,
    category: 'framework',
    dependencies: ['javascript']
  },
  readme: {
    label: 'README',
    description: 'Project documentation',
    icon: <BookOpen className="w-4 h-4" />,
    category: 'documentation'
  },
  'package.json': {
    label: 'Package.json',
    description: 'Dependencies and scripts',
    icon: <Package className="w-4 h-4" />,
    category: 'documentation'
  },
  gitignore: {
    label: '.gitignore',
    description: 'Git ignore rules',
    icon: <Settings className="w-4 h-4" />,
    category: 'documentation'
  },
  dockerfile: {
    label: 'Dockerfile',
    description: 'Container configuration',
    icon: <Container className="w-4 h-4" />,
    category: 'devops'
  },
  'docker-compose': {
    label: 'Docker Compose',
    description: 'Multi-container setup',
    icon: <Container className="w-4 h-4" />,
    category: 'devops',
    dependencies: ['dockerfile']
  }
};

const categoryLabels = {
  core: 'Core Files',
  framework: 'Framework Files',
  documentation: 'Documentation',
  devops: 'DevOps'
};

export default function CodeGenerationSelector({ 
  options, 
  onOptionsChange, 
  disabled = false 
}: CodeGenerationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFileTypeToggle = (fileType: CodeFileType) => {
    if (disabled) return;

    const isSelected = options.selectedFileTypes.includes(fileType);
    let newSelectedTypes: CodeFileType[];

    if (isSelected) {
      // Remove the file type and its dependencies
      newSelectedTypes = options.selectedFileTypes.filter(type => {
        const config = fileTypeConfig[type];
        return type !== fileType && !config.dependencies?.includes(fileType);
      });
    } else {
      // Add the file type and its dependencies
      const config = fileTypeConfig[fileType];
      const dependencies = config.dependencies || [];
      newSelectedTypes = [
        ...new Set([...options.selectedFileTypes, fileType, ...dependencies])
      ];
    }

    onOptionsChange({
      ...options,
      selectedFileTypes: newSelectedTypes
    });
  };

  const handleFrameworkChange = (framework: CodeGenerationOptions['framework']) => {
    if (disabled) return;

    console.log('🔄 [FRAMEWORK CHANGE] Switching to:', framework);
    console.log('🔄 [FRAMEWORK CHANGE] Current selectedFileTypes:', options.selectedFileTypes);

    // Auto-select appropriate file types based on framework
    let autoSelectedTypes: CodeFileType[] = ['html', 'css', 'readme'];

    switch (framework) {
      case 'react':
        autoSelectedTypes = ['react-components', 'react-setup'];
        break;
      case 'vue':
        autoSelectedTypes = ['html', 'css', 'javascript', 'vue', 'typescript', 'readme', 'package.json'];
        break;
      case 'svelte':
        autoSelectedTypes = ['html', 'css', 'javascript', 'svelte', 'typescript', 'readme', 'package.json'];
        break;
      case 'nextjs':
        autoSelectedTypes = ['html', 'css', 'javascript', 'react', 'typescript', 'readme', 'package.json', 'gitignore'];
        break;
      default:
        autoSelectedTypes = ['html', 'css', 'javascript', 'readme'];
    }

    console.log('🔄 [FRAMEWORK CHANGE] Auto-selecting:', autoSelectedTypes);

    onOptionsChange({
      ...options,
      framework,
      selectedFileTypes: autoSelectedTypes
    });
  };

  const getSelectedCount = () => {
    return options.selectedFileTypes.length;
  };

  const getSelectedPreview = () => {
    if (options.selectedFileTypes.length === 0) return 'No files selected';
    if (options.selectedFileTypes.length <= 3) {
      return options.selectedFileTypes.map(type => fileTypeConfig[type].label).join(', ');
    }
    return `${options.selectedFileTypes.length} files selected`;
  };

  // Filter file types based on selected framework
  const getFilteredFileTypes = () => {
    const allFileTypes = Object.entries(fileTypeConfig);
    
    switch (options.framework) {
      case 'react':
        // Only show React-specific files - no separate HTML/CSS/JS or React App
        return allFileTypes.filter(([type]) => 
          type === 'react-components' || 
          type === 'react-setup' || 
          type === 'package.json' || 
          type === 'readme' ||
          type === 'gitignore'
        );
      case 'vue':
        // Only show Vue-specific files and core files
        return allFileTypes.filter(([type]) => 
          type === 'vue' || 
          type === 'html' || 
          type === 'css' || 
          type === 'javascript' || 
          type === 'typescript' || 
          type === 'readme' || 
          type === 'package.json' ||
          type === 'gitignore' ||
          type === 'dockerfile' ||
          type === 'docker-compose'
        );
      case 'svelte':
        // Only show Svelte-specific files and core files
        return allFileTypes.filter(([type]) => 
          type === 'svelte' || 
          type === 'html' || 
          type === 'css' || 
          type === 'javascript' || 
          type === 'typescript' || 
          type === 'readme' || 
          type === 'package.json' ||
          type === 'gitignore' ||
          type === 'dockerfile' ||
          type === 'docker-compose'
        );
      case 'nextjs':
        // Only show Next.js-specific files and core files
        return allFileTypes.filter(([type]) => 
          type === 'react' || 
          type === 'html' || 
          type === 'css' || 
          type === 'javascript' || 
          type === 'typescript' || 
          type === 'readme' || 
          type === 'package.json' ||
          type === 'gitignore' ||
          type === 'dockerfile' ||
          type === 'docker-compose'
        );
      default:
        // Show all files for HTML/CSS/JS
        return allFileTypes;
    }
  };

  const filteredFileTypes = getFilteredFileTypes();
  console.log('🔍 [FILTERED FILES] Framework:', options.framework);
  console.log('🔍 [FILTERED FILES] Available file types:', filteredFileTypes.map(([type]) => type));
  
  const groupedFileTypes = filteredFileTypes.reduce((acc, [type, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ type: type as CodeFileType, ...config });
    return acc;
  }, {} as Record<string, Array<{ type: CodeFileType; label: string; description: string; icon: React.ReactNode; category: string; dependencies?: CodeFileType[] }>>);

  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Framework
        </label>
        <select
          value={options.framework}
          onChange={(e) => handleFrameworkChange(e.target.value as CodeGenerationOptions['framework'])}
          disabled={disabled}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
        >
          <option value="html">HTML/CSS/JS</option>
          <option value="react">React</option>
          <option value="vue">Vue.js</option>
          <option value="svelte">Svelte</option>
          <option value="nextjs">Next.js</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Files to Generate ({getSelectedCount()})
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full px-4 py-3 text-left border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
          >
            <span className="text-gray-700 dark:text-gray-300">{getSelectedPreview()}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
              {Object.entries(groupedFileTypes).map(([category, fileTypes]) => (
                <div key={category} className="p-3">
                  <div className="px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-50 dark:bg-blue-900/20 rounded-md mb-2">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>
                  {fileTypes.map(({ type, label, description, icon }) => {
                    const isSelected = options.selectedFileTypes.includes(type);
                    const config = fileTypeConfig[type];
                    const hasDependencies = config.dependencies && config.dependencies.length > 0;
                    
                    return (
                      <label
                        key={type}
                        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                          disabled ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFileTypeToggle(type)}
                          disabled={disabled}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center flex-1">
                          <div className="text-gray-600 mr-3">
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {label}
                              {hasDependencies && (
                                <span className="ml-1 text-xs text-blue-600">
                                  (auto-includes dependencies)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{description}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeDependencies}
            onChange={(e) => onOptionsChange({
              ...options,
              includeDependencies: e.target.checked
            })}
            disabled={disabled}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-700">Include Dependencies</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeDocumentation}
            onChange={(e) => onOptionsChange({
              ...options,
              includeDocumentation: e.target.checked
            })}
            disabled={disabled}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-700">Include Documentation</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeDocker}
            onChange={(e) => onOptionsChange({
              ...options,
              includeDocker: e.target.checked
            })}
            disabled={disabled}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-700">Include Docker</span>
        </label>
      </div>

      {options.selectedFileTypes.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Selected files:</strong> {options.selectedFileTypes.map(type => fileTypeConfig[type].label).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
