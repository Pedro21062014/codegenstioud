import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { getFileIcon } from './FileIconHelper';
import { FolderClosedIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon } from './Icons';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    isExpanded?: boolean;
}

interface FileTreeProps {
    files: ProjectFile[];
    activeFile: string | null;
    onFileSelect: (fileName: string) => void;
    onRenameFile?: (oldName: string, newName: string) => void;
    onDeleteFile?: (fileName: string) => void;
}

// Convert flat file list to tree structure
const buildFileTree = (files: ProjectFile[]): FileNode[] => {
    const root: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    files.forEach(file => {
        const parts = file.name.split('/');
        let currentLevel = root;
        let currentPath = '';

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isFile = index === parts.length - 1;

            if (isFile) {
                currentLevel.push({
                    name: part,
                    path: file.name,
                    type: 'file'
                });
            } else {
                let folder = folderMap.get(currentPath);
                if (!folder) {
                    folder = {
                        name: part,
                        path: currentPath,
                        type: 'folder',
                        children: [],
                        isExpanded: false
                    };
                    folderMap.set(currentPath, folder);
                    currentLevel.push(folder);
                }
                currentLevel = folder.children!;
            }
        });
    });

    // Sort: folders first, then files, both alphabetically
    const sortNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        }).map(node => {
            if (node.children) {
                node.children = sortNodes(node.children);
            }
            return node;
        });
    };

    return sortNodes(root);
};

const FileTreeNode: React.FC<{
    node: FileNode;
    level: number;
    activeFile: string | null;
    onFileSelect: (fileName: string) => void;
    onToggle: (path: string) => void;
    expandedFolders: Set<string>;
}> = ({ node, level, activeFile, onFileSelect, onToggle, expandedFolders }) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = node.type === 'file' && activeFile === node.path;

    const handleClick = () => {
        if (node.type === 'folder') {
            onToggle(node.path);
        } else {
            onFileSelect(node.path);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${isActive ? 'bg-var-accent/20 text-var-accent' : 'text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {node.type === 'folder' && (
                    <span className="flex-shrink-0">
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </span>
                )}
                {node.type === 'folder' ? (
                    isExpanded ? <FolderOpenIcon className="w-4 h-4 flex-shrink-0 text-var-accent" /> : <FolderClosedIcon className="w-4 h-4 flex-shrink-0" />
                ) : (
                    getFileIcon(node.name, "w-4 h-4 flex-shrink-0")
                )}
                <span className="truncate flex-1">{node.name}</span>
            </button>
            {node.type === 'folder' && isExpanded && node.children && (
                <div>
                    {node.children.map((child, index) => (
                        <FileTreeNode
                            key={`${child.path}-${index}`}
                            node={child}
                            level={level + 1}
                            activeFile={activeFile}
                            onFileSelect={onFileSelect}
                            onToggle={onToggle}
                            expandedFolders={expandedFolders}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export const FileTree: React.FC<FileTreeProps> = ({ files, activeFile, onFileSelect }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const tree = buildFileTree(files);

    const handleToggle = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    return (
        <div className="space-y-1">
            {tree.map((node, index) => (
                <FileTreeNode
                    key={`${node.path}-${index}`}
                    node={node}
                    level={0}
                    activeFile={activeFile}
                    onFileSelect={onFileSelect}
                    onToggle={handleToggle}
                    expandedFolders={expandedFolders}
                />
            ))}
        </div>
    );
};
