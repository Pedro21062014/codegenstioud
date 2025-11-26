const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let previewServer = null;
let wsServer = null;
let previewPort = 39284; // Random port for preview server
let wsPort = 39285; // WebSocket port for hot reload
const projectFiles = new Map(); // Store current project files
const wsClients = new Set(); // Store WebSocket clients

// Injection script for navigation tracking and hot reload
const injectionScript = `
<script>
(function() {
  console.log('[Preview] Navigation script loaded');
  
  // Connect to WebSocket for hot reload
  const ws = new WebSocket('ws://localhost:${wsPort}');
  
  ws.onmessage = function(event) {
    if (event.data === 'reload') {
      console.log('[Preview] Hot reload triggered');
      window.location.reload();
    }
  };
  
  ws.onerror = function(error) {
    console.error('[Preview] WebSocket error:', error);
  };
  
  // Intercept navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    console.log('[Preview] Navigation via pushState:', location.pathname);
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    console.log('[Preview] Navigation via replaceState:', location.pathname);
  };
  
  // Intercept link clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && !link.target && !link.download) {
      const url = new URL(link.href);
      // Only intercept same-origin links
      if (url.origin === window.location.origin) {
        e.preventDefault();
        const path = url.pathname + url.search + url.hash;
        history.pushState(null, '', path);
        console.log('[Preview] Link navigation to:', path);
        
        // Fetch and load the new page
        fetch(url.pathname)
          .then(response => response.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
          })
          .catch(err => console.error('[Preview] Navigation error:', err));
      }
    }
  }, true);
  
  // Handle popstate (back/forward buttons)
  window.addEventListener('popstate', function(e) {
    console.log('[Preview] Navigation via popstate:', location.pathname);
    fetch(location.pathname)
      .then(response => response.text())
      .then(html => {
        document.open();
        document.write(html);
        document.close();
      })
      .catch(err => console.error('[Preview] Navigation error:', err));
  });
})();
</script>
`;

// Create WebSocket server for hot reload
function createWebSocketServer() {
  if (wsServer) return;

  wsServer = new WebSocket.Server({ port: wsPort });

  wsServer.on('connection', (ws) => {
    console.log('[Preview] WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
      console.log('[Preview] WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[Preview] WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  console.log(`WebSocket server running on ws://localhost:${wsPort}`);
}

// Broadcast reload to all connected clients
function broadcastReload() {
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  });
}

// Create HTTP server for preview
function createPreviewServer() {
  if (previewServer) return;

  previewServer = http.createServer((req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse URL and remove query parameters
    const urlObj = new URL(req.url, `http://localhost:${previewPort}`);
    let filePath = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
    if (filePath.startsWith('/')) filePath = filePath.substring(1);

    // Get file content from stored project files
    let fileContent = projectFiles.get(filePath);

    if (fileContent) {
      // Determine content type
      let contentType = 'text/plain';
      if (filePath.endsWith('.html')) {
        contentType = 'text/html; charset=utf-8';
        // Inject navigation script into HTML files
        if (typeof fileContent === 'string' && fileContent.includes('</head>')) {
          fileContent = fileContent.replace('</head>', injectionScript + '</head>');
        } else if (typeof fileContent === 'string' && fileContent.includes('<body>')) {
          fileContent = fileContent.replace('<body>', '<body>' + injectionScript);
        } else if (typeof fileContent === 'string') {
          fileContent = injectionScript + fileContent;
        }
      }
      else if (filePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
      else if (filePath.endsWith('.json')) contentType = 'application/json; charset=utf-8';
      else if (filePath.endsWith('.png')) contentType = 'image/png';
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (filePath.endsWith('.gif')) contentType = 'image/gif';
      else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (filePath.endsWith('.woff')) contentType = 'font/woff';
      else if (filePath.endsWith('.woff2')) contentType = 'font/woff2';
      else if (filePath.endsWith('.ttf')) contentType = 'font/ttf';
      else if (filePath.endsWith('.eot')) contentType = 'application/vnd.ms-fontobject';
      else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';
      else if (filePath.endsWith('.webp')) contentType = 'image/webp';
      else if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
      else if (filePath.endsWith('.webm')) contentType = 'video/webm';
      else if (filePath.endsWith('.mp3')) contentType = 'audio/mpeg';
      else if (filePath.endsWith('.wav')) contentType = 'audio/wav';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fileContent);
    } else {
      // Try to serve index.html for SPA routing
      const indexContent = projectFiles.get('index.html');
      if (indexContent && !filePath.includes('.')) {
        let content = indexContent;
        if (typeof content === 'string' && content.includes('</head>')) {
          content = content.replace('</head>', injectionScript + '</head>');
        } else if (typeof content === 'string' && content.includes('<body>')) {
          content = content.replace('<body>', '<body>' + injectionScript);
        } else if (typeof content === 'string') {
          content = injectionScript + content;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>404 - Não Encontrado</title>
            <style>
              body { font-family: system-ui; padding: 2rem; max-width: 600px; margin: 0 auto; }
              h1 { color: #e74c3c; }
              code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>404 - Arquivo Não Encontrado</h1>
            <p>O arquivo <code>${filePath}</code> não existe no projeto.</p>
            <p><a href="/">← Voltar para a página inicial</a></p>
          </body>
          </html>
        `);
      }
    }
  });

  previewServer.listen(previewPort, 'localhost', () => {
    console.log(`Preview server running on http://localhost:${previewPort}`);
  });
}

// IPC: Update project files
ipcMain.handle('update-preview-files', async (event, files) => {
  const hasChanges = projectFiles.size !== files.length ||
    files.some(file => projectFiles.get(file.name) !== file.content);

  projectFiles.clear();
  files.forEach(file => {
    projectFiles.set(file.name, file.content);
  });

  // Broadcast reload if files changed
  if (hasChanges && wsClients.size > 0) {
    console.log('[Preview] Files updated, broadcasting reload to', wsClients.size, 'clients');
    broadcastReload();
  }

  return { port: previewPort, wsPort: wsPort };
});

// IPC: Get preview server port
ipcMain.handle('get-preview-port', async () => {
  return previewPort;
});


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create menu
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Original' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            shell.openExternal('https://github.com/your-repo');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createPreviewServer();
  createWebSocketServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationURL);
  });
});
