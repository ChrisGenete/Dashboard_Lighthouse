const express = require('express');
const router = express.Router();

// Get currently playing track
router.get('/currently-playing', async (req, res) => {
  try {
    const spotifyAPI = req.app.locals.spotifyAPI;
    const data = await spotifyAPI.getMe();
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's top tracks
router.get('/top-tracks', async (req, res) => {
  try {
    const spotifyAPI = req.app.locals.spotifyAPI;
    const data = await spotifyAPI.getMyTopTracks({ limit: 10 });
    res.json(data.body.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
