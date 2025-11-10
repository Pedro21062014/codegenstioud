import { ProjectVersion, ProjectFile, ChatMessage } from '../types';

export class ProjectVersionService {
  private static readonly STORAGE_KEY = 'codegen-project-versions';

  static saveVersion(
    projectName: string,
    files: ProjectFile[],
    chatHistory: ChatMessage[],
    envVars: Record<string, string>,
    description?: string
  ): void {
    try {
      const versions = this.getAllVersions(projectName);
      const newVersion: ProjectVersion = {
        id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        description: description || `Versão salva em ${new Date().toLocaleString('pt-BR')}`,
        files: JSON.parse(JSON.stringify(files)),
        chatHistory: JSON.parse(JSON.stringify(chatHistory)),
        envVars: JSON.parse(JSON.stringify(envVars))
      };

      versions.push(newVersion);
      
      // Manter apenas as últimas 20 versões para não sobrecarregar o storage
      if (versions.length > 20) {
        versions.splice(0, versions.length - 20);
      }

      const allVersions = this.getAllVersionsFromStorage();
      allVersions[projectName] = versions;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allVersions));
    } catch (error) {
      console.error('Erro ao salvar versão do projeto:', error);
    }
  }

  static getAllVersions(projectName: string): ProjectVersion[] {
    try {
      const allVersions = this.getAllVersionsFromStorage();
      return allVersions[projectName] || [];
    } catch (error) {
      console.error('Erro ao carregar versões do projeto:', error);
      return [];
    }
  }

  static getAllVersionsFromStorage(): Record<string, ProjectVersion[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Erro ao carregar versões do storage:', error);
      return {};
    }
  }

  static restoreVersion(projectName: string, versionId: string): ProjectVersion | null {
    try {
      const versions = this.getAllVersions(projectName);
      const version = versions.find(v => v.id === versionId);
      
      if (!version) {
        console.error('Versão não encontrada:', versionId);
        return null;
      }

      return {
        id: version.id,
        timestamp: version.timestamp,
        description: version.description,
        files: JSON.parse(JSON.stringify(version.files)),
        chatHistory: JSON.parse(JSON.stringify(version.chatHistory)),
        envVars: JSON.parse(JSON.stringify(version.envVars))
      };
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      return null;
    }
  }

  static deleteVersion(projectName: string, versionId: string): boolean {
    try {
      const allVersions = this.getAllVersionsFromStorage();
      const versions = allVersions[projectName] || [];
      
      const index = versions.findIndex(v => v.id === versionId);
      if (index === -1) {
        return false;
      }

      versions.splice(index, 1);
      allVersions[projectName] = versions;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allVersions));
      return true;
    } catch (error) {
      console.error('Erro ao excluir versão:', error);
      return false;
    }
  }

  static clearAllVersions(projectName: string): void {
    try {
      const allVersions = this.getAllVersionsFromStorage();
      delete allVersions[projectName];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allVersions));
    } catch (error) {
      console.error('Erro ao limpar versões do projeto:', error);
    }
  }

  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }
}
