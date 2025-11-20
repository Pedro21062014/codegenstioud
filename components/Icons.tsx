import React from 'react';

const iconProps = {
    className: "w-6 h-6",
    strokeWidth: 1.5,
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
};

// FIX: Updated component to accept standard SVG props (like `style`) by using React.ComponentProps<'svg'>.
export const AppLogo = ({ className = "w-8 h-8 text-white", ...props }: React.ComponentProps<'svg'>) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export const LinkedInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

export const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export const StripeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.155 2.592L6.155 21.408C8.324 21.798 13.987 20.803 16.633 15.602C19.279 10.4 18.283 4.74 17.848 2.592H10.155Z" fill="#635BFF" />
        <path d="M12.001 2.592H4.309C3.874 4.74 2.878 10.4 5.524 15.602C8.17 20.803 13.833 21.798 16.002 21.408L12.001 2.592Z" fill="#635BFF" opacity="0.6" />
    </svg>
);

export const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.72 16.21 16.73 17.69 15.15 18.65V21.48H19.01C21.25 19.44 22.56 16.14 22.56 12.25Z" fill="#4285F4" />
        <path d="M12 23C14.97 23 17.45 22.02 19.01 20.48L15.15 17.65C14.1 18.39 12.83 18.8 12 18.8C9.62 18.8 7.63 17.29 6.79 15.12H2.82V17.95C4.66 21.05 8.08 23 12 23Z" fill="#34A853" />
        <path d="M6.79 15.12C6.58 14.52 6.45 13.88 6.45 13.23C6.45 12.58 6.58 11.94 6.79 11.34V8.51H2.82C1.94 10.02 1.45 11.58 1.45 13.23C1.45 14.88 1.94 16.44 2.82 17.95L6.79 15.12Z" fill="#FBBC05" />
        <path d="M12 7.2C13.23 7.2 14.28 7.64 15.09 8.4L18.01 5.51C16.45 4.02 14.47 3 12 3C8.08 3 4.66 4.95 2.82 8.05L6.79 10.88C7.63 8.71 9.62 7.2 12 7.2Z" fill="#EA4335" />
    </svg>
);

export const MapIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M9 4v16l-6 -4v-16z" />
        <path d="M15 4v16l6 -4v-16z" />
        <path d="M9 4l6 2" />
        <path d="M9 20l6 -2" />
    </svg>
);

export const DatabaseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v12c0 1.66 3.58 3 8 3s8 -1.34 8 -3v-12" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8 -1.34 8 -3" />
    </svg>
);


export const FileIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    </svg>
);

export const ShieldIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
    </svg>
);

export const CubeIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 2l-8 4.5v9l8 4.5l8 -4.5v-9l-8 -4.5" />
        <path d="M12 12l8 -4.5" />
        <path d="M12 12v9" />
        <path d="M12 12l-8 -4.5" />
        <path d="M4 7.5l8 4.5l8 -4.5" />
    </svg>
);

export const SupabaseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.235 2.25C12.063 2.11 11.838 2.11 11.666 2.25L1.82 8.416C1.696 8.513 1.696 8.709 1.82 8.806L11.666 14.972C11.838 15.111 12.063 15.111 12.235 14.972L22.08 8.806C22.204 8.709 22.204 8.513 22.08 8.416L12.235 2.25Z" fill="#3ECF8E" />
        <path d="M22.08 10.166C22.204 10.069 22.204 9.873 22.08 9.776L12.235 3.61C12.063 3.47 11.838 3.47 11.666 3.61L1.82 9.776C1.696 9.873 1.696 10.069 1.82 10.166L6.5 13.416L11.666 17.583C11.838 17.723 12.063 17.723 12.235 17.583L22.08 11.416L17.5 13.416L22.08 10.166Z" fill="#3ECF8E" />
        <path d="M22.08 12.916C22.204 12.819 22.204 12.623 22.08 12.526L12.235 6.36C12.063 6.22 11.838 6.22 11.666 6.36L1.82 12.526C1.696 12.623 1.696 12.819 1.82 12.916L11.666 19.083C11.838 19.223 12.063 19.223 12.235 19.083L22.08 12.916Z" fill="#3ECF8E" opacity="0.6" />
    </svg>
);


