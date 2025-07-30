import { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Skeleton } from '@mui/material';
import {
  UserTweetMention,
  getTwitterMentions,
  getSlash,
  SlashDoc,
  createSlash,
  updateSlash,
  getLeaderBoardUser,
  getReport,
  AgentReport,
} from '../services/db/leaderboard.service';
import {
  useDynamicContext,
  useSocialAccounts,
} from '@dynamic-labs/sdk-react-core';
import { ProviderEnum } from '@dynamic-labs/sdk-api-core';
import { Toaster, toast } from 'react-hot-toast';
import AgenticReportComp from '../components/AgenticReportComp';
import axios from 'axios';
import {
  getLeaderboardProject,
  LeaderboardProject,
} from '../services/db/leaderboardProjects.service';

// Modular theme system
const themes = {
  evaonlinexyz: {
    bgcolor: '#f1e3eb',
    containerBg: 'white',
    fontFamily: 'Chakra Petch, sans-serif',
    primaryColor: '#4a3740',
    secondaryColor: '#666',
    buttonBg: '#ef4444',
    buttonHoverBg: '#b91c1c',
    buttonOutlinedBg: '#faecee',
    buttonOutlinedColor: '#d1002c',
    buttonOutlinedHoverBg: '#f8d7da',
    linkColor: '#ff007a',
    footerColor: '#b0b0b0',
    skeletonBg: '#f1e3eb',
    borderColor: 'unset',
  },
  wach_ai: {
    bgcolor: '#000000',
    containerBg: '#000000',
    fontFamily: '"DM Mono", monospace',
    primaryColor: '#ffffff',
    secondaryColor: '#cccccc',
    buttonBg: '#000',
    buttonHoverBg: '#b91c1c',
    buttonOutlinedBg: '#000',
    buttonOutlinedColor: '#fff',
    buttonOutlinedHoverBg: '#f8d7da',
    borderColor: '#6aff92',
    linkColor: '#6AFF92',
    footerColor: '#cccccc',
    skeletonBg: '#111111',
    accentColor: '#6AFF92',
    paperBg: '#111111',
    paperBorder: '#6AFF92',
  },
};

