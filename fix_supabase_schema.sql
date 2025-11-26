-- Script para corrigir e atualizar o schema do Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- Este script é seguro de executar múltiplas vezes (idempotente)

-- ============================================
-- 1. VERIFICAR E ADICIONAR COLUNAS FALTANTES
-- ============================================

-- Adicionar colunas que podem estar faltando na tabela profiles
-- Se a coluna já existir, o comando será ignorado (sem erro)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_project_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_service_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_public_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS neon_connection_string TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gcp_project_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gcp_credentials TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firebase_project_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firebase_service_account_key TEXT;

-- ============================================
-- 2. ADICIONAR CONSTRAINTS (SE NÃO EXISTIREM)
-- ============================================

-- Remover constraints antigas se existirem e recriar
DO $$ 
BEGIN
    -- Remover constraints existentes (se houver)
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS github_token_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS supabase_url_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS supabase_anon_key_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS supabase_service_key_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS stripe_public_key_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS stripe_secret_key_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS neon_connection_string_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS openrouter_api_key_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS gcp_project_id_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS gcp_credentials_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS firebase_project_id_not_empty;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS firebase_service_account_key_not_empty;

    -- Adicionar constraints atualizadas
    ALTER TABLE profiles ADD CONSTRAINT github_token_not_empty 
        CHECK (github_access_token IS NULL OR github_access_token != '');
    
    ALTER TABLE profiles ADD CONSTRAINT supabase_url_not_empty 
        CHECK (supabase_project_url IS NULL OR supabase_project_url != '');
    
    ALTER TABLE profiles ADD CONSTRAINT supabase_anon_key_not_empty 
        CHECK (supabase_anon_key IS NULL OR supabase_anon_key != '');
    
    ALTER TABLE profiles ADD CONSTRAINT supabase_service_key_not_empty 
        CHECK (supabase_service_key IS NULL OR supabase_service_key != '');
    
    ALTER TABLE profiles ADD CONSTRAINT stripe_public_key_not_empty 
        CHECK (stripe_public_key IS NULL OR stripe_public_key != '');
    
    ALTER TABLE profiles ADD CONSTRAINT stripe_secret_key_not_empty 
        CHECK (stripe_secret_key IS NULL OR stripe_secret_key != '');
    
    ALTER TABLE profiles ADD CONSTRAINT neon_connection_string_not_empty 
        CHECK (neon_connection_string IS NULL OR neon_connection_string != '');
    
    ALTER TABLE profiles ADD CONSTRAINT openrouter_api_key_not_empty 
        CHECK (openrouter_api_key IS NULL OR openrouter_api_key != '');
    
    ALTER TABLE profiles ADD CONSTRAINT gcp_project_id_not_empty 
        CHECK (gcp_project_id IS NULL OR gcp_project_id != '');
    
    ALTER TABLE profiles ADD CONSTRAINT gcp_credentials_not_empty 
        CHECK (gcp_credentials IS NULL OR gcp_credentials != '');
    
    ALTER TABLE profiles ADD CONSTRAINT firebase_project_id_not_empty 
        CHECK (firebase_project_id IS NULL OR firebase_project_id != '');
    
    ALTER TABLE profiles ADD CONSTRAINT firebase_service_account_key_not_empty 
        CHECK (firebase_service_account_key IS NULL OR firebase_service_account_key != '');
END $$;

-- ============================================
-- 3. VERIFICAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Garantir que RLS está ativo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Recriar políticas se necessário
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para projetos
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. VERIFICAR TRIGGERS
-- ============================================

-- Recriar função de atualização de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Recriar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, updated_at)
  VALUES (new.id, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger para criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. VERIFICAR PERMISSÕES
-- ============================================

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 6. MENSAGEM DE SUCESSO
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema do Supabase atualizado com sucesso!';
    RAISE NOTICE '✅ Todas as colunas de integração foram adicionadas/verificadas';
    RAISE NOTICE '✅ Políticas RLS foram recriadas';
    RAISE NOTICE '✅ Triggers foram atualizados';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '1. Verifique se não há erros acima';
    RAISE NOTICE '2. Teste salvando uma integração no seu aplicativo';
    RAISE NOTICE '3. Verifique os dados na tabela profiles no Table Editor';
END $$;
