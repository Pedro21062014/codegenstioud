import React, { useState, useRef, useEffect } from 'react';
import { TerminalIcon } from './TerminalIcon';

interface TerminalViewProps {
  onCommand?: (command: string) => void;
  height?: string;
}

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ 
  onCommand, 
  height = '200px' 
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Bem-vindo ao Terminal do CodeGen Studio' },
    { type: 'output', content: 'Digite "help" para ver os comandos disponíveis' }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    setHistory(prev => [...prev, { type: 'command', content: `$ ${command}` }]);
    
    // Process command
    const processedCommand = command.trim().toLowerCase();
    let output = '';

    switch (processedCommand) {
      case 'help':
        output = 'Comandos disponíveis:\n' +
                 '  help - Mostra esta ajuda\n' +
                 '  clear - Limpa o terminal\n' +
                 '  ls - Lista os arquivos do projeto\n' +
                 '  pwd - Mostra o diretório atual\n' +
                 '  echo [texto] - Exibe o texto\n' +
                 '  date - Mostra a data e hora atual\n' +
                 '  clear - Limpa o terminal';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'ls':
        output = 'index.html\n' +
                 'src/\n' +
                 '  components/\n' +
                 '    EditorView.tsx\n' +
                 '    CodePreview.tsx\n' +
                 '  styles/\n' +
                 '    main.css\n' +
                 'package.json\n' +
                 'README.md';
        break;
      case 'pwd':
        output = '/home/user/codegenstioud';
        break;
      case 'date':
        output = new Date().toString();
        break;
      default:
        if (processedCommand.startsWith('echo ')) {
          output = processedCommand.substring(5);
        } else {
          output = `Comando não encontrado: ${command}. Digite "help" para ver os comandos disponíveis.`;
        }
    }

    // Add output to history
    setHistory(prev => [...prev, { type: 'output', content: output }]);
    
    // Call callback if provided
    if (onCommand) {
      onCommand(command);
    }
    
    // Clear input
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : history.length - 1;
        setHistoryIndex(newIndex);
        const commandIndex = history.length - 1 - newIndex;
        setInput(history[commandIndex].type === 'command' 
          ? history[commandIndex].content.replace('$ ', '') 
          : '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commandIndex = history.length - 1 - newIndex;
        setInput(history[commandIndex].type === 'command' 
          ? history[commandIndex].content.replace('$ ', '') 
          : '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-var-fg-default font-mono';
      case 'output':
        return 'text-var-fg-muted font-mono';
      case 'error':
        return 'text-red-400 font-mono';
      default:
        return 'text-var-fg-default font-mono';
    }
  };

  return (
    <div className="bg-var-bg-subtle border border-var-border-default rounded-md overflow-hidden flex flex-col" style={{ height }}>
      {/* Terminal Header */}
      <div className="bg-var-bg-muted px-3 py-2 flex items-center gap-2 border-b border-var-border-default">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-2 text-xs text-var-fg-subtle">
          <TerminalIcon />
          <span>TERMINAL</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-grow p-3 font-mono text-sm overflow-y-auto bg-black/5"
        style={{ minHeight: '150px' }}
      >
        {history.map((line, index) => (
          <div key={index} className={getLineClass(line.type)}>
            {line.content}
          </div>
        ))}
        <div className="flex items-center gap-1 text-var-fg-default">
          <span>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none text-var-fg-default"
            placeholder="Digite um comando..."
            autoComplete="off"
            spellCheck="false"
          />
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
};
