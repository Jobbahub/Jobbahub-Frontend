import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../pages/errorPage';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <ErrorPage
                    title="Oeps! Er ging iets fout."
                    message="Er is een onverwachte fout opgetreden in de applicatie. Probeer de pagina te verversen."
                    code="APP_CRASH"
                    onRetry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
