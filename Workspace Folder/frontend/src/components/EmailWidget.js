import React, { useState, useEffect } from 'react';
import '../styles/EmailWidget.css';

function EmailWidget() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/calendar`);
      const data = await response.json();
      let events = [];
      if (Array.isArray(data)) {
        events = data;
      } else if (Array.isArray(data.items)) {
        events = data.items;
      } else if (Array.isArray(data.body?.items)) {
        events = data.body.items;
      } else {
        console.warn('Unexpected calendar events response shape:', data);
      }
      setEvents(events);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    }
  };

  return (
    <div className="widget email-widget">
      <h2>📧 Calendar</h2>
      {events.length > 0 ? (
        <ul className="event-list">
          {events.map((event, index) => (
            <li key={index} className="event-item">
              <span className="event-title">{event.summary}</span>
              <span className="event-time">{new Date(event.start.dateTime).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">No upcoming events.</div>
      )}
    </div>
  );
}

export default EmailWidget;
