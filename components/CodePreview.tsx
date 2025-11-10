import React, { useState, useEffect, useRef } from 'react';
import { ProjectFile, Theme } from '../types';
import { ExternalLinkIcon } from './Icons';

declare global {
  interface Window {
    Babel: any;
  }
}

const LOADING_HTML = `
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body class="bg-gray-900 text-gray-300">
  <div class="flex flex-col items-center justify-center h-screen">
    <svg class="animate-spin h-8 w-8 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-lg font-medium">Construindo sua aplicação...</p>
  </div>
</body>
</html>
`;

const BASE_IMPORT_MAP = {
  imports: {
    "react": "https://esm.sh/react@^19.1.0",
    "react/": "https://esm.sh/react@^19.1.0/",
    "react-dom": "https://esm.sh/react-dom@^19.1.1",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@^2.44.4",
  }
};


const resolvePath = (base: string, relative: string): string => {
  const stack = base.split('/');
  stack.pop();
  const parts = relative.split('/');

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
};

interface CodePreviewProps {
    files: ProjectFile[];
    onError: (errorMessage: string) => void;
    theme: Theme;
    envVars: Record<string, string>;
    initialPath: string;
    onNavigate: (path: string) => void; // New prop for internal navigation
}

export const CodePreview: React.FC<CodePreviewProps> = ({ files, onError, theme, envVars, initialPath, onNavigate }) => {
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
  const [fileUrls, setFileUrls] = useState<Map<string, string>>(new Map());
  const iframeRef = useRef<HTMLIFrameElement>(null); // Ref for the iframe

  useEffect(() => {
    let urlsToRevoke: string[] = [];

    const generatePreview = async () => {
        if (files.length === 0) return { src: undefined, urls: new Map(), urlsToRevoke: [] };
        if (!window.Babel) {
            onError("Babel.js não foi carregado.");
            const blob = new Blob([LOADING_HTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            return { src: url, urls: new Map(), urlsToRevoke: [url] };
        }

        const allFilesMap = new Map(files.map(f => [f.name, f]));
        const jsFiles = files.filter(f => /\.(tsx|ts|jsx|js)$/.test(f.name));
        const cssFiles = files.filter(f => f.name.endsWith('.css'));
        const imageFiles = files.filter(f => /\.(png|jpe?g|gif|svg|webp)$/i.test(f.name));
        const htmlFiles = files.filter(f => f.name.toLowerCase().endsWith('.html'));

        let createdUrls: string[] = [];
        const blobUrls = new Map<string, string>();
        const importMap = JSON.parse(JSON.stringify(BASE_IMPORT_MAP));

        try {
             // Process assets (CSS, images)
            for (const file of [...cssFiles, ...imageFiles]) {
                let blob: Blob;
                if (file.language === 'image') {
                    const byteCharacters = atob(file.content);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const mimeType = `image/${file.name.split('.').pop() || 'png'}`;
                    blob = new Blob([byteArray], { type: mimeType });
                } else {
                    blob = new Blob([file.content], { type: 'text/css' });
                }
                const url = URL.createObjectURL(blob);
                createdUrls.push(url);
                blobUrls.set(file.name, url);
            }

            // Transpile JS/TS files
            for (const file of jsFiles) {
                let content = file.content;
                const importRegex = /(from\s*|import\s*\()(["'])([^"']+)(["'])/g;
                content = content.replace(importRegex, (match, prefix, openQuote, path, closeQuote) => {
                    const isExternal = Object.keys(BASE_IMPORT_MAP.imports).some(pkg => path === pkg || path.startsWith(pkg + '/'));
                    if (isExternal || path.startsWith('http')) return match;

                    let absolutePath = path.startsWith('.') ? resolvePath(file.name, path) : path;
                    if (absolutePath.startsWith('/')) absolutePath = absolutePath.substring(1);

                    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
                    for (const ext of extensions) {
                        if (allFilesMap.has(absolutePath + ext)) {
                            return `${prefix}${openQuote}/${absolutePath + ext}${closeQuote}`;
                        }
                    }
                    return match;
                });

                const transformedCode = window.Babel.transform(content, {
                    presets: ['react', ['typescript', { allExtensions: true, isTSX: file.name.endsWith('.tsx') }]],
                    filename: file.name,
                }).code;
                
                const blob = new Blob([transformedCode], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                createdUrls.push(url);
                importMap.imports[`/${file.name}`] = url;
            }

            // Process HTML files
            const htmlContents: { [key: string]: string } = {};
            for (const htmlFile of htmlFiles) {
                let content = htmlFile.content;
                content = content.replace(/(src|href)=["']((?:\.\/|\/)?)([^"']+)["']/g, (match, attr, prefix, path) => {
                    const resolvedPath = resolvePath(htmlFile.name, path);
                    if (blobUrls.has(resolvedPath)) {
                        return `${attr}="${blobUrls.get(resolvedPath)}"`;
                    }
                     if (allFilesMap.has(resolvedPath) && resolvedPath.endsWith('.html')) {
                        return `${attr}="/${resolvedPath}"`;
                    }
                    return match;
                });
                
                const envContent = `window.process = { env: ${JSON.stringify(envVars)} };`;
                const navigationScript = `
                    <script>
                        (function() {
                            console.log('Initializing navigation script...');
                            
                            // Store the original base URL
                            const baseUrl = window.location.href;
                            
                            // Function to handle internal navigation
                            function navigateToPath(path) {
                                console.log('Navigating to:', path);
                                window.parent.postMessage({ 
                                    type: 'navigate', 
                                    path: path 
                                }, '*');
                            }

                            // Function to check if URL is internal
                            function isInternal(url) {
                                try {
                                    // If it's a relative path, it's internal
                                    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                                        return true;
                                    }
                                    
                                    // For absolute URLs, check if same origin as blob URL
                                    const parsedUrl = new URL(url, baseUrl);
                                    const currentOrigin = new URL(baseUrl).origin;
                                    return parsedUrl.origin === currentOrigin;
                                } catch (e) {
                                    // If URL parsing fails, assume it's internal if it looks like a path
                                    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
                                }
                            }

                            // Intercept clicks on all elements
                            document.addEventListener('click', function(event) {
                                const target = event.target;
                                
                                // Handle links
                                const link = target.closest('a');
                                if (link && link.href) {
                                    console.log('Link clicked:', link.href);
                                    
                                    if (isInternal(link.href)) {
                                        event.preventDefault();
                                        const url = new URL(link.href);
                                        const path = url.pathname + url.search + url.hash;
                                        navigateToPath(path);
                                    } else {
                                        // External link - open in new tab
                                        event.preventDefault();
                                        window.open(link.href, '_blank');
                                    }
                                    return;
                                }

                                // Handle buttons with onclick
                                const button = target.closest('button');
                                if (button) {
                                    const onclick = button.getAttribute('onclick');
                                    if (onclick) {
                                        console.log('Button onclick:', onclick);
                                        
                                        // Simple pattern matching for navigation
                                        const hrefMatch = onclick.match(/(?:window\.location|location)\.href\s*=\s*['"]([^'"]+)['"]/);
                                        if (hrefMatch) {
                                            event.preventDefault();
                                            const url = hrefMatch[1];
                                            if (isInternal(url)) {
                                                navigateToPath(url.startsWith('/') ? url : '/' + url);
                                            } else {
                                                window.open(url, '_blank');
                                            }
                                        }
                                    }
                                }
                            });

                            // Intercept form submissions
                            document.addEventListener('submit', function(event) {
                                const form = event.target;
                                if (form && form.action) {
                                    console.log('Form submitted:', form.action);
                                    
                                    if (isInternal(form.action)) {
                                        event.preventDefault();
                                        const url = new URL(form.action);
                                        const path = url.pathname + url.search;
                                        navigateToPath(path);
                                    }
                                }
                            });

                            // Override location methods (simplified)
                            const originalLocation = window.location;
                            try {
                                Object.defineProperty(window, 'location', {
                                    get: function() { return originalLocation; },
                                    set: function(value) {
                                        if (value && typeof value === 'string') {
                                            if (isInternal(value)) {
                                                navigateToPath(value);
                                            } else {
                                                originalLocation.href = value;
                                            }
                                        }
                                    }
                                });
                            } catch (e) {
                                console.warn('Could not override location object:', e);
                            }

                            console.log('Navigation script initialized');
                        })();
                    </script>
                `;
                const scriptContent = `\n                    <script>document.documentElement.className = '${theme}';</script>\n                    <script type="importmap">${JSON.stringify(importMap)}</script>\n                    ${navigationScript}\n                    <script type="module">import '/${jsFiles.find(f => f.name.includes('main') || f.name.includes('index'))?.name}';</script>\n                `;
                content = content.replace('</head>', `${scriptContent}</head>`);
                htmlContents[htmlFile.name] = content;
            }
            
            const finalFileUrls = new Map<string, string>();
            for(const [name, content] of Object.entries(htmlContents)) {
                const blob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                createdUrls.push(url);
                finalFileUrls.set(`/${name}`, url);
                if (name === 'index.html') {
                  finalFileUrls.set('/', url);
                }
            }

            // Try to find the requested path first
            let entryPath = initialPath;
            let entryUrl = finalFileUrls.get(entryPath);
            
            // If not found, try to find any HTML file
            if (!entryUrl) {
                // Look for index.html first
                if (finalFileUrls.has('/index.html')) {
                    entryPath = '/index.html';
                    entryUrl = finalFileUrls.get('/index.html');
                } 
                // If no index.html, try any other HTML file
                else if (htmlFiles.length > 0) {
                    entryPath = `/${htmlFiles[0].name}`;
                    entryUrl = finalFileUrls.get(entryPath);
                }
                // If no HTML files at all, show error
                else {
                    const message = `
                    <!DOCTYPE html><html lang="pt-BR" class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin: 0;"><div style="font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #c9d1d9; background-color: #0d1117; padding: 2rem; text-align: center; box-sizing: border-box;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #484f58; margin-bottom: 1rem;"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg><h2 style="font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem 0;">Nenhum arquivo HTML encontrado</h2><p style="color: #8b949e; max-width: 450px; line-height: 1.5; margin: 0;">Não há nenhum arquivo HTML no projeto para visualizar. Adicione um arquivo <code>index.html</code> ou outro arquivo HTML para começar.</p></div></body></html>
                    `;
                    const blob = new Blob([message], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    return { src: url, urls: new Map(), urlsToRevoke: [url] };
                }
            }

            return { src: entryUrl, urls: finalFileUrls, urlsToRevoke: createdUrls };
        
        } catch (error) {
            console.error("Error generating preview:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error.";
            onError(errorMessage);
            const errorBlob = new Blob([`<div class="p-4 text-red-400 bg-var-bg-subtle"><pre>Erro ao gerar a visualização:\n${errorMessage}</pre></div>`], { type: 'text/html' });
            const errorUrl = URL.createObjectURL(errorBlob);
            return { src: errorUrl, urls: new Map(), urlsToRevoke: [...createdUrls, errorUrl] };
        }
    };

    setIframeSrc(undefined);

    generatePreview().then(result => {
        setFileUrls(result.urls);
        const urlToShow = result.urls.get(initialPath) || result.urls.get('/') || result.src;
        setIframeSrc(urlToShow);
        urlsToRevoke = result.urlsToRevoke;
    });

    return () => {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files, onError, theme, envVars, onNavigate]);

  useEffect(() => {
    const newSrc = fileUrls.get(initialPath) || fileUrls.get('/');
    if (newSrc && newSrc !== iframeSrc) {
        setIframeSrc(newSrc);
    }
  }, [initialPath, fileUrls, iframeSrc]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeSrc) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate') {
        const path = event.data.path;
        if (fileUrls.has(path)) {
          onNavigate(path);
        }
      }
    };

    const handleLoad = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) return;

        const handleClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const anchor = target.closest('a');

          if (anchor && anchor.href) {
            const url = new URL(anchor.href);
            const currentOrigin = new URL(iframeSrc!).origin;

            if (url.origin === currentOrigin) {
              const path = url.pathname;
              if (fileUrls.has(path)) {
                event.preventDefault();
                onNavigate(path);
              }
            }
          }

          // Handle button clicks that might navigate
          const button = target.closest('button');
          if (button) {
            const onclick = button.getAttribute('onclick');
            if (onclick) {
              // Check for common navigation patterns in onclick
              const locationMatch = onclick.match(/window\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/);
              if (locationMatch) {
                const path = locationMatch[1];
                if (fileUrls.has(path) || fileUrls.has('/' + path)) {
                  event.preventDefault();
                  onNavigate(path.startsWith('/') ? path : '/' + path);
                }
              }
            }
          }
        };

        const handleSubmit = (event: Event) => {
          const form = event.target as HTMLFormElement;
          if (form && form.action) {
            const url = new URL(form.action, iframeSrc);
            const currentOrigin = new URL(iframeSrc!).origin;

            if (url.origin === currentOrigin) {
              const path = url.pathname;
              if (fileUrls.has(path)) {
                event.preventDefault();
                onNavigate(path);
              }
            }
          }
        };

        iframeWindow.document.addEventListener('click', handleClick);
        iframeWindow.document.addEventListener('submit', handleSubmit);
        return () => {
          iframeWindow.document.removeEventListener('click', handleClick);
          iframeWindow.document.removeEventListener('submit', handleSubmit);
        };
      } catch (error) {
        console.warn("Could not attach click listener to iframe (likely due to cross-origin restrictions or iframe not fully loaded):", error);
      }
    };

    window.addEventListener('message', handleMessage);
    iframe.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('message', handleMessage);
      iframe.removeEventListener('load', handleLoad);
    };
  }, [iframeSrc, fileUrls, onNavigate]);

  const handleOpenInNewTab = () => {
    if (iframeSrc) {
      window.open(iframeSrc, '_blank');
    }
  };

  return (
    <div className="w-full h-full bg-var-bg-muted flex flex-col">
      <div className="flex items-center p-2 bg-var-bg-subtle border-b border-var-border-muted">
        <div className="flex-1">
          <input
            type="text"
            readOnly
            value={`http://localhost:3000${initialPath}`}
            className="w-full px-2 py-1 text-sm bg-var-bg-input border border-var-border-input rounded"
            title="URL de visualização local"
            aria-label="URL de visualização local"
          />
        </div>
        <button
          onClick={handleOpenInNewTab}
          className="ml-2 p-1.5 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
          title="Abrir em nova guia"
          aria-label="Abrir em nova guia"
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 w-full h-full">
        {iframeSrc === undefined && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg font-medium">Construindo sua aplicação...</p>
          </div>
        )}
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            key={iframeSrc}
            src={iframeSrc}
            title="Project Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; gyroscope; microphone; midi; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; web-share; xr-spatial-tracking"
          />
        )}
      </div>
    </div>
  );
};
