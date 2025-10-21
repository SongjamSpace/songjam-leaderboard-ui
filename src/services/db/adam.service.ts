import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const SIGNATURES_COLLECTION = 'adam_signatures';

export interface SignatureData {
  address: string;
  twitterId: string;
  screenName: string;
  signature: string;
  createdAt: number;
}

export const createSignatureDoc = async (
  address: string,
  twitterId: string,
  screenName: string,
  signature: string
): Promise<void> => {
  const signatureDocRef = doc(db, SIGNATURES_COLLECTION, address);
  const signatureData: SignatureData = {
    address,
    twitterId,
    screenName,
    signature,
    createdAt: Date.now(),
  };
  await setDoc(signatureDocRef, signatureData);
};

export const getSignatureDoc = async (
  address: string
): Promise<SignatureData | null> => {
  const signatureDocRef = doc(db, SIGNATURES_COLLECTION, address);
  const signatureDoc = await getDoc(signatureDocRef);

  if (signatureDoc.exists()) {
    return signatureDoc.data() as SignatureData;
  }

  return null;
};
