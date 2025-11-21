import React, { useState, useEffect } from 'react';
import { ProjectVersion } from '../types';
import { ProjectVersionService } from '../services/projectVersionService';
import { CloseIcon, TrashIcon, SaveIcon, RefreshIcon } from './Icons';

// Adicionando o RestoreIcon que não existe no arquivo Icons
const RestoreIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg {...{ className, strokeWidth: 1.5, stroke: "currentColor", fill: "none", strokeLinecap: "round" as "round", strokeLinejoin: "round" as "round" }} viewBox="0 0 24 24">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  currentFiles: any[];
  currentChatHistory: any[];
  currentEnvVars: Record<string, string>;
  onRestoreVersion: (version: ProjectVersion) => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  projectName,
  currentFiles,
  currentChatHistory,
  currentEnvVars,
  onRestoreVersion
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && projectName) {
      loadVersions();
    }
  }, [isOpen, projectName]);

  const loadVersions = () => {
    const projectVersions = ProjectVersionService.getAllVersions(projectName);
    setVersions(projectVersions.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleSaveVersion = () => {
    if (!projectName) return;

    ProjectVersionService.saveVersion(
      projectName,
      currentFiles,
      currentChatHistory,
      currentEnvVars,
      description || undefined
    );

    setDescription('');
    loadVersions();
  };

  const handleRestoreVersion = (version: ProjectVersion) => {
    if (window.confirm(`Tem certeza que deseja restaurar para a versão "${ProjectVersionService.formatTimestamp(version.timestamp)}"?`)) {
      onRestoreVersion(version);
      onClose();
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta versão?')) {
      ProjectVersionService.deleteVersion(projectName, versionId);
      loadVersions();
      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#FFF8F0] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF8F0] border border-var-border-default rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-var-border-default">
          <h2 className="text-lg font-semibold text-var-fg-default">
            Histórico de Versões - {projectName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Save Current Version */}
        <div className="p-4 border-b border-var-border-default bg-var-bg-interactive">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Descrição da versão atual (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 p-2 bg-var-bg-default border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle text-sm focus:outline-none focus:ring-1 focus:ring-var-accent/50"
            />
            <button
              type="button"
              onClick={handleSaveVersion}
              className="px-4 py-2 bg-var-accent text-var-accent-fg rounded-md hover:bg-var-accent/90 transition-colors flex items-center gap-2"
            >
              <SaveIcon className="w-4 h-4" />
              Salvar Versão Atual
            </button>
          </div>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-var-fg-muted">
              <p>Nenhuma versão salva encontrada.</p>
              <p className="text-sm mt-2">Salve uma versão atual para começar a usar o histórico.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 border border-var-border-default rounded-lg transition-colors ${selectedVersion?.id === version.id
                      ? 'bg-var-accent/10 border-var-accent/30'
                      : 'bg-var-bg-default hover:bg-var-bg-interactive'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-var-fg-default">
                          {version.description}
                        </span>
                        <span className="text-xs text-var-fg-muted">
                          {ProjectVersionService.formatTimestamp(version.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-var-fg-muted space-x-4">
                        <span>{version.files.length} arquivos</span>
                        <span>{version.chatHistory.length} mensagens</span>
                        <span>{Object.keys(version.envVars).length} variáveis</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedVersion(version)}
                        className="p-1 rounded text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default"
                        title="Ver detalhes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(version)}
                        className="p-1 rounded text-var-fg-muted hover:bg-green-500/20 hover:text-green-400"
                        title="Restaurar versão"
                      >
                        <RestoreIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-1 rounded text-var-fg-muted hover:bg-red-500/20 hover:text-red-400"
                        title="Excluir versão"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Version Details */}
                  {selectedVersion?.id === version.id && (
                    <div className="mt-3 pt-3 border-t border-var-border-default">
                      <div className="text-sm text-var-fg-default">
                        <p className="font-medium mb-2">Arquivos na versão:</p>
                        <div className="max-h-32 overflow-y-auto bg-var-bg-subtle p-2 rounded">
                          {version.files.map((file) => (
                            <div key={file.name} className="text-xs text-var-fg-muted py-1">
                              {file.name} ({file.language})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-var-border-default flex justify-between items-center">
          <div className="text-xs text-var-fg-muted">
            {versions.length} versão(ões) salva(s) • Máximo de 20 versões
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-var-bg-interactive border border-var-border-default text-var-fg-default rounded-md hover:bg-var-bg-default transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
