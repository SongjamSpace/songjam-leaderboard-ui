# SongJam Leaderboard & Token Claim

A Web3 application for SongJam's singing points leaderboard and $SANG token claiming system.

## Features

### 🏆 Leaderboard

- Real-time singing points leaderboard
- Filter by Top 100, Top 500, or Show All
- Beautiful gradient UI with animations
- User avatars from Twitter profiles
- Pre-Genesis and Genesis yapper indicators

### 📊 Analytics Dashboard

- Total Points across all yappers
- Total $SANG tokens available for distribution
- Number of active yappers
- Animated dashboard cards with hover effects

### 🔐 Authentication

- Twitter OAuth integration
- Firebase authentication
- User profile display with avatar
- Sign in/out functionality

### 💰 Token Claiming

- Claim section for authenticated users
- Wallet connection integration
- Token distribution based on singing points

## Pages

### Home Page (`/`)

- Welcome screen with SongJam branding
- Navigation to Claim $SANG page
- Twitter sign-in button
- User welcome message when authenticated

### Claim $SANG Tokens Page (`/claim-sang`)

- Analytics dashboard at the top
- Leaderboard component horizontally centered
- Twitter sign-in if not authenticated
- Token claiming interface for authenticated users

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
VITE_DYNAMIC_ENV_ID=your_dynamic_env_id
```

3. Start the development server:

```bash
npm run dev
```

4. Navigate to the application:

- Home: `http://localhost:5173/`
- Claim $SANG: `http://localhost:5173/claim-sang`

## Technology Stack

- **Frontend**: React + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Authentication**: Firebase Auth + Twitter OAuth
- **Web3**: Dynamic Labs SDK
- **Styling**: Emotion (CSS-in-JS)
- **Routing**: React Router

## Components

### `SignPointsLeaderboard`

- Displays the singing points leaderboard
- Supports filtering and pagination
- Shows user avatars and points
- Different styling for Pre-Genesis vs Genesis yappers

### `ClaimSangTokens`

- Main page for token claiming
- Analytics dashboard
- Twitter authentication
- Wallet connection for claiming

## Future Enhancements

- Real-time leaderboard updates
- Actual API integration for analytics
- Smart contract integration for token claiming
- Additional authentication methods
- Mobile-responsive optimizations
