import { AIProvider, AIModel } from './types';

export const AI_MODELS: AIModel[] = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: AIProvider.Gemini },
  { id: 'gpt-4o', name: 'GPT-4o', provider: AIProvider.OpenAI },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: AIProvider.OpenAI },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: AIProvider.OpenAI },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: AIProvider.DeepSeek },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: AIProvider.DeepSeek },
  { id: 'mistralai/mistral-7b-instruct-free', name: 'Mistral 7B (Free)', provider: AIProvider.OpenRouter },
  { id: 'google/gemma-7b-it-free', name: 'Gemma 7B (Free)', provider: AIProvider.OpenRouter },
  { id: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo', name: 'Nous Hermes 2 Mixtral (Free)', provider: AIProvider.OpenRouter },
  { id: 'deepseek/deepseek-coder-v2-lite-instruct', name: 'DeepSeek Coder V2 (OpenRouter)', provider: AIProvider.OpenRouter },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (OpenRouter)', provider: AIProvider.OpenRouter },
];

export const INITIAL_CHAT_MESSAGE = `Olá! Sou seu assistente de codificação de IA. Descreva a aplicação web que você deseja construir. Por exemplo: "Crie um site de portfólio simples com uma página inicial, sobre e de contato."`;

// Adicionada uma chave de API padrão do Gemini como fallback
export const DEFAULT_GEMINI_API_KEY = 'AIzaSyD0433RALd_5FVbs89xn6okQUsZ3QgHejU';