import { ethers } from 'ethers';
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';

// SongjamToken contract ABI and bytecode
import SongjamTokenArtifact from './SongjamToken.json';

export interface CreatorTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress?: string;
}

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  contractAddress?: string;
  error?: string;
}

// L1 Chain configuration for Base mainnet (supported by Alchemy)
export const L1_CHAIN_CONFIG = {
  rpcUrl: 'https://subnets.avax.network/songjam/testnet/rpc',
  chainId: 46976, // Base mainnet chain ID
  name: 'Songjam Genesis',
  blockExplorerUrl: 'https://explorer-test.avax.network/songjam',
  symbol: 'SANG',
};

// Creator Token Factory contract address (replace with actual address)
const CREATOR_TOKEN_FACTORY_ADDRESS =
  '0xe1DD5C4ad3270cF1E8e3a37e3041E5d39cE7e751';

/**
 * Switch to the L1 chain
 */
const switchToL1Chain = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${L1_CHAIN_CONFIG.chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // If the chain is not added, add it
    if (error.code === 4902) {
      await addL1Chain();
    } else {
      throw error;
    }
  }
};

/**
 * Add the L1 chain to the wallet
 */
export const addL1Chain = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${L1_CHAIN_CONFIG.chainId.toString(16)}`,
          chainName: L1_CHAIN_CONFIG.name,
          nativeCurrency: {
            name: 'SANG',
            symbol: 'SANG',
            decimals: 18,
          },
          rpcUrls: [L1_CHAIN_CONFIG.rpcUrl],
          blockExplorerUrls: [L1_CHAIN_CONFIG.blockExplorerUrl],
        },
      ],
    });
  } catch (error) {
    console.error('Error adding chain:', error);
    throw error;
  }
};

/**
 * Deploy a new Creator Token
 */
export const deployCreatorToken = async (
  primaryWallet: any,
  receiverAddress: string,
  tokenInfo: CreatorTokenInfo
): Promise<MintResult> => {
  try {
    const signer = await getSigner(primaryWallet);

    // Create contract factory for SongjamToken
    const SongjamToken = new ethers.ContractFactory(
      SongjamTokenArtifact.abi,
      SongjamTokenArtifact.bytecode,
      signer
    );
    // Deploy the token
    const songjamToken = await SongjamToken.deploy(
      receiverAddress,
      tokenInfo.name,
      tokenInfo.symbol
    );
    // Wait for deployment
    await songjamToken.waitForDeployment();
    // Get the deployed contract address
    const contractAddress = await songjamToken.getAddress();
    console.log(`${tokenInfo.name} deployed to:`, contractAddress);

    return {
      success: true,
      contractAddress,
    };
  } catch (error: any) {
    console.error('Error deploying creator token:', error);
    return {
      success: false,
      error: error.message || 'Failed to deploy creator token',
    };
  }
};

/**
 * Mint additional tokens to a specific address
 */
export const mintTokens = async (
  primaryWallet: any,
  contractAddress: string,
  toAddress: string,
  amount: string
): Promise<MintResult> => {
  try {
    const signer = await getSigner(primaryWallet);

    const contract = new ethers.Contract(
      contractAddress,
      SongjamTokenArtifact.abi,
      signer
    );

    // Get decimals to convert amount
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    // Mint tokens
    const tx = await contract.mint(toAddress, amountWei);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error minting tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to mint tokens',
    };
  }
};

export const fetchTokenBalance = async (
  primaryWallet: any,
  walletAddress: string,
  contractAddress: string,
  isNative: boolean
) => {
  try {
    const provider = await getWeb3Provider(primaryWallet);
    let balance: bigint;
    if (isNative) {
      // Get native token balance instead of ERC20
      balance = await provider.getBalance(walletAddress);
      //   const balance = await provider.getBalance(
      //     '0x07C920eA4A1aa50c8bE40c910d7c4981D135272B'
      //   );
    } else {
      const contract = new ethers.Contract(
        contractAddress,
        SongjamTokenArtifact.abi,
        provider
      );
      balance = await contract.balanceOf(walletAddress);
    }

    // Native tokens typically have 18 decimals
    const formattedBalance = ethers.formatEther(balance);

    return parseFloat(formattedBalance).toFixed(2);
  } catch (error) {
    console.error('Error fetching native token balance:', error);
    // Set default values if balance fetch fails
    return '0';
  }
};

export const addCustomTokenToWallet = async (
  primaryWallet: any,
  contractAddress: string,
  tokenInfo: CreatorTokenInfo
) => {
  try {
    // For Dynamic Labs wallets, we can access the connector directly
    if (primaryWallet.connector && 'provider' in primaryWallet.connector) {
      await (primaryWallet.connector as any).provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
          },
        },
      });
      return true;
    } else {
      // Fallback to window.ethereum if connector provider is not available
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: contractAddress,
              symbol: tokenInfo.symbol,
              decimals: tokenInfo.decimals,
            },
          },
        });
        return true;
      } else {
        throw new Error('No wallet provider found');
      }
    }
  } catch (error) {
    console.error('Error adding custom token to wallet:', error);
    return false;
  }
};
