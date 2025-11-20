import React from 'react';
import {
    JavaScriptIcon,
    TypeScriptIcon,
    HTMLIcon,
    CSSIcon,
    JSONIcon,
    MarkdownIcon,
    ImageFileIcon,
    GenericFileIcon,
    PythonIcon,
    JavaIcon,
    PHPIcon,
    RubyIcon,
    GoIcon,
    RustIcon,
    SwiftIcon,
    KotlinIcon,
    CppIcon
} from './Icons';

export const getFileIcon = (fileName: string, className?: string): React.ReactNode => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'js':
        case 'mjs':
        case 'cjs':
        case 'jsx':
            return <JavaScriptIcon className={className} />;

        case 'ts':
        case 'tsx':
            return <TypeScriptIcon className={className} />;

        case 'html':
        case 'htm':
            return <HTMLIcon className={className} />;

        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
            return <CSSIcon className={className} />;

        case 'json':
        case 'jsonc':
            return <JSONIcon className={className} />;

        case 'md':
        case 'markdown':
            return <MarkdownIcon className={className} />;

        case 'py':
        case 'pyw':
        case 'pyi':
            return <PythonIcon className={className} />;

        case 'java':
        case 'class':
        case 'jar':
            return <JavaIcon className={className} />;

        case 'php':
        case 'phtml':
            return <PHPIcon className={className} />;

        case 'rb':
        case 'erb':
            return <RubyIcon className={className} />;

        case 'go':
            return <GoIcon className={className} />;

        case 'rs':
            return <RustIcon className={className} />;

        case 'swift':
            return <SwiftIcon className={className} />;

        case 'kt':
        case 'kts':
            return <KotlinIcon className={className} />;

        case 'cpp':
        case 'cc':
        case 'cxx':
        case 'c++':
        case 'h':
        case 'hpp':
        case 'c':
            return <CppIcon className={className} />;

        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
        case 'bmp':
            return <ImageFileIcon className={className} />;

        default:
            return <GenericFileIcon className={className} />;
    }
};
