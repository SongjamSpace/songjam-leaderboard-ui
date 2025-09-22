import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from '../services/firebase.service';
import {
  getLeaderboardProject,
  LeaderboardProject,
} from '../services/db/leaderboardProjects.service';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface UserSubmittedTweet {
  url: string;
  status: 'NEW';
  tweetId: string;
  username: string;
  name: string;
  uid: string;
  twitterId: string;
  createdAt: number;
}

const getTweetIdFromTweetUrl = (tweetUrl: string) => {
  // use regex to check /status/tweetId
  const regex = /\/status\/(\d+)/;
  const match = tweetUrl.match(regex);
  if (match) {
    return match[1];
  }
  return null;
};

const Submit = () => {
  const [searchParams] = useSearchParams();
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<LeaderboardProject | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectId = searchParams.get('id');

  useEffect(() => {
    // Auto-connect X login
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // setIsLoading(false);
      if (
        user?.providerData.length &&
        user.providerData.find((p) => p.providerId === 'twitter.com')
      ) {
        setTwitterUser(user);
      } else {
        // Auto-trigger Twitter login
        try {
          const userCreds = await signInWithPopup(
            auth,
            new TwitterAuthProvider()
          );
          setTwitterUser(userCreds.user);
        } catch (error) {
          console.error('Error signing in with Twitter:', error);
          toast.error('Failed to connect X account');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const projectData = await getLeaderboardProject(projectId);
          setProject(projectData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching project:', error);
          toast.error('Failed to load project details');
        }
      }
    };

    fetchProject();
  }, [projectId]);

  const handleTwitterSignIn = async () => {
    try {
      const userCreds = await signInWithPopup(auth, new TwitterAuthProvider());
      setTwitterUser(userCreds.user);
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
      toast.error('Failed to connect X account');
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setTwitterUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleTweetUrlPaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText = event.clipboardData.getData('text');
    if (pastedText.includes('twitter.com') || pastedText.includes('x.com')) {
      setTweetUrl(pastedText);
    }
  };

  const handleSubmitTweet = async () => {
    if (!tweetUrl) {
      toast.error('Please enter a tweet URL');
      return;
    }
    const tweetId = getTweetIdFromTweetUrl(tweetUrl);
    if (!tweetId) {
      toast.error('Please enter a valid tweet URL');
      return;
    }

    if (!twitterUser) {
      toast.error('Please sign in with X first');
      return;
    }

    if (!projectId) {
      toast.error('Project ID not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const twitterProvider = twitterUser.providerData.find(
        (p) => p.providerId === 'twitter.com'
      );
      const tweetData: UserSubmittedTweet = {
        url: tweetUrl,
        status: 'NEW',
        tweetId: tweetId,
        username: (twitterUser as any).reloadUserInfo?.screenName || '',
        name: twitterUser.displayName || '',
        uid: twitterUser.uid,
        twitterId: twitterProvider?.uid || '',
        createdAt: Date.now(),
      };

      // Save to userSubmittedTweets subcollection
      const docRef = doc(
        db,
        'leaderboard_projects',
        projectId,
        'userSubmittedTweets',
        tweetId
      );
      const data = await getDoc(docRef);
      if (data.exists()) {
        return alert('Tweet already submitted');
      }
      await setDoc(docRef, tweetData);

      setTweetUrl('');
      toast.success('Tweet submitted successfully!');
    } catch (error) {
      console.error('Error submitting tweet:', error);
      toast.error('Failed to submit tweet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
        }}
      >
        <CircularProgress sx={{ color: '#8B5CF6' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
        position: 'relative',
        py: 4,
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundImage: 'url(/logos/songjam_logo.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.07,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main Title and X Login Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 6,
            flexWrap: 'wrap',
          }}
        >
          {/* Main Title */}
          <Typography
            variant="h3"
            sx={{
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
              flex: 1,
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            Submit Tweets for @{project?.twitterUsername}
          </Typography>

          {/* X Login Section */}
          <Paper
            sx={{
              p: 2,
              background: 'transparent',
              borderRadius: '15px',
            }}
          >
            {twitterUser ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#8B5CF6',
                    fontWeight: 'bold',
                  }}
                >
                  {twitterUser?.displayName}
                </Typography>
                <IconButton
                  onClick={handleSignOut}
                  sx={{
                    color: '#8B5CF6',
                  }}
                  size="small"
                >
                  <Logout />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="medium"
                onClick={handleTwitterSignIn}
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                  },
                }}
              >
                Sign in with X
              </Button>
            )}
          </Paper>
        </Box>

        {/* Tweet Submission Section */}
        {twitterUser && project && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 4,
            }}
          >
            <Paper
              sx={{
                p: 4,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                border: '1px solid #8B5CF6',
                backdropFilter: 'blur(10px)',
                width: '100%',
                maxWidth: 600,
              }}
            >
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  '& .MuiAlert-message': {
                    color: '#8B5CF6',
                    fontWeight: 'bold',
                  },
                  '& .MuiAlert-icon': {
                    color: '#8B5CF6',
                  },
                }}
              >
                Connected as @
                {(twitterUser as any).reloadUserInfo?.screenName || 'Unknown'}
              </Alert>

              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Submit Your Tweet
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Paste your tweet URL below to submit it for @
                {project.twitterUsername}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  onPaste={handleTweetUrlPaste}
                  placeholder="https://twitter.com/xyz/status/123"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(139, 92, 246, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B5CF6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => handleSubmitTweet()}
                disabled={!tweetUrl || isSubmitting}
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  py: 2,
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: 'none',
                  },
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Tweet'}
              </Button>
            </Paper>
          </Box>
        )}

        {/* Project Not Found */}
        {!project && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                color: 'white',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Project not found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
              }}
            >
              The project you're looking for doesn't exist or has been removed.
            </Typography>
          </Box>
        )}

        <Toaster position="bottom-center" />
      </Container>
    </Box>
  );
};

export default Submit;
