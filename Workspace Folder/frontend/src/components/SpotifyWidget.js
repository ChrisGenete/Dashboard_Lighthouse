import React, { useState, useEffect } from 'react';
import '../styles/SpotifyWidget.css';

function SpotifyWidget() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [authorized, setAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      clearSpotifyQuery();
      await checkAuthStatus();
    };

    initialize();
  }, []);

  const clearSpotifyQuery = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('spotify')) {
      url.searchParams.delete('spotify');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/auth/status`);
      const data = await response.json();

      if (response.ok && data.authorized) {
        setAuthorized(true);
        await loadSpotifyData();
      } else {
        setAuthorized(false);
      }
    } catch (authError) {
      setError(authError.message || 'Unable to verify Spotify authorization.');
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSpotifyData = async () => {
    setError(null);
    const playlistFromPlayback = await fetchCurrentlyPlaying();

    if (!playlistFromPlayback) {
      await fetchPlaylist();
    }
  };

  const fetchCurrentlyPlaying = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/currently-playing`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load currently playing track.');
      }

      setCurrentlyPlaying(data.playing ? data : null);

      if (data.playlist?.tracks?.items) {
        setPlaylist(data.playlist);
        setPlaylistTracks(
          data.playlist.tracks.items
            .map((item) => item.track)
            .filter(Boolean)
            .slice(0, 10)
        );
        return true;
      }

      return false;
    } catch (fetchError) {
      if (fetchError.message.toLowerCase().includes('not authorized')) {
        setAuthorized(false);
        return false;
      }
      setError(fetchError.message);
      return false;
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/playlist`);
      const data = await response.json();

      if (!response.ok) {
        // If playlist is not configured, don't show as error - just skip playlist display
        if (response.status === 400 && data.message?.includes('not configured')) {
          return;
        }
        throw new Error(data.message || 'Could not load Spotify playlist.');
      }

      const tracks = Array.isArray(data.tracks?.items)
        ? data.tracks.items.map((item) => item.track).filter(Boolean)
        : [];

      setPlaylist(data);
      setPlaylistTracks(tracks.slice(0, 10));
    } catch (fetchError) {
      // Only show error for actual API errors, not configuration issues
      if (!fetchError.message?.includes('not configured')) {
        setError(fetchError.message);
      }
    }
  };

  const loginToSpotify = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/spotify/auth/login`;
  };

  const formatArtists = (artists) => {
    return artists?.join(', ') || 'Unknown artist';
  };

  return (
    <div className="widget spotify-widget">
      <h2>🎵 Spotify</h2>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading Spotify...</div>
      ) : !authorized ? (
        <div className="spotify-auth-prompt">
          <div className="empty-state">Connect your Spotify account to see current playback and playlist details.</div>
          <button className="spotify-login-button" onClick={loginToSpotify}>
            Connect Spotify
          </button>
        </div>
      ) : (
        <>
          <div className="spotify-now-playing">
            <h3>Now Playing</h3>
            {currentlyPlaying ? (
              <div className="now-playing-card">
                {currentlyPlaying.track.album.images?.[0]?.url ? (
                  <img
                    className="track-artwork"
                    src={currentlyPlaying.track.album.images[0].url}
                    alt={currentlyPlaying.track.name}
                  />
                ) : (
                  <div className="track-artwork placeholder" />
                )}
                <div className="now-playing-details">
                  <div className="track-name">{currentlyPlaying.track.name}</div>
                  <div className="artist">{formatArtists(currentlyPlaying.track.artists)}</div>
                  <div className="album-name">{currentlyPlaying.track.album.name}</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">No track currently playing.</div>
            )}
          </div>

          <div className="spotify-playlist">
            <h3>Playlist</h3>
            {playlistTracks.length > 0 ? (
              <>
                <div className="playlist-header">
                  <span>{playlist.name}</span>
                  {playlist.description && <small>{playlist.description}</small>}
                </div>
                <ul className="track-list">
                  {playlistTracks.map((track, index) => (
                    <li key={track.id || index} className="track-item">
                      <span className="track-number">{index + 1}.</span>
                      <div className="track-meta">
                        <div className="track-name">{track.name}</div>
                        <div className="artist">{formatArtists(track.artists?.map((artist) => artist.name))}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="empty-state">No playlist data available.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SpotifyWidget;
