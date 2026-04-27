import React, { useState, useEffect } from 'react';
import '../styles/SpotifyWidget.css';

function SpotifyWidget() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      // Check if we just received an auth callback
      const params = new URLSearchParams(window.location.search);
      
      if (params.has('error')) {
        setError(`Authorization error: ${params.get('error')}`);
        setLoading(false);
        return;
      }

      // Fetch the access token from backend
      await fetchAccessToken();
    };

    initialize();
  }, []);

  const fetchAccessToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/auth/token`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          setToken(data.access_token);
          setError(null);
        } else {
          setToken(null);
        }
      } else {
        setToken(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/spotify/auth/login`;
  };

  const handleLogout = () => {
    setToken(null);
    setError(null);
    // In a production app, you'd also call a logout endpoint to clear server-side tokens
  };

  return (
    <div className="widget spotify-widget">
      <h2>🎵 Spotify</h2>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading Spotify...</div>
      ) : !token ? (
        <div className="spotify-auth-prompt">
          <div className="empty-state">Connect your Spotify account to enable playback.</div>
          <button className="spotify-login-button" onClick={handleLogin}>
            Login with Spotify
          </button>
        </div>
      ) : (
        <div className="spotify-connected">
          <div className="empty-state">✓ Spotify Connected</div>
          <button className="spotify-logout-button" onClick={handleLogout}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default SpotifyWidget;
