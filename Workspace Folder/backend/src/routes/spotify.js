const express = require('express');
const router = express.Router();
const {
  spotifyClient,
  spotifyUserApi,
  userAuthState,
  setUserTokens,
  clearUserTokens,
  getAuthorizeUrl,
  ensureSpotifyToken,
  getClientCredentialsToken,
  createSpotifyApiWithAccessToken,
  refreshUserAccessToken
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

router.post('/auth/token', async (req, res) => {
  const code = req.body.code || req.query.code;
  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required.' });
  }

  try {
    const data = await spotifyUserApi.authorizationCodeGrant(code);
    setUserTokens({
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in
    });

    res.json({
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in,
      scope: data.body.scope
    });
  } catch (authError) {
    res.status(500).json({ message: authError.message });
  }
});

router.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}?error=${error}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}?error=no_code`);
  }

  try {
    const data = await spotifyUserApi.authorizationCodeGrant(code);
    setUserTokens({
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
    return res.redirect(`${frontendUrl}?spotify=connected`);
  } catch (authError) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
    return res.redirect(`${frontendUrl}?error=auth_failed&details=${encodeURIComponent(authError.message)}`);
  }
});

const getBearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

const getApiFromRequest = (req) => {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  return createSpotifyApiWithAccessToken(token);
};

const isInvalidTokenError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const spotifyMessage = String(error?.body?.error?.message || '').toLowerCase();
  const errorType = error?.body?.error;
  return (
    message.includes('invalid access token') ||
    message.includes('token has expired') ||
    message.includes('invalid token') ||
    message.includes('invalid_grant') ||
    spotifyMessage.includes('invalid access token') ||
    spotifyMessage.includes('token has expired') ||
    errorType === 'invalid_grant' ||
    error?.statusCode === 401
  );
};

const performUserApiRequest = async (fn) => {
  try {
    await ensureSpotifyToken('user');
    return await fn(spotifyUserApi);
  } catch (error) {
    if (isInvalidTokenError(error) && userAuthState.refreshToken) {
      try {
        await refreshUserAccessToken();
        return await fn(spotifyUserApi);
      } catch (refreshError) {
        // If refresh also fails, clear tokens
        if (isInvalidTokenError(refreshError)) {
          clearUserTokens();
          throw new Error('Spotify authentication expired. Please re-authenticate.');
        }
        throw refreshError;
      }
    }
    throw error;
  }
};

router.post('/token', async (req, res) => {
  try {
    const data = await getClientCredentialsToken(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/currently-playing', async (req, res) => {
  try {
    const requestApi = getApiFromRequest(req);
    let api = requestApi || spotifyUserApi;
    let data;

    if (requestApi) {
      data = await api.getMyCurrentPlayingTrack();
    } else {
      data = await performUserApiRequest((client) => client.getMyCurrentPlayingTrack());
    }

    if (data.statusCode === 204 || !data.body || !data.body.item) {
      return res.json({ playing: false });
    }

    const body = data.body;
    const item = body.item;
    let playlist = null;

    if (body.context?.type === 'playlist') {
      const playlistId = parsePlaylistId(body.context.uri);
      if (playlistId) {
        const playlistData = await api.getPlaylist(playlistId, {
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
    const requestApi = getApiFromRequest(req);
    let api = requestApi || (userAuthState.accessToken ? spotifyUserApi : spotifyClient);

    if (!requestApi) {
      if (userAuthState.accessToken) {
        await ensureSpotifyToken('user');
      } else {
        await ensureSpotifyToken('app');
      }
    }

    let playlistId = req.query.playlistId || process.env.SPOTIFY_PLAYLIST_ID;
    const contextUri = req.query.contextUri;
    if (!playlistId && contextUri) {
      playlistId = parsePlaylistId(contextUri);
    }

    if (!playlistId) {
      return res.status(400).json({ message: 'Spotify playlist ID is not configured.' });
    }

    const fetchPlaylist = async (client) =>
      client.getPlaylist(playlistId, {
        fields: 'id,name,description,images,tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls))'
      });

    const data = requestApi
      ? await fetchPlaylist(api)
      : userAuthState.accessToken
      ? await performUserApiRequest(fetchPlaylist)
      : await fetchPlaylist(api);

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
    const data = await performUserApiRequest((client) => client.getMyTopTracks({ limit: 10 }));
    res.json(data.body.items);
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
