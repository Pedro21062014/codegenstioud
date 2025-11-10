/**
 * 🔧 Debug Service para diagnosticar problemas com Supabase
 * Use no console do navegador para testar conexão e operações
 */

import { supabase } from './supabase';

export const debugService = {
  // Teste 1: Verificar conexão com Supabase
  async testConnection() {
    console.log('=== 🔍 TESTE 1: Conexão Supabase ===');
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('✅ Supabase conectado');
      console.log('📍 URL:', supabase.supabaseUrl);
      console.log('📍 Sessão:', data);
      console.log('📍 Erro:', error);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      return { success: false, error: err };
    }
  },

  // Teste 2: Verificar autenticação
  async testAuth() {
    console.log('=== 🔍 TESTE 2: Autenticação ===');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ Usuário autenticado');
        console.log('📍 User ID:', session.user.id);
        console.log('📍 Email:', session.user.email);
        console.log('📍 Token expira em:', new Date(session.expires_at! * 1000));
        return { success: true, user: session.user };
      } else {
        console.log('⚠️ Usuário não autenticado');
        return { success: false, message: 'Usuário não autenticado' };
      }
    } catch (err) {
      console.error('❌ Erro ao verificar autenticação:', err);
      return { success: false, error: err };
    }
  },

  // Teste 3: Verificar tabelas
  async testTables() {
    console.log('=== 🔍 TESTE 3: Tabelas ===');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('⚠️ Não autenticado, testando acesso anônimo');
      }

      // Teste profiles
      console.log('📋 Testando tabela profiles...');
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (profileError) {
        console.error('❌ Erro ao acessar profiles:', profileError);
      } else {
        console.log('✅ Tabela profiles existe e é acessível');
      }

      // Teste projects
      console.log('📋 Testando tabela projects...');
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('count')
        .limit(1);
      
      if (projectError) {
        console.error('❌ Erro ao acessar projects:', projectError);
      } else {
        console.log('✅ Tabela projects existe e é acessível');
      }

      return {
        success: !profileError && !projectError,
        profiles: { error: profileError },
        projects: { error: projectError }
      };
    } catch (err) {
      console.error('❌ Erro ao verificar tabelas:', err);
      return { success: false, error: err };
    }
  },

  // Teste 4: Tentar login
  async testLogin(email: string, password: string) {
    console.log('=== 🔍 TESTE 4: Login ===');
    console.log(`🔐 Tentando login com email: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Login bem-sucedido');
      console.log('📍 User ID:', data.user?.id);
      console.log('📍 Email:', data.user?.email);
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 5: Tentar salvar projeto
  async testSaveProject(projectName: string = 'TestProject') {
    console.log('=== 🔍 TESTE 5: Salvar Projeto ===');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ Não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      const projectData = {
        name: projectName,
        files: [],
        chat_history: [{ role: 'assistant', content: 'Test' }],
        env_vars: {}
      };

      console.log('📝 Dados a serem salvos:', projectData);

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar projeto:', error);
        console.error('📋 Detalhes:', {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details
        });
        return { success: false, error };
      }

      console.log('✅ Projeto salvo com sucesso');
      console.log('📍 ID do projeto:', data.id);
      console.log('📍 Dados salvos:', data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 6: Listar projetos
  async testListProjects() {
    console.log('=== 🔍 TESTE 6: Listar Projetos ===');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ Não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Erro ao listar projetos:', error);
        return { success: false, error };
      }

      console.log('✅ Projetos carregados');
      console.log(`📍 Total de projetos: ${data.length}`);
      console.log('📋 Projetos:', data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 7: Verificar RLS
  async testRLS() {
    console.log('=== 🔍 TESTE 7: Row Level Security (RLS) ===');
    
    try {
      console.log('📝 Testando permissões RLS...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('⚠️ Sem sessão, RLS pode estar bloqueando');
      }

      // Tentar SELECT
      const { error: selectError } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (selectError?.code === 'PGRST116') {
        console.error('❌ RLS está bloqueando SELECT');
        return { success: false, error: 'RLS bloqueando SELECT' };
      }

      // Tentar INSERT
      const testProject = {
        name: 'RLS-Test-' + Date.now(),
        files: [],
        chat_history: [],
        env_vars: {}
      };

      const { error: insertError } = await supabase
        .from('projects')
        .insert(testProject)
        .select()
        .single();

      if (insertError?.code === 'PGRST116') {
        console.error('❌ RLS está bloqueando INSERT');
        return { success: false, error: 'RLS bloqueando INSERT' };
      }

      if (insertError && insertError.code !== 'PGRST116') {
        console.warn('⚠️ Erro de INSERT (pode ser RLS):', insertError);
      }

      console.log('✅ RLS parece estar configurado corretamente');
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao testar RLS:', err);
      return { success: false, error: err };
    }
  },

  // Teste completo
  async runAllTests() {
    console.log('\n🚀 ========== INICIANDO TODOS OS TESTES ==========\n');
    
    const results = {
      connection: await this.testConnection(),
      tables: await this.testTables(),
      auth: await this.testAuth(),
      rls: await this.testRLS(),
    };

    console.log('\n📊 ========== RESUMO DOS TESTES ==========\n');
    console.table({
      'Conexão': results.connection.success ? '✅' : '❌',
      'Tabelas': results.tables.success ? '✅' : '❌',
      'Autenticação': results.auth.success ? '✅' : '❌',
      'RLS': results.rls.success ? '✅' : '❌',
    });

    return results;
  }
};

// Exportar para console global
if (typeof window !== 'undefined') {
  (window as any).debugService = debugService;
  console.log('🔧 debugService disponível no console');
  console.log('Use: debugService.runAllTests() ou debugService.testConnection()');
}