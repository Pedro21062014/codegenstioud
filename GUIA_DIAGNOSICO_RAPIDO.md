# 🚀 GUIA RÁPIDO DE DIAGNÓSTICO - LOGIN E SALVAMENTO

## 📊 O QUE FOI FEITO

✅ **Adicionados logs detalhados em:**
- `App.tsx` - Salvamento de projetos
- `AuthModal.tsx` - Login/Registro

✅ **Criados arquivos de diagnóstico:**
- `services/debugService.ts` - Testes programáticos
- `test-supabase.html` - Interface visual de testes
- `DEBUG_SUPABASE.md` - Guia de diagnóstico
- `CORRIGIR_LOGIN_SALVAR.md` - Solução passo a passo

## 🎯 PASSOS PARA RESOLVER (5 MINUTOS)

### 1️⃣ Verificar no Console (F12)

```javascript
// Cole isto no console (F12) e veja se funciona:
await debugService.testConnection()
```

**Resultado esperado:**
```
✅ Conectado com sucesso!
📍 URL: https://oggabkywjtcghojhzepn.supabase.co
```

### 2️⃣ Se falhar no PASSO 1

Significa que as **tabelas não foram criadas** no Supabase.

**Solução:**

1. Acesse: https://app.supabase.com/
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Abra o arquivo: `supabase-schema.sql`
5. Copie TODO o conteúdo
6. Cole no SQL Editor
7. Clique em **RUN** (botão verde)
8. Espere terminar (sem erros)

### 3️⃣ Verificar Tabelas foram Criadas

No SQL Editor, execute:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Deve listar:
- `profiles`
- `projects`

### 4️⃣ Testar Novamente

```javascript
// Console (F12)
await debugService.runAllTests()
```

**Resultado esperado:**
```
✅ Testes completos!
Conexão: ✅
Tabelas: ✅
Autenticação: ⚠️ (normal se não logado)
RLS: ✅
```

### 5️⃣ Fazer Login e Salvar

1. Clique no ícone de **Login** (canto inferior esquerdo)
2. Entre com email/senha ou Google
3. Crie um arquivo novo
4. Clique em **Salvar Projeto** (disco na barra lateral)
5. Deve aparecer: "Projeto salvo com sucesso!"

## 🔍 TROUBLESHOOTING

### ❌ Erro: "Tabela não existe"

```
PGRST116 → Row Level Security bloqueando
```

**Solução:** Execute o schema SQL novamente, depois limpe o cache:

```javascript
// Console
await supabase.auth.signOut()
location.reload()
```

### ❌ Erro: "Não autorizado" (401)

**Solução:** Atualize credenciais em `services/supabase.ts`

Devem ser:
```
URL: https://oggabkywjtcghojhzepn.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ Erro: "Usuário não encontrado" no login

**Solução:** 

1. Acesse Supabase Dashboard
2. Vá para **Authentication** → **Users**
3. Crie um usuário de teste com email/senha
4. Tente fazer login novamente

### ❌ Erro: "RLS bloqueando INSERT"

**Solução:** 

```sql
-- Verifique as políticas
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Devem ter estas políticas:
-- "Users can create own projects" (INSERT)
-- "Users can view own projects" (SELECT)
-- "Users can update own projects" (UPDATE)
-- "Users can delete own projects" (DELETE)
```

## 📱 USAR PÁGINA DE TESTES

Arquivo: `test-supabase.html`

1. Coloque na pasta pública (ou raiz do projeto)
2. Acesse: `http://localhost:5173/test-supabase.html`
3. Clique nos botões para testar

Interface amigável com cores e logs visuais! 🎨

## 🔧 COMANDOS ÚTEIS NO CONSOLE

```javascript
// ====== TESTES ======
await debugService.testConnection()
await debugService.testAuth()
await debugService.testTables()
await debugService.testLogin('email@gmail.com', 'senha123')
await debugService.testSaveProject('Meu Projeto')
await debugService.testListProjects()
await debugService.runAllTests()

// ====== SUPABASE DIRETO ======
// Ver sessão atual
const { data } = await supabase.auth.getSession()
console.log(data.session.user)

// Logout
await supabase.auth.signOut()

// Listar todos os projetos (mesmo dos outros)
const { data } = await supabase.from('projects').select('*')

// Deletar um projeto
await supabase.from('projects').delete().eq('id', 123)

// Ver tabelas
const { data } = await supabase.from('information_schema.tables').select('table_name')
```

## ✅ CHECKLIST FINAL

- [ ] Executei o schema SQL no Supabase
- [ ] Verifiquei as tabelas foram criadas
- [ ] Testei com `debugService.testConnection()`
- [ ] Fiz login com sucesso
- [ ] Salvei um projeto com sucesso
- [ ] Listei meus projetos com sucesso
- [ ] Fiz logout com sucesso

## 💡 DICA IMPORTANTE

Mantenha o **Console aberto (F12)** enquanto testa!

Os logs com emojis (🔐 🚪 ✅ ❌) vão mostrar exatamente o que está acontecendo.

## 📞 SUPORTE

Se ainda tiver problemas:

1. Copie a saída completa do console
2. Verifique o arquivo `CORRIGIR_LOGIN_SALVAR.md` para mais detalhes
3. Certifique-se que seguiu TODOS os passos

## 🎉 PRONTO!

Após estes passos, tudo deve estar funcionando:
- ✅ Login/Logout
- ✅ Registro
- ✅ Salvar projetos
- ✅ Listar projetos
- ✅ Carregar projetos salvos