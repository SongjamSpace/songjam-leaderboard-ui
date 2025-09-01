import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';
import { CreatorTokenInfo } from '../creatorToken.service';

const CLAIM_SANG_TOKENS_COLLECTION = 'sang_airdrop_wallets';
const CLAIM_EVA_TOKENS_COLLECTION = 'eva_airdrop_wallets';
const CLAIM_WACHAI_TOKENS_COLLECTION = 'wachai_airdrop_wallets';

export interface TokenSubmitWallet {
  walletAddress: string;
  userId: string;
  username: string | null;
  name: string | null;
  twitterId?: string | null;

  tokenName?: string;
  tokenSymbol?: string;
  creatorContractAddress?: string;
}

export const submitTokenForAirdrop = async (
  twitterId: string,
  claimTokens: TokenSubmitWallet,
  id: 'SANG' | 'EVA' | 'WACHAI'
) => {
  const collectionName = idCollectionMapping[id];
  const claimTokensRef = doc(db, collectionName, twitterId);
  await setDoc(claimTokensRef, {
    ...claimTokens,
    createdAt: Date.now(),
    createdDateTime: serverTimestamp(),
  });
};

const idCollectionMapping = {
  SANG: CLAIM_SANG_TOKENS_COLLECTION,
  EVA: CLAIM_EVA_TOKENS_COLLECTION,
  WACHAI: CLAIM_WACHAI_TOKENS_COLLECTION,
};

export const getWalletForAirdrop = async (
  twitterId: string,
  id: 'SANG' | 'EVA' | 'WACHAI'
) => {
  const collectionName = idCollectionMapping[id];
  const claimTokensRef = doc(db, collectionName, twitterId);
  const claimTokens = await getDoc(claimTokensRef);
  return claimTokens.data();
};

export const updateCreatorTokenInfo = async (
  twitterId: string,
  id: 'SANG' | 'EVA' | 'WACHAI',
  {
    tokenName,
    tokenSymbol,
    creatorContractAddress,
    txHash,
  }: {
    tokenName: string;
    tokenSymbol: string;
    creatorContractAddress: string;
    txHash: string;
  }
) => {
  const collectionName = idCollectionMapping[id];
  const claimTokensRef = doc(db, collectionName, twitterId);
  await updateDoc(claimTokensRef, {
    tokenName,
    tokenSymbol,
    creatorContractAddress,
    txHash,
    mintedTimestampMs: Date.now(),
  });
};
