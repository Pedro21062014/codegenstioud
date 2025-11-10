# 🔧 Guia de Diagnóstico - Supabase Auth e Salvamento de Projeto

## ⚠️ Problemas Identificados

### 1. **Login/Logout não funciona**
- [ ] Tabelas não foram criadas no Supabase
- [ ] Políticas de RLS bloqueando acesso
- [ ] Credenciais Supabase expiradas

### 2. **Salvamento de projeto não funciona**
- [ ] Estrutura de dados não corresponde ao esperado
- [ ] Falta de permissões

## ✅ Passos para Resolver

### Passo 1: Verificar/Criar Tabelas no Supabase

1. Acesse: https://app.supabase.com/
2. Navegue para SQL Editor
3. Execute o SQL em `supabase-schema.sql`
4. Verifique se não há erros

### Passo 2: Verificar Políticas RLS

```sql
-- Verificar se RLS está ativado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Listar todas as políticas
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

### Passo 3: Testar Autenticação via Console

Abra o console do navegador (F12) e execute:

```javascript
// Teste 1: Verificar conexão Supabase
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Auth disponível:', !!supabase.auth);

// Teste 2: Verificar sessão
const { data } = await supabase.auth.getSession();
console.log('Sessão atual:', data);

// Teste 3: Testar login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});
console.log('Login result:', { data, error });

// Teste 4: Testar salvamento
const { data: project, error: saveError } = await supabase
  .from('projects')
  .insert({
    name: 'Teste',
    files: [],
    chat_history: [],
    env_vars: {}
  })
  .select()
  .single();
console.log('Save result:', { project, saveError });
```

### Passo 4: Verificar Logs de Erro

Abra a aba Network no F12 e procure por:
- Erros 401 (Não autorizado)
- Erros 403 (Proibido)
- Erros 500 (Servidor)

## 🔑 Credenciais Necessárias

Arquivo: `services/supabase.ts`

```
URL: https://oggabkywjtcghojhzepn.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZ2Fia3l3anRjZ2hvamh6ZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIwNjIsImV4cCI6MjA3MTczODA2Mn0.x2eABhTnCuYMzLfl0Jzmn_BtXANW08rXlniikaLVsvU
```

✅ Credenciais estão corretas.

## 📝 Próximas Ações

1. [ ] Acessar Supabase Dashboard
2. [ ] Executar schema SQL
3. [ ] Verificar RLS políticas
4. [ ] Testar no console do navegador
5. [ ] Verificar logs de erro