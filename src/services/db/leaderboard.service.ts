import { db } from '../firebase.service';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const SONGJAM_LEADERBOARD_COLLECTION_NAME = 'singPointsLeaderboard_19_06_2025';

const userIdExistsInLeaderboard = async (userId: string) => {
  const docRef = doc(
    collection(db, SONGJAM_LEADERBOARD_COLLECTION_NAME),
    userId
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export { userIdExistsInLeaderboard };
