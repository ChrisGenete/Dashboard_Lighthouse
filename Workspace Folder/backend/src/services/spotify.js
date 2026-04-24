const SpotifyWebApi = require('spotify-web-api-node');

const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

const spotifyUserApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

const userAuthState = {
  accessToken: process.env.SPOTIFY_ACCESS_TOKEN || null,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || null,
  expiresAt: null
};

if (userAuthState.accessToken) {
  spotifyUserApi.setAccessToken(userAuthState.accessToken);
}

if (userAuthState.refreshToken) {
  spotifyUserApi.setRefreshToken(userAuthState.refreshToken);
}

const setUserTokens = ({ access_token, refresh_token, expires_in }) => {
  if (access_token) {
    userAuthState.accessToken = access_token;
    spotifyUserApi.setAccessToken(access_token);
  }

  if (refresh_token) {
    userAuthState.refreshToken = refresh_token;
    spotifyUserApi.setRefreshToken(refresh_token);
  }

  if (expires_in) {
    userAuthState.expiresAt = Date.now() + expires_in * 1000;
  }
};

const getAuthorizeUrl = () => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];
  const state = 'spotify_auth_state';
  return spotifyUserApi.createAuthorizeURL(scopes, state);
};

const refreshUserAccessToken = async () => {
  if (!userAuthState.refreshToken) {
    throw new Error('Spotify refresh token not available for user auth.');
  }

  const data = await spotifyUserApi.refreshAccessToken();
  setUserTokens({
    access_token: data.body.access_token,
    expires_in: data.body.expires_in,
    refresh_token: userAuthState.refreshToken
  });
  console.log('Spotify user access token refreshed');
  return data.body;
};

const getClientCredentialsToken = async () => {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify client credentials not configured.');
  }

  const data = await spotifyClient.clientCredentialsGrant();
  spotifyClient.setAccessToken(data.body.access_token);
  console.log('Spotify client credentials token acquired');
  return data.body;
};

const ensureSpotifyToken = async (type = 'user') => {
  if (type === 'app') {
    if (!spotifyClient.getAccessToken()) {
      await getClientCredentialsToken();
    }
    return;
  }

  if (!userAuthState.accessToken) {
    throw new Error('Spotify user is not authorized.');
  }

  if (userAuthState.expiresAt && Date.now() > userAuthState.expiresAt - 60000) {
    await refreshUserAccessToken();
  }
};

module.exports = {
  spotifyClient,
  spotifyUserApi,
  userAuthState,
  setUserTokens,
  getAuthorizeUrl,
  refreshUserAccessToken,
  getClientCredentialsToken,
  ensureSpotifyToken
};