const Flag = () => {
  const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();
  const { user } = useDynamicContext();

  //   const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
  const [projectId, setProjectId] = useState<string>('');
  const [flagUserId, setFlagUserId] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState<LeaderboardProject | null>(
    null
  );
  const [slashDoc, setSlashDoc] = useState<SlashDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [slashedTweets, setSlashedTweets] = useState<UserTweetMention[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [voterUsername, setVoterUsername] = useState<string>('');
  const [voterUserId, setVoterUserId] = useState<string>('');
  const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Determine theme based on projectId
  const getTheme = () => {
    return projectId === 'wach_ai' ? themes.wach_ai : themes.evaonlinexyz;
  };

  const theme = getTheme();

  const fetchSlash = async (projectId: string, userId: string) => {
    const slash = await getSlash(projectId, userId);
    if (slash) {
      setSlashDoc(slash);
      fetchReport(`${projectId}_${userId}`);
    }
    const tweets = await getTwitterMentions(projectId, userId);

    setSlashedTweets(tweets);
    setLoading(false);
  };

  const handleVote = async (vote: 'defend' | 'slash') => {
    if (loading || isButtonDisabled) {
      return;
    }
    if (!voterUsername) {
      //   Trigger Login
      return await signInWithSocialAccount(ProviderEnum.Twitter, {
        redirectUrl: window.location.href,
      });
    }
    if (flagUserId === voterUserId) {
      toast.error('Cannot flag yourself');
      return;
    }
    if (slashedTweets.length === 0) {
      alert('No tweets found');
      return;
    }
    if (flagUserId) {
      // Check if the voter is in the leaderboard
      const leaderboardUser = await getLeaderBoardUser(projectId, voterUserId);
      if (!leaderboardUser) {
        // alert('Cannot flag. You are not on the leaderboard');
        toast.error('Cannot flag. You are not on the leaderboard');
        return;
      }
      setIsButtonDisabled(true);
      if (slashDoc) {
        const slash = await updateSlash(
          projectId,
          flagUserId,
          voterUsername,
          vote,
          voterUserId
        );
        setSlashDoc(slash);
      } else {
        const slash = await createSlash(
          projectId,
          flagUserId,
          voterUsername,
          slashedTweets[0]?.username || '',
          voterUserId
        );
        setSlashDoc(slash);
      }
      setIsButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (user) {
      const twitterCredential = user.verifiedCredentials.find(
        (cred) => cred.oauthProvider === 'twitter'
      );
      setVoterUsername(twitterCredential?.oauthUsername || '');
      setVoterUserId(twitterCredential?.oauthAccountId || '');
    }
  }, [user]);

  const fetchProject = async (projectId: string) => {
    const lbProject = await getLeaderboardProject(projectId);
    if (lbProject) {
      setProjectInfo(lbProject);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    setProjectId(projectId || 'evaonlinexyz');
    if (!id) {
      toast.error('No userId provided');
      return;
    }
    setFlagUserId(id);
    fetchProject(projectId || 'evaonlinexyz');
    fetchSlash(projectId || 'evaonlinexyz', id);
  }, [user]);

  const fetchReport = async (id: string) => {
    const report = await getReport(id);
    if (!report) {
      return;
    }
    setReportInfo(report);
  };

  return (
    <Box
      sx={{
        bgcolor: theme.bgcolor,
        minHeight: '100vh',
      }}
    >
      <Container
        sx={{
          pb: 2,
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          bgcolor: theme.containerBg,
        }}
      >
        <Typography
          align="center"
          variant="h3"
          color={theme.primaryColor}
          pt={2}
          sx={{
            fontFamily: theme.fontFamily,
          }}
        >
          {projectInfo?.name}
        </Typography>
        {/* Main Content */}
        {slashDoc ? (
          <Box
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.fontFamily,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: theme.fontFamily,
                fontWeight: 'bold',
                textAlign: 'center',
                maxWidth: 500,
                color: theme.primaryColor,
              }}
              component="a"
              href={`https://x.com/${
                slashDoc?.username || slashedTweets[0]?.username
              }`}
              target="_blank"
            >
              {slashDoc ? slashDoc.username : slashedTweets[0]?.username}
            </Typography>

            {/* Review Reason Placeholder */}
            <Typography
              sx={{
                fontFamily: theme.fontFamily,
                textAlign: 'center',
                color: theme.secondaryColor,
              }}
            >
              {slashDoc.slashedUsernames.includes(voterUsername)
                ? `This account has been flagged for agentic review.
              `
                : `Review the tweets below and flag this account for
                botted/farmed/low effort content.`}
            </Typography>

            {/* Defend / Slash Buttons */}
            {slashDoc.slashedUsernames.includes(voterUsername) ? (
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                <Button
                  fullWidth
                  variant={'outlined'}
                  sx={{
                    bgcolor: theme.buttonOutlinedBg,
                    color: theme.buttonOutlinedColor,
                    fontWeight: 700,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: theme.buttonOutlinedHoverBg,
                    },
                    transition: 'background 0.2s',
                  }}
                >
                  Flagged by You & {slashDoc.slashCount - 1} others
                </Button>
              </Box>
            ) : (
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                <Button
                  fullWidth
                  variant={'outlined'}
                  sx={{
                    bgcolor: theme.buttonOutlinedBg,
                    color: theme.buttonOutlinedColor,
                    fontWeight: 700,
                    borderColor: '#fff',
                    '&:hover': {
                      bgcolor: theme.buttonOutlinedHoverBg,
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleVote('slash')}
                >
                  Flag
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {/* Proposal Section */}
            <Box sx={{ pt: 3, mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: theme.fontFamily,
                  fontWeight: 'bold',
                  color: theme.primaryColor,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                component="span"
              >
                Flag
                {loading ? (
                  <Skeleton
                    width={100}
                    height={20}
                    sx={{ bgcolor: theme.skeletonBg, ml: 1 }}
                    variant="rectangular"
                  />
                ) : (
                  ` @${slashedTweets[0]?.username}`
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: theme.fontFamily,
                  color: theme.secondaryColor,
                  maxWidth: 600,
                }}
                align="center"
                component="span"
              >
                Review the tweets below and flag this account for
                botted/farmed/low effort content.
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                <Button
                  disabled={loading}
                  fullWidth
                  variant={'outlined'}
                  sx={{
                    bgcolor: theme.buttonOutlinedBg,
                    color: theme.buttonOutlinedColor,
                    fontWeight: 700,
                    borderColor: theme.borderColor,
                    '&:hover': {
                      bgcolor: theme.buttonOutlinedHoverBg,
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={async () => {
                    await handleVote('slash');
                  }}
                >
                  Flag
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        {/* Report Generation */}
        {slashDoc && slashDoc.slashCount > 0 && !reportInfo && (
          <Box
            sx={{
              mb: 4,
              textAlign: 'center',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Button
              disabled={reportLoading}
              variant="outlined"
              size="small"
              sx={{
                color: theme.linkColor,
                borderColor: theme.linkColor,
                fontWeight: 700,
                fontFamily: theme.fontFamily,
                '&:hover': {
                  bgcolor: theme.linkColor,
                  color: 'white',
                  borderColor: theme.linkColor,
                },
                transition: 'all 0.2s',
              }}
              onClick={async () => {
                setReportLoading(true);
                await axios.post(
                  `${
                    import.meta.env.VITE_JAM_SERVER_URL
                  }/agent/fetch-songjam-report`,
                  {
                    projectId: projectId,
                    userId: flagUserId,
                  }
                );
                await fetchReport(`${projectId}_${flagUserId}`);
                setReportLoading(false);
              }}
            >
              Send Songjam for Agentic Review
            </Button>
          </Box>
        )}
        {/* Footer */}
        <Box display={'flex'} justifyContent={'center'}>
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              width: '100%',
              display: 'block',
              color: theme.footerColor,
              fontFamily: theme.fontFamily,
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
                color: theme.linkColor,
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
        {reportInfo && <AgenticReportComp reportInfo={reportInfo} />}
        {/* Horizontally scrollable tweets */}
        <Box
          sx={{
            width: '100%',
            pt: 4,
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            gap: 2,
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          {/* Example tweet IDs, replace with your own or fetch dynamically */}
          {slashedTweets.map(({ id }) => (
            <Box
              key={id}
              sx={{ minWidth: 350, maxWidth: 350, flex: '0 0 auto' }}
            >
              <iframe
                loading="lazy"
                src={`https://platform.twitter.com/embed/Tweet.html?frame=false&hideCard=false&hideThread=false&id=${id}&origin=YOUR_DOMAIN_HERE&theme=light`}
                style={{ height: 600, width: 320 }}
                frameBorder="0"
                scrolling="no"
              ></iframe>
            </Box>
          ))}
        </Box>
      </Container>
      <Toaster position="bottom-center" />
    </Box>
  );
};

export default Flag;
