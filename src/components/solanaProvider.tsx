'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

interface SolanaContextState {
  // Wallet State
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  solBalance: number | null;

  // Wallet Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchBalance: () => Promise<void>;

  // Compatibility layer
  authenticated: boolean;
  solanaWallet: { address: string } | null;
  hasSolanaWallet: boolean;
  isConnected: boolean;
  isSigning: boolean;
  isSigned: boolean;
  signature: string | null;
  connectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<void>;
  hasMinimumBalance: (minBalance: number) => Promise<boolean>;
}

const SolanaContext = createContext<SolanaContextState | undefined>(undefined);

export function useSolana() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    signMessage: walletSignMessage,
  } = wallet;

  // Compatibility wrapper for solanaWallet
  const solanaWallet = useMemo(() => {
    if (!publicKey) return null;
    return { address: publicKey.toBase58() };
  }, [publicKey]);

  // Connect wallet function
  const connectWallet = async () => {
    if (!wallet.connect) {
      throw new Error('Wallet does not support connect');
    }
    await wallet.connect();
  };

  // Disconnect wallet function
  const disconnect = async () => {
    if (!wallet.disconnect) {
      throw new Error('Wallet does not support disconnect');
    }
    await wallet.disconnect();
    setSignature(null);
    setIsSigned(false);
  };

  // Sign message function
  const signMessage = async (message: string) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!walletSignMessage) {
      throw new Error('Wallet does not support message signing');
    }

    setIsSigning(true);
    try {
      // Encode message to bytes
      const encodedMessage = new TextEncoder().encode(message);

      // Sign the message
      const signatureBytes = await walletSignMessage(encodedMessage);

      // Convert to base58 string
      const signatureBase58 = bs58.encode(signatureBytes);

      setSignature(signatureBase58);
      setIsSigned(true);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  };

  // Fetch SOL balance function
  const fetchBalance = async () => {
    if (!publicKey) {
      setSolBalance(null);
      return;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const balanceInSol = balance / 1e9;
      setSolBalance(balanceInSol);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setSolBalance(null);
    }
  };

  // Check minimum balance function
  const hasMinimumBalance = async (minBalance: number): Promise<boolean> => {
    if (!publicKey) {
      return false;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / 1e9;
      return balanceInSol >= minBalance;
    } catch (error) {
      console.error('Failed to check balance:', error);
      return false;
    }
  };

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setSolBalance(null);
    }
  }, [connected, publicKey]);

  // Create context value
  const contextValue = useMemo<SolanaContextState>(
    () => ({
      // Wallet state
      publicKey,
      connected,
      connecting,
      disconnecting,
      solBalance,

      // Wallet actions
      connect: connectWallet,
      disconnect,
      fetchBalance,

      // Compatibility layer
      authenticated: connected,
      solanaWallet,
      hasSolanaWallet: !!publicKey,
      isConnected: connected,
      isSigning,
      isSigned,
      signature,
      connectWallet,
      signMessage,
      hasMinimumBalance,
    }),
    [
      publicKey,
      connected,
      connecting,
      disconnecting,
      solBalance,
      solanaWallet,
      isSigning,
      isSigned,
      signature,
    ]
  );

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
}
