import { Component, type ErrorInfo, type ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="m-6 rounded-lg border border-clay bg-white p-6">
          <h1 className="text-2xl font-semibold text-forest">Something went wrong</h1>
          <pre className="mt-3 whitespace-pre-wrap text-sm">{this.state.error.message}</pre>
          <a href="/" className="mt-4 inline-block underline">Back to home</a>
        </div>
      );
    }
    return this.props.children;
  }
}