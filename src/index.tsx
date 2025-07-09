import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Chakra Petch:400,700&display=swap'],
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <DynamicContextProvider
          settings={{
            environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
            // walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<App />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </DynamicContextProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
