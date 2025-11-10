# Instruções de Configuração do CodeGen Studio

## Problemas Corrigidos

1. **Inconsistência nos nomes dos campos** entre os modais e o types.ts
2. **GoogleCloudModal e FirebaseFirestoreModal** usavam nomes de campos diferentes
3. **Falta de tratamento de erro** no salvamento
4. **Possíveis problemas com o schema do banco de dados**
5. **Botão de logout não funcionava** - Faltavam dependências no useCallback

## Passos para Configurar o Projeto

### 1. Configurar o Banco de Dados Supabase

1. Acesse o painel do seu projeto Supabase
2. Vá para **SQL Editor**
3. Copie e execute todo o conteúdo do arquivo `supabase-schema.sql`
4. Verifique se as tabelas `profiles` e `projects` foram criadas corretamente

### 2. Verificar Configurações do Supabase

1. No painel do Supabase, vá para **Settings > API**
2. Anote os seguintes dados:
   - **Project URL**: https://seu-projeto-ref.supabase.co
   - **anon public key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - **service_role key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret key)

### 3. Atualizar Credenciais no Código

Verifique se o arquivo `services/supabase.ts` está com as credenciais corretas do seu projeto:

```typescript
const supabaseUrl = 'https://SEU-PROJETO-REF.supabase.co';
const supabaseAnonKey = 'SUA-CHAVE-ANON-AQUI';
```

### 4. Configurar Row Level Security (RLS)

O script SQL já configura as políticas RLS, mas verifique se estão ativas:

1. Vá para **Authentication > Policies**
2. Verifique se as políticas para as tabelas `profiles` e `projects` estão habilitadas
3. As políticas devem permitir que usuários vejam e editem apenas seus próprios dados

### 5. Testar as Integrações

#### Supabase Admin
1. Faça login na aplicação
2. Vá em **Configurações > Integrações > Supabase**
3. Preencha:
   - URL do Projeto: https://seu-projeto-ref.supabase.co
   - Chave Anon: sua chave pública
   - Chave Service Role: sua chave secreta

#### Stripe
1. Vá em **Configurações > Integrações > Stripe**
2. Preencha:
   - Chave Publicável: pk_test_...
   - Chave Secreta: sk_test_...

#### Google Cloud Platform
1. Vá em **Configurações > Integrações > Google Cloud**
2. Preencha:
   - Project ID: seu-gcp-project-id
   - Service Account Key: JSON completo da conta de serviço

#### Firebase Firestore
1. Vá em **Configurações > Integrações > Firebase Firestore**
2. Preencha:
   - Firebase Project ID: seu-firebase-project-id
   - Service Account Key: JSON completo da conta de serviço

## Comandos SQL Adicionais (se necessário)

### Verificar se as tabelas existem
```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Verificar se um usuário tem perfil
```sql
SELECT * FROM profiles WHERE id = 'user-uuid-aqui';
```

### Verificar projetos de um usuário
```sql
SELECT * FROM projects WHERE user_id = 'user-uuid-aqui';
```

## Solução de Problemas Comuns

### Erro: "column does not exist"
**Causa**: O schema do banco não foi criado corretamente.
**Solução**: Execute novamente o script `supabase-schema.sql`.

### Erro: "permission denied for table profiles"
**Causa**: Políticas RLS não configuradas ou usuário não autenticado.
**Solução**: Verifique se as políticas RLS foram criadas e se o usuário está logado.

### Erro: "relation "profiles" does not exist"
**Causa**: Tabela não foi criada.
**Solução**: Execute o script SQL para criar as tabelas.

### Credenciais não estão salvando
**Causa**: Campos com nomes diferentes entre modal e types.ts.
**Solução**: Foi corrigido na atualização dos modais.

### Projetos não estão salvando
**Causa**: Problema com a tabela projects ou permissões.
**Solução**: Verifique se a tabela projects existe e se as políticas RLS estão corretas.

## Logs Importantes

Ative o console do navegador para ver os logs de depuração:

- `console.log('Salvando configurações:', Object.keys(newSettings));`
- `console.log('Configurações salvas com sucesso:', data);`
- `console.error("Supabase save settings error:", error);`

Esses logs ajudarão a identificar problemas específicos durante o salvamento.

## Próximos Passos

1. Execute o script SQL no Supabase
2. Verifique as credenciais no `services/supabase.ts`
3. Teste o salvamento das configurações
4. Teste o salvamento dos projetos
5. Verifique os logs para qualquer erro adicional

Se ainda houver problemas, verifique o console do navegador e os logs do Supabase para mensagens de erro específicas.
