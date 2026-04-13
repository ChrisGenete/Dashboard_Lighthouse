# Backend README

Task dashboard backend API server built with Express.js and MongoDB.

## Quick Start

```bash
npm install
npm run dev
```

Server starts on `http://localhost:5000`

## Environment Setup

1. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Configure credentials:
- MongoDB URI
- GitHub Token
- Spotify credentials
- Google OAuth credentials

## API Routes

All routes are prefixed with `/api/`

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### GitHub
- `GET /github/stats/:username` - User stats
- `GET /github/repos/:username` - User repositories

### Spotify
- `GET /spotify/currently-playing` - Now playing
- `GET /spotify/top-tracks` - Top 10 tracks

### Email
- `GET /email/summary` - Email summary
- `GET /email/calendar` - Calendar events

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **axios** - HTTP client
- **dotenv** - Environment config
- **cors** - Cross-origin support
- **googleapis** - Google APIs
- **spotify-web-api-node** - Spotify API

## Scripts

- `npm start` - Run production server
- `npm run dev` - Run with hot-reload (nodemon)
- `npm test` - Run tests
- `npm run lint` - Lint code
