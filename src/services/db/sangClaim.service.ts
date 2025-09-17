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

export const getCreatorTokenInfo = async (userId: string) => {
  const claimTokensRef = doc(db, 'sang_airdrop_wallets', userId);
  const claimTokens = await getDoc(claimTokensRef);
  return claimTokens.data();
};

type V2AirdropSubmission = {
  twitterId: string;
  mintedCreaterTokenAddress: string;
  mintedCreaterTokenSymbol: string;
  mintedCreaterTokenName: string;
  stakeBalance: string;
  stakedWalletAddress: string;

  airdropWalletAddress: string;
};

export const createV2AirdropSubmissionDoc = async (
  twitterId: string,
  v2AirdropSubmission: V2AirdropSubmission
) => {
  const docRef = doc(db, 'v2_airdrop_submissions', twitterId);
  await setDoc(docRef, {
    ...v2AirdropSubmission,
    createdAt: Date.now(),
    createdDateTime: serverTimestamp(),
  });
};

export const getV2SubmissionDoc = async (twitterId: string) => {
  const docRef = doc(db, 'v2_airdrop_submissions', twitterId);
  const docSs = await getDoc(docRef);
  if (docSs.exists()) {
    return docSs.data() as V2AirdropSubmission;
  }
  return null;
};
