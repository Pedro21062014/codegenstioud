import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { CloseIcon, AppLogo, GoogleIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Iniciando processo de autenticação...');
    console.log('📍 Tipo:', isLoginView ? 'Login' : 'Cadastro');
    console.log('📍 Email:', email);
    console.log('📍 Timestamp:', new Date().toISOString());
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (isLoginView) {
        console.log('⏳ Tentando fazer login...');
        const loginStart = Date.now();
        console.log('⏰ Início do login:', loginStart);
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        const loginEnd = Date.now();
        console.log('⏰ Fim do login:', loginEnd);
        console.log('⏱️ Duração do login:', loginEnd - loginStart, 'ms');
        console.log('📥 Resposta do signInWithPassword:', { error });
        
        if (error) throw error;
        
        console.log('✅ Login realizado com sucesso!');
        onClose();
      } else {
        console.log('⏳ Tentando fazer cadastro...');
        const signupStart = Date.now();
        
        const { error } = await supabase.auth.signUp({ email, password });
        
        const signupEnd = Date.now();
        console.log('⏱️ Duração do cadastro:', signupEnd - signupStart, 'ms');
        console.log('📥 Resposta do signUp:', { error });
        
        if (error) throw error;
        setMessage('Verifique seu e-mail para o link de confirmação!');
      }
    } catch (err: any) {
      console.error('❌ Erro na autenticação:', err);
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Processo de autenticação finalizado');
    }
  };
  
  const handleGoogleLogin = async () => {
    console.log('🔍 Iniciando login com Google...');
    setLoading(true);
    setError(null);
    
    const googleStart = Date.now();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    const googleEnd = Date.now();
    
    console.log('⏱️ Duração do login Google:', googleEnd - googleStart, 'ms');
    console.log('📥 Resposta do signInWithOAuth:', { error });
    
    if (error) {
      console.error('❌ Erro no login com Google:', error);
      setError(error.message);
      setLoading(false);
    }
    // On success, Supabase handles the redirect.
  };

  React.useEffect(() => {
    if (isOpen) {
        setEmail('');
        setPassword('');
        setError(null);
        setMessage(null);
        setLoading(false);
        setIsLoginView(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fadeIn" onClick={onClose}>
      <div className="bg-var-bg-subtle rounded-lg shadow-xl w-full max-w-sm p-8 border border-var-border-default animate-slideInUp relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center flex-col items-center mb-6">
            <AppLogo className="w-10 h-10 text-var-accent mb-2" />
            <h2 className="text-2xl font-bold text-var-fg-default">{isLoginView ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
            <p className="text-sm text-var-fg-muted">
                {isLoginView ? 'Faça login para continuar.' : 'Comece a construir seus projetos.'}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-var-fg-muted mb-1">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-var-accent/50"
                />
            </div>
            <div>
                 <label htmlFor="password" className="block text-sm font-medium text-var-fg-muted mb-1">Senha</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-2 bg-var-bg-interactive border border-var-border-default rounded-md text-var-fg-default placeholder-var-fg-subtle focus:outline-none focus:ring-2 focus:ring-var-accent/50"
                />
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-var-accent text-var-accent-fg font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                {loading ? 'Processando...' : (isLoginView ? 'Login' : 'Registrar')}
            </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-var-border-default"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-var-bg-subtle px-2 text-var-fg-muted">OU</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-var-bg-interactive border border-var-border-default text-var-fg-default font-semibold rounded-md hover:bg-var-bg-default transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          Continuar com Google
        </button>


         <div className="mt-6 text-center">
            <p className="text-sm text-var-fg-muted">
                {isLoginView ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} className="font-semibold text-var-accent hover:underline">
                     {isLoginView ? "Registre-se" : "Faça Login"}
                </button>
            </p>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
