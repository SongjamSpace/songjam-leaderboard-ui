import { db } from '../firebase.service';
import { collection, doc, getDoc } from 'firebase/firestore';

const SONGJAM_LEADERBOARD_COLLECTION_NAME = 'singPointsLeaderboard_19_06_2025';
const EVA_LEADERBOARD_COLLECTION_NAME = 'evaonlinexyz_leaderboard';

const userIdExistsInLeaderboard = async (userId: string, id: 'SANG' | 'EVA') => {
  const docRef = doc(
    collection(db, id === 'SANG' ? SONGJAM_LEADERBOARD_COLLECTION_NAME : EVA_LEADERBOARD_COLLECTION_NAME),
    userId
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export { userIdExistsInLeaderboard };
