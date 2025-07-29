import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Avatar,
  keyframes,
  Dialog,
  LinearProgress,
  Stack,
  TextField,
} from '@mui/material';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../services/firebase.service';
// import { userIdExistsInLeaderboard } from '../services/db/leaderboard.service';
// import {
//   DynamicEmbeddedWidget,
//   useDynamicContext,
// } from '@dynamic-labs/sdk-react-core';
import {
  getWalletForAirdrop,
  TokenSubmitWallet,
  submitTokenForAirdrop,
} from '../services/db/sangClaim.service';
import { toast, Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';

const WachAi = () => {
  const [twitterUser, setTwitterUser] = useState<User | null>(null);

  // const [isLeaderboardMember, setIsLeaderboardMember] = useState(false);
  // const [userLbData, setUserLbData] = useState<{
  //   totalPoints: number;
  // } | null>(null);
  // const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletForAirdrop, setWalletForAirdrop] =
    useState<TokenSubmitWallet | null>(null);
  const [localWalletAddres, setLocalWalletAddress] = useState('');

  // const checkIfUserIsLeaderboardMember = async (userId: string) => {
  //   setIsLoading(true);
  //   const lbData = await userIdExistsInLeaderboard('100295277', 'EVA');
  //   setIsLeaderboardMember(!!lbData);
  //   setUserLbData(lbData as { totalPoints: number } | null);
  //   setIsLoading(false);
  // };

  const fetchWalletForAirdrop = async (twitterId: string) => {
    const wallet = await getWalletForAirdrop(twitterId, 'WACHAI');
    setWalletForAirdrop(wallet as TokenSubmitWallet);
    setIsLoading(false);
  };

  useEffect(() => {
    if (twitterUser) {
      // checkIfUserIsLeaderboardMember(twitterUser.providerData[0].uid);
      fetchWalletForAirdrop(twitterUser.providerData[0].uid);
    }
  }, [twitterUser]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      if (
        user?.providerData.length &&
        user.providerData.find((p) => p.providerId === 'twitter.com')
      ) {
        setTwitterUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTwitterSignIn = async () => {
    try {
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Twitter sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#000000',
        minHeight: '100vh',
        fontFamily: '"DM Mono", monospace',
      }}
    >
      <Container
        sx={{
          pb: 2,
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            mb: 4,
            pt: 2,
            gap: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"DM Mono", monospace',
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            WachAI
          </Typography>

          {twitterUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={twitterUser?.photoURL || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid #6AFF92',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"DM Mono", monospace',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {twitterUser?.displayName}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSignOut}
                sx={{
                  color: '#6AFF92',
                  borderColor: '#6AFF92',
                  fontFamily: '"DM Mono", monospace',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#6AFF92',
                    color: 'white',
                    borderColor: '#6AFF92',
                  },
                  transition: 'all 0.2s',
                }}
                size="small"
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Box>

        {isLoading && <LinearProgress sx={{ bgcolor: '#000000' }} />}

        {/* Claim Section - Only show if signed in */}
        {twitterUser ? (
          <Box
            sx={{
              my: 4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Paper
              sx={{
                p: 4,
                background: '#111111',
                borderRadius: '15px',
                border: '1px solid #6AFF92',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
                fontFamily: '"DM Mono", monospace',
              }}
            >
              {twitterUser && walletForAirdrop ? (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"DM Mono", monospace',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      mb: 2,
                    }}
                  >
                    Ready to Claim Your $WACH Rewards
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"DM Mono", monospace',
                      color: '#cccccc',
                      mb: 3,
                    }}
                  >
                    Your wallet address is stored and you are ready to receive
                    your $WACH token rewards.
                  </Typography>
                  <Box
                    sx={{
                      background: '#222222',
                      border: '1px solid #6AFF92',
                      borderRadius: '10px',
                      p: 2,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"DM Mono", monospace',
                        color: '#ffffff',
                        fontWeight: 'bold',
                      }}
                    >
                      Wallet:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6AFF92',
                        fontFamily: '"DM Mono", monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {walletForAirdrop.walletAddress.slice(0, 6)}...
                      {walletForAirdrop.walletAddress.slice(-4)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !!walletForAirdrop}
                    sx={{
                      bgcolor:
                        isSubmitting || !!walletForAirdrop
                          ? '#faecee'
                          : '#ef4444',
                      color:
                        isSubmitting || !!walletForAirdrop
                          ? '#d1002c'
                          : 'white',
                      fontFamily: '"DM Mono", monospace',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      borderRadius: '25px',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      borderColor: 'transparent',
                      '&:hover': {
                        bgcolor:
                          isSubmitting || !!walletForAirdrop
                            ? '#f8d7da'
                            : '#b91c1c',
                      },
                      transition: 'background 0.2s',
                    }}
                  >
                    Wallet Submitted
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"DM Mono", monospace',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      mb: 2,
                    }}
                  >
                    Add Your Wallet Address for $WACH Rewards
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"DM Mono", monospace',
                      color: '#cccccc',
                      mb: 3,
                    }}
                  >
                    The wallet address you provide will be used to receive the
                    $WACH tokens based on your total points in the{' '}
                    <a
                      href="https://www.evaonline.xyz/leaderboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6AFF92', textDecoration: 'underline' }}
                    >
                      leaderboard
                    </a>
                  </Typography>
                  <Stack>
                    <TextField
                      fullWidth
                      label="Wallet Address"
                      variant="outlined"
                      value={localWalletAddres}
                      onChange={(e) => setLocalWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address (0x...)"
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"DM Mono", monospace',
                          '& fieldset': {
                            borderColor: '#6AFF92',
                          },
                          '&:hover fieldset': {
                            borderColor: '#6AFF92',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6AFF92',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"DM Mono", monospace',
                          color: '#ffffff',
                          '&.Mui-focused': {
                            color: '#6AFF92',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                          fontFamily: '"DM Mono", monospace',
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      sx={{
                        bgcolor: '#ef4444',
                        color: 'white',
                        fontFamily: '"DM Mono", monospace',
                        fontWeight: 700,
                        px: 4,
                        py: 2,
                        borderRadius: '25px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        borderColor: 'transparent',
                        '&:hover': {
                          bgcolor: '#b91c1c',
                        },
                        transition: 'background 0.2s',
                      }}
                      onClick={async () => {
                        if (!ethers.isAddress(localWalletAddres)) {
                          return toast.error('Invalid Wallet Address');
                        }
                        if (!twitterUser || !twitterUser.providerData[0].uid) {
                          toast.error(
                            'Please sign in with X to submit your wallet'
                          );
                          return;
                        }
                        setIsSubmitting(true);
                        await submitTokenForAirdrop(
                          twitterUser.providerData[0].uid,
                          {
                            walletAddress: localWalletAddres,
                            userId: twitterUser.uid,
                            username:
                              (twitterUser as any).reloadUserInfo?.screenName ||
                              '',
                            name: twitterUser.displayName,
                          },
                          'WACHAI'
                        );
                        await fetchWalletForAirdrop(
                          twitterUser.providerData[0].uid
                        );
                        setIsSubmitting(false);
                        toast.success('Wallet submitted successfully');
                      }}
                    >
                      {isSubmitting ? 'Submitting' : 'Submit for Rewards'}
                    </Button>
                  </Stack>
                </>
              )}
            </Paper>
          </Box>
        ) : (
          <Box
            sx={{
              my: 4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Paper
              sx={{
                p: 4,
                background: '#111111',
                borderRadius: '15px',
                border: '1px solid #6AFF92',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
                fontFamily: '"DM Mono", monospace',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"DM Mono", monospace',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  mb: 2,
                }}
              >
                Are You Part of the WachAI Leaderboard?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"DM Mono", monospace',
                  color: '#cccccc',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Sign in with your X (Twitter) account to check if you're
                eligible for the $WACH token rewards.
              </Typography>
              <Button
                disabled={isLoading}
                variant="contained"
                size="large"
                onClick={handleTwitterSignIn}
                sx={{
                  bgcolor: '#ef4444',
                  color: 'white',
                  fontFamily: '"DM Mono", monospace',
                  fontWeight: 700,
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  borderColor: 'transparent',
                  '&:hover': {
                    bgcolor: '#b91c1c',
                  },
                  transition: 'background 0.2s',
                }}
              >
                Sign in with X
              </Button>
            </Paper>
          </Box>
        )}

        {/* Footer */}
        <Box display={'flex'} justifyContent={'center'}>
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              width: '100%',
              display: 'block',
              color: '#cccccc',
              fontFamily: '"DM Mono", monospace',
            }}
          >
            Powered by{' '}
            <a
              href="https://songjam.space/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: '#6AFF92',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.textDecoration = 'underline')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.textDecoration = 'none')
              }
            >
              Songjam
            </a>
          </Typography>
        </Box>
        <Toaster position="bottom-center" />
      </Container>
    </Box>
  );
};

export default WachAi;
