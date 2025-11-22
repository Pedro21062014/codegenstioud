import { ProjectFile } from '../types';

interface CodeSandboxFile {
    content: string;
    isBinary?: boolean;
}

interface CodeSandboxFiles {
    [path: string]: CodeSandboxFile;
}

/**
 * Deploy project files to CodeSandbox and get a shareable URL
 */
export async function deployToCodeSandbox(files: ProjectFile[]): Promise<string> {
    try {
        // Format files for CodeSandbox API
        const formattedFiles = formatFilesForCodeSandbox(files);

        // Use the define endpoint with parameters
        const parameters = btoa(JSON.stringify({ files: formattedFiles }));

        // This URL will redirect to the created sandbox
        const defineUrl = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;

        // Try to fetch the sandbox ID using a workaround
        try {
            const response = await fetch(defineUrl, {
                method: 'GET',
                redirect: 'follow'
            });

            // If successful, extract sandbox ID from the response URL
            if (response.url && response.url.includes('codesandbox.io/s/')) {
                const sandboxId = response.url.split('/s/')[1].split('?')[0];
                const shareUrl = `https://codesandbox.io/s/${sandboxId}`;

                // Open in browser
                if (typeof window !== 'undefined' && window.open) {
                    window.open(shareUrl, '_blank', 'noopener,noreferrer');
                }

                return shareUrl;
            }
        } catch (fetchError) {
            console.log('Fetch failed, using direct URL method');
        }

        // Fallback: use the define URL directly
        if (typeof window !== 'undefined' && window.open) {
            window.open(defineUrl, '_blank', 'noopener,noreferrer');
        }

        // Return a shortened message since the actual URL is very long
        return defineUrl;
    } catch (error) {
        console.error('Error deploying to CodeSandbox:', error);

        if (error instanceof Error) {
            throw new Error(`Erro ao gerar link: ${error.message}`);
        }

        throw new Error('Falha ao compartilhar no CodeSandbox');
    }
}

/**
 * Convert project files to CodeSandbox format
 */
function formatFilesForCodeSandbox(files: ProjectFile[]): CodeSandboxFiles {
    const formattedFiles: CodeSandboxFiles = {};

    // Add package.json if not present (required for some projects)
    const hasPackageJson = files.some(f => f.name === 'package.json');
    if (!hasPackageJson) {
        formattedFiles['package.json'] = {
            content: JSON.stringify({
                name: 'shared-project',
                version: '1.0.0',
                description: 'Project shared from CodeGenStudio',
                main: 'index.html',
                scripts: {},
                dependencies: {}
            }, null, 2),
            isBinary: false
        };
    }

    // Convert each file
    for (const file of files) {
        const isBinary = file.language === 'image';

        formattedFiles[file.name] = {
            content: file.content,
            isBinary
        };
    }

    return formattedFiles;
}

/**
 * Generate a preview URL without deploying (for quick preview)
 * This creates a URL that can be opened directly
 */
export function generateCodeSandboxPreviewUrl(files: ProjectFile[]): string {
    const formattedFiles = formatFilesForCodeSandbox(files);
    const parameters = btoa(JSON.stringify({ files: formattedFiles }));

    return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
}
