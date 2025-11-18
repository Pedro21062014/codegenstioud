/**
 * 🔧 Firebase Debug Service para diagnosticar problemas com Firebase
 * Use no console do navegador para testar conexão e operações
 */

import { firebaseService } from './firebase';

export const firebaseDebugService = {
  // Teste 1: Verificar conexão com Firebase
  async testConnection() {
    console.log('=== 🔍 TESTE 1: Conexão Firebase ===');
    try {
      const user = await firebaseService.auth.getCurrentUser();
      console.log('✅ Firebase conectado');
      console.log('📍 Projeto ID:', 'codegenstudio-398fc');
      console.log('📍 Usuário atual:', user);
      return { success: true, user };
    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      return { success: false, error: err };
    }
  },

  // Teste 2: Verificar autenticação
  async testAuth() {
    console.log('=== 🔍 TESTE 2: Autenticação ===');
    try {
      const user = await firebaseService.auth.getCurrentUser();
      
      if (user) {
        console.log('✅ Usuário autenticado');
        console.log('📍 User ID:', user.uid);
        console.log('📍 Email:', user.email);
        console.log('📍 Display Name:', user.displayName);
        return { success: true, user };
      } else {
        console.log('⚠️ Usuário não autenticado');
        return { success: false, message: 'Usuário não autenticado' };
      }
    } catch (err) {
      console.error('❌ Erro ao verificar autenticação:', err);
      return { success: false, error: err };
    }
  },

  // Teste 3: Verificar coleções (equivalente às tabelas)
  async testCollections() {
    console.log('=== 🔍 TESTE 3: Coleções ===');
    try {
      const user = await firebaseService.auth.getCurrentUser();
      
      if (!user) {
        console.warn('⚠️ Não autenticado, testando acesso anônimo');
      }

      // Teste profiles
      console.log('📋 Testando coleção profiles...');
      if (user) {
        const profileResult = await firebaseService.db.profiles.get(user.uid);
        if (profileResult.success) {
          console.log('✅ Coleção profiles existe e é acessível');
        } else {
          console.log('⚠️ Profile não encontrado (pode ser normal para novos usuários)');
        }
      } else {
        console.log('⚠️ Não é possível testar profiles sem usuário autenticado');
      }

      // Teste projects
      console.log('📋 Testando coleção projects...');
      if (user) {
        const projectsResult = await firebaseService.db.projects.getAll(user.uid);
        if (projectsResult.success) {
          console.log('✅ Coleção projects existe e é acessível');
          console.log(`📍 Total de projetos: ${projectsResult.data.length}`);
        } else {
          console.error('❌ Erro ao acessar projects:', projectsResult.error);
        }
      } else {
        console.log('⚠️ Não é possível testar projects sem usuário autenticado');
      }

      return {
        success: true,
        message: 'Testes de coleções concluídos'
      };
    } catch (err) {
      console.error('❌ Erro ao verificar coleções:', err);
      return { success: false, error: err };
    }
  },

  // Teste 4: Tentar login
  async testLogin(email: string, password: string) {
    console.log('=== 🔍 TESTE 4: Login ===');
    console.log(`🔐 Tentando login com email: ${email}`);
    
    try {
      const result = await firebaseService.auth.signIn(email, password);

      if (result.success) {
        console.log('✅ Login bem-sucedido');
        console.log('📍 User ID:', result.user.uid);
        console.log('📍 Email:', result.user.email);
        return { success: true, user: result.user };
      } else {
        console.error('❌ Erro ao fazer login:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 5: Tentar salvar projeto
  async testSaveProject(projectName: string = 'TestProject') {
    console.log('=== 🔍 TESTE 5: Salvar Projeto ===');
    
    try {
      const user = await firebaseService.auth.getCurrentUser();
      
      if (!user) {
        console.error('❌ Não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      const projectData = {
        name: projectName,
        files: [],
        chat_history: [{ role: 'assistant' as const, content: 'Test' }],
        env_vars: {},
        user_id: user.uid
      };

      console.log('📝 Dados a serem salvos:', projectData);

      const result = await firebaseService.db.projects.create(projectData);

      if (result.success) {
        console.log('✅ Projeto salvo com sucesso');
        console.log('📍 ID do projeto:', result.data.id);
        return { success: true, data: result.data };
      } else {
        console.error('❌ Erro ao salvar projeto:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 6: Listar projetos
  async testListProjects() {
    console.log('=== 🔍 TESTE 6: Listar Projetos ===');
    
    try {
      const user = await firebaseService.auth.getCurrentUser();
      
      if (!user) {
        console.error('❌ Não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.projects.getAll(user.uid);

      if (result.success) {
        console.log('✅ Projetos carregados');
        console.log(`📍 Total de projetos: ${result.data.length}`);
        console.log('📋 Projetos:', result.data);
        return { success: true, data: result.data };
      } else {
        console.error('❌ Erro ao listar projetos:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      return { success: false, error: err };
    }
  },

  // Teste 7: Verificar regras de segurança (equivalente ao RLS)
  async testSecurityRules() {
    console.log('=== 🔍 TESTE 7: Regras de Segurança ===');
    
    try {
      console.log('📝 Testando regras de segurança...');
      
      const user = await firebaseService.auth.getCurrentUser();
      
      if (!user) {
        console.warn('⚠️ Sem usuário, regras podem estar bloqueando');
      }

      // Tentar ler projetos sem autenticação
      console.log('📋 Testando leitura de projetos...');
      if (user) {
        const projectsResult = await firebaseService.db.projects.getAll(user.uid);
        if (projectsResult.success) {
          console.log('✅ Regras de segurança permitem leitura');
        } else {
          console.error('❌ Regras de segurança bloqueando leitura:', projectsResult.error);
        }
      } else {
        console.log('⚠️ Não é possível testar leitura sem usuário autenticado');
      }

      // Tentar criar projeto sem autenticação
      console.log('📋 Testando criação de projetos...');
      if (user) {
        const testProject = {
          name: 'Security-Rules-Test-' + Date.now(),
          files: [],
          chat_history: [],
          env_vars: {},
          user_id: user.uid
        };

        const createResult = await firebaseService.db.projects.create(testProject);
        if (createResult.success) {
          console.log('✅ Regras de segurança permitem criação');
          // Limpar o teste
          await firebaseService.db.projects.delete(createResult.data.id);
        } else {
          console.error('❌ Regras de segurança bloqueando criação:', createResult.error);
        }
      } else {
        console.log('⚠️ Não é possível testar criação sem usuário autenticado');
      }

      console.log('✅ Testes de regras de segurança concluídos');
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao testar regras de segurança:', err);
      return { success: false, error: err };
    }
  },

  // Teste completo
  async runAllTests() {
    console.log('\n🚀 ========== INICIANDO TODOS OS TESTES FIREBASE ==========\n');
    
    const results = {
      connection: await this.testConnection(),
      collections: await this.testCollections(),
      auth: await this.testAuth(),
      security: await this.testSecurityRules(),
    };

    console.log('\n📊 ========== RESUMO DOS TESTES ==========\n');
    console.table({
      'Conexão': results.connection.success ? '✅' : '❌',
      'Coleções': results.collections.success ? '✅' : '❌',
      'Autenticação': results.auth.success ? '✅' : '❌',
      'Segurança': results.security.success ? '✅' : '❌',
    });

    return results;
  }
};

// Exportar para console global
if (typeof window !== 'undefined') {
  (window as any).firebaseDebugService = firebaseDebugService;
  console.log('🔧 firebaseDebugService disponível no console');
  console.log('Use: firebaseDebugService.runAllTests() ou firebaseDebugService.testConnection()');
}
