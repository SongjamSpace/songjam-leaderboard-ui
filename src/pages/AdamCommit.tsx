import { useState, useEffect } from 'react';
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
import { auth } from '../services/firebase.service';
import { useSolana } from '../components/solanaProvider';
import { WalletConnectButton } from '../components/WalletConnectButton';
import {
  createSignatureDoc,
  getSignatureDoc,
  SignatureData,
} from '../services/db/adam.service';

export default function AdamCommit() {
  const {
    authenticated,
    solanaWallet,
    hasSolanaWallet,
    isSigning,
    isSigned,
    signature,
    signMessage,
    hasMinimumBalance,
    connectWallet,
    solBalance,
  } = useSolana();

  const [twitterUser, setTwitterUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingSignature, setExistingSignature] =
    useState<SignatureData | null>(null);
  const [xUsername, setXUsername] = useState<string>('');
  const [hasMinBalance, setHasMinBalance] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      setTwitterUser(user);

      // Get X username if user is logged in
      if (user) {
        const twitterData = user.providerData.find(
          (data) => data.providerId === 'twitter.com'
        );
        if (twitterData?.displayName) {
          setXUsername(twitterData.displayName);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Check minimum balance requirement
  useEffect(() => {
    const checkMinBalance = async () => {
      if (solanaWallet?.address) {
        const hasMin = await hasMinimumBalance(0.1);
        setHasMinBalance(hasMin);
      } else {
        setHasMinBalance(false);
      }
    };

    checkMinBalance();
  }, [solanaWallet?.address, solBalance, hasMinimumBalance]);

  // Check for existing signature when wallet connects
  useEffect(() => {
    const checkExistingSignature = async () => {
      if (solanaWallet?.address) {
        const existing = await getSignatureDoc(solanaWallet.address);
        if (existing) {
          setExistingSignature(existing);
          toast('You have already signed with this wallet!', {
            icon: '✓',
          });
        }
      }
    };

    checkExistingSignature();
  }, [solanaWallet?.address]);

  // Save signature after signing
  useEffect(() => {
    const saveSignature = async () => {
      if (
        signature &&
        solanaWallet?.address &&
        twitterUser &&
        !existingSignature
      ) {
        const twitterId = twitterUser.providerData.find(
          (data) => data.providerId === 'twitter.com'
        )?.uid;
        if (!twitterId || !solanaWallet?.address) {
          return;
        }
        try {
          await createSignatureDoc(
            solanaWallet.address,
            twitterId,
            xUsername || twitterUser.displayName || 'Unknown',
            signature
          );
          toast.success('Signature saved successfully!');

          // Set as existing to prevent duplicate saves
          setExistingSignature({
            address: solanaWallet.address,
            twitterId,
            screenName: xUsername || twitterUser.displayName || 'Unknown',
            signature: signature,
            createdAt: Date.now(),
          });
        } catch (error) {
          console.error('Failed to save signature:', error);
          toast.error('Failed to save signature. Please try again.');
        }
      }
    };

    saveSignature();
  }, [
    signature,
    solanaWallet?.address,
    twitterUser,
    xUsername,
    existingSignature,
  ]);

  const handleTwitterSignIn = async () => {
    try {
      const provider = new TwitterAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get X username from the credential
      const credential = TwitterAuthProvider.credentialFromResult(result);
      if (credential) {
        // Extract username from the additional user info
        const additionalUserInfo = result.user.providerData.find(
          (data) => data.providerId === 'twitter.com'
        );
        if (additionalUserInfo?.displayName) {
          setXUsername(additionalUserInfo.displayName);
        }
      }

      toast.success('Connected to X successfully!');
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      toast.error('Failed to connect to X');
    }
  };

  const handleSignMessage = async () => {
    try {
      if (!hasSolanaWallet) {
        toast.error('Please connect a Solana wallet to sign the message.');
        return;
      }

      if (!twitterUser) {
        toast.error('Please connect your X account first.');
        return;
      }

      if (!solanaWallet?.address) {
        toast.error('Wallet address not found.');
        return;
      }

      // Check minimum balance requirement
      if (!hasMinBalance) {
        toast.error(
          'You need at least 0.1 SOL to participate in the Pre-Sale.'
        );
        return;
      }

      // Check if already signed
      const existing = await getSignatureDoc(solanaWallet.address);
      if (existing) {
        toast.error('You have already signed with this wallet.');
        setExistingSignature(existing);
        return;
      }

      await signMessage(
        'Sign this message to participate in the $ADAM Pre-Sale'
      );

      // After signing, signature will be available in the next render
      // We'll handle the doc creation in the useEffect below
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('Failed to sign message. Please try again.');
    }
  };

  const currentStep = twitterUser ? (solanaWallet ? 2 : 1) : 0;

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
          $ADAM
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            mb: 2,
            fontWeight: 'normal',
          }}
        >
          1st Creator Coin in Songjam Ecosystem - Seeded in SOL for a
          Cross-Chain Future
        </Typography>

        {/* <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            mb: 6,
            fontWeight: 'normal',
          }}
        >
          Just hold 0.1+ SOL and sign the message to indicate commitment to the
          Pre-Sale.
        </Typography> */}

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
                    currentStep >= 1
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
                {currentStep >= 1 ? <CheckCircle /> : '1'}
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
                    {twitterUser.displayName}
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
                currentStep >= 1
                  ? 'linear-gradient(180deg, #8B5CF6, #EC4899)'
                  : 'rgba(139, 92, 246, 0.2)',
              mb: 2,
            }}
          />

          {/* Step 2: Connect Solana Wallet */}
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
                      : currentStep >= 1
                      ? 'rgba(139, 92, 246, 0.3)'
                      : 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color:
                    currentStep >= 1 ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  flexShrink: 0,
                }}
              >
                {currentStep >= 2 ? <CheckCircle /> : '2'}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Connect Solana Wallet
              </Typography>
            </Box>

            {solanaWallet ? (
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
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
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
                    {solanaWallet.address?.slice(0, 6)}...
                    {solanaWallet.address?.slice(-4)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    // Disconnect functionality would need to be implemented in the provider
                    toast('Disconnect your wallet from the wallet extension');
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
            ) : (
              <Box
                sx={{
                  ml: 7,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <WalletConnectButton />
              </Box>
            )}
          </Box>

          {/* Sign Message Button */}
          {currentStep >= 2 && (
            <Box
              sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSignMessage}
                disabled={
                  isSigning ||
                  !solanaWallet ||
                  !!existingSignature ||
                  !hasMinBalance
                }
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '12px',
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
                {existingSignature
                  ? 'Already Signed'
                  : isSigning
                  ? 'Signing...'
                  : !hasMinBalance && solBalance !== null
                  ? 'Insufficient Balance'
                  : 'Sign Message'}
              </Button>

              {/* SOL Balance Display */}
              {solanaWallet && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Balance:{' '}
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {solBalance !== null
                        ? `${solBalance.toFixed(4)} SOL`
                        : 'Checking...'}
                    </Box>
                  </Typography>
                  {solBalance !== null && solBalance < 0.1 && (
                    <Typography
                      sx={{
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        mt: 0.5,
                      }}
                    >
                      Minimum 0.1 SOL required
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Existing Signature Display */}
          {existingSignature && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgb(34, 197, 94)',
                  fontWeight: 'bold',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                ✓ Your Commitment is Recorded!
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  X Account:
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                >
                  @{existingSignature.screenName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Wallet Address:
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {existingSignature.address}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Signature:
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    wordBreak: 'break-all',
                    background: 'rgba(0, 0, 0, 0.3)',
                    p: 1.5,
                    borderRadius: '8px',
                  }}
                >
                  {existingSignature.signature}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.7rem',
                  display: 'block',
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                Committed on{' '}
                {new Date(existingSignature.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Signed Message Display (for new signatures) */}
          {signature && !existingSignature && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgb(34, 197, 94)',
                  fontWeight: 'bold',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                ✓ Message Signed Successfully!
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                Signature:
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  background: 'rgba(0, 0, 0, 0.3)',
                  p: 1.5,
                  borderRadius: '8px',
                }}
              >
                {signature}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      <Toaster position="bottom-center" />
    </Box>
  );
}
