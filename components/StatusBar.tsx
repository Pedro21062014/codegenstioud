import React from 'react';
import { ProjectFile } from '../types';

interface StatusBarProps {
    activeFile: ProjectFile | null;
    cursorPosition?: { line: number; column: number };
    totalFiles: number;
    projectSize: string;
    isModified?: boolean;
}

const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js': case 'mjs': return 'JavaScript';
        case 'ts': return 'TypeScript';
        case 'tsx': return 'TypeScript React';
        case 'jsx': return 'JavaScript React';
        case 'html': return 'HTML';
        case 'css': return 'CSS';
        case 'json': return 'JSON';
        case 'md': return 'Markdown';
        case 'py': return 'Python';
        case 'java': return 'Java';
        case 'cpp': case 'cc': case 'cxx': return 'C++';
        case 'c': return 'C';
        case 'cs': return 'C#';
        case 'go': return 'Go';
        case 'rs': return 'Rust';
        case 'php': return 'PHP';
        case 'rb': return 'Ruby';
        case 'swift': return 'Swift';
        case 'kt': case 'kts': return 'Kotlin';
        default: return 'Text';
    }
};

const getFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getLineCount = (content: string): number => {
    return content.split('\n').length;
};

export const StatusBar: React.FC<StatusBarProps> = ({
    activeFile,
    cursorPosition,
    totalFiles,
    projectSize,
    isModified = false
}) => {
    return (
        <div className="h-6 bg-var-bg-muted border-t border-var-border-default flex items-center justify-between px-3 text-xs text-var-fg-muted flex-shrink-0">
            {/* Left side - File info */}
            <div className="flex items-center gap-4">
                {activeFile ? (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-var-fg-default">
                                {activeFile.name}
                            </span>
                            {isModified && (
                                <span className="w-2 h-2 rounded-full bg-var-accent animate-pulse" title="Arquivo modificado"></span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-var-fg-subtle">Tipo:</span>
                            <span>{getFileLanguage(activeFile.name)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-var-fg-subtle">Linhas:</span>
                            <span>{getLineCount(activeFile.content)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-var-fg-subtle">Tamanho:</span>
                            <span>{getFileSize(activeFile.content)}</span>
                        </div>
                    </>
                ) : (
                    <span>Nenhum arquivo aberto</span>
                )}
            </div>

            {/* Right side - Cursor position and project info */}
            <div className="flex items-center gap-4">
                {cursorPosition && (
                    <div className="flex items-center gap-1">
                        <span className="text-var-fg-subtle">Ln</span>
                        <span className="font-mono">{cursorPosition.line}</span>
                        <span className="text-var-fg-subtle">, Col</span>
                        <span className="font-mono">{cursorPosition.column}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <span className="text-var-fg-subtle">Arquivos:</span>
                    <span>{totalFiles}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-var-fg-subtle">Projeto:</span>
                    <span>{projectSize}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-var-fg-subtle">UTF-8</span>
                </div>
            </div>
        </div>
    );
};
