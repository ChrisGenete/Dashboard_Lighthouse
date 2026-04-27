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
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const getAuthorizeUrl = () => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];
  const state = generateRandomString(16);
  var auth_queryParameters = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state
  });
  return (`https://accounts.spotify.com/authorize?${auth_queryParameters.toString()}`);
};

const clearUserTokens = () => {
  userAuthState.accessToken = null;
  userAuthState.refreshToken = null;
  userAuthState.expiresAt = null;
  spotifyUserApi.setAccessToken(null);
  spotifyUserApi.setRefreshToken(null);
  console.log('Spotify user tokens cleared');
};

const refreshUserAccessToken = async () => {
  if (!userAuthState.refreshToken) {
    throw new Error('Spotify refresh token not available for user auth.');
  }

  try {
    const data = await spotifyUserApi.refreshAccessToken();
    setUserTokens({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in,
      refresh_token: userAuthState.refreshToken
    });
    console.log('Spotify user access token refreshed');
    return data.body;
  } catch (error) {
    // If refresh token is invalid, clear all tokens
    if (error.body?.error === 'invalid_grant' || String(error.message).includes('invalid_grant')) {
      clearUserTokens();
      throw new Error('Spotify refresh token is invalid. Please re-authenticate.');
    }
    throw error;
  }
};

const hasRefreshToken = () => !!userAuthState.refreshToken;

const getClientCredentialsToken = async ({ client_id, client_secret } = {}) => {
  const clientId = client_id || process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = client_secret || process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify client credentials not configured.');
  }

  const client = new SpotifyWebApi({
    clientId,
    clientSecret
  });

  const data = await client.clientCredentialsGrant();

  if (!client_id && !client_secret) {
    spotifyClient.setAccessToken(data.body.access_token);
  }

  console.log('Spotify client credentials token acquired');
  return data.body;
};

const createSpotifyApiWithAccessToken = (accessToken) => {
  const api = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });
  api.setAccessToken(accessToken);
  return api;
};

const ensureSpotifyToken = async (type = 'user') => {
  if (type === 'app') {
    if (!spotifyClient.getAccessToken()) {
      await getClientCredentialsToken();
    }
    return;
  }

  if (!userAuthState.accessToken) {
    if (hasRefreshToken()) {
      await refreshUserAccessToken();
      return;
    }
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
  clearUserTokens,
  getAuthorizeUrl,
  refreshUserAccessToken,
  getClientCredentialsToken,
  createSpotifyApiWithAccessToken,
  ensureSpotifyToken
};
