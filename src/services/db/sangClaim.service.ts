import { doc, getDoc, serverTimestamp } from 'firebase/firestore';

import { setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const CLAIM_SANG_TOKENS_COLLECTION = 'sang_airdrop_wallets';
const CLAIM_EVA_TOKENS_COLLECTION = 'eva_airdrop_wallets';
const CLAIM_WACHAI_TOKENS_COLLECTION = 'wachai_airdrop_wallets';

export interface TokenSubmitWallet {
  walletAddress: string;
  userId: string;
  username: string | null;
  name: string | null;
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
