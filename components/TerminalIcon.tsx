import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};

export const TerminalIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path d="M5 7l5 5l-5 5" />
        <path d="M12 19h7" />
    </svg>
);
