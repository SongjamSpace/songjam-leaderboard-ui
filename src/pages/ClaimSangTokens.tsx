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
} from '@mui/material';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../services/firebase.service';
import { userIdExistsInLeaderboard } from '../services/db/leaderboard.service';
import {
  DynamicEmbeddedWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(236, 72, 153, 0.6); }
  100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const ClaimSangTokens = () => {
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState({
    totalPoints: 0,
    totalTokens: 0,
    numberOfYappers: 0,
  });

  const [isLeaderboardMember, setIsLeaderboardMember] = useState(false);
  const [userLbData, setUserLbData] = useState<{
    totalPoints: number;
  } | null>(null);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const { primaryWallet } = useDynamicContext();

  const checkIfUserIsLeaderboardMember = async (userId: string) => {
    const lbData = await userIdExistsInLeaderboard(userId);
    setIsLeaderboardMember(!!lbData);
    setUserLbData(lbData as { totalPoints: number } | null);
  };

  useEffect(() => {
    if (primaryWallet) {
      setShowConnectWallet(false);
    }
  }, [primaryWallet]);

  useEffect(() => {
    if (twitterUser) {
      checkIfUserIsLeaderboardMember('1717491522482913280');
    }
  }, [twitterUser]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setTwitterUser(user);
    });

    // Mock analytics data - replace with actual API call
    setAnalytics({
      totalPoints: 78184.68183779762,
      totalTokens: 20000000,
      numberOfYappers: 5210,
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
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const AnalyticsCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <Paper
      sx={{
        p: 3,
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '15px',
        border: `1px solid ${color}`,
        animation: `${glowAnimation} 3s infinite ease-in-out`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          animation: `${pulseAnimation} 1s infinite ease-in-out`,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mb: 1,
          fontWeight: 'medium',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          color: color,
          fontWeight: 'bold',
          textShadow: `0 0 10px ${color}`,
          mb: subtitle ? 1 : 0,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
            }}
          >
            Songjam Pre-Genesis Claim
          </Typography>

          {twitterUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={twitterUser?.photoURL || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid #8B5CF6',
                  boxShadow: '0 0 10px #8B5CF6',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  fontWeight: 'medium',
                }}
              >
                {twitterUser?.displayName}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSignOut}
                sx={{ color: 'white' }}
                size="small"
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Box>

        {/* Analytics Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsCard
              title="Total Sing Points"
              value={analytics.totalPoints}
              subtitle="Accumulated across all yappers"
              color="#8B5CF6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsCard
              title="Total $SANG Tokens"
              value={`${analytics.totalTokens.toLocaleString()}`}
              subtitle="Available for distribution"
              color="#EC4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsCard
              title="Number of Yappers"
              value={analytics.numberOfYappers}
              subtitle="Active participants"
              color="#10B981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsCard
              title="Your Mindshare"
              value={
                userLbData
                  ? `${(
                      (userLbData.totalPoints / analytics.totalPoints) *
                      100
                    ).toFixed(2)}%`
                  : 'N/A'
              }
              subtitle={
                userLbData
                  ? `${Math.floor(
                      (userLbData.totalPoints / analytics.totalPoints) *
                        analytics.totalTokens
                    ).toLocaleString()} $SANG`
                  : 'No leaderboard data'
              }
              color="#F59E0B"
            />
          </Grid>
        </Grid>

        {/* Claim Section - Only show if signed in */}
        {isLeaderboardMember ? (
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
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                border: '1px solid #8B5CF6',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {primaryWallet && twitterUser ? (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      mb: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    Ready to Claim Your $SANG Tokens
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mb: 3,
                    }}
                  >
                    Your wallet is connected and ready to receive your airdrop.
                  </Typography>
                  <Box
                    sx={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
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
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 'medium',
                      }}
                    >
                      Wallet:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#8B5CF6',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {primaryWallet.address.slice(0, 6)}...
                      {primaryWallet.address.slice(-4)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                      color: 'white',
                      px: 4,
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
                    }}
                    onClick={() => {
                      setShowConnectWallet(false);
                    }}
                  >
                    Submit for Airdrop
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      mb: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    Add Your Wallet for $SANG Airdrop
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mb: 3,
                    }}
                  >
                    Based on your sing points, you're eligible for the $SANG
                    airdrop. Add your wallet to receive your tokens.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                      color: 'white',
                      px: 4,
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
                    }}
                    onClick={() => {
                      setShowConnectWallet(true);
                    }}
                  >
                    Connect Wallet
                  </Button>
                </>
              )}
            </Paper>
          </Box>
        ) : twitterUser ? (
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
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                border: '1px solid #EF4444',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Not Eligible for Airdrop
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                }}
              >
                You are not currently eligible for the $SANG airdrop.
                Participate in Songjam Post-Genesis campaign to earn points for
                the next airdrop.
              </Typography>
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
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                border: '1px solid #8B5CF6',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Are You Part of the Pre-Genesis Leaderboard?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Sign in with your X (Twitter) account to check if you're
                eligible for the $SANG token airdrop. Only participants from the
                Songjam Pre-Genesis campaign can claim tokens.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleTwitterSignIn}
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  px: 4,
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
                }}
              >
                Sign in with X
              </Button>
            </Paper>
          </Box>
        )}

        {/* Cohesive Benefits of Staking Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Paper
            sx={{
              px: { xs: 2, sm: 4, md: 8 },
              py: { xs: 4, md: 6 },
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '15px',
              border: '1px solid #8B5CF6',
              boxShadow: '0 2px 24px 0 rgba(86, 67, 253, 0.10)',
              maxWidth: 1200,
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                color: '#fff',
                letterSpacing: 1,
              }}
            >
              Stake $SANG
            </Typography>
            <Typography variant="body1" sx={{ color: '#fcfbfe', mb: 3, opacity: 0.85 }}>
              Stake via{' '}
              <a
                href="https://app.virtuals.io/virtuals/29671"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 600,
                  color: '#10B981',
                  textDecoration: 'none',
                  transition: 'text-decoration 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                Virtuals
              </a>{' '}
              to access exclusive Songjam rewards and features
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#5643fd', mb: 1 }}>💎</Box>
                  <Typography variant="subtitle1" sx={{ color: '#5643fd', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    Earn Virgen Points
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Get access to other Virtuals agents
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#ba1e68', mb: 1 }}>🚀</Box>
                  <Typography variant="subtitle1" sx={{ color: '#ba1e68', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    Referral Multiplier
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Earn more through our InfoFi offering
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#7649fe', mb: 1 }}>🗣️</Box>
                  <Typography variant="subtitle1" sx={{ color: '#7649fe', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    Space CRM Discount
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Enjoy discounts on our agentic CRM
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#5643fd', mb: 1 }}>🏆</Box>
                  <Typography variant="subtitle1" sx={{ color: '#5643fd', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    Genesis Yapping
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Continue to rank on the Songjam leaderboard
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#ba1e68', mb: 1 }}>🪂</Box>
                  <Typography variant="subtitle1" sx={{ color: '#ba1e68', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    $EVA Airdrop
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Qualify for the upcoming $EVA token airdrop
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: 32, color: '#7649fe', mb: 1 }}>🎧</Box>
                  <Typography variant="subtitle1" sx={{ color: '#7649fe', fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    DJ Access
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fcfbfe', opacity: 0.85, textAlign: 'center' }}>
                    Access Songjam DJ to play music in X Spaces
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {/* End Benefits of Staking Section */}
        {/* Leaderboard Section */}
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            <SignPointsLeaderboard />
          </Box>
        </Box> */}
        <Dialog open={showConnectWallet} onClose={() => {}} maxWidth="sm">
          <DynamicEmbeddedWidget background="default" style={{ width: 350 }} />
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClaimSangTokens;