export const PublishIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M12 20h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12v5" />
        <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M18 16v2.5" />
        <path d="M20.5 18.5l-2.5 -2.5" />
    </svg>
);

export const UserIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </svg>
);

export const LogInIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
        <path d="M20 12h-13l3 -3" />
        <path d="M17 15l3 -3" />
    </svg>
);

export const LogOutIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
        <path d="M9 12h12l-3 -3" />
        <path d="M18 15l3 -3" />
    </svg>
);

export const SettingsIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1.002 -.608 2.07 .098 2.572 1.065z" />
        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </svg>
);

export const DownloadIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
        <path d="M7 11l5 5l5 -5" />
        <path d="M12 4l0 12" />
    </svg>
);

export const KeyIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M14 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M21 12a9 9 0 1 1 -18 0a9 9 0 0 1 18 0" />
        <path d="M12.5 11.5l-4 4l1.5 1.5l4 -4" />
        <path d="M12 15l-1.5 -1.5" />
    </svg>
);

export const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
    </svg>
);

export const CodeIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M7 8l-4 4l4 4" />
        <path d="M17 8l4 4l-4 4" />
        <path d="M14 4l-4 16" />
    </svg>
);

export const SendIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M10 14l11 -11" />
        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
    </svg>
);

export const SparklesIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5-3.5-2.5h4.5z" />
        <path d="M3 12l4.5 1.5v4.5l2.5-3.5 4.5 1.5-3-4 3-4-4.5 1.5-2.5-3.5v4.5z" />
    </svg>
);

export const PlusIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </svg>
);

export const MenuIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M4 6l16 0" />
        <path d="M4 12l16 0" />
        <path d="M4 18l16 0" />
    </svg>
);

export const ChatIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1 -2 2h-11l-4 4v-13a2 2 0 0 1 2 -2h11a2 2 0 0 1 2 2v8z" />
    </svg>
);

export const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
    </svg>
);

export const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
    </svg>
);

export const SaveIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
        <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M14 4l0 4l-6 0l0 -4" />
    </svg>
);

export const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M4 7l16 0" />
        <path d="M10 11l0 6" />
        <path d="M14 11l0 6" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
);

export const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
        <path d="M16 5l3 3" />
    </svg>
);

export const ProjectsIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
    </svg>
);

export const FolderIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
    </svg>
);

export const TerminalIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M5 7l5 5l-5 5" />
        <path d="M12 19h7" />
    </svg>
);

export const PaperclipIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M15.5 6.5a3.5 3.5 0 1 1 -7 0v8.5a5.5 5.5 0 1 0 11 0v-6.5" />
    </svg>
);

export const ImageIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M15 8h.01" />
        <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
        <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
        <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l2 2" />
    </svg>
);

export const RefreshIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
);

export const VersionIcon = () => (
    <svg {...iconProps} className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M10 12h-4" />
        <path d="M14 12h4" />
        <path d="M12 10v-4" />
        <path d="M12 14v4" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export const ExternalLinkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M15 3h6v6" />
        <path d="M10 14l11 -11" />
        <path d="M18 13v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h6" />
    </svg>
);

// File Type Icons
export const JavaScriptIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M7.5 16.5c0 1.5 1 2 2.5 2s2.5-.5 2.5-2v-7h-2v7c0 .5-.2.8-.5.8s-.5-.3-.5-.8v-7h-2v7z" fill="#000" />
        <path d="M14 16.5c0 1.5 1.2 2 2.5 2 1.5 0 2.5-.8 2.5-2.2 0-1.2-.8-1.8-2-2.3l-.5-.2c-.6-.3-.9-.5-.9-1 0-.4.3-.7.8-.7.4 0 .7.2.9.7l1.7-1c-.5-1-1.5-1.5-2.6-1.5-1.6 0-2.7 1-2.7 2.3 0 1.2.8 1.8 1.8 2.2l.5.2c.7.3 1.1.5 1.1 1.1 0 .5-.4.8-1 .8-.7 0-1.1-.4-1.3-1l-1.8.8z" fill="#000" />
    </svg>
);

