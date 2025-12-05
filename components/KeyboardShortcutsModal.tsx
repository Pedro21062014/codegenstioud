import React, { useState, useEffect, useMemo } from 'react';

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHORTCUTS: Shortcut[] = [
    // Editor
    { keys: ['Ctrl', 'S'], description: 'Salvar projeto', category: 'Editor' },
    { keys: ['Ctrl', 'P'], description: 'Paleta de comandos', category: 'Editor' },
    { keys: ['Ctrl', 'F'], description: 'Buscar no arquivo', category: 'Editor' },
    { keys: ['Ctrl', 'Z'], description: 'Desfazer', category: 'Editor' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Refazer', category: 'Editor' },
    { keys: ['Ctrl', 'D'], description: 'Duplicar linha', category: 'Editor' },
    { keys: ['Ctrl', '/'], description: 'Comentar linha', category: 'Editor' },

    // Navegação
    { keys: ['Ctrl', 'Tab'], description: 'Próximo arquivo', category: 'Navegação' },
    { keys: ['Ctrl', 'Shift', 'Tab'], description: 'Arquivo anterior', category: 'Navegação' },
    { keys: ['Ctrl', 'G'], description: 'Ir para linha', category: 'Navegação' },

    // Visualização
    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Visualização' },
    { keys: ['Ctrl', 'Shift', 'P'], description: 'Toggle preview', category: 'Visualização' },
    { keys: ['?'], description: 'Atalhos de teclado', category: 'Visualização' },
    { keys: ['Esc'], description: 'Fechar modal/painel', category: 'Visualização' },

    // Projeto
    { keys: ['Ctrl', 'N'], description: 'Novo projeto', category: 'Projeto' },
    { keys: ['Ctrl', 'O'], description: 'Abrir projeto', category: 'Projeto' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Baixar projeto (ZIP)', category: 'Projeto' },
];

const KeyIcon: React.FC<{ keyName: string }> = ({ keyName }) => {
    const getKeyStyle = () => {
        if (keyName.length === 1) return 'min-w-[28px]';
        if (keyName === 'Ctrl' || keyName === 'Shift' || keyName === 'Alt') return 'min-w-[48px]';
        if (keyName === 'Tab' || keyName === 'Esc') return 'min-w-[40px]';
        return 'min-w-[32px]';
    };

    return (
        <span
            className={`
        inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-medium
        bg-gradient-to-b from-gray-700 to-gray-800 
        border border-gray-600 rounded-md shadow-sm
        text-gray-200 ${getKeyStyle()}
      `}
        >
            {keyName}
        </span>
    );
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get unique categories
    const categories = useMemo(() => {
        return [...new Set(SHORTCUTS.map(s => s.category))];
    }, []);

    // Filter shortcuts
    const filteredShortcuts = useMemo(() => {
        return SHORTCUTS.filter(shortcut => {
            const matchesSearch = searchQuery === '' ||
                shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shortcut.keys.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = !selectedCategory || shortcut.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    // Group by category
    const groupedShortcuts = useMemo(() => {
        return filteredShortcuts.reduce((acc, shortcut) => {
            if (!acc[shortcut.category]) {
                acc[shortcut.category] = [];
            }
            acc[shortcut.category].push(shortcut);
            return acc;
        }, {} as Record<string, Shortcut[]>);
    }, [filteredShortcuts]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[80vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">⌨️</span>
                            Atalhos de Teclado
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar atalhos..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${!selectedCategory
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${selectedCategory === category
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                        <div key={category} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {shortcuts.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all group"
                                    >
                                        <span className="text-gray-300 group-hover:text-white transition-colors">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {shortcut.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    <KeyIcon keyName={key} />
                                                    {keyIdx < shortcut.keys.length - 1 && (
                                                        <span className="text-gray-500 text-sm">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredShortcuts.length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <p className="text-gray-400">Nenhum atalho encontrado</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                    <p className="text-center text-sm text-gray-500">
                        Pressione <KeyIcon keyName="?" /> a qualquer momento para abrir este painel
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
        </div>
    );
};

export default KeyboardShortcutsModal;
