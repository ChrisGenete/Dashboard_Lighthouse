const SpotifyWebApi = require('spotify-web-api-node');

const spotifyAPI = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

if (process.env.SPOTIFY_ACCESS_TOKEN) {
  spotifyAPI.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
}

if (process.env.SPOTIFY_REFRESH_TOKEN) {
  spotifyAPI.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);
}

const refreshAccessToken = async () => {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refreshToken) {
    return;
  }

  try {
    const data = await spotifyAPI.refreshAccessToken();
    spotifyAPI.setAccessToken(data.body.access_token);
    console.log('Spotify access token refreshed');
  } catch (error) {
    console.error('Failed to refresh Spotify access token:', error.message || error);
    throw error;
  }
};

module.exports = {
  spotifyAPI,
  refreshAccessToken
};
