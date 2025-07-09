import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

export type ElytraStakerDoc = {
  walletAddress: string;
  userId: string;
  username: string | null;
  name: string | null;
};

const ELYTRA_STAKERS_COLLECTION = 'elytraStakers';

export const createElytraStakerDoc = async (
  walletAddress: string,
  userId: string,
  username: string | null,
  name: string | null
): Promise<boolean> => {
  const ss = doc(db, ELYTRA_STAKERS_COLLECTION, walletAddress);
  const docSs = await getDoc(ss);
  if (docSs.exists()) {
    return true;
  }
  await setDoc(ss, {
    walletAddress,
    userId,
    username,
    name,
    createdAt: Date.now(),
  });
  return false;
};
