import { UserSettings, SavedProject } from '../types';

const LOCAL_STORAGE_KEYS = {
  USER_SETTINGS: 'codegen-local-user-settings',
  SAVED_PROJECTS: 'codegen-local-saved-projects',
  IS_PRO_USER: 'is-pro-user',
  THEME: 'theme',
  DAILY_USAGE: 'dailyUsage',
  DAILY_USAGE_DATE: 'dailyUsageDate'
};

export class LocalStorageService {
  // User Settings
  static saveUserSettings(settings: Partial<UserSettings>): void {
    try {
      const existingSettings = this.getUserSettings();
      const updatedSettings = { ...existingSettings, ...settings };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving user settings to localStorage:', error);
    }
  }

  static getUserSettings(): UserSettings | null {
    try {
      const settings = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading user settings from localStorage:', error);
      return null;
    }
  }

  static clearUserSettings(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_SETTINGS);
    } catch (error) {
      console.error('Error clearing user settings from localStorage:', error);
    }
  }

  // Saved Projects
  static saveProjects(projects: SavedProject[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  }

  static getProjects(): SavedProject[] {
    try {
      const projects = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PROJECTS);
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  }

  static addProject(project: SavedProject): void {
    try {
      const projects = this.getProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      if (existingIndex !== -1) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }
      
      this.saveProjects(projects);
    } catch (error) {
      console.error('Error adding project to localStorage:', error);
    }
  }

  static updateProject(projectId: number, updates: Partial<SavedProject>): void {
    try {
      const projects = this.getProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...updates };
        this.saveProjects(projects);
      }
    } catch (error) {
      console.error('Error updating project in localStorage:', error);
    }
  }

  static deleteProject(projectId: number): void {
    try {
      const projects = this.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      this.saveProjects(filteredProjects);
    } catch (error) {
      console.error('Error deleting project from localStorage:', error);
    }
  }

  static clearProjects(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SAVED_PROJECTS);
    } catch (error) {
      console.error('Error clearing projects from localStorage:', error);
    }
  }

  // Pro User Status
  static setIsProUser(isPro: boolean): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.IS_PRO_USER, JSON.stringify(isPro));
    } catch (error) {
      console.error('Error saving pro user status to localStorage:', error);
    }
  }

  static getIsProUser(): boolean {
    try {
      const isPro = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_PRO_USER);
      return isPro ? JSON.parse(isPro) : false;
    } catch (error) {
      console.error('Error loading pro user status from localStorage:', error);
      return false;
    }
  }

  // Theme
  static setTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  static getTheme(): 'light' | 'dark' {
    try {
      const theme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
      return (theme === 'light' || theme === 'dark') ? theme : 'light';
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      return 'light';
    }
  }

  // Daily Usage
  static setDailyUsage(usage: number): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_USAGE, usage.toString());
    } catch (error) {
      console.error('Error saving daily usage to localStorage:', error);
    }
  }

  static getDailyUsage(): number {
    try {
      const usage = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_USAGE);
      return usage ? parseInt(usage, 10) : 0;
    } catch (error) {
      console.error('Error loading daily usage from localStorage:', error);
      return 0;
    }
  }

  static setDailyUsageDate(date: string): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_USAGE_DATE, date);
    } catch (error) {
      console.error('Error saving daily usage date to localStorage:', error);
    }
  }

  static getDailyUsageDate(): string | null {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_USAGE_DATE);
    } catch (error) {
      console.error('Error loading daily usage date from localStorage:', error);
      return null;
    }
  }

  // Utility methods
  static clearAllLocalData(): void {
    try {
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  static getStorageSize(): string {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      const kb = totalSize / 1024;
      const mb = kb / 1024;
      
      if (mb > 1) {
        return `${mb.toFixed(2)} MB`;
      } else {
        return `${kb.toFixed(2)} KB`;
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return '0 KB';
    }
  }
}
