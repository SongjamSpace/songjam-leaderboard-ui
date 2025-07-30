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

const EvaOnlineXyz = () => {
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
    const wallet = await getWalletForAirdrop(twitterId, 'EVA');
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
    <Box sx={{ bgcolor: '#f1e3eb', minHeight: '100vh' }}>
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
              fontFamily: 'Chakra Petch, sans-serif',
              fontWeight: 'bold',
              color: '#4a3740',
            }}
          >
            EVA ONLINE
          </Typography>

          {twitterUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={twitterUser?.photoURL || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid #ff007a',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  fontWeight: 'bold',
                  color: '#4a3740',
                }}
              >
                {twitterUser?.displayName}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSignOut}
                sx={{
                  color: '#ff007a',
                  borderColor: '#ff007a',
                  fontFamily: 'Chakra Petch, sans-serif',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#ff007a',
                    color: 'white',
                    borderColor: '#ff007a',
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

        {isLoading && <LinearProgress sx={{ bgcolor: '#f1e3eb' }} />}

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
                background: 'white',
                borderRadius: '15px',
                border: '1px solid #ff007a',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'Chakra Petch, sans-serif',
              }}
            >
              {twitterUser && walletForAirdrop ? (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Chakra Petch, sans-serif',
                      fontWeight: 'bold',
                      color: '#4a3740',
                      mb: 2,
                    }}
                  >
                    Ready to Claim Your $EVA Tokens
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: '#666',
                      mb: 3,
                    }}
                  >
                    Your wallet address is stored and you are ready to receive
                    your $EVA token airdrop.
                  </Typography>
                  <Box
                    sx={{
                      background: '#faecee',
                      border: '1px solid #ff007a',
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
                        fontFamily: 'Chakra Petch, sans-serif',
                        color: '#4a3740',
                        fontWeight: 'bold',
                      }}
                    >
                      Wallet:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ff007a',
                        fontFamily: 'monospace',
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
                      fontFamily: 'Chakra Petch, sans-serif',
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
                      fontFamily: 'Chakra Petch, sans-serif',
                      fontWeight: 'bold',
                      color: '#4a3740',
                      mb: 2,
                    }}
                  >
                    Add Your Wallet Address for $EVA Airdrop
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: '#666',
                      mb: 3,
                    }}
                  >
                    The wallet address you provide will be used to receive the
                    $EVA tokens based on your total points in the{' '}
                    <a
                      href="https://www.evaonline.xyz/leaderboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#ff007a', textDecoration: 'underline' }}
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
                      placeholder="(0x...) Enter 42 chars wallet address"
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Chakra Petch, sans-serif',
                          '& fieldset': {
                            borderColor: '#ff007a',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ff007a',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ff007a',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: 'Chakra Petch, sans-serif',
                          color: '#4a3740',
                          '&.Mui-focused': {
                            color: '#ff007a',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#000000',
                          fontFamily: 'Chakra Petch, sans-serif',
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
                        fontFamily: 'Chakra Petch, sans-serif',
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
                          'EVA'
                        );
                        await fetchWalletForAirdrop(
                          twitterUser.providerData[0].uid
                        );
                        setIsSubmitting(false);
                        toast.success('Wallet submitted successfully');
                      }}
                    >
                      {isSubmitting ? 'Submitting' : 'Submit for Airdrop'}
                    </Button>

                    {/* Subtle Eligibility Message */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Chakra Petch, sans-serif',
                        color: '#666',
                        mt: 2,
                        display: 'block',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      Only the top 1500 Yappers are eligible to receive the
                      Airdrop
                    </Typography>
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
                background: 'white',
                borderRadius: '15px',
                border: '1px solid #ff007a',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'Chakra Petch, sans-serif',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  fontWeight: 'bold',
                  color: '#4a3740',
                  mb: 2,
                }}
              >
                Are You Part of the EVA ONLINE Leaderboard?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: '#666',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Sign in with your X (Twitter) account to check if you're
                eligible for the $EVA token airdrop.
              </Typography>
              <Button
                disabled={isLoading}
                variant="contained"
                size="large"
                onClick={handleTwitterSignIn}
                sx={{
                  bgcolor: '#ef4444',
                  color: 'white',
                  fontFamily: 'Chakra Petch, sans-serif',
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
              color: '#b0b0b0',
              fontFamily: 'Chakra Petch, sans-serif',
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
                color: '#ff007a',
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

export default EvaOnlineXyz;
