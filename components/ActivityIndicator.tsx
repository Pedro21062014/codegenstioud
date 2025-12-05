import React from 'react';

interface ActivityIndicatorProps {
    isActive: boolean;
    type?: 'thinking' | 'generating' | 'saving' | 'loading';
    message?: string;
    className?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
    isActive,
    type = 'thinking',
    message,
    className = ''
}) => {
    if (!isActive) return null;

    const getColorsByType = () => {
        switch (type) {
            case 'thinking':
                return { bg: 'bg-purple-500', glow: 'shadow-purple-500/50' };
            case 'generating':
                return { bg: 'bg-blue-500', glow: 'shadow-blue-500/50' };
            case 'saving':
                return { bg: 'bg-green-500', glow: 'shadow-green-500/50' };
            case 'loading':
                return { bg: 'bg-amber-500', glow: 'shadow-amber-500/50' };
            default:
                return { bg: 'bg-blue-500', glow: 'shadow-blue-500/50' };
        }
    };

    const colors = getColorsByType();

    const getDefaultMessage = () => {
        switch (type) {
            case 'thinking': return 'IA pensando...';
            case 'generating': return 'Gerando código...';
            case 'saving': return 'Salvando...';
            case 'loading': return 'Carregando...';
            default: return 'Processando...';
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Animated dots */}
            <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${colors.bg} animate-bounce shadow-lg ${colors.glow}`}
                        style={{
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '0.6s',
                        }}
                    />
                ))}
            </div>

            {/* Message */}
            <span className="text-sm text-gray-400 animate-pulse">
                {message || getDefaultMessage()}
            </span>
        </div>
    );
};

// Spinning logo indicator
export const SpinningLogo: React.FC<{ isActive: boolean; className?: string }> = ({ isActive, className = '' }) => {
    return (
        <div className={`relative ${isActive ? 'animate-spin-slow' : ''} ${className}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={isActive ? 'url(#gradient)' : 'currentColor'}
                    className={isActive ? 'animate-pulse' : ''}
                />
                {isActive && (
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6">
                                <animate attributeName="stop-color" values="#8B5CF6;#3B82F6;#10B981;#8B5CF6" dur="2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#3B82F6">
                                <animate attributeName="stop-color" values="#3B82F6;#10B981;#8B5CF6;#3B82F6" dur="2s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                    </defs>
                )}
            </svg>

            {/* Glow effect when active */}
            {isActive && (
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse" />
            )}
        </div>
    );
};

// Progress bar with shimmer effect
export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => {
    return (
        <div className={`w-full h-1 bg-gray-700 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 relative"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
        </div>
    );
};

// Add custom animations to global CSS
export const activityIndicatorStyles = `
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
`;

export default ActivityIndicator;
