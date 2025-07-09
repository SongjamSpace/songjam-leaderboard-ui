import { ethers } from 'ethers';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Minimum staked amount required (50k ELYTRA tokens)
const MIN_STAKED_AMOUNT = ethers.parseUnits('50000', 18); // Assuming 18 decimals

export interface ElytraStakingInfo {
  hasMinimumStake: boolean;
  balance: string;
  formattedBalance: string;
  symbol: string;
  name: string;
}

export const getElytraStakingStatus = async (
  walletAddress: string,
  chainId: number
): Promise<ElytraStakingInfo> => {
  if (!window.ethereum) {
    throw new Error('No wallet provider found');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const STACKING_CONTRACT_ADDRESS =
    '0x433584897c42db1770E50E1c93A4F20E35fFed06';
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
      symbol: 'ELYTRA',
      name: 'Elytra',
    };
  }

  return {
    hasMinimumStake: false,
    balance: '0',
    formattedBalance: '0',
    symbol: 'ELYTRA',
    name: 'Elytra',
  };
};
