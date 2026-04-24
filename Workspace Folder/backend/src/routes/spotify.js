const express = require('express');
const router = express.Router();
const {
  spotifyClient,
  spotifyUserApi,
  userAuthState,
  setUserTokens,
  getAuthorizeUrl,
  ensureSpotifyToken,
  getClientCredentialsToken
} = require('../services/spotify');

const parsePlaylistId = (uri) => {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('spotify:playlist:')) {
    return uri.split(':').pop();
  }

  const match = uri.match(/playlist\/(?:embed\/)?([A-Za-z0-9]+)/);
  if (match) {
    return match[1];
  }

  return uri;
};

router.get('/auth/login', (req, res) => {
  const authorizeUrl = getAuthorizeUrl();
  res.redirect(authorizeUrl);
});

router.get('/auth/status', (req, res) => {
  res.json({
    authorized: !!userAuthState.accessToken,
    expiresAt: userAuthState.expiresAt
  });
});

router.get('/auth/token', (req, res) => {
  if (!userAuthState.accessToken) {
    return res.status(401).json({ message: 'Spotify user is not authorized.' });
  }

  res.json({
    access_token: userAuthState.accessToken,
    refresh_token: userAuthState.refreshToken,
    expires_at: userAuthState.expiresAt
  });
});

router.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Spotify authorization error: ${error}`);
  }

  try {
    const data = await spotifyUserApi.authorizationCodeGrant(code);
    setUserTokens({
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}?spotify=connected`);
  } catch (authError) {
    return res.status(500).send(`Spotify auth callback failed: ${authError.message}`);
  }
});

router.post('/token', async (req, res) => {
  try {
    const data = await getClientCredentialsToken();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/currently-playing', async (req, res) => {
  try {
    await ensureSpotifyToken('user');
    const data = await spotifyUserApi.getMyCurrentPlayingTrack();

    if (data.statusCode === 204 || !data.body || !data.body.item) {
      return res.json({ playing: false });
    }

    const body = data.body;
    const item = body.item;
    let playlist = null;

    if (body.context?.type === 'playlist') {
      const playlistId = parsePlaylistId(body.context.uri);
      if (playlistId) {
        const playlistData = await spotifyUserApi.getPlaylist(playlistId, {
          fields: 'id,name,description,images,tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls))'
        });
        playlist = playlistData.body;
      }
    }

    res.json({
      playing: body.is_playing,
      progress_ms: body.progress_ms,
      device: body.device,
      context: body.context,
      track: {
        id: item.id,
        name: item.name,
        artists: item.artists?.map((artist) => artist.name) || [],
        album: {
          name: item.album?.name,
          images: item.album?.images || []
        },
        duration_ms: item.duration_ms,
        external_urls: item.external_urls
      },
      playlist
    });
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.get('/playlist', async (req, res) => {
  try {
    const api = userAuthState.accessToken ? spotifyUserApi : spotifyClient;

    if (userAuthState.accessToken) {
      await ensureSpotifyToken('user');
    } else {
      await ensureSpotifyToken('app');
    }

    let playlistId = req.query.playlistId || process.env.SPOTIFY_PLAYLIST_ID;
    const contextUri = req.query.contextUri;
    if (!playlistId && contextUri) {
      playlistId = parsePlaylistId(contextUri);
    }

    if (!playlistId) {
      return res.status(400).json({ message: 'Spotify playlist ID is not configured.' });
    }

    const data = await api.getPlaylist(playlistId, {
      fields: 'id,name,description,images,tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls))'
    });

    res.json(data.body);
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.get('/top-tracks', async (req, res) => {
  try {
    await ensureSpotifyToken('user');
    const data = await spotifyUserApi.getMyTopTracks({ limit: 10 });
    res.json(data.body.items);
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
