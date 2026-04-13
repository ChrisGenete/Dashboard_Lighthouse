import React from 'react';
import TaskWidget from '../components/TaskWidget';
import GitHubWidget from '../components/GitHubWidget';
import SpotifyWidget from '../components/SpotifyWidget';
import EmailWidget from '../components/EmailWidget';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <main className="dashboard-container">
      <div className="widgets-grid">
        <TaskWidget />
        <GitHubWidget />
        <SpotifyWidget />
        <EmailWidget />
      </div>
    </main>
  );
}

export default Dashboard;
