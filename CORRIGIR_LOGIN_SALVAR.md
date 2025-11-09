# 🔧 CORRIGINDO LOGIN E SALVAMENTO DE PROJETO

## ⚠️ PROBLEMA IDENTIFICADO

O login e salvamento de projeto provavelmente não funcionam porque **as tabelas do Supabase não foram criadas**.

## ✅ SOLUÇÃO PASSO A PASSO

### PASSO 1: Verificar Supabase Dashboard

1. Acesse: https://app.supabase.com/
2. Faça login com sua conta
3. Selecione o projeto `oggabkywjtcghojhzepn`
4. Clique em **SQL Editor** na barra lateral

### PASSO 2: Executar Schema SQL

1. Clique em **New Query**
2. Cole todo o conteúdo do arquivo: `supabase-schema.sql`
3. Clique em **RUN** (botão verde)
4. Espere o resultado (deve aparecer ✅ se tudo correr bem)

**📝 O arquivo está em:**
```
codegenstioud/supabase-schema.sql
```

### PASSO 3: Verificar Tabelas Criadas

No SQL Editor, execute:

```sql
-- Verificar se as tabelas foram criadas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Deve retornar:
-- profiles
-- projects
```

### PASSO 4: Testar a Aplicação

#### Opção A: Usar página de teste (MAIS FÁCIL)

1. Abra: `http://localhost:5173/test-supabase.html` (ou similar)
2. Clique nos botões de teste
3. Verifique se todos passam ✅

#### Opção B: Usar console do navegador

1. Abra a aplicação
2. Pressione **F12** para abrir DevTools
3. Vá para a aba **Console**
4. Cole e execute:

```javascript
// Teste 1: Conexão
await debugService.testConnection();

// Teste 2: Tabelas
await debugService.testTables();

// Teste 3: Autenticação
await debugService.testAuth();

// Teste 4: Login
await debugService.testLogin('seu-email@gmail.com', 'sua-senha');

// Teste 5: Salvar projeto
await debugService.testSaveProject('Meu Projeto');

// Teste 6: Listar projetos
await debugService.testListProjects();

// Teste 7: Todos os testes
await debugService.runAllTests();
```

### PASSO 5: Se os Testes Ainda Falharem

#### ❌ Erro 403 (Proibido) ou PGRST116

**Problema:** Políticas de Row Level Security (RLS) estão bloqueando

**Solução:**

1. No Supabase Dashboard, vá para **Authentication** → **Policies**
2. Verifique se as políticas estão criadas para `profiles` e `projects`
3. Execute novamente o arquivo `supabase-schema.sql` completamente

#### ❌ Erro "tabela não existe"

**Problema:** Schema SQL não foi executado

**Solução:**

1. Volte ao PASSO 2 e execute o SQL novamente
2. Verifique se não houve erros
3. Se houver erro de sintaxe, copie exatamente do arquivo

#### ❌ Erro de autenticação

**Problema:** Credenciais Supabase incorretas

**Verificar em:** `services/supabase.ts`

Devem ser:
```typescript
const supabaseUrl = 'https://oggabkywjtcghojhzepn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZ2Fia3l3anRjZ2hvamh6ZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIwNjIsImV4cCI6MjA3MTczODA2Mn0.x2eABhTnCuYMzLfl0Jzmn_BtXANW08rXlniikaLVsvU';
```

Se forem diferentes, atualize com os valores corretos do Supabase Dashboard.

## 📋 CHECKLIST

- [ ] Acessei https://app.supabase.com/
- [ ] Selecionei o projeto correto
- [ ] Executei o SQL em `supabase-schema.sql`
- [ ] Verifiquei as tabelas (SELECT tablename...)
- [ ] Testei a conexão via página de teste
- [ ] Fiz login com sucesso
- [ ] Consegui salvar um projeto
- [ ] Consegui listar projetos

## 🆘 AINDA NÃO FUNCIONA?

Execute este comando no console (F12) e compartilhe o resultado:

```javascript
await debugService.runAllTests().then(r => console.log(JSON.stringify(r, null, 2)));
```

## 📞 INFORMAÇÕES IMPORTANTES

**URL do Supabase:**
```
https://oggabkywjtcghojhzepn.supabase.co
```

**Credenciais:**
```
Já configuradas em: services/supabase.ts ✅
```

**Tabelas necessárias:**
- `profiles` (perfis de usuário com credenciais de APIs)
- `projects` (projetos salvos)

**RLS ativado?**
✅ Sim, deve estar ativado na schema

## 🎯 RESULTADO ESPERADO

Após completar estes passos, você deve conseguir:

1. ✅ Fazer login com email/senha
2. ✅ Fazer login com Google
3. ✅ Salvar projetos
4. ✅ Listar meus projetos
5. ✅ Fazer logout
6. ✅ Carregar projetos salvos