import '@fontsource/barlow-condensed/latin-ext-600.css';
import '@fontsource/barlow-condensed/latin-ext-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './styles/auth.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AuthProvider><App /></AuthProvider></StrictMode>,
);
