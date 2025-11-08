
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import { UserSettings } from '../types';

interface GoogleCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: Partial<Omit<UserSettings, 'id' | 'updated_at'>>) => void;
}

export const GoogleCloudModal: React.FC<GoogleCloudModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [projectId, setProjectId] = useState('');
  const [serviceAccountKey, setServiceAccountKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectId(settings.gcp_project_id || '');
      setServiceAccountKey(settings.gcp_credentials || '');
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave({
      gcp_project_id: projectId,
      gcp_credentials: serviceAccountKey
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

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
          <h2 className="text-xl font-semibold text-var-fg-default">Gerenciar Integração Google Cloud</h2>
          <button onClick={onClose} className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive" aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>
        
        <p className="text-var-fg-muted text-sm mb-4">
          Conecte seu projeto Google Cloud para habilitar poderosos serviços de backend. Você pode encontrar essas informações no console do GCP.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-var-fg-default mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="my-gcp-project-12345"
              className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-var-fg-default mb-1">Service Account Key (JSON)</label>
            <textarea
              rows={6}
              value={serviceAccountKey}
              onChange={(e) => setServiceAccountKey(e.target.value)}
              placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "..."\n}`}
              className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-xs"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-var-fg-default bg-var-accent hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-var-bg-subtle focus:ring-var-accent"
          >
            Salvar Credenciais
          </button>
        </div>
      </div>
    </div>
  );
};
