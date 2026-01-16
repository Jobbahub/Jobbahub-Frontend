import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', className = '' }) => {
    // Map simple size props to CSS classes if needed, or just rely on a default large one as requested
    // For now, I'll default to the 'loading-spinner' class which I will make larger.
    // I can add modifier classes if needed.

    return (
        <div className={`loading-spinner-container ${className}`}>
            <div className={`loading-spinner ${size}`}></div>
        </div>
    );
};

export default LoadingSpinner;
