import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const LB_PROJECTS_COLLECTION = 'leaderboard_projects';

export type LeaderboardProject = {
  twitterUsername: string;
  cashtag: string;
  formulaType: 'default' | 'custom';
  searchQuery: string;
  customFormula: string;
  projectId: string;
  createdAt: number;
  includeReplyTweets: boolean;
  startDateInSeconds: number;
  launchTimeInSeconds: number;
  teamIgnoreList: {
    userId: string;
    username: string;
  }[];
  tweetBlockList: string[];
  userIdsForUpdate: string[];
  name: string;
};

// export const createLeaderboardProject = async (project: LeaderboardProject) => {
//   const database = doc(db, LB_PROJECTS_COLLECTION, project.projectId);
//   await setDoc(database, project);
//   console.log("Project created");
// };
export const getLeaderboardProject = async (projectId: string) => {
  const database = doc(db, LB_PROJECTS_COLLECTION, projectId);
  const project = await getDoc(database);
  if (!project.exists) {
    return null;
  }
  return project.data() as LeaderboardProject;
};

// const WHITELISTED_USERS_SUB_COLLECTION = "whitelistedUsers";

// export type WhitelistedUser = {
//   username: string;
//   userId: string;
//   createdAt: number;
//   stakedBalance: number;
// };

// export const getWhitelistedUsers = async (projectId: string) => {
//   const collection = db
//     .collection(LB_PROJECTS_COLLECTION)
//     .doc(projectId)
//     .collection(WHITELISTED_USERS_SUB_COLLECTION);
//   const snapshot = await collection.get();
//   const whitelistedUsers = snapshot.docs.map(
//     (doc) => doc.data() as WhitelistedUser
//   );
//   return whitelistedUsers;
// };

// const SNAPSHOT_SUB_COLLECTION = "snapshots";
// export const updateLastUpdatedAt = async (
//   projectId: string,
//   noOfUsers: number
// ) => {
//   const database = db.collection(LB_PROJECTS_COLLECTION).doc(projectId);
//   await database.update({
//     lastUpdatedAt: Date.now(),
//     lastUpdateDateTime: serverTimestamp(),
//   });
//   const snapshotCollection = database.collection(SNAPSHOT_SUB_COLLECTION);
//   await snapshotCollection.add({
//     usersCount: noOfUsers,
//     createdAt: Date.now(),
//     createdDateTime: serverTimestamp(),
//   });
// };
