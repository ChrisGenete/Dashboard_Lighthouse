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
      setTopTracks(data);
    } catch (error) {
      console.error('Failed to fetch Spotify data:', error);
    }
  };

  return (
    <div className="widget spotify-widget">
      <h2>🎵 Spotify</h2>
      <ul className="track-list">
        {topTracks.map((track, index) => (
          <li key={track.id} className="track-item">
            <span className="track-number">{index + 1}.</span>
            <span className="track-name">{track.name}</span>
            <span className="artist">{track.artists[0].name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpotifyWidget;
