import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { addL1Chain } from '../services/creatorToken.service';

const AddChainFooter: React.FC = () => {
  const [isAddingChain, setIsAddingChain] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Faucet state
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [isRequestingTokens, setIsRequestingTokens] = useState(false);
  const [showFaucetSuccess, setShowFaucetSuccess] = useState(false);
  const [showFaucetError, setShowFaucetError] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState('');

  const handleAddChain = async () => {
    setIsAddingChain(true);
    try {
      await addL1Chain();
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to add chain to MetaMask');
      setShowError(true);
    } finally {
      setIsAddingChain(false);
    }
  };

  const handleFaucetRequest = async () => {
    if (!walletAddress.trim()) {
      setFaucetMessage('Please enter a wallet address');
      setShowFaucetError(true);
      return;
    }

    setIsRequestingTokens(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_JAM_SERVER_URL}/l1/faucet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: walletAddress.trim(),
            amount: selectedAmount,
          }),
        }
      );

      if (response.ok) {
        setFaucetMessage(
          `Successfully requested ${selectedAmount} tokens for ${walletAddress}`
        );
        setShowFaucetSuccess(true);
        setWalletAddress('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFaucetMessage(errorData.message || 'Failed to request tokens');
        setShowFaucetError(true);
      }
    } catch (error: any) {
      setFaucetMessage('Network error: Failed to request tokens');
      setShowFaucetError(true);
    } finally {
      setIsRequestingTokens(false);
    }
  };

  return (
    <>
      {/* Main Footer */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(96, 165, 250, 0.2)',
          py: 2,
          px: 3,
          mt: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            maxWidth: 1200,
            mx: 'auto',
            gap: { xs: 3, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
            }}
          >
            {/* Simple Faucet Section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'Chakra Petch, sans-serif',
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 500,
                }}
              >
                $SANG Faucet
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <TextField
                  size="small"
                  placeholder="Wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: 400 },
                    '& .MuiOutlinedInput-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: { xs: '0.9rem', sm: '0.8rem' },
                      '& fieldset': {
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(96, 165, 250, 0.6)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <Select
                    size="small"
                    value={selectedAmount}
                    onChange={(e) =>
                      setSelectedAmount(e.target.value as number)
                    }
                    sx={{
                      width: { xs: '100%', sm: 70 },
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: { xs: '0.9rem', sm: '0.8rem' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(96, 165, 250, 0.6)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '1rem',
                      },
                    }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={40}>40</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleFaucetRequest}
                    disabled={isRequestingTokens || !walletAddress.trim()}
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.75rem' },
                      padding: { xs: '8px 16px', sm: '4px 8px' },
                      borderColor: 'rgba(96, 165, 250, 0.5)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: 'rgba(96, 165, 250, 0.8)',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    {isRequestingTokens ? '...' : 'Request'}
                  </Button>
                </Box>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'Chakra Petch, sans-serif',
                fontSize: { xs: '0.9rem', sm: '0.875rem' },
                textAlign: { xs: 'center', sm: 'left' },
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

          <Button
            variant="outlined"
            onClick={handleAddChain}
            disabled={isAddingChain}
            sx={{
              borderColor: 'rgba(96, 165, 250, 0.5)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '0.8rem', sm: '0.75rem' },
              width: { xs: '100%', sm: '400px' },
              '&:hover': {
                borderColor: 'rgba(96, 165, 250, 0.8)',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
              },
              '&:disabled': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {isAddingChain
              ? 'Adding Chain...'
              : 'Add Songjam Genesis to Wallet '}
          </Button>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Songjam Genesis L1 chain successfully added to MetaMask!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Faucet Success Snackbar */}
      <Snackbar
        open={showFaucetSuccess}
        autoHideDuration={6000}
        onClose={() => setShowFaucetSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowFaucetSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {faucetMessage}
        </Alert>
      </Snackbar>

      {/* Faucet Error Snackbar */}
      <Snackbar
        open={showFaucetError}
        autoHideDuration={6000}
        onClose={() => setShowFaucetError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowFaucetError(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {faucetMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddChainFooter;
