# 🚀 Guia de Migração: Supabase → Firebase

## 📋 Resumo das Alterações

Este documento descreve as mudanças necessárias para migrar o projeto CodeGen Studio do Supabase para o Firebase.

## 🔧 Configurações Realizadas

### 1. ✅ Configuração do Firebase
- **Arquivo**: `services/firebase.ts`
- **Credenciais configuradas**:
  - Project ID: `codegenstudio-398fc`
  - API Key: `AIzaSyCFSSxM-_7cefMP9hFLB_nIhu4kGgDMDOM`
  - Auth Domain: `codegenstudio-398fc.firebaseapp.com`
  - Database URL: `https://codegenstudio-398fc-default-rtdb.firebaseio.com`

### 2. ✅ Serviços Criados

#### Firebase Service (`services/firebase.ts`)
- Autenticação com Firebase Auth
- Operações CRUD no Firestore
- Substituição direta das funcionalidades do Supabase

#### Firebase Debug Service (`services/firebaseDebugService.ts`)
- Testes de conexão e autenticação
- Verificação de coleções e regras de segurança
- Interface de depuração similar ao debugService do Supabase

#### Firebase Project Service (`services/firebaseProjectService.ts`)
- Gerenciamento de projetos
- Configurações de usuário
- Sincronização com LocalStorage

### 3. ✅ Arquivos de Teste
- **Arquivo**: `test-firebase.html`
- Interface visual para testar todas as funcionalidades do Firebase
- Substituto do `test-supabase.html`

### 4. ✅ Atualizações de Tipos
- **Arquivo**: `types.ts`
- Adicionado `Firebase` ao enum `IntegrationProvider`
- Atualizado `SavedProject.id` para `string` (Firebase usa strings para IDs)
- Comentários atualizados para referenciar Firebase em vez de Supabase

## 🔄 Próximos Passos Necessários

### 1. Atualizar Componentes React
Os seguintes componentes precisam ser atualizados para usar o Firebase:

#### `components/AuthModal.tsx`
- Substituir imports do Supabase por Firebase
- Atualizar funções de login/logout

#### `components/SettingsModal.tsx`
- Substituir salvamento de configurações do Supabase por Firebase
- Atualizar interface para incluir opções do Firebase

#### `components/Sidebar.tsx`
- Atualizar carregamento de projetos para usar Firebase
- Modificar funções de sincronização

#### `components/PublishModal.tsx`
- Substituir integrações do Supabase por Firebase

### 2. Atualizar Serviços Existentes

#### `services/geminiService.ts`
- Remover referências ao Supabase nos comentários
- Atualizar instruções de integração

#### Outros serviços de IA
- Remover referências ao Supabase
- Atualizar documentação

### 3. Configurar Regras de Segurança do Firebase

No console do Firebase, configure as seguintes regras para o Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: usuários só podem ler/escrever seu próprio profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects: usuários só podem acessar seus próprios projetos
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

### 4. Configurar Autenticação

No console do Firebase:
1. Ative o método de autenticação "Email/Password"
2. Configure usuários de teste
3. Desative métodos não utilizados para maior segurança

### 5. Atualizar Variáveis de Ambiente

Se usar variáveis de ambiente:
```bash
# Remover
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Adicionar (se necessário)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

## 🧪 Testes

### Testes Automatizados
```javascript
// No console do navegador
firebaseDebugService.runAllTests()
```

### Testes Manuais
1. Abra `test-firebase.html`
2. Execute os testes individuais
3. Verifique todos os fluxos de autenticação e CRUD

## 📊 Comparações

| Funcionalidade | Supabase | Firebase |
|---------------|------------|----------|
| Autenticação | `supabase.auth.signInWithPassword()` | `firebase.auth.signIn()` |
| Criar Projeto | `supabase.from('projects').insert()` | `firebase.db.projects.create()` |
| Listar Projetos | `supabase.from('projects').select()` | `firebase.db.projects.getAll()` |
| Atualizar Projeto | `supabase.from('projects').update()` | `firebase.db.projects.update()` |
| Deletar Projeto | `supabase.from('projects').delete()` | `firebase.db.projects.delete()` |
| Regras de Segurança | RLS (Row Level Security) | Firestore Security Rules |

## 🔄 Migração de Dados

### Opção 1: Migração Automática
```javascript
// Usar o método de sincronização
await FirebaseProjectService.syncFromLocal()
```

### Opção 2: Exportação Manual
1. Exporte dados do Supabase como JSON
2. Converta para o formato do Firebase
3. Importe usando o Firebase Console ou script personalizado

## ⚠️ Considerações Importantes

1. **IDs de Projetos**: Firebase usa strings, Supabase usa números
2. **Timestamps**: Firebase usa `serverTimestamp()`, Supabase usa `NOW()`
3. **Regras de Segurança**: Sintaxe completamente diferente
4. **Offline Support**: Firebase tem suporte offline nativo
5. **Custos**: Verifique os limites e custos do Firebase

## 🚀 Deploy

1. **Remover dependências do Supabase**:
   ```bash
   npm uninstall @supabase/supabase-js @supabase/auth-helpers-react
   ```

2. **Verificar build**:
   ```bash
   npm run build
   ```

3. **Testar em produção**:
   - Verifique todas as funcionalidades
   - Monitore erros no Firebase Console
   - Teste com diferentes usuários

## 📞 Suporte

- **Documentação Firebase**: https://firebase.google.com/docs
- **Console Firebase**: https://console.firebase.google.com
- **Testes**: Use `test-firebase.html` para diagnóstico

---

## ✅ Checklist de Migração

- [ ] Configurar credenciais do Firebase
- [ ] Atualizar componentes React
- [ ] Configurar regras de segurança
- [ ] Configurar autenticação
- [ ] Migrar dados existentes
- [ ] Testar todas as funcionalidades
- [ ] Remover dependências do Supabase
- [ ] Atualizar documentação
- [ ] Deploy em produção

---

**Status da Migração**: 🟡 Em Progresso
**Próximo Passo**: Atualizar componentes React para usar Firebase
