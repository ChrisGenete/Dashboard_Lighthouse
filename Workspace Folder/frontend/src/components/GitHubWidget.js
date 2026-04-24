import React, { useState, useEffect } from 'react';
import '../styles/GitHubWidget.css';

const githubRanges = [
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
  { key: 'year', label: 'Last Year' }
];

function GitHubWidget() {
  const [stats, setStats] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [range, setRange] = useState('week');
  const [loadingContributions, setLoadingContributions] = useState(true);

  useEffect(() => {
    fetchGitHubStats();
  }, []);

  useEffect(() => {
    fetchContributions(range);
  }, [range]);

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

  const fetchContributions = async (selectedRange) => {
    setLoadingContributions(true);
    try {
      const username = process.env.REACT_APP_GITHUB_USERNAME || 'github';
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/github/contributions/${username}?range=${selectedRange}`
      );
      const data = await response.json();
      setContributions(data);
    } catch (error) {
      console.error('Failed to fetch GitHub contributions:', error);
      setContributions(null);
    } finally {
      setLoadingContributions(false);
    }
  };

  const getContributionColor = (count) => {
    if (count === 0) return '#000000';
    if (count <= 2) return '#216e39';
    if (count <= 5) return '#34b155';
    if (count <= 10) return '#2de64c';
    return '#2de64c';
  };

  const contributionTotal = contributions
    ? contributions.totalCommitContributions +
      contributions.totalIssueContributions +
      contributions.totalPullRequestContributions +
      contributions.totalPullRequestReviewContributions
    : 0;

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

      <div className="contributions-panel">
        <div className="range-label">Contributions</div>
        <div className="range-controls">
          {githubRanges.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`range-button ${range === item.key ? 'active' : ''}`}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loadingContributions ? (
          <p className="loading-text">Loading contributions...</p>
        ) : contributions ? (
          <>
            <div className="contribution-graph-wrapper">
              <div className="graph-legend">
                <span>Less</span>
                <div className="legend-swatch dark" />
                <div className="legend-swatch light-green" />
                <div className="legend-swatch mid-green" />
                <div className="legend-swatch deep-green" />
                <span>More</span>
              </div>

              <div className="contribution-graph" role="img" aria-label="GitHub-style contribution graph">
                {contributions.contributionCalendar?.weeks?.map((week, weekIndex) => (
                  <div key={weekIndex} className="week-column">
                    {week.contributionDays.map((day) => (
                      <div
                        key={day.date}
                        className="contribution-day"
                        style={{ backgroundColor: day.color || getContributionColor(day.contributionCount) }}
                        title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="contribution-stats">
              <div className="stat">
                <span className="label">Repos contributed</span>
                <span className="value">{contributions.totalRepositoryContributions}</span>
              </div>
              <div className="stat">
                <span className="label">Total contributions</span>
                <span className="value">{contributionTotal}</span>
              </div>
              <div className="stat">
                <span className="label">Commits</span>
                <span className="value">{contributions.totalCommitContributions}</span>
              </div>
              <div className="stat">
                <span className="label">Pull requests</span>
                <span className="value">{contributions.totalPullRequestContributions}</span>
              </div>
              <div className="stat">
                <span className="label">Issues</span>
                <span className="value">{contributions.totalIssueContributions}</span>
              </div>
              <div className="stat">
                <span className="label">Reviews</span>
                <span className="value">{contributions.totalPullRequestReviewContributions}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="loading-text">Unable to load contribution data.</p>
        )}
      </div>
    </div>
  );
}

export default GitHubWidget;
