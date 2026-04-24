import React, { useState, useEffect } from 'react';
import '../styles/SpotifyWidget.css';

function SpotifyWidget() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSpotify = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchCurrentlyPlaying(), fetchPlaylist()]);
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load Spotify data.');
      } finally {
        setLoading(false);
      }
    };

    loadSpotify();
  }, []);

  const fetchCurrentlyPlaying = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/currently-playing`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load currently playing track.');
    }

    setCurrentlyPlaying(data.playing ? data : null);
  };

  const fetchPlaylist = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/playlist`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load Spotify playlist.');
    }

    const tracks = Array.isArray(data.tracks?.items)
      ? data.tracks.items.map((item) => item.track).filter(Boolean)
      : [];

    setPlaylist(data);
    setPlaylistTracks(tracks.slice(0, 10));
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
