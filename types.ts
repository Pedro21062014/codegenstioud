export enum AIProvider {
  Gemini = 'Gemini',
  OpenAI = 'OpenAI',
  DeepSeek = 'DeepSeek',
  OpenRouter = 'OpenRouter',
}

export enum IntegrationProvider {
  GitHub = 'GitHub',
  Supabase = 'Supabase',
  Stripe = 'Stripe',
  OpenStreetMap = 'OpenStreetMap',
  Neon = 'Neon',
  GoogleCloud = 'GoogleCloud',
}

export enum AIMode {
  Chat = 'chat',
  Agent = 'agent',
}

export type AppType = 'auto' | 'react-vite' | 'html-css-js' | 'angular' | 'nextjs' | 'chrome-extension' | 'vscode-extension' | 'desktop';

export type GenerationMode = 'full' | 'quick';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export interface ProjectFile {
  name: string;
  language: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  summary?: string;
  isThinking?: boolean;
  fromCache?: boolean;
}

// UserSettings now reflects the 'users' collection structure in Firebase Firestore
export interface UserSettings {
  id: string; // Firebase Auth UID
  email: string;
  createdAt: Date;
  updatedAt: Date;
  geminiApiKey?: string;
  githubAccessToken?: string;
  supabaseProjectUrl?: string; // To be removed later if not needed
  supabaseAnonKey?: string;     // To be removed later if not needed
  supabaseServiceKey?: string;  // To be removed later if not needed
  stripePublicKey?: string;
  stripeSecretKey?: string;
  neonConnectionString?: string;
  openrouterApiKey?: string;
  gcpProjectId?: string;
  gcpCredentials?: string; // JSON string of service account key
  firebaseProjectId?: string;
  firebaseServiceAccountKey?: string; // JSON string of service account key
  theme?: Theme;
  isPro?: boolean;
}

export type Theme = 'light' | 'dark';

// SavedProject now reflects the 'projects' collection structure in Firebase Firestore
export interface SavedProject {
  id: string; // Firestore Document ID
  userId: string; // Firebase Auth UID
  name: string;
  createdAt: Date;
  updatedAt: Date;
  files: ProjectFile[];
  chatHistory: ChatMessage[];
  envVars: Record<string, string>;
  appType?: AppType;
}

export interface ProjectVersion {
  id: string;
  timestamp: Date;
  description: string;
  files: ProjectFile[];
  chatHistory: ChatMessage[];
  envVars: Record<string, string>;
}

export interface TerminalViewProps {
  onCommand?: (command: string) => void;
  height?: string;
}
