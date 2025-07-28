import { db } from '../firebase.service';
import { collection, doc, getDoc } from 'firebase/firestore';

const SONGJAM_LEADERBOARD_COLLECTION_NAME = 'singPointsLeaderboard_18_06_2025';

const userIdExistsInLeaderboard = async (userId: string, id: 'SANG') => {
  const docRef = doc(
    collection(db, SONGJAM_LEADERBOARD_COLLECTION_NAME),
    userId
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export { userIdExistsInLeaderboard };
