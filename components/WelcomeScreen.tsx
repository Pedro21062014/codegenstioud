import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, AppLogo, GithubIcon, LinkedInIcon, FolderIcon, LogOutIcon, CodeIcon, SendIcon } from './Icons';
import type { Session } from '@supabase/supabase-js';
import { ProjectFile, AIProvider, AIModel, AIMode, AppType, GenerationMode } from '../types';
import { AI_MODELS } from '../constants';
import geminiImage from '../components/models image/gemini.png'; // Import the image
import openrouterImage from '../components/models image/openrouter.png'; // Import the image

// Define application types
const APP_TYPES: { id: AppType; name: string }[] = [
    { id: 'auto', name: 'Auto (IA escolhe)' },
    { id: 'react-vite', name: 'React (Vite)' },
    { id: 'html-css-js', name: 'HTML/CSS/JS Puro' },
    { id: 'angular', name: 'Angular' },
    { id: 'nextjs', name: 'Next.js' },
    { id: 'chrome-extension', name: 'Extensão para Chrome' },
    { id: 'vscode-extension', name: 'Extensão para VS Code' },
    { id: 'desktop', name: 'Aplicativo para Computador' },
];

interface WelcomeScreenProps {
    onPromptSubmit: (prompt: string, attachments: { data: string; mimeType: string }[], aiModel: string, appType: AppType, generationMode: GenerationMode) => void;
    onShowPricing: () => void;
    onShowProjects: () => void;
    onOpenGithubImport: () => void;
    onFolderImport: (files: ProjectFile[]) => void;
    session: Session | null;
    onLoginClick: () => void;
    onNewProject: () => void;
    onLogout: () => void;
    isProUser: boolean;
}

const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js': return 'javascript';
        case 'ts': return 'typescript';
        case 'tsx': return 'typescript';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'json': return 'json';
        case 'md': return 'markdown';
        case 'py': return 'python';
        case 'rb': return 'ruby';
        case 'go': return 'go';
        case 'rs': return 'rust';
        case 'java': return 'java';
        case 'cs': return 'csharp';
        case 'php': return 'php';
        case 'sh': return 'shell';
        case 'yml':
        case 'yaml': return 'yaml';
        case 'dockerfile': return 'dockerfile';
        case 'sql': return 'sql';
        case 'graphql': return 'graphql';
        case 'vue': return 'vue';
        case 'svelte': return 'svelte';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
            return 'image';
        default: return 'plaintext';
    }
}

// FIX: Updated component to accept all standard anchor tag props except `className`, allowing `target` to be used.
const NavLink: React.FC<Omit<React.ComponentProps<'a'>, 'className'>> = ({ children, ...props }) => (
    <a {...props} className="text-sm font-medium text-var-fg-muted hover:text-var-fg-default transition-colors cursor-pointer">
        {children}
    </a>
);

