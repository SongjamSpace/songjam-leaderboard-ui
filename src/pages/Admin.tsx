import { collection, query, where } from 'firebase/firestore';
import {
  useCollectionData,
  useCollectionDataOnce,
} from 'react-firebase-hooks/firestore';
import { db } from '../services/firebase.service';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';

type Props = {};

type UserSubmittedTweet = {
  projectId: string;
  username: string;
  tweetId: string;
  createdAt: number;
  isAdded: boolean;
};

const Admin = (props: Props) => {
  const [userSubmittedTweets, loading, error] = useCollectionData(
    query(
      collection(db, 'userSubmittedTweets'),
      where('projectId', '==', 'wach_ai'),
      where('isAdded', '==', false)
    )
  );

  return (
    <Box>
      <Button
        onClick={async () => {
          const tweetIds = userSubmittedTweets?.map((u) => u.tweetId);
          await axios.post(
            `${
              import.meta.env.VITE_JAM_SERVER_URL
            }/leaderboard/update-by-tweet-ids`,
            { tweetIds, projectId: 'wach_ai' }
          );
        }}
      >
        Update All
      </Button>
      {(userSubmittedTweets as UserSubmittedTweet[])?.map((tweet) => (
        <Box key={tweet.tweetId} display={'flex'} gap={2}>
          <Typography>{tweet.username}</Typography>
          <Typography>{tweet.tweetId}</Typography>
          {/* <Typography>{tweet.createdAt}</Typography> */}
        </Box>
      ))}
    </Box>
  );
};

export default Admin;
