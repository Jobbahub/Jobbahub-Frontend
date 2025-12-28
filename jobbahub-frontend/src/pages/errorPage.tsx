import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ErrorPageProps {
    title?: string;
    message?: string;
    code?: number | string;
    onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
    title = "Er is iets misgegaan",
    message = "Er is een onverwachte fout opgetreden.",
    code,
    onRetry
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Haal state op van navigatie (als we via navigate('/error', { state: ... }) komen)
    const state = location.state as { title?: string; message?: string; code?: string } | null;

    const displayTitle = state?.title || title;
    const displayMessage = state?.message || message;
    const displayCode = state?.code || code;

    return (
        <div className="error-page-container">
            <div className="error-content">
                <div className="error-icon">⚠️</div>
                {displayCode && <div className="error-code">{displayCode}</div>}
                <h1 className="error-title">{displayTitle}</h1>
                <p className="error-message">{displayMessage}</p>

                <div className="error-actions">
                    <button className="btn btn-primary btn-margin-right" onClick={() => navigate('/')}>
                        Terug naar Home
                    </button>

                    {onRetry ? (
                        <button className="btn btn-secondary" onClick={onRetry}>
                            Probeer opnieuw
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={() => {
                            if (state && 'from' in state && state.from) {
                                navigate(state.from as string, { replace: true });
                            } else {
                                // If we don't know where we came from, try going back one step first? 
                                // Or just reload if we are strictly on /error
                                // But reloading /error is useless as user said.
                                // Let's try navigate(-1) if no specific state, assuming history exists.
                                navigate(-1);
                            }
                        }}>
                            Probeer opnieuw
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
