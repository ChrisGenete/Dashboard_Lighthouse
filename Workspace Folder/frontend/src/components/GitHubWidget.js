import React, { useState, useEffect } from 'react';
import '../styles/GitHubWidget.css';

function GitHubWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchGitHubStats();
  }, []);

  const fetchGitHubStats = async () => {
    try {
      const username = process.env.REACT_APP_GITHUB_USERNAME || 'github';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/github/stats/${username}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch GitHub stats:', error);
    }
  };

  return (
    <div className="widget github-widget">
      <h2>🐙 GitHub Stats</h2>
      {stats && (
        <div className="stats-grid">
          <div className="stat">
            <span className="label">Repositories</span>
            <span className="value">{stats.public_repos}</span>
          </div>
          <div className="stat">
            <span className="label">Followers</span>
            <span className="value">{stats.followers}</span>
          </div>
          <div className="stat">
            <span className="label">Following</span>
            <span className="value">{stats.following}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitHubWidget;
