import React, { useState } from 'react';
import { XIcon, CopyIcon, ExternalLinkIcon, CheckIcon } from './Icons';

interface ShareModalProps {
    url: string;
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ url, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-var-bg-default rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-var-fg-default">
                        Projeto Compartilhado! 🎉
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-var-fg-muted hover:bg-var-bg-interactive hover:text-var-fg-default transition-colors"
                        aria-label="Fechar"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-var-fg-muted text-sm mb-4">
                    O CodeSandbox será aberto em uma nova aba do navegador. Após a criação, você pode compartilhar o link com qualquer pessoa.
                </p>

                {/* URL Display */}
                <div className="bg-var-bg-subtle rounded-md p-3 mb-4 border border-var-border-default">
                    <p className="text-xs text-var-fg-muted mb-1">Link compartilhável:</p>
                    <p className="text-sm text-var-fg-default font-mono break-all">
                        {url}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="w-4 h-4" />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <CopyIcon className="w-4 h-4" />
                                Copiar Link
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleOpenInNewTab}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-var-bg-interactive hover:bg-var-bg-hover text-var-fg-default rounded-md transition-colors border border-var-border-default font-medium"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                        Abrir
                    </button>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Dica:</strong> O projeto ficará disponível permanentemente no CodeSandbox. Você pode editar e fazer fork dele.
                    </p>
                </div>
            </div>
        </div>
    );
};
