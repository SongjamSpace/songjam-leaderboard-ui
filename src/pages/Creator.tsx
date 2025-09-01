import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  Grid,
  LinearProgress,
  Stack,
  Alert,
  keyframes,
} from '@mui/material';
import {
  signInWithPopup,
  TwitterAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../services/firebase.service';
import {
  getWalletForAirdrop,
  TokenSubmitWallet,
  submitTokenForAirdrop,
  updateCreatorTokenInfo,
} from '../services/db/sangClaim.service';
import { toast, Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';
import {
  CreatorTokenInfo,
  connectWallet,
  deployCreatorToken,
  mintTokens,
  L1_CHAIN_CONFIG,
  fetchTokenBalance,
} from '../services/creatorToken.service';
import axios from 'axios';
import AddChainFooter from '../components/AddChainFooter';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(236, 72, 153, 0.6); }
  100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
`;

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// SANG Token contract address on Songnet testnet
const CREATOR_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual address

const Creator = () => {
  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [twitterId, setTwitterId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletForAirdrop, setWalletForAirdrop] =
    useState<TokenSubmitWallet | null>(null);
  const [localWalletAddress, setLocalWalletAddress] = useState('');
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [creatorTokenName, setCreatorTokenName] = useState('');
  const [creatorTokenSymbol, setCreatorTokenSymbol] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
  const [userLbInfo, setUserLbInfo] = useState<{
    userId: string;
    totalPoints: number;
  } | null>(null);
  const [checkingLbUser, setCheckingLbUser] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [isMintingTokens, setIsMintingTokens] = useState(false);
  const [creatorTokenBalance, setCreatorTokenBalance] = useState('0');

  const fetchWalletForAirdrop = async (twitterId: string) => {
    try {
      //   const wallet = await getWalletForAirdrop('1367319257609089026', 'SANG');
      const wallet = (await getWalletForAirdrop(
        twitterId,
        'SANG'
      )) as TokenSubmitWallet;
      setWalletForAirdrop(wallet);
      if (wallet?.walletAddress) {
        const balance = await fetchTokenBalance(wallet.walletAddress, '', true);
        setNativeBalance(balance);
        if (wallet?.creatorContractAddress) {
          const balance = await fetchTokenBalance(
            wallet.walletAddress,
            wallet.creatorContractAddress,
            false
          );
          setCreatorTokenBalance(balance);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      toast.error('Failed to sign in with Twitter');
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setTwitterUser(null);
      setWalletForAirdrop(null);
      setNativeBalance('0');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleSubmitWallet = async () => {
    if (!ethers.isAddress(localWalletAddress)) {
      toast.error('Invalid wallet address');
      return;
    }
    if (!twitterUser || !twitterUser.providerData[0]?.uid) {
      toast.error('Please sign in with X to submit your wallet');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTokenForAirdrop(
        twitterId,
        {
          walletAddress: localWalletAddress,
          userId: twitterUser.uid,
          twitterId,
          username: (twitterUser as any).reloadUserInfo?.screenName || '',
          name: twitterUser.displayName,
        },
        'SANG'
      );

      await fetchWalletForAirdrop(twitterId);
      setLocalWalletAddress('');
      toast.success('Wallet submitted successfully');
    } catch (error) {
      console.error('Error submitting wallet:', error);
      toast.error('Failed to submit wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        setIsWalletConnected(true);
        setConnectedWalletAddress(address);
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleMintCreatorToken = async () => {
    if (!creatorTokenName.trim() || !creatorTokenSymbol.trim()) {
      toast.error('Please enter both token name and symbol');
      return;
    }

    if (!isWalletConnected) {
      toast.error('Connecting wallet...');
      await connectWallet();
    }

    setIsMinting(true);
    try {
      const tokenInfo: CreatorTokenInfo = {
        name: creatorTokenName.trim(),
        symbol: creatorTokenSymbol.trim().toUpperCase(),
        decimals: 18,
      };

      const result = await deployCreatorToken(tokenInfo);

      if (result.success) {
        toast.success(
          `Creator Token "${tokenInfo.name}" (${tokenInfo.symbol}) deployed successfully!`
        );
        await updateCreatorTokenInfo(twitterId, 'SANG', {
          tokenName: creatorTokenName.trim(),
          tokenSymbol: creatorTokenSymbol.trim().toUpperCase(),
          creatorContractAddress: result.contractAddress ?? '',
          txHash: result.transactionHash ?? '',
        });
        await fetchWalletForAirdrop(twitterId);
      } else {
        toast.error(result.error || 'Failed to deploy creator token');
      }
    } catch (error: any) {
      console.error('Error deploying creator token:', error);
      toast.error(error.message || 'Failed to deploy creator token');
    } finally {
      setIsMinting(false);
    }
  };

  const handleMintTokens = async () => {
    if (!mintAmount.trim() || isNaN(Number(mintAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!walletForAirdrop?.creatorContractAddress) {
      toast.error('No creator token contract found');
      return;
    }

    if (!isWalletConnected) {
      toast.error('Connecting wallet...');
      await connectWallet();
    }

    setIsMintingTokens(true);
    try {
      const result = await mintTokens(
        walletForAirdrop.creatorContractAddress,
        walletForAirdrop.walletAddress,
        mintAmount
      );

      if (result.success) {
        toast.success(
          `Successfully minted ${mintAmount} ${walletForAirdrop.tokenSymbol} tokens!`
        );
        setMintAmount('');
      } else {
        toast.error(result.error || 'Failed to mint tokens');
      }
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      toast.error(error.message || 'Failed to mint tokens');
    } finally {
      setIsMintingTokens(false);
    }
  };

  const checkExistsInLb = async (userId: string) => {
    setCheckingLbUser(true);
    const res = await axios.get(
      'https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace'
    );
    const lbData = res.data as { userId: string; totalPoints: number }[];
    if (lbData?.length) {
      const userLbInfo = lbData.find(
        (user: { userId: string }) => user.userId === userId
      );
      if (userLbInfo) {
        await fetchWalletForAirdrop(userId);
        setUserLbInfo(userLbInfo);
      } else {
      }
    }
    setCheckingLbUser(false);
  };
  useEffect(() => {
    if (twitterUser && twitterUser.providerData.length) {
      const twitterProvider = twitterUser.providerData.find(
        (p) => p.providerId === 'twitter.com'
      );
      if (twitterProvider) {
        setTwitterId(twitterProvider.uid);
        setCreatorTokenName(
          (twitterUser as any).reloadUserInfo.screenName ??
            twitterUser.displayName
        );
        setCreatorTokenSymbol(
          (
            (twitterUser as any).reloadUserInfo.screenName?.slice(0, 4) ??
            twitterUser.displayName?.slice(0, 4)
          )?.toUpperCase()
        );
        checkExistsInLb(twitterProvider.uid);
        // fetchWalletForAirdrop(twitterProvider.uid);
      }
    }
  }, [twitterUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      if (
        user?.providerData.length &&
        user.providerData.find((p) => p.providerId === 'twitter.com')
      ) {
        setTwitterUser(user);
      } else {
        // Automatically initiate sign in with X if no user is signed in
        handleTwitterSignIn();
      }
    });

    return () => unsubscribe();
  }, []);

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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 4,
            gap: 4,
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
            Creator Portal
          </Typography>

          {twitterUser && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
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

        {isLoading && <LinearProgress />}

        {/* Main Content */}
        {twitterUser ? (
          <Grid container spacing={4}>
            {/* Left Column - Wallet & Balance */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '15px',
                  border: '1px solid #8B5CF6',
                  animation: `${glowAnimation} 3s infinite ease-in-out`,
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    mb: 3,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {walletForAirdrop
                    ? 'Your $SANG Holdings'
                    : 'Setup Wallet for Airdrop'}
                </Typography>

                {walletForAirdrop ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Wallet address stored successfully!
                    </Alert>

                    <Box
                      sx={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '10px',
                        p: 2,
                        mb: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 1,
                        }}
                      >
                        Wallet Address:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#8B5CF6',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        }}
                      >
                        {walletForAirdrop.walletAddress.slice(0, 6)}...
                        {walletForAirdrop.walletAddress.slice(-4)}
                      </Typography>
                    </Box>

                    <Box display={'flex'} justifyContent={'center'} gap={2}>
                      <Box
                        sx={{
                          background: 'rgba(236, 72, 153, 0.1)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          borderRadius: '10px',
                          p: 3,
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            mb: 1,
                          }}
                        >
                          Native $SANG Balance
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            color: '#EC4899',
                            fontWeight: 'bold',
                            textShadow: `0 0 10px #EC4899`,
                          }}
                        >
                          {nativeBalance} $SANG
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            display: 'block',
                            mt: 1,
                          }}
                        >
                          {L1_CHAIN_CONFIG.name} (Chain ID:{' '}
                          {L1_CHAIN_CONFIG.chainId})
                        </Typography>
                      </Box>
                      {walletForAirdrop?.creatorContractAddress && (
                        <Box
                          sx={{
                            background: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            borderRadius: '10px',
                            p: 3,
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              mb: 1,
                            }}
                          >
                            Creator Token Balance
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              color: '#EC4899',
                              fontWeight: 'bold',
                              textShadow: `0 0 10px #EC4899`,
                            }}
                          >
                            {creatorTokenBalance} $
                            {walletForAirdrop?.tokenSymbol}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              display: 'block',
                              mt: 1,
                            }}
                          >
                            {walletForAirdrop?.tokenName}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 3,
                        textAlign: 'center',
                      }}
                    >
                      Enter your wallet address to receive the future $SANG
                      airdrop
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Wallet Address"
                        variant="outlined"
                        value={localWalletAddress}
                        onChange={(e) => setLocalWalletAddress(e.target.value)}
                        placeholder="Enter your wallet address (0x...)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Chakra Petch, sans-serif',
                            '& fieldset': {
                              borderColor: '#8B5CF6',
                            },
                            '&:hover fieldset': {
                              borderColor: '#8B5CF6',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5CF6',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#fff',
                            '&.Mui-focused': {
                              color: '#8B5CF6',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        size="large"
                        disabled={!userLbInfo || isSubmitting}
                        onClick={handleSubmitWallet}
                        sx={{
                          background:
                            'linear-gradient(45deg, #8B5CF6, #EC4899)',
                          color: 'white',
                          px: 4,
                          py: 2,
                          borderRadius: '25px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                          '&:hover': {
                            background:
                              'linear-gradient(45deg, #7c3aed, #db2777)',
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                          },
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit for Airdrop'}
                      </Button>

                      {!userLbInfo && !checkingLbUser && (
                        <Box display={'flex'} justifyContent={'center'}>
                          <Alert severity="error" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                              You are not on the Songjam Leaderboard
                            </Typography>
                          </Alert>
                        </Box>
                      )}
                      {checkingLbUser && (
                        <Box display={'flex'} justifyContent={'center'}>
                          <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                              Checking leaderboard...
                            </Typography>
                          </Alert>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right Column - Creator Token */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                }}
              >
                {walletForAirdrop?.creatorContractAddress ? (
                  // Show mint tokens section if creator contract exists
                  <>
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'white',
                        mb: 3,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      Mint ${walletForAirdrop.tokenSymbol} (
                      {walletForAirdrop.tokenName})
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 3,
                        textAlign: 'center',
                      }}
                    >
                      Mint additional tokens to your wallet
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Amount to Mint"
                        variant="outlined"
                        type="number"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        placeholder="e.g., 1000"
                        disabled={isMintingTokens}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Chakra Petch, sans-serif',
                            '& fieldset': {
                              borderColor: '#10B981',
                            },
                            '&:hover fieldset': {
                              borderColor: '#10B981',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#10B981',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#fff',
                            '&.Mui-focused': {
                              color: '#10B981',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        size="large"
                        disabled={
                          isMintingTokens ||
                          !mintAmount.trim() ||
                          isNaN(Number(mintAmount))
                        }
                        onClick={handleMintTokens}
                        sx={{
                          background:
                            'linear-gradient(45deg, #10B981, #059669)',
                          color: 'white',
                          px: 4,
                          py: 2,
                          borderRadius: '25px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background:
                              'linear-gradient(45deg, #059669, #047857)',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          },
                          '&:disabled': {
                            background: 'rgba(16, 185, 129, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        }}
                      >
                        {isMintingTokens ? 'Minting...' : 'Mint Tokens'}
                      </Button>
                    </Stack>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        Mint additional {walletForAirdrop.tokenSymbol} tokens to
                        your wallet address.
                      </Typography>
                    </Alert>
                  </>
                ) : (
                  // Show create token section if no creator contract exists
                  <>
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'white',
                        mb: 3,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      Create Your Creator Token
                    </Typography>

                    {!walletForAirdrop && (
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                          You need to submit for airdrop first to access creator
                          token features.
                        </Typography>
                      </Alert>
                    )}

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 3,
                        textAlign: 'center',
                      }}
                    >
                      Mint your own ERC20 token on our L1 chain to represent
                      your brand
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Token Name"
                        variant="outlined"
                        value={creatorTokenName}
                        onChange={(e) => setCreatorTokenName(e.target.value)}
                        placeholder="e.g., My Creator Token"
                        disabled={isMinting || !walletForAirdrop}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Chakra Petch, sans-serif',
                            '& fieldset': {
                              borderColor: '#10B981',
                            },
                            '&:hover fieldset': {
                              borderColor: '#10B981',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#10B981',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#fff',
                            '&.Mui-focused': {
                              color: '#10B981',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Token Symbol"
                        variant="outlined"
                        value={creatorTokenSymbol}
                        onChange={(e) =>
                          setCreatorTokenSymbol(e.target.value.toUpperCase())
                        }
                        placeholder="e.g., MCT"
                        disabled={isMinting || !walletForAirdrop}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Chakra Petch, sans-serif',
                            '& fieldset': {
                              borderColor: '#10B981',
                            },
                            '&:hover fieldset': {
                              borderColor: '#10B981',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#10B981',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#fff',
                            '&.Mui-focused': {
                              color: '#10B981',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        size="large"
                        disabled={
                          isMinting ||
                          !userLbInfo ||
                          !creatorTokenName.trim() ||
                          !creatorTokenSymbol.trim() ||
                          !walletForAirdrop
                        }
                        onClick={handleMintCreatorToken}
                        sx={{
                          background:
                            'linear-gradient(45deg, #10B981, #059669)',
                          color: 'white',
                          px: 4,
                          py: 2,
                          borderRadius: '25px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background:
                              'linear-gradient(45deg, #059669, #047857)',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          },
                          '&:disabled': {
                            background: 'rgba(16, 185, 129, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        }}
                      >
                        {isMinting ? 'Minting...' : 'Mint Creator Token'}
                      </Button>
                    </Stack>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        Your creator token will be deployed on our L1 chain and
                        can be used for community engagement, rewards, and
                        governance.
                      </Typography>
                    </Alert>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
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
                Signing in with X...
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Please complete the X authentication to access the creator
                portal.
              </Typography>
              <Button
                disabled={isLoading}
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

        <Toaster position="bottom-center" />
      </Container>

      {/* Add Chain Footer */}
      <AddChainFooter />
    </Box>
  );
};

export default Creator;
