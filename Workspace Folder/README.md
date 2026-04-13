# Dashboard Project

A full-stack task management dashboard with integrations for GitHub, Spotify, email, and calendar.

## Project Structure

```
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS stylesheets
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   └── package.json
│
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── server.js       # Server entry point
│   ├── .env.example
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB running locally or connection string
- Git (optional but recommended)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Add your API credentials to `.env`:
   - `GITHUB_TOKEN` - Get from https://github.com/settings/tokens
   - `SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET` - Get from https://developer.spotify.com
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Get from https://console.developers.google.com

5. Start the backend:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your GitHub username in `.env`:
   ```
   REACT_APP_GITHUB_USERNAME=your_github_username
   ```

5. Start the frontend:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## Features

- **Task Management**: Create, update, and track tasks with priorities and due dates
- **GitHub Integration**: View your repository stats and activity
- **Spotify Integration**: Display your top tracks and listening stats
- **Email & Calendar**: Show upcoming calendar events and email summary
- **Real-time Updates**: Auto-refresh dashboard data

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### GitHub
- `GET /api/github/stats/:username` - Get user stats
- `GET /api/github/repos/:username` - Get user repos

### Spotify
- `GET /api/spotify/currently-playing` - Get current track
- `GET /api/spotify/top-tracks` - Get top tracks

### Email & Calendar
- `GET /api/email/summary` - Get email summary
- `GET /api/email/calendar` - Get calendar events

## Technologies Used

### Frontend
- React 18
- React Router
- Zustand (state management)
- Chart.js (visualizations)

### Backend
- Express.js
- MongoDB
- Mongoose ODM
- JWT for authentication

### External APIs
- GitHub API
- Spotify Web API
- Google Calendar API
- Gmail API

## Development

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend && npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend && npm start
```

### Building for Production

Frontend:
```bash
cd frontend && npm run build
```

Backend uses Node.js directly in production.

## Environment Variables

See `.env.example` files in both backend and frontend directories for required variables.

## License

ISC
