import axios from "axios";

import { LayoutData, AIProcessingResult, UploadedDocument } from "@/types";

export class PerplexityAIService {
  private apiKey: string;

  private baseURL = "https://api.perplexity.ai/chat/completions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    console.log("🔑 [PERPLEXITY] API Key configured:", apiKey ? "Yes" : "No");

    console.log("🔑 [PERPLEXITY] API Key length:", apiKey ? apiKey.length : 0);

    console.log("🔑 [PERPLEXITY] API Key format check:", {
      startsWithPpl: apiKey?.startsWith("pplx-"),

      startsWithBearer: apiKey?.startsWith("Bearer "),

      first10Chars: apiKey?.substring(0, 10),
    });
  }

  // Helper method to get properly formatted Authorization header
  private getAuthHeader(): string {
    if (!this.apiKey) {
      console.error("❌ [PERPLEXITY] API key is not configured");
      throw new Error("API key is not configured");
    }

    console.log("🔑 [PERPLEXITY] Formatting Authorization header:", {
      apiKeyLength: this.apiKey.length,
      startsWithBearer: this.apiKey.startsWith("Bearer "),
      startsWithPplx: this.apiKey.startsWith("pplx-"),
      first10Chars: this.apiKey.substring(0, 10),
    });

    // Check if the API key already includes "Bearer " prefix
    if (this.apiKey.startsWith("Bearer ")) {
      console.log("✅ [PERPLEXITY] Using API key with existing Bearer prefix");
      return this.apiKey;
    }

    // Check if it's a Perplexity API key (starts with pplx-)
    if (this.apiKey.startsWith("pplx-")) {
      const formattedKey = `Bearer ${this.apiKey}`;
      console.log(
        "✅ [PERPLEXITY] Using Perplexity API key with Bearer prefix"
      );
      return formattedKey;
    }

    // For other formats, add Bearer prefix
    const formattedKey = `Bearer ${this.apiKey}`;
    console.log("✅ [PERPLEXITY] Using API key with added Bearer prefix");
    return formattedKey;
  }

  async parseDocument(document: UploadedDocument): Promise<AIProcessingResult> {
    try {
      console.log("🔍 [PERPLEXITY] Parsing document...");

      // Check if this is Excel data

      let isExcelData = false;

      let fileInfo = null;

      try {
        const parsedContent = JSON.parse(document.content);

        isExcelData = parsedContent.type === "excel_data";

        fileInfo = parsedContent;
      } catch {
        // Not JSON, continue with normal parsing
      }

      let prompt: string;

      if (isExcelData) {
        // Parse Excel data description to extract structured information

        const description =
          fileInfo.description ||
          fileInfo.projectName ||
          "Modern web application";

        // Parse the description to extract title, description, type, priority, status

        const parseDescription = (desc: string) => {
          const parts = desc.split(",").map((p) => p.trim());

          const result = {
            title: "",

            description: "",

            type: "",

            priority: "",

            status: "",
          };

          if (parts.length >= 5) {
            result.title = parts[0] || "";

            result.description = parts[1] || "";

            result.type = parts[2] || "";

            result.priority = parts[3] || "";

            result.status = parts[4] || "";
          } else {
            // Fallback if not in expected format

            result.description = desc;

            result.title = fileInfo.projectName || "Web Application";

            result.type = "web";

            result.priority = "medium";

            result.status = "in-progress";
          }

          return result;
        };

        const parsedData = parseDescription(description);

        console.log("📊 [PERPLEXITY] Parsed structured data:", {
          title: parsedData.title,

          description: parsedData.description,

          type: parsedData.type,

          priority: parsedData.priority,

          status: parsedData.status,
        });

        prompt = `Create a web application design based on this structured project data:



Project Details:

- Title: ${parsedData.title}

- Description: ${parsedData.description}

- Type: ${parsedData.type}

- Priority: ${parsedData.priority}

- Status: ${parsedData.status}



File Information:

- File Name: ${fileInfo.fileName}

- File Size: ${fileInfo.fileSize} bytes

- File Type: ${fileInfo.fileType}



Generate a complete application design with the following structure:

{

  "dataAnalysis": {

    "dataType": "${parsedData.type} Application",

    "columns": ["Title", "Description", "Type", "Priority", "Status"],

    "recordCount": "Multiple records",

    "dataPatterns": "Structured data with title, description, type, priority, and status fields",

    "suggestedAppType": "${parsedData.type} ${parsedData.title} Application",

    "description": "${parsedData.description}",

    "projectName": "${parsedData.title}",

    "titleColumn": "Title",

    "priority": "${parsedData.priority}",

    "status": "${parsedData.status}"

  },

  "designOptions": [

    {

      "id": "${parsedData.type}_1",

      "name": "${parsedData.title} ${parsedData.type} App",

      "description": "${parsedData.description} - ${
          parsedData.type
        } application",

      "preview": "Modern ${
        parsedData.type
      } application with ${parsedData.description.toLowerCase()}",

      "components": [

        {

          "name": "Header",

          "type": "header",

          "description": "Application header with title and search",

          "properties": {

            "title": "${parsedData.title}",

            "showSearch": true

          },

          "layout": {

            "x": 0,

            "y": 0,

            "width": 1200,

            "height": 80

          }

        },

        {

          "name": "FilterBar",

          "type": "filter",

          "description": "Filter controls for type and priority",

          "properties": {

            "filters": ["Type", "Priority", "Status"]

          },

          "layout": {

            "x": 0,

            "y": 80,

            "width": 1200,

            "height": 60

          }

        },

        {

          "name": "DataGrid",

          "type": "table",

          "description": "Main data display table",

          "properties": {

            "columns": ["Title", "Description", "Type", "Priority", "Status", "Actions"],

            "sortable": true,

            "editable": true

          },

          "layout": {

            "x": 0,

            "y": 140,

            "width": 1200,

            "height": 400

          }

        }

      ],

      "layout": {

        "type": "dashboard",

        "theme": "light",

        "colors": {

          "primary": "#3B82F6",

          "secondary": "#6B7280",

          "background": "#FFFFFF",

          "text": "#111827"

        }

      }

    }

  ],

  "colorCombinations": [

    {

      "id": "blue_modern",

      "name": "Blue Modern",

      "colors": {

        "primary": "#3B82F6",

        "secondary": "#6B7280",

        "accent": "#10B981",

        "background": "#FFFFFF",

        "text": "#111827"

      }

    },

    {

      "id": "green_nature",

      "name": "Green Nature",

      "colors": {

        "primary": "#10B981",

        "secondary": "#6B7280",

        "accent": "#F59E0B",

        "background": "#FFFFFF",

        "text": "#111827"

      }

    }

  ]

}



IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or additional text. The response must be parseable JSON.`;
      } else {
        // Regular document analysis

        prompt = `Analyze this document and extract key information for web application design:



Document Type: ${document.type}

Document Name: ${document.name}

Document Content: ${document.content}



Please provide a structured analysis including:

1. Document type and purpose

2. Key data points and information

3. Suggested application type (dashboard, e-commerce, portfolio, etc.)

4. Recommended features and functionality

5. Target audience

6. Design suggestions



Return the analysis in JSON format with these fields:

{

  "documentType": "string",

  "purpose": "string", 

  "keyDataPoints": ["array of strings"],

  "suggestedAppType": "string",

  "recommendedFeatures": ["array of strings"],

  "targetAudience": "string",

  "designSuggestions": "string",

  "description": "string"

}



IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or additional text. The response must be parseable JSON.`;
      }

      console.log("🚀 [PERPLEXITY] Sending request to Perplexity AI...");
      console.log(
        "🔑 [PERPLEXITY] Using Authorization header:",
        this.getAuthHeader().substring(0, 20) + "..."
      );

      const response = await axios.post(
        this.baseURL,
        {
          model: "sonar-pro",

          messages: [
            {
              role: "system",

              content:
                "You are an expert web application analyst. Analyze documents and provide structured insights for creating web applications. Always return valid JSON.",
            },

            {
              role: "user",

              content: prompt,
            },
          ],

          max_tokens: 2000,

          temperature: 0.3,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",

            "User-Agent": "Laygen-App/1.0",
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from Perplexity AI");
      }

      // Try to extract JSON from the response

      let analysis;

      try {
        analysis = JSON.parse(content);

        console.log("✅ [PERPLEXITY] Direct JSON parse successful");
      } catch (parseError) {
        console.log(
          "⚠️ [PERPLEXITY] Direct JSON parse failed, attempting to extract JSON..."
        );

        console.log(
          "⚠️ [PERPLEXITY] Parse error:",
          parseError instanceof Error ? parseError.message : String(parseError)
        );

        // Try to extract JSON from markdown code blocks

        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);

        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[1]);

            console.log(
              "✅ [PERPLEXITY] Successfully extracted JSON from code block"
            );
          } catch (extractError) {
            console.log(
              "❌ [PERPLEXITY] JSON extraction from code block failed:",
              extractError instanceof Error
                ? extractError.message
                : String(extractError)
            );
          }
        }

        // If still no success, try to find JSON object boundaries

        if (!analysis) {
          const jsonStart = content.indexOf("{");

          const jsonEnd = content.lastIndexOf("}");

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            try {
              const jsonString = content.substring(jsonStart, jsonEnd + 1);

              analysis = JSON.parse(jsonString);

              console.log(
                "✅ [PERPLEXITY] Successfully extracted JSON from boundaries"
              );
            } catch (boundaryError) {
              console.log(
                "❌ [PERPLEXITY] JSON extraction from boundaries failed:",
                boundaryError instanceof Error
                  ? boundaryError.message
                  : String(boundaryError)
              );

              // Try to fix common JSON issues

              try {
                console.log("🔧 [PERPLEXITY] Attempting to fix JSON issues...");

                const fixedJson = content
                  .replace(/\\"/g, '"') // Fix escaped quotes

                  .replace(/"\s*:\s*"/g, '": "') // Fix spacing around colons

                  .replace(/,\s*}/g, "}") // Remove trailing commas

                  .replace(/,\s*]/g, "]") // Remove trailing commas in arrays

                  .replace(/\n/g, " ") // Replace newlines with spaces

                  .replace(/\s+/g, " ") // Normalize whitespace

                  .trim();

                analysis = JSON.parse(fixedJson);

                console.log("✅ [PERPLEXITY] JSON fixing successful");
              } catch (fixError) {
                console.log(
                  "❌ [PERPLEXITY] JSON fixing failed:",
                  fixError instanceof Error
                    ? fixError.message
                    : String(fixError)
                );
              }
            }
          }
        }

        // If all else fails, create a fallback response

        if (!analysis) {
          console.log(
            "🆘 [PERPLEXITY] ==========================================="
          );

          console.log("🆘 [PERPLEXITY] All JSON parsing attempts failed!");

          console.log("🆘 [PERPLEXITY] Creating fallback response...");

          console.log(
            "🆘 [PERPLEXITY] ==========================================="
          );

          analysis = {
            documentType: "Unknown",

            purpose: "General purpose",

            keyDataPoints: ["Document analysis failed"],

            suggestedAppType: "Web Application",

            recommendedFeatures: ["Basic functionality"],

            targetAudience: "General users",

            designSuggestions: "Modern, clean design",

            description: "A web application based on the provided document",
          };

          console.log("✅ [PERPLEXITY] Fallback response created successfully");
        }
      }

      // Return different structure based on document type

      if (isExcelData) {
        return {
          success: true,

          layoutData: analysis, // Return the full analysis with designOptions and colorCombinations

          confidence: 0.9,

          suggestions: [
            "Consider responsive design for mobile devices",

            "Implement proper error handling",

            "Add loading states for better UX",

            "Consider accessibility features",
          ],
        };
      } else {
        return {
          success: true,

          layoutData: {
            documentType: analysis.documentType || "Unknown",

            purpose: analysis.purpose || "General purpose",

            keyDataPoints: analysis.keyDataPoints || [],

            suggestedAppType: analysis.suggestedAppType || "Web Application",

            recommendedFeatures: analysis.recommendedFeatures || [],

            targetAudience: analysis.targetAudience || "General users",

            designSuggestions:
              analysis.designSuggestions || "Modern, clean design",

            description:
              analysis.description ||
              "A web application based on the provided document",
          } as unknown as LayoutData,
          confidence: 0.9,

          suggestions: [
            "Consider responsive design for mobile devices",

            "Implement proper error handling",

            "Add loading states for better UX",

            "Consider accessibility features",
          ],
        };
      }
    } catch (error) {
      console.error("❌ [PERPLEXITY] Document parsing error:", error);

      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to parse document",

        confidence: 0,
      };
    }
  }

  async generateLayoutVariations(
    layoutData: LayoutData
  ): Promise<AIProcessingResult> {
    try {
      console.log("🎨 [PERPLEXITY] Generating layout variations...");

      const prompt = `Generate layout variations for a web application based on this data:



Application Type: ${
        (layoutData as { suggestedAppType?: string }).suggestedAppType ||
        "Web Application"
      }
Description: ${
        (layoutData as { description?: string }).description ||
        "A modern web application"
      }
Features: ${JSON.stringify(
        (layoutData as { recommendedFeatures?: unknown[] })
          .recommendedFeatures || []
      )}
Target Audience: ${
        (layoutData as { targetAudience?: string }).targetAudience ||
        "General users"
      }


Create 3 different layout variations with:

1. Different component arrangements

2. Various color schemes

3. Different navigation patterns

4. Responsive design considerations



Return JSON with this structure:

{

  "variations": [

    {

      "name": "Layout Name",

      "description": "Layout description",

      "components": ["array of component names"],

      "colorScheme": {

        "primary": "color",

        "secondary": "color", 

        "accent": "color",

        "background": "color",

        "text": "color"

      },

      "layout": {

        "type": "grid|flexbox|css-grid",

        "columns": number,

        "spacing": "tight|normal|loose"

      }

    }

  ]

}`;

      const response = await axios.post(
        this.baseURL,
        {
          model: "sonar-pro",

          messages: [
            {
              role: "system",

              content:
                "You are an expert UI/UX designer. Create modern, responsive layout variations for web applications. Always return valid JSON.",
            },

            {
              role: "user",

              content: prompt,
            },
          ],

          max_tokens: 3000,

          temperature: 0.7,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",

            "User-Agent": "Laygen-App/1.0",
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from Perplexity AI");
      }

      // Try to extract JSON from the response

      let variations;

      try {
        variations = JSON.parse(content);

        console.log("✅ [PERPLEXITY] Direct JSON parse successful");
      } catch (parseError) {
        console.log(
          "⚠️ [PERPLEXITY] Direct JSON parse failed, attempting to extract JSON..."
        );

        console.log(
          "⚠️ [PERPLEXITY] Parse error:",
          parseError instanceof Error ? parseError.message : String(parseError)
        );

        // Try to extract JSON from markdown code blocks

        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);

        if (jsonMatch) {
          try {
            variations = JSON.parse(jsonMatch[1]);

            console.log(
              "✅ [PERPLEXITY] Successfully extracted JSON from code block"
            );
          } catch (extractError) {
            console.log(
              "❌ [PERPLEXITY] JSON extraction from code block failed:",
              extractError instanceof Error
                ? extractError.message
                : String(extractError)
            );
          }
        }

        // If still no success, try to find JSON object boundaries

        if (!variations) {
          const jsonStart = content.indexOf("{");

          const jsonEnd = content.lastIndexOf("}");

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            try {
              const jsonString = content.substring(jsonStart, jsonEnd + 1);

              variations = JSON.parse(jsonString);

              console.log(
                "✅ [PERPLEXITY] Successfully extracted JSON from boundaries"
              );
            } catch (boundaryError) {
              console.log(
                "❌ [PERPLEXITY] JSON extraction from boundaries failed:",
                boundaryError instanceof Error
                  ? boundaryError.message
                  : String(boundaryError)
              );
            }
          }
        }

        // If all else fails, create a fallback response

        if (!variations) {
          console.log(
            "🆘 [PERPLEXITY] All JSON parsing attempts failed, creating fallback variations..."
          );

          variations = {
            variations: [
              {
                name: "Modern Layout",

                description: "A clean, modern layout with responsive design",

                components: [
                  "Header",
                  "Navigation",
                  "Main Content",
                  "Sidebar",
                  "Footer",
                ],

                colorScheme: {
                  primary: "#3B82F6",

                  secondary: "#10B981",

                  accent: "#F59E0B",

                  background: "#FFFFFF",

                  text: "#1F2937",
                },

                layout: {
                  type: "grid",

                  columns: 3,

                  spacing: "normal",
                },
              },
            ],
          };

          console.log(
            "✅ [PERPLEXITY] Fallback variations created successfully"
          );
        }
      }

      return {
        success: true,

        layoutData: variations as unknown as LayoutData,
        confidence: 0.9,

        suggestions: [
          "Consider user flow optimization",

          "Ensure mobile responsiveness",

          "Add accessibility features",

          "Test with real users",
        ],
      };
    } catch (error) {
      console.error("❌ [PERPLEXITY] Layout generation error:", error);

      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to generate layouts",

        confidence: 0,
      };
    }
  }

  // Helper method to extract fields from content when JSON parsing fails
  private extractFieldsFromContent(content: string): Record<string, string> {
    const fields: Record<string, string> = {};

    // More robust field extraction that handles malformed JSON
    const fieldNames = [
      "html",
      "css",
      "javascript",
      "react",
      "react-components",
      "react-setup",
      "vue",
      "svelte",
      "typescript",
      "readme",
      "package.json",
      "gitignore",
      "dockerfile",
      "docker-compose",
    ];

    for (const fieldName of fieldNames) {
      // Try multiple extraction strategies for each field
      const strategies = [
        // Strategy 1: Look for field name followed by colon and quoted content
        () => {
          const pattern = new RegExp(
            `"${fieldName.replace(
              ".",
              "\\."
            )}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"(?=\\s*[,}])`,
            "s"
          );
          const match = content.match(pattern);
          return match ? match[1] : null;
        },
        // Strategy 2: More permissive - look for field name and extract until next field or end
        () => {
          const pattern = new RegExp(
            `"${fieldName.replace(
              ".",
              "\\."
            )}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*[,}]|"\\s*$|$)`,
            "s"
          );
          const match = content.match(pattern);
          return match ? match[1] : null;
        },
        // Strategy 3: Even more permissive - extract content between quotes
        () => {
          const pattern = new RegExp(
            `"${fieldName.replace(
              ".",
              "\\."
            )}"\\s*:\\s*"([\\s\\S]*?)(?="\\s*[,}]|"\\s*$|$)`,
            "s"
          );
          const match = content.match(pattern);
          return match ? match[1] : null;
        },
        // Strategy 4: Look for field name and extract everything until next field
        () => {
          const fieldIndex = content.indexOf(`"${fieldName}"`);
          if (fieldIndex === -1) return null;

          const colonIndex = content.indexOf(":", fieldIndex);
          if (colonIndex === -1) return null;

          const quoteStart = content.indexOf('"', colonIndex);
          if (quoteStart === -1) return null;

          // Find the end of the string (look for closing quote followed by comma or brace)
          let quoteEnd = -1;
          let i = quoteStart + 1;
          let inEscape = false;

          while (i < content.length) {
            if (inEscape) {
              inEscape = false;
            } else if (content[i] === "\\") {
              inEscape = true;
            } else if (content[i] === '"') {
              // Check if this is followed by comma, brace, or end of content
              const nextChar = content[i + 1];
              if (
                nextChar === "," ||
                nextChar === "}" ||
                nextChar === undefined ||
                /\s/.test(nextChar)
              ) {
                quoteEnd = i;
                break;
              }
            }
            i++;
          }

          if (quoteEnd > quoteStart) {
            return content.substring(quoteStart + 1, quoteEnd);
          }
          return null;
        },
      ];

      for (const strategy of strategies) {
        try {
          const extracted = strategy();
          if (extracted && extracted.trim().length > 10) {
            // Clean up the extracted string
            const cleaned = extracted
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\r/g, "\r")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\")
              .replace(/\\\//g, "/")
              .trim();

            // Basic validation
            if (
              cleaned.length > 10 &&
              !cleaned.includes("undefined") &&
              !cleaned.includes("null")
            ) {
              fields[fieldName] = cleaned;
              console.log(
                `✅ [PERPLEXITY] Extracted ${fieldName} field (${cleaned.length} chars)`
              );
              break; // Found this field, move to next
            }
          }
        } catch {
          // Continue to next strategy
          continue;
        }
      }
    }

    console.log(
      `📊 [PERPLEXITY] Field extraction result: ${
        Object.keys(fields).length
      } fields extracted`
    );
    return fields;
  }

  async generateCode(
    layoutData: LayoutData,
    framework: "html" | "react" | "vue" | "svelte" = "html"
  ): Promise<AIProcessingResult> {
    try {
      console.log(
        "💻 [PERPLEXITY] ==========================================="
      );

      console.log("💻 [PERPLEXITY] Starting Perplexity AI Code Generation");

      console.log(
        "💻 [PERPLEXITY] ==========================================="
      );

      const selectedColors =
        (layoutData as { selectedColors?: Record<string, string> })
          .selectedColors || {};
      const description =
        (layoutData as { dataAnalysis?: { description?: string } }).dataAnalysis
          ?.description || "A modern web application";

      console.log("📋 [PERPLEXITY] Project Details:");

      console.log("   - Description:", description);

      console.log("   - Framework:", framework);

      console.log("   - Colors:", selectedColors);

      console.log(
        "   - App Type:",
        (layoutData as { dataAnalysis?: { suggestedAppType?: string } })
          .dataAnalysis?.suggestedAppType || "Web Application"
      );

      // Get the selected file types from the layout data
      const selectedFileTypes =
        (
          layoutData as {
            codeGenerationOptions?: { selectedFileTypes?: string[] };
          }
        ).codeGenerationOptions?.selectedFileTypes ||
        (framework === "react"
          ? ["react-components", "react-setup"]
          : ["html", "css", "javascript", "readme"]);

      console.log(
        "📋 [PERPLEXITY] Selected file types for generation:",
        selectedFileTypes
      );
      console.log(
        "📋 [PERPLEXITY] Layout data codeGenerationOptions:",
        (
          layoutData as {
            codeGenerationOptions?: { selectedFileTypes?: string[] };
          }
        ).codeGenerationOptions
      );

      // Dynamic file type configurations
      const fileTypeConfigs = {
        html: {
          name: "HTML FILE (index.html)",
          description: `- MUST start with <!DOCTYPE html>
   - Complete HTML5 structure with <html lang="en">

   - Proper <head> section with meta tags, title, and viewport

   - Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Include Bootstrap CSS CDN: <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   - Link to styles.css: <link rel="stylesheet" href="styles.css">

   - Semantic HTML elements (header, main, section, article, etc.)

   - Use Tailwind utility classes for styling (bg-blue-500, text-white, etc.)
   - Proper accessibility attributes (alt, aria-label, etc.)

   - Complete content based on the description

   - Link to script.js: <script src="script.js"></script> before </body>`,
          critical:
            "The HTML must be a complete, valid HTML5 document that can be opened directly in a browser.",
        },
        css: {
          name: "CSS FILE (styles.css)",
          description: `- Complete CSS3 styles with modern features
   - CSS reset/normalize at the top

   - CSS custom properties (variables) for colors

   - Responsive design (mobile-first approach)

   - Use the provided colors throughout the design

   - CSS Grid and Flexbox for layouts

   - Hover effects, transitions, and animations

   - Custom CSS to complement Tailwind CSS and Bootstrap
   - Use Bootstrap classes where appropriate (container, row, col, etc.)
   - Clean, organized CSS with comments`,
          critical: null,
        },
        javascript: {
          name: "JAVASCRIPT FILE (script.js)",
          description: `- Complete JavaScript functionality
   - Modern ES6+ features

   - Event handling and DOM manipulation

   - Interactive features based on the description

   - Error handling and validation

   - Clean, commented code`,
          critical: null,
        },
        react: {
          name: "REACT MAIN COMPONENT (App.jsx)",
          description: `- Modern React functional component with hooks
   - Complete JSX structure with proper React patterns
   - State management using useState and useEffect
   - Event handling and interactive features
   - Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
   - Use Bootstrap classes where appropriate (container, row, col, etc.)
   - Responsive design with mobile-first approach
   - Use the provided colors throughout the component
   - Clean, commented code with proper React best practices
   - Import and use other components as needed`,
          critical:
            "The React component must be a complete, functional component that can be used in a React application.",
        },
        "react-components": {
          name: "REACT COMPONENTS (specific files based on description)",
          description: `- Analyze the description and create SPECIFIC component files needed
   - For games: create game logic files (logicalHandler.ts, gameUtils.ts, etc.)
   - For apps: create feature-specific components (Header.tsx, Main.tsx, Footer.tsx, etc.)
   - For dashboards: create chart components, data components, etc.
   - Each file should have a specific purpose and clear naming
   - Use proper React patterns and hooks
   - Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
   - Use Bootstrap classes where appropriate (container, row, col, etc.)
   - Export components properly for import in other files
   - Include TypeScript types and interfaces where needed
   - Responsive design with mobile-first approach
   - Example: For tic-tac-toe game, create GameBoard.tsx, GameLogic.ts, ScoreBoard.tsx, etc.`,
          critical:
            "Create specific, purpose-driven React components based on the exact description provided.",
        },
        "react-setup": {
          name: "REACT SETUP GUIDE (SETUP.md)",
          description: `- SMART setup instructions that check existing installations
   - Step 1: Check if Node.js is installed (node --version) - if yes, skip installation
   - Step 2: Check if npm is installed (npm --version) - if yes, skip installation
   - Step 3: Create React app with specific project name based on description
   - Step 4: Install Tailwind CSS and Bootstrap CSS
   - Step 5: Explain the generated file structure and what each file does
   - Step 6: Development server startup (npm start)
   - Step 7: Build and deployment instructions
   - Include conditional steps (if Node.js exists, skip to step X)
   - All commands should be copy-paste ready
   - Include troubleshooting section for common issues
   - Explain the purpose of each generated component file`,
          critical:
            "Provide smart, conditional setup instructions that adapt to existing installations.",
        },
        vue: {
          name: "VUE COMPONENT (App.vue)",
          description: `- Modern Vue 3 Composition API component
   - Complete template with proper Vue directives
   - Reactive data and computed properties
   - Event handling and interactive features
   - Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
   - Use Bootstrap classes where appropriate (container, row, col, etc.)
   - Responsive design with mobile-first approach
   - Use the provided colors throughout the component
   - Clean, commented code with proper Vue best practices`,
          critical:
            "The Vue component must be a complete, functional component that can be used in a Vue application.",
        },
        svelte: {
          name: "SVELTE COMPONENT (App.svelte)",
          description: `- Modern Svelte component with reactive statements
   - Complete markup with proper Svelte syntax
   - Reactive variables and event handling
   - Interactive features and animations
   - Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
   - Use Bootstrap classes where appropriate (container, row, col, etc.)
   - Responsive design with mobile-first approach
   - Use the provided colors throughout the component
   - Clean, commented code with proper Svelte best practices`,
          critical:
            "The Svelte component must be a complete, functional component that can be used in a Svelte application.",
        },
        typescript: {
          name: "TYPESCRIPT FILE (script.ts)",
          description: `- Complete TypeScript functionality with proper types
   - Modern ES6+ features with type safety
   - Event handling and DOM manipulation with types
   - Interactive features based on the description
   - Error handling and validation with proper typing
   - Clean, commented code with type annotations`,
          critical: null,
        },
        "package.json": {
          name: "PACKAGE.JSON FILE",
          description: `- Complete package.json with appropriate dependencies
   - Include framework-specific dependencies (${
     framework === "react"
       ? "react, react-dom"
       : framework === "vue"
       ? "vue"
       : framework === "svelte"
       ? "svelte"
       : "vanilla"
   })
   - Include Tailwind CSS and Bootstrap CSS dependencies
   - Include Tailwind CSS plugins and configuration
   - Proper scripts for development and build
   - Project metadata and description
   - Version management and dependency resolution`,
          critical: null,
        },
        readme: {
          name: "README FILE (README.md)",
          description: `- Project description and purpose
   - Setup and installation instructions

   - Usage instructions

   - Features list

   - Technical details and framework information`,
          critical: null,
        },
        gitignore: {
          name: ".GITIGNORE FILE",
          description: `- Complete .gitignore for the selected framework
   - Node modules and build artifacts
   - IDE and OS specific files
   - Environment variables and secrets
   - Framework-specific ignore patterns`,
          critical: null,
        },
        dockerfile: {
          name: "DOCKERFILE",
          description: `- Complete Dockerfile for containerization
   - Multi-stage build for optimization
   - Proper base image for the framework
   - Environment setup and dependencies
   - Production-ready configuration`,
          critical: null,
        },
        "docker-compose": {
          name: "DOCKER-COMPOSE.YML",
          description: `- Complete docker-compose configuration
   - Service definitions and networking
   - Volume mounts and environment variables
   - Development and production configurations
   - Health checks and restart policies`,
          critical: null,
        },
      };

      // Build dynamic prompt based on selected file types
      const frameworkName =
        framework.charAt(0).toUpperCase() + framework.slice(1);

      let prompt = `Create a complete ${frameworkName} application based on this description: "${description}"

Use these colors: ${JSON.stringify(selectedColors)}

${
  framework === "react"
    ? `Generate a FULLY FUNCTIONAL React application with COMPONENT-BASED ARCHITECTURE:

IMPORTANT FOR REACT:
- Create multiple React components (Header, Main, Footer, and feature-specific components)
- Each component should be in its own file with proper exports
- Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
- Use Bootstrap classes where appropriate (container, row, col, etc.)
- Include a comprehensive setup guide with Node.js installation and create-react-app commands
- Include Tailwind CSS and Bootstrap CSS installation instructions
- Generate proper folder structure explanation
- All content should be AI-generated based on the description - NO HARDCODED CONTENT
- Create a complete React project that can be immediately used

`
    : `Generate a FULLY FUNCTIONAL ${frameworkName} application with:

IMPORTANT FOR ALL FRAMEWORKS:
- Use Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
- Use Bootstrap classes where appropriate (container, row, col, etc.)
- Include Tailwind CSS and Bootstrap CSS CDN links in HTML
- Responsive design with mobile-first approach
- All content should be AI-generated based on the description - NO HARDCODED CONTENT

`
}`;

      // Add file descriptions dynamically
      selectedFileTypes.forEach((fileType, index) => {
        const config =
          fileTypeConfigs[fileType as keyof typeof fileTypeConfigs];
        if (config) {
          prompt += `${index + 1}. ${config.name}:\n${config.description}\n\n`;
        }
      });

      // Add critical requirements
      const criticalRequirements = selectedFileTypes
        .map(
          (fileType) =>
            fileTypeConfigs[fileType as keyof typeof fileTypeConfigs]?.critical
        )
        .filter(Boolean);

      if (criticalRequirements.length > 0) {
        prompt += `CRITICAL: ${criticalRequirements.join(" ")}\n\n`;
      }

      prompt += `IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or additional text. The response must be parseable JSON.


Return ONLY valid JSON with this EXACT structure:

`;

      // Build dynamic JSON structure
      const jsonStructure: Record<string, string> = {};
      console.log(
        "🔧 [PERPLEXITY] Building JSON structure for file types:",
        selectedFileTypes
      );
      selectedFileTypes.forEach((fileType) => {
        const config =
          fileTypeConfigs[fileType as keyof typeof fileTypeConfigs];
        console.log(
          `🔧 [PERPLEXITY] Processing file type: ${fileType}, config exists: ${!!config}`
        );
        if (config) {
          if (fileType === "html") {
            jsonStructure.html = "complete HTML content for index.html";
          } else if (fileType === "css") {
            jsonStructure.css = "complete CSS content for styles.css";
          } else if (fileType === "javascript") {
            jsonStructure.javascript =
              "complete JavaScript content for script.js";
          } else if (fileType === "react") {
            jsonStructure.react =
              "complete React main component code for App.jsx";
          } else if (fileType === "react-components") {
            jsonStructure["react-components"] =
              "complete React components code (multiple components in separate files)";
          } else if (fileType === "react-setup") {
            jsonStructure["react-setup"] =
              "complete React setup guide with installation instructions";
          } else if (fileType === "vue") {
            jsonStructure.vue = "complete Vue component code for App.vue";
          } else if (fileType === "svelte") {
            jsonStructure.svelte =
              "complete Svelte component code for App.svelte";
          } else if (fileType === "typescript") {
            jsonStructure.typescript =
              "complete TypeScript content for script.ts";
          } else if (fileType === "package.json") {
            jsonStructure["package.json"] =
              "complete package.json content with dependencies";
          } else if (fileType === "readme") {
            jsonStructure.readme =
              "complete README content explaining the application";
          } else if (fileType === "gitignore") {
            jsonStructure.gitignore = "complete .gitignore content";
          } else if (fileType === "dockerfile") {
            jsonStructure.dockerfile = "complete Dockerfile content";
          } else if (fileType === "docker-compose") {
            jsonStructure["docker-compose"] =
              "complete docker-compose.yml content";
          }
        }
      });

      console.log("🔧 [PERPLEXITY] Final JSON structure:", jsonStructure);
      console.log(
        "🔧 [PERPLEXITY] JSON structure keys:",
        Object.keys(jsonStructure)
      );

      const jsonStructureString = JSON.stringify(jsonStructure, null, 2);
      const fullPrompt = `${prompt}${jsonStructureString}`;

      console.log("🚀 [PERPLEXITY] Sending request to Perplexity AI...");

      console.log("   - Model: sonar-pro");

      console.log("   - Max Tokens: 4000");

      console.log("   - Temperature: 0.2");

      console.log("   - Prompt Length:", fullPrompt.length);

      const response = await axios.post(
        this.baseURL,
        {
          model: "sonar-pro",

          messages: [
            {
              role: "system",

              content: `You are an expert full-stack developer specializing in ${frameworkName} applications. Create COMPLETE, PRODUCTION-READY ${frameworkName} applications. Generate clean, modern code with proper structure, responsive design, and interactive functionality. Always return valid JSON.`,
            },

            {
              role: "user",

              content: fullPrompt,
            },
          ],

          max_tokens: 4000,

          temperature: 0.2,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",

            "User-Agent": "Laygen-App/1.0",
          },
        }
      );

      console.log("✅ [PERPLEXITY] Received response from Perplexity AI");

      console.log("   - Status:", response.status);

      console.log(
        "   - Response Time:",
        response.headers["x-response-time"] || "Unknown"
      );

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from Perplexity AI");
      }

      console.log("📝 [PERPLEXITY] Processing AI response...");

      console.log("   - Response Length:", content.length);

      console.log("   - Response Preview:", content.substring(0, 200) + "...");

      console.log(
        "   - Response Ends With:",
        content.substring(content.length - 50)
      );

      // Try to extract JSON from the response

      let codeData;

      try {
        console.log("🔍 [PERPLEXITY] Attempting direct JSON parsing...");

        // First, try to parse the content directly

        codeData = JSON.parse(content);

        console.log("✅ [PERPLEXITY] Direct JSON parse successful!");

        console.log("   - HTML Length:", codeData.html?.length || 0);

        console.log("   - CSS Length:", codeData.css?.length || 0);

        console.log("   - JS Length:", codeData.javascript?.length || 0);

        console.log("   - README Length:", codeData.readme?.length || 0);
      } catch (parseError) {
        console.log(
          "⚠️ [PERPLEXITY] Direct JSON parse failed, attempting to extract JSON..."
        );

        console.log(
          "⚠️ [PERPLEXITY] Parse error:",
          parseError instanceof Error ? parseError.message : String(parseError)
        );

        // Try field extraction first as it's often more reliable
        console.log("🔧 [PERPLEXITY] Trying field extraction first...");
        codeData = this.extractFieldsFromContent(content);
        if (codeData && Object.keys(codeData).length > 0) {
          console.log("✅ [PERPLEXITY] Field extraction successful!");
          console.log(
            "📊 [PERPLEXITY] Extracted fields:",
            Object.keys(codeData)
          );
        } else {
          console.log(
            "⚠️ [PERPLEXITY] Field extraction failed, trying other methods..."
          );
        }

        // Try to extract JSON from code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);

        if (jsonMatch) {
          try {
            codeData = JSON.parse(jsonMatch[1]);

            console.log("✅ [PERPLEXITY] JSON extracted from code block!");
          } catch {
            console.log(
              "⚠️ [PERPLEXITY] Code block JSON parse failed, trying manual extraction..."
            );
            // Try to fix common JSON issues
            const fixedJson = jsonMatch[1]
              .replace(/,\s*}/g, "}") // Remove trailing commas
              .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
              .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
              .replace(/:(\s*)([^",{\[\s][^,}]*?)(\s*[,}])/g, ': "$2"$3'); // Quote unquoted string values

            try {
              codeData = JSON.parse(fixedJson);
              console.log("✅ [PERPLEXITY] Fixed JSON parse successful!");
            } catch {
              console.log(
                "❌ [PERPLEXITY] JSON fixing failed, trying field extraction..."
              );
              codeData = this.extractFieldsFromContent(content);
              if (codeData && Object.keys(codeData).length > 0) {
                console.log(
                  "✅ [PERPLEXITY] Field extraction from code block successful!"
                );
                console.log(
                  "📊 [PERPLEXITY] Extracted fields:",
                  Object.keys(codeData)
                );
              } else {
                console.log("❌ [PERPLEXITY] Field extraction failed");
                throw new Error("Unable to parse JSON response");
              }
            }
          }
        } else {
          // Try to find JSON object boundaries
          const startIndex = content.indexOf("{");
          const lastIndex = content.lastIndexOf("}");
          if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
            let jsonString = content.substring(startIndex, lastIndex + 1);
            try {
              codeData = JSON.parse(jsonString);
              console.log("✅ [PERPLEXITY] JSON extracted from boundaries!");
            } catch (boundaryError) {
              console.log(
                "❌ [PERPLEXITY] JSON extraction from boundaries failed, trying to fix..."
              );
              console.log(
                "❌ [PERPLEXITY] Error:",
                boundaryError instanceof Error
                  ? boundaryError.message
                  : String(boundaryError)
              );

              // Try to fix common JSON issues
              try {
                console.log("🔧 [PERPLEXITY] Attempting to fix JSON issues...");

                // Fix unterminated strings and other JSON issues
                jsonString = jsonString

                  .replace(/"([^"]*?)(?=\s*[,}\]])/g, '"$1"') // Fix unterminated strings
                  .replace(/"([^"]*?)(?=\s*[,}\]])/g, '"$1"') // Fix again for nested cases
                  .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
                  .replace(/,\s*}/g, "}") // Remove trailing commas
                  .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
                  .replace(/\n/g, "\\n") // Escape newlines
                  .replace(/\r/g, "\\r") // Escape carriage returns
                  .replace(/\t/g, "\\t") // Escape tabs
                  .replace(/\\"/g, '\\"') // Ensure quotes are properly escaped
                  .replace(/([^\\])\\([^"\\\/bfnrt])/g, "$1\\\\$2"); // Fix unescaped backslashes

                codeData = JSON.parse(jsonString);

                console.log("✅ [PERPLEXITY] Fixed JSON parse successful!");
              } catch (fixError) {
                console.log(
                  "❌ [PERPLEXITY] JSON fixing failed:",
                  fixError instanceof Error
                    ? fixError.message
                    : String(fixError)
                );

                // Try one more approach - extract individual fields
                console.log(
                  "🔧 [PERPLEXITY] Trying field-by-field extraction..."
                );
                codeData = this.extractFieldsFromContent(content);
                if (codeData && Object.keys(codeData).length > 0) {
                  console.log("✅ [PERPLEXITY] Field extraction successful!");
                  console.log(
                    "📊 [PERPLEXITY] Extracted fields:",
                    Object.keys(codeData)
                  );
                  // Field extraction succeeded, continue with normal flow
                } else {
                  console.log(
                    "❌ [PERPLEXITY] Field extraction failed - no fields extracted"
                  );
                  throw new Error("Unable to parse JSON response");
                }
              }
            }
          } else {
            throw new Error("No JSON found in response");
          }
        }

        // If all else fails, create a fallback response

        if (!codeData) {
          console.log(
            "🆘 [PERPLEXITY] ==========================================="
          );

          console.log("🆘 [PERPLEXITY] All JSON parsing attempts failed!");

          console.log("🆘 [PERPLEXITY] Creating fallback response...");

          console.log(
            "🆘 [PERPLEXITY] ==========================================="
          );

          codeData = {
            html: `<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Generated Web Application</title>

    <link rel="stylesheet" href="styles.css">

</head>

<body>

    <header>

        <h1>Generated Web Application</h1>

        <nav>

            <ul>

                <li><a href="#home">Home</a></li>

                <li><a href="#about">About</a></li>

                <li><a href="#contact">Contact</a></li>

            </ul>

        </nav>

    </header>

    <main>

        <section id="home">

            <h2>Welcome to Our Application</h2>

            <p>This is a generated web application based on your requirements.</p>

            <button id="cta-button">Get Started</button>

        </section>

    </main>

    <script src="script.js"></script>

</body>

</html>`,

            css: `/* Generated CSS */

* {

    margin: 0;

    padding: 0;

    box-sizing: border-box;

}



body {

    font-family: 'Arial', sans-serif;

    line-height: 1.6;

    color: #333;

    background-color: #f4f4f4;

}



header {

    background: #2c3e50;

    color: white;

    padding: 1rem 0;

    position: sticky;

    top: 0;

}



nav ul {

    list-style: none;

    display: flex;

    justify-content: center;

    gap: 2rem;

}



nav a {

    color: white;

    text-decoration: none;

    padding: 0.5rem 1rem;

    border-radius: 4px;

    transition: background-color 0.3s;

}



nav a:hover {

    background-color: #34495e;

}



main {

    max-width: 1200px;

    margin: 2rem auto;

    padding: 0 1rem;

}



section {

    background: white;

    padding: 2rem;

    border-radius: 8px;

    box-shadow: 0 2px 10px rgba(0,0,0,0.1);

    margin-bottom: 2rem;

}



h1, h2 {

    margin-bottom: 1rem;

}



button {

    background: #3498db;

    color: white;

    border: none;

    padding: 0.75rem 1.5rem;

    border-radius: 4px;

    cursor: pointer;

    font-size: 1rem;

    transition: background-color 0.3s;

}



button:hover {

    background: #2980b9;

}



@media (max-width: 768px) {

    nav ul {

        flex-direction: column;

        gap: 0.5rem;

    }

    

    main {

        margin: 1rem auto;

        padding: 0 0.5rem;

    }

}`,

            javascript: `// Generated JavaScript

document.addEventListener('DOMContentLoaded', function() {

    console.log('Generated web application loaded successfully!');

    

    // Add click handler for CTA button

    const ctaButton = document.getElementById('cta-button');

    if (ctaButton) {

        ctaButton.addEventListener('click', function() {

            alert('Welcome! This is a generated web application.');

        });

    }

    

    // Add smooth scrolling for navigation links

    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {

        link.addEventListener('click', function(e) {

            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);

            const targetElement = document.getElementById(targetId);

            if (targetElement) {

                targetElement.scrollIntoView({

                    behavior: 'smooth',

                    block: 'start'

                });

            }

        });

    });

    

    // Add some interactive features

    const sections = document.querySelectorAll('section');

    sections.forEach(section => {

        section.addEventListener('mouseenter', function() {

            this.style.transform = 'translateY(-2px)';

            this.style.transition = 'transform 0.3s ease';

        });

        

        section.addEventListener('mouseleave', function() {

            this.style.transform = 'translateY(0)';

        });

    });

});`,

            readme: `# Generated Web Application



This is a web application generated by Laygen based on your requirements.



## Features



- Responsive design that works on all devices

- Modern CSS with hover effects and transitions

- Interactive JavaScript functionality

- Clean, semantic HTML structure

- Accessible navigation



## Files



- \`index.html\` - Main HTML file

- \`styles.css\` - CSS styles

- \`script.js\` - JavaScript functionality



## Usage



1. Open \`index.html\` in your web browser

2. Navigate using the menu

3. Click the "Get Started" button for interaction



## Customization



You can customize this application by:

- Modifying the CSS in \`styles.css\`

- Adding JavaScript functionality in \`script.js\`

- Updating the HTML content in \`index.html\`



## Browser Support



This application works in all modern browsers including:

- Chrome

- Firefox

- Safari

- Edge



## Notes



This is a fallback response generated when the AI response could not be parsed as JSON. The application is fully functional and ready to use.`,
          };

          console.log("✅ [PERPLEXITY] Fallback response created successfully");
        }
      }

      console.log(
        "🎉 [PERPLEXITY] ==========================================="
      );

      console.log("🎉 [PERPLEXITY] Code Generation Complete!");

      console.log(
        "🎉 [PERPLEXITY] ==========================================="
      );

      console.log("📊 [PERPLEXITY] Final Results:");

      console.log("   - HTML Length:", codeData.html?.length || 0);

      console.log("   - CSS Length:", codeData.css?.length || 0);

      console.log("   - JS Length:", codeData.javascript?.length || 0);

      console.log("   - README Length:", codeData.readme?.length || 0);

      console.log(
        "   - Total Code Size:",
        (codeData.html?.length || 0) +
          (codeData.css?.length || 0) +
          (codeData.javascript?.length || 0) +
          (codeData.readme?.length || 0),
        "characters"
      );

      console.log("✅ [PERPLEXITY] Ready for download!");

      return {
        success: true,

        layoutData: codeData as LayoutData,

        confidence: 0.9,

        suggestions: [
          "Add proper error boundaries",

          "Implement loading states",

          "Add unit tests for components",

          "Consider performance optimizations",
        ],
      };
    } catch (error) {
      console.error("❌ [PERPLEXITY] Code generation error:", error);

      // Log more detailed error information

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
          config?: {
            url?: string;
            method?: string;
            headers?: Record<string, string>;
          };
        };
        console.error(
          "❌ [PERPLEXITY] Response status:",
          axiosError.response?.status
        );

        console.error(
          "❌ [PERPLEXITY] Response data:",
          axiosError.response?.data
        );

        console.error("❌ [PERPLEXITY] Request config:", {
          url: axiosError.config?.url,

          method: axiosError.config?.method,

          headers: axiosError.config?.headers,
        });
      }

      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to generate code",

        confidence: 0,
      };
    }
  }

  async generateImage(prompt: string): Promise<AIProcessingResult> {
    try {
      console.log("🎨 [PERPLEXITY] Generating image...");

      // Note: Perplexity doesn't have direct image generation

      // We'll use it to generate a detailed prompt for other image services

      const enhancedPrompt = `Create a detailed image generation prompt for: "${prompt}"



The image should be:

- High quality and professional

- Suitable for web application UI/UX

- Modern and clean design

- Appropriate for the described application



Return only the enhanced prompt, no additional text.`;

      const response = await axios.post(
        this.baseURL,
        {
          model: "sonar-pro",

          messages: [
            {
              role: "system",

              content:
                "You are an expert at creating detailed image generation prompts for web applications. Create clear, specific prompts that will generate high-quality UI/UX images.",
            },

            {
              role: "user",

              content: enhancedPrompt,
            },
          ],

          max_tokens: 500,

          temperature: 0.7,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",

            "User-Agent": "Laygen-App/1.0",
          },
        }
      );

      const enhancedImagePrompt = response.data.choices[0]?.message?.content;

      return {
        success: true,

        layoutData: {
          imagePrompt: enhancedImagePrompt,

          originalPrompt: prompt,
        } as unknown as LayoutData,
        confidence: 0.8,

        suggestions: [
          "Use the enhanced prompt with an image generation service",

          "Consider multiple image variations",

          "Ensure images match the application theme",
        ],
      };
    } catch (error) {
      console.error("❌ [PERPLEXITY] Image prompt generation error:", error);

      // Log more detailed error information

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
          config?: { headers?: Record<string, string> };
        };
        console.error(
          "❌ [PERPLEXITY] Response status:",
          axiosError.response?.status
        );

        console.error(
          "❌ [PERPLEXITY] Response data:",
          axiosError.response?.data
        );

        console.error(
          "❌ [PERPLEXITY] Request headers:",
          axiosError.config?.headers
        );
      }

      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to generate image prompt",

        confidence: 0,
      };
    }
  }
}
