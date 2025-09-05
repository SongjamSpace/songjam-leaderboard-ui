// import { useEffect, useState } from 'react';
// import {
//   Box,
//   Typography,
//   Button,
//   Container,
//   Skeleton,
//   TextField,
// } from '@mui/material';
// import {
//   UserTweetMention,
//   getTwitterMentions,
//   getSlash,
//   SlashDoc,
//   createSlash,
//   updateSlash,
//   getLeaderBoardUser,
//   getReport,
//   AgentReport,
//   submitTweet,
// } from '../services/db/leaderboard.service';
// import {
//   useDynamicContext,
//   useSocialAccounts,
// } from '@dynamic-labs/sdk-react-core';
// import { ProviderEnum } from '@dynamic-labs/sdk-api-core';
// import { Toaster, toast } from 'react-hot-toast';
// import AgenticReportComp from '../components/AgenticReportComp';
// // import TwitterPost from '../components/TwitterPost';
// import axios from 'axios';
// import {
//   getLeaderboardProject,
//   LeaderboardProject,
// } from '../services/db/leaderboardProjects.service';
// import TwitterPost from '../components/TwitterPost';

// export type LocalTheme = {
//   bgcolor: string;
//   containerBg: string;
//   fontFamily: string;
//   primaryColor: string;
//   secondaryColor: string;
//   buttonBg: string;
//   buttonHoverBg: string;
//   buttonOutlinedBg: string;
//   buttonOutlinedColor: string;
//   buttonOutlinedHoverBg: string;
//   linkColor: string;
//   footerColor: string;
//   skeletonBg: string;
//   borderColor: string;

//   paperBg?: string;
//   paperBorder?: string;
//   accentColor?: string;
// };
// // Modular theme system
// const themes: Record<string, LocalTheme> = {
//   evaonlinexyz: {
//     bgcolor: '#f1e3eb',
//     containerBg: 'white',
//     fontFamily: 'Chakra Petch, sans-serif',
//     primaryColor: '#4a3740',
//     secondaryColor: '#666',
//     buttonBg: '#ef4444',
//     buttonHoverBg: '#b91c1c',
//     buttonOutlinedBg: '#faecee',
//     buttonOutlinedColor: '#d1002c',
//     buttonOutlinedHoverBg: '#f8d7da',
//     linkColor: '#ff007a',
//     footerColor: '#b0b0b0',
//     skeletonBg: '#f1e3eb',
//     borderColor: 'unset',
//   },
//   wach_ai: {
//     bgcolor: '#000000',
//     containerBg: '#000000',
//     fontFamily: '"DM Mono", monospace',
//     primaryColor: '#ffffff',
//     secondaryColor: '#cccccc',
//     buttonBg: '#000',
//     buttonHoverBg: '#b91c1c',
//     buttonOutlinedBg: '#000',
//     buttonOutlinedColor: '#fff',
//     buttonOutlinedHoverBg: '#f8d7da',
//     borderColor: '#6aff92',
//     linkColor: '#6AFF92',
//     footerColor: '#cccccc',
//     skeletonBg: '#111111',
//     accentColor: '#6AFF92',
//     paperBg: '#111111',
//     paperBorder: '#6AFF92',
//   },
// };

// const Review = () => {
//   const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();
//   const { user } = useDynamicContext();

//   //   const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
//   const [projectId, setProjectId] = useState<string>('');
//   const [reviewUserId, setReviewUserId] = useState<string>('');
//   const [projectInfo, setProjectInfo] = useState<LeaderboardProject | null>(
//     null
//   );
//   const [slashDoc, setSlashDoc] = useState<SlashDoc | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [reviewedTweets, setReviewedTweets] = useState<UserTweetMention[]>([]);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
//   const [reviewerUsername, setReviewerUsername] = useState<string>('');
//   const [reviewerUserId, setReviewerUserId] = useState<string>('');
//   const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
//   const [reportLoading, setReportLoading] = useState(false);
//   const [tweetUrl, setTweetUrl] = useState<string>('');
//   const [tweetUrlError, setTweetUrlError] = useState<string>('');
//   const [submitting, setSubmitting] = useState(false);

//   // Determine theme based on projectId
//   const getTheme = () => {
//     return projectId === 'wach_ai' ? themes.wach_ai : themes.evaonlinexyz;
//   };

//   const theme = getTheme();

//   const fetchSlash = async (projectId: string, userId: string) => {
//     try {
//       const slash = await getSlash(projectId, userId);
//       if (slash) {
//         setSlashDoc(slash);
//         fetchReport(`${projectId}_${userId}`);
//       }
//       const tweets = await getTwitterMentions(projectId, userId);

