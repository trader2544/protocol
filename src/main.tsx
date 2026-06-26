import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import OptionalClerkProvider from './components/OptionalClerkProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OptionalClerkProvider>
      <App />
    </OptionalClerkProvider>
  </StrictMode>,
);

