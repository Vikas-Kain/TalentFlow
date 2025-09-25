import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            {this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                        Error details
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                            <div className="mt-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
