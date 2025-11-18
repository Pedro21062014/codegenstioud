import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { EditorView } from './components/EditorView';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { OpenRouterKeyModal } from './components/OpenRouterKeyModal';
import { PricingPage } from './components/PricingPage';
import { ProjectsPage } from './components/ProjectsPage';
import { GithubImportModal } from './components/GithubImportModal';
import { PublishModal } from './components/PublishModal';
import { AuthModal } from './components/AuthModal';

import { SupabaseAdminModal } from './components/SupabaseAdminModal';
import { StripeModal } from './components/StripeModal';
import { NeonModal } from './components/NeonModal';
import { OpenStreetMapModal } from './components/OpenStreetMapModal';
import { GoogleCloudModal } from './components/GoogleCloudModal';
import { FirebaseFirestoreModal } from './components/FirebaseFirestoreModal';
import { VersionModal } from './components/VersionModal';
import { ProjectFile, ChatMessage, AIProvider, UserSettings, Theme, SavedProject, AIMode, AppType, GenerationMode } from './types';
import { downloadProjectAsZip, getProjectSize, formatFileSize } from './services/projectService';
import { INITIAL_CHAT_MESSAGE, DEFAULT_GEMINI_API_KEY, AI_MODELS } from './constants';
import { generateCodeStreamWithGemini, generateProjectName } from './services/geminiService';
import { clearExpiredCache } from './services/geminiCache';
import { generateCodeStreamWithOpenAI } from './services/openAIService';
import { generateCodeStreamWithDeepSeek } from './services/deepseekService';
import { generateCodeStreamWithOpenRouter } from './services/openRouterService';

const MAX_RETRIES = 3; // Define max retries for AI generation

import { useLocalStorage } from './hooks/useLocalStorage';
import { MenuIcon, ChatIcon, AppLogo, VersionIcon } from './components/Icons';
import { firebaseService } from './services/firebase';
import { FirebaseProjectService } from './services/firebaseProjectService';
import type { User } from 'firebase/auth';
import geminiImage from './components/models image/gemini.png';
import openrouterImage from './components/models image/openrouter.png';
import { LocalStorageService } from './services/localStorageService';

// Make debugService available in console for testing
if (typeof window !== 'undefined') {
  (window as any).firebaseDebugService = require('./services/firebaseDebugService').firebaseDebugService;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  onToggleVersionModal: () => void;
  projectName: string;
  session: User | null;
  selectedModel: { id: string; name: string; provider: AIProvider };
  onModelChange: (model: { id: string; name: string; provider: AIProvider }) => void;
  isProUser: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleChat, onToggleVersionModal, projectName, session, selectedModel, onModelChange, isProUser }) => {
  const allowedNonProModels = [
    'gemini-2.0-flash',
    'openrouter/google/gemini-pro-1.5',
    'deepseek/deepseek-chat-v3.1:free',
    'z-ai/glm-4.5-air:free',
    'moonshotai/kimi-k2:free',
    'deepseek/deepseek-r1:free',
    'google/gemini-2.0-flash-exp:free',
  ];

  const filteredModels = isProUser
    ? AI_MODELS
    : AI_MODELS.filter(model => allowedNonProModels.includes(model.id));

  const showGeminiImage = !isProUser && (selectedModel.id === 'gemini-2.0-flash' || selectedModel.id === 'openrouter/google/gemini-pro-1.5');
  const showOpenRouterImage = selectedModel.provider === AIProvider.OpenRouter;

  return (
    <div className="lg:hidden flex justify-between items-center p-2 bg-black border-b border-var-border-default flex-shrink-0">
      <button onClick={onToggleSidebar} className="p-2 rounded-md text-var-fg-muted hover:bg-var-bg-interactive" aria-label="Abrir barra lateral">
        <MenuIcon />
      </button>
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-var-fg-default truncate">{projectName}</h1>
        <button 
          onClick={onToggleVersionModal}
          className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive"
          aria-label="Ver histórico de versões"
          title="Histórico de versões"
        >
          <VersionIcon />
        </button>
      </div>
      <select
        className="bg-var
