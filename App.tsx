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

import { StripeModal } from './components/StripeModal';
import { NeonModal } from './components/NeonModal';
import { OpenStreetMapModal } from './components/OpenStreetMapModal';
import { GoogleCloudModal } from './components/GoogleCloudModal';
import { FirebaseFirestoreModal } from './components/FirebaseFirestoreModal';
import { VersionModal } from './components/VersionModal';
import { ToastContainer, useToast } from './components/Toast';
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
import { db, auth } from './services/firebase';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { User, onAuthStateChanged, signOut, type User as FirebaseAuthUser } from "firebase/auth";
import geminiImage from './components/models image/gemini.png'; // Import the image
import openrouterImage from './components/models image/openrouter.png'; // Import the OpenRouter image
// import { debugService } from './services/debugService'; // debugService removed
import { LocalStorageService } from './services/localStorageService';
// import { MigrationService } from './services/migrationService'; // MigrationService removed

// Make debugService available in console for testing
/* if (typeof window !== 'undefined') {
  (window as any).debugService = debugService;
} */ // debugService removed

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  onToggleVersionModal: () => void;
  projectName: string;
  user: FirebaseAuthUser | null; // Changed from session to user
  selectedModel: { id: string; name: string; provider: AIProvider };
  onModelChange: (model: { id: string; name: string; provider: AIProvider }) => void;
  isProUser: boolean; // Add isProUser to HeaderProps
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleChat, onToggleVersionModal, projectName, user, selectedModel, onModelChange, isProUser }) => {
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
        className="bg-var-bg-subtle text-var-fg-default rounded-md p-1 text-sm relative z-50"
        value={selectedModel.id}
        onChange={(e) => {
          const selected = AI_MODELS.find((m) => m.id === e.target.value);
          if (selected) {
            onModelChange(selected);
          }
        }}
        title="Selecionar modelo de IA"
      >
        {filteredModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        {showGeminiImage && <img src={geminiImage} alt="Gemini" className="w-5 h-5 dark:invert-0 light:invert-1" />}
        {showOpenRouterImage && <img src={openrouterImage} alt="OpenRouter" className="w-5 h-5 dark:invert-0 light:invert-1" />}
        <button onClick={onToggleChat} className="p-2 rounded-md text-var-fg-muted hover:bg-var-bg-interactive" aria-label="Abrir chat">
          <ChatIcon />
        </button>
      </div>
    </div>
  );
};

const InitializingOverlay: React.FC<{ projectName: string; generatingFile: string }> = ({ projectName, generatingFile }) => {
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 10) return prev - 1;
        if (prev > 2) return prev - 0.5;
        return 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-var-fg-default animate-fadeIn">
      <AppLogo className="w-12 h-12 text-var-accent animate-pulse" style={{ animationDuration: '2s' }} />
      <h2 className="mt-4 text-2xl font-bold">Gerando seu novo projeto...</h2>
      <p className="text-lg text-var-fg-muted">{projectName}</p>

      <div className="mt-8 text-center space-y-4">
        <div>
          <p className="text-sm text-var-fg-subtle">Criando arquivo:</p>
          <p className="text-base font-mono text-var-fg-default bg-black px-3 py-1.5 rounded-md inline-block min-w-[220px] text-center transition-all duration-300">
            {generatingFile}
          </p>
        </div>
        <div>
          <p className="text-sm text-var-fg-subtle">Tempo estimado restante:</p>
          <p className="text-base font-semibold text-var-fg-default">{Math.ceil(timeLeft)} segundos</p>
        </div>
      </div>
    </div>
  );
};


const extractAndParseJson = (text: string): any => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.error("Could not find valid JSON object delimiters {} in AI response:", text);
    throw new Error("Não foi encontrado nenhum objeto JSON válido na resposta da IA. A resposta pode estar incompleta ou em um formato inesperado.");
  }

  const jsonString = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("Failed to parse extracted JSON:", parseError);
    console.error("Extracted JSON string:", jsonString);
    const message = parseError instanceof Error ? parseError.message : "Erro de análise desconhecido.";
    throw new Error(`A resposta da IA continha um JSON malformado. Detalhes: ${message}`);
  }
};

interface ProjectState {
  files: ProjectFile[];
  activeFile: string | null;
  chatMessages: ChatMessage[];
  projectName: string;
  envVars: Record<string, string>;
  currentProjectId: string | null; // Firebase Firestore Document ID
  appType: AppType; // Add appType to track project type
}

const initialProjectState: ProjectState = {
  files: [],
  activeFile: null,
  chatMessages: [{ role: 'assistant', content: INITIAL_CHAT_MESSAGE }],
  projectName: 'NovoProjeto',
  envVars: {},
  currentProjectId: null,
  appType: 'auto',
};


