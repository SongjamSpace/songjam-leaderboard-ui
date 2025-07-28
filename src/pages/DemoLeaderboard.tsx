// UnUsed
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  TrendingUp,
  Star,
  Visibility,
  Favorite,
  Reply,
  Repeat,
  Bookmark,
  Rocket,
  AutoAwesome,
} from '@mui/icons-material';

interface TweetData {
  id: string;
  author: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  metrics: {
    views: number;
    likes: number;
    replies: number;
    retweets: number;
    bookmarks: number;
    quoteRetweets: number;
  };
  points: number;
  isEarly: boolean;
}

const DemoLeaderboard: React.FC = () => {
  const [twitterAccount, setTwitterAccount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadingSteps = [
    'Scanning through thousands of tweets...',
    'Calculating viral engagement scores...',
    'Unveiling your community champions...',
  ];

  // Mock data for demo
  const mockTweets: TweetData[] = [
    {
      id: '1',
      author: 'Alice Johnson',
      authorHandle: '@alicej',
      content:
        'Just discovered $SONGJAM! This is going to be huge! 🚀 #crypto #music',
      timestamp: '2024-01-15T10:30:00Z',
      metrics: {
        views: 1250,
        likes: 89,
        replies: 12,
        retweets: 23,
        bookmarks: 7,
        quoteRetweets: 3,
      },
      points: 2847,
      isEarly: true,
    },
    {
      id: '2',
      author: 'Bob Smith',
      authorHandle: '@bobsmith',
      content:
        'Excited about the $SONGJAM project! The team behind this is amazing 👏',
      timestamp: '2024-01-15T11:15:00Z',
      metrics: {
        views: 890,
        likes: 67,
        replies: 8,
        retweets: 15,
        bookmarks: 4,
        quoteRetweets: 2,
      },
      points: 2156,
      isEarly: true,
    },
    {
      id: '3',
      author: 'Carol Davis',
      authorHandle: '@carold',
      content:
        "$SONGJAM is the future of music NFTs! Can't wait to see what's next 🎵",
      timestamp: '2024-01-15T12:00:00Z',
      metrics: {
        views: 2100,
        likes: 156,
        replies: 25,
        retweets: 42,
        bookmarks: 18,
        quoteRetweets: 5,
      },
      points: 4872,
      isEarly: false,
    },
    {
      id: '4',
      author: 'David Wilson',
      authorHandle: '@davidw',
      content:
        'Just joined the $SONGJAM community! This is exactly what the music industry needs 🎶',
      timestamp: '2024-01-15T13:45:00Z',
      metrics: {
        views: 750,
        likes: 45,
        replies: 6,
        retweets: 9,
        bookmarks: 3,
        quoteRetweets: 1,
      },
      points: 1234,
      isEarly: false,
    },
    {
      id: '5',
      author: 'Eva Martinez',
      authorHandle: '@evam',
      content:
        '$SONGJAM bringing innovation to music! Love the concept and execution 💯',
      timestamp: '2024-01-15T14:20:00Z',
      metrics: {
        views: 1800,
        likes: 134,
        replies: 19,
        retweets: 31,
        bookmarks: 12,
        quoteRetweets: 4,
      },
      points: 3456,
      isEarly: false,
    },
  ];

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAnalyze = () => {
    if (!twitterAccount.trim()) return;

    setIsAnalyzing(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            setTweets(mockTweets.sort((a, b) => b.points - a.points));
            setShowLeaderboard(true);
            setIsAnalyzing(false);
          }, 1000);
          return prev;
        }
      });
    }, 2000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          background:
            'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      />

      {/* Glowing Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background:
            'radial-gradient(circle, rgba(64, 224, 208, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '200px',
          height: '200px',
          background:
            'radial-gradient(circle, rgba(255, 105, 180, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite 1s',
          zIndex: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              background: 'linear-gradient(45deg, #40E0D0, #FF69B4, #9370DB)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s ease infinite',
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              mb: 2,
              textShadow: '0 0 30px rgba(64, 224, 208, 0.5)',
            }}
          >
            <AutoAwesome sx={{ mr: 2, fontSize: 'inherit' }} />
            Songjam Leaderboard
            <AutoAwesome sx={{ ml: 2, fontSize: 'inherit' }} />
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 300,
              mb: 4,
            }}
          >
            Discover the most engaging voices in the crypto music revolution
          </Typography>
        </Box>

        {/* Input Section */}
        {!isAnalyzing && !showLeaderboard && (
          <Slide
            direction="up"
            in={!isAnalyzing && !showLeaderboard}
            timeout={1000}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                mb: 6,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  maxWidth: 500,
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'linear-gradient(45deg, transparent, rgba(64, 224, 208, 0.1), transparent)',
                    animation: 'shimmer 2s infinite',
                  },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    mb: 3,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Analyze Your Community
                </Typography>

                <TextField
                  fullWidth
                  // label="X username or $Cashtag"
                  value={twitterAccount}
                  onChange={(e) => setTwitterAccount(e.target.value)}
                  placeholder="@SongjamSpace or $SANG"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#40E0D0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#40E0D0',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: '#40E0D0',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <img
                        src="/logos/twitter.png"
                        alt="X"
                        style={{ width: 16, height: 16, marginRight: 8 }}
                      />
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={!twitterAccount.trim()}
                  sx={{
                    background: 'linear-gradient(45deg, #40E0D0, #FF69B4)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient 2s ease infinite',
                    height: 56,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(64, 224, 208, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF69B4, #40E0D0)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(64, 224, 208, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Rocket sx={{ mr: 1 }} />
                  GO
                </Button>
              </Paper>
            </Box>
          </Slide>
        )}

        {/* Leaderboard */}
        {(showLeaderboard || isAnalyzing) && (
          <Slide
            direction="up"
            in={showLeaderboard || isAnalyzing}
            timeout={1000}
          >
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <TrendingUp sx={{ color: '#40E0D0' }} />
                  {isAnalyzing ? 'Analyzing Community' : 'Live Leaderboard'}
                  <TrendingUp sx={{ color: '#FF69B4' }} />
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 300,
                  }}
                >
                  {isAnalyzing
                    ? 'Discovering your top performers...'
                    : `Top performers for ${twitterAccount}`}
                </Typography>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(64, 224, 208, 0.1)' }}>
                        <TableCell
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          Rank
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          User
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          Content
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                            textAlign: 'center',
                          }}
                        >
                          Engagement
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                            textAlign: 'center',
                          }}
                        >
                          Points
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isAnalyzing ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ border: 'none', py: 8 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: 80,
                                  height: 80,
                                }}
                              >
                                <CircularProgress
                                  size={80}
                                  thickness={4}
                                  sx={{
                                    color: '#40E0D0',
                                    '& .MuiCircularProgress-circle': {
                                      strokeLinecap: 'round',
                                    },
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    background:
                                      'radial-gradient(circle, rgba(64, 224, 208, 0.2) 0%, transparent 70%)',
                                    animation: 'pulse 2s ease-in-out infinite',
                                  }}
                                />
                              </Box>
                              <Grow in={true} timeout={500}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#fff',
                                    textAlign: 'center',
                                    fontWeight: 500,
                                    textShadow:
                                      '0 0 20px rgba(64, 224, 208, 0.5)',
                                  }}
                                >
                                  {loadingSteps[currentStep]}
                                </Typography>
                              </Grow>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        tweets.map((tweet, index) => (
                          <TableRow
                            key={tweet.id}
                            sx={{
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                              },
                              '&:nth-of-type(1)': {
                                background:
                                  'linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent)',
                                borderLeft: '4px solid #FFD700',
                              },
                              '&:nth-of-type(2)': {
                                background:
                                  'linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent)',
                                borderLeft: '4px solid #C0C0C0',
                              },
                              '&:nth-of-type(3)': {
                                background:
                                  'linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent)',
                                borderLeft: '4px solid #CD7F32',
                              },
                            }}
                          >
                            <TableCell sx={{ color: '#fff', border: 'none' }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: index < 3 ? '#FFD700' : '#fff',
                                  }}
                                >
                                  #{index + 1}
                                </Typography>
                                {index < 3 && (
                                  <Star
                                    sx={{ color: '#FFD700', fontSize: 20 }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: '#fff', border: 'none' }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: index < 3 ? '#40E0D0' : '#666',
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {tweet.author.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {tweet.author}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                  >
                                    {tweet.authorHandle}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: '#fff',
                                border: 'none',
                                maxWidth: 300,
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {tweet.content}
                              </Typography>
                              {tweet.isEarly && (
                                <Chip
                                  icon={<Star />}
                                  label="Early Supporter"
                                  size="small"
                                  sx={{
                                    background:
                                      'linear-gradient(45deg, #FFD700, #FFA500)',
                                    color: '#000',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: '#fff',
                                border: 'none',
                                textAlign: 'center',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                  <Typography variant="caption">
                                    {formatNumber(tweet.metrics.views)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Favorite fontSize="small" />
                                  <Typography variant="caption">
                                    {formatNumber(tweet.metrics.likes)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Repeat fontSize="small" />
                                  <Typography variant="caption">
                                    {formatNumber(tweet.metrics.retweets)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: '#fff',
                                border: 'none',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  background:
                                    'linear-gradient(45deg, #40E0D0, #FF69B4)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                }}
                              >
                                {tweet.points.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* CTA Section */}
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Ready to create your own leaderboard?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 4,
                    fontWeight: 300,
                  }}
                >
                  Join thousands of communities using Songjam to boost
                  engagement
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #40E0D0, #FF69B4)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient 2s ease infinite',
                    height: 60,
                    px: 6,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(64, 224, 208, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF69B4, #40E0D0)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(64, 224, 208, 0.4)',
                    },
                  }}
                >
                  Get Started Now
                </Button>
              </Box>
            </Box>
          </Slide>
        )}
      </Container>

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Box>
  );
};

export default DemoLeaderboard;
