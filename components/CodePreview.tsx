import React, { useState, useEffect, useRef } from 'react';
import { ProjectFile, Theme } from '../types';
import { ExternalLinkIcon } from './Icons';

interface CodePreviewProps {
  files: ProjectFile[];
  onError: (errorMessage: string) => void;
  theme: Theme;
  envVars: Record<string, string>;
  initialPath: string;
  onNavigate: (path: string) => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ files, initialPath, onNavigate }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useElectron, setUseElectron] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  // Check if running in Electron
  useEffect(() => {
    const isElectron = !!(window.electronAPI);
    setUseElectron(isElectron);
    console.log('[Preview] Running in:', isElectron ? 'Electron' : 'Browser');

    if (isElectron) {
      window.electronAPI!.invoke('get-preview-port').then((port: number) => {
        console.log('[Preview] Electron server port:', port);
        setIsLoading(false);
      }).catch((err: Error) => {
        console.error('[Preview] Failed to get server port:', err);
        setError('Falha ao iniciar o servidor de preview');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Create blob URL for browser preview
  const createBrowserPreview = (files: ProjectFile[]): string => {
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    console.log('[Preview Browser] Total files:', files.length);
    console.log('[Preview Browser] File names:', files.map(f => f.name));

    // Find index.html - check if filename ends with index.html (handles paths like dir/index.html)
    const indexFile = files.find(f => {
      const lowerName = f.name.toLowerCase();
      return lowerName === 'index.html' ||
        lowerName.endsWith('/index.html') ||
        lowerName.endsWith('\\index.html');
    });

    if (!indexFile) {
      console.error('[Preview Browser] ❌ index.html NOT FOUND!');
      console.error('[Preview Browser] Available files:', files.map(f => `"${f.name}"`).join(', '));
      return '';
    }

    console.log('[Preview Browser] ✅ Found index.html:', indexFile.name);

    // Create a modified HTML that includes all resources inline
    let html = indexFile.content;

    // Inject navigation interceptor script
    const navigationScript = `
      <script>
        // Intercept navigation to handle multi-page apps in blob URLs
        (function() {
          console.log('[Preview Nav] Navigation interceptor loaded');
          
          // Intercept link clicks
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
              try {
                // Get the href attribute directly (not the resolved URL)
                const hrefAttr = link.getAttribute('href');
                console.log('[Preview Nav] Link clicked, href attr:', hrefAttr);
                
                if (!hrefAttr) return;
                
                // Check if it's a relative link to an HTML file
                if (hrefAttr.endsWith('.html') || hrefAttr === '/' || hrefAttr === 'index.html') {
                  e.preventDefault();
                  console.log('[Preview Nav] Intercepted navigation to:', hrefAttr);
                  
                  // Send message to parent to load new page
                  window.parent.postMessage({
                    type: 'navigate',
                    path: hrefAttr
                  }, '*');
                }
              } catch (err) {
                console.error('[Preview Nav] Error intercepting link:', err);
              }
            }
          }, true);
        })();
      </script>
    `;

    // Inject CSS files
    files.filter(f => f.name.endsWith('.css')).forEach(cssFile => {
      console.log('[Preview Browser] Injecting CSS:', cssFile.name);
      const cssTag = `<style data-file="${cssFile.name}">\n${cssFile.content}\n</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${cssTag}\n</head>`);
      } else {
        html = cssTag + html;
      }
    });

    // Inject JS files
    files.filter(f => f.name.endsWith('.js')).forEach(jsFile => {
      console.log('[Preview Browser] Injecting JS:', jsFile.name);
      const scriptTag = `<script data-file="${jsFile.name}">\n${jsFile.content}\n</script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        html = html + scriptTag;
      }
    });

    // Inject navigation script at the end
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${navigationScript}\n</body>`);
    } else {
      html = html + navigationScript;
    }

    // Create blob URL
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    blobUrlsRef.current.push(url);

    console.log('[Preview Browser] ✅ Created blob URL:', url);
    return url;
  };

  // Listen for navigation messages from iframe
  useEffect(() => {
    if (useElectron) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate') {
        const path = event.data.path as string;
        console.log('[Preview Browser] Received navigation request:', path);

        // Find the HTML file to load
        let targetFile = path;
        if (path === '/' || path === '') {
          targetFile = 'index.html';
        } else if (path.startsWith('/')) {
          targetFile = path.substring(1);
        }

        // Find file (with or without directory path)
        const htmlFile = files.find(f => {
          const lowerName = f.name.toLowerCase();
          const lowerTarget = targetFile.toLowerCase();
          return lowerName === lowerTarget ||
            lowerName.endsWith('/' + lowerTarget) ||
            lowerName.endsWith('\\' + lowerTarget);
        });

        if (htmlFile) {
          console.log('[Preview Browser] Loading file:', htmlFile.name);
          // Temporarily replace index.html with the target file for preview
          const tempFiles = files.map(f =>
            f.name === htmlFile.name
              ? { ...htmlFile, name: 'index.html' }
              : f.name.toLowerCase().includes('index.html')
                ? { ...f, name: '_original_index.html' }
                : f
          );
          const url = createBrowserPreview(tempFiles);
          if (url) {
            setPreviewUrl(url);
          }
        } else {
          console.warn('[Preview Browser] File not found:', targetFile);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, useElectron]);

  // Update preview for Electron
  useEffect(() => {
    if (!useElectron || !window.electronAPI || files.length === 0) return;

    console.log('[Preview Electron] Updating files:', files.length);
    setIsLoading(true);

    window.electronAPI.invoke('update-preview-files', files)
      .then((result: { port: number }) => {
        const path = initialPath === '/' ? '/index.html' : initialPath;
        const url = `http://localhost:${result.port}${path}`;
        console.log('[Preview Electron] URL:', url);
        setPreviewUrl(url);
        setIsLoading(false);
        setError(null);
      })
      .catch((err: Error) => {
        console.error('[Preview Electron] Error:', err);
        setError('Erro ao atualizar arquivos do preview');
        setIsLoading(false);
      });
  }, [files, initialPath, useElectron]);

  // Update preview for Browser
  useEffect(() => {
    if (useElectron || files.length === 0) return;

    console.log('[Preview Browser] Creating preview for', files.length, 'files');
    setIsLoading(true);

    try {
      const url = createBrowserPreview(files);
      if (url) {
        console.log('[Preview Browser] ✅ Preview URL set');
        setPreviewUrl(url);
        setError(null);
      } else {
        console.error('[Preview Browser] ❌ No URL created');
        setError('Arquivo index.html não encontrado');
      }
    } catch (err) {
      console.error('[Preview Browser] ❌ Error:', err);
      setError('Erro ao criar preview no navegador');
    } finally {
      setIsLoading(false);
    }
  }, [files, useElectron]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      if (useElectron) {
        iframeRef.current.src = iframeRef.current.src;
      } else {
        const url = createBrowserPreview(files);
        if (url) {
          setPreviewUrl(url);
        }
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Erro ao carregar o preview');
  };

  if (isLoading && !previewUrl) {
    return (
      <div className="w-full h-full bg-var-bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-var-accent mb-3"></div>
          <p className="text-var-fg-muted">Iniciando preview...</p>
          <p className="text-xs text-var-fg-muted mt-2">
            {useElectron ? 'Modo Electron' : 'Modo Navegador'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-var-bg-muted flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Erro no Preview</h2>
          <p className="text-var-fg-muted mb-3">{error}</p>
          <p className="text-xs text-var-fg-muted">
            Rodando em: {useElectron ? 'Electron' : 'Navegador'}
          </p>
        </div>
      </div>
    );
  }

  if (files.length === 0 || !files.some(f => f.name.toLowerCase().endsWith('.html'))) {
    return (
      <div className="w-full h-full bg-var-bg-muted flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-var-fg-muted mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum arquivo HTML encontrado</h2>
          <p className="text-var-fg-muted">Adicione um arquivo index.html para ver o preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-var-bg-muted flex flex-col">
      <div className="flex items-center p-2 bg-var-bg-subtle border-b border-var-border-muted flex-shrink-0">
        <div className="flex-1 flex items-center gap-2">
          {isLoading && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-var-accent"></div>
          )}
          <span className="text-xs px-2 py-0.5 rounded bg-var-bg-interactive text-var-fg-muted">
            {useElectron ? '⚡ Electron' : '🌐 Browser'}
          </span>
          <input
            type="text"
            readOnly
            value={useElectron ? previewUrl : 'Preview no Navegador'}
            className="flex-1 px-2 py-1 text-sm bg-var-bg-input border border-var-border-input rounded"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="ml-2 p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
          title="Atualizar preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {useElectron && (
          <button
            onClick={handleOpenInNewTab}
            className="ml-2 p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
            title="Abrir em nova guia"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 w-full h-full relative">
        {previewUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-var-bg-muted flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-var-accent mb-3"></div>
                  <p className="text-var-fg-muted">Carregando preview...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={previewUrl}
              src={previewUrl}
              title="Project Preview"
              className="w-full h-full border-0"
              style={{ background: 'white' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-var-accent"></div>
          </div>
        )}
      </div>
    </div>
  );
};
