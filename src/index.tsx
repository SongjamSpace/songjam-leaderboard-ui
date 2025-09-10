import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import ClaimSangTokens from './pages/ClaimSangTokens';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import WebFont from 'webfontloader';
import Elytra from './pages/Elytra';
// import EvaOnlineXyz from './pages/EvaOnlineXyz';
import WachAi from './pages/WachAi';
// import Flag from './pages/Flag';
import HyperLiquid from './pages/HyperLiquidX';
import Review from './pages/Review';
// import Admin from './pages/Admin';
import Creator from './pages/Creator';
import { L1_CHAIN_CONFIG } from './services/creatorToken.service';
import { PrivyProvider } from '@privy-io/react-auth';
import { defineChain } from 'viem';
import { base } from 'viem/chains';
import Swap from './pages/Swap';

WebFont.load({
  google: {
    families: [
      'Chakra Petch:400,700',
      'DM Mono:300,400,500,300italic,400italic,500italic',
      'Teodor:300,400,500,600,700',
    ],
  },
});

export const songjamGenesisTestnetChain = defineChain({
  id: L1_CHAIN_CONFIG.chainId, // Replace this with your chain's ID
  name: L1_CHAIN_CONFIG.name,
  network: 'Songjam Genesis Testnet',
  nativeCurrency: {
    decimals: 18, // Replace this with the number of decimals for your chain's native token
    name: L1_CHAIN_CONFIG.tokenName,
    symbol: L1_CHAIN_CONFIG.symbol,
  },
  rpcUrls: {
    default: {
      http: [L1_CHAIN_CONFIG.rpcUrl],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: L1_CHAIN_CONFIG.blockExplorerUrl },
  },
});

// Wrapper component to manage login state
function Web3Wrapper() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        defaultChain: base,
        supportedChains: [base, songjamGenesisTestnetChain],
        appearance: {
          accentColor: '#6A6FF5',
          theme: '#FFFFFF',
          showWalletLoginFirst: false,
          logo: 'https://auth.privy.io/logos/privy-logo.png',
          walletChainType: 'ethereum-only',
          walletList: [
            'detected_wallets',
            'metamask',
            'phantom',
            'coinbase_wallet',
            'base_account',
            'rainbow',
            'solflare',
            'backpack',
            'okx_wallet',
            'wallet_connect',
            'uniswap',
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
          <Route path="/swap" element={<Swap />} />
          <Route path="/swap/:address" element={<Swap />} />
          <Route path="/flag" element={<Review />} />
          <Route path="/review" element={<Review />} />
          <Route path="/hyperliquidx" element={<HyperLiquid />} />
          <Route path="/creator" element={<Creator />} />
        </Routes>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </PrivyProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Web3Wrapper />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