export const TypeScriptIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M13 7h-2v10h2V7z" fill="#fff" />
        <path d="M7 9h4v1.5H9V17H7.5V10.5H7V9z" fill="#fff" />
        <path d="M14.5 13.5c0-.8.3-1.5.9-2 .6-.5 1.3-.8 2.1-.8.5 0 1 .1 1.4.3v1.6c-.4-.3-.9-.4-1.4-.4-.4 0-.7.1-1 .4-.2.2-.4.6-.4 1 0 .4.1.7.4 1 .2.2.6.4 1 .4.5 0 1-.2 1.4-.5v1.6c-.4.2-.9.3-1.4.3-.8 0-1.5-.3-2.1-.8-.6-.6-.9-1.3-.9-2.1z" fill="#fff" />
    </svg>
);

export const HTMLIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#E34F26" />
        <path d="M5 3l1.5 16.5L12 21l5.5-1.5L19 3H5z" fill="#E34F26" />
        <path d="M12 5v14l4-1.1L17.5 5H12z" fill="#F06529" />
        <path d="M8 9h8v2h-6v2h6v2h-6v2h8v2H8V9z" fill="#fff" />
    </svg>
);

export const CSSIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#1572B6" />
        <path d="M5 3l1.5 16.5L12 21l5.5-1.5L19 3H5z" fill="#1572B6" />
        <path d="M12 5v14l4-1.1L17.5 5H12z" fill="#33A9DC" />
        <path d="M8 9h8v2h-6l.5 2h5.5v2h-5.5l.5 2h5v2H8l-1-10z" fill="#fff" />
    </svg>
);

export const JSONIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#5E5C5C" />
        <path d="M7 8c0-.5.5-1 1-1h1v10H8c-.5 0-1-.5-1-1v-2H5v2c0 1.7 1.3 3 3 3h2V7H8c-1.7 0-3 1.3-3 3v2h2V8z" fill="#fff" />
        <path d="M17 8c0-.5-.5-1-1-1h-1v10h1c.5 0 1-.5 1-1v-2h2v2c0 1.7-1.3 3-3 3h-2V7h2c1.7 0 3 1.3 3 3v2h-2V8z" fill="#fff" />
    </svg>
);

export const MarkdownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#000" />
        <path d="M6 9v6h2v-4.5l2 2.5 2-2.5V15h2V9h-2l-2 2.5L8 9H6z" fill="#fff" />
        <path d="M16 13.5V9h2v4.5l2-2.5h2l-3 3.5 3 3.5h-2l-2-2.5V15h-2v-1.5z" fill="#fff" />
    </svg>
);

export const ImageFileIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#9B59B6" />
        <circle cx="9" cy="9" r="2" fill="#fff" />
        <path d="M5 17l4-4 3 3 5-6 2 2v3H5v-2z" fill="#fff" />
    </svg>
);

export const GenericFileIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
    </svg>
);

// Editor Control Icons
export const MinimapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 11h10" />
        <path d="M7 15h6" />
    </svg>
);

export const WordWrapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M4 6h16" />
        <path d="M4 12h12a2 2 0 0 1 0 4h-2" />
        <path d="M14 14l-2 2l2 2" />
        <path d="M4 18h6" />
    </svg>
);

export const ZoomInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
    </svg>
);

export const ZoomOutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 11h6" />
    </svg>
);

export const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

export const CommandIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M7 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z" />
        <path d="M14 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </svg>
);

// Additional Language Icons
export const PythonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#3776AB" />
        <path d="M12 4c-2.2 0-4 1.8-4 4v2h4v1H7c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2v-2c0-1.1.9-2 2-2h4c1.1 0 2-.9 2-2V8c0-2.2-1.8-4-4-4h-1zm-1 2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" fill="#FFD43B" />
        <path d="M12 20c2.2 0 4-1.8 4-4v-2h-4v-1h5c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2v2c0 1.1-.9 2-2 2H9c-1.1 0-2 .9-2 2v3c0 2.2 1.8 4 4 4h1zm1-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" fill="#FFD43B" />
    </svg>
);

