import React from 'react';
import { CloseIcon, DownloadIcon, TerminalIcon } from './Icons';

interface LocalRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  projectName: string;
  projectSize: number;
}

export const PublishModal: React.FC<LocalRunModalProps> = ({ isOpen, onClose, onDownload, projectName, projectSize }) => {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLargeProject = projectSize > 50 * 1024 * 1024; // 50 MB
  const formattedSize = formatFileSize(projectSize);

  const handleDownloadAndClose = () => {
    onDownload();
    onClose();
  };

  const handleSaveLocallyAndClose = () => {
    onDownload();
    onClose();
  };

  return (
     <div 
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-var-bg-subtle rounded-lg shadow-xl w-full max-w-lg p-6 border border-var-border-default animate-slideInUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-var-fg-default flex items-center gap-2">
            <TerminalIcon /> Executar Projeto Localmente
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive">
            <CloseIcon />
          </button>
        </div>
        
        <div className="text-var-fg-muted space-y-4 text-sm">
          <p>
            Para visualizar seu projeto em um ambiente de desenvolvimento local, siga estas etapas:
          </p>
          <ol className="list-decimal list-inside space-y-3 bg-var-bg-interactive p-4 rounded-lg border border-var-border-default">
            <li>
              <strong>Baixe o projeto:</strong> Clique no botão abaixo para baixar os arquivos do projeto como um arquivo ZIP.
              <div className="mt-3 p-3 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-var-fg-default">Tamanho do projeto:</span>
                  <span className={`text-sm font-bold ${isLargeProject ? 'text-orange-400' : 'text-var-fg-default'}`}>
                    {formattedSize}
                  </span>
                </div>
                {isLargeProject && (
                  <div className="mb-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-md">
                    <p className="text-xs text-orange-400">
                      <strong>Atenção:</strong> Este projeto é grande (>50MB). Será salvo localmente para melhor performance.
                    </p>
                  </div>
                )}
                <button
                  onClick={isLargeProject ? handleSaveLocallyAndClose : handleDownloadAndClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-var-accent-fg bg-var-accent hover:opacity-90 transition-opacity"
                >
                  <DownloadIcon /> {isLargeProject ? `Salvar ${projectName}.zip localmente` : `Baixar ${projectName}.zip`}
                </button>
              </div>
            </li>
            <li>
              <strong>Descompacte o arquivo:</strong> Extraia o conteúdo do arquivo ZIP para uma pasta em seu computador.
            </li>
            <li>
              <strong>Abra o terminal:</strong> Navegue até a pasta do projeto descompactado usando seu terminal ou prompt de comando.
            </li>
            <li>
              <strong>Inicie um servidor local:</strong> Se você tiver o Node.js instalado, o comando mais fácil é:
              <pre className="bg-var-bg-muted p-2 rounded-md mt-1 text-xs font-mono"><code>npx serve</code></pre>
              <p className="text-xs text-var-fg-subtle mt-1">Se você não tem o `serve`, pode instalá-lo com `npm install -g serve` ou usar outro servidor local como o `Live Server` do VS Code.</p>
            </li>
            <li>
              <strong>Visualize no navegador:</strong> Abra seu navegador e acesse o endereço fornecido pelo servidor, geralmente{' '}
              <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-var-accent hover:underline">http://localhost:3000</a>.
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
};
