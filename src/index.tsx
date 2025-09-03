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
// import EvaOnlineXyz from './pages/EvaOnlineXyz';
import WachAi from './pages/WachAi';
// import Flag from './pages/Flag';
import HyperLiquid from './pages/HyperLiquidX';
import Review from './pages/Review';
// import Admin from './pages/Admin';
import Creator from './pages/Creator';
import { L1_CHAIN_CONFIG } from './services/creatorToken.service';

WebFont.load({
  google: {
    families: [
      'Chakra Petch:400,700',
      'DM Mono:300,400,500,300italic,400italic,500italic',
      'Teodor:300,400,500,600,700',
    ],
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
            {
              blockExplorerUrls: [L1_CHAIN_CONFIG.blockExplorerUrl],
              chainId: L1_CHAIN_CONFIG.chainId,
              chainName: L1_CHAIN_CONFIG.name,
              iconUrls: [''],
              name: L1_CHAIN_CONFIG.name,
              nativeCurrency: {
                decimals: 18,
                name: L1_CHAIN_CONFIG.name,
                symbol: L1_CHAIN_CONFIG.symbol,
                iconUrl: '',
              },
              networkId: 1,

              rpcUrls: [L1_CHAIN_CONFIG.rpcUrl],
              vanityName: L1_CHAIN_CONFIG.name,
            },
          ],
        },
      }}
    >
      <ThemeProvider theme={theme}>
        {/* <AuthProvider> */}
        <Routes>
          <Route path="/" element={<ClaimSangTokens />} />
          <Route path="/elytra" element={<Elytra />} />
          {/* <Route path="/evaonlinexyz" element={<EvaOnlineXyz />} /> */}
          <Route path="/wachai" element={<WachAi />} />
          <Route path="/flag" element={<Review />} />
          <Route path="/review" element={<Review />} />
          <Route path="/hyperliquidx" element={<HyperLiquid />} />
          <Route path="/creator" element={<Creator />} />
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
