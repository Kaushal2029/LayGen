# Laygen - From Requirements to Ready UI

Laygen is an AI-powered tool that transforms design requirements into production-ready UI code. Upload your design documents, let AI generate design images and layouts, and export complete web applications instantly.

## Features

- 🤖 **AI-Powered Parsing**: Upload design documents and let AI extract structured requirements
- 🎨 **AI Design Generation**: Generate multiple design images and layouts using AI
- 🖼️ **Visual Design Selection**: Choose from AI-generated design options with different themes
- 💻 **Code Generation**: Export production-ready HTML, CSS, and JavaScript code
- 📱 **Responsive Design**: Automatically generates responsive, accessible components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Google Gemini API key
- Replicate API key (for image generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd laygen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (required for AI processing)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API Key (required for AI processing)
GEMINI_API_KEY=your_gemini_api_key_here

# Replicate API Key (required for image generation)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# DeepAI API Key (optional, for alternative image generation)
DEEPAI_API_KEY=your_deepai_api_key_here

# App URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload Requirements**: Upload a design document (PDF, DOC, TXT, MD, Excel) with your requirements
2. **AI Processing**: The AI analyzes your document and generates design prompts
3. **Generate Designs**: AI creates multiple design images and layout options
4. **Select Design**: Choose your preferred design and color scheme
5. **Generate Code**: Export production-ready HTML, CSS, and JavaScript code

## API Keys Setup

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### Replicate API Key
1. Go to [Replicate](https://replicate.com/)
2. Sign up and go to your account settings
3. Generate a new API token
4. Add it to your `.env.local` file

## Project Structure

```
laygen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/parse/          # AI document parsing
│   │   │   ├── design/generate/   # AI design generation
│   │   │   └── export/code/       # Code generation
│   │   ├── page.tsx               # Main UI
│   │   └── layout.tsx             # App layout
│   ├── components/                # React components
│   ├── hooks/                     # Custom hooks
│   ├── lib/                       # Configuration
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utility functions
├── public/                        # Static assets
└── package.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini + OpenAI GPT-4
- **Icons**: Lucide React
- **Image Generation**: Replicate + DeepAI

## Limitations

- Image generation depends on external AI services (Replicate/DeepAI)
- File parsing is basic (PDF/DOC parsing would need additional libraries)
- Generated code is HTML/CSS/JS (not framework-specific)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