//       setReviewedTweets(tweets);
//     } catch (error) {
//       console.error('Error fetching slash data:', error);
//       toast.error('Error loading tweets');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVote = async (vote: 'defend' | 'slash') => {
//     if (loading || isButtonDisabled) {
//       return;
//     }
//     if (!reviewerUsername) {
//       //   Trigger Login
//       return await signInWithSocialAccount(ProviderEnum.Twitter, {
//         redirectUrl: window.location.href,
//       });
//     }
//     if (reviewUserId === reviewerUserId) {
//       toast.error('Cannot review yourself');
//       return;
//     }
//     if (reviewedTweets.length === 0) {
//       alert('No tweets found');
//       return;
//     }
//     if (reviewUserId) {
//       // Check if the reviewer is in the leaderboard
//       const leaderboardUser = await getLeaderBoardUser(
//         projectId,
//         reviewerUserId
//       );
//       if (!leaderboardUser) {
//         // alert('Cannot review. You are not on the leaderboard');
//         toast.error('Cannot review. You are not on the leaderboard');
//         return;
//       }
//       setIsButtonDisabled(true);
//       if (slashDoc) {
//         const slash = await updateSlash(
//           projectId,
//           reviewUserId,
//           reviewerUsername,
//           vote,
//           reviewerUserId
//         );
//         setSlashDoc(slash);
//       } else {
//         const slash = await createSlash(
//           projectId,
//           reviewUserId,
//           reviewerUsername,
//           reviewedTweets[0]?.username || '',
//           reviewerUserId
//         );
//         setSlashDoc(slash);
//       }
//       setIsButtonDisabled(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       const twitterCredential = user.verifiedCredentials.find(
//         (cred) => cred.oauthProvider === 'twitter'
//       );
//       setReviewerUsername(twitterCredential?.oauthUsername || '');
//       setReviewerUserId(twitterCredential?.oauthAccountId || '');
//     }
//   }, [user]);

//   const fetchProject = async (projectId: string) => {
//     const lbProject = await getLeaderboardProject(projectId);
//     if (lbProject) {
//       setProjectInfo(lbProject);
//     }
//   };

//   const handleTweetUrlChange = (url: string) => {
//     setTweetUrl(url);
//     setTweetUrlError('');
//   };

//   const handleSubmitTweet = async () => {
//     if (!tweetUrl.trim()) {
//       setTweetUrlError('Please enter a tweet URL');
//       return;
//     }

//     // Extract username and tweet ID from URL
//     // Expected format: x.com/username/status/tweetid
//     const urlPattern = /(?:x\.com|twitter\.com)\/([^\/]+)\/status\/([^\/\?]+)/;
//     const match = tweetUrl.match(urlPattern);

//     if (!match) {
//       setTweetUrlError(
//         'Invalid tweet URL format. Expected: x.com/username/status/tweetid'
//       );
//       return;
//     }

//     const [, username, tweetId] = match;

//     // Check if username matches the first tweet's username
//     if (reviewedTweets.length > 0 && reviewedTweets[0].username !== username) {
//       setTweetUrlError('Username does not match the user being reviewed');
//       return;
//     }

//     // Check if tweet ID is already in the array
//     const isDuplicate = reviewedTweets.some(
//       (tweet) => tweet.id === tweetId || tweet.tweetId === tweetId
//     );
//     if (isDuplicate) {
//       setTweetUrlError('This tweet is already in the list');
//       return;
//     }

//     try {
//       setSubmitting(true);
//       // Submit the tweet
//       const isSubmitted = await submitTweet(projectId, username, tweetId);
//       if (isSubmitted) {
//         toast.success('Tweet submitted successfully!');
//       } else {
//         toast.error('Tweet already submitted');
//       }
//       setTweetUrl(''); // Clear the input after successful submission
//     } catch (error) {
//       console.error('Error submitting tweet:', error);
//       toast.error('Failed to submit tweet. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     const searchParams = new URLSearchParams(window.location.search);
//     const id = searchParams.get('userId');
//     const projectId = searchParams.get('projectId');
//     setProjectId(projectId || 'evaonlinexyz');
//     if (!id) {
//       toast.error('No userId provided');
//       return;
//     }
//     setReviewUserId(id);
//     fetchProject(projectId || 'evaonlinexyz');
//     fetchSlash(projectId || 'evaonlinexyz', id);
//   }, [user]);

//   const fetchReport = async (id: string) => {
//     const report = await getReport(id);
//     if (!report) {
//       return;
//     }
//     setReportInfo(report);
//   };

