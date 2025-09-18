import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Stack,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Error,
  Schedule,
  Logout,
} from '@mui/icons-material';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  failed?: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  showProgress?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  walletAddres: string;
}

const Checklist: React.FC<ChecklistProps> = ({
  items,
  title = 'Requirements Checklist',
  showProgress = true,
  onConnectWallet,
  onDisconnectWallet,
  walletAddres,
}) => {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isSmallerScreen = useMediaQuery('(max-width: 600px)');

  return (
    <Paper
      sx={{
        p: 3,
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '15px',
        border: '1px solid #8B5CF6',
        backdropFilter: 'blur(10px)',
        // maxWidth: 600,
        width: '100%',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
            background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>

        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#8B5CF6', fontWeight: 'bold' }}
              >
                {completedCount}/{totalCount}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}
      </Box>

      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem
            key={item.id}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: '10px',
              background: item.completed
                ? 'rgba(16, 185, 129, 0.1)' // Green background for success
                : item.failed
                ? 'rgba(239, 68, 68, 0.1)' // Red background for failed
                : 'rgba(245, 158, 11, 0.1)', // Amber background for pending
              border: item.completed
                ? '1px solid rgba(16, 185, 129, 0.3)' // Green border for success
                : item.failed
                ? '1px solid rgba(239, 68, 68, 0.3)' // Red border for failed
                : '1px solid rgba(245, 158, 11, 0.3)', // Amber border for pending
              transition: 'all 0.3s ease',
              '&:hover': {
                background: item.completed
                  ? 'rgba(16, 185, 129, 0.15)' // Darker green on hover
                  : item.failed
                  ? 'rgba(239, 68, 68, 0.15)' // Darker red on hover
                  : 'rgba(245, 158, 11, 0.15)', // Darker amber on hover
                transform: 'translateY(-1px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.completed ? (
                <CheckCircle
                  sx={{
                    color: '#10B981', // Green for success
                    fontSize: 28,
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
                  }}
                />
              ) : item.failed ? (
                <Error
                  sx={{
                    color: '#EF4444', // Red for error
                    fontSize: 28,
                    filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
                  }}
                />
              ) : (
                <Schedule
                  sx={{
                    color: '#F59E0B', // Amber for pending
                    fontSize: 28,
                    filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))',
                  }}
                />
              )}
            </ListItemIcon>

            <ListItemText
              primary={
                <Box
                  display={'flex'}
                  justifyContent={'space-between'}
                  width={'100%'}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: item.completed
                          ? '#10B981' // Green for success
                          : item.failed
                          ? '#EF4444' // Red for failed
                          : '#F59E0B', // Amber for pending
                        fontWeight: 'bold',
                        opacity: item.completed ? 0.8 : 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Chip
                      label={
                        item.failed
                          ? 'Failed'
                          : item.completed
                          ? 'Success'
                          : 'Pending'
                      }
                      size="small"
                      sx={{
                        background: item.completed
                          ? 'linear-gradient(45deg, #10B981, #059669)' // Green gradient for success
                          : item.failed
                          ? 'linear-gradient(45deg, #EF4444, #DC2626)' // Red gradient for failed
                          : 'linear-gradient(45deg, #F59E0B, #D97706)', // Amber gradient for pending
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  {index === 2 &&
                    !isSmallerScreen &&
                    (walletAddres ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#8B5CF6',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {walletAddres.slice(0, 6)}...{walletAddres.slice(-4)}
                        </Typography>
                        <IconButton
                          onClick={onDisconnectWallet}
                          sx={{
                            color: '#8B5CF6',
                          }}
                          size="small"
                        >
                          <Logout fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onConnectWallet}
                      >
                        Connect Wallet
                      </Button>
                    ))}
                </Box>
              }
              secondary={
                <Stack gap={2}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: item.completed
                        ? 'rgba(255, 255, 255, 0.6)'
                        : item.failed
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </Typography>
                  {index === 2 &&
                    isSmallerScreen &&
                    (walletAddres ? (
                      <Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#8B5CF6',
                              fontWeight: 'bold',
                              fontFamily: 'monospace',
                              padding: '4px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {walletAddres.slice(0, 6)}...
                            {walletAddres.slice(-4)}
                          </Typography>
                          <IconButton
                            onClick={onDisconnectWallet}
                            sx={{
                              color: '#8B5CF6',
                            }}
                            size="small"
                          >
                            <Logout fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onConnectWallet}
                      >
                        Connect Wallet
                      </Button>
                    ))}
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Checklist;
