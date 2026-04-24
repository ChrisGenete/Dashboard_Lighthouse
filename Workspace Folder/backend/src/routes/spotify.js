const express = require('express');
const router = express.Router();
const { spotifyAPI, refreshAccessToken } = require('../services/spotify');

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

const ensureSpotifyToken = async () => {
  if (process.env.SPOTIFY_REFRESH_TOKEN) {
    await refreshAccessToken();
  }
};

router.get('/currently-playing', async (req, res) => {
  try {
    await ensureSpotifyToken();
    const data = await spotifyAPI.getMyCurrentPlayingTrack();

    if (data.statusCode === 204 || !data.body || !data.body.item) {
      return res.json({ playing: false });
    }

    const body = data.body;
    const item = body.item;

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
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/playlist', async (req, res) => {
  try {
    await ensureSpotifyToken();

    let playlistId = req.query.playlistId || process.env.SPOTIFY_PLAYLIST_ID;
    const contextUri = req.query.contextUri;
    if (!playlistId && contextUri) {
      playlistId = parsePlaylistId(contextUri);
    }

    if (!playlistId) {
      return res.status(400).json({ message: 'Spotify playlist ID is not configured.' });
    }

    const data = await spotifyAPI.getPlaylist(playlistId, {
      fields: 'id,name,description,images,tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls))'
    });

    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/top-tracks', async (req, res) => {
  try {
    await ensureSpotifyToken();
    const data = await spotifyAPI.getMyTopTracks({ limit: 10 });
    res.json(data.body.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
