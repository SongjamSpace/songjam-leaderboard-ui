import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useWallets, useConnectWallet } from '@privy-io/react-auth';
import {
  stakeSangTokens,
  approveSangTokens,
  getSangBalance,
  SangBalanceInfo,
  getSangStakingStatus,
  SangStakingInfo,
} from './services/sang.service';
import { base } from 'viem/chains';

export const Stake = () => {
  const { wallets } = useWallets();
  const { connectWallet } = useConnectWallet();
  const [primaryWallet] = wallets;
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [sangBalance, setSangBalance] = useState<SangBalanceInfo | null>(null);
  const [sangStakingStatus, setSangStakingStatus] =
    useState<SangStakingInfo | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchSangBalance = async () => {
    if (!primaryWallet?.address) return;

    setIsLoadingBalance(true);
    try {
      const [balance, stakingStatus] = await Promise.all([
        getSangBalance('0x7c10338a37DDeb4506BC4F73CBD2a970b7281c36'),
        getSangStakingStatus('0x7c10338a37DDeb4506BC4F73CBD2a970b7281c36'),
      ]);
      setSangBalance(balance);
      setSangStakingStatus(stakingStatus);
    } catch (error) {
      console.error('Error fetching SANG balance:', error);
      toast.error('Failed to fetch SANG balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (primaryWallet) {
      primaryWallet.switchChain(base.id);
      fetchSangBalance();
    } else {
      setSangBalance(null);
      setSangStakingStatus(null);
    }
  }, [primaryWallet]);

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
        {/* Title Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Stake Your $SANG
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 'normal',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Earn Multiplier rewards on the leaderboard.
          </Typography>
        </Box>

        {/* Wallet Connection Section */}
        <Box
          sx={{
            mb: 3,
            mx: 'auto',
            maxWidth: 420,
            p: 3,
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.10), rgba(236, 72, 153, 0.10))',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '16px',
          }}
        >
          {!primaryWallet ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                Connect Your Wallet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  mb: 3,
                }}
              >
                Connect your wallet to start staking SANG tokens
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={connectWallet}
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                }}
              >
                Connect Wallet
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                Wallet Connected
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.05)',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  display: 'inline-block',
                  mb: 2,
                }}
              >
                {formatWalletAddress(primaryWallet.address)}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      mb: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    Wallet Balance
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#8B5CF6',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                    }}
                  >
                    {isLoadingBalance
                      ? 'Loading...'
                      : sangBalance
                      ? `${parseFloat(sangBalance.formattedBalance).toFixed(2)}`
                      : '0.00'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.7rem',
                    }}
                  >
                    SANG
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      mb: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    Staked Balance
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#EC4899',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                    }}
                  >
                    {isLoadingBalance
                      ? 'Loading...'
                      : sangStakingStatus
                      ? `${parseFloat(
                          sangStakingStatus.formattedBalance
                        ).toFixed(2)}`
                      : '0.00'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.7rem',
                    }}
                  >
                    SANG
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Staking Section */}
        {primaryWallet && (
          <Box
            sx={{
              mt: 3,
              mx: 'auto',
              maxWidth: 420,
              p: 3,
              background:
                'linear-gradient(135deg, rgba(139, 92, 246, 0.10), rgba(236, 72, 153, 0.10))',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              borderRadius: '16px',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 1.5,
                textAlign: 'left',
              }}
            >
              Stake SANG
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 2,
                textAlign: 'left',
              }}
            >
              Enter the amount of SANG to stake. First approve the tokens, then
              click stake to complete the process.
            </Typography>
            <TextField
              fullWidth
              value={stakeAmount}
              onChange={(e) => {
                setStakeAmount(e.target.value);
                // Reset approval state when amount changes
                setIsApproved(false);
              }}
              placeholder="0.0"
              type="number"
              inputProps={{ min: '0', step: 'any' }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: 'rgba(255,255,255,0.05)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(139, 92, 246, 0.35)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(139, 92, 246, 0.6)',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {sangBalance && (
                        <Button
                          size="small"
                          onClick={() => {
                            setStakeAmount(sangBalance.formattedBalance);
                            // Reset approval state when MAX is clicked
                            setIsApproved(false);
                          }}
                          sx={{
                            color: '#8B5CF6',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          MAX
                        </Button>
                      )}
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          pr: 1,
                        }}
                      >
                        SANG
                      </Typography>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Balance validation message */}
            {sangBalance && (
              <Box sx={{ mb: 2 }}>
                {Number(stakeAmount) > Number(sangBalance.formattedBalance) ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                    }}
                  >
                    Insufficient balance. Available:{' '}
                    {parseFloat(sangBalance.formattedBalance).toFixed(4)} SANG
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Available:{' '}
                    {parseFloat(sangBalance.formattedBalance).toFixed(4)} SANG
                  </Typography>
                )}
              </Box>
            )}
            <Button
              variant="contained"
              fullWidth
              disabled={
                isStaking ||
                isApproving ||
                !primaryWallet ||
                !stakeAmount ||
                !sangBalance ||
                Number(stakeAmount) > Number(sangBalance.formattedBalance) ||
                Number(stakeAmount) <= 0
              }
              onClick={async () => {
                if (!primaryWallet) {
                  toast.error('Connect your staking wallet first');
                  return;
                }
                if (!stakeAmount || Number(stakeAmount) <= 0) {
                  toast.error('Enter a valid amount');
                  return;
                }
                if (
                  !sangBalance ||
                  Number(stakeAmount) > Number(sangBalance.formattedBalance)
                ) {
                  toast.error('Insufficient SANG balance');
                  return;
                }

                try {
                  if (!isApproved) {
                    // Step 1: Approve the staking contract
                    setIsApproving(true);
                    toast.loading('Approving SANG tokens...');
                    const approvalResult = await approveSangTokens(
                      primaryWallet,
                      stakeAmount
                    );

                    toast.dismiss();

                    if (!approvalResult.success) {
                      toast.error(
                        approvalResult.error || 'Failed to approve tokens'
                      );
                      return;
                    }

                    toast.success(
                      'Tokens approved successfully! Now click Stake.'
                    );
                    setIsApproved(true);
                  } else {
                    // Step 2: Stake the tokens
                    setIsStaking(true);
                    toast.loading('Staking SANG tokens...');
                    const result = await stakeSangTokens(
                      primaryWallet,
                      stakeAmount
                    );

                    toast.dismiss();

                    if (result.success) {
                      toast.success('Stake submitted successfully!');
                      setStakeAmount('');
                      setIsApproved(false);
                      // Refresh balance after successful staking
                      await fetchSangBalance();
                    } else {
                      toast.error(result.error || 'Failed to stake');
                    }
                  }
                } catch (e: any) {
                  toast.dismiss();
                  toast.error(
                    e?.message ||
                      `Failed to ${isApproved ? 'stake' : 'approve'}`
                  );
                } finally {
                  setIsStaking(false);
                  setIsApproving(false);
                }
              }}
              sx={{
                background: isApproved
                  ? 'linear-gradient(45deg, #10b981, #059669)'
                  : 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {isApproving
                ? 'Approving…'
                : isStaking
                ? 'Staking…'
                : isApproved
                ? 'Stake'
                : 'Approve'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};
