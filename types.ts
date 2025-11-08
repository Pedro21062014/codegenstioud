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

export type AppType = 'auto' | 'react-vite' | 'html-css-js' | 'angular' | 'nextjs'; // New AppType

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
}

// UserSettings agora reflete a estrutura da tabela 'profiles' do Supabase
export interface UserSettings {
  id: string; // Corresponde a auth.users.id
  updated_at?: string;
  gemini_api_key?: string;
  github_access_token?: string;
  supabase_project_url?: string;
  supabase_anon_key?: string;
  supabase_service_key?: string;
  stripe_public_key?: string;
  stripe_secret_key?: string;
  neon_connection_string?: string;
  openrouter_api_key?: string;
  gcp_project_id?: string;
  gcp_credentials?: string; // JSON string of service account key
  firebase_project_id?: string;
  firebase_service_account_key?: string;
}

export type Theme = 'light' | 'dark';

// SavedProject agora reflete a estrutura da tabela 'projects' do Supabase
export interface SavedProject {
  id: number;
  user_id: string;
  name: string;
  files: ProjectFile[];
  chat_history: ChatMessage[];
  env_vars: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface TerminalViewProps {
  onCommand?: (command: string) => void;
  height?: string;
}
