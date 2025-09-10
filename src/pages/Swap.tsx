import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  LinearProgress,
  Stack,
  Alert,
  IconButton,
  keyframes,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useConnectWallet, useWallets } from '@privy-io/react-auth';
import { toast, Toaster } from 'react-hot-toast';
import { ethers, isAddress } from 'ethers';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase.service';
import { TokenSubmitWallet } from '../services/db/sangClaim.service';
import { fetchTokenBalance } from '../services/creatorToken.service';
import AddChainFooter from '../components/AddChainFooter';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(236, 72, 153, 0.6); }
  100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
`;

interface CreatorToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  username: string;
  balance?: string;
}

const Swap = () => {
  const { address } = useParams<{ address?: string }>();
  const { wallets } = useWallets();
  const [primaryWallet] = wallets;
  const { connectWallet } = useConnectWallet();

  // State management
  const [creatorTokens, setCreatorTokens] = useState<CreatorToken[]>([]);
  const [selectedTokenFrom, setSelectedTokenFrom] =
    useState<CreatorToken | null>(null);
  const [selectedTokenTo, setSelectedTokenTo] = useState<CreatorToken | null>(
    null
  );
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [userBalances, setUserBalances] = useState<{ [key: string]: string }>(
    {}
  );

  // WSANG token (wrapped SANG)
  const WSANG_TOKEN: CreatorToken = {
    id: 'wsang',
    name: 'Wrapped SANG',
    symbol: 'WSANG',
    contractAddress: '', // Native token
    username: 'songjam',
  };

  // Fetch all creator tokens from the database
  const fetchAllCreatorTokens = async () => {
    try {
      setIsLoading(true);
      const tokens: CreatorToken[] = [];

      // Fetch from SANG collection
      const sangCollection = collection(db, 'sang_airdrop_wallets');
      const sangQuery = query(
        sangCollection,
        where('creatorContractAddress', '!=', null)
      );
      const sangSnapshot = await getDocs(sangQuery);

      sangSnapshot.forEach((doc) => {
        const data = doc.data() as TokenSubmitWallet;
        if (data.creatorContractAddress && data.tokenName && data.tokenSymbol) {
          tokens.push({
            id: doc.id,
            name: data.tokenName,
            symbol: data.tokenSymbol,
            contractAddress: data.creatorContractAddress,
            username: data.username || 'unknown',
          });
        }
      });

      setCreatorTokens(tokens);

      // Handle URL parameter for preselected token
      if (address && isAddress(address)) {
        const preselectedToken = tokens.find(
          (token) =>
            token.contractAddress.toLowerCase() === address.toLowerCase()
        );
        if (preselectedToken) {
          setSelectedTokenFrom(preselectedToken);
        }
      }

      // Set default to token if no preselection
      if (!selectedTokenFrom && tokens.length > 0) {
        setSelectedTokenFrom(tokens[0]);
      }

      // Set WSANG as default "to" token
      setSelectedTokenTo(WSANG_TOKEN);
    } catch (error) {
      console.error('Error fetching creator tokens:', error);
      toast.error('Failed to fetch creator tokens');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user balances for all tokens
  const fetchUserBalances = async () => {
    if (!primaryWallet?.address) return;

    try {
      const balances: { [key: string]: string } = {};

      // Fetch WSANG balance (native token)
      const wsangBalance = await fetchTokenBalance(
        primaryWallet.address,
        '',
        true
      );
      balances['wsang'] = wsangBalance;

      // Fetch creator token balances
      for (const token of creatorTokens) {
        const balance = await fetchTokenBalance(
          primaryWallet.address,
          token.contractAddress,
          false
        );
        balances[token.contractAddress] = balance;
      }

      setUserBalances(balances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Calculate swap amount (simplified 1:1 for now)
  const calculateSwapAmount = (
    inputAmount: string,
    fromToken: CreatorToken,
    toToken: CreatorToken
  ) => {
    if (!inputAmount || isNaN(Number(inputAmount))) return '';

    // Simple 1:1 swap rate for demo purposes
    // In a real implementation, you'd query a DEX or AMM for actual rates
    return inputAmount;
  };

  // Handle amount input changes
  const handleAmountFromChange = (value: string) => {
    setAmountFrom(value);
    if (selectedTokenFrom && selectedTokenTo) {
      const calculatedAmount = calculateSwapAmount(
        value,
        selectedTokenFrom,
        selectedTokenTo
      );
      setAmountTo(calculatedAmount);
    }
  };

  const handleAmountToChange = (value: string) => {
    setAmountTo(value);
    if (selectedTokenFrom && selectedTokenTo) {
      const calculatedAmount = calculateSwapAmount(
        value,
        selectedTokenTo,
        selectedTokenFrom
      );
      setAmountFrom(calculatedAmount);
    }
  };

  // Handle token selection
  const handleTokenFromChange = (token: CreatorToken) => {
    setSelectedTokenFrom(token);
    if (amountFrom) {
      const calculatedAmount = calculateSwapAmount(
        amountFrom,
        token,
        selectedTokenTo!
      );
      setAmountTo(calculatedAmount);
    }
  };

  const handleTokenToChange = (token: CreatorToken) => {
    setSelectedTokenTo(token);
    if (amountFrom && selectedTokenFrom) {
      const calculatedAmount = calculateSwapAmount(
        amountFrom,
        selectedTokenFrom,
        token
      );
      setAmountTo(calculatedAmount);
    }
  };

  // Swap tokens
  const handleSwap = async () => {
    if (!primaryWallet) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedTokenFrom || !selectedTokenTo || !amountFrom) {
      toast.error('Please select tokens and enter amount');
      return;
    }

    setIsSwapping(true);
    try {
      // TODO: Implement actual swap logic with smart contract
      // For now, just show a success message
      toast.success(
        `Swapped ${amountFrom} ${selectedTokenFrom.symbol} for ${amountTo} ${selectedTokenTo.symbol}`
      );

      // Reset amounts
      setAmountFrom('');
      setAmountTo('');

      // Refresh balances
      await fetchUserBalances();
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  // Swap token positions
  const handleSwapTokens = () => {
    const tempToken = selectedTokenFrom;
    const tempAmount = amountFrom;

    setSelectedTokenFrom(selectedTokenTo);
    setSelectedTokenTo(tempToken);
    setAmountFrom(amountTo);
    setAmountTo(tempAmount);
  };

  useEffect(() => {
    fetchAllCreatorTokens();
  }, []);

  useEffect(() => {
    if (primaryWallet && creatorTokens.length > 0) {
      fetchUserBalances();
    }
  }, [primaryWallet, creatorTokens]);

  const getTokenBalance = (token: CreatorToken) => {
    if (token.id === 'wsang') {
      return userBalances['wsang'] || '0';
    }
    return userBalances[token.contractAddress] || '0';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
        position: 'relative',
        pt: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
      <Container
        maxWidth="md"
        sx={{ position: 'relative', zIndex: 1, flex: 1 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
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
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
              textAlign: 'center',
            }}
          >
            Songjam Genesis Swaps
          </Typography>
        </Box>

        {isLoading && <LinearProgress />}

        {/* Swap Interface */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            border: '1px solid #8B5CF6',
            animation: `${glowAnimation} 3s infinite ease-in-out`,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Wallet Connection */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            {primaryWallet ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <WalletIcon sx={{ color: '#8B5CF6' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: '#8B5CF6',
                    fontWeight: 'bold',
                  }}
                >
                  {primaryWallet?.address.slice(0, 6)}...
                  {primaryWallet?.address.slice(-4)}
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => connectWallet()}
                startIcon={<WalletIcon />}
                sx={{
                  borderColor: '#8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                Connect Wallet
              </Button>
            )}
          </Box>

          <Stack spacing={3}>
            {/* From Token */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1,
                  fontSize: '0.875rem',
                }}
              >
                From
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    type="number"
                    value={amountFrom}
                    onChange={(e) => handleAmountFromChange(e.target.value)}
                    placeholder="0.0"
                    disabled={isSwapping}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Chakra Petch, sans-serif',
                        fontSize: '1.5rem',
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
                      '& .MuiInputBase-input': {
                        color: '#fff',
                        textAlign: 'right',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Select
                      value={selectedTokenFrom?.id || ''}
                      onChange={(e) => {
                        const token = creatorTokens.find(
                          (t) => t.id === e.target.value
                        );
                        if (token) handleTokenFromChange(token);
                      }}
                      disabled={isSwapping}
                      sx={{
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8B5CF6',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8B5CF6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8B5CF6',
                        },
                        '& .MuiSelect-select': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid #8B5CF6',
                            borderRadius: '10px',
                            maxHeight: 250,
                            '& .MuiMenuItem-root': {
                              color: '#fff',
                              minHeight: 48,
                              '&:hover': {
                                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                                '&:hover': {
                                  backgroundColor: 'rgba(139, 92, 246, 0.4)',
                                },
                              },
                            },
                          },
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
                    >
                      {creatorTokens.map((token) => (
                        <MenuItem key={token.id} value={token.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#fff' }}>
                              {token.symbol}
                            </Typography>
                            <Chip
                              label={token.name}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                color: '#8B5CF6',
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {selectedTokenFrom && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    mt: 1,
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  Balance: {getTokenBalance(selectedTokenFrom)}{' '}
                  {selectedTokenFrom.symbol}
                </Typography>
              )}
            </Box>

            {/* Swap Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                onClick={handleSwapTokens}
                disabled={isSwapping}
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '2px solid #8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <SwapIcon />
              </IconButton>
            </Box>

            {/* To Token */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1,
                  fontSize: '0.875rem',
                }}
              >
                To
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    type="number"
                    value={amountTo}
                    onChange={(e) => handleAmountToChange(e.target.value)}
                    placeholder="0.0"
                    disabled={isSwapping}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Chakra Petch, sans-serif',
                        fontSize: '1.5rem',
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
                      '& .MuiInputBase-input': {
                        color: '#fff',
                        textAlign: 'right',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Select
                      value={selectedTokenTo?.id || ''}
                      onChange={(e) => {
                        if (e.target.value === 'wsang') {
                          handleTokenToChange(WSANG_TOKEN);
                        } else {
                          const token = creatorTokens.find(
                            (t) => t.id === e.target.value
                          );
                          if (token) handleTokenToChange(token);
                        }
                      }}
                      disabled={isSwapping}
                      sx={{
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10B981',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10B981',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10B981',
                        },
                        '& .MuiSelect-select': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid #10B981',
                            borderRadius: '10px',
                            maxHeight: 250,
                            '& .MuiMenuItem-root': {
                              color: '#fff',
                              minHeight: 48,
                              '&:hover': {
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                                '&:hover': {
                                  backgroundColor: 'rgba(16, 185, 129, 0.4)',
                                },
                              },
                            },
                          },
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
                    >
                      <MenuItem value="wsang">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            {WSANG_TOKEN.symbol}
                          </Typography>
                          <Chip
                            label={WSANG_TOKEN.name}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#10B981',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      </MenuItem>
                      {creatorTokens.map((token) => (
                        <MenuItem key={token.id} value={token.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#fff' }}>
                              {token.symbol}
                            </Typography>
                            <Chip
                              label={token.name}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10B981',
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {selectedTokenTo && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    mt: 1,
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  Balance: {getTokenBalance(selectedTokenTo)}{' '}
                  {selectedTokenTo.symbol}
                </Typography>
              )}
            </Box>

            {/* Swap Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={
                isSwapping ||
                !primaryWallet ||
                !selectedTokenFrom ||
                !selectedTokenTo ||
                !amountFrom ||
                isNaN(Number(amountFrom)) ||
                Number(amountFrom) <= 0
              }
              onClick={handleSwap}
              sx={{
                background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                color: 'white',
                py: 2,
                borderRadius: '15px',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                  boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(139, 92, 246, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {isSwapping ? 'Swapping...' : 'Swap'}
            </Button>
          </Stack>
        </Paper>

        <Toaster position="bottom-center" />
      </Container>

      {/* Add Chain Footer */}
      <AddChainFooter />
    </Box>
  );
};

export default Swap;
