import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import { UserSettings } from '../types';

interface FirebaseFirestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: Partial<Omit<UserSettings, 'id' | 'updated_at'>>) => void;
}

export const FirebaseFirestoreModal: React.FC<FirebaseFirestoreModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [projectId, setProjectId] = useState('');
  const [serviceAccountKey, setServiceAccountKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectId(settings.firebase_project_id || '');
      setServiceAccountKey(settings.firebase_service_account_key || '');
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave({
      firebase_project_id: projectId,
      firebase_service_account_key: serviceAccountKey
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-[#FFF8F0]/60 z-40 flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF8F0] rounded-lg shadow-xl w-full max-w-lg p-6 border border-var-border-default animate-slideInUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-var-fg-default">Gerenciar Integração Firebase Firestore</h2>
          <button onClick={onClose} className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive" aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>

        <p className="text-var-fg-muted text-sm mb-4">
          Conecte seu projeto Firebase para habilitar operações de banco de dados Firestore. Você pode encontrar essas informações no console do Firebase.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-var-fg-default mb-1">Firebase Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="my-firebase-project-12345"
              className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-var-fg-default mb-1">Service Account Key (JSON)</label>
            <textarea
              rows={6}
              value={serviceAccountKey}
              onChange={(e) => setServiceAccountKey(e.target.value)}
              placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "..."\n}`}
              className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-xs"
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
