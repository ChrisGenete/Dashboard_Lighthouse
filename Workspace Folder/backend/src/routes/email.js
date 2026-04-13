const express = require('express');
const router = express.Router();

// Get email summary
router.get('/summary', async (req, res) => {
  try {
    const gmail = req.app.locals.gmail;
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5
    });
    res.json(messages.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get calendar events
router.get('/calendar', async (req, res) => {
  try {
    const calendar = req.app.locals.calendar;
    const events = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });
    res.json(events.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
