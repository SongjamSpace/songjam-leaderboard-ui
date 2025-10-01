import { useState, useEffect } from 'react';
import './App.css';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './services/firebase.service';
import { useConnectWallet, useWallets } from '@privy-io/react-auth';
import {
  addToTwitterWalletAccounts,
  getTwitterWalletById,
  TwitterAccountWalletAddress,
} from './services/db/sangClaim.service';
import { getSangStakingStatus } from './services/sang.service';
import axios from 'axios';

export default function App() {
  const { connectWallet } = useConnectWallet();
  const { wallets } = useWallets();
  const [primaryWallet] = wallets;
  const [alreadySubmittedDoc, setAlreadySubmittedDoc] =
    useState<TwitterAccountWalletAddress | null>(null);
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      const twitterWallet = await getTwitterWalletById(user?.uid || '');
      setTwitterUser(user);
      if (twitterWallet) {
        setAlreadySubmittedDoc(twitterWallet);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-trigger Twitter login on mount
  useEffect(() => {
    if (!hasAttemptedAutoConnect && !isLoading && !twitterUser) {
      setHasAttemptedAutoConnect(true);
      handleTwitterSignIn();
    }
  }, [isLoading, twitterUser, hasAttemptedAutoConnect]);

  const handleTwitterSignIn = async () => {
    try {
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Connected to X successfully!');
    } catch (error) {
      console.error('Twitter sign-in error:', error);
    }
  };

  const currentStep = twitterUser ? (primaryWallet ? 3 : 2) : 1;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
        position: 'relative',
        py: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2,
            textShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
          }}
        >
          Welcome to Songjam
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            mb: 6,
            fontWeight: 'normal',
          }}
        >
          Submit your account and staking wallet address
        </Typography>

        {/* Steps Container */}
        <Paper
          sx={{
            p: 5,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Step 1: Connect X */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    currentStep >= 2
                      ? 'linear-gradient(45deg, #8B5CF6, #EC4899)'
                      : 'rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {currentStep >= 2 ? <CheckCircle /> : '1'}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Connect X Account
              </Typography>
            </Box>

            {twitterUser ? (
              <Box
                sx={{
                  ml: 7,
                  p: 2.5,
                  background:
                    'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                    }}
                  >
                    Connected as
                  </Typography>
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    @{twitterUser.displayName}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={async () => {
                    await auth.signOut();
                    setTwitterUser(null);
                  }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    py: 0.75,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            ) : (
              <Box sx={{ ml: 7 }}>
                <Button
                  variant="contained"
                  onClick={handleTwitterSignIn}
                  disabled={isLoading}
                  sx={{
                    background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    px: 4,
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
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {isLoading ? 'Connecting...' : 'Connect X'}
                </Button>
              </Box>
            )}
          </Box>

          {/* Connector Line */}
          <Box
            sx={{
              ml: 2.5,
              width: 2,
              height: 40,
              background:
                currentStep >= 2
                  ? 'linear-gradient(180deg, #8B5CF6, #EC4899)'
                  : 'rgba(139, 92, 246, 0.2)',
              mb: 2,
            }}
          />

          {/* Step 2: Connect Wallet */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    currentStep >= 3
                      ? 'linear-gradient(45deg, #8B5CF6, #EC4899)'
                      : currentStep >= 2
                      ? 'rgba(139, 92, 246, 0.3)'
                      : 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color:
                    currentStep >= 2 ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  flexShrink: 0,
                }}
              >
                {currentStep >= 3 ? <CheckCircle /> : '2'}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color:
                    currentStep >= 2 ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                Connect Staking Wallet
              </Typography>
            </Box>
            {alreadySubmittedDoc && (
              <Box
                sx={{
                  my: 2,
                  ml: 7,
                  p: 2,
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',

                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(34, 197, 94, 0.8)',
                    fontSize: '0.75rem',
                    display: 'block',
                  }}
                >
                  Currently Submitted:
                </Typography>
                <Typography
                  sx={{
                    color: 'rgb(34, 197, 94)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                >
                  {alreadySubmittedDoc.connectedWalletAddress?.slice(0, 6)}
                  ...
                  {alreadySubmittedDoc.connectedWalletAddress?.slice(-4)}
                </Typography>
              </Box>
            )}

            {primaryWallet ? (
              <Box sx={{ ml: 7 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background:
                      'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                      }}
                    >
                      Wallet Connected
                    </Typography>
                    <Typography
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      }}
                    >
                      {primaryWallet.address?.slice(0, 6)}...
                      {primaryWallet.address?.slice(-4)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => {
                      primaryWallet.disconnect();
                      alert('Use the Wallet extension/app to disconnect');
                    }}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 2,
                      py: 0.75,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    Disconnect
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ ml: 7 }}>
                <Button
                  variant="contained"
                  onClick={connectWallet}
                  disabled={!twitterUser || isSubmitting}
                  sx={{
                    background:
                      currentStep >= 2
                        ? 'linear-gradient(45deg, #8B5CF6, #EC4899)'
                        : 'rgba(255, 255, 255, 0.1)',
                    color:
                      currentStep >= 2 ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    px: 4,
                    py: 1.5,
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow:
                      currentStep >= 2
                        ? '0 4px 15px rgba(139, 92, 246, 0.3)'
                        : 'none',
                    '&:hover': {
                      background:
                        currentStep >= 2
                          ? 'linear-gradient(45deg, #7c3aed, #db2777)'
                          : 'rgba(255, 255, 255, 0.1)',
                      boxShadow:
                        currentStep >= 2
                          ? '0 6px 20px rgba(139, 92, 246, 0.4)'
                          : 'none',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Connect Staking Wallet
                </Button>
                {!twitterUser && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.5)',
                      mt: 1,
                    }}
                  >
                    Complete step 1 first
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Success Message */}
          {currentStep >= 3 && (
            <Box
              sx={{
                // mt: 4,
                pt: 3,
                // background: 'rgba(139, 92, 246, 0.1)',
                // borderRadius: '15px',
                // border: '1px solid rgba(139, 92, 246, 0.3)',
                textAlign: 'center',
              }}
            >
              <Button
                variant="contained"
                onClick={async () => {
                  if (!twitterUser || !primaryWallet || isSubmitting) {
                    alert('Please connect your X account and staking wallet');
                    return;
                  }
                  setIsSubmitting(true);
                  const stakingInfo = await getSangStakingStatus(
                    primaryWallet.address
                  );
                  if (!stakingInfo?.hasMinimumStake) {
                    alert('Please stake at least 10,000 SANG tokens');
                    return;
                  }
                  await addToTwitterWalletAccounts({
                    twitterId: twitterUser?.uid || '',
                    connectedWalletAddress: primaryWallet.address,
                    projectId: 'adam_songjam',
                    stakedBalance: stakingInfo.balance,
                  });
                  try {
                    await axios.post(
                      `${
                        import.meta.env.VITE_JAM_SERVER_URL
                      }/update-leaderboard`,
                      {
                        projectId: 'adam_songjam',
                      }
                    );
                  } catch (e) {}
                  setIsSubmitting(false);
                  toast.success('Wallet submitted successfully');
                }}
                disabled={isSubmitting}
              >
                Submit
              </Button>
            </Box>
          )}
        </Paper>
      </Container>

      <Toaster position="bottom-center" />
    </Box>
  );
}
