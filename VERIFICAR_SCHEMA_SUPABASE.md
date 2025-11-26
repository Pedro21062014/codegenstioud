# 🔧 Guia de Verificação e Correção do Schema Supabase

Este guia ajuda você a corrigir problemas de importação de dados no Supabase.

## 🎯 Problema

Se você está enfrentando estes sintomas:
- ❌ Dados de integrações (Supabase, Stripe, Neon) não são salvos
- ❌ Token do GitHub não é salvo
- ❌ Projetos não aparecem após fazer login
- ❌ Configurações desaparecem após recarregar a página

Provavelmente seu banco de dados Supabase está com o schema desatualizado.

## 📝 Solução: Executar Script de Correção

### Passo 1: Acessar o SQL Editor

1. Abra seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral esquerdo, clique em **SQL Editor**
3. Clique em **+ New query** para criar uma nova query

### Passo 2: Copiar e Executar o Script

1. Abra o arquivo `fix_supabase_schema.sql` neste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar Execução

Após executar, você deve ver mensagens como:

```
✅ Schema do Supabase atualizado com sucesso!
✅ Todas as colunas de integração foram adicionadas/verificadas
✅ Políticas RLS foram recriadas
✅ Triggers foram atualizados
```

> [!NOTE]
> É **seguro executar este script múltiplas vezes** - ele não vai duplicar dados ou causar erros.

## ✅ Checklist de Verificação

Após executar o script, teste cada funcionalidade:

### 1. Verificar Estrutura da Tabela Profiles

1. No Supabase Dashboard, vá em **Table Editor** → **profiles**
2. Clique em **⚙️** (configurações da tabela)
3. Verifique se existem estas colunas:
   - ✅ `github_access_token`
   - ✅ `supabase_project_url`
   - ✅ `supabase_anon_key`
   - ✅ `supabase_service_key`
   - ✅ `stripe_public_key`
   - ✅ `stripe_secret_key`
   - ✅ `neon_connection_string`
   - ✅ `openrouter_api_key`
   - ✅ `gcp_project_id`
   - ✅ `gcp_credentials`
   - ✅ `firebase_project_id`
   - ✅ `firebase_service_account_key`

### 2. Testar Salvamento de Token GitHub

1. No seu aplicativo, faça **login** (se não estiver logado)
2. Abra **Configurações** (ícone de engrenagem)
3. Na aba **API Keys**, no campo **Token de Acesso do GitHub**:
   - Cole um token de teste: `ghp_test123456789`
4. Clique em **Salvar e Fechar**
5. **Recarregue a página** (`F5`)
6. Abra Configurações novamente
7. ✅ **Sucesso**: O token deve estar lá
8. ❌ **Falha**: O campo está vazio

### 3. Testar Integração Supabase

1. Abra o menu **Integrações** (no sidebar)
2. Clique em **Supabase** (ícone verde)
3. Preencha os campos:
   - **URL do Projeto**: `https://test.supabase.co`
   - **Chave Anon**: `test-anon-key`
   - **Chave Service Role**: `test-service-key`
4. Clique em **Salvar Credenciais**
5. **Recarregue a página**
6. Abra Integrações → Supabase novamente
7. ✅ **Sucesso**: Os dados estão preenchidos
8. ❌ **Falha**: Os campos estão vazios

### 4. Testar Integração Stripe

1. Abra **Integrações** → **Stripe**
2. Preencha:
   - **Chave Publicável**: `pk_test_123`
   - **Chave Secreta**: `sk_test_456`
3. Salvar e recarregar
4. ✅ Verificar se os dados persistem

### 5. Testar Integração Neon

1. Abra **Integrações** → **Neon**
2. Preencha:
   - **String de Conexão**: `postgresql://user:pass@host/db`
3. Salvar e recarregar
4. ✅ Verificar se os dados persistem

### 6. Testar Salvamento de Projetos

1. Crie um projeto simples (ex: "Criar um botão vermelho")
2. Aguarde a geração
3. Clique no ícone **💾 Salvar Projeto** (no sidebar)
4. Deve aparecer mensagem: "Projeto salvo com sucesso!"
5. Faça **logout** (menu do usuário → Sair)
6. Faça **login** novamente
7. Clique em **📂 Projetos**
8. ✅ **Sucesso**: Seu projeto aparece na lista
9. ❌ **Falha**: A lista está vazia

### 7. Verificar Dados Diretamente no Supabase

1. No Supabase Dashboard, vá em **Table Editor** → **profiles**
2. Localize sua linha (usando seu e-mail ou ID de usuário)
3. ✅ Verificar se os campos de integração estão preenchidos (não NULL)

4. Vá em **Table Editor** → **projects**
5. ✅ Verificar se seus projetos aparecem listados

## 🐛 Solução de Problemas

### Erro: "permission denied for table profiles"

**Causa**: As políticas RLS não estão configuradas corretamente.

**Solução**:
1. Execute o script `fix_supabase_schema.sql` novamente
2. Verifique se você está logado no aplicativo
3. Tente fazer logout e login novamente

### Erro: "column does not exist"

**Causa**: Uma coluna específica não foi criada.

**Solução**:
1. Execute o script `fix_supabase_schema.sql` novamente
2. Verifique no Table Editor se a coluna foi criada
3. Se ainda não existir, adicione manualmente:
   ```sql
   ALTER TABLE profiles ADD COLUMN nome_da_coluna TEXT;
   ```

### Dados salvam mas desaparecem após logout

**Causa**: Dados estão sendo salvos apenas no localStorage, não no Supabase.

**Solução**:
1. Verifique se você está realmente **logado** (deve aparecer seu e-mail no cabeçalho)
2. Abra o **Console do navegador** (`F12`)
3. Ao salvar uma integração, procure por mensagens que comecem com:
   - `📤 Salvando configurações no Supabase` - indica que está tentando salvar
   - `✅ Configurações salvas no Supabase` - sucesso
   - `❌ Erro ao salvar no Supabase` - falha (veja detalhes do erro)

### Projetos não aparecem na lista

**Verificações**:
1. Confirme que você está logado com a mesma conta que criou o projeto
2. No Supabase, **Table Editor** → **projects**, verifique se o `user_id` do projeto corresponde ao seu `id` em **auth.users**
3. Verifique se as políticas RLS estão ativas (execute o script novamente)

## 📞 Ainda com problemas?

Se após seguir todos os passos o problema persistir:

1. **Abra o Console do navegador** (`F12`)
2. Vá para a aba **Console**
3. Tente salvar uma integração
4. **Copie todas as mensagens de erro** que aparecerem
5. Abra uma issue no GitHub com:
   - Descrição do problema
   - Mensagens de erro do console
   - Prints das tabelas no Supabase Table Editor

## 🎉 Tudo Funcionando?

Se todos os testes passaram:
- ✅ Dados de integração são salvos e persistem
- ✅ Token do GitHub é salvo e persiste
- ✅ Projetos são salvos e aparecem após login
- ✅ Dados podem ser vistos no Table Editor do Supabase

**Parabéns! Seu banco de dados Supabase está corretamente configurado! 🚀**
