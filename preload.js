const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,

  // App version
  getVersion: () => ipcRenderer.invoke('app-version'),

  // File operations
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (data, filename) => ipcRenderer.invoke('dialog:saveFile', data, filename),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),


  // System information
  getSystemInfo: () => ipcRenderer.invoke('system:info'),

  // Generic IPC invoke for preview server communication
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});

// Remove the loading screen when the app is ready
window.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
});
