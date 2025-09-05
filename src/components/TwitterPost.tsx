import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import {
  TrendingUp,
  Favorite,
  ChatBubble,
  Repeat,
  Visibility,
  Bookmark,
} from '@mui/icons-material';
import { UserTweetMention } from '../services/db/leaderboard.service';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

interface TwitterPostProps {
  tweet: UserTweetMention;
}

const TwitterPost: React.FC<TwitterPostProps> = ({ tweet }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: '#15202b',
        border: '1px solid #38444d',
        borderRadius: '16px',
        width: '395px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        position: 'relative',
        '&:hover': {
          backgroundColor: '#192734',
        },
      }}
      onClick={() => {
        window.open(
          `https://x.com/${tweet.username}/status/${tweet.id}`,
          '_blank'
        );
      }}
    >
      {/* Engagement Points Badge - Centered above card, half outside half inside */}
      <Box
        sx={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
        }}
      >
        <Chip
          icon={<TrendingUp sx={{ color: '#1d9bf0' }} />}
          label={`${tweet.engagementPoints.toFixed(1)} pts`}
          sx={{
            backgroundColor: '#1d9bf0',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            height: '32px',
            '& .MuiChip-icon': {
              color: 'white',
            },
            boxShadow: '0 4px 8px rgba(29, 155, 240, 0.3)',
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ padding: '16px', paddingTop: '24px' }}>
        {/* Header with Name, Time, Username */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: '#1d9bf0',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
            src={`https://unavatar.io/twitter/${tweet.username}`}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {tweet.name}
              </Typography>
              <Typography
                sx={{
                  color: '#8899a6',
                  fontSize: '13px',
                  ml: 1,
                }}
              >
                {formatTime(tweet.timestamp)}
              </Typography>
            </Box>
            <Typography
              sx={{
                color: '#8899a6',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              variant="caption"
            >
              @{tweet.username}
            </Typography>
          </Box>
        </Box>

        {/* Tweet Content */}
        <Box sx={{ mb: 3, overflow: 'hidden' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '15px',
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              a: {
                color: '#1d9bf0',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
              img: {
                objectFit: 'contain',
                width: '100%',
                borderRadius: '8px',
                mt: 1,
              },
            }}
            dangerouslySetInnerHTML={{
              __html: `${tweet.html || ''}`,
            }}
          ></Typography>
        </Box>

        {/* Engagement Metrics */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pt: 2,
            borderTop: '1px solid #38444d',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Favorite sx={{ fontSize: '16px', color: '#8899a6' }} />
            <Typography sx={{ color: '#8899a6', fontSize: '13px' }}>
              {tweet.likes}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ChatBubble sx={{ fontSize: '16px', color: '#8899a6' }} />
            <Typography sx={{ color: '#8899a6', fontSize: '13px' }}>
              {tweet.replies}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Repeat sx={{ fontSize: '16px', color: '#8899a6' }} />
            <Typography sx={{ color: '#8899a6', fontSize: '13px' }}>
              {tweet.retweets + tweet.quotes}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DriveFileRenameOutlineIcon
              sx={{ fontSize: '16px', color: '#8899a6' }}
            />
            <Typography sx={{ color: '#8899a6', fontSize: '13px' }}>
              {tweet.quotes}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Bookmark sx={{ fontSize: '16px', color: '#8899a6' }} />
            <Typography sx={{ color: '#8899a6', fontSize: '13px' }}>
              {tweet.bookmarkCount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TwitterPost;
