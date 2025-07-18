import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Button,
  LinearProgress,
  Dialog,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  DynamicEmbeddedWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import {
  getElytraStakingStatus,
  ElytraStakingInfo,
} from '../services/elytra.service';
import toast from 'react-hot-toast';
import {
  checkIfWhitelisted,
  createElytraStakerDoc,
  ElytraStakerDoc,
} from '../services/db/elytraStakers.service';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../services/firebase.service';

export default function Elytra() {
  const [searchParams] = useSearchParams();
  const [stakingInfo, setStakingInfo] = useState<ElytraStakingInfo | null>(
    null
  );
  const [isCheckingStake, setIsCheckingStake] = useState(false);
  const { primaryWallet } = useDynamicContext();
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [alreadyWhitelisted, setAlreadyWhitelisted] = useState(false);
  const [addingToWhitelist, setAddingToWhitelist] = useState(false);
  const [whitelistedUser, setWhitelistedUser] =
    useState<ElytraStakerDoc | null>(null);

  console.log({ twitterUser });

  const checkIfAlreadyWhitelisted = async (walletAddress: string) => {
    const whitelistedUser = await checkIfWhitelisted(walletAddress);
    setAlreadyWhitelisted(!!whitelistedUser);
    setWhitelistedUser(whitelistedUser);
  };

  useEffect(() => {
    if (primaryWallet?.address) {
      checkIfAlreadyWhitelisted(primaryWallet.address);
    }
  }, [primaryWallet]);

  const checkStaking = async () => {
    if (primaryWallet?.address && !stakingInfo && !isCheckingStake) {
      setIsCheckingStake(true);
      try {
        const info = await getElytraStakingStatus(primaryWallet.address, 8453); // Base chainId
        setStakingInfo(info);
        setIsCheckingStake(false);

        if (info.hasMinimumStake && !twitterUser) {
          // Auto-start X login if they have sufficient tokens
          try {
            // await signInWithSocialAccount(ProviderEnum.Twitter, {
            //   redirectUrl: window.location.href,
            // });
          } catch (error) {
            console.error('Error signing in with Twitter:', error);
            toast.error('Failed to connect X account');
          }
        }
      } catch (error) {
        console.error('Error checking staking status:', error);
        toast.error('Failed to check ELYTRA staking status');
      }
    }
  };
  // // Check staking status when wallet is connected
  useEffect(() => {
    checkStaking();
  }, [primaryWallet]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        return;
      }
      if (user) {
        setTwitterUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (!primaryWallet) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ color: 'white', my: 2 }}>
            Connecting to Base Network...
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Please approve the connection in your wallet
          </Typography>
        </Box>
      );
    }

    if (isCheckingStake) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ color: 'white', my: 2 }}>
            Checking staked $ELYTRA tokens...
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Verifying your token holdings on Base network
          </Typography>
        </Box>
      );
    }

    if (stakingInfo) {
      // Check if already whitelisted first
      if (alreadyWhitelisted) {
        if (stakingInfo.hasMinimumStake) {
          return (
            <Box sx={{ textAlign: 'center' }}>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  textAlign: 'left',
                  '& .MuiAlert-message': { pt: '3px' },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Successfully whitelisted for @{whitelistedUser?.username}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Your tweets now are eligible for the leaderboard points.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'success.dark', fontWeight: 500 }}
                >
                  Current balance:{' '}
                  {parseFloat(stakingInfo.formattedBalance).toLocaleString()} $
                  {stakingInfo.symbol}
                </Typography>
              </Alert>
            </Box>
          );
        } else {
          return (
            <Box sx={{ textAlign: 'center' }}>
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  textAlign: 'left',
                  '& .MuiAlert-message': { pt: '3px' },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Your points updates are Paused
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'warning.dark', fontWeight: 500 }}
                >
                  Warning: Your points will not be updated if you don't maintain
                  at least 50,000 $ELYTRA staked.
                </Typography>
              </Alert>
            </Box>
          );
        }
      }

      // Not whitelisted - proceed with staking checks
      if (stakingInfo.hasMinimumStake) {
        return (
          <Box sx={{ textAlign: 'center' }}>
            {!twitterUser && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  textAlign: 'left',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Success! You have sufficient $ELYTRA tokens staked
                </Typography>
                <Typography variant="body2">
                  Balance:{' '}
                  {parseFloat(stakingInfo.formattedBalance).toLocaleString()}{' '}
                  {stakingInfo.symbol}
                </Typography>
              </Alert>
            )}

            {!twitterUser ? (
              <Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Connect your X account to access the leaderboard
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={async () => {
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
                  }}
                  sx={{
                    background: 'black',
                    color: 'white',
                  }}
                  endIcon={
                    <img
                      src="/logos/twitter.png"
                      alt="Twitter"
                      width={14}
                      height={14}
                    />
                  }
                >
                  Sign in with
                </Button>
              </Box>
            ) : (
              <Alert
                severity="success"
                sx={{
                  textAlign: 'left',
                  mb: 3,
                  '& .MuiAlert-message': { pt: '3px' },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  You have sufficient staked $ELYTRA tokens.
                </Typography>
                <Typography variant="body2">
                  Your X account @
                  {(twitterUser as any).reloadUserInfo?.screenName ||
                    twitterUser.displayName}{' '}
                  is now connected and you're ready to participate in the
                  leaderboard.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Current balance:{' '}
                  {parseFloat(stakingInfo.formattedBalance).toLocaleString()} $
                  {stakingInfo.symbol}
                </Typography>
              </Alert>
            )}

            {twitterUser && (
              <Button
                disabled={addingToWhitelist}
                variant="contained"
                size="small"
                onClick={async () => {
                  if (!primaryWallet?.address || !twitterUser) {
                    toast.error('Failed to create staker document');
                    return;
                  }
                  setAddingToWhitelist(true);
                  const isExists = await createElytraStakerDoc(
                    primaryWallet.address,
                    twitterUser.uid,
                    (twitterUser as any).reloadUserInfo?.screenName,
                    twitterUser.displayName
                  );
                  if (isExists) {
                    toast.error('You are already whitelisted!');
                  } else {
                    toast.success('You are now whitelisted!');
                  }
                  await checkIfAlreadyWhitelisted(primaryWallet.address);
                  setAddingToWhitelist(false);
                  window.close();
                }}
              >
                {addingToWhitelist
                  ? 'Adding to whitelist...'
                  : 'Join Leaderboard'}
              </Button>
            )}
          </Box>
        );
      } else {
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                textAlign: 'left',
                '& .MuiAlert-message': { pt: '3px' },
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Insufficient Stake Balance
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Current balance:{' '}
                {parseFloat(stakingInfo.formattedBalance).toLocaleString()} $
                {stakingInfo.symbol}
              </Typography>
              <Typography variant="body2">
                You need at least 50,000 ${stakingInfo.symbol} staked to feature
                in the Leaderboard.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="small"
              href="https://app.virtuals.io/virtuals/28867"
              target="_blank"
            >
              Stake ELYTRA Tokens
            </Button>
          </Box>
        );
      }
    }

    return null;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* ELYTRA Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              // background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
              color: 'white',
              // WebkitBackgroundClip: 'text',
              // WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              borderColor: 'hsl(265 82% 80%)',
              textShadow:
                '0 0 5px hsl(265, 82%, 75%, 0.7), 0 0 10px hsl(265, 82%, 60%, 0.5), 0 0 15px hsl(265, 82%, 50%, 0.3)',
            }}
          >
            $ELYTRA
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 1,
              fontWeight: 300,
            }}
          >
            Leaderboard Whitelist
          </Typography>
          {primaryWallet && !stakingInfo?.hasMinimumStake && (
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Welcome! We're verifying your ELYTRA token holdings for the
              leaderboard whitelisting.
            </Typography>
          )}
        </Box>

        {/* Main Content */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            background:
              'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            borderRadius: 1,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          {renderContent()}
        </Paper>
        <Box display={'flex'} justifyContent={'center'} mt={2}>
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
      </Container>

      <Toaster position="bottom-center" />
      <Dialog open={!primaryWallet} onClose={() => {}} maxWidth="sm">
        <DynamicEmbeddedWidget background="default" style={{ width: 350 }} />
      </Dialog>
    </Box>
  );
}
