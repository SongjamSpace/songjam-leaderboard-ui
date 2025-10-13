import { ethers } from 'ethers';
// import { Wallet } from '@dynamic-labs/sdk-react-core';
import StakingContractAbi from './StakingContract.json';
import { ConnectedWallet } from '@privy-io/react-auth';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// SANG Token contract address
const SANG_TOKEN_ADDRESS = '0x4FF4d349CAa028BD069bbE85fA05253f96176741';

// Minimum staked amount required (50k ELYTRA tokens)
const MIN_STAKED_AMOUNT = ethers.parseUnits('10000', 18); // Assuming 18 decimals

export interface SangStakingInfo {
  hasMinimumStake: boolean;
  balance: string;
  formattedBalance: string;
  symbol: string;
  name: string;
}

export interface SangBalanceInfo {
  balance: string;
  formattedBalance: string;
  symbol: string;
  name: string;
}

export const getSangStakingStatus = async (
  walletAddress: string
): Promise<SangStakingInfo> => {
  const provider = new ethers.AlchemyProvider(
    8453,
    import.meta.env.VITE_ALCHEMY_API_KEY
  );
  const STACKING_CONTRACT_ADDRESS =
    '0x852777091af43Af197D977DcCa6aBB54b6B5Eb56';
  // check if user has a balance of this contract
  const contract = new ethers.Contract(
    STACKING_CONTRACT_ADDRESS,
    ERC20_ABI,
    provider
  );
  const balance = await contract.balanceOf(walletAddress);
  if (balance > 0) {
    return {
      hasMinimumStake: balance >= MIN_STAKED_AMOUNT,
      balance: balance.toString(),
      formattedBalance: ethers.formatUnits(balance, 18),
      symbol: 'SANG',
      name: 'Songjam',
    };
  }

  return {
    hasMinimumStake: false,
    balance: '0',
    formattedBalance: '0',
    symbol: 'SANG',
    name: 'Songjam',
  };
};

export const getSangBalance = async (
  walletAddress: string
): Promise<SangBalanceInfo> => {
  try {
    const provider = new ethers.AlchemyProvider(
      8453,
      import.meta.env.VITE_ALCHEMY_API_KEY
    );

    const contract = new ethers.Contract(
      SANG_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );

    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    const symbol = await contract.symbol();
    const name = await contract.name();

    return {
      balance: balance.toString(),
      formattedBalance: ethers.formatUnits(balance, decimals),
      symbol,
      name,
    };
  } catch (error) {
    console.error('Error fetching SANG balance:', error);
    return {
      balance: '0',
      formattedBalance: '0',
      symbol: 'SANG',
      name: 'Songjam',
    };
  }
};

export interface StakeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

const getSignerFromPrivyWallet = async (wallet: ConnectedWallet) => {
  const provider = await wallet.getEthereumProvider();
  const ethersProvider = new ethers.BrowserProvider(provider as any);
  const signer = await ethersProvider.getSigner();
  return signer;
};

export const stakeSangTokens = async (
  wallet: ConnectedWallet,
  amountTokens: string
): Promise<StakeResult> => {
  try {
    if (!amountTokens || Number(amountTokens) <= 0) {
      return { success: false, error: 'Enter a valid amount' };
    }

    const signer = await getSignerFromPrivyWallet(wallet);

    const STACKING_CONTRACT_ADDRESS =
      '0x852777091af43Af197D977DcCa6aBB54b6B5Eb56';

    const contract = new ethers.Contract(
      STACKING_CONTRACT_ADDRESS,
      StakingContractAbi,
      signer
    );

    const amountWei = ethers.parseUnits(amountTokens, 18);

    const tx = await contract.stake(amountWei);
    const receipt = await tx.wait();

    return { success: true, transactionHash: receipt.hash };
  } catch (error: any) {
    console.error('Stake error:', error);
    return { success: false, error: error?.message || 'Failed to stake' };
  }
};
