import {
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Avatar,
  Select,
  MenuItem,
  keyframes,
} from '@mui/material';

import { useEffect, useState } from 'react';

const innerTextPulse = keyframes`
  0% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
  50% { text-shadow: 0 0 24px #fff; opacity: 1; }
  100% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
`;

const SignPointsLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [limit, setLimit] = useState(100);

  const fetchLeaderboard = async (leaderboardLimit: number) => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        userId: '1',
        username: 'crypto_queen',
        name: 'Crypto Queen',
        totalPoints: 125847.32,
        preGenesisPoints: 50000,
      },
      {
        userId: '2',
        username: 'web3_wizard',
        name: 'Web3 Wizard',
        totalPoints: 98765.45,
        preGenesisPoints: 0,
      },
      {
        userId: '3',
        username: 'defi_dude',
        name: 'DeFi Dude',
        totalPoints: 87654.21,
        preGenesisPoints: 30000,
      },
      {
        userId: '4',
        username: 'nft_ninja',
        name: 'NFT Ninja',
        totalPoints: 76543.89,
        preGenesisPoints: 0,
      },
      {
        userId: '5',
        username: 'blockchain_babe',
        name: 'Blockchain Babe',
        totalPoints: 65432.67,
        preGenesisPoints: 25000,
      },
      {
        userId: '6',
        username: 'metaverse_master',
        name: 'Metaverse Master',
        totalPoints: 54321.98,
        preGenesisPoints: 0,
      },
      {
        userId: '7',
        username: 'dao_dragon',
        name: 'DAO Dragon',
        totalPoints: 43210.76,
        preGenesisPoints: 15000,
      },
      {
        userId: '8',
        username: 'smart_contract_sage',
        name: 'Smart Contract Sage',
        totalPoints: 32109.54,
        preGenesisPoints: 0,
      },
      {
        userId: '9',
        username: 'yield_yapper',
        name: 'Yield Yapper',
        totalPoints: 21098.32,
        preGenesisPoints: 10000,
      },
      {
        userId: '10',
        username: 'liquidity_lord',
        name: 'Liquidity Lord',
        totalPoints: 10987.1,
        preGenesisPoints: 0,
      },
    ];

    // Apply limit if specified
    const limitedData =
      leaderboardLimit > 0 ? mockData.slice(0, leaderboardLimit) : mockData;
    setLeaderboard(limitedData);
  };
  useEffect(() => {
    fetchLeaderboard(limit);
  }, [limit]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
          }}
        >
          Leaderboard
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            animation: `${innerTextPulse} 2.5s infinite ease-in-out`,
            mx: 'auto',
            textAlign: 'center',
          }}
        >
          2% of $SANG Supply Reserved for Pre-Genesis Yappers, 3% Reserved for
          Genesis Yappers
        </Typography>
      </Box>
      {/* Centered filter above the table */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
          }}
          size="small"
          sx={{
            minWidth: 120,
            background: 'rgba(255,255,255,0.04)',
            color: 'white',
          }}
        >
          <MenuItem value={100} disabled={limit !== 100}>
            Top 100
          </MenuItem>
          <MenuItem value={500} disabled={limit === 0}>
            Top 500
          </MenuItem>
          <MenuItem value={0}>Show All</MenuItem>
        </Select>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '15px',
          maxHeight: 1050,
        }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ background: 'rgba(96, 165, 250, 0.1)' }}>
              <TableCell
                sx={{
                  color: '#F0F8FF',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 'bold',
                }}
              >
                Rank
              </TableCell>
              <TableCell
                sx={{
                  color: '#F0F8FF',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 'bold',
                }}
              >
                Name
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: '#F0F8FF',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 'bold',
                }}
              >
                Sing Points
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((user, index) => (
              <TableRow
                key={user.userId}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    background: 'rgba(96, 165, 250, 0.05)',
                    boxShadow: '0 0 15px rgba(96, 165, 250, 0.2)',
                  },
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <TableCell
                  sx={{
                    color: '#F0F8FF',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(255,255,255,0.2)',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    color: '#F0F8FF',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        border:
                          user.preGenesisPoints > 0
                            ? '2px solid #8B5CF6'
                            : '2px solid #EC4899',
                        boxShadow:
                          user.preGenesisPoints > 0
                            ? '0 0 10px #8B5CF6'
                            : '0 0 10px #EC4899',
                      }}
                      src={`https://unavatar.io/twitter/${user.username}`}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        textShadow: '0 0 5px rgba(255,255,255,0.1)',
                      }}
                    >
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#F0F8FF',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: '#EC4899',
                      textShadow: '0 0 8px #EC4899',
                    }}
                  >
                    {user.totalPoints.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SignPointsLeaderboard;