//   return (
//     <Box
//       sx={{
//         bgcolor: theme.bgcolor,
//         minHeight: '100vh',
//       }}
//     >
//       <Container
//         sx={{
//           pb: 2,
//           position: 'relative',
//           zIndex: 1,
//           flexGrow: 1,
//           bgcolor: theme.containerBg,
//         }}
//       >
//         <Typography
//           align="center"
//           variant="h3"
//           color={theme.primaryColor}
//           pt={2}
//           sx={{
//             fontFamily: theme.fontFamily,
//           }}
//         >
//           {projectInfo?.name}
//         </Typography>
//         {/* Main Content */}
//         {slashDoc ? (
//           <Box
//             sx={{
//               pt: 2,
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontFamily: theme.fontFamily,
//             }}
//           >
//             <Typography
//               variant="body1"
//               sx={{
//                 fontFamily: theme.fontFamily,
//                 fontWeight: 'bold',
//                 textAlign: 'center',
//                 maxWidth: 500,
//                 color: theme.primaryColor,
//               }}
//               component="a"
//               href={`https://x.com/${
//                 slashDoc?.username || reviewedTweets[0]?.username
//               }`}
//               target="_blank"
//             >
//               {slashDoc ? slashDoc.username : reviewedTweets[0]?.username}
//             </Typography>

//             {/* Review Reason Placeholder */}
//             <Typography
//               sx={{
//                 fontFamily: theme.fontFamily,
//                 textAlign: 'center',
//                 color: theme.secondaryColor,
//               }}
//             >
//               {slashDoc.slashedUsernames.includes(reviewerUsername)
//                 ? `This account has been reviewed for agentic analysis.
//               `
//                 : `Review the tweets below and submit this account for
//                 agentic analysis of content quality and authenticity.`}
//             </Typography>

