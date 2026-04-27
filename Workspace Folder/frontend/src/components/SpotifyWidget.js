import React, { useEffect, useState } from 'react';
import { FaPause, FaPlay, FaStepForward } from 'react-icons/fa';
import '../styles/SpotifyWidget.css';

const API_URL = process.env.REACT_APP_API_URL;
const NOW_PLAYING_REFRESH_MS = 30000;

function SpotifyWidget() {
  const [token, setToken] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackLoading, setTrackLoading] = useState(false);
  const [playerActionLoading, setPlayerActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.has('error')) {
        setError(`Authorization error: ${params.get('error')}`);
        setLoading(false);
        return;
      }

      await fetchAccessToken();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!token) {
      setNowPlaying(null);
      return undefined;
    }

    fetchCurrentlyPlaying();
    const intervalId = window.setInterval(fetchCurrentlyPlaying, NOW_PLAYING_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token]);

  const fetchAccessToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/spotify/auth/token`);

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

  const fetchCurrentlyPlaying = async () => {
    try {
      setTrackLoading(true);
      const response = await fetch(`${API_URL}/api/spotify/currently-playing`);

      if (response.status === 401) {
        setToken(null);
        setNowPlaying(null);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch currently playing track');
      }

      const data = await response.json();
      setNowPlaying(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch currently playing track');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/api/spotify/auth/login`;
  };

  const controlPlayback = async (action) => {
    try {
      setPlayerActionLoading(action);
      const response = await fetch(`${API_URL}/api/spotify/player/${action}`, {
        method: 'POST'
      });

      if (response.status === 401) {
        setToken(null);
        setNowPlaying(null);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Spotify playback action failed');
      }

      window.setTimeout(fetchCurrentlyPlaying, 400);
      setError(null);
    } catch (err) {
      setError(err.message || 'Spotify playback action failed');
    } finally {
      setPlayerActionLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/spotify/auth/logout`, {
        method: 'POST'
      });
    } catch (err) {
      setError(err.message || 'Failed to disconnect Spotify');
    }

    setToken(null);
    setNowPlaying(null);
    setError(null);
  };

  const renderNowPlaying = () => {
    if (trackLoading && !nowPlaying) {
      return <div className="empty-state">Loading current track...</div>;
    }

    if (!nowPlaying || !nowPlaying.track) {
      return (
        <div className="empty-state">
          Spotify is connected, but nothing is playing right now.
        </div>
      );
    }

    const { track, progress_ms } = nowPlaying;
    const artwork = track.album?.images?.[0]?.url;
    const isPlaying = nowPlaying.playing;
    const primaryAction = isPlaying ? 'pause' : 'play';
    const controlsDisabled = !!playerActionLoading || trackLoading;
    const progressPercent = track.duration_ms
      ? Math.min((progress_ms / track.duration_ms) * 100, 100)
      : 0;

    return (
      <div className="spotify-now-playing">
        <div className="now-playing-card">
          {artwork ? (
            <img className="track-artwork" src={artwork} alt={`${track.album?.name || track.name} artwork`} />
          ) : (
            <div className="track-artwork placeholder" aria-hidden="true">
              Audio
            </div>
          )}

          <div className="now-playing-details">
            <div className="now-playing-status">{isPlaying ? 'Now playing' : 'Paused'}</div>
            <a
              className="track-name"
              href={track.external_urls?.spotify}
              target="_blank"
              rel="noreferrer"
            >
              {track.name}
            </a>
            <div className="artist">{track.artists.join(', ')}</div>
            {track.album?.name && <div className="album-name">{track.album.name}</div>}
            <div className="track-progress" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="spotify-player-controls">
              <button
                className="spotify-control-button spotify-control-button-primary"
                type="button"
                onClick={() => controlPlayback(primaryAction)}
                disabled={controlsDisabled}
                aria-label={isPlaying ? 'Pause Spotify' : 'Play Spotify'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                className="spotify-control-button"
                type="button"
                onClick={() => controlPlayback('next')}
                disabled={controlsDisabled}
                aria-label="Skip to next Spotify track"
                title="Next track"
              >
                <FaStepForward />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="widget spotify-widget">
      <div className="spotify-widget-header">
        <h2>Spotify</h2>
        {token && (
          <button className="spotify-refresh-button" onClick={fetchCurrentlyPlaying} disabled={trackLoading}>
            Refresh
          </button>
        )}
      </div>

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
          {renderNowPlaying()}
          <button className="spotify-logout-button" onClick={handleLogout}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default SpotifyWidget;
