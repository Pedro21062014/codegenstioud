import { supabase } from './supabase';
import { LocalStorageService } from './localStorageService';
import { SavedProject, UserSettings } from '../types';

export class MigrationService {
    /**
     * Migra dados do localStorage para o Supabase quando o usuário faz login
     */
    static async migrateLocalDataToSupabase(userId: string): Promise<{
        success: boolean;
        projectsMigrated: number;
        settingsMigrated: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];
        let projectsMigrated = 0;
        let settingsMigrated = false;

        console.log('🔄 Iniciando migração de dados locais para Supabase...');
        console.log('👤 User ID:', userId);

        try {
            // 1. Migrar configurações do usuário
            const localSettings = LocalStorageService.getUserSettings();
            if (localSettings && Object.keys(localSettings).length > 0) {
                console.log('📋 Migrando configurações locais:', Object.keys(localSettings));

                try {
                    const { error: settingsError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            ...localSettings,
                            updated_at: new Date().toISOString(),
                        });

                    if (settingsError) {
                        console.error('❌ Erro ao migrar configurações:', settingsError);
                        errors.push(`Configurações: ${settingsError.message}`);
                    } else {
                        console.log('✅ Configurações migradas com sucesso');
                        settingsMigrated = true;
                    }
                } catch (err) {
                    console.error('❌ Erro inesperado ao migrar configurações:', err);
                    errors.push(`Configurações: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                }
            }

            // 2. Migrar projetos locais
            const localProjects = LocalStorageService.getProjects();
            if (localProjects && localProjects.length > 0) {
                console.log(`📦 Migrando ${localProjects.length} projetos locais...`);

                for (const project of localProjects) {
                    try {
                        // Verificar se o projeto já existe no Supabase
                        const { data: existingProject } = await supabase
                            .from('projects')
                            .select('id')
                            .eq('user_id', userId)
                            .eq('name', project.name)
                            .single();

                        if (existingProject) {
                            console.log(`⏭️ Projeto "${project.name}" já existe no Supabase, pulando...`);
                            continue;
                        }

                        // Inserir projeto no Supabase
                        const { error: projectError } = await supabase
                            .from('projects')
                            .insert({
                                user_id: userId,
                                name: project.name,
                                files: project.files,
                                chat_history: project.chat_history || [],
                                env_vars: project.env_vars || {},
                                created_at: project.created_at || new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });

                        if (projectError) {
                            console.error(`❌ Erro ao migrar projeto "${project.name}":`, projectError);
                            errors.push(`Projeto "${project.name}": ${projectError.message}`);
                        } else {
                            console.log(`✅ Projeto "${project.name}" migrado com sucesso`);
                            projectsMigrated++;
                        }
                    } catch (err) {
                        console.error(`❌ Erro inesperado ao migrar projeto "${project.name}":`, err);
                        errors.push(`Projeto "${project.name}": ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                    }
                }
            }

            // 3. Limpar localStorage após migração bem-sucedida (opcional)
            // Comentado para manter como backup local
            // if (projectsMigrated > 0 || settingsMigrated) {
            //   LocalStorageService.clearProjects();
            //   LocalStorageService.clearUserSettings();
            //   console.log('🧹 localStorage limpo após migração');
            // }

            const success = errors.length === 0;
            console.log('🎉 Migração concluída:', {
                success,
                projectsMigrated,
                settingsMigrated,
                errors: errors.length,
            });

            return {
                success,
                projectsMigrated,
                settingsMigrated,
                errors,
            };
        } catch (err) {
            console.error('💥 Erro crítico durante migração:', err);
            return {
                success: false,
                projectsMigrated,
                settingsMigrated,
                errors: [...errors, err instanceof Error ? err.message : 'Erro crítico desconhecido'],
            };
        }
    }

    /**
     * Sincroniza dados do Supabase para o localStorage (cache local)
     */
    static async syncSupabaseToLocal(userId: string): Promise<void> {
        console.log('🔄 Sincronizando dados do Supabase para localStorage...');

        try {
            // Sincronizar configurações
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileData) {
                LocalStorageService.saveUserSettings(profileData);
                console.log('✅ Configurações sincronizadas');
            }

            // Sincronizar projetos
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId);

            if (projectsData) {
                LocalStorageService.saveProjects(projectsData);
                console.log(`✅ ${projectsData.length} projetos sincronizados`);
            }
        } catch (err) {
            console.error('❌ Erro ao sincronizar dados:', err);
        }
    }

    /**
     * Verifica se há dados locais que precisam ser migrados
     */
    static hasLocalDataToMigrate(): boolean {
        const localProjects = LocalStorageService.getProjects();
        const localSettings = LocalStorageService.getUserSettings();

        const hasProjects = localProjects && localProjects.length > 0;
        const hasSettings = localSettings && Object.keys(localSettings).length > 0;

        return hasProjects || hasSettings;
    }
}
