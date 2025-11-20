import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ProjectFile, Theme } from '../types';
import { CodePreview } from './CodePreview';
import { TerminalView } from './TerminalView';
import { StatusBar } from './StatusBar';
import { CommandPalette, Command } from './CommandPalette';
import { getFileIcon } from './FileIconHelper';
import {
  CloseIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  TerminalIcon,
  KeyIcon,
  RefreshIcon,
  VersionIcon,
  MinimapIcon,
  WordWrapIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CommandIcon,
  CodeIcon
} from './Icons';

// Componente de carregamento para o Monaco Editor
const MonacoEditorLoader = ({
  language,
  value,
  theme,
  onChange,
  options
}: {
  language: string;
  value: string;
  theme: string;
  onChange: (value: string | undefined) => void;
  options: any;
}) => {
  const [MonacoEditor, setMonacoEditor] = React.useState<any>(null);

  React.useEffect(() => {
    import('@monaco-editor/react').then((module) => {
      setMonacoEditor(() => module.default);
    });
  }, []);

  if (!MonacoEditor) {
    return (
      <div className="flex items-center justify-center h-full bg-var-bg-subtle">
        <div className="animate-pulse text-var-fg-muted">Carregando editor...</div>
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={onChange}
      options={options}
    />
  );
};

interface EditorViewProps {
  files: ProjectFile[];
  activeFile: string | null;
  projectName: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onFileSelect: (fileName: string) => void;
  onFileDelete: (fileName: string) => void;
  onRunLocally: () => void;
  codeError: string | null;
  onFixCode: () => void;
  onClearError: () => void;
  onError: (errorMessage: string) => void;
  envVars: Record<string, string>;
  initialPath: string;
  onToggleVersionModal?: () => void;
}

const EditorHeader: React.FC<{
  projectName: string;
  onRunLocally: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onToggleVersionModal?: () => void;
}> = ({ projectName, onRunLocally, theme, onThemeChange, onToggleVersionModal }) => (
  <div className="flex items-center justify-between p-2 border-b border-var-border-default flex-shrink-0">
    <div className="flex items-center gap-2">
      <div className="text-sm text-var-fg-muted font-medium">{projectName}</div>
      {onToggleVersionModal && (
        <button
          onClick={onToggleVersionModal}
          className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
          aria-label="Ver histórico de versões"
          title="Histórico de versões"
        >
          <VersionIcon />
        </button>
      )}
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
        aria-label="Alternar tema"
        title="Alternar tema"
      >
        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>
      <button
        onClick={onRunLocally}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-var-accent text-var-accent-fg rounded-md hover:opacity-90 transition-opacity font-semibold"
        title="Executar localmente"
        aria-label="Executar localmente"
      >
        <TerminalIcon />
        <span>Executar Local</span>
      </button>
    </div>
  </div>
);

const Toast: React.FC<{ message: string; onFix: () => void; onClose: () => void }> = ({ message, onFix, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute bottom-4 right-4 z-50 w-full max-w-sm animate-slideInUp">
      <div className="bg-var-bg-subtle rounded-lg shadow-2xl border border-var-border-default overflow-hidden">
        <div className="p-4 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-var-fg-default">Erro na Visualização</p>
              <p className="text-sm text-var-fg-muted mt-1 break-words">{message}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={onFix}
                  className="px-3 py-1 text-xs font-semibold text-white bg-var-accent rounded hover:opacity-90 transition-all flex items-center gap-1.5"
                  title="Corrigir erro com IA"
                  aria-label="Corrigir erro com IA"
                >
                  <SparklesIcon /> Corrigir com IA
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-var-bg-interactive text-var-fg-subtle hover:text-var-fg-default flex-shrink-0" title="Fechar notificação" aria-label="Fechar notificação">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BrowserFrameProps {
  children: React.ReactNode;
  url: string;
  onUrlChange: (newUrl: string) => void;
  onRefresh: () => void;
}

const BrowserFrame: React.FC<BrowserFrameProps> = ({ children, url, onUrlChange, onRefresh }) => {
  const [inputValue, setInputValue] = useState(url);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onUrlChange(inputValue);
    }
  };

  return (
    <div className="w-full h-full bg-var-bg-subtle flex flex-col">
      <div className="flex-shrink-0 bg-var-bg-muted border-b border-var-border-default p-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center flex-grow bg-var-bg-default rounded-md px-2 py-1 ml-2">
          <KeyIcon className="w-4 h-4 text-var-fg-subtle mr-2" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm text-var-fg-default bg-transparent w-full focus:outline-none"
            placeholder="Digite a URL..."
            title="URL da página"
            aria-label="URL da página"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive"
          title="Atualizar página"
          aria-label="Atualizar página"
        >
          <RefreshIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-grow overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const EditorView: React.FC<EditorViewProps> = ({ files, activeFile, projectName, theme, onThemeChange, onFileSelect, onFileDelete, onRunLocally, codeError, onFixCode, onClearError, onError, envVars, onToggleVersionModal }) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'terminal'>('code');
  const [previewUrl, setPreviewUrl] = useState('/');
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [terminalHeight, setTerminalHeight] = useState('200px');
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [editorOptions, setEditorOptions] = useState({
    minimap: false,
    wordWrap: 'on' as 'on' | 'off',
    fontSize: 14
  });
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const selectedFile = files.find(f => f.name === activeFile);

  const handleDeleteFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza de que deseja excluir "${fileName}" do projeto?`)) {
      onFileDelete(fileName);
    }
  };

  const handleRefresh = () => {
    setPreviewKey(Date.now());
  }

  const handleTerminalCommand = (command: string) => {
    console.log('Terminal command executed:', command);
  };

  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'mjs':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'jsx':
        return 'javascript';
      case 'tsx':
        return 'typescriptreact';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'c++':
        return 'cpp';
      case 'c':
        return 'c';
      case 'cs':
        return 'csharp';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'swift':
        return 'swift';
      case 'kt':
      case 'kts':
        return 'kotlin';
      case 'scala':
        return 'scala';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'sql':
        return 'sql';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !activeFile) return;

    // Atualizar o conteúdo do arquivo no estado global
    // Isso precisará ser implementado no componente pai
    console.log('File content changed:', activeFile, value);
  };

  return (
    <div className="flex flex-col h-full bg-var-bg-subtle">
      <EditorHeader
        projectName={projectName}
        onRunLocally={onRunLocally}
        theme={theme}
        onThemeChange={onThemeChange}
        onToggleVersionModal={onToggleVersionModal}
      />

      <div className="flex items-center justify-between border-b border-var-border-default bg-var-bg-muted flex-shrink-0">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
          <div className="flex">
            {files.map(file => (
              <button
                key={file.name}
                onClick={() => onFileSelect(file.name)}
                className={`group flex items-center gap-2 px-4 py-2.5 text-sm border-r border-var-border-default relative transition-all duration-200 ${activeFile === file.name ? 'text-var-fg-default bg-var-bg-subtle' : 'text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default'
                  }`}
                title={`Arquivo: ${file.name}`}
                aria-label={`Arquivo: ${file.name}`}
              >
                {getFileIcon(file.name, "w-4 h-4 flex-shrink-0")}
                <span className="truncate max-w-xs">{file.name}</span>
                <span
                  onClick={(e) => handleDeleteFile(e, file.name)}
                  className="ml-2 p-1 rounded-full hover:bg-var-bg-interactive opacity-0 group-hover:opacity-100 transition-opacity"
                  title={`Excluir arquivo ${file.name}`}
                  aria-label={`Excluir arquivo ${file.name}`}
                >
                  <CloseIcon className="w-3 h-3" />
                </span>
                {activeFile === file.name && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-var-accent"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Controls - Only show in code mode */}
        {viewMode === 'code' && selectedFile && (
          <div className="flex items-center gap-1 px-2">
            <button
              onClick={() => setEditorOptions(prev => ({ ...prev, minimap: !prev.minimap }))}
              className={`p-1.5 rounded-md transition-colors ${editorOptions.minimap ? 'bg-var-accent/20 text-var-accent' : 'text-var-fg-muted hover:bg-var-bg-interactive'}`}
              title={editorOptions.minimap ? "Ocultar minimap" : "Mostrar minimap"}
              aria-label={editorOptions.minimap ? "Ocultar minimap" : "Mostrar minimap"}
            >
              <MinimapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditorOptions(prev => ({ ...prev, wordWrap: prev.wordWrap === 'on' ? 'off' : 'on' }))}
              className={`p-1.5 rounded-md transition-colors ${editorOptions.wordWrap === 'on' ? 'bg-var-accent/20 text-var-accent' : 'text-var-fg-muted hover:bg-var-bg-interactive'}`}
              title={editorOptions.wordWrap === 'on' ? "Desativar quebra de linha" : "Ativar quebra de linha"}
              aria-label={editorOptions.wordWrap === 'on' ? "Desativar quebra de linha" : "Ativar quebra de linha"}
            >
              <WordWrapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditorOptions(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 1) }))}
              className="p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive transition-colors"
              title="Diminuir fonte"
              aria-label="Diminuir fonte"
            >
              <ZoomOutIcon className="w-4 h-4" />
            </button>
            <span className="text-xs text-var-fg-muted px-1 min-w-[2rem] text-center">{editorOptions.fontSize}px</span>
            <button
              onClick={() => setEditorOptions(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 1) }))}
              className="p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive transition-colors"
              title="Aumentar fonte"
              aria-label="Aumentar fonte"
            >
              <ZoomInIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-var-border-default mx-1"></div>
            <button
              onClick={() => setShowCommandPalette(true)}
              className="p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive transition-colors"
              title="Paleta de comandos (Ctrl+Shift+P)"
              aria-label="Paleta de comandos"
            >
              <CommandIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-1 bg-var-bg-default rounded-md m-2 flex-shrink-0">
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'code' ? 'bg-var-accent text-var-accent-fg' : 'text-var-fg-muted hover:bg-var-bg-interactive'}`}
            title="Visualizar código"
            aria-label="Visualizar código"
          >
            Código
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'preview' ? 'bg-var-accent text-var-accent-fg' : 'text-var-fg-muted hover:bg-var-bg-interactive'}`}
            title="Visualizar prévia"
            aria-label="Visualizar prévia"
          >
            Visualização
          </button>
          <button
            onClick={() => {
              setIsTerminalVisible(!isTerminalVisible);
              setViewMode('terminal');
            }}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'terminal' ? 'bg-var-accent text-var-accent-fg' : 'text-var-fg-muted hover:bg-var-bg-interactive'}`}
            title="Abrir terminal"
            aria-label="Abrir terminal"
          >
            Terminal
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-var-bg-subtle relative">
        {viewMode === 'code' && selectedFile && (
          <div className="flex-grow">
            <MonacoEditorLoader
              language={getLanguageFromFileName(selectedFile.name)}
              value={selectedFile.content}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: editorOptions.minimap },
                fontSize: editorOptions.fontSize,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: editorOptions.wordWrap,
                tabSize: 2,
                insertSpaces: true,
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                bracketPairColorization: {
                  enabled: true
                },
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                }
              }}
            />
          </div>
        )}

        {viewMode === 'code' && !selectedFile && (
          <div className="flex items-center justify-center h-full text-var-fg-muted">
            Selecione um arquivo para editar seu conteúdo.
          </div>
        )}

        {viewMode === 'preview' && (
          <BrowserFrame url={previewUrl} onUrlChange={setPreviewUrl} onRefresh={handleRefresh}>
            <CodePreview key={previewKey} files={files} onError={onError} theme={theme} envVars={envVars} initialPath={previewUrl} onNavigate={(path) => {
              setPreviewUrl(path);
              // Update the active file if navigating to an HTML file
              const fileName = path.startsWith('/') ? path.substring(1) : path;
              const htmlFile = files.find(f => f.name === fileName);
              if (htmlFile) {
                onFileSelect(fileName);
              }
            }} />
          </BrowserFrame>
        )}

        {viewMode === 'terminal' && (
          <TerminalView
            onCommand={handleTerminalCommand}
            height={terminalHeight}
          />
        )}

        {codeError && <Toast message={codeError} onFix={onFixCode} onClose={onClearError} />}
      </div>

      {/* Status Bar */}
      <StatusBar
        activeFile={selectedFile || null}
        cursorPosition={cursorPosition}
        totalFiles={files.length}
        projectSize={`${files.length} arquivo${files.length !== 1 ? 's' : ''}`}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={[
          {
            id: 'toggle-theme',
            label: 'Alternar Tema',
            description: 'Alternar entre tema claro e escuro',
            icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />,
            action: () => onThemeChange(theme === 'dark' ? 'light' : 'dark'),
            category: 'Visualização'
          },
          {
            id: 'toggle-minimap',
            label: editorOptions.minimap ? 'Ocultar Minimap' : 'Mostrar Minimap',
            description: 'Alternar visualização do minimap no editor',
            icon: <MinimapIcon />,
            action: () => setEditorOptions(prev => ({ ...prev, minimap: !prev.minimap })),
            category: 'Editor'
          },
          {
            id: 'toggle-wordwrap',
            label: editorOptions.wordWrap === 'on' ? 'Desativar Quebra de Linha' : 'Ativar Quebra de Linha',
            description: 'Alternar quebra automática de linha',
            icon: <WordWrapIcon />,
            action: () => setEditorOptions(prev => ({ ...prev, wordWrap: prev.wordWrap === 'on' ? 'off' : 'on' })),
            category: 'Editor'
          },
          {
            id: 'view-code',
            label: 'Visualizar Código',
            description: 'Alternar para visualização de código',
            icon: <CodeIcon />,
            shortcut: 'Ctrl+1',
            action: () => setViewMode('code'),
            category: 'Visualização'
          },
          {
            id: 'view-preview',
            label: 'Visualizar Preview',
            description: 'Alternar para visualização de preview',
            icon: <RefreshIcon />,
            shortcut: 'Ctrl+2',
            action: () => setViewMode('preview'),
            category: 'Visualização'
          },
          {
            id: 'view-terminal',
            label: 'Abrir Terminal',
            description: 'Alternar para visualização do terminal',
            icon: <TerminalIcon />,
            shortcut: 'Ctrl+`',
            action: () => { setViewMode('terminal'); setIsTerminalVisible(true); },
            category: 'Visualização'
          },
          {
            id: 'run-locally',
            label: 'Executar Localmente',
            description: 'Executar o projeto localmente',
            icon: <TerminalIcon />,
            shortcut: 'Ctrl+R',
            action: onRunLocally,
            category: 'Execução'
          }
        ]}
      />
    </div>
  );
};
