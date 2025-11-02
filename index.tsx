
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Use explicit file paths for imports to ensure module resolution.
import App from './App';
import { AppProvider } from './state/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);