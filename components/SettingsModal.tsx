import React, { useState, useEffect } from 'react';
import { CloseIcon, KeyIcon, GithubIcon, DatabaseIcon } from './Icons';
import { UserSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: Partial<Omit<UserSettings, 'id' | 'updated_at'>>) => void;
}

const testApiKey = async (key: string): Promise<{ success: boolean; message: string }> => {
    if (!key) return { success: false, message: 'A chave não pode estar em branco.' };
    try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: 'diga "ok"' });
        if (response.text.trim().toLowerCase() === 'ok') {
            return { success: true, message: 'Conexão bem-sucedida!' };
        }
        return { success: false, message: 'A chave é válida, mas a resposta foi inesperada.' };
    } catch (e: any) {
        console.error("API Key test failed", e);
        return { success: false, message: `Falha na conexão: ${e.message}` };
    }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'integrations'>('api-keys');
  const [geminiKey, setGeminiKey] = useState(settings.gemini_api_key || '');
  const [githubToken, setGithubToken] = useState(settings.github_access_token || '');
  const [openRouterKey, setOpenRouterKey] = useState(settings.openrouter_api_key || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(settings.firebase_project_id || '');
  const [firebaseServiceAccountKey, setFirebaseServiceAccountKey] = useState(settings.firebase_service_account_key || '');
  const [gcpProjectId, setGcpProjectId] = useState(settings.gcp_project_id || '');
  const [gcpCredentials, setGcpCredentials] = useState(settings.gcp_credentials || '');
  const [geminiTestStatus, setGeminiTestStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  useEffect(() => {
    if (isOpen) {
        setGeminiKey(settings.gemini_api_key || '');
        setGithubToken(settings.github_access_token || '');
        setOpenRouterKey(settings.openrouter_api_key || '');
        setFirebaseProjectId(settings.firebase_project_id || '');
        setFirebaseServiceAccountKey(settings.firebase_service_account_key || '');
        setGcpProjectId(settings.gcp_project_id || '');
        setGcpCredentials(settings.gcp_credentials || '');
        setGeminiTestStatus({ status: 'idle', message: '' });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleGeminiTest = async () => {
    setGeminiTestStatus({ status: 'testing', message: 'Testando...' });
    const result = await testApiKey(geminiKey);
    if (result.success) {
      setGeminiTestStatus({ status: 'success', message: result.message });
    } else {
      setGeminiTestStatus({ status: 'error', message: result.message });
    }
  };
  
  const handleSave = () => {
    onSave({
      gemini_api_key: geminiKey,
      github_access_token: githubToken,
      openrouter_api_key: openRouterKey,
      firebase_project_id: firebaseProjectId,
      firebase_service_account_key: firebaseServiceAccountKey,
      gcp_project_id: gcpProjectId,
      gcp_credentials: gcpCredentials,
    });
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-var-fg-default">Configurações</h2>
          <button onClick={onClose} className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-var-border-default mb-6">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'api-keys'
                ? 'border-var-accent text-var-accent'
                : 'border-transparent text-var-fg-muted hover:text-var-fg-default'
            }`}
          >
            Chaves de API
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'integrations'
                ? 'border-var-accent text-var-accent'
                : 'border-transparent text-var-fg-muted hover:text-var-fg-default'
            }`}
          >
            Integrações
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-var-fg-default">
          {activeTab === 'api-keys' && (
            <>
              <div className="p-4 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center gap-3 mb-2">
                  <KeyIcon />
                  <h3 className="font-semibold text-var-fg-default">Chave de API do Gemini</h3>
                </div>
                <p className="text-xs text-var-fg-muted mb-3">
                  Sua chave de API do Google Gemini é necessária. Ela é armazenada com segurança no seu perfil.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => {
                      setGeminiKey(e.target.value);
                      setGeminiTestStatus({ status: 'idle', message: '' });
                    }}
                    placeholder="Cole sua chave de API aqui"
                    className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-var-accent/50"
                  />
                  <button
                    onClick={handleGeminiTest}
                    disabled={geminiTestStatus.status === 'testing' || !geminiKey}
                    className="px-3 py-2 text-xs font-medium text-var-fg-default bg-var-bg-interactive border border-var-border-default rounded-md hover:bg-var-bg-default disabled:opacity-50 disabled:cursor-wait"
                  >
                    {geminiTestStatus.status === 'testing' ? '...' : 'Testar'}
                  </button>
                </div>
                {geminiTestStatus.message && (
                  <p className={`text-xs mt-2 ${geminiTestStatus.status === 'success' ? 'text-green-400' : geminiTestStatus.status === 'error' ? 'text-red-400' : 'text-var-fg-muted'}`}>
                    {geminiTestStatus.message}
                  </p>
                )}
              </div>

              <div className="p-4 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center gap-3 mb-2">
                  <KeyIcon />
                  <h3 className="font-semibold text-var-fg-default">Chave de API da OpenRouter</h3>
                </div>
                <p className="text-xs text-var-fg-muted mb-3">
                  Sua chave de API da OpenRouter é necessária para usar seus modelos gratuitos. Ela é armazenada com segurança no seu perfil.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="Cole sua chave de API aqui (sk-or-...)"
                    className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-var-accent/50"
                  />
                </div>
              </div>

              <div className="p-4 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center gap-3 mb-2">
                  <GithubIcon />
                  <h3 className="font-semibold text-var-fg-default">Token de Acesso do GitHub</h3>
                </div>
                <p className="text-xs text-var-fg-muted mb-3">
                  Forneça um token para importar repositórios privados e aumentar os limites da API.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="Cole seu token aqui (ex: ghp_...)"
                    className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-var-accent/50"
                  />
                </div>
                <p className="text-xs text-var-fg-muted mt-2">
                  O token precisa ter escopo de <code className="bg-var-bg-default px-1 py-0.5 rounded-sm text-xs font-mono">repo</code>.
                </p>
              </div>
            </>
          )}

          {activeTab === 'integrations' && (
            <>
              <div className="p-4 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center gap-3 mb-2">
                  <DatabaseIcon />
                  <h3 className="font-semibold text-var-fg-default">Firebase Firestore</h3>
                </div>
                <p className="text-xs text-var-fg-muted mb-3">
                  Conecte seu projeto Firebase para habilitar operações de banco de dados Firestore.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-var-fg-default mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                      placeholder="my-firebase-project-12345"
                      className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-var-fg-default mb-1">
                      Service Account Key (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={firebaseServiceAccountKey}
                      onChange={(e) => setFirebaseServiceAccountKey(e.target.value)}
                      placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "..."\n}`}
                      className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-var-bg-interactive rounded-lg border border-var-border-default">
                <div className="flex items-center gap-3 mb-2">
                  <DatabaseIcon />
                  <h3 className="font-semibold text-var-fg-default">Google Cloud Platform</h3>
                </div>
                <p className="text-xs text-var-fg-muted mb-3">
                  Conecte seu projeto Google Cloud para habilitar poderosos serviços de backend.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-var-fg-default mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={gcpProjectId}
                      onChange={(e) => setGcpProjectId(e.target.value)}
                      placeholder="my-gcp-project-12345"
                      className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-var-fg-default mb-1">
                      Service Account Credentials (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={gcpCredentials}
                      onChange={(e) => setGcpCredentials(e.target.value)}
                      placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "..."\n}`}
                      className="w-full p-2 bg-var-bg-subtle border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-var-accent-fg bg-var-accent hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-var-bg-subtle focus:ring-var-accent"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
