import { useState, useEffect } from 'react';
import './App.css';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  LinearProgress,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import Checklist, { ChecklistItem } from './components/Checklist';
import { useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// import {
//   DynamicEmbeddedWidget,
//   useDynamicContext,
// } from '@dynamic-labs/sdk-react-core';
import { getSangStakingStatus, SangStakingInfo } from './services/sang.service';
import toast from 'react-hot-toast';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './services/firebase.service';
import { useConnectWallet, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { userIdExistsInLeaderboard } from './services/db/leaderboard.service';
import {
  createV2AirdropSubmissionDoc,
  getCreatorTokenInfo,
  getV2SubmissionDoc,
} from './services/db/sangClaim.service';

interface AppProps {
  onChangeLoginView: (value: 'twitter' | 'web3') => void;
}

export default function App() {
  const [searchParams] = useSearchParams();
  const [stakingInfo, setStakingInfo] = useState<SangStakingInfo | null>(null);
  const [isCheckingStake, setIsCheckingStake] = useState(false);
  // const { primaryWallet } = useDynamicContext();
  const { connectWallet } = useConnectWallet();
  const { wallets } = useWallets();
  const [primaryWallet] = wallets;
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localWalletAddress, setLocalWalletAddress] = useState('');
  const [lbDataFetched, setLbDataFetched] = useState(false);
  const [userLbData, setUserLbData] = useState<{
    totalPoints: number;
  } | null>(null);
  const [creatorTokenFetched, setCreatorTokenFetched] = useState(false);
  const [creatorTokenInfo, setCreatorTokenInfo] = useState<{
    creatorContractAddress: string;
    tokenName: string;
    tokenSymbol: string;
  } | null>(null);
  const [stakingInfoFetched, setStakingInfoFetched] = useState(false);
  const [airdropWalletAddress, setAirdropWalletAddress] = useState('');
  const [isSubmittingAirdrop, setIsSubmittingAirdrop] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  // Checklist items for the airdrop requirements
  const checklistItems = [
    {
      id: 'yapper',
      title: 'Singer in Songjam Leaderboard',
      description: 'Creating and sharing on the timeline and in spaces',
      completed: !!userLbData, // Completed if user is signed in with Twitter
      failed: lbDataFetched && !userLbData,
    },
    {
      id: 'minted-creator-token',
      title: 'Minted Creator Token',
      description: 'Create and mint your own creator token on the platform',
      completed: !!creatorTokenInfo, // This would need to be implemented based on your logic
      failed: creatorTokenFetched && !creatorTokenInfo,
    },
    {
      id: 'staked-sang',
      title: 'Staked 10k SANG',
      description:
        'Stake at least 10,000 SANG tokens to qualify for the airdrop',
      completed: stakingInfoFetched && stakingInfo?.hasMinimumStake,
      failed: stakingInfoFetched && !stakingInfo?.hasMinimumStake,
    },
  ];

  const checkAlreadySubmitted = async (twitterId: string) => {
    const doc = await getV2SubmissionDoc(twitterId);
    if (doc) {
      setIsAlreadySubmitted(true);
      setLbDataFetched(true);
      setUserLbData({ totalPoints: 1 });
      setCreatorTokenFetched(true);
      setCreatorTokenInfo({
        creatorContractAddress: doc.mintedCreaterTokenAddress,
        tokenName: doc.mintedCreaterTokenName,
        tokenSymbol: doc.mintedCreaterTokenSymbol,
      });
      setStakingInfoFetched(true);
      setStakingInfo({
        balance: doc.stakeBalance,
        formattedBalance: doc.stakeBalance,
        hasMinimumStake: true,
        symbol: doc.mintedCreaterTokenSymbol,
        name: doc.mintedCreaterTokenName,
      });
      setAirdropWalletAddress(doc.airdropWalletAddress);
    } else {
      await checkIfUserIsLeaderboardMember(twitterId);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        setTwitterUser(user);
        checkAlreadySubmitted(user.providerData[0].uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkIfUserIsLeaderboardMember = async (userId: string) => {
    setIsLoading(true);
    const lbData = await userIdExistsInLeaderboard(userId, 'SANG');
    setUserLbData(lbData as { totalPoints: number } | null);
    setLbDataFetched(true);
    const creatorTokenData = await getCreatorTokenInfo(userId);
    setCreatorTokenInfo(
      creatorTokenData as {
        creatorContractAddress: string;
        tokenName: string;
        tokenSymbol: string;
      } | null
    );
    setCreatorTokenFetched(true);
    setIsLoading(false);
  };

  // Check staking status when wallet is connected
  useEffect(() => {
    const checkStaking = async () => {
      if (primaryWallet?.address && !stakingInfo && !isCheckingStake) {
        setIsCheckingStake(true);
        try {
          const info = await getSangStakingStatus(primaryWallet.address); // Base chainId
          setStakingInfo(info);
          setStakingInfoFetched(true);
          setIsCheckingStake(false);

          if (info.hasMinimumStake && !twitterUser) {
            // Auto-start X login if they have sufficient tokens
            try {
              await handleTwitterSignIn();
            } catch (error) {
              console.error('Error signing in with Twitter:', error);
              toast.error('Failed to connect X account');
            }
          }
        } catch (error) {
          console.error('Error checking staking status:', error);
          toast.error('Failed to check SANG staking status');
        }
      }
    };

    checkStaking();
  }, [primaryWallet]);

  const handleTwitterSignIn = async () => {
    try {
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      toast.error('Failed to sign in with X');
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

  // Check if all requirements are completed without any failures
  const allRequirementsCompleted =
    checklistItems.every((item) => item.completed) &&
    checklistItems.every((item) => !item.failed);

  const handleSubmitAirdrop = async () => {
    if (!airdropWalletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!ethers.isAddress(airdropWalletAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    const twitterId = twitterUser?.providerData[0].uid;
    if (!twitterId) {
      toast.error('Please sign in with X again');
      return;
    }
    if (!creatorTokenInfo) {
      toast.error('Please mint a creator token');
      return;
    }
    if (!stakingInfo) {
      toast.error('Please stake 10k SANG');
      return;
    }

    setIsSubmittingAirdrop(true);
    try {
      await createV2AirdropSubmissionDoc(twitterId, {
        twitterId,
        mintedCreaterTokenAddress:
          creatorTokenInfo.creatorContractAddress || '',
        mintedCreaterTokenSymbol: creatorTokenInfo.tokenSymbol || '',
        mintedCreaterTokenName: creatorTokenInfo.tokenName || '',
        stakeBalance: stakingInfo.balance || '',
        stakedWalletAddress: primaryWallet?.address || '',
        airdropWalletAddress,
      });
      toast.success('Airdrop submission successful!');
      await checkAlreadySubmitted(twitterId);
      setAirdropWalletAddress('');
    } catch (error) {
      console.error('Error submitting airdrop:', error);
      toast.error('Failed to submit airdrop');
    } finally {
      setIsSubmittingAirdrop(false);
    }
  };

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
            }}
          >
            Songjam Genesis Airdrop
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
                disabled={isLoading}
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
        {/* Requirements Checklist */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 4,
          }}
        >
          <Checklist
            items={checklistItems as ChecklistItem[]}
            title="Airdrop Requirements"
            showProgress={true}
            walletAddres={primaryWallet?.address}
            onConnectWallet={connectWallet}
            onDisconnectWallet={() => {
              primaryWallet.disconnect();
              alert('Disconnect directly from the Wallet');
            }}
          />
        </Box>

        {/* Submit Airdrop Section */}
        {allRequirementsCompleted && (
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
              <Typography
                variant="h5"
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
                🎉 Submit Airdrop Wallet Address
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
                <Box component="span" sx={{}}>
                  Congratulations! Enter your wallet address and{' '}
                  <a
                    href="https://x.com/i/spaces/1yNGabDLNnqJj"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      // The color will be transparent due to parent span's WebkitTextFillColor
                      // so it will also have the gradient.
                    }}
                  >
                    attend our space
                  </a>{' '}
                  this friday to receive your airdrop tokens.
                </Box>
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your wallet address (0x...)"
                  value={airdropWalletAddress}
                  onChange={(e) => setAirdropWalletAddress(e.target.value)}
                  disabled={isSubmittingAirdrop || isAlreadySubmitted}
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
                onClick={handleSubmitAirdrop}
                disabled={
                  isSubmittingAirdrop ||
                  !airdropWalletAddress.trim() ||
                  isAlreadySubmitted
                }
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
                {isSubmittingAirdrop
                  ? 'Submitting...'
                  : isAlreadySubmitted
                  ? 'Submitted Successfully'
                  : 'Submit Airdrop'}
              </Button>
            </Paper>
          </Box>
        )}

        {isLoading && <LinearProgress />}
        <Toaster position="bottom-center" />
      </Container>
    </Box>
  );
}
