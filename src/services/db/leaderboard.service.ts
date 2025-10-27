import axios from 'axios';
import { db } from '../firebase.service';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

// const SONGJAM_LEADERBOARD_COLLECTION_NAME = 'singPointsLeaderboard_18_06_2025';

const userIdExistsInLeaderboard = async (
  userId: string,
  id: 'SANG' | 'JELLU'
) => {
  // return {totalPoints: 12};
  const projectIdMapping = {
    SANG: 'songjamspace',
    JELLU: 'jellu69',
  };
  const lb = await axios.get(
    `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectIdMapping[id]}`
  );
  const exists = lb.data.find((u: LeaderboardUser) => u.userId === userId);
  return exists;
};

export type AgentReport = {
  summary: string;
  repliesAnalysis: string;
  authenticity: number;
  quality: number;
  explanation: string;
  farmingIndicators: {
    averageHashtags: number;
    averageMentions: number;
    gmTweetCount: number;
    callToActionRatio: number;
  };
  botLikelihoodScore: number;
  tweetsCount: number;
};

export const getReport = async (id: string) => {
  const ss = await getDoc(doc(db, 'agentReports', id));
  return (await ss.data()) as AgentReport;
};

export type SlashDoc = {
  proposer: string;
  createdAt: number;
  userId: string;
  username: string;
  slashCount: number;
  defendCount: number;
  slashedUsernames: string[];
  slashedUserIds: string[];
  defendedUsernames: string[];
  updatedAt: number;
};

const FLAG_DB_NAME = 'flags';

export const createSlash = async (
  projectId: string,
  flagUserId: string,
  proposer: string,
  username: string,
  voterUserId: string
): Promise<SlashDoc> => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${flagUserId}`);
  const slashDoc = {
    createdAt: Date.now(),
    defendCount: 0,
    slashCount: 1,
    proposer,
    username,
    slashedUsernames: [proposer],
    slashedUserIds: [voterUserId],
    defendedUsernames: [],
    updatedAt: 0,
    userId: flagUserId,
    projectId,
  } as SlashDoc;
  await setDoc(slashRef, slashDoc);
  return slashDoc;
};

export const updateSlash = async (
  projectId: string,
  userId: string,
  username: string,
  vote: 'defend' | 'slash',
  voterUserId: string
) => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  await updateDoc(slashRef, {
    slashCount: increment(vote === 'slash' ? 1 : 0),
    defendCount: increment(vote === 'defend' ? 1 : 0),
    slashedUsernames: arrayUnion(username),
    slashedUserIds: arrayUnion(voterUserId),
    defendedUsernames: [],
    updatedAt: Date.now(),
  });
  const slash = await getSlash(projectId, userId);
  return slash;
};

export const getSlash = async (projectId: string, userId: string) => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  const docSs = await getDoc(slashRef);
  return docSs.data() as SlashDoc;
};

export type LeaderboardUser = {
  engagementPoints: number;
  name: string;
  postGenesisPoints: number;
  preGenesisPoints: number;
  totalPoints: number;
  userId: string;
  username: string;
};

export type UserTweetMention = {
  username: string;
  id: string;
  name: string;
  isPin: boolean;
  urls: string[];
  isQuoated: boolean;
  isReply: boolean;
  isRetweet: boolean;
  likes: number;
  replies: number;
  retweets: number;
  quotes: number;
  views: number;
  isQuoted: boolean;
  bookmarkCount: number;
  timeParsed: Date | null;
  timestamp: number;
  text: string;
  mentions: { id: string; username?: string; name?: string }[];
  engagementPoints: number;
  docCreatedAt: number;
  tweetId: string;
  earlyMultiplier: number;
  baseEngagementPoints?: number;
  html?: string;
};

const leaderboardEndpointsIdMap: { [key: string]: string } = {
  evaonlinexyz: 'https://evaonlinexyz-leaderboard.logesh-063.workers.dev/',
  songjamspace:
    'https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace',
  wach_ai: 'https://songjamspace-leaderboard.logesh-063.workers.dev/wach_ai',
};

export const getLeaderBoardUser = async (projectId: string, userId: string) => {
  const lbData = await axios.get(leaderboardEndpointsIdMap[projectId]);
  const leaderboard = Array.isArray(lbData.data)
    ? lbData.data
    : lbData.data.result;
  const leaderboardUser = leaderboard.find(
    (user: LeaderboardUser) => user.userId === userId
  );
  return leaderboardUser;
};

export const getTwitterMentions = async (projectId: string, userId: string) => {
  const res = await axios.get(
    `${
      import.meta.env.VITE_JAM_SERVER_URL
    }/leaderboard/user-tweets?userId=${userId}&projectId=${projectId}`
  );
  if (res.data.success) {
    return res.data.result;
  }
  return [];
};

export const submitTweet = async (
  projectId: string,
  username: string,
  tweetId: string
): Promise<boolean> => {
  const docRef = doc(db, 'userSubmittedTweets', `${projectId}_${tweetId}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return false;
  }
  await setDoc(docRef, {
    username,
    tweetId,
    projectId,
    createdAt: Date.now(),
    isAdded: false,
  });
  return true;
};

export { userIdExistsInLeaderboard };
