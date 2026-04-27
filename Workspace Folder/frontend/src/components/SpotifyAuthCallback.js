import React, { useEffect, useRef, useState } from 'react';

function SpotifyAuthCallback() {
  const [message, setMessage] = useState('Processing Spotify authorization...');
  const [error, setError] = useState(null);
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessedCallback.current) {
        return;
      }

      hasProcessedCallback.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        setMessage(null);
        return;
      }

      if (!code) {
        setError('No authorization code was returned from Spotify.');
        setMessage(null);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to exchange authorization code.');
        }

        setMessage('Spotify connected successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (err) {
        setError(err.message || 'Failed to connect Spotify.');
        setMessage(null);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="widget spotify-widget">
      <h2>🎵 Spotify Authorization</h2>
      {message && <div className="empty-state">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default SpotifyAuthCallback;
