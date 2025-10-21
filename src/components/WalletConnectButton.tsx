import { useState } from 'react';
import { useSolana } from './solanaProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowDown,
  AccountBalanceWallet,
  Logout,
  ContentCopy,
} from '@mui/icons-material';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { publicKey, connected, disconnect, wallet, select, wallets } =
    useWallet();
  const { solBalance } = useSolana();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      handleClose();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = async (walletName: string) => {
    const selectedWallet = wallets.find((w) => w.adapter.name === walletName);
    if (selectedWallet) {
      select(selectedWallet.adapter.name);
      handleClose();
    }
  };

  // If not connected, show wallet selection menu
  if (!connected || !publicKey) {
    return (
      <>
        <Button
          variant="outlined"
          onClick={handleClick}
          endIcon={<KeyboardArrowDown />}
          sx={{
            minWidth: 180,
            textTransform: 'none',
            px: 2,
            py: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet sx={{ fontSize: 20 }} />
            <Typography variant="body2">Connect Wallet</Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 280,
              mt: 1,
            },
          }}
        >
          <Box px={2} py={1}>
            <Typography variant="caption" color="text.secondary">
              Select Wallet
            </Typography>
          </Box>
          <Divider />
          {wallets
            .filter(
              (w) => w.readyState === 'Installed' || w.readyState === 'Loadable'
            )
            .map((w) => (
              <MenuItem
                key={w.adapter.name}
                onClick={() => handleWalletSelect(w.adapter.name)}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {w.adapter.icon && (
                    <Avatar
                      src={w.adapter.icon}
                      alt={w.adapter.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {w.adapter.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                  )}
                  <Typography variant="body2">{w.adapter.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          {wallets.filter(
            (w) => w.readyState === 'Installed' || w.readyState === 'Loadable'
          ).length === 0 && (
            <Box px={2} py={2}>
              <Typography variant="body2" color="text.secondary" align="center">
                No wallets detected. Please install a Solana wallet.
              </Typography>
            </Box>
          )}
        </Menu>
      </>
    );
  }

  // If connected, show custom button with menu
  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        sx={{
          minWidth: 180,
          textTransform: 'none',
          px: 2,
          py: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {wallet?.adapter.icon && (
            <Avatar
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              sx={{ width: 20, height: 20 }}
            >
              {wallet.adapter.name.slice(0, 2).toUpperCase()}
            </Avatar>
          )}
          <Typography
            variant="body2"
            fontFamily="monospace"
            fontSize="0.875rem"
          >
            {truncateAddress(publicKey.toBase58())}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            mt: 1,
          },
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary">
            Connected Wallet
          </Typography>
        </Box>
        <Divider />

        <Box px={2} py={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {wallet?.adapter.icon && (
              <Avatar
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                sx={{ width: 32, height: 32 }}
              >
                {wallet.adapter.name.slice(0, 2).toUpperCase()}
              </Avatar>
            )}
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500}>
                {wallet?.adapter.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontFamily="monospace"
              >
                {truncateAddress(publicKey.toBase58())}
              </Typography>
              {solBalance !== null && (
                <Typography variant="caption" display="block" color="primary">
                  {solBalance.toFixed(4)} SOL
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={handleCopyAddress}>
          <ContentCopy sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">
            {copied ? 'Copied!' : 'Copy Address'}
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleDisconnect} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

// Export a simple version that just uses the built-in button
export function SimpleWalletButton() {
  return <WalletMultiButton />;
}
