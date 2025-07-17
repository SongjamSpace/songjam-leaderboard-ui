import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import ClaimSangTokens from './pages/ClaimSangTokens';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import WebFont from 'webfontloader';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import {
  SdkView,
  SdkViewSectionType,
  SdkViewType,
} from '@dynamic-labs/sdk-api';
import Elytra from './pages/Elytra';

WebFont.load({
  google: {
    families: ['Chakra Petch:400,700&display=swap'],
  },
});

const WEB3_VIEW = {
  type: SdkViewType.Login,
  sections: [{ type: SdkViewSectionType.Wallet }],
};

// Wrapper component to manage login state
function DynamicWrapper() {
  const [viewOverrides, setViewOverrides] = useState<SdkView>(WEB3_VIEW);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        // initialAuthenticationMode: 'connect-only',
        overrides: {
          views: viewOverrides ? [viewOverrides] : [],
          evmNetworks: [
            {
              blockExplorerUrls: ['https://basescan.org/'],
              chainId: 8453,
              chainName: 'Base',
              iconUrls: ['https://app.dynamic.xyz/assets/networks/base.svg'],
              name: 'Base',
              nativeCurrency: {
                decimals: 18,
                name: 'Base',
                symbol: 'ETH',
                iconUrl: 'https://app.dynamic.xyz/assets/networks/base.svg',
              },
              networkId: 1,

              rpcUrls: ['https://mainnet.base.org'],
              vanityName: 'Base Mainnet',
            },
          ],
        },
      }}
    >
      <ThemeProvider theme={theme}>
        {/* <AuthProvider> */}
        <Routes>
          <Route path="/claim-sang" element={<ClaimSangTokens />} />
          <Route path="/" element={<Elytra />} />
          <Route path="/elytra" element={<Elytra />} />
        </Routes>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </DynamicContextProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <DynamicWrapper />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
