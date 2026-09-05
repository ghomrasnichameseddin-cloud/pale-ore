import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { getStoredVisualCodexSettings, applyVisualCodexToDOM } from './utils/visualCodex.ts';

// Immediately apply Visual Codex design tokens before first render
try {
  applyVisualCodexToDOM(getStoredVisualCodexSettings());
} catch {
  // Graceful fallback
}

// Register PWA service worker for offline caching in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  try {
    registerSW({ immediate: true });
  } catch {
    // Graceful fallback if SW registration is unavailable
  }
} else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => caches.delete(cacheName));
    });
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by RootErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('pale_ore_pos_state_v1');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080c] text-zinc-300 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full p-6 rounded-xl bg-[#0b0d13] border border-[#c5a059]/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3a2e12] border border-[#c5a059] flex items-center justify-center mx-auto text-[#fef08a] font-bold text-xl">
              ⚙
            </div>
            <h1 className="text-lg font-bold font-serif text-[#fef08a] tracking-wider uppercase">
              Sanctum Re-alignment Required
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              The operating system encountered a runtime exception.
            </p>
            {this.state.error && (
              <div className="p-3 bg-black/60 rounded border border-red-500/30 text-[11px] font-mono text-red-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 bg-[#c5a059] hover:bg-[#e5c875] text-[#07080c] text-xs font-bold font-mono rounded transition-colors"
              >
                Reload Sanctum
              </button>
              <button
                onClick={this.handleReset}
                className="py-2 px-3 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 text-xs font-bold font-mono rounded transition-colors"
                title="Reset corrupted local state and reload"
              >
                Reset State
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