const App: React.FC = () => {
  const [project, setProject] = useLocalStorage<ProjectState>('codegen-studio-project', initialProjectState);
  const { files, activeFile, chatMessages, projectName, envVars, currentProjectId } = project;
  const [projectSize, setProjectSize] = useState<number>(0);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    // Carregar projetos do localStorage na inicialização
    const localProjects = LocalStorageService.getProjects();
    console.log('🚀 Projetos carregados na inicialização:', localProjects.length);
    return localProjects;
  });
  const [view, setView] = useState<'welcome' | 'editor' | 'pricing' | 'projects'>();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isOpenRouterKeyModalOpen, setOpenRouterKeyModalOpen] = useState(false);
  const [isGithubModalOpen, setGithubModalOpen] = useState(false);
  const [isLocalRunModalOpen, setLocalRunModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const [isStripeModalOpen, setStripeModalOpen] = useState(false);
  const [isNeonModalOpen, setNeonModalOpen] = useState(false);
  const [isOSMModalOpen, setOSMModalOpen] = useState(false);
  const [isGoogleCloudModalOpen, setGoogleCloudModalOpen] = useState(false);
  const [isFirebaseFirestoreModalOpen, setFirebaseFirestoreModalOpen] = useState(false);
  const [isVersionModalOpen, setVersionModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Toast notifications
  const toast = useToast();

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isProUser, setIsProUser] = useState<boolean>(() => LocalStorageService.getIsProUser());
  const [theme, setTheme] = useState<Theme>(() => LocalStorageService.getTheme());
  const [pendingPrompt, setPendingPrompt] = useState<{ prompt: string, provider: AIProvider, model: string, mode: AIMode, attachments: { data: string; mimeType: string }[], appType: AppType, generationMode: GenerationMode } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [generatingFile, setGeneratingFile] = useState<string>('Preparando...');

  const [codeError, setCodeError] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<{ provider: AIProvider, model: string }>({ provider: AIProvider.Gemini, model: 'gemini-1.5-pro' });
  const [dailyUsage, setDailyUsage] = useState<number>(() => LocalStorageService.getDailyUsage());
  const [selectedModel, setSelectedModel] = useState<{ id: string; name: string; provider: AIProvider }>(AI_MODELS[0]);

  // Load daily usage from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = LocalStorageService.getDailyUsage();
    const storedDate = LocalStorageService.getDailyUsageDate();

    if (storedDate === today && stored) {
      setDailyUsage(stored);
    } else {
      // Reset for new day
      setDailyUsage(0);
      LocalStorageService.setDailyUsage(0);
      LocalStorageService.setDailyUsageDate(today);
    }
  }, []);

  // Save daily usage to localStorage
  useEffect(() => {
    LocalStorageService.setDailyUsage(dailyUsage);
  }, [dailyUsage]);

  const [user, setUser] = useState<FirebaseAuthUser | null>(null); // Changed from session to user
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);

  const canManipulateHistory = window.location.protocol.startsWith('http');

  const effectiveGeminiApiKey = userSettings?.gemini_api_key || DEFAULT_GEMINI_API_KEY;

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Clean up expired cache entries on app initialization
  useEffect(() => {
    clearExpiredCache();
  }, []);

  // --- Data Fetching and Auth ---
  const fetchUserData = useCallback(async (firebaseUser: FirebaseAuthUser) => {
    try {
      console.log('📊 Carregando dados do usuário:', firebaseUser.uid);

      // Carregar dados do Firestore para o perfil do usuário
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserSettings;
        setUserSettings(profileData);
      } else {
        // Criar um novo perfil se não existir
        const newProfile: UserSettings = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          theme: theme, // Use current theme from state
          isPro: false,
        };
        await updateDoc(userDocRef, { ...newProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        setUserSettings({ ...newProfile, createdAt: new Date(), updatedAt: new Date() }); // Set local Date objects for consistency
      }

      // Carregar projetos do Firestore para o usuário
      const projectsColRef = collection(db, 'projects');
      const q = query(projectsColRef, where('userId', '==', firebaseUser.uid));
      const querySnapshot = await getDocs(q);
      const projectsData: SavedProject[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to Date
          updatedAt: data.updatedAt.toDate(), // Convert Firestore Timestamp to Date
          files: data.files,
          chatHistory: data.chatHistory,
          envVars: data.envVars,
          appType: data.appType,
        };
      });
      setSavedProjects(projectsData);

      console.log('✅ Dados carregados e sincronizados com sucesso');

    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      // Fallback para localStorage em caso de erro
      console.log('⚠️ Usando dados do localStorage como fallback');
      const localSettings = LocalStorageService.getUserSettings();
      const localProjects = LocalStorageService.getProjects();
      setUserSettings(localSettings);
      setSavedProjects(localProjects);
    }
  }, [theme]); // Added theme to dependencies

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser); // Set the Firebase user

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
        if (postLoginAction) {
          postLoginAction();
          setPostLoginAction(null);
        }
      } else {
        // For logged-out users, load data from localStorage
        console.log('🔓 Logout detectado - carregando dados locais');
        setUserSettings(null);
        setSavedProjects([]);

        const localSettings = LocalStorageService.getUserSettings();
        const localProjects = LocalStorageService.getProjects();
        setUserSettings(localSettings);
        setSavedProjects(localProjects);
      }
      setIsLoadingData(false); // Set loading to false after initial check is complete
    });

    return () => unsubscribe();
  }, [fetchUserData, postLoginAction]);


  // --- Project Management & URL Handling ---
  const handleNewProject = useCallback(() => {
    const startNew = () => {
      setProject(initialProjectState);
      setCodeError(null);
      setView('welcome');
      setSidebarOpen(false);
      setChatOpen(false);
      if (canManipulateHistory) {
        const url = new URL(window.location.href);
        url.searchParams.delete('projectId');
        window.history.pushState({ path: url.href }, '', url.href);
      }
    };

    if (project.files.length > 0) {
      if (window.confirm("Tem certeza de que deseja iniciar um novo projeto? Seu trabalho local atual será perdido.")) {
        startNew();
      }
    } else {
      startNew();
    }
  }, [project, canManipulateHistory, setProject]);

  // Função para abrir projetos - recarrega do localStorage antes
  const handleOpenProjects = useCallback(() => {
    console.log('📂 Abrindo página de projetos...');

    // Recarregar projetos do localStorage sempre
    const localProjects = LocalStorageService.getProjects();
    console.log('📋 Projetos carregados do localStorage:', localProjects.length);
    setSavedProjects(localProjects);

    setView('projects');
  }, []);

  const handleLogout = useCallback(async () => {
    console.log('🚪 Iniciando processo de logout...');
    console.log('📍 Verificando usuário atual:', user ? 'Usuário logado' : 'Usuário não logado');

    try {
      console.log('⏳ Chamando Firebase signOut()...');
      await signOut(auth);
      console.log('✅ Logout realizado com sucesso!');

      setProject(initialProjectState);
      setView('welcome');

      console.log('📍 canManipulateHistory:', canManipulateHistory);
      if (canManipulateHistory) {
        const url = new URL(window.location.href);
        url.searchParams.delete('projectId');
        console.log('🔗 URL antes de atualizar:', window.location.href);
        console.log('🔗 URL após limpar params:', url.href);
        window.history.pushState({ path: url.href }, '', url.href);
        console.log('🔗 URL atualizada:', url.href);
      } else {
        console.log('⚠️ cannot manipulate history - protocolo não é http/https');
      }

      console.log('🎉 Processo de logout concluído!');
    } catch (err) {
      console.error('💥 Erro inesperado durante logout:', err);
      alert(`Erro inesperado ao fazer logout: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  }, [setProject, setView, canManipulateHistory, user]); // Changed 'session' to 'user'

  // Adicionar função de teste global para debug
  if (typeof window !== 'undefined') {
    (window as any).testLogout = async () => {
      console.log('🧪 TESTE: Iniciando logout manual...');
      try {
        await signOut(auth);
        console.log('🧪 TESTE: Logout do Firebase bem-sucedido.');
      } catch (error) {
        console.error('🧪 TESTE: Erro no signOut do Firebase:', error);
        throw error;
      }
    };
  }

  const handleLoadProject = useCallback((projectId: string, confirmLoad: boolean = true) => {
    if (confirmLoad && project.files.length > 0 && !window.confirm("Carregar este projeto substituirá seu trabalho local atual. Deseja continuar?")) {
      return;
    }

    const projectToLoad = savedProjects.find(p => p.id === projectId);
    if (projectToLoad) {
      setProject({
        files: projectToLoad.files,
        projectName: projectToLoad.name,
        chatMessages: projectToLoad.chatHistory,
        envVars: projectToLoad.envVars || {},
        currentProjectId: projectToLoad.id,
        appType: projectToLoad.appType || 'auto',
        activeFile: projectToLoad.files.find(f => f.name.includes('html'))?.name || projectToLoad.files[0]?.name || null,
      });

      if (canManipulateHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set('projectId', String(projectToLoad.id));
        window.history.pushState({ path: url.href }, '', url.href);
      }

      setCodeError(null);
      setIsInitializing(false);
      setView('editor');
    } else {
      alert("Não foi possível carregar o projeto. Ele pode ter sido excluído ou ainda não foi carregado.");
      if (canManipulateHistory) {
        const url = new URL(window.location.href);
        url.searchParams.delete('projectId');
        window.history.pushState({ path: url.href }, '', url.href);
      }
    }
  }, [project.files.length, savedProjects, setProject, canManipulateHistory]);

  useEffect(() => {
    if (isLoadingData || view) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectIdStr = urlParams.get('projectId');

    if (canManipulateHistory && projectIdStr) {
      const projectExists = savedProjects.some(p => p.id === projectIdStr);
      if (projectExists) {
        handleLoadProject(projectIdStr, false);
        setView('editor');
        return;
      }
    }

    if (files.length > 0) {
      setView('editor');
    } else {
      setView('welcome');
    }
  }, [view, savedProjects, files.length, handleLoadProject, canManipulateHistory, isLoadingData]);


  useEffect(() => {
    if (canManipulateHistory) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('payment') && urlParams.get('payment') === 'success') {
        setIsProUser(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setIsProUser, canManipulateHistory]);

  const handleSaveSettings = useCallback(async (newSettings: Partial<Omit<UserSettings, 'id' | 'updated_at'>>) => {
    console.log('💾 handleSaveSettings chamado com:', newSettings);

    // Verificar se usuário está autenticado
    if (!user) {
      console.log('⚠️ Usuário não autenticado - salvando apenas localmente');
      LocalStorageService.saveUserSettings(newSettings);

      const existingSettings = LocalStorageService.getUserSettings() || {};
      const updatedSettings = { ...existingSettings, ...newSettings };
      setUserSettings(updatedSettings);

      alert('Configurações salvas localmente. Faça login para sincronizar na nuvem.');
      return;
    }

    // Para usuários autenticados, salvar no Firestore
    try {
      const userDocRef = doc(db, 'users', user.uid);

      const settingsToSave = {
        ...newSettings,
        updatedAt: serverTimestamp(), // Firestore Timestamp
      };

      console.log('📤 Salvando configurações no Firestore:', {
        userId: user.uid,
        campos: Object.keys(newSettings),
      });

      await updateDoc(userDocRef, settingsToSave);

      console.log('✅ Configurações salvas no Firestore');

      // Atualizar estado local com a data atual para 'updatedAt'
      const updatedLocalSettings = {
        ...userSettings, // Use current userSettings to preserve existing fields
        ...newSettings,
        updatedAt: new Date(), // Update updatedAt to current local time
      } as UserSettings; // Cast to UserSettings

      setUserSettings(updatedLocalSettings);

      // Sincronizar com localStorage como cache
      LocalStorageService.saveUserSettings(updatedLocalSettings);

      const successMessage = Object.keys(newSettings).length === 1
        ? `Configuração "${Object.keys(newSettings)[0]}" salva com sucesso!`
        : 'Configurações salvas com sucesso!';

      setTimeout(() => {
        alert(successMessage);
      }, 100);

    } catch (err) {
      console.error("💥 Erro inesperado ao salvar configurações:", err);
      alert(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}. Tente novamente.`);

      // Salvar localmente como fallback
      LocalStorageService.saveUserSettings(newSettings);
    }
  }, [user, setUserSettings, userSettings]); // Added userSettings to dependencies


  const handleSendMessage = useCallback(async (prompt: string, provider: AIProvider, model: string, mode: AIMode, attachments: { data: string; mimeType: string }[] = [], appType: AppType = 'auto', generationMode: GenerationMode = 'full') => {
    setCodeError(null);
    setLastModelUsed({ provider, model });

    let currentPrompt = prompt;
    if (appType !== 'auto') {
      currentPrompt = `${prompt} (Gerar em ${appType})`; // Append appType to prompt
    }

    if (currentPrompt.toLowerCase().includes('ia') && !effectiveGeminiApiKey) {
      setProject(p => ({ ...p, chatMessages: [...p.chatMessages, { role: 'assistant', content: 'Para adicionar funcionalidades de IA ao seu projeto, primeiro adicione sua chave de API do Gemini.' }] }));
      setApiKeyModalOpen(true);
      return;
    }

    if (provider === AIProvider.Gemini && !effectiveGeminiApiKey) {
      setPendingPrompt({ prompt, provider, model, mode, attachments, appType, generationMode });
      setApiKeyModalOpen(true);
      return;
    }

    if (provider === AIProvider.OpenRouter && !userSettings?.openrouter_api_key) {
      setPendingPrompt({ prompt, provider, model, mode, attachments, appType, generationMode });
      setOpenRouterKeyModalOpen(true);
      return;
    }

    if ((provider === AIProvider.OpenAI || provider === AIProvider.DeepSeek) && !isProUser) {
      alert('Este modelo está disponível apenas para usuários Pro. Por favor, atualize seu plano na página de preços.');
      return;
    }

    const isFirstGeneration = project.files.length === 0;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    const thinkingMessage: ChatMessage = { role: 'assistant', content: 'Pensando...', isThinking: true };

    const newChatHistory = view !== 'editor' ? [userMessage, thinkingMessage] : [...project.chatMessages, userMessage, thinkingMessage];
    setProject(p => ({ ...p, chatMessages: newChatHistory, appType: appType }));

    if (view !== 'editor') {
      setView('editor');
    }

    if (isFirstGeneration && effectiveGeminiApiKey) {
      setIsInitializing(true);
      setGeneratingFile('Analisando o prompt...');
      const newName = await generateProjectName(currentPrompt, effectiveGeminiApiKey); // Use currentPrompt
      setProject(p => ({ ...p, projectName: newName, appType: appType }));
      setGeneratingFile('Preparando para gerar arquivos...');
    }

    let thoughtMessageFound = false;
    let accumulatedContent = "";
    const onChunk = (chunk: string) => {
      accumulatedContent += chunk;
      if (!thoughtMessageFound) {
        const separatorIndex = accumulatedContent.indexOf('\n---\n');
        if (separatorIndex !== -1) {
          const thought = accumulatedContent.substring(0, separatorIndex).trim();
          setProject(p => {
            const newMessages = [...p.chatMessages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.isThinking) {
              lastMessage.content = thought;
            }
            return { ...p, chatMessages: newMessages };
          });
          thoughtMessageFound = true;
        }
      }

      if (isInitializing) {
        const fileMatches = [...accumulatedContent.matchAll(/"name":\s*"([^"]+)"/g)];
        if (fileMatches.length > 0) {
          const lastMatch = fileMatches[fileMatches.length - 1];
          const currentFileName = lastMatch[1];
          setGeneratingFile(prevFile => prevFile === currentFileName ? prevFile : currentFileName);
        }
      }
    };

    // Check daily usage limit for Gemini with default API key
    if (provider === AIProvider.Gemini && effectiveGeminiApiKey === DEFAULT_GEMINI_API_KEY) {
      if (!user) { // Changed from session?.user to user
        alert('Você precisa estar logado para usar o Gemini com a chave padrão.');
        setIsInitializing(false);
        return;
      }
      if (!isProUser && dailyUsage >= 8) {
        alert('Você atingiu o limite diário de 8 usos do Gemini. Atualize para o plano Pro para uso ilimitado ou adicione sua própria chave API.');
        setIsInitializing(false);
        return;
      }
      if (!isProUser) {
        setDailyUsage(prev => prev + 1);
      }
    }

    let result = null;
    let lastError: Error | null = null;
    let responseFromCache = false;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        let fullResponse;

        switch (provider) {
          case AIProvider.Gemini:
            const geminiResult = await generateCodeStreamWithGemini(currentPrompt, project.files, project.envVars, onChunk, model, effectiveGeminiApiKey!, mode, generationMode, attachments);
            fullResponse = geminiResult.response;
            responseFromCache = geminiResult.fromCache;
            break;
          case AIProvider.OpenAI:
            fullResponse = await generateCodeStreamWithOpenAI(currentPrompt, project.files, onChunk, model); // Use currentPrompt
            break;
          case AIProvider.DeepSeek:
            fullResponse = await generateCodeStreamWithDeepSeek(currentPrompt, project.files, onChunk, model); // Use currentPrompt
            break;
          case AIProvider.OpenRouter:
            fullResponse = await generateCodeStreamWithOpenRouter(currentPrompt, project.files, project.envVars, onChunk, userSettings!.openrouter_api_key!, model); // Use currentPrompt
            break;
          default:
            throw new Error('Provedor de IA não suportado');
        }

        let finalJsonPayload = fullResponse;
        const separatorIndex = fullResponse.indexOf('\n---\n');
        if (separatorIndex !== -1) {
          finalJsonPayload = fullResponse.substring(separatorIndex + 5);
        }

        result = extractAndParseJson(finalJsonPayload);
        break; // If successful, break out of retry loop
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < MAX_RETRIES - 1) {
          setProject(p => ({
            ...p,
            chatMessages: [...p.chatMessages, { role: 'assistant', content: `Erro de análise JSON na resposta da IA (tentativa ${i + 1}/${MAX_RETRIES}). Tentando novamente...` }]
          }));
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
      }
    }

    if (!result) {
      const errorMessageText = lastError instanceof Error ? lastError.message : "Ocorreu um erro desconhecido após várias tentativas.";
      setProject(p => {
        const newMessages = [...p.chatMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          lastMessage.content = `Erro: ${errorMessageText}`;
          lastMessage.isThinking = false;
        } else {
          newMessages.push({ role: 'assistant', content: `Erro: ${errorMessageText}`, isThinking: false });
        }
        return { ...p, chatMessages: newMessages };
      });
      setIsInitializing(false);
      return;
    }

    if (result.files && Array.isArray(result.files)) {
      setProject(p => {
        const updatedFilesMap = new Map(p.files.map(f => [f.name, f]));
        result.files.forEach((file: ProjectFile) => {
          updatedFilesMap.set(file.name, file);
        });
        const newFiles = Array.from(updatedFilesMap.values());
        let newActiveFile = p.activeFile;
        if (result.files.length > 0 && !newActiveFile) {
          const foundFile = result.files.find((f: ProjectFile) => f.name.includes('html')) || result.files[0];
          newActiveFile = foundFile.name;
        }
        return { ...p, files: newFiles, activeFile: newActiveFile };
      });
    }

    if (result.environmentVariables) {
      if (result.environmentVariables.GEMINI_API_KEY !== undefined && userSettings?.gemini_api_key) {
        result.environmentVariables.GEMINI_API_KEY = userSettings.gemini_api_key;
      }

      setProject(p => {
        const newVars = { ...p.envVars };
        for (const [key, value] of Object.entries(result.environmentVariables)) {
          if (value === null) {
            delete newVars[key];
          } else {
            newVars[key] = value as string;
          }
        }
        return { ...p, envVars: newVars };
      });
    }

    setProject(p => {
      const newMessages = [...p.chatMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.role === 'assistant') {
        lastMessage.content = result.message || 'Geração concluída.';
        lastMessage.summary = result.summary;
        lastMessage.isThinking = false;
        lastMessage.fromCache = responseFromCache;
        return { ...p, chatMessages: newMessages };
      }
      return p;
    });

    if (isFirstGeneration) {
      setIsInitializing(false);
    }
  }, [project, effectiveGeminiApiKey, isProUser, view, userSettings, setProject, setCodeError, setLastModelUsed, setApiKeyModalOpen, setPendingPrompt, setIsInitializing, setGeneratingFile, setOpenRouterKeyModalOpen]); // Removed handleSupabaseAdminAction

  useEffect(() => {
    if (!pendingPrompt) return;

    const { prompt, provider, model, mode, attachments, appType, generationMode } = pendingPrompt;
    let canProceed = false;

    if (provider === AIProvider.Gemini && effectiveGeminiApiKey) {
      canProceed = true;
    } else if (provider === AIProvider.OpenRouter && userSettings?.openrouter_api_key) {
      canProceed = true;
    }

    if (canProceed) {
      setPendingPrompt(null);
      handleSendMessage(prompt, provider, model, mode, attachments, appType, generationMode);
    }
  }, [pendingPrompt, effectiveGeminiApiKey, userSettings, handleSendMessage]);

  const handleFixCode = useCallback(() => {
    if (!codeError || !lastModelUsed) return;
    const fixPrompt = `O código anterior gerou um erro de visualização: "${codeError}". Por favor, analise os arquivos e corrija o erro. Forneça apenas os arquivos modificados.`;
    handleSendMessage(fixPrompt, lastModelUsed.provider, lastModelUsed.model, AIMode.Agent); // Default to Agent for fixing code
  }, [codeError, lastModelUsed, handleSendMessage]);

  const handleSaveProject = useCallback(async () => {
    console.log('💾 handleSaveProject chamado');

    if (files.length === 0) {
      toast.warning("Não é possível salvar um projeto vazio.");
      return;
    }

    if (isSaving) {
      toast.info("Salvamento em andamento...");
      return;
    }

    setIsSaving(true);

    const projectData: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
      name: projectName,
      files,
      chatHistory: chatMessages,
      envVars: envVars,
      appType: project.appType,
    };

    // Verificar se usuário está autenticado
    if (!user) {
      console.log('⚠️ Usuário não autenticado - salvando apenas localmente');

      // Gerar ID local único se não existir
      let projectId = currentProjectId;
      if (!projectId) {
        projectId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log('🆔 Novo ID gerado:', projectId);
      }

      const localProject: SavedProject = {
        ...projectData,
        id: projectId,
        userId: 'local-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('💾 Salvando projeto no localStorage:', {
        id: localProject.id,
        name: localProject.name,
        filesCount: localProject.files.length,
      });

      LocalStorageService.addProject(localProject);
      setProject(p => ({ ...p, currentProjectId: projectId }));

      const updatedProjects = LocalStorageService.getProjects();
      console.log('📋 Projetos após salvar:', updatedProjects.length);
      setSavedProjects(updatedProjects);
      setHasUnsavedChanges(false);
      setIsSaving(false);

      toast.success(`Projeto "${projectName}" salvo localmente!`);
      console.log('✅ Projeto salvo com sucesso no localStorage');
      return;
    }

    // Para usuários autenticados, salvar no Firestore
    console.log('📝 Salvando projeto no Firestore:', {
      name: projectName,
      filesCount: files.length,
      userId: user.uid,
    });

    const firestoreProjectData = {
      ...projectData,
      userId: user.uid,
      updatedAt: serverTimestamp(), // Use Firestore server timestamp
    };

    try {
      if (currentProjectId) {
        // Atualizar projeto existente
        console.log('🔄 Atualizando projeto existente:', currentProjectId);
        const projectDocRef = doc(db, 'projects', currentProjectId);
        await updateDoc(projectDocRef, firestoreProjectData);

        console.log('✅ Atualização bem-sucedida:', currentProjectId);

        // Atualizar estado local com a data atual para 'updatedAt'
        const updatedLocalProject = {
          ...projectData,
          id: currentProjectId,
          userId: user.uid,
          createdAt: savedProjects.find(p => p.id === currentProjectId)?.createdAt || new Date(),
          updatedAt: new Date(),
        };

        setSavedProjects(savedProjects.map(p => p.id === currentProjectId ? updatedLocalProject : p));

        // Sincronizar com localStorage
        LocalStorageService.updateProject(currentProjectId, updatedLocalProject);
        setHasUnsavedChanges(false);

        toast.success(`Projeto "${projectName}" atualizado com sucesso!`);

      } else {
        // Inserir novo projeto
        console.log('➕ Inserindo novo projeto');
        const projectsColRef = collection(db, 'projects');
        const newProjectRef = await addDoc(projectsColRef, {
          ...firestoreProjectData,
          createdAt: serverTimestamp(),
        });

        console.log('✅ Inserção bem-sucedida:', newProjectRef.id);

        const newSavedProject: SavedProject = {
          ...projectData,
          id: newProjectRef.id,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setProject(p => ({ ...p, currentProjectId: newProjectRef.id }));
        setSavedProjects([...savedProjects, newSavedProject]);

        // Sincronizar com localStorage
        LocalStorageService.addProject(newSavedProject);
        setHasUnsavedChanges(false);

        toast.success(`Projeto "${projectName}" salvo com sucesso!`);
      }
    } catch (err) {
      console.error('💥 Erro ao salvar no Firebase:', err);

      // Fallback: salvar localmente quando Firebase falha
      console.log('⚠️ Salvando localmente como fallback...');

      let projectId = currentProjectId || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const localProject: SavedProject = {
        ...projectData,
        id: projectId,
        userId: user?.uid || 'local-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (currentProjectId) {
        LocalStorageService.updateProject(currentProjectId, localProject);
      } else {
        LocalStorageService.addProject(localProject);
        setProject(p => ({ ...p, currentProjectId: projectId }));
      }

      const updatedProjects = LocalStorageService.getProjects();
      setSavedProjects(updatedProjects);

      toast.warning(`Projeto salvo localmente (Firebase indisponível)`);
    } finally {
      setIsSaving(false);
    }
  }, [user, files, projectName, chatMessages, envVars, currentProjectId, savedProjects, setProject, project.appType, isSaving, toast]);

  // Keyboard shortcut for saving (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (view === 'editor' && files.length > 0) {
          handleSaveProject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveProject, view, files.length]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    // Verificar se usuário está autenticado
    if (!user) {
      console.log('⚠️ Usuário não autenticado - excluindo apenas do localStorage');
      LocalStorageService.deleteProject(projectId);
      setSavedProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      if (currentProjectId === projectId) {
        handleNewProject();
      }
      alert("Projeto excluído localmente.");
      return;
    }

    // Para usuários autenticados, excluir do Firestore
    try {
      const projectDocRef = doc(db, 'projects', projectId);
      await deleteDoc(projectDocRef);

      console.log('✅ Projeto excluído do Firestore');
      setSavedProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));

      // Também excluir do localStorage
      LocalStorageService.deleteProject(projectId);

      if (currentProjectId === projectId) {
        handleNewProject();
      }
      alert("Projeto excluído com sucesso.");
    } catch (err) {
      console.error('💥 Erro inesperado ao excluir:', err);
      alert(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  }, [user, currentProjectId, handleNewProject]);

  const handleOpenSettings = () => {
    if (user) {
      setSettingsOpen(true);
    } else {
      setPostLoginAction(() => () => setSettingsOpen(true));
      setAuthModalOpen(true);
    }
  };

  const handleRunLocally = useCallback(() => {
    if (project.files.length === 0) {
      alert("Não há arquivos para executar. Gere algum código primeiro.");
      return;
    }
    setLocalRunModalOpen(true);
  }, [project]);

  const handleDownload = useCallback(async () => {
    if (project.appType === 'desktop') {
      const { downloadDesktopApp } = await import('./services/projectService');
      downloadDesktopApp(project.files, project.projectName);
    } else {
      downloadProjectAsZip(project.files, project.projectName);
    }
  }, [project.files, project.projectName, project.appType]);

  const handleDownloadExe = useCallback(async () => {
    if (project.appType === 'desktop') {
      const { createDesktopExe } = await import('./services/projectService');
      createDesktopExe(project.files, project.projectName);
    }
  }, [project.files, project.projectName, project.appType]);

  const handleProjectImport = useCallback((importedFiles: ProjectFile[]) => {
    const htmlFile = importedFiles.find(f => f.name.endsWith('index.html')) || importedFiles[0];
    setProject(p => ({
      ...p,
      files: importedFiles,
      chatMessages: [
        { role: 'assistant', content: INITIAL_CHAT_MESSAGE },
        { role: 'assistant', content: `Importei ${importedFiles.length} arquivos. O que você gostaria de construir ou modificar?` }
      ],
      activeFile: htmlFile?.name || null,
      projectName: 'ProjetoImportado',
      currentProjectId: null, // It's a new local project until saved
    }));

    setGithubModalOpen(false);
    setView('editor');
  }, [setProject]);



  const handleDeleteFile = useCallback((fileNameToDelete: string) => {
    setProject(p => {
      const updatedFiles = p.files.filter(f => f.name !== fileNameToDelete);
      let newActiveFile = p.activeFile;
      if (p.activeFile === fileNameToDelete) {
        if (updatedFiles.length > 0) {
          const closingFileIndex = p.files.findIndex(f => f.name === fileNameToDelete);
          const newActiveIndex = Math.max(0, closingFileIndex - 1);
          newActiveFile = updatedFiles[newActiveIndex]?.name || null;
        } else {
          newActiveFile = null;
        }
      }
      return { ...p, files: updatedFiles, activeFile: newActiveFile };
    });
  }, [setProject]);

  const handleRenameFile = useCallback((oldName: string, newName: string) => {
    if (project.files.some(f => f.name === newName)) {
      alert(`Um arquivo chamado "${newName}" já existe.`);
      return;
    }
    setProject(p => {
      const updatedFiles = p.files.map(f => f.name === oldName ? { ...f, name: newName } : f);
      const newActiveFile = p.activeFile === oldName ? newName : p.activeFile;
      return { ...p, files: updatedFiles, activeFile: newActiveFile };
    });
  }, [project, setProject]);

  const handleRestoreVersion = useCallback((version: any) => {
    setProject(p => ({
      ...p,
      files: version.files,
      chatMessages: version.chatHistory,
      envVars: version.envVars,
      activeFile: version.files.find(f => f.name.includes('html'))?.name || version.files[0]?.name || null
    }));
    alert(`Projeto restaurado para a versão de ${new Date(version.timestamp).toLocaleString('pt-BR')}`);
  }, [setProject]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { setSidebarOpen(false); setChatOpen(false); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate project size whenever files change
  useEffect(() => {
    const calculateProjectSize = async () => {
      const size = await getProjectSize(files);
      setProjectSize(size);
    };
    calculateProjectSize();
  }, [files]);



  const mainContent = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeScreen
          user={user}
          onLoginClick={() => setAuthModalOpen(true)}
          onPromptSubmit={(prompt: string, attachments: { data: string; mimeType: string }[], aiModel: string, appType: AppType, generationMode: GenerationMode) => {
            const model = AI_MODELS.find(m => m.id === aiModel) || { id: aiModel, name: aiModel, provider: AIProvider.Gemini };
            handleSendMessage(prompt, model.provider, model.id, AIMode.Chat, attachments, appType, generationMode);
          }}
          onShowPricing={() => setView('pricing')}
          onShowProjects={handleOpenProjects}
          onOpenGithubImport={() => setGithubModalOpen(true)}
          onFolderImport={handleProjectImport}
          onNewProject={handleNewProject}
          onLogout={handleLogout}
          isProUser={isProUser}
        />;
      case 'pricing':
        return <PricingPage onBack={() => setView(files.length > 0 ? 'editor' : 'welcome')} onNewProject={handleNewProject} />;
      case 'projects':
        return <ProjectsPage
          projects={savedProjects}
          onLoadProject={handleLoadProject}
          onDeleteProject={handleDeleteProject}
          onBack={() => setView(files.length > 0 ? 'editor' : 'welcome')}
          onNewProject={handleNewProject}
        />;
      case 'editor':
        return (
          <div className="flex flex-col h-screen bg-var-bg-default">
            <Header
              onToggleSidebar={() => setSidebarOpen(true)}
              onToggleChat={() => setChatOpen(true)}
              onToggleVersionModal={() => setVersionModalOpen(true)}
              projectName={projectName}
              user={user}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isProUser={isProUser}
            />
            <div className="flex flex-1 overflow-hidden relative">
              {isInitializing && <InitializingOverlay projectName={projectName} generatingFile={generatingFile} />}
              <div className="hidden lg:block w-[320px] flex-shrink-0">
                <Sidebar
                  files={files} envVars={envVars} onEnvVarChange={newVars => setProject(p => ({ ...p, envVars: newVars }))} activeFile={activeFile} onFileSelect={name => setProject(p => ({ ...p, activeFile: name }))} onDownload={handleDownload}
                  onOpenSettings={handleOpenSettings} onOpenGithubImport={() => setGithubModalOpen(true)}
                  onSaveProject={handleSaveProject} onOpenProjects={handleOpenProjects} onNewProject={handleNewProject}
                  onRenameFile={handleRenameFile} onDeleteFile={handleDeleteFile}
                  onOpenStripeModal={() => setStripeModalOpen(true)} onOpenNeonModal={() => setNeonModalOpen(true)} onOpenOSMModal={() => setOSMModalOpen(true)} onOpenGoogleCloudModal={() => setGoogleCloudModalOpen(true)} onOpenFirebaseFirestoreModal={() => setFirebaseFirestoreModalOpen(true)}
                  user={user} onLogin={() => setAuthModalOpen(true)} onLogout={handleLogout}
                  isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges}
                />
              </div>

              {isSidebarOpen && (
                <div className="absolute top-0 left-0 h-full w-full bg-black z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <div className="w-[320px] h-full bg-black shadow-2xl" onClick={e => e.stopPropagation()}>
                    <Sidebar
                      files={files} envVars={envVars} onEnvVarChange={newVars => setProject(p => ({ ...p, envVars: newVars }))} activeFile={activeFile} onFileSelect={(file) => { setProject(p => ({ ...p, activeFile: file })); setSidebarOpen(false); }}
                      onDownload={() => { handleDownload(); setSidebarOpen(false); }} onOpenSettings={() => { handleOpenSettings(); setSidebarOpen(false); }}
                      onOpenGithubImport={() => { setGithubModalOpen(true); setSidebarOpen(false); }}
                      onSaveProject={() => { handleSaveProject(); setSidebarOpen(false); }} onOpenProjects={() => { handleOpenProjects(); setSidebarOpen(false); }}
                      onNewProject={handleNewProject} onClose={() => setSidebarOpen(false)}
                      onRenameFile={handleRenameFile} onDeleteFile={handleDeleteFile}
                      onOpenStripeModal={() => { setStripeModalOpen(true); setSidebarOpen(false); }} onOpenNeonModal={() => { setNeonModalOpen(true); setSidebarOpen(false); }} onOpenOSMModal={() => { setOSMModalOpen(true); setSidebarOpen(false); }} onOpenGoogleCloudModal={() => { setGoogleCloudModalOpen(true); setSidebarOpen(false); }} onOpenFirebaseFirestoreModal={() => { setFirebaseFirestoreModalOpen(true); setSidebarOpen(false); }}
                      user={user} onLogin={() => { setAuthModalOpen(true); setSidebarOpen(false); }} onLogout={() => { handleLogout(); setSidebarOpen(false); }}
                      isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges}
                    />
                  </div>
                </div>
              )}

              <main className="flex-1 min-w-0">
                <EditorView
                  files={files} activeFile={activeFile} projectName={projectName} theme={theme} onThemeChange={setTheme}
                  onFileSelect={name => setProject(p => ({ ...p, activeFile: name }))} onFileDelete={handleDeleteFile} onRunLocally={handleRunLocally}
                  codeError={codeError} onFixCode={handleFixCode} onClearError={() => setCodeError(null)} onError={setCodeError} envVars={envVars}
                  initialPath={activeFile ? `/${activeFile}` : '/index.html'}
                  onNavigate={(path) => setProject(p => ({ ...p, activeFile: path.startsWith('/') ? path.substring(1) : path }))}
                  onToggleVersionModal={() => setVersionModalOpen(true)}
                />
              </main>

              <div className="hidden lg:block w-full max-w-sm xl:max-w-md flex-shrink-0">
                <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} isProUser={isProUser} selectedModel={selectedModel} />
              </div>

              {isChatOpen && (
                <div className="absolute top-0 right-0 h-full w-full bg-black z-20 lg:hidden" onClick={() => setChatOpen(false)}>
                  <div className="absolute right-0 w-full max-w-sm h-full bg-black shadow-2xl" onClick={e => e.stopPropagation()}>
                    <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} isProUser={isProUser} selectedModel={selectedModel} onClose={() => setChatOpen(false)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <WelcomeScreen
          user={user}
          onLoginClick={() => setAuthModalOpen(true)}
          onPromptSubmit={(prompt: string, attachments: { data: string; mimeType: string }[], aiModel: string, appType: AppType, generationMode: GenerationMode) => {
            const model = AI_MODELS.find(m => m.id === aiModel) || { id: aiModel, name: aiModel, provider: AIProvider.Gemini };
            handleSendMessage(prompt, model.provider, model.id, AIMode.Chat, attachments, appType, generationMode);
          }}
          onShowPricing={() => setView('pricing')}
          onShowProjects={handleOpenProjects}
          onOpenGithubImport={() => setGithubModalOpen(true)}
          onFolderImport={handleProjectImport}
          onNewProject={handleNewProject}
          onLogout={handleLogout}
          isProUser={isProUser}
        />;
    }
  };

  return (
    <div className={theme}>
      {mainContent()}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen && !!user}
        onClose={() => setSettingsOpen(false)}
        settings={userSettings || { id: user?.uid || '' }}
        onSave={handleSaveSettings}
      />
      <StripeModal
        isOpen={isStripeModalOpen && !!user}
        onClose={() => setStripeModalOpen(false)}
        settings={userSettings || { id: user?.uid || '' }}
        onSave={handleSaveSettings}
      />
      <NeonModal
        isOpen={isNeonModalOpen && !!user}
        onClose={() => setNeonModalOpen(false)}
        settings={userSettings || { id: user?.uid || '' }}
        onSave={handleSaveSettings}
      />
      <OpenStreetMapModal
        isOpen={isOSMModalOpen}
        onClose={() => setOSMModalOpen(false)}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => { setApiKeyModalOpen(false); setPendingPrompt(null); }}
        onSave={(key) => handleSaveSettings({ gemini_api_key: key })}
      />
      <OpenRouterKeyModal
        isOpen={isOpenRouterKeyModalOpen}
        onClose={() => { setOpenRouterKeyModalOpen(false); setPendingPrompt(null); }}
        onSave={(key) => handleSaveSettings({ openrouter_api_key: key })}
      />
      <GithubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onImport={handleProjectImport}
        githubToken={userSettings?.github_access_token}
        onOpenSettings={() => { setGithubModalOpen(false); handleOpenSettings(); }}
      />
      <PublishModal
        isOpen={isLocalRunModalOpen}
        onClose={() => setLocalRunModalOpen(false)}
        onDownload={handleDownload}
        onDownloadExe={project.appType === 'desktop' ? handleDownloadExe : undefined}
        projectName={projectName}
        projectSize={projectSize}
        appType={project.appType}
      />

      <GoogleCloudModal
        isOpen={isGoogleCloudModalOpen && !!user}
        onClose={() => setGoogleCloudModalOpen(false)}
        settings={userSettings || { id: user?.uid || '' }}
        onSave={(newSettings) => handleSaveSettings({ gcp_project_id: newSettings.gcp_project_id, gcp_credentials: newSettings.gcp_credentials })}
      />
      <FirebaseFirestoreModal
        isOpen={isFirebaseFirestoreModalOpen && !!user}
        onClose={() => setFirebaseFirestoreModalOpen(false)}
        settings={userSettings || { id: user?.uid || '' }}
        onSave={handleSaveSettings}
      />
      <VersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        projectName={projectName}
        currentFiles={files}
        currentChatHistory={chatMessages}
        currentEnvVars={envVars}
        onRestoreVersion={handleRestoreVersion}
      />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default App;
