# Checklist de Depuração para Configurações e Logout

## Antes de Testar

1. **Execute o script SQL** no Supabase:
   - Abra o painel do seu projeto Supabase
   - Vá para SQL Editor
   - Copie e execute todo o conteúdo do arquivo `createtables.sql`
   - Verifique se não houve erros na execução

2. **Verifique as credenciais do Supabase**:
   - No painel Supabase > Settings > API
   - Confirme que o Project URL e Anon Key estão corretos
   - Atualize o arquivo `services/supabase.ts` se necessário

## Durante os Testes

### Teste das Credenciais Supabase

1. **Abra o console do navegador** (F12)
2. **Faça login** na aplicação
3. **Tente salvar as credenciais do Supabase**:
   - Vá em Configurações > Integrações > Supabase
   - Preencha os campos: URL, Chave Anon, Chave Service Role
   - Clique em "Salvar Credenciais"
4. **Verifique os logs no console**:
   - Deve aparecer: `handleSaveSettings chamado com: {supabase_project_url: "...", supabase_anon_key: "...", supabase_service_key: "..."}`
   - Deve aparecer: `Dados que serão salvos: {userId: "...", campos: [...], dados: ...}`
   - Se der erro: `Erro completo do Supabase: {error: {...}}`

### Teste do Logout

1. **Clique no botão de sair** (ícone de logout na sidebar)
2. **Verifique os logs no console**:
   - Deve aparecer: `Usuário deslogando com sucesso`
   - Não deve aparecer erros
3. **Verifique se a sessão foi limpa**:
   - A página deve redirecionar para a tela inicial
   - Os dados do usuário devem ser limpos

## Logs Importantes para Monitorar

### Console do Navegador

Procure por estes logs específicos:

**Sucesso ao salvar:**
```
handleSaveSettings chamado com: {supabase_project_url: "..."}
Dados que serão salvos: {...}
Configurações salvas com sucesso: {...}
Estado userSettings atualizado: {...}
```

**Erro ao salvar:**
```
Erro completo do Supabase: {
  error: {...},
  code: "CÓDIGO_DO_ERRO",
  message: "Mensagem de erro",
  details: "...",
  hint: "..."
}
```

**Sucesso ao fazer logout:**
```
Usuário deslogando com sucesso
Sessão limpa, redirecionando para welcome
```

**Erro ao fazer logout:**
```
Erro ao tentar sair: MENSAGEM_DE_ERRO
```

### Network Tab

1. **Verifique as requisições de rede**:
   - Procure por requisições para `rest/v1/profiles`
   - Verifique o status (deve ser 200)
   - Verifique o payload enviado
   - Verifique a resposta recebida

## Problemas Comuns e Soluções

### 1. Erro: "column does not exist"
**Causa**: Schema não foi criado corretamente
**Solução**: Execute novamente o script `createtables.sql`

### 2. Erro: "permission denied"
**Causa**: Políticas RLS não configuradas
**Solução**: Verifique se as políticas foram criadas no script SQL

### 3. Erro: "relation 'profiles' does not exist"
**Causa**: Tabela não existe
**Solução**: Execute o script SQL para criar as tabelas

### 4. Botão de logout não funciona
**Causa**: Função handleLogout com dependências faltando
**Solução**: Já foi corrigido no App.tsx

### 5. Credenciais não persistem
**Causa**: Estado userSettings não sendo atualizado
**Solução**: Verifique os logs de sucesso no console

## Comandos SQL para Verificação

Execute estes comandos no SQL Editor do Supabase:

```sql
-- Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se as políticas RLS existem
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar se um usuário tem perfil
SELECT * FROM profiles WHERE id = 'user-uuid-aqui';

-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

## Se Ainda Não Funcionar

1. **Tire um print dos erros** do console
2. **Verifique o Network tab** para ver as requisições
3. **Confirme se você está usando o projeto Supabase correto**
4. **Verifique se o usuário está logado** (session não é null)
5. **Tente limpar o localStorage** e fazer login novamente

## Contato

Se após seguir todos estes passos ainda não funcionar:
1. Copie todos os logs do console
2. Tire print da aba Network
3. Verifique o script SQL foi executado sem erros
4. Entre em contato com o suporte