const examplePrompts = [
    "um clone do Trello com autenticação Supabase...",
    "um site de portfólio para um fotógrafo...",
    "um app de lista de tarefas com React e Tailwind CSS...",
    "uma landing page para um app de delivery...",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptSubmit, onShowPricing, onShowProjects, onOpenGithubImport, onFolderImport, session, onLoginClick, onNewProject, onLogout, isProUser }) => {
    const [prompt, setPrompt] = useState('');
    const [placeholder, setPlaceholder] = useState('');

    const promptIndex = useRef(0);
    const charIndex = useRef(0);
    const isDeleting = useRef(false);
    const timeoutRef = useRef<number | null>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showAppTypeDropdown, setShowAppTypeDropdown] = useState(false);
    const [showGenerationModeDropdown, setShowGenerationModeDropdown] = useState(false);

    const allowedNonProModels = [
        'gemini-2.0-flash',
        'gemini-2.5-flash',
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

    const [selectedModelId, setSelectedModelId] = useState<string>(filteredModels[0]?.id || '');
    const [selectedAppType, setSelectedAppType] = useState<AppType>(APP_TYPES[0].id);
    const [selectedGenerationMode, setSelectedGenerationMode] = useState<GenerationMode>('full');

    useEffect(() => {
        if (!filteredModels.some(model => model.id === selectedModelId)) {
            setSelectedModelId(filteredModels[0]?.id || '');
        }
    }, [isProUser, filteredModels, selectedModelId]);

    const handleModelSelect = (modelId: string) => {
        setSelectedModelId(modelId);
        setShowModelDropdown(false);
    };

    const handleAppTypeSelect = (appType: AppType) => {
        setSelectedAppType(appType);
        setShowAppTypeDropdown(false);
    };

    const handleGenerationModeSelect = (mode: GenerationMode) => {
        setSelectedGenerationMode(mode);
        setShowGenerationModeDropdown(false);
    };

    const showGeminiImage = !isProUser && (selectedModelId === 'gemini-2.0-flash' || selectedModelId === 'gemini-2.5-flash' || selectedModelId === 'openrouter/google/gemini-pro-1.5');
    const showOpenRouterImage = filteredModels.find(m => m.id === selectedModelId)?.provider === AIProvider.OpenRouter;

    useEffect(() => {
        const type = () => {
            const currentPrompt = examplePrompts[promptIndex.current];
            let newPlaceholder = '';
            let nextTimeout = 120; // Default typing speed

            if (isDeleting.current) {
                // Deleting
                newPlaceholder = currentPrompt.substring(0, charIndex.current - 1);
                charIndex.current--;
                nextTimeout = 75; // Faster deleting speed

                if (charIndex.current === 0) {
                    isDeleting.current = false;
                    promptIndex.current = (promptIndex.current + 1) % examplePrompts.length;
                    nextTimeout = 500; // Pause before typing next prompt
                }
            } else {
                // Typing
                newPlaceholder = currentPrompt.substring(0, charIndex.current + 1);
                charIndex.current++;

                if (charIndex.current === currentPrompt.length) {
                    isDeleting.current = true;
                    nextTimeout = 2000; // Pause after typing is complete
                }
            }

            setPlaceholder(newPlaceholder);
            timeoutRef.current = window.setTimeout(type, nextTimeout);
        };

        timeoutRef.current = window.setTimeout(type, 100);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (prompt.trim()) {
                onPromptSubmit(prompt.trim(), [], selectedModelId, selectedAppType, selectedGenerationMode);
            }
        }
    };

    const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        // FIX: Explicitly type `file` as `File` to resolve errors where its properties were being accessed on an `unknown` type.
        const filePromises = Array.from(selectedFiles).map((file: File) => {
            return new Promise<ProjectFile | null>((resolve, reject) => {
                const reader = new FileReader();
                const isImage = file.type.startsWith('image/');

                if (file.size > 2 * 1024 * 1024) { // 2MB limit per file
                    console.warn(`Skipping file ${file.name} as it is too large.`);
                    resolve(null);
                    return;
                }

                reader.onload = () => {
                    try {
                        let content: string;
                        if (isImage) {
                            const dataUrl = reader.result as string;
                            content = dataUrl.substring(dataUrl.indexOf(',') + 1);
                        } else {
                            content = reader.result as string;
                        }

                        resolve({
                            // FIX: Cast `file` to `any` to access non-standard `webkitRelativePath` property.
                            name: (file as any).webkitRelativePath,
                            language: getFileLanguage(file.name),
                            content: content,
                        });
                    } catch (e) {
                        reject(e);
                    }
                };

                reader.onerror = reject;

                if (isImage) {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsText(file);
                }
            });
        });

        try {
            const results = await Promise.all(filePromises);
            const projectFiles = results.filter((f): f is ProjectFile => f !== null);
            if (projectFiles.length > 0) {
                onFolderImport(projectFiles);
            } else {
                alert("Nenhum arquivo válido foi encontrado na pasta selecionada ou os arquivos eram muito grandes.");
            }
        } catch (error) {
            console.error("Failed to import folder:", error);
            alert("Ocorreu um erro ao importar a pasta. Verifique o console para mais detalhes.");
        } finally {
            if (folderInputRef.current) {
                folderInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-var-bg-default text-var-fg-default overflow-hidden font-sans">
            <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-var-bg-default/80 backdrop-blur-sm border-b border-var-border-subtle">
                <div className="container mx-auto flex justify-between items-center">
                    <button onClick={onNewProject} className="flex items-center gap-2">
                        <AppLogo className="w-6 h-6 text-var-accent" />
                        <span className="text-var-fg-default font-semibold text-lg">codagem<span className="font-light">studio</span></span>
                    </button>
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink onClick={(e) => { e.preventDefault(); onShowProjects(); }}>Projetos</NavLink>
                        <NavLink onClick={(e) => { e.preventDefault(); onShowPricing(); }}>Preços</NavLink>
                        <NavLink href="https://www.linkedin.com/in/pedro-berbis-freire-3b71bb37a/" target="_blank">LinkedIn</NavLink>
                        {session ? (
                            <button onClick={onLogout} className="px-3 py-1.5 text-sm bg-var-bg-interactive text-var-fg-muted rounded-md hover:bg-var-bg-default transition-colors font-medium">
                                Sair
                            </button>
                        ) : (
                            <button onClick={onLoginClick} className="px-3 py-1.5 text-sm bg-var-accent text-var-accent-fg rounded-md hover:opacity-90 transition-opacity font-semibold">
                                Login
                            </button>
                        )}
                    </nav>
                    <div className="flex items-center gap-4 md:hidden">
                        {!session ? (
                            <button onClick={onLoginClick} className="px-3 py-1.5 text-sm bg-var-accent text-var-accent-fg rounded-md hover:opacity-90 transition-opacity font-semibold">
                                Login
                            </button>
                        ) : (
                            <>
                                <a href="https://www.linkedin.com/in/pedro-berbis-freire-3b71bb37a/" target="_blank" rel="noopener noreferrer" className="text-var-fg-muted hover:text-var-fg-default transition-colors" title="LinkedIn">
                                    <span className="sr-only">LinkedIn</span>
                                    <LinkedInIcon />
                                </a>
                                <button onClick={onLogout} className="p-1 rounded-md text-var-fg-muted hover:text-var-fg-default transition-colors" title="Sair" aria-label="Sair">
                                    <span className="sr-only">Sair</span>
                                    <LogOutIcon />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-0 animate-fadeIn">
                {/* Enhanced background with multiple gradient orbs */}
                <div className="absolute inset-0 z-[-1] overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] -translate-x-1/2 -translate-y-1/2 bg-var-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] translate-x-1/2 translate-y-1/2 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-3xl w-full animate-slideInUp" style={{ animationDelay: '100ms' }}>
                    {/* Enhanced title with gradient text */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-var-accent via-blue-500 to-purple-500 bg-clip-text text-transparent animate-float">
                        Bem-vindo
                    </h1>
                    <p className="mt-6 text-xl md:text-2xl text-var-fg-muted font-medium">
                        Crie seu novo projeto com IA 🚀
                    </p>

                    {/* Enhanced prompt input area */}
                    <div className="relative mt-10 group">
                        {/* Animated gradient border */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-var-accent via-blue-500 to-purple-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse" style={{ animationDuration: '3s' }}></div>

                        {/* Main textarea container */}
                        <div className="relative bg-var-bg-subtle border-2 border-var-border-default rounded-3xl overflow-hidden backdrop-blur-sm">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                title="Digite seu prompt aqui"
                                className="relative w-full h-32 p-5 bg-transparent resize-none focus:outline-none text-var-fg-default placeholder-var-fg-subtle text-lg"
                            />

                            {/* Bottom toolbar */}
                            <div className="relative border-t border-var-border-subtle bg-var-bg-muted/50 backdrop-blur-sm p-3">
                                <div className="flex items-center justify-between gap-2">
                                    {/* Left side buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="p-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-xl text-var-fg-muted hover:text-var-accent hover:bg-var-accent/10 hover:border-var-accent/50 transition-all hover-lift" title="Gerar código" aria-label="Gerar código">
                                            <span className="sr-only">Gerar código</span>
                                            <span aria-hidden="true"><CodeIcon /></span>
                                        </button>
                                        <input type="file" ref={folderInputRef} onChange={handleFolderSelect} multiple directory="" webkitdirectory="" style={{ display: 'none' }} title="Selecionar pasta" aria-label="Selecionar pasta" />
                                        <button onClick={() => folderInputRef.current?.click()} className="p-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-xl text-var-fg-muted hover:text-var-accent hover:bg-var-accent/10 hover:border-var-accent/50 transition-all hover-lift font-bold text-lg" title="Carregar arquivos" aria-label="Carregar arquivos">
                                            <span className="sr-only">Carregar arquivos</span>
                                            <span aria-hidden="true">+</span>
                                        </button>

                                        {/* Model selector */}
                                        <div className="relative">
                                            <button onClick={() => setShowModelDropdown(!showModelDropdown)} className="px-4 py-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-xl text-var-fg-default hover:bg-var-accent/10 hover:border-var-accent/50 transition-all flex items-center gap-2 font-medium hover-lift" title="Selecionar modelo de IA">
                                                {showGeminiImage && <img src={geminiImage} alt="Gemini" className="w-5 h-5 dark:invert-0 light:invert-1" />}
                                                {showOpenRouterImage && <img src={openrouterImage} alt="OpenRouter" className="w-5 h-5 dark:invert-0 light:invert-1" />}
                                                <span className="text-sm">{filteredModels.find(m => m.id === selectedModelId)?.name || "Modelo"}</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {showModelDropdown && (
                                                <div className="absolute left-0 bottom-[60px] w-64 bg-black border-2 border-var-border-default rounded-2xl shadow-2xl p-2 z-50">
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {filteredModels.map((model) => (
                                                            <button
                                                                key={model.id}
                                                                onClick={() => handleModelSelect(model.id)}
                                                                className={`flex items-center w-full px-4 py-3 text-sm text-var-fg-default hover:bg-var-accent/10 rounded-xl gap-3 transition-all hover-lift ${selectedModelId === model.id ? 'bg-var-accent/20 border border-var-accent/50' : ''}`}
                                                                title={model.name}
                                                            >
                                                                {!isProUser && (model.id === 'gemini-2.0-flash' || model.id === 'gemini-2.5-flash' || model.id === 'openrouter/google/gemini-pro-1.5') && <img src={geminiImage} alt="Gemini" className="w-5 h-5 dark:invert-0 light:invert-1" />}
                                                                {model.provider === AIProvider.OpenRouter && <img src={openrouterImage} alt="OpenRouter" className="w-5 h-5 dark:invert-0 light:invert-1" />}
                                                                <span className="font-medium">{model.name}</span>
                                                                {selectedModelId === model.id && (
                                                                    <svg className="w-4 h-4 ml-auto text-var-accent" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* App type selector */}
                                        <div className="relative">
                                            <button onClick={() => setShowAppTypeDropdown(!showAppTypeDropdown)} className="px-4 py-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-xl text-var-fg-default hover:bg-var-accent/10 hover:border-var-accent/50 transition-all flex items-center gap-2 font-medium hover-lift" title="Selecionar tipo de aplicativo">
                                                <span className="text-sm">{APP_TYPES.find(type => type.id === selectedAppType)?.name || "Tipo de App"}</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {showAppTypeDropdown && (
                                                <div className="absolute left-0 bottom-[60px] w-56 bg-black border-2 border-var-border-default rounded-2xl shadow-2xl p-2 z-50">
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {APP_TYPES.map((type) => (
                                                            <button
                                                                key={type.id}
                                                                onClick={() => handleAppTypeSelect(type.id)}
                                                                className={`flex items-center w-full px-4 py-3 text-sm text-var-fg-default hover:bg-var-accent/10 rounded-xl transition-all hover-lift ${selectedAppType === type.id ? 'bg-var-accent/20 border border-var-accent/50' : ''}`}
                                                                title={type.name}
                                                            >
                                                                <span className="font-medium">{type.name}</span>
                                                                {selectedAppType === type.id && (
                                                                    <svg className="w-4 h-4 ml-auto text-var-accent" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Generation mode selector */}
                                        <div className="relative">
                                            <button onClick={() => setShowGenerationModeDropdown(!showGenerationModeDropdown)} className="px-4 py-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-xl text-var-fg-default hover:bg-var-accent/10 hover:border-var-accent/50 transition-all flex items-center gap-2 font-medium hover-lift" title="Selecionar modo de geração">
                                                <span className="text-sm">{selectedGenerationMode === 'full' ? 'Completo' : 'Rápido'}</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {showGenerationModeDropdown && (
                                                <div className="absolute left-0 bottom-[60px] w-48 bg-black border-2 border-var-border-default rounded-2xl shadow-2xl p-2 z-50">
                                                    <button
                                                        onClick={() => handleGenerationModeSelect('full')}
                                                        className={`flex items-center w-full px-4 py-3 text-sm text-var-fg-default hover:bg-var-accent/10 rounded-xl transition-all hover-lift ${selectedGenerationMode === 'full' ? 'bg-var-accent/20 border border-var-accent/50' : ''}`}
                                                        title="Gerar aplicativo completo"
                                                    >
                                                        <span className="font-medium">Completo</span>
                                                        {selectedGenerationMode === 'full' && (
                                                            <svg className="w-4 h-4 ml-auto text-var-accent" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleGenerationModeSelect('quick')}
                                                        className={`flex items-center w-full px-4 py-3 text-sm text-var-fg-default hover:bg-var-accent/10 rounded-xl transition-all hover-lift ${selectedGenerationMode === 'quick' ? 'bg-var-accent/20 border border-var-accent/50' : ''}`}
                                                        title="Gerar aplicativo no modo rápido"
                                                    >
                                                        <span className="font-medium">Rápido</span>
                                                        {selectedGenerationMode === 'quick' && (
                                                            <svg className="w-4 h-4 ml-auto text-var-accent" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Send button */}
                                    <button
                                        onClick={() => onPromptSubmit(prompt.trim(), [], selectedModelId, selectedAppType, selectedGenerationMode)}
                                        disabled={!prompt.trim()}
                                        className="flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-var-accent to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-var-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover-lift group"
                                        aria-label="Enviar prompt"
                                        title="Enviar prompt"
                                    >
                                        <SendIcon className="mr-2" />
                                        <span>Criar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced import options */}
                    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                        <span className="text-var-fg-muted font-medium">ou importe de</span>
                        <button onClick={onOpenGithubImport} className="flex items-center gap-2 px-5 py-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-full hover:bg-var-accent/10 hover:border-var-accent/50 transition-all text-var-fg-default hover-lift group" title="Importar do GitHub">
                            <GithubIcon className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium">GitHub</span>
                        </button>
                        <button onClick={() => folderInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-var-bg-interactive/80 border border-var-border-default rounded-full hover:bg-var-accent/10 hover:border-var-accent/50 transition-all text-var-fg-default hover-lift group" title="Importar de pasta local">
                            <FolderIcon className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Pasta Local</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
