// Core types for Laygen application

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  layoutData?: LayoutData;
  generatedCode?: GeneratedCode;
}

export type ProjectStatus = 
  | 'draft'
  | 'processing'
  | 'editing'
  | 'synced'
  | 'exported'
  | 'completed';

export interface LayoutData {
  id: string;
  name: string;
  frames: Frame[];
  styles: StyleGuide;
  metadata: LayoutMetadata;
}

export interface Frame {
  id: string;
  name: string;
  type: 'FRAME' | 'COMPONENT' | 'INSTANCE';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  children: Node[];
  constraints: Constraints;
}

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  children?: Node[];
  style?: NodeStyle;
  constraints: Constraints;
}

export type NodeType = 
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'FRAME'
  | 'COMPONENT'
  | 'INSTANCE'
  | 'GROUP';

export interface NodeStyle {
  fill?: Fill;
  stroke?: Stroke;
  textStyle?: TextStyle;
  effects?: Effect[];
}

export interface Fill {
  type: 'SOLID' | 'GRADIENT' | 'IMAGE';
  color?: Color;
  gradientStops?: GradientStop[];
  imageRef?: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GradientStop {
  color: Color;
  position: number;
}

export interface Stroke {
  type: 'SOLID' | 'GRADIENT';
  color?: Color;
  weight: number;
  align: 'INSIDE' | 'OUTSIDE' | 'CENTER';
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: Color;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
  visible: boolean;
}

export interface Constraints {
  horizontal: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  vertical: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
}

export interface StyleGuide {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
}

export interface ColorToken {
  name: string;
  value: Color;
  description?: string;
}

export interface TypographyToken {
  name: string;
  value: TextStyle;
  description?: string;
}

export interface SpacingToken {
  name: string;
  value: number;
  description?: string;
}

export interface BorderRadiusToken {
  name: string;
  value: number;
  description?: string;
}

export interface ShadowToken {
  name: string;
  value: Effect;
  description?: string;
}

export interface LayoutMetadata {
  version: string;
  generatedAt: Date;
  aiModel: string;
  requirements: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface GeneratedCode {
  id: string;
  projectId: string;
  framework: 'nextjs' | 'react' | 'vue' | 'svelte';
  components: ComponentCode[];
  styles: StyleCode;
  dependencies: string[];
  generatedAt: Date;
}

export interface ComponentCode {
  name: string;
  path: string;
  content: string;
  type: 'page' | 'component' | 'layout' | 'hook' | 'util';
}

export interface StyleCode {
  global: string;
  components: { [componentName: string]: string };
  variables: string;
}


export interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'xlsx' | 'xls';
  size: number;
  content: string;
  uploadedAt: Date;
  processedAt?: Date;
}

export interface AIProcessingResult {
  success: boolean;
  layoutData?: LayoutData;
  error?: string;
  suggestions?: string[];
  confidence: number;
}

export interface SyncResult {
  success: boolean;
  updatedLayout?: LayoutData;
  changes?: Change[];
  error?: string;
}

export interface Change {
  type: 'added' | 'modified' | 'removed';
  nodeId: string;
  property: string;
  oldValue?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  newValue?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ProjectFormData {
  name: string;
  description?: string;
  requirements: string;
  theme: 'light' | 'dark' | 'auto';
}


// Configuration types
export interface AppConfig {
  ai: {
    provider: 'openai' | 'anthropic';
    apiKey: string;
    model: string;
  };
  storage: {
    provider: 'local' | 's3' | 'vercel';
    bucket?: string;
    region?: string;
  };
}