export const JavaIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#007396" />
        <path d="M10 17s-.5.3.4.4c1 .1 1.5.1 2.6 0 0 0 .3.2.7.3-2.5 1.1-5.7-.1-3.7-.7zm-.3-1.4s-.6.4.3.5c1.2.1 2.1.1 3.7 0 0 0 .2.2.5.3-2.9.8-6.1.1-4.5-.8z" fill="#fff" />
        <path d="M13.5 13.3c.7-.8-.2-1.5-.2-1.5s1.7.9.9 1.6c-.7.6-1.3 1-1.8 2 0 0 2.4-1.2 1.1-2.1z" fill="#fff" />
        <path d="M16.8 18.3s.4.3-.4.5c-1.5.4-6.3.5-7.6 0-.5-.2.4-.4.7-.5.3-.1.5-.1.5-.1-.6-.4-3.8.8-1.6 1.2 5.3 1 9.7-.4 8.4-1.1z" fill="#fff" />
    </svg>
);

export const PHPIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#777BB4" />
        <path d="M7 10h2c1.1 0 2 .9 2 2s-.9 2-2 2H8v2H7v-6zm1 3h1c.6 0 1-.4 1-1s-.4-1-1-1H8v2z" fill="#fff" />
        <path d="M12 10h1v2h2v-2h1v6h-1v-3h-2v3h-1v-6z" fill="#fff" />
        <path d="M17 10h2c1.1 0 2 .9 2 2s-.9 2-2 2h-1v2h-1v-6zm1 3h1c.6 0 1-.4 1-1s-.4-1-1-1h-1v2z" fill="#fff" />
    </svg>
);

export const RubyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#CC342D" />
        <path d="M12 4l8 8-8 8-8-8 8-8z" fill="#CC342D" />
        <path d="M12 4l8 8-8 8V4z" fill="#9B2423" />
        <path d="M12 4L4 12l8 8V4z" fill="#E25C5C" />
        <path d="M12 12l8-8v16l-8-8z" fill="#701516" />
    </svg>
);

export const GoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00ADD8" />
        <path d="M8 11c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7s.1-.5.3-.7c.2-.2.4-.3.7-.3h8c.3 0 .5.1.7.3.2.2.3.4.3.7s-.1.5-.3.7c-.2.2-.4.3-.7.3H8z" fill="#fff" />
        <path d="M6 14c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7s.1-.5.3-.7c.2-.2.4-.3.7-.3h12c.3 0 .5.1.7.3.2.2.3.4.3.7s-.1.5-.3.7c-.2.2-.4.3-.7.3H6z" fill="#fff" />
        <path d="M14 17c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-1h4v1z" fill="#fff" />
    </svg>
);

export const RustIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#000" />
        <circle cx="12" cy="12" r="8" stroke="#CE422B" strokeWidth="1.5" fill="none" />
        <path d="M12 8l2 4h-4l2-4z" fill="#CE422B" />
        <circle cx="12" cy="14" r="1.5" fill="#CE422B" />
        <circle cx="8" cy="12" r="1" fill="#CE422B" />
        <circle cx="16" cy="12" r="1" fill="#CE422B" />
    </svg>
);

export const SwiftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#F05138" />
        <path d="M6 8c2 2 4 3.5 6 4.5-3-2-5-4.5-6-6.5 0 0 3 1 6 3.5 2-1.5 3.5-3 4-4 0 0-1 3-3 5.5 3 1.5 5 2 6 2-2 0-4-.5-6-1.5-.5 2-1.5 4-3 5.5 1-2 1.5-4 1.5-6-2 1-4 1.5-6 1.5 2 0 4-.5 6-1.5z" fill="#fff" />
    </svg>
);

export const KotlinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="kotlinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E44857" />
                <stop offset="50%" stopColor="#C711E1" />
                <stop offset="100%" stopColor="#7F52FF" />
            </linearGradient>
        </defs>
        <rect width="24" height="24" rx="4" fill="url(#kotlinGrad)" />
        <path d="M4 4h16L12 12 4 20V4z" fill="#fff" opacity="0.9" />
        <path d="M4 4l16 16H4V4z" fill="#fff" opacity="0.6" />
    </svg>
);

export const CppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00599C" />
        <path d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" fill="#00599C" />
        <path d="M12 4v16l8-4.5v-7L12 4z" fill="#004482" />
        <text x="12" y="15" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="bold">C++</text>
    </svg>
);

// Folder and Tree Icons
export const FolderClosedIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
    </svg>
);

export const FolderOpenIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />
    </svg>
);

export const ChevronRightIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M9 6l6 6l-6 6" />
    </svg>
);

export const ChevronDownIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M6 9l6 6l6 -6" />
    </svg>
);
