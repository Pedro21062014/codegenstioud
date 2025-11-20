import React, { useState, useEffect, useRef } from 'react';
import { CommandIcon, SearchIcon, CloseIcon } from './Icons';

export interface Command {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action: () => void;
    category?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Filter commands based on search query
    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category || 'Outros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(cmd);
        return acc;
    }, {} as Record<string, Command[]>);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setSearchQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                onClose();
            }
        }
    };

    const handleCommandClick = (command: Command) => {
        command.action();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Command Palette Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-var-bg-subtle border-2 border-var-border-default rounded-2xl shadow-2xl overflow-hidden animate-slideInUp">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-var-border-default bg-var-bg-muted">
                    <SearchIcon className="w-5 h-5 text-var-fg-muted" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite um comando ou pesquise..."
                        className="flex-1 bg-transparent text-var-fg-default placeholder-var-fg-subtle focus:outline-none text-base"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
                        title="Fechar (Esc)"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Commands List */}
                <div
                    ref={listRef}
                    className="max-h-96 overflow-y-auto p-2"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-8 text-var-fg-muted">
                            Nenhum comando encontrado
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, cmds]) => (
                            <div key={category} className="mb-4">
                                <div className="px-3 py-1 text-xs font-semibold text-var-fg-subtle uppercase tracking-wider">
                                    {category}
                                </div>
                                {cmds.map((command, idx) => {
                                    const globalIndex = filteredCommands.indexOf(command);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={command.id}
                                            onClick={() => handleCommandClick(command)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${isSelected
                                                    ? 'bg-var-accent/20 border border-var-accent/50 text-var-fg-default'
                                                    : 'text-var-fg-default hover:bg-var-bg-interactive'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {command.icon && (
                                                    <div className="flex-shrink-0 text-var-fg-muted">
                                                        {command.icon}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {command.label}
                                                    </div>
                                                    {command.description && (
                                                        <div className="text-xs text-var-fg-muted truncate">
                                                            {command.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {command.shortcut && (
                                                <div className="flex-shrink-0 ml-4">
                                                    <kbd className="px-2 py-1 text-xs font-mono bg-var-bg-muted border border-var-border-default rounded">
                                                        {command.shortcut}
                                                    </kbd>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-var-border-default bg-var-bg-muted text-xs text-var-fg-subtle">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-var-bg-subtle border border-var-border-default rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-var-bg-subtle border border-var-border-default rounded">↓</kbd>
                            navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-var-bg-subtle border border-var-border-default rounded">Enter</kbd>
                            executar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-var-bg-subtle border border-var-border-default rounded">Esc</kbd>
                            fechar
                        </span>
                    </div>
                    <div>
                        {filteredCommands.length} comando{filteredCommands.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};
