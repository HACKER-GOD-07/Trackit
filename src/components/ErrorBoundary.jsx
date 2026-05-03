import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-textMain flex items-center justify-center p-6">
          <div className="glass-panel p-8 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
            <p className="text-textMuted mb-4">The application encountered a rendering error.</p>
            <div className="bg-surfaceHighlight p-4 rounded-lg overflow-auto max-h-96 text-sm text-red-400 font-mono">
              <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
