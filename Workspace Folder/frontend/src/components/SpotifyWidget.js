import React, { useState, useEffect } from 'react';
import '../styles/SpotifyWidget.css';

function SpotifyWidget() {
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    fetchTopTracks();
  }, []);

  const fetchTopTracks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/top-tracks`);
      const data = await response.json();

      let tracks = [];
      if (Array.isArray(data)) {
        tracks = data;
      } else if (Array.isArray(data.items)) {
        tracks = data.items;
      } else if (Array.isArray(data.body?.items)) {
        tracks = data.body.items;
      } else {
        console.warn('Unexpected Spotify top-tracks response shape:', data);
      }

      setTopTracks(tracks);
    } catch (error) {
      console.error('Failed to fetch Spotify data:', error);
    }
  };

  return (
    <div className="widget spotify-widget">
      <h2>🎵 Spotify</h2>
      {topTracks.length > 0 ? (
        <ul className="track-list">
          {topTracks.map((track, index) => (
            <li key={track.id || index} className="track-item">
              <span className="track-number">{index + 1}.</span>
              <span className="track-name">{track.name}</span>
              <span className="artist">{track.artists?.[0]?.name || 'Unknown artist'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">No top tracks available yet.</div>
      )}
    </div>
  );
}

export default SpotifyWidget;