//             {/* Defend / Slash Buttons */}
//             {slashDoc.slashedUsernames.includes(reviewerUsername) ? (
//               <Box
//                 sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
//               >
//                 <Button
//                   fullWidth
//                   variant={'outlined'}
//                   sx={{
//                     bgcolor: theme.buttonOutlinedBg,
//                     color: theme.buttonOutlinedColor,
//                     fontWeight: 700,
//                     borderColor: 'transparent',
//                     '&:hover': {
//                       bgcolor: theme.buttonOutlinedHoverBg,
//                     },
//                     transition: 'background 0.2s',
//                   }}
//                 >
//                   Reviewed by You & {slashDoc.slashCount - 1} others
//                 </Button>
//               </Box>
//             ) : (
//               <Box
//                 sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
//               >
//                 <Button
//                   fullWidth
//                   variant={'outlined'}
//                   sx={{
//                     color: theme.linkColor,
//                     borderColor: theme.linkColor,
//                     fontWeight: 700,
//                     fontFamily: theme.fontFamily,
//                     '&:hover': {
//                       bgcolor: theme.linkColor,
//                       color: 'black',
//                       borderColor: theme.linkColor,
//                     },
//                     transition: 'all 0.2s',
//                   }}
//                   onClick={() => handleVote('slash')}
//                 >
//                   Submit for Review
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         ) : (
//           <Box>
//             {/* Proposal Section */}
//             <Box sx={{ pt: 3, mb: 4, textAlign: 'center' }}>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontFamily: theme.fontFamily,
//                   fontWeight: 'bold',
//                   color: theme.primaryColor,
//                   mb: 2,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//                 component="span"
//               >
//                 Review
//                 {loading ? (
//                   <Skeleton
//                     width={100}
//                     height={20}
//                     sx={{ bgcolor: theme.skeletonBg, ml: 1 }}
//                     variant="rectangular"
//                   />
//                 ) : (
//                   ` @${reviewedTweets[0]?.username}`
//                 )}
//               </Typography>
//               <Typography
//                 variant="body2"
//                 sx={{
//                   fontFamily: theme.fontFamily,
//                   color: theme.secondaryColor,
//                   maxWidth: 600,
//                 }}
//                 align="center"
//                 component="span"
//               >
//                 Review the tweets below and submit this account for agentic
//                 analysis of content quality and authenticity.
//               </Typography>
//               <Box
//                 sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
//               >
//                 <Button
//                   disabled={loading}
//                   fullWidth
//                   variant={'outlined'}
//                   sx={{
//                     color: theme.linkColor,
//                     borderColor: theme.linkColor,
//                     fontWeight: 700,
//                     fontFamily: theme.fontFamily,
//                     '&:hover': {
//                       bgcolor: theme.linkColor,
//                       color: 'black',
//                       borderColor: theme.linkColor,
//                     },
//                     transition: 'all 0.2s',
//                   }}
//                   onClick={async () => {
//                     await handleVote('slash');
//                   }}
//                 >
//                   Submit for Review
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         )}
//         {/* Report Generation */}
//         {slashDoc && slashDoc.slashCount > 0 && !reportInfo && (
//           <Box
//             sx={{
//               mb: 4,
//               textAlign: 'center',
//               maxWidth: 500,
//               mx: 'auto',
//             }}
//           >
//             <Button
//               disabled={reportLoading}
//               variant="outlined"
//               size="small"
//               sx={{
//                 color: theme.linkColor,
//                 borderColor: theme.linkColor,
//                 fontWeight: 700,
//                 fontFamily: theme.fontFamily,
//                 '&:hover': {
//                   bgcolor: theme.linkColor,
//                   color: 'black',
//                   borderColor: theme.linkColor,
//                 },
//                 transition: 'all 0.2s',
//               }}
//               onClick={async () => {
//                 if (reportLoading) return;
//                 setReportLoading(true);
//                 await axios.post(
//                   `${
//                     import.meta.env.VITE_JAM_SERVER_URL
//                   }/agent/fetch-songjam-report`,
//                   {
//                     projectId: projectId,
//                     userId: reviewUserId,
//                   }
//                 );
//                 await fetchReport(`${projectId}_${reviewUserId}`);
//                 setReportLoading(false);
//               }}
//             >
//               {reportLoading
//                 ? 'Generating Report...'
//                 : 'Send Songjam for Agentic Review'}
//             </Button>
//           </Box>
//         )}
//         {/* Footer */}
//         <Box display={'flex'} justifyContent={'center'}>
//           <Typography
//             variant="caption"
//             sx={{
//               textAlign: 'center',
//               width: '100%',
//               display: 'block',
//               color: theme.footerColor,
//               fontFamily: theme.fontFamily,
//             }}
//           >
//             Powered by{' '}
//             <a
//               href="https://songjam.space/"
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{
//                 fontWeight: 'bold',
//                 textDecoration: 'none',
//                 color: theme.linkColor,
//               }}
//               onMouseOver={(e) =>
//                 (e.currentTarget.style.textDecoration = 'underline')
//               }
//               onMouseOut={(e) =>
//                 (e.currentTarget.style.textDecoration = 'none')
//               }
//             >
//               Songjam
//             </a>
//           </Typography>
//         </Box>
//         {reportInfo && (
//           <Box mt={2}>
//             <AgenticReportComp
//               reportInfo={reportInfo}
//               theme={themes[projectId]}
//             />
//           </Box>
//         )}
//         <Box sx={{ mt: 4, mb: 2 }}>
//           <Typography
//             variant="h6"
//             sx={{
//               color: theme.primaryColor,
//               fontFamily: theme.fontFamily,
//               mb: 2,
//               textAlign: 'center',
//             }}
//           >
//             Don't find your tweet here? Submit them below using the post URL
//           </Typography>
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 2,
//               maxWidth: 600,
//               mx: 'auto',
//             }}
//           >
//             <TextField
//               fullWidth
//               variant="outlined"
//               placeholder="x.com/SongjamSpace/status/1950699412189020196"
//               value={tweetUrl}
//               label="Enter tweet URL"
//               onChange={(e) => handleTweetUrlChange(e.target.value)}
//               error={!!tweetUrlError}
//               helperText={tweetUrlError}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   fontFamily: theme.fontFamily,
//                   '& fieldset': {
//                     borderColor: theme.borderColor,
//                   },
//                   '&:hover fieldset': {
//                     borderColor: theme.linkColor,
//                   },
//                   '&.Mui-focused fieldset': {
//                     borderColor: theme.linkColor,
//                   },
//                 },
//                 '& .MuiInputLabel-root': {
//                   fontFamily: theme.fontFamily,
//                 },
//                 '& .MuiFormHelperText-root': {
//                   fontFamily: theme.fontFamily,
//                 },
//               }}
//             />
//             <Button
//               variant="contained"
//               onClick={handleSubmitTweet}
//               sx={{
//                 bgcolor: theme.buttonBg,
//                 color: 'white',
//                 fontFamily: theme.fontFamily,
//                 '&:hover': {
//                   bgcolor: theme.buttonHoverBg,
//                 },
//                 transition: 'all 0.2s',
//               }}
//               disabled={submitting}
//             >
//               {submitting ? 'Submitting...' : 'Submit Tweet'}
//             </Button>
//           </Box>
//         </Box>
//         {/* Horizontally scrollable tweets */}
//         <Box
//           sx={{
//             width: '100%',
//             pt: 4,
//             display: 'flex',
//             flexDirection: 'row',
//             overflowX: 'auto',
//             gap: 2,
//             flexWrap: 'nowrap',
//             justifyContent: 'flex-start',
//             alignItems: 'flex-start',
//           }}
//         >
//           {reviewedTweets.map((tweet) => (
//             <Box key={tweet.id} sx={{ flex: '0 0 auto', mr: 3 }}>
//               <TwitterPost tweet={tweet} />
//             </Box>
//           ))}
//         </Box>
//       </Container>
//       <Toaster position="bottom-center" />
//     </Box>
//   );
// };

// export default Review;
