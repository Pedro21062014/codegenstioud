import { SavedProject, UserSettings } from '../types';
import { firebaseService } from './firebase';
import { LocalStorageService } from './localStorageService';

export class FirebaseProjectService {
  // Projetos
  static async saveProject(project: Omit<SavedProject, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: SavedProject; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const projectData = {
        ...project,
        user_id: user.uid
      };

      const result = await firebaseService.db.projects.create(projectData);
      
      if (result.success) {
        const savedProject: SavedProject = {
          id: result.data.id,
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: savedProject };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updateProject(projectId: string, updates: Partial<SavedProject>): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.projects.update(projectId, {
        ...updates,
        user_id: user.uid // Garantir que o usuário é o dono
      });

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getProject(projectId: string): Promise<{ success: boolean; data?: SavedProject; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.projects.get(projectId);
      
      if (result.success && result.data.user_id === user.uid) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: 'Projeto não encontrado ou acesso negado' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getAllProjects(): Promise<{ success: boolean; data?: SavedProject[]; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.projects.getAll(user.uid);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se o usuário é o dono do projeto
      const projectResult = await firebaseService.db.projects.get(projectId);
      if (!projectResult.success) {
        return { success: false, error: 'Projeto não encontrado' };
      }

      if (projectResult.data.user_id !== user.uid) {
        return { success: false, error: 'Acesso negado' };
      }

      const result = await firebaseService.db.projects.delete(projectId);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Configurações do Usuário
  static async saveUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.profiles.update(user.uid, settings);
      
      // Também salvar no localStorage como backup
      LocalStorageService.saveUserSettings({ ...settings, id: user.uid });

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getUserSettings(): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await firebaseService.db.profiles.get(user.uid);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        // Se não encontrar no Firebase, tentar do localStorage
        const localSettings = LocalStorageService.getUserSettings();
        if (localSettings) {
          return { success: true, data: localSettings };
        }
        return { success: false, error: 'Configurações não encontradas' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sincronização entre Firebase e LocalStorage
  static async syncFromLocal(): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      if (!user) {
        return { success: false, synced: 0, error: 'Usuário não autenticado' };
      }

      const localProjects = LocalStorageService.getProjects();
      let syncedCount = 0;

      for (const project of localProjects) {
        const projectData = {
          name: project.name,
          files: project.files,
          chat_history: project.chat_history,
          env_vars: project.env_vars,
          user_id: user.uid
        };

        const result = await firebaseService.db.projects.create(projectData);
        if (result.success) {
          syncedCount++;
        }
      }

      if (syncedCount > 0) {
        // Limpar projetos locais após sincronização
        LocalStorageService.clearProjects();
      }

      return { success: true, synced: syncedCount };
    } catch (error: any) {
      return { success: false, synced: 0, error: error.message };
    }
  }

  static async syncToLocal(): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      const result = await this.getAllProjects();
      
      if (result.success && result.data) {
        LocalStorageService.saveProjects(result.data);
        return { success: true, synced: result.data.length };
      } else {
        return { success: false, synced: 0, error: result.error };
      }
    } catch (error: any) {
      return { success: false, synced: 0, error: error.message };
    }
  }

  // Utilitários
  static async isOnline(): Promise<boolean> {
    try {
      const user = await firebaseService.auth.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  static onAuthStateChanged(callback: (user: any) => void) {
    return firebaseService.auth.onAuthStateChanged(callback);
  }
}
