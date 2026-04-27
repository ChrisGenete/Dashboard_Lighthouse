const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/github', require('./routes/github'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/email', require('./routes/email'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;

if (HTTPS_KEY_PATH && HTTPS_CERT_PATH) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(HTTPS_KEY_PATH),
      cert: fs.readFileSync(HTTPS_CERT_PATH)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start HTTPS server:', error);
    process.exit(1);
  }
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
