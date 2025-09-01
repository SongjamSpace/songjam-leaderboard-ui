import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import { addL1Chain } from '../services/creatorToken.service';

const AddChainFooter: React.FC = () => {
  const [isAddingChain, setIsAddingChain] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(96, 165, 250, 0.2)',
          py: 2,
          px: 3,
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1200,
            mx: 'auto',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
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

          <Button
            variant="outlined"
            size="small"
            onClick={handleAddChain}
            disabled={isAddingChain}
            sx={{
              borderColor: 'rgba(96, 165, 250, 0.5)',
              color: 'rgba(255, 255, 255, 0.8)',
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
              : 'Add Songjam Genesis L1 to MetaMask'}
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
    </>
  );
};

export default AddChainFooter;
