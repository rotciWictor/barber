import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { logger } from './core/logger';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  logger.error('Chave do Clerk ausente nas variáveis de ambiente', { category: 'Auth' });
  throw new Error(
    '[Clerk] Variável de ambiente ausente. ' +
    'Defina VITE_CLERK_PUBLISHABLE_KEY no arquivo .env',
  );
}

logger.info('Iniciando Gerente da Cadeira...', { category: 'App' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
);
