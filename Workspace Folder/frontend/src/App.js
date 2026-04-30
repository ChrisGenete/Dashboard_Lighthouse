import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import SpotifyAuthCallback from './components/SpotifyAuthCallback';

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/auth/callback') {
    return <SpotifyAuthCallback />;
  }

  return (
    <div className="App">
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;
