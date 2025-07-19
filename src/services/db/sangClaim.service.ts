import { collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';

import { setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const CLAIM_SANG_TOKENS_COLLECTION = 'sang_airdrop_wallets';

export interface SangSubmitWallet {
  walletAddress: string;
  userId: string;
  username: string | null;
  name: string | null;
}

export const submitWalletForAirdrop = async (
  twitterId: string,
  claimSangTokens: SangSubmitWallet
) => {
  const claimSangTokensRef = doc(db, CLAIM_SANG_TOKENS_COLLECTION, twitterId);
  await setDoc(claimSangTokensRef, {
    ...claimSangTokens,
    createdAt: Date.now(),
    createdDateTime: serverTimestamp(),
  });
};

export const getWalletForAirdrop = async (twitterId: string) => {
  const claimSangTokensRef = doc(db, CLAIM_SANG_TOKENS_COLLECTION, twitterId);
  const claimSangTokens = await getDoc(claimSangTokensRef);
  return claimSangTokens.data();
};
