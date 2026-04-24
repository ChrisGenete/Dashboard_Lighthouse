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

// Get GitHub contributions for a specific range
router.get('/contributions/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const range = req.query.range || 'week';
    const rangeDays = {
      week: 7,
      month: 30,
      year: 365
    };
    const days = rangeDays[range] || 7;

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    const query = `
      query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: to.toISOString()
        }
      },
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      return res.status(500).json({ message: response.data.errors[0].message, errors: response.data.errors });
    }

    const collection = response.data.data?.user?.contributionsCollection;
    if (!collection) {
      return res.status(404).json({ message: 'GitHub user not found or contributions unavailable.' });
    }

    res.json(collection);
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
