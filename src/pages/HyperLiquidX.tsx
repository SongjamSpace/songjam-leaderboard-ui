import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Twitter,
  EmojiEvents,
  Star,
} from '@mui/icons-material';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface LeaderboardUser {
  username: string;
  name: string;
  totalPoints: number;
}

interface LeaderboardStats {
  totalPoints: number;
  totalNoOfYappers: number;
  averagePoints: number;
}

type Props = {};

const HyperLiquid = (props: Props) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalPoints: 0,
    totalNoOfYappers: 0,
    averagePoints: 0,
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(500);
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load Teodor font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Teodor:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(
        'https://hyperliquidx-leaderboard.logesh-063.workers.dev'
      );
      const data = response.data;

      if (data && Array.isArray(data)) {
        setUsers(data);
        setHasMore(data.length > 200); // Initially show only 200

        // Calculate stats
        const totalPoints = data.reduce(
          (sum: number, user: LeaderboardUser) => sum + user.totalPoints,
          0
        );
        const top100Points = data
          .slice(0, 100)
          .reduce(
            (sum: number, user: LeaderboardUser) => sum + user.totalPoints,
            0
          );
        setStats({
          totalPoints,
          totalNoOfYappers: data.length,
          averagePoints: top100Points / 100,
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  //   const loadMore = useCallback(() => {
  //     if (users.length > displayedCount && !loading) {
  //       setLoading(true);
  //       // Simulate a small delay for better UX
  //       setTimeout(() => {
  //         const newCount = Math.min(displayedCount + 200, users.length);
  //         setDisplayedCount(newCount);
  //         setHasMore(newCount < users.length);
  //         setLoading(false);
  //       }, 300);
  //     }
  //   }, [users.length, displayedCount, loading]);

  useEffect(() => {
    fetchUsers();
  }, []);

  //   useEffect(() => {
  //     const currentObserver = observer.current;
  //     if (loadingRef.current) {
  //       observer.current = new IntersectionObserver(
  //         (entries) => {
  //           if (entries[0].isIntersecting && hasMore && !loading) {
  //             loadMore();
  //           }
  //         },
  //         { threshold: 0.1 }
  //       );
  //       observer.current.observe(loadingRef.current);
  //     }

  //     return () => {
  //       if (currentObserver) {
  //         currentObserver.disconnect();
  //       }
  //     };
  //   }, [loadMore, hasMore, loading]);

  const displayedUsers = users.slice(0, displayedCount);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}30`,
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color}, ${color}80)`,
              borderRadius: '12px',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Teodor, Inter, system-ui, sans-serif',
              fontWeight: 600,
              color: color,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Teodor, Inter, system-ui, sans-serif',
            fontWeight: 700,
            color: color,
            textShadow: `0 0 20px ${color}40`,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading && users.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'rgb(237, 255, 252)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress
            sx={{
              height: 8,
              borderRadius: 4,
              background: 'rgba(151, 252, 228, 0.2)',
              '& .MuiLinearProgress-bar': {
                background:
                  'linear-gradient(90deg, rgb(151, 252, 228), rgb(151, 252, 228))',
              },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              textAlign: 'center',
              fontFamily: 'Teodor, Inter, system-ui, sans-serif',
              color: '#000',
            }}
          >
            Loading Leaderboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'rgb(237, 255, 252)',
        py: 4,
        // Override global theme for this component only
        '& .MuiButton-contained': {
          background: 'rgb(151, 252, 228) !important',
          color: '#000 !important',
          '&:hover': {
            background: 'rgb(151, 252, 228) !important',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(151, 252, 228, 0.4) !important',
          },
        },
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={1000}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Teodor, Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #000, #333)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                Hyperliquid Leaderboard
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Teodor, Inter, system-ui, sans-serif',
                  color: '#666',
                  fontWeight: 400,
                }}
              >
                Track the top performers in the ecosystem
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Stats Section */}
              <Grid item xs={12} md={4}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Teodor, Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      color: '#000',
                      mb: 3,
                    }}
                  >
                    Statistics
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    <StatCard
                      title="Total Points"
                      value={stats.totalPoints.toFixed(0)}
                      icon={
                        <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                      }
                      color="rgb(151, 252, 228)"
                    />
                    <StatCard
                      title="Total Yappers"
                      value={stats.totalNoOfYappers}
                      icon={<People sx={{ color: 'white', fontSize: 24 }} />}
                      color="rgb(151, 252, 228)"
                    />
                    <StatCard
                      title="Top 100 Avg. Points"
                      value={stats.averagePoints.toFixed(0)}
                      icon={<Star sx={{ color: 'white', fontSize: 24 }} />}
                      color="rgb(151, 252, 228)"
                    />
                  </Box>
                  <Box
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: '16px',
                      background: 'rgba(151, 252, 228, 0.1)',
                      border: '1px solid rgba(151, 252, 228, 0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Teodor, Inter, system-ui, sans-serif',
                        fontWeight: 500,
                        color: '#333',
                        fontSize: '1rem',
                        textAlign: 'center',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Tweets analyzed from{' '}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: '#072723',
                          textShadow: '0 0 10px rgba(151, 252, 228, 0.3)',
                        }}
                      >
                        June 1st, 2025
                      </Box>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Leaderboard Table */}
              <Grid item xs={12} md={8}>
                <Slide direction="up" in timeout={800}>
                  <Paper
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(151, 252, 228, 0.3)',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(151, 252, 228, 0.1)',
                    }}
                  >
                    <TableContainer
                      sx={{
                        maxHeight: { xs: 'none', sm: '70vh' },
                        overflow: { xs: 'visible', sm: 'auto' },
                      }}
                    >
                      <Table
                        stickyHeader
                        sx={{
                          minWidth: { xs: 'auto', sm: 650 },
                          tableLayout: { xs: 'fixed', sm: 'auto' },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                background:
                                  'linear-gradient(135deg, rgb(151, 252, 228), rgb(151, 252, 228))',
                                fontFamily:
                                  'Teodor, Inter, system-ui, sans-serif',
                                fontWeight: 600,
                                color: '#000',
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                borderBottom: '2px solid rgb(151, 252, 228)',
                                padding: { xs: '8px 4px', sm: '16px' },
                                width: { xs: '20%', sm: 'auto' },
                              }}
                            >
                              Rank
                            </TableCell>
                            <TableCell
                              sx={{
                                background:
                                  'linear-gradient(135deg, rgb(151, 252, 228), rgb(151, 252, 228))',
                                fontFamily:
                                  'Teodor, Inter, system-ui, sans-serif',
                                fontWeight: 600,
                                color: '#000',
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                borderBottom: '2px solid rgb(151, 252, 228)',
                                padding: { xs: '8px 4px', sm: '16px' },
                                width: { xs: '50%', sm: 'auto' },
                              }}
                            >
                              Yapper
                            </TableCell>
                            <TableCell
                              sx={{
                                background:
                                  'linear-gradient(135deg, rgb(151, 252, 228), rgb(151, 252, 228))',
                                fontFamily:
                                  'Teodor, Inter, system-ui, sans-serif',
                                fontWeight: 600,
                                color: '#000',
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                borderBottom: '2px solid rgb(151, 252, 228)',
                                padding: { xs: '8px 4px', sm: '16px' },
                                width: { xs: '30%', sm: 'auto' },
                              }}
                            >
                              Points
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedUsers.map((user, index) => (
                            <TableRow
                              key={`${user.username}-${index}`}
                              sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(151, 252, 228, 0.1)',
                                  transform: 'scale(1.01)',
                                },
                                '&:nth-of-type(odd)': {
                                  background: 'rgba(151, 252, 228, 0.05)',
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontFamily:
                                    'Teodor, Inter, system-ui, sans-serif',
                                  fontWeight: 600,
                                  color: '#000',
                                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                  padding: { xs: '8px 4px', sm: '16px' },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {index < 3 ? (
                                    <EmojiEvents
                                      sx={{
                                        color:
                                          index === 0
                                            ? '#FFD700'
                                            : index === 1
                                            ? '#C0C0C0'
                                            : '#CD7F32',
                                        fontSize: 20,
                                      }}
                                    />
                                  ) : (
                                    <Star
                                      sx={{
                                        color: 'rgb(151, 252, 228)',
                                        fontSize: 16,
                                      }}
                                    />
                                  )}
                                  #{index + 1}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily:
                                    'Teodor, Inter, system-ui, sans-serif',
                                  fontWeight: 500,
                                  color: '#333',
                                  padding: { xs: '8px 4px', sm: '16px' },
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
                                    sx={{
                                      fontFamily:
                                        'Teodor, Inter, system-ui, sans-serif',
                                      fontWeight: 600,
                                      color: '#000',
                                      fontSize: { xs: '0.85rem', sm: '1rem' },
                                    }}
                                  >
                                    {user.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontFamily:
                                        'Teodor, Inter, system-ui, sans-serif',
                                      fontWeight: 400,
                                      color: '#666',
                                      fontSize: { xs: '0.75rem', sm: '0.9rem' },
                                    }}
                                  >
                                    @{user.username}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{ padding: { xs: '8px 4px', sm: '16px' } }}
                              >
                                <Chip
                                  label={user.totalPoints.toFixed(0)}
                                  sx={{
                                    background:
                                      'linear-gradient(135deg, rgb(151, 252, 228), rgb(151, 252, 228))',
                                    color: '#000',
                                    fontFamily:
                                      'Teodor, Inter, system-ui, sans-serif',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    height: { xs: '24px', sm: '32px' },
                                    '& .MuiChip-label': {
                                      padding: { xs: '0 6px', sm: '0 12px' },
                                    },
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                    },
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Slide>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default HyperLiquid;
