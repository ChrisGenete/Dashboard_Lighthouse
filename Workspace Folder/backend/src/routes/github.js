const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get GitHub user stats
router.get('/stats/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get GitHub repos
router.get('/repos/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
